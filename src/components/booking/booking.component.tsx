import React, { useEffect, useState } from "react";
import { Button, IconButton, Tooltip } from "@mui/material";

import { Bars } from "react-loading-icons";

import {
  useLoadAllBookings,
  useLoadAllCustomers,
  useLoadAllEventCategories,
  useLoadAllHallsAndBranches,
} from "../../lib/api";

import type { ColumnConfig } from "../../lib/base-table";
import {
  PAGE_NUMBER,
  ROWS_PER_PAGE,
  STATUS_MAP,
  STATUS_MAP_REV,
} from "../../model/interfaces";
import { ToastContainer, toast } from "react-toastify";

import type { Tk_hotelbranchs } from "../../generated/models/Tk_hotelbranchsModel";
import { type Tk_bookings } from "../../generated/models/Tk_bookingsModel";
import type { Tk_customers } from "../../generated/models/Tk_customersModel";
import type { Tk_eventcategories } from "../../generated/models/Tk_eventcategoriesModel";
import type { Tk_halls } from "../../generated/models/Tk_hallsModel";
import BookingTable from "./booking-table.component";
import SearchBookingForm from "../search/search-booking-form";
// import SearchBar from "../../lib/search-bar.component";
// import { SearchOffRounded } from "@mui/icons-material";

import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import { Tk_bookingsService } from "../../generated";
import {
  branchNameLookup,
  customerNameLookup,
  eventCategoryNameLookup,
  hallLookupHallName,
} from "../../model/lookups";

