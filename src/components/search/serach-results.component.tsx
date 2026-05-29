import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import type { ColumnConfig } from "../../lib/base-table";
import {
  PAGE_NUMBER,
  ROWS_PER_PAGE,
  STATUS_MAP,
  STATUS_MAP_REV,
  type BookingNowFormData,
  type HallsAvailableQueryResults,
} from "../../model/interfaces";
import type { IOperationResult } from "@microsoft/power-apps/data";

import type { Tk_customers } from "../../generated/models/Tk_customersModel";
import { Tk_bookingsService } from "../../generated";
import { type Tk_bookings } from "../../generated/models/Tk_bookingsModel";

import {
  useLoadAllBookings,
  useLoadAllCustomers,
  useLoadAllEventCategories,
  useLoadAllHallsAndBranches,
} from "../../lib/api";

import SearchResultsTable from "./search-results-table.component";
import BookingForm from "../booking/booking-form.component";
import { customerNameLookup } from "../../model/lookups";

type SearchResultsProps = {
  results: HallsAvailableQueryResults[];
  onSuccess: () => void;
  version: number;
};

const SearchResults = ({ results, onSuccess, version }: SearchResultsProps) => {
  const [searchResults, setSearchResults] = useState<
    HallsAvailableQueryResults[]
  >([]);

  const { eventCategoriesData } = useLoadAllEventCategories();
  const { hallsData, branchesData } = useLoadAllHallsAndBranches(
    PAGE_NUMBER,
    ROWS_PER_PAGE,
  );
  const [formData, setFormData] = useState<HallsAvailableQueryResults | null>(
    null,
  );
  const [customers, setCustomers] = useState<Tk_customers[]>([]);

  const isCreating = false;

  const { customersData } = useLoadAllCustomers(PAGE_NUMBER, ROWS_PER_PAGE);
  const { bookingsData } = useLoadAllBookings(version);

  let toastId: any;

  useEffect(() => {
    setSearchResults(results);
    setCustomers(customersData);
    // setBookings(bookingsData);
  }, [results, eventCategoriesData, hallsData, bookingsData, branchesData]);

  const columns: ColumnConfig<HallsAvailableQueryResults>[] = [
    { header: "Hall Name", key: "hallName" },
    { header: "Max Capacity", key: "capacity" },
    { header: "Booking Capacity", key: "bookingCapacity" },
    { header: "Category", key: "category" },

    {
      header: "Availability",
      key: "availabilityStatus",
      render: (row) => (
        <span style={{ color: row.statusColor, fontWeight: "bold" }}>
          {row.availabilityStatus}
        </span>
      ),
    },
    { header: "Action", key: "actions" }, // Special key for buttons
  ];

  function handlePendingBooking(booking: HallsAvailableQueryResults): void {
    console.log("Pending booking clicked for:", booking);
    booking.bookingName = "";
    booking.bookingStatus = STATUS_MAP_REV["Pending"];
    setFormData(booking);
  }

  function handleConfirmBooking(booking: HallsAvailableQueryResults): void {
    booking.bookingName = "";
    booking.bookingStatus = STATUS_MAP_REV["Confirmed"];
    setFormData(booking);
  }

  function handleSave(savePayload: BookingNowFormData): void {
    toastId = toast.loading("Saving... please wait");
    createBooking(savePayload);
  }

  // create Booking
  const createBooking = async (newPayload: BookingNowFormData) => {
    const branchId = newPayload.branchId;
    const hallId = newPayload.hallId;
    const eventCategoryId = newPayload.categoryId;
    const customerId = newPayload._tk_customername_value;

    // create
    // 1. Prepare the payload with ONLY writable fields
    const payload: any = {
      tk_eventcapacity: newPayload.bookingCapacity,
      tk_eventdate: newPayload.eventDate,
      tk_bookingname: newPayload.bookingName,
      tk_bookingstatus: newPayload.bookingStatus,
    };

    // 1. Add the branch binding
    if (branchId) {
      // IMPORTANT: Verify 'tk_HotelBranch' is the exact Navigation Property name
      payload["tk_HotelBranch@odata.bind"] = `/tk_hotelbranchs(${branchId})`;
    }

    // 2. Add the hall binding
    if (hallId) {
      payload["tk_HallName@odata.bind"] = `/tk_halls(${hallId})`;
    }

    // 3. Add the hall binding
    if (eventCategoryId) {
      payload["tk_EventCategoryType@odata.bind"] =
        `/tk_eventcategories(${eventCategoryId})`;
    }

    // 4. Add the customer binding
    if (customerId) {
      payload["tk_CustomerName@odata.bind"] = `/tk_customers(${customerId})`;
    }

    Tk_bookingsService.create(payload)
      .then((result: IOperationResult<Tk_bookings>) => {
        const createdBooking = result.data;

        const createdHallAvailableQueryResult: HallsAvailableQueryResults = {
          bookingId: createdBooking.tk_bookingid,
          bookingName: newPayload.bookingName,
          availabilityStatus: "Pending",
          capacity: newPayload.capacity,
          bookingCapacity: newPayload.bookingCapacity,
          eventDate: newPayload.eventDate,
          branch: newPayload.branch,
          branchId: newPayload.branchId,
          hallId: newPayload.hallId,
          hallName: newPayload.hallName,
          category: newPayload.category,
          categoryId: newPayload.categoryId,
          statusColor: newPayload.statusColor,
          bookingStatus: newPayload.bookingStatus,
          _tk_customername_value: newPayload._tk_customername_value,
          totalPendingCountForHall: 0, // This will require additional logic to calculate based on existing bookings for the hall and date
        };

        // update booking table (filtered results table from bookings)
        setSearchResults((prev) => [createdHallAvailableQueryResult, ...prev]);
        setFormData(null);

        {
          // 4. Update the "Loading" toast to "Success"
          toast.update(toastId, {
            render: `${STATUS_MAP[newPayload.bookingStatus]} booking for ${customerNameLookup(customers)[createdBooking._tk_customername_value as string]} on ${newPayload.hallName} is saved successfully`,
            // render: `<span className={${STATUS_MAP[newPayload.bookingStatus] === "Pending" ? 'color:"#ffa500"' : 'color:"#008000"'}>${STATUS_MAP[newPayload.bookingStatus]} </span> booking for ${customerNameLookup(customers)[createdBooking._tk_customername_value as string]} on ${newPayload.hallName} is saved successfully`,
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });
        }
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

  return (
    <div className="w-full flex justify-center">
      <SearchResultsTable
        bookings={searchResults}
        handlePendingBooking={handlePendingBooking}
        handleConfirmBooking={handleConfirmBooking}
        columns={columns}
        onSuccess={onSuccess}
      />
      <section className="mt-5">
        {formData && (
          <>
            <BookingForm
              selectedBooking={formData}
              handleCancel={() => setFormData(null)}
              handleSave={handleSave}
              isCreating={isCreating}
              isSaving={false}
              customers={customers}
              onSuccess={onSuccess}
              version={version}
            />
          </>
        )}
      </section>
    </div>
  );
};

export default SearchResults;
