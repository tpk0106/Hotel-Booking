import React, { useState } from "react";
import z from "zod";

import {
  Button,
  ThemeProvider,
  Tooltip,
  Typography,
  type SelectChangeEvent,
} from "@mui/material";

import type { HallEventTypeFormData } from "../../model/interfaces";
import { formHeaderTitleTypographyTheme } from "../../lib/themes";
import SelectList from "../../lib/select-list.component";

import type { Tk_eventcategories } from "../../generated/models/Tk_eventcategoriesModel";
import type { Tk_halls } from "../../generated/models/Tk_hallsModel";

type HallEventTypeFormProps = {
  currentHallEventType: HallEventTypeFormData | null;
  handleCancel: () => void;
  handleSave: (savedEdited: HallEventTypeFormData, isNew: boolean) => void;
  isCreating: boolean;
  isSaving: boolean;
};

const CREATE = "New Hall Event Type";
const EDIT = "Edit Hall Event Type";

const HallEventTypeForm = ({
  currentHallEventType,
  handleCancel,
  handleSave,
  isCreating,
}: HallEventTypeFormProps) => {
  const [formData, setFormData] = React.useState<HallEventTypeFormData | null>(
    currentHallEventType,
  );

  const [errors, setErrors] = useState<currentHallEventTypeFormErrors>({});

  const hallEventTypeFormSchema = z
    .object({
      tk_eventtypecapacity: z.coerce
        .number()
        .int()
        .min(1, "Capacity cannot be 0"),

      tk_mincapacity: z.coerce
        .number()
        .int()
        .min(1, "Capacity cannot be less than Min Capacity"),

      tk_surcharge: z.coerce.number().int(),

      tk_leadtime: z.coerce
        .number()
        .int()
        .min(1, "Lead time cannot be less than 0"),

      tk_cancellationwindow: z.coerce
        .number()
        .int()
        .min(1, "Cancellation window cannot be zero."),

      tk_cancellationfee: z.coerce.number(),

      _tk_hallname_value: z
        .string()
        .min(1, "Please select the Hall from the list")
        .optional(),

      _tk_eventcategorytype_value: z
        .string()
        .min(1, "Please select the event category type from the list")
        .optional(),
    })
    .refine((data) => data.tk_eventtypecapacity > data.tk_mincapacity, {
      message: "Event type capacity must be greater than minimum capacity",
      path: ["tk_eventtypecapacity"], // error will be shown under this field
    });

  type currentHallEventTypeFormData = z.infer<typeof hallEventTypeFormSchema>;

  // Keeps the strict alignment with the keys of your form data
  type currentHallEventTypeFormErrors = Partial<
    Record<keyof currentHallEventTypeFormData, string[]>
  >;

  // zod v4

  const validateForm = (
    data: currentHallEventTypeFormData,
  ): currentHallEventTypeFormErrors => {
    try {
      hallEventTypeFormSchema.parse(data);
      return {};
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Use z.flattenError to extract flat fieldErrors directly
        const flattened = z.flattenError(error);
        return flattened.fieldErrors as currentHallEventTypeFormErrors;
      }
      return {};
    }
  };

  // Keep local form state in sync when the parent prop changes
  React.useEffect(() => {
    setFormData(currentHallEventType);
  }, [currentHallEventType]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const newErrors = validateForm(formData!);
    setErrors(newErrors);

    // Update the form data state with the new value
    setFormData((prevData: HallEventTypeFormData | null) => {
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

    const newErrors = validateForm(formData!);
    setErrors(newErrors);

    // Update the form data state with the new value
    setFormData((prevData: HallEventTypeFormData | null) => {
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

    if (Object.keys(newErrors).length !== 0) {
      return;
    }
    if (Object.keys(newErrors).length === 0) {
      // form is valid proceed !
    }
    // setSaving(true);

    handleSave(formData, isCreating);
  };

  return (
    <div
      id="modal"
      className={`fixed w-full inset-0 bg-gray-500 opacity-90 bg-opacity-50 items-center justify-center z-50 ${formData ? "flex" : "hidden"}`}
    >
      <div className=" flex-col opacity-100 h-[95%] w-[50%] border-4 border-blue-300 rounded-lg shadow-lg max1-w-md py-3 relative bg-white">
        <div className="text-center mt-1 bg-gray-400 mx-2">
          <ThemeProvider theme={formHeaderTitleTypographyTheme}>
            <Typography color="black">{isCreating ? CREATE : EDIT}</Typography>
          </ThemeProvider>
        </div>
        <form className="flex flex-col w-full mt-2" onSubmit={handleSubmit}>
          <div className="flex flex-col w-[80%] m-auto mt-2">
            <div className="flex flex-col w-full m-auto">
              <input
                type="hidden"
                name="halleventtypeid"
                value={formData?.tk_halleventtypeid}
              />
              <div className="flex w-full m-auto justify-around]">
                <div
                  className={`border-black  w-[48%] mb-4 p-2 ${errors._tk_eventcategorytype_value ? `border border-red-500` : `border-black`} `}
                >
                  <SelectList
                    name="_tk_eventcategorytype_value"
                    value={formData?._tk_eventcategorytype_value || ""}
                    label={
                      !errors._tk_eventcategorytype_value
                        ? "Event Categories"
                        : errors._tk_eventcategorytype_value &&
                          (errors?._tk_eventcategorytype_value as any)
                    }
                    data={formData?.eventCategories as Tk_eventcategories[]}
                    labelKey="tk_categoryname" // Tells the component to use this for text
                    valueKey="tk_eventcategoryid" // Tells the component to use this for the ID
                    handleSelectedChange={handleSelectedChange}
                  />
                </div>
                <div
                  className={`border1 border-black  w-[48%] mb-4 p-2 ${errors._tk_eventcategorytype_value ? `border border-red-500` : `border-black`} `}
                >
                  <SelectList
                    name="_tk_hallname_value"
                    value={formData?._tk_hallname_value || ""}
                    label={
                      !errors._tk_hallname_value
                        ? "Hall Names"
                        : errors._tk_hallname_value &&
                          (errors?._tk_hallname_value as any)
                    }
                    data={formData?.halls as Tk_halls[]}
                    labelKey="tk_hallname" // Tells the component to use this for text
                    valueKey="tk_hallid" // Tells the component to use this for the ID
                    handleSelectedChange={handleSelectedChange}
                  />
                </div>
              </div>
            </div>

            <div className="flex w-full m-auto justify-around">
              <div>
                <fieldset
                  className={`border border-black mb-4 p-2 
                  ${errors.tk_eventtypecapacity ? `border-red-500` : `border-black`} w-full`}
                >
                  <legend>Max. Capacity</legend>
                  <input
                    type="number"
                    name="tk_eventtypecapacity"
                    value={formData?.tk_eventtypecapacity}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                  {errors?.tk_eventtypecapacity && (
                    <div className="text-red-500 text-[.7em]">
                      {errors?.tk_eventtypecapacity}
                    </div>
                  )}
                </fieldset>
              </div>

              <div>
                <fieldset
                  className={`border border-black mb-4 p-2 
                  ${errors.tk_mincapacity ? `border-red-500` : `border-black`} w-full`}
                >
                  <legend>Min. Capacity</legend>
                  <input
                    type="number"
                    name="tk_mincapacity"
                    value={formData?.tk_mincapacity}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                  {errors?.tk_mincapacity && (
                    <div className="text-red-500 text-[.7em]">
                      {errors?.tk_mincapacity}
                    </div>
                  )}
                </fieldset>
              </div>
            </div>

            <div className="flex w-full m-auto justify-around">
              <div className="w-[30%]">
                <fieldset
                  className={`border border-black mb-4 p-2 
                  ${errors.tk_cancellationwindow ? `border-red-500` : `border-black`} w-full`}
                >
                  <legend>Cancellation Fee</legend>
                  <input
                    type="number"
                    name="tk_cancellationfee"
                    value={formData?.tk_cancellationfee}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                  {errors?.tk_cancellationfee && (
                    <div className="text-red-500 text-[.7em]">
                      {errors?.tk_cancellationfee}
                    </div>
                  )}
                </fieldset>
              </div>
              <div className="w-[30%]">
                <fieldset
                  className={`border border-black mb-4 p-2 
                  ${errors.tk_surcharge ? `border-red-500` : `border-black`} w-full`}
                >
                  <legend>Surcharge</legend>
                  <input
                    type="number"
                    name="tk_surcharge"
                    value={formData?.tk_surcharge}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                  {errors?.tk_surcharge && (
                    <div className="text-red-500 text-[.7em]">
                      {errors?.tk_surcharge}
                    </div>
                  )}
                </fieldset>
              </div>
            </div>

            <div className="flex w-full m-auto justify-around">
              <div className="w-[35%]">
                <fieldset
                  className={`border border-black mb-4 p-2 
                  ${errors.tk_cancellationwindow ? `border-red-500` : `border-black`} w-full`}
                >
                  <legend>Cancellation Window</legend>
                  <input
                    type="number"
                    name="tk_cancellationwindow"
                    value={formData?.tk_cancellationwindow}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                  {errors?.tk_cancellationwindow && (
                    <div className="text-red-500 text-[.7em]">
                      {errors?.tk_cancellationwindow}
                    </div>
                  )}
                </fieldset>
              </div>

              <div className="w-[30%]">
                <fieldset
                  className={`border border-black mb-4 p-2 
                  ${errors.tk_leadtime ? `border-red-500` : `border-black`} w-full`}
                >
                  <legend>Lead Time</legend>
                  <input
                    type="number"
                    name="tk_leadtime"
                    value={formData?.tk_leadtime}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                  {errors?.tk_leadtime && (
                    <div className="text-red-500 text-[.7em]">
                      {errors?.tk_leadtime}
                    </div>
                  )}
                </fieldset>
              </div>
            </div>

            <div className="flex">
              <div className="m-auto w-full  p1-4 flex justify-around">
                <Tooltip title={`Save`} placement="top" arrow>
                  <Button
                    type="submit"
                    size="small"
                    variant="contained"
                    color="primary"
                    className="w-[70%] text-center align-middle m-auto"
                  >
                    Save
                  </Button>
                </Tooltip>
              </div>
              <div className="m-auto w-full  p1-4 flex justify-around">
                <Tooltip title={`Cancel save`} placement="top" arrow>
                  <Button
                    type="button"
                    variant="contained"
                    size="small"
                    color="secondary"
                    onClick={() => handleCancel()}
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

export default HallEventTypeForm;
