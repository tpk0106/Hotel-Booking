import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import type { IOperationResult } from "@microsoft/power-apps/data";
import { Bars } from "react-loading-icons";

import type { Tk_hotelbranchs } from "../../generated/models/Tk_hotelbranchsModel";
import { Tk_hotelbranchsService } from "../../generated";
import type { Aadusers } from "../../generated/models/AadusersModel";

import type { BranchFormData, PaginationProps } from "../../model/interfaces";
import { useLoadAllBranchesAndAllManagers } from "../../lib/api";
import BranchTable from "./branch-table.component";
import BranchForm from "./branch-form.component";
import type { ColumnConfig } from "../../lib/base-table";
import { managerNameLookup } from "../../model/lookups";

const Branch = () => {
  const [branches, setBranches] = useState<Tk_hotelbranchs[]>([]);
  const [managers, setManagers] = useState<Aadusers[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<BranchFormData | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

  let toastId: any;

  // hooks

  const {
    branchesData,
    managersData,
    totalCount,
    loading: loading,
  } = useLoadAllBranchesAndAllManagers(page, rowsPerPage);

  const paginationProps: PaginationProps = {
    page: page,
    rowsPerPage: rowsPerPage,
    count: totalCount,
    onPageChange: handlePageChange,
    onRowsPerPageChange: handleRowsPerPageChange,
  };

  useEffect(() => {
    const loadData = () => {
      setBranches(branchesData);
      setManagers(managersData);
    };
    loadData();
  }, [branchesData]);

  // 3. Update pagination event handlers
  function handlePageChange(
    e: React.MouseEvent<HTMLButtonElement> | null,
    page: number,
  ) {
    setPage(page);
    console.log(e);
  }

  function handleRowsPerPageChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const rowsPerPage = parseInt(e.target.value);
    setRowsPerPage(rowsPerPage);
    setPage(0); // Reset tracking down to first page on size switch
  }
  //

  // 1. Create a lookup map for fast access
  // const managerLookup = Object.fromEntries(
  //   managers.map((manager) => [manager.aaduserid, manager.displayname]),
  // );

  const branchColumns: ColumnConfig<Tk_hotelbranchs>[] = [
    { header: "Name", key: "tk_branchname" }, // Maps "Name" header to "tk_name" data key
    { header: "Contact Number", key: "tk_branchcontactnumber" },
    { header: "Email", key: "tk_branchcontactemail" },
    { header: "Address", key: "tk_branchaddress" },

    {
      header: "Manager",
      key: "_tk_branchmanager_value",
      render: (row) =>
        managerNameLookup(managers)[row._tk_branchmanager_value || "none"],
    },
    { header: "Action", key: "actions" }, // Special key for buttons
  ];

  const handleEdit = (editFormData: Tk_hotelbranchs) => {
    const retRow = editFormData;
    console.log("edit started", editFormData);
    console.log("edit started", retRow);
    handleEditForm(retRow);
  };

  const handleDelete = (editFormData: Tk_hotelbranchs) => {
    openDeleteConfirmModal(editFormData);
  };

  function handleNewForm() {
    setIsCreating(true);
    const newBranch: BranchFormData = {
      tk_hotelbranchid: "",
      tk_branchname: "",
      tk_branchcontactnumber: "",
      tk_branchcontactemail: "",
      tk_branchaddress: "",
      _tk_branchmanager_value: "",
      tk_branchmanager: "",
      managers: managers, // Pass the list of managers to the form data
    };
    setFormData(newBranch);
  }

  function handleEditForm(editFormData: Tk_hotelbranchs) {
    setIsCreating(false);

    // Implement the logic to handle the edit form submission
    setManagers(managers);
    const editingBranch: BranchFormData = {
      tk_hotelbranchid: editFormData.tk_hotelbranchid,
      tk_branchname: editFormData.tk_branchname,
      tk_branchcontactnumber: editFormData.tk_branchcontactnumber || "",
      tk_branchcontactemail: editFormData.tk_branchcontactemail || "",
      tk_branchaddress: editFormData.tk_branchaddress || "",
      _tk_branchmanager_value: editFormData._tk_branchmanager_value || "",
      tk_branchmanager: editFormData.tk_branchmanager || "",
      managers: managers, // Pass the list of managers to the form data
    };
    setFormData(editingBranch);
  }

  //DELETE action
  const openDeleteConfirmModal = (deleteFormData: Tk_hotelbranchs) => {
    if (window.confirm("Are you sure you want to delete this Hotel Branch?")) {
      deleteBranch(deleteFormData.tk_hotelbranchid);
    }
  };

  const updateBranch = (editedPayload: BranchFormData) => {
    const managerId = editedPayload._tk_branchmanager_value;

    // edit
    // 1. Prepare the payload with ONLY writable fields
    const payload: any = {
      tk_branchname: editedPayload.tk_branchname,
      tk_branchcontactnumber: editedPayload.tk_branchcontactnumber,
      tk_branchcontactemail: editedPayload.tk_branchcontactemail,
      tk_branchaddress: editedPayload.tk_branchaddress,
    };

    // 2. Add the manager binding
    if (managerId) {
      // IMPORTANT: Verify 'tk_BranchManager' is the exact Navigation Property name
      payload["tk_BranchManager@odata.bind"] = `/aadusers(${managerId})`;
    }

    Tk_hotelbranchsService.update(editedPayload.tk_hotelbranchid, payload)
      .then(() => {
        {
          toast.update(toastId, {
            render: "Branch is saved successfully",
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });
        }

        // 3. Find the manager object to update local UI state
        const selectedManager = managers.find((m) => m.aaduserid === managerId);

        const latestBranches: Tk_hotelbranchs[] = branches.map((branch) =>
          branch.tk_hotelbranchid === editedPayload.tk_hotelbranchid
            ? ({
                ...branch,
                //...editedPayload, // Keep all form fields locally
                tk_branchname: editedPayload.tk_branchname,
                tk_branchcontactnumber: editedPayload.tk_branchcontactnumber,
                tk_branchcontactemail: editedPayload.tk_branchcontactemail,
                tk_branchaddress: editedPayload.tk_branchaddress,
                _tk_branchmanager_value: managerId,
                tk_branchmanagername: selectedManager?.displayname, // Update the display name for the list
                // If tk_branchmanager is an object in your model, don't pass a string to it
                tk_branchmanager: selectedManager || undefined,
              } as Tk_hotelbranchs)
            : branch,
        );

        setBranches(latestBranches);
        setFormData(null);
      })
      .catch((err) => {
        console.error("Payload sent:", payload); // Log this to see exactly what failed
        console.error("Update Error:", err);

        toast.update(toastId, {
          render: "Failed to save",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      })
      .finally(() => {});
  };

  // create Branch
  const createBranch = (newPayload: BranchFormData) => {
    const managerId = newPayload._tk_branchmanager_value;

    // create
    // 1. Prepare the payload with ONLY writable fields
    const payload: any = {
      tk_branchname: newPayload.tk_branchname,
      tk_branchcontactnumber: newPayload.tk_branchcontactnumber,
      tk_branchcontactemail: newPayload.tk_branchcontactemail,
      tk_branchaddress: newPayload.tk_branchaddress,
    };

    // 2. Add the manager binding
    if (managerId) {
      payload["tk_BranchManager@odata.bind"] = `/aadusers(${managerId})`;
    }

    Tk_hotelbranchsService.create(payload)
      .then((result: IOperationResult<Tk_hotelbranchs>) => {
        // Extract the actual record from the result
        // In most Power Apps generated services, this is result.data
        const createdRecord = result.data;

        if (!createdRecord) return;

        const selectedManager = managers.find((m) => m.aaduserid === managerId);

        const newBranch: Tk_hotelbranchs = {
          ...createdRecord, // This now has the real ID and metadata
          tk_branchname: newPayload.tk_branchname,
          tk_branchcontactnumber: newPayload.tk_branchcontactnumber,
          tk_branchcontactemail: newPayload.tk_branchcontactemail,
          tk_branchaddress: newPayload.tk_branchaddress,
          _tk_branchmanager_value: managerId,
          tk_branchmanagername: selectedManager?.displayname,
          tk_branchmanager: selectedManager || undefined,
        };

        // Update the state correctly
        // 2. Add it to the list: [new item, ...all old items]
        setBranches((prev) => [newBranch, ...prev]);

        setFormData(null);

        toast.update(toastId, {
          render: "Branch saved successfully",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      })
      .catch((err) => {
        console.error("Payload sent:", payload); // Log this to see exactly what failed
        console.error("Create Error:", err);

        toast.update(toastId, {
          render: "Failed to save",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      })
      .finally(() => {});
  };

  //

  // delete branch

  const deleteBranch = (hotelBranchId: string) => {
    Tk_hotelbranchsService.delete(hotelBranchId)
      .then(() => {
        // f you want to be even safer and ensure you are working with the most
        // recent version of the list (to avoid race conditions),
        // use the functional update pattern:

        {
          toast.update(toastId, {
            render: "Branch is deleted successfully",
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
        }

        setBranches((prevBranches) =>
          prevBranches.filter(
            (branch) => branch.tk_hotelbranchid !== hotelBranchId,
          ),
        );

        setFormData(null);
      })
      .catch((err) => {
        console.error("Payload sent:", hotelBranchId); // Log this to see exactly what failed
        console.error("Delete Error:", err);
        {
          toast.update(toastId, {
            render: "Failed to delete",
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
        }
        alert("Failed to delete branch.");
      })
      .finally(() => {
        // setIsSaving(false);
      });
  };

  function handleSave(savePayload: BranchFormData, isNew: boolean) {
    // 1. Show the "Saving" toast
    toastId = toast.loading("Saving... please wait");
    if (isNew) {
      createBranch(savePayload);
    } else {
      updateBranch(savePayload);
    }
  }

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        if (!mounted) return;

        setBranches(branches);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        // console.log("loading ..........end");
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [branches]);

  return (
    <section style={{ padding: 12 }}>
      {
        loading && (
          <div className="flex justify-around absolute z-50 ml-130 mt-30">
            {/* <Puff stroke="#98ff98" /> */}
            <Bars stroke="#000" />
            {/* <Puff stroke="#98ff98" strokeOpacity={1.0} speed={0.75} /> */}
          </div>
        )
        // <div className="w-[80%] mx-auto mb-2 bg-blue-300 text-black border1-2 rounded-md text-center">
        //   Loading......
        // </div>
      }

      {/* <ToastContainer stacked hideProgressBar position="top-right" /> */}
      <ToastContainer
        stacked
        hideProgressBar
        position="bottom-right"
        style={{ width: "20vw" }}
      />

      {error && <div style={{ color: "crimson" }}>Error: {error}</div>}

      <section className="flex justify-around my-2">
        <Button
          type="button"
          variant="contained"
          color="secondary"
          onClick={() => handleNewForm()}
          className="w-[20%] text-center align-middle m-auto"
        >
          New Branch
        </Button>
      </section>

      <BranchTable
        branches={branches}
        managers={managers}
        columns={branchColumns}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        paginationProps={paginationProps}
      />

      <section className="mt-5">
        {formData && (
          <>
            <BranchForm
              currentBranch={formData}
              handleCancel={() => setFormData(null)}
              handleSave={handleSave}
              isCreating={isCreating}
              isSaving={false}
            />
          </>
        )}
      </section>
    </section>
  );
};

export default Branch;
