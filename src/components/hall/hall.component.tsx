import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
// import type { IOperationResult } from "@microsoft/power-apps/data";
import { Button } from "@mui/material";
import { Bars } from "react-loading-icons";

import type { Tk_hotelbranchs } from "../../generated/models/Tk_hotelbranchsModel";
import type { Tk_halls } from "../../generated/models/Tk_hallsModel";
import { Tk_hallsService } from "../../generated";

import type { HallFormData, PaginationProps } from "../../model/interfaces";
import type { ColumnConfig } from "../../lib/base-table";
import { useLoadAllHallsAndBranches } from "../../lib/api";
import HallTable from "./hall-table.component";
import HallForm from "./hall-form.component";
import { HallThumbnail } from "../../lib/hall-thumbnail.component";

const Hall = () => {
  const [branches, setBranches] = useState<Tk_hotelbranchs[]>([]);
  const [halls, setHalls] = useState<Tk_halls[]>([]);
  const [formData, setFormData] = useState<HallFormData | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [tableVersion, setTableVersion] = useState<number>(Date.now());

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

  let toastId: any;

  // 1. Create a lookup map for fast access
  const branchLookup = Object.fromEntries(
    branches.map((b) => [b.tk_hotelbranchid, b.tk_branchname]),
  );

  const hallLookup = Object.fromEntries(
    halls.map((h) => [h.tk_hallid, h.tk_hallname]),
  );

  const hallColumns: ColumnConfig<Tk_halls>[] = [
    {
      header: "Branch",
      key: "_tk_hotelbranch_value",
      render: (row) => branchLookup[row._tk_hotelbranch_value || "none"],
    },
    { header: "Hall Name", key: "tk_hallname" }, // Maps "Name" header to "tk_name" data key
    {
      header: "Hall Photo",
      key: "tk_hallimage",
      render: (row) => (
        <HallThumbnail
          hallId={row.tk_hallid}
          version={tableVersion.toString()} // Pass the global table version
        />
      ),
      // render: (row) => <img src={imageDataUrl(row.tk_hallimage)} width="100" />,
      // render: (row) => (
      //   <ImageCell recordId={row.tk_hallid} alt={row.tk_hallimage_url || ""} />
      // ),
    },

    { header: "Action", key: "actions" }, // Special key for buttons
  ];

  // 3. Update pagination event handlers
  function handlePageChange(
    e: React.MouseEvent<HTMLButtonElement> | null,
    page: number,
  ) {
    console.log("callback source : ", e?.target);
    setPage(page);
  }

  function handleRowsPerPageChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const rowsPerPage = parseInt(e.target.value);
    setRowsPerPage(rowsPerPage);
    setPage(0); // Reset tracking down to first page on size switch
  }

  const {
    branchesData,
    hallsData,
    totalCount,
    loading: loading,
  } = useLoadAllHallsAndBranches(page, rowsPerPage);

  useEffect(() => {
    const loadData = () => {
      setHalls(hallsData);
      setBranches(branchesData);
    };
    loadData();
  }, [hallsData, branchesData]);

  const paginationProps: PaginationProps = {
    page: page,
    rowsPerPage: rowsPerPage,
    count: totalCount,
    onPageChange: handlePageChange,
    onRowsPerPageChange: handleRowsPerPageChange,
  };

  const handleEdit = (editFormData: Tk_halls) => {
    const retRow = editFormData;
    handleEditForm(retRow);
  };

  function handleEditForm(editFormData: Tk_halls) {
    setIsCreating(false);

    // Implement the logic to handle the edit form submission
    setBranches(branches);
    const editingHall: HallFormData = {
      tk_hallid: editFormData.tk_hallid || "",
      tk_hallname: editFormData.tk_hallname,
      tk_hallimage: editFormData.tk_hallimage || "",
      _tk_hotelbranch_value: editFormData._tk_hotelbranch_value || "",
      tk_hotelbranch: editFormData.tk_hotelbranch || {},
      tk_hotelbranchname: editFormData.tk_hotelbranchname || "",

      branches: branches, // Pass the list of branches to the form data
    };

    setFormData(editingHall);
  }

  function handleNewForm() {
    setIsCreating(true);
    const newHall: HallFormData = {
      tk_hallid: "",
      tk_hallname: "",
      tk_hallimage: "",
      _tk_hotelbranch_value: "",
      tk_hotelbranch: {},
      tk_hotelbranchname: "",
      branches: branches,
    };
    setFormData(newHall);
  }

  function handleDelete(hall: Tk_halls) {
    openDeleteConfirmModal(hall);
  }

  //DELETE action
  const openDeleteConfirmModal = (hall: Tk_halls) => {
    if (window.confirm("Are you sure you want to delete this Hall?")) {
      deleteHall(hall.tk_hallid);
    }
  };

  function handleSave(savePayload: HallFormData, isNew: boolean): void {
    if (isNew) {
      createHall(savePayload);
    } else {
      updateHall(savePayload);
    }
  }

  const updateHall = async (editedPayload: HallFormData) => {
    toastId = toast.loading("Updating hall...,please wait");

    const hallId = editedPayload.tk_hallid;
    const branchId = editedPayload._tk_hotelbranch_value;

    // 1. Prepare standard text payload
    const payload: any = {
      tk_hallname: editedPayload.tk_hallname,
    };
    if (branchId) {
      payload["tk_HotelBranch@odata.bind"] = `/tk_hotelbranchs(${branchId})`;
    }

    try {
      // 2. Update the record text fields first

      await Tk_hallsService.update(hallId, payload);

      // THIS IS THE KEY:
      // 1. Update the version to force thumbnails to re-fetch
      setTableVersion(Date.now());

      // 3. Handle the Image Upload separately if it's a new File
      if (editedPayload.tk_hallimage instanceof File) {
        await Tk_hallsService.upload(
          hallId,
          "tk_hallimage",
          editedPayload.tk_hallimage, // The File object
          editedPayload.tk_hallimage.name, // The Display Name
        )
          .then(() => {
            toast.update(toastId, {
              render: "Image updated successfully",
              type: "success",
              isLoading: false,
              autoClose: 3000,
            });
          })
          .catch((err) => {
            toast.update(toastId, {
              render: "Error on image updating: ",
              type: "error",
              isLoading: false,
              autoClose: 3000,
            });
            console.error("Error : ", err);
          });
        // THIS IS THE KEY:
        // 1. Update the version to force thumbnails to re-fetch
        setTableVersion(Date.now());
      }
      // setTableVersion(Date.now());

      // 4. Update local UI state and close
      toast.update(toastId, {
        render: "Hall and Image updated successfully",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      // 2. Instead of complex manual mapping of File objects into halls state,
      // just update the text fields and let the Thumbnail component handle the image re-fetch
      setHalls((prev) =>
        prev.map((h) =>
          h.tk_hallid === hallId
            ? {
                ...h,
                tk_hallname: editedPayload.tk_hallname,
              }
            : h,
        ),
      );

      setFormData(null);
    } catch (err) {
      console.error("Upload Error:", err);
      toast.update(toastId, {
        render: "Update failed",
        type: "error",
        isLoading: false,
      });
    }
  };

  // create Hall
  const createHall = async (newPayload: HallFormData) => {
    toastId = toast.loading("Saving... please wait");
    const branchId = newPayload._tk_hotelbranch_value;

    // create
    // 1. Prepare the payload with ONLY writable fields
    const payload: any = {
      tk_hallname: newPayload.tk_hallname,
    };

    // 2. Add the manager binding
    if (branchId) {
      // IMPORTANT: Verify 'tk_HotelBranch' is the exact Navigation Property name
      payload["tk_HotelBranch@odata.bind"] = `/tk_hotelbranchs(${branchId})`;
    }
    // 3. Find the manager object to update local UI state
    const selectedBranch = branches.find(
      (m) => m.tk_hotelbranchid === branchId,
    );

    try {
      const result = await Tk_hallsService.create(payload);
      const createdHall = result.data;

      if (!createdHall) return;

      // // 2. Upload the image using the NEW ID from createdHall
      if (newPayload.tk_hallimage instanceof File) {
        await Tk_hallsService.upload(
          createdHall.tk_hallid,
          "tk_hallimage",
          newPayload.tk_hallimage,
          newPayload.tk_hallimage.name,
        )
          .then(() => {
            toast.update(toastId, {
              render: "Image created successfully",
              type: "success",
              isLoading: false,
              autoClose: 3000,
            });
          })
          .catch((err) => {
            toast.update(toastId, {
              render: "Error on image creating: ",
              type: "error",
              isLoading: false,
              autoClose: 3000,
            });
            console.error("Error : ", err);
          });
        // THIS IS THE KEY:
        // 1. Update the version to force thumbnails to re-fetch
        setTableVersion(Date.now());
      }

      const createdNewHall: Tk_halls = {
        ...createdHall,
        tk_hallname: newPayload.tk_hallname,
        tk_hotelbranch: selectedBranch,
      };

      // 2. Instead of complex manual mapping of File objects into halls state,
      // just update the text fields and let the Thumbnail component handle the image re-fetch
      setHalls((prev) => [createdNewHall, ...prev]);
      setFormData(null);
    } catch (error: unknown) {
      console.error("Upload Error:", error);
      toast.update(toastId, {
        render: "Create failed",
        type: "error",
        isLoading: false,
      });
    }
  };

  // delete hall

  const deleteHall = (hallId: string) => {
    Tk_hallsService.delete(hallId)
      .then(() => {
        // f you want to be even safer and ensure you are working with the most
        // recent version of the list (to avoid race conditions),
        // use the functional update pattern:

        setHalls((prevHalls) =>
          prevHalls.filter((hall) => hall.tk_hallid !== hallId),
        );

        toast.update(toastId, {
          render: `Hall, ${hallLookup[hallId]} deleted successfully`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });

        setFormData(null);
      })
      .catch((err) => {
        console.error("Payload sent:", hallId); // Log this to see exactly what failed
        console.error("Delete Error:", err);
        toast.update(toastId, {
          render: `Failed to delete`,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      })
      .finally(() => {
        // setIsSaving(false);
      });
  };
  //

  return (
    <section style={{ padding: 12 }}>
      {loading && (
        <div className="flex justify-around absolute z-50 ml-130 mt-30">
          {/* <Puff stroke="#98ff98" /> */}
          <Bars stroke="#000" />
          {/* <Puff stroke="#98ff98" strokeOpacity={1.0} speed={0.75} /> */}
        </div>
      )}

      {/* <ToastContainer stacked hideProgressBar position="top-right" /> */}
      <ToastContainer
        stacked
        hideProgressBar
        position="bottom-right"
        style={{ width: "20vw" }}
      />

      <section className="flex justify-around my-2">
        <Button
          type="button"
          variant="contained"
          color="secondary"
          onClick={() => handleNewForm()}
          className="w-[20%] text-center align-middle m-auto"
        >
          New Hall
        </Button>
      </section>

      <HallTable
        halls={halls}
        branches={branches}
        columns={hallColumns}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        paginationProps={paginationProps}
      />

      <section className="mt-5">
        {formData && (
          <>
            <HallForm
              currentHall={formData}
              handleCancel={() => setFormData(null)}
              handleSave={handleSave}
              isCreating={isCreating}
              isSaving={false}
              onSaveSuccess={() => setTableVersion(Date.now())}
              // Pass the version so the Thumbnail inside the form can use it
              tableVersion={tableVersion}
            />
          </>
        )}
      </section>
    </section>
  );
};

export default Hall;