const Booking = () => {
  const [branches, setBranches] = useState<Tk_hotelbranchs[]>([]);
  const [halls, setHalls] = useState<Tk_halls[]>([]);
  const [customers, setCustomers] = useState<Tk_customers[]>([]);
  const [eventCategories, setEventCategories] = useState<Tk_eventcategories[]>(
    [],
  );
  const [showForm, setShowForm] = useState<boolean>(false);
  const [version, setVersion] = useState<number>(Date.now());
  const [query, setQuery] = useState<queryParams | null>({ qry: "" });

  // 1. Add rowsPerPage state right beneath your existing page state
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

  // hooks
  // 1. Pass the version to ALL hooks that need to refresh on new bookings
  // 2. Pass page and rowsPerPage to your updated backend hook
  const {
    bookingsData,
    totalCount,
    loading: loading,
  } = useLoadAllBookings(version, query?.qry, page, rowsPerPage);
  const { branchesData, hallsData } = useLoadAllHallsAndBranches(
    PAGE_NUMBER,
    ROWS_PER_PAGE,
  );
  const { customersData } = useLoadAllCustomers(PAGE_NUMBER, ROWS_PER_PAGE);
  const { eventCategoriesData } = useLoadAllEventCategories();

  let toastId: any;

  const paginationProps: {
    count: number;
    page: number;
    rowsPerPage: number;
    onPageChange: (
      event: React.MouseEvent<HTMLButtonElement> | null,
      newPage: number,
    ) => void;
    onRowsPerPageChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => void;
  } = {
    page: page,
    rowsPerPage: rowsPerPage,
    count: totalCount,
    onPageChange: handlePageChange,
    onRowsPerPageChange: handleRowsPerPageChange,
  };

  useEffect(() => {
    const loadData = () => {
      // 2. Simplify the effect: Only update state when data actually changes
      if (hallsData) setHalls(hallsData);
      if (branchesData) setBranches(branchesData);
      if (customersData) setCustomers(customersData);
      if (eventCategoriesData) setEventCategories(eventCategoriesData);
    };
    loadData();
  }, [
    bookingsData,
    hallsData,
    branchesData,
    customersData,
    eventCategoriesData,
    version,
    query?.qry,
  ]);

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
  const columns: ColumnConfig<Tk_bookings>[] = [
    {
      header: "Hotel Branch",
      key: "_tk_hotelbranch_value",
      render: (row) =>
        branchNameLookup(branches)[row._tk_hotelbranch_value as string] ||
        "No Branch",
    },
    {
      header: "Hall Name",
      key: "_tk_hallname_value",
      render: (row) =>
        hallLookupHallName(halls)[row._tk_hallname_value as string] ||
        "Unknown Hall",
    },
    {
      header: "Category",
      key: "_tk_eventcategorytype_value",
      render: (row) =>
        eventCategoryNameLookup(eventCategories)[
          row._tk_eventcategorytype_value || "none"
        ],
    },
    {
      header: "Customer",
      key: "_tk_customername_value",
      render: (row) =>
        customerNameLookup(customers)[row._tk_customername_value || "None"],
    },
    { header: "Capacity", key: "tk_eventcapacity" },
    { header: "Booking Date", key: "tk_eventdate" },
    { header: "Booking Description", key: "tk_bookingname" },

    {
      header: "Status",
      key: "tk_bookingstatus", // Use the render function to transform the number into a label
      render: (row) => {
        const val = row.tk_bookingstatus as number;
        //  126790000: 'Inquiry',
        //   126790001: 'Pending',
        //   126790003: 'Confirmed',
        //   126790002: 'Waitlisted',
        //   126790004: 'Cancelled',
        //   126790006: 'Declined',
        //   126790005: 'No_show'
        return (
          <>
            <span
              style={{
                color:
                  row.tk_bookingstatus === STATUS_MAP_REV["Inquiry"]
                    ? "#0000ff"
                    : row.tk_bookingstatus === STATUS_MAP_REV["Pending"]
                      ? "#ff0000"
                      : row.tk_bookingstatus === STATUS_MAP_REV["Confirmed"]
                        ? "#008000"
                        : row.tk_bookingstatus === STATUS_MAP_REV["Waitlisted"]
                          ? "#A52A2A"
                          : row.tk_bookingstatus === STATUS_MAP_REV["Cancelled"]
                            ? "#ffa500"
                            : row.tk_bookingstatus ===
                                STATUS_MAP_REV["Declined"]
                              ? "#ffa500"
                              : row.tk_bookingstatus ===
                                  STATUS_MAP_REV["No_Show"]
                                ? "#000000"
                                : "##E6E6FA",
                fontWeight: "700",
              }}
            >
              {STATUS_MAP[val] || "No Status"}
            </span>
          </>
        );
      },
    },

    { header: "Action", key: "actions" }, // Special key for buttons
  ];

  interface queryParams {
    qry: string;
  }

  function handleShowCancel(): void {
    setShowForm(false);
  }

  function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const { name, value } = e.target;

    // Update the form data state with the new value
    setQuery((prevData: queryParams | null | undefined) => {
      if (!prevData) {
        console.warn("No current branch data to update");
        return null;
      }

      return {
        ...prevData,
        [name]: value,
      };
    });

    // Keep this to force immediate network synchronization re-evaluations
    // setVersion(Date.now());
  }

  function handleSearchClear(event: React.MouseEvent<HTMLButtonElement>): void {
    setQuery((d) => {
      return { ...d, ["qry"]: "" };
    });
    console.log(event);
  }

  function handleConfirmBooking(booking: Tk_bookings): void {
    confirmBooking(booking);
  }

  function handleCancelBooking(booking: Tk_bookings): void {
    cancelBooking(booking);
  }

  async function confirmBooking(bookingToConfirm: Tk_bookings) {
    toastId = toast.loading("Confirming booking...");
    const hallId = bookingToConfirm._tk_hallname_value;

    const payload: any = {
      tk_bookingstatus: STATUS_MAP_REV["Confirmed"],
    };

    try {
      const result = await Tk_bookingsService.getAll({
        filter: `_tk_hallname_value eq ${hallId} and tk_bookingstatus eq ${STATUS_MAP_REV["Confirmed"]} and tk_eventdate eq ${bookingToConfirm.tk_eventdate}`,
      });

      if (result.success && result.data && result.data.length > 0) {
        setVersion(Date.now()); // Triggers refresh to show current status
        toast.update(toastId, {
          render: `Sorry ${hallLookupHallName(halls)[bookingToConfirm._tk_hallname_value || ""]} is already Confirmed by ${customerNameLookup(customers)[bookingToConfirm._tk_customername_value || ""]}`,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        return;
      }

      // CRITICAL FIX: Await the update request completely
      const insertedBooking = await Tk_bookingsService.update(
        bookingToConfirm.tk_bookingid,
        payload,
      );

      // CRITICAL FIX: Force the custom API data hooks to refetch FRESH data now
      setVersion(Date.now());

      toast.update(toastId, {
        render: `Booking on ${hallLookupHallName(halls)[insertedBooking.data._tk_customername_value || ""]} by ${customerNameLookup(customers)[bookingToConfirm._tk_customername_value || ""]} Confirmation updated successfully`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (error) {
      console.error(error);
      toast.update(toastId, {
        render: `Error !! ${error}`,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  }

  async function cancelBooking(bookingToCancel: Tk_bookings) {
    toastId = toast.loading("Cancelling booking...");
    const payload: any = {
      tk_bookingstatus: STATUS_MAP_REV["Cancelled"],
    };

    try {
      // CRITICAL FIX: Await the update request completely
      await Tk_bookingsService.update(bookingToCancel.tk_bookingid, payload);

      // CRITICAL FIX: Force the custom API data hooks to refetch FRESH data now
      setVersion(Date.now());

      toast.update(toastId, {
        render: "Booking cancelled successfully",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (error) {
      console.error(error);
      toast.update(toastId, {
        render: `Error !! ${error}`,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  }

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
          onClick={() => {
            setShowForm(true);
          }}
          className="w-[40%] text-center align-middle m-auto"
        >
          Search Bookings Availability
        </Button>
        {/* <SearchBar setSearchQuery={setSearchQuery} /> */}

        <div className="border border-gray-400 w-[25%] flex justify-end bg-blue-400 rounded-sm">
          <Tooltip title={`type date to search`} placement="left" arrow>
            <IconButton
              type="button"
              aria-label="search"
              onClick={handleSearchClear}
              className="w-full"
            >
              <input
                type="text"
                id="search"
                name="qry"
                value={query?.qry}
                onChange={handleQueryChange}
                placeholder="yyyy-mm-dd"
                className=" border border-blue-900 ml1-5 w-full mr-3 h-5 bg-white rounded-sm text-sm"
              />
              <Tooltip title={`clear search `} placement="left" arrow>
                <SearchOffOutlinedIcon />
              </Tooltip>
            </IconButton>
          </Tooltip>
        </div>
      </section>

      {showForm && (
        <SearchBookingForm
          handleShowCancel={handleShowCancel}
          onSuccess={() => {
            setVersion(Date.now());
            handleShowCancel(); // calling form to auto close
          }}
          version={version}
        />
      )}

      <BookingTable
        bookings={bookingsData}
        columns={columns}
        handleConfirmBooking={handleConfirmBooking}
        handleCancelBooking={handleCancelBooking}
        paginationProps={paginationProps}
      />
    </section>
  );
};

export default Booking;
