import { toast } from "react-toastify";
// import type {
//   BookingNowFormData,
//   HallsAvailableQueryResults,
// } from "../model/interfaces";
// import { Tk_bookingsService } from "../generated";
// import type { IOperationResult } from "@microsoft/power-apps/data";
// import type { Tk_bookings } from "../generated/models/Tk_bookingsModel";
// import type { SetStateAction } from "react";

// const imageDataUrl = (data: unknown): string => {
//   const url: string = "data:image/jpeg;base64," + data;
//   return url;
// };

// let toastId: any;
// utils.ts
const imageDataUrl = (data: any): string => {
  if (!data) return "";

  // If it already has a header (starts with "data:"), return as is
  if (typeof data === "string" && data.startsWith("data:image")) {
    return data;
  }

  // Otherwise, prepend the header.
  // TIP: "image/png" is generally the most 'forgiving' header for base64 strings
  return `data:image/png;base64,${data}`;
};
export const fileDataUrl = (file: any, recordId?: string) => {
  if (!file) return "";

  // 1. If it's a local File object or a temporary preview URL
  if (file instanceof File) return URL.createObjectURL(file);
  if (typeof file === "string" && file.startsWith("blob:")) return file;

  // 2. If we have a recordId, we construct the proxy URL
  // This path MUST match what the proxy in vite.config.ts is listening for
  if (recordId) {
    return `/api/data/v9.2/tk_halls(${recordId})/tk_hallimage/$value`;
  }

  return "";
};

export const fileDataUrl1 = (file: any) => {
  if (!file) return "";
  if (typeof file === "string") return file; // Existing URL/Base64
  if (file instanceof File) return URL.createObjectURL(file); // New upload preview
  return "";
};

const showToastMessage = (message: string, type?: string) => {
  switch (type) {
    case "W":
      toast.warn(message, {
        position: "top-right",
        closeOnClick: true,
      });
      break;
    case "E":
      toast.error(message, {
        position: "top-right",
        closeOnClick: true,
      });
      break;
    default:
      toast.success(message, {
        position: "top-right",
        closeOnClick: true,
      });
  }
};

// type CreateBookingProps = {
//   newPayload: BookingNowFormData;
//   setSearchResults: SetStateAction<HallsAvailableQueryResults[]>;
//   setFormData: SetStateAction<HallsAvailableQueryResults | null>;
// };

// const createBooking = (
//   newPayload: BookingNowFormData,
//   setSearchResults: SetStateAction<HallsAvailableQueryResults[]>,
//   setFormData: SetStateAction<HallsAvailableQueryResults | null>,
// ) => {
//   const branchId = newPayload.branchId;
//   const hallId = newPayload.hallId;
//   const eventCategoryId = newPayload.categoryId;
//   const customerId = newPayload._tk_customername_value;

//   // create
//   // 1. Prepare the payload with ONLY writable fields
//   const payload: any = {
//     tk_eventcapacity: newPayload.capacity,
//     tk_eventdate: newPayload.eventDate,
//     tk_bookingname: newPayload.bookingName,
//     // tk_bookingstatus: STATUS_MAP_REV[PENDING],
//     tk_bookingstatus: PENDING, //pending
//   };

//   // 1. Add the branch binding
//   if (branchId) {
//     // IMPORTANT: Verify 'tk_HotelBranch' is the exact Navigation Property name
//     payload["tk_HotelBranch@odata.bind"] = `/tk_hotelbranchs(${branchId})`;
//   }

//   // 2. Add the hall binding
//   if (hallId) {
//     payload["tk_HallName@odata.bind"] = `/tk_halls(${hallId})`;
//   }

//   // 3. Add the hall binding
//   if (eventCategoryId) {
//     payload["tk_EventCategoryType@odata.bind"] =
//       `/tk_eventcategories(${eventCategoryId})`;
//   }

//   // 4. Add the customer binding
//   if (customerId) {
//     payload["tk_CustomerName@odata.bind"] = `/tk_customers(${customerId})`;
//   }

//   Tk_bookingsService.create(payload)
//     .then((result: IOperationResult<Tk_bookings>) => {
//       const createdBooking = result.data;

//       const createdHallAvailableQueryResult: HallsAvailableQueryResults = {
//         bookingId: createdBooking.tk_bookingid,
//         bookingName: newPayload.bookingName,
//         availabilityStatus: "Pending",
//         capacity: newPayload.capacity,
//         eventDate: newPayload.eventDate,
//         branch: newPayload.branch,
//         branchId: newPayload.branchId,
//         hallId: newPayload.hallId,
//         hallName: newPayload.hallName,
//         category: newPayload.category,
//         categoryId: newPayload.categoryId,
//         statusColor: newPayload.statusColor,
//         _tk_customername_value: newPayload._tk_customername_value,
//       };

//       // update booking table (filtered results table from bookings)
//       //  setSearchResults((prev) => [createdHallAvailableQueryResult, ...prev]);
//       // setFormData(null);

//       {
//         // 4. Update the "Loading" toast to "Success"
//         toast.update(toastId, {
//           render: `Booking for ${newPayload.customer} on ${newPayload.hallName} is saved successfully`,
//           type: "success",
//           isLoading: false,
//           autoClose: 3000,
//         });
//       }
//     })
//     .catch((err) => {
//       console.error("Payload sent:", payload); // Log this to see exactly what failed
//       console.error("Create Error:", err);
//       toast.update(toastId, {
//         render: "Failed to save",
//         type: "error",
//         isLoading: false,
//         autoClose: 3000,
//       });
//     })
//     .finally(() => {
//       // onSuccess();
//       // setIsSaving(false);
//     });
// };

export { imageDataUrl, showToastMessage };
