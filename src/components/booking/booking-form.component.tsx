import React, { useState } from "react";
import { format } from "date-fns";

import {
  Button,
  ThemeProvider,
  Tooltip,
  Typography,
  type SelectChangeEvent,
} from "@mui/material";
import {
  STATUS_MAP,
  type BookingNowFormData,
  type HallsAvailableQueryResults,
} from "../../model/interfaces";

import SelectList from "../../lib/select-list.component";
import type { Tk_customers } from "../../generated/models/Tk_customersModel";
import { asideMenuTitleTypographyTheme } from "../../lib/themes";

import z from "zod";
import { addDays } from "../../lib/utils";

type BookingNowFormProps = {
  selectedBooking: HallsAvailableQueryResults | null;
  handleCancel: () => void;
  handleSave: (savedEdited: BookingNowFormData, isNew: boolean) => void;
  isCreating: boolean;
  isSaving: boolean;
  customers: Tk_customers[];
  // bookings: Tk_bookings[];
  onSuccess: () => void;
  version: number;
};

// const CREATE = "New Booking";

const BookingForm = ({
  selectedBooking,
  handleCancel,
  handleSave,
  isCreating,
  customers,
  // bookings,
  onSuccess,
}: BookingNowFormProps) => {
  const [formData, setFormData] = React.useState<BookingNowFormData | null>(
    selectedBooking,
  );

  // Keep local form state in sync when the parent prop changes

  React.useEffect(() => {
    // setFormData(selectedBooking);
    setFormData((prev) => {
      if (prev) {
        return {
          ...prev,
          eventDate: formData
            ? addDays(
                new Date(formData.eventDate),
                formData.leadtime,
              ).toISOString() // or .toLocaleDateString() depending on format
            : "",
        };
      }
      return prev;
    });
  }, [selectedBooking]);

  const [errors, setErrors] = useState<bookingFormErrors>({});

  const bookingFormSchema = z.object({
    bookingName: z.string().min(1, "Booking description cannot be blank"),
    _tk_customername_value: z
      .string()
      .min(1, "Please select the Customer from the list")
      .optional(),
  });

  type bookingNowFormData = z.infer<typeof bookingFormSchema>;
  type bookingFormErrors = Partial<Record<keyof bookingNowFormData, string[]>>;

  const validateForm = (data: bookingNowFormData): bookingFormErrors => {
    try {
      bookingFormSchema.parse(data);
      return {};
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Use z.flattenError to extract flat fieldErrors directly
        const flattened = z.flattenError(error);
        console.log("Errors : ", flattened);
        return flattened.fieldErrors as bookingFormErrors;
      }
      return {};
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Update the form data state with the new value
    setFormData((prevData: BookingNowFormData | null) => {
      if (!prevData) {
        console.warn("No current branch data to update");
        return null;
      }

      return {
        ...prevData,
        [name]: value,
      };
    });
  };

  function handleSelectedChange(e: SelectChangeEvent) {
    const { name, value } = e.target;

    // Update the form data state with the new value
    setFormData((prevData: BookingNowFormData | null) => {
      if (!prevData) {
        console.warn("No current branch data to update");
        return null;
      }

      return {
        ...prevData,
        [name]: value,
      };
    });
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    const newErrors = validateForm(formData);
    setErrors(newErrors);
    console.log("Raised Errors", errors);
    if (Object.keys(newErrors).length !== 0) {
      return;
    }
    if (Object.keys(newErrors).length === 0) {
      // form is valid proceed !
    }

    handleSave(formData, isCreating);
    onSuccess();
  };

  return (
    <div
      id="modal"
      className={`fixed w-full inset-0 bg-gray-500 opacity-100 bg-opacity-50 
        items-center justify-center z-50 ${formData ? "flex" : "hidden"}`}
    >
      <div
        className="mx-auto h-[95%] border-4 border-blue-300 rounded-lg shadow-2xl 
       w-[80%] max1-w-md p1-6 relative bg-white my-1"
      >
        <div className="text-center mt-3">
          <ThemeProvider theme={asideMenuTitleTypographyTheme}>
            <Typography color="black" className="flex flex-col">
              Hall Booking in {formData?.branch}{" "}
              <span className="text-orange-400">
                [{STATUS_MAP[formData?.bookingStatus || 0]}]
              </span>
            </Typography>
          </ThemeProvider>
        </div>
        <form className="flex flex-col w-full mt-5" onSubmit={handleSubmit}>
          <div className="flex flex-col w-[80%] m-auto">
            <div className="flex justify-around">
              <fieldset className="border border-black mb-4 p-2 w-[49%]">
                <legend>Branch</legend>
                <input
                  type="text"
                  disabled
                  name="tk_branchid"
                  value={formData?.branch || ""}
                  onChange={handleInputChange}
                  className="w-[80%]"
                />
              </fieldset>
              <fieldset className="border border-black mb-4 p-2 w-[49%]">
                <legend>Hall Name</legend>
                <input
                  type="text"
                  disabled
                  name="tk_hallname"
                  value={formData?.hallName || ""}
                  onChange={handleInputChange}
                  className="w-[80%]"
                />
              </fieldset>
            </div>
            <div className="flex justify-between w-full">
              <fieldset className="border border-black mb-4 p-2 w-[48%] m-auto">
                <legend>Category</legend>
                <input
                  type="text"
                  disabled
                  name="category"
                  value={formData?.category || ""}
                  onChange={handleInputChange}
                  className="w-[80%]"
                />
              </fieldset>
              <fieldset className="border border-black mb-4 p-2 w-[48%] m-auto">
                <legend>Surcharge</legend>
                <input
                  type="text"
                  disabled
                  name="capacity"
                  value={formData?.surcharge}
                  onChange={handleInputChange}
                  className="w-[80%]"
                />
              </fieldset>
            </div>
            <div className="flex justify-around">
              <fieldset className="border border-black mb-4 p-2 w-[49%]">
                <legend>Event date</legend>
                <input
                  type="text"
                  disabled
                  name="eventDate"
                  value={format(formData?.eventDate || "", "dd/MM/yyyy")}
                  onChange={handleInputChange}
                  className="w-[80%]"
                />
              </fieldset>
              <fieldset className="border border-black mb-4 p-2 w-[49%]">
                <legend>Capacity</legend>
                <input
                  type="text"
                  disabled
                  name="capacity"
                  value={
                    formData?.bookingCapacity === 0
                      ? formData.capacity
                      : formData?.bookingCapacity
                  }
                  onChange={handleInputChange}
                  className="w-[80%]"
                />
              </fieldset>
            </div>
            <div className="flex justify-between w-full">
              <div className="w-[52%]  flex justify-start">
                <fieldset className="border border-black mb-4 p-2 w-full mr-5">
                  <legend>Booking Name</legend>
                  <input
                    type="text"
                    name="bookingName"
                    value={formData?.bookingName || ""}
                    onChange={handleInputChange}
                    className="w-[80%]"
                  />
                  {errors.bookingName && (
                    <div className="text-red-500 text-[.7em]">
                      {errors?.bookingName && <span>{errors.bookingName}</span>}
                    </div>
                  )}
                </fieldset>
              </div>
              <div className="border1 mt-3 flex w-[50%]">
                <div className="w-full">
                  <SelectList
                    name="_tk_customername_value"
                    value={formData?._tk_customername_value || ""}
                    label="Customer"
                    data={customers}
                    labelKey="tk_fullname" // Tells the component to use this for text
                    valueKey="tk_customerid" // Tells the component to use this for the ID
                    handleSelectedChange={handleSelectedChange}
                  />
                  {errors._tk_customername_value && (
                    <div className="text-red-500 text-[.7em]">
                      {errors?._tk_customername_value && (
                        <span>{errors._tk_customername_value}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex mb-2 mt-2">
              <div className="m-auto w-full p1-4 flex justify-around">
                <Tooltip title={`Submit`} placement="top" arrow>
                  <Button
                    type="submit"
                    variant="contained"
                    size="small"
                    color="primary"
                    className="w-[70%] text-center align-middle m-auto"
                  >
                    Save
                  </Button>
                </Tooltip>
              </div>
              <div className="m-auto w-full p1-4 flex justify-around">
                <Tooltip title={`Cancel`} placement="top" arrow>
                  <Button
                    type="button"
                    variant="contained"
                    size="small"
                    color="secondary"
                    onClick={() => {
                      handleCancel();
                    }}
                    className="w-[70%] text-center align-middle m-auto"
                  >
                    Cancel
                  </Button>
                </Tooltip>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;
