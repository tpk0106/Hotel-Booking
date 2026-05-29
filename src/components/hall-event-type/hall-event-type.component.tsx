import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import type { IOperationResult } from "@microsoft/power-apps/data";
import { Bars } from "react-loading-icons";

import {
  PAGE_NUMBER,
  ROWS_PER_PAGE,
  type HallEventTypeFormData,
  type PaginationProps,
} from "../../model/interfaces";
import {
  useLoadAllHallEventTypesAndEventCategories,
  useLoadAllHallsAndBranches,
} from "../../lib/api";

import { Tk_halleventtypesService } from "../../generated";

import type { ColumnConfig } from "../../lib/base-table";
import HallEventTypeTable from "./hall-event-type-table.component";
import type { Tk_halleventtypes } from "../../generated/models/Tk_halleventtypesModel";
import type { Tk_eventcategories } from "../../generated/models/Tk_eventcategoriesModel";
import type { Tk_halls } from "../../generated/models/Tk_hallsModel";
import HallEventTypeForm from "./hall-event-type-form.component";
import {
  eventCategoryLookup,
  eventCategoryLookupForEventCategory,
  hallLookupHallName,
  hallLookupForHall,
} from "../../model/lookups";

const HallEventType = () => {
  const [hallEventTypes, setHallEventTypes] = useState<Tk_halleventtypes[]>([]);
  const [eventCategories, setEventCategories] = useState<Tk_eventcategories[]>(
    [],
  );
  const [halls, setHalls] = useState<Tk_halls[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<HallEventTypeFormData | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

  let toastId: any;

  const {
    hallEventTypesData,
    eventCategoriesData,
    totalCount,
    loading: loading,
  } = useLoadAllHallEventTypesAndEventCategories(page, rowsPerPage);

  const { hallsData } = useLoadAllHallsAndBranches(PAGE_NUMBER, ROWS_PER_PAGE);

  const paginationProps: PaginationProps = {
    page: page,
    rowsPerPage: rowsPerPage,
    count: totalCount,
    onPageChange: handlePageChange,
    onRowsPerPageChange: handleRowsPerPageChange,
  };

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

  useEffect(() => {
    const loadData = () => {
      setHallEventTypes(hallEventTypesData);
      setEventCategories(eventCategoriesData);
      setHalls(hallsData);
    };
    loadData();
  }, [hallEventTypesData, hallsData, eventCategoriesData]);

  const hallEventTypeColumns: ColumnConfig<Tk_halleventtypes>[] = [
    {
      header: "Hall Name",
      key: "_tk_hallname_value",
      render: (row) =>
        hallLookupHallName(halls)[row._tk_hallname_value || "none"],
    },
    {
      header: "Event Type",
      key: "_tk_eventcategorytype_value",
      render: (row) =>
        eventCategoryLookup(eventCategories)[
          row._tk_eventcategorytype_value || "none"
        ],
    },
    { header: "Capacity", key: "tk_eventtypecapacity" },

    { header: "Action", key: "actions" }, // Special key for buttons
  ];

  const handleEdit = (editFormData: Tk_halleventtypes) => {
    const retRow = editFormData;
    handleEditForm(retRow);
  };

  const handleDelete = (editFormData: Tk_halleventtypes) => {
    openDeleteConfirmModal(editFormData);
  };

  function handleNewForm() {
    setIsCreating(true);
    const newHallEventType: HallEventTypeFormData = {
      tk_eventtypecapacity: 0,
      _tk_hallname_value: "",
      eventCategories: eventCategories,
      tk_halleventtypeid: "",
      halls: halls,
      _tk_eventcategorytype_value: "",
    };
    setFormData(newHallEventType);
  }

  function handleEditForm(editFormData: Tk_halleventtypes) {
    setIsCreating(false);

    // Implement the logic to handle the edit form submission
    setEventCategories(eventCategories);
    const editingHallEventType: HallEventTypeFormData = {
      tk_eventtypecapacity: Number(editFormData.tk_eventtypecapacity),
      tk_halleventtypeid: editFormData.tk_halleventtypeid,
      _tk_eventcategorytype_value:
        editFormData._tk_eventcategorytype_value || "",
      _tk_hallname_value: editFormData._tk_hallname_value || "",
      halls: halls,
      eventCategories: eventCategories, // Pass the list of eventCategories to the form data
    };
    setFormData(editingHallEventType);
  }

  //DELETE action
  const openDeleteConfirmModal = (deleteFormData: Tk_halleventtypes) => {
    if (window.confirm("Are you sure you want to delete this Hotel Branch?")) {
      deleteHallEventType(deleteFormData.tk_halleventtypeid);
    }
  };

  const updateHallEventType = async (editedPayload: HallEventTypeFormData) => {
    const eventCategoryId = editedPayload._tk_eventcategorytype_value;
    const hallId = editedPayload._tk_hallname_value;

    // edit
    // 1. Prepare the payload with ONLY writable fields
    const payload: any = {
      tk_eventtypecapacity: editedPayload.tk_eventtypecapacity,
    };

    // 2. Add the evet category type and hall name binding
    if (eventCategoryId) {
      // IMPORTANT: Verify 'tk_EventCategoryType' is the exact Navigation Property name
      payload["tk_EventCategoryType@odata.bind"] =
        `/tk_eventcategories(${eventCategoryId})`;
    }

    if (hallId) {
      // IMPORTANT: Verify 'tk_HallName' is the exact Navigation Property name
      payload["tk_HallName@odata.bind"] = `/tk_halls(${hallId})`;
    }

    const result = await Tk_halleventtypesService.update(
      editedPayload.tk_halleventtypeid,
      payload,
    );

    if (result.error) {
      const err = JSON.parse(result.error.message);
      console.log("ERROR : ", err.error.message);
      console.log("ERROR : ", err.error.code);

      toast.update(toastId, {
        render: `Failed to save - Duplicate Event Category Type, Hall Name already exists`,
        type: "error",
        isLoading: false,
        autoClose: 6000,
      });
      return;
    }

    Tk_halleventtypesService.update(editedPayload.tk_halleventtypeid, payload)
      .then(() => {
        {
          // 4. Update the "Loading" toast to "Success"
          toast.update(toastId, {
            render: "Hall Event Type is saved successfully",
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });
        }

        // 3. Find the hall and event category object to update local UI state

        const latestHallEventTypes: Tk_halleventtypes[] = hallEventTypes.map(
          (het) =>
            het.tk_halleventtypeid === editedPayload.tk_halleventtypeid
              ? ({
                  ...het,
                  //...editedPayload, // Keep all form fields locally

                  tk_eventtypecapacity: editedPayload.tk_eventtypecapacity,
                  _tk_eventcategorytype_value:
                    editedPayload._tk_eventcategorytype_value,
                  _tk_hallname_value: editedPayload._tk_hallname_value,
                  tk_hallname: hallLookupForHall(halls)[hallId],
                  tk_eventcategorytype:
                    eventCategoryLookupForEventCategory(eventCategories)[
                      eventCategoryId
                    ],
                } as Tk_halleventtypes)
              : het,
        );

        setHallEventTypes(latestHallEventTypes);
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
  const createHallEventType = (newPayload: HallEventTypeFormData) => {
    const hallId = newPayload._tk_hallname_value;
    const eventCategoryId = newPayload._tk_eventcategorytype_value;

    // create
    // 1. Prepare the payload with ONLY writable fields
    const payload: any = {
      tk_eventtypecapacity: newPayload.tk_eventtypecapacity,
    };

    // 2. Add the evet category type and hall name binding
    if (eventCategoryId) {
      // IMPORTANT: Verify 'tk_EventCategoryType' is the exact Navigation Property name
      payload["tk_EventCategoryType@odata.bind"] =
        `/tk_eventcategories(${eventCategoryId})`;
    }

    if (hallId) {
      // IMPORTANT: Verify 'tk_HallName' is the exact Navigation Property name
      payload["tk_HallName@odata.bind"] = `/tk_halls(${hallId})`;
    }

    Tk_halleventtypesService.create(payload)
      .then((result: IOperationResult<Tk_halleventtypes>) => {
        // Extract the actual record from the result
        // In most Power Apps generated services, this is result.data
        const createdRecord = result.data;
        console.log("created Rec: ", createdRecord);

        if (!createdRecord) return;

        const newHallEventType: Tk_halleventtypes = {
          ...createdRecord, // This now has the real ID and metadata
          tk_eventtypecapacity: newPayload.tk_eventtypecapacity,
          _tk_eventcategorytype_value: newPayload._tk_eventcategorytype_value,
          _tk_hallname_value: newPayload._tk_hallname_value,
        };

        setHallEventTypes((prev) => [newHallEventType, ...prev]);
        setFormData(null);

        toast.update(toastId, {
          render: "Hall event Type saved successfully",
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

  // delete hallEventType

  const deleteHallEventType = (hallEventTypeId: string) => {
    console.clear();
    console.log("ID :", hallEventTypeId);
    Tk_halleventtypesService.delete(hallEventTypeId)
      .then(() => {
        // f you want to be even safer and ensure you are working with the most
        // recent version of the list (to avoid race conditions),
        // use the functional update pattern:
        console.log("Success :");
        {
          toast.update(toastId, {
            render: "Hall Event type is deleted successfully",
            type: "success",
            isLoading: false,
            autoClose: 7000,
          });
        }

        setHallEventTypes((prevHet) =>
          prevHet.filter((het) => het.tk_halleventtypeid !== hallEventTypeId),
        );

        setFormData(null);
      })
      .catch((err) => {
        console.error("Payload sent:", hallEventTypeId); // Log this to see exactly what failed
        console.error("Delete Error:", err);
        {
          toast.update(toastId, {
            render: "Failed to delete Hall Event Type",
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
        }
      })
      .finally(() => {
        // setIsSaving(false);
      });
  };

  function handleSave(savePayload: HallEventTypeFormData, isNew: boolean) {
    // 1. Show the "Saving" toast
    toastId = toast.loading("Saving... please wait");

    if (isNew) {
      createHallEventType(savePayload);
    } else {
      updateHallEventType(savePayload);
    }
  }

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        if (!mounted) return;
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [hallEventTypes]);

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

      {error && <div style={{ color: "crimson" }}>Error: {error}</div>}

      <section className="flex justify-around my-2">
        <Button
          type="button"
          variant="contained"
          color="secondary"
          onClick={() => handleNewForm()}
          className="w-[20%] text-center align-middle m-auto"
        >
          New Hall Event Type
        </Button>
      </section>

      <HallEventTypeTable
        hallEventTypes={hallEventTypes}
        eventCategories={eventCategories}
        columns={hallEventTypeColumns}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        paginationProps={paginationProps}
      />

      <section className="mt-5">
        {formData && (
          <>
            <HallEventTypeForm
              currentHallEventType={formData}
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

export default HallEventType;
