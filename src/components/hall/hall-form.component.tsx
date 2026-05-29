import React, { useState } from "react";
import z from "zod";

import {
  Button,
  ThemeProvider,
  Tooltip,
  Typography,
  type SelectChangeEvent,
} from "@mui/material";

import { formHeaderTitleTypographyTheme } from "../../lib/themes";

import type { Tk_hotelbranchs } from "../../generated/models/Tk_hotelbranchsModel";

import type { HallFormData } from "../../model/interfaces";
import SelectList from "../../lib/select-list.component";
import ImageFileUpload from "../../lib/image-file-upload.component";
import { HallThumbnail } from "../../lib/hall-thumbnail.component";

type HallFormProps = {
  currentHall: HallFormData | null;
  handleCancel: () => void;
  handleSave: (savedEdited: HallFormData, isNew: boolean) => void;
  isCreating: boolean;
  isSaving: boolean;
  onSaveSuccess: () => void;
  tableVersion: number;
};

const CREATE = "New Hall";
const EDIT = "Edit Hall";

const HallForm = ({
  currentHall,
  handleCancel,
  handleSave,
  isCreating,
  tableVersion,
}: HallFormProps) => {
  const [formData, setFormData] = React.useState<HallFormData | null>(
    currentHall,
  );

  const [errors, setErrors] = useState<hallFormErrors>({});

  const hallFormSchema = z.object({
    tk_hallname: z.string().min(1, "Hall Name cannot be blank"),
    _tk_hotelbranch_value: z.optional(
      z.string().min(1, "Please select hotel branch name"),
    ),
  });

  type hallFormData = z.infer<typeof hallFormSchema>;
  type hallFormErrors = Partial<Record<keyof hallFormData, string[]>>;

  const validateForm = (data: hallFormData): hallFormErrors => {
    try {
      hallFormSchema.parse(data);
      return {};
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Use z.flattenError to extract flat fieldErrors directly
        const flattened = z.flattenError(error);
        return flattened.fieldErrors as hallFormErrors;
      }
      return {};
    }
  };

  // Keep local form state in sync when the parent prop changes
  React.useEffect(() => {
    setFormData(currentHall);
  }, [currentHall]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Update the form data state with the new value
    setFormData((prevData: HallFormData | null) => {
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
    setFormData((prevData: HallFormData | null) => {
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
  };

  return (
    <div
      id="modal"
      className={`fixed w-full inset-0 bg1-gray-500 opacity1-100 bg1-opacity-50 bg-white
                  items-center justify-center z-50 ${formData ? "flex" : "hidden"}`}
    >
      <div
        className=" flex-col opacity-100 w-[50%] h-[90%] border-4 
                  border-blue-300 rounded-lg shadow-lg max1-w-md relative bg-white"
      >
        <div className="text-center mt-2 bg-gray-400 mx-2">
          <ThemeProvider theme={formHeaderTitleTypographyTheme}>
            <Typography color="black">{isCreating ? CREATE : EDIT}</Typography>
          </ThemeProvider>
        </div>
        <form className="flex flex-col w-full" onSubmit={handleSubmit}>
          <div className="flex flex-col w-[80%] m-auto mt-2">
            <div className="flex flex-col w-[90%] m-auto">
              <div className="flex">
                <div className="w-[50%] m-2 mt-4">
                  <SelectList
                    name="_tk_hotelbranch_value"
                    value={formData?._tk_hotelbranch_value || ""}
                    label="Hotel Branch"
                    disabled={isCreating ? false : true}
                    data={formData?.branches as Tk_hotelbranchs[]}
                    labelKey="tk_branchname" // Tells the component to use this for text
                    valueKey="tk_hotelbranchid" // Tells the component to use this for the ID
                    handleSelectedChange={handleSelectedChange}
                  />
                  {errors._tk_hotelbranch_value && (
                    <div className="text-red-500 text-[.7em]">
                      {errors?._tk_hotelbranch_value && (
                        <span>{errors._tk_hotelbranch_value}</span>
                      )}
                    </div>
                  )}
                </div>
                <input
                  type="hidden"
                  name="hallId"
                  value={formData?.tk_hallid}
                />
                <fieldset
                  className={`border border-black w-[60%] m-2 mb-4 p-2 ${errors.tk_hallname ? `border-red-500` : `border-black`} `}
                >
                  <legend>Hall Name</legend>
                  <input
                    type="text"
                    name="tk_hallname"
                    value={formData?.tk_hallname || ""}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                  {errors.tk_hallname && (
                    <div className="text-red-500 text-[.7em]">
                      {errors?.tk_hallname && <span>{errors.tk_hallname}</span>}
                    </div>
                  )}
                </fieldset>
              </div>

              {/* Show EXISTING image from server if we are editing and haven't picked a NEW file yet */}
              <div className="border1-4 border1-green-500">
                {!isCreating &&
                  formData?.tk_hallid &&
                  !(formData.tk_hallimage instanceof File) && (
                    <div className="mb-2 flex flex-col items-center justify-center border-b pb-2">
                      <p className="text-xs text-gray-500 self-start">
                        Current Image :
                      </p>
                      <HallThumbnail
                        hallId={formData.tk_hallid}
                        version={tableVersion.toString()}
                      />
                    </div>
                  )}
              </div>
              {/* 
              {/* {previewUrl && (
                <img src={previewUrl} alt="Preview" className="image-preview" />
              )} */}
              {/* <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              /> */}
              <div>
                <fieldset className={`border border-black mb-4 p-2 mt-5`}>
                  <legend>Select Image</legend>

                  {/* 2. The Upload Component for NEW selections */}
                  <ImageFileUpload
                    currentImg={formData?.tk_hallimage}
                    setParentState={(file: File) => {
                      setFormData((prev) =>
                        prev ? { ...prev, tk_hallimage: file } : null,
                      );
                    }}
                  />
                </fieldset>
              </div>
            </div>
          </div>

          <div className="flex">
            <div className="m-auto w-full p1-4 flex justify-around">
              <Tooltip title={`Save Hall`} placement="top" arrow>
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
            <div className="m-auto w-full flex justify-around">
              <Tooltip title={`Cancel save`} placement="top" arrow>
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
        </form>
      </div>
    </div>
  );
};

export default HallForm;
