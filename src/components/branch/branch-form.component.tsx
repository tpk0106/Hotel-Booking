import React, { useState } from "react";
import z from "zod";

import {
  Button,
  ThemeProvider,
  Tooltip,
  Typography,
  type SelectChangeEvent,
} from "@mui/material";
import type { BranchFormData } from "../../model/interfaces";
import { formHeaderTitleTypographyTheme } from "../../lib/themes";
import SelectList from "../../lib/select-list.component";
import type { Aadusers } from "../../generated/models/AadusersModel";

type BranchFormProps = {
  currentBranch: BranchFormData | null;
  handleCancel: () => void;
  handleSave: (savedEdited: BranchFormData, isNew: boolean) => void;
  isCreating: boolean;
  isSaving: boolean;
};

const CREATE = "New Hotel Branch";
const EDIT = "Edit Hotel Branch";

const BranchForm = ({
  currentBranch,
  handleCancel,
  handleSave,
  isCreating,
}: BranchFormProps) => {
  const [formData, setFormData] = React.useState<BranchFormData | null>(
    currentBranch,
  );

  const [errors, setErrors] = useState<branchFormErrors>({});

  const hallFormSchema = z.object({
    tk_branchname: z.string().min(1, "Branch name cannot be blank"),
    _tk_branchmanager_value:
      z.optional(
        z.string().min(1, "Please select the branch manager from the list"),
      ) || undefined,
  });

  type branchFormData = z.infer<typeof hallFormSchema>;
  type branchFormErrors = Partial<Record<keyof branchFormData, string[]>>;

  const validateForm = (data: branchFormData): branchFormErrors => {
    try {
      hallFormSchema.parse(data);
      return {};
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Use z.flattenError to extract flat fieldErrors directly
        const flattened = z.flattenError(error);
        return flattened.fieldErrors as branchFormErrors;
      }
      return {};
    }
  };

  // Keep local form state in sync when the parent prop changes
  React.useEffect(() => {
    setFormData(currentBranch);
  }, [currentBranch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newErrors = validateForm(formData!);
    setErrors(newErrors);

    // Update the form data state with the new value
    setFormData((prevData: BranchFormData | null) => {
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
    setFormData((prevData: BranchFormData | null) => {
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
      className={`fixed h-full w-full inset-0 bg1-gray-500 bg-white opacity1-90 
                  bg1-opacity-50  items-center justify-center z-50 ${formData ? "flex" : "hidden"} "}`}
    >
      <div
        className="flex-col opacity-100 w-[50%] border-4 border-blue-300 
                      rounded-lg shadow-lg max1-w-md relative bg-white"
      >
        <div className="text-center mt-3 bg-gray-400 mx-2">
          <ThemeProvider theme={formHeaderTitleTypographyTheme}>
            <Typography color="black">{isCreating ? CREATE : EDIT}</Typography>
          </ThemeProvider>
        </div>
        <form className="flex flex-col w-full" onSubmit={handleSubmit}>
          <div className="flex flex-col w-[80%] m-auto">
            <div className="flex flex-col justify-around">
              <input
                type="hidden"
                name="hallId"
                value={formData?.tk_hotelbranchid}
              />

              <div className="flex">
                <fieldset
                  className={`border border-black mb-4 p-2  ${errors.tk_branchname ? `border-red-500` : `border-black`} w-[60%] `}
                >
                  {!errors.tk_branchname && <legend>Branch Name</legend>}
                  {errors.tk_branchname && (
                    <legend className="text-red-500">
                      {errors.tk_branchname}
                    </legend>
                  )}

                  <input
                    type="text"
                    name="tk_branchname"
                    value={formData?.tk_branchname || ""}
                    onChange={handleInputChange}
                    className="w-[80%]"
                  />
                </fieldset>
              </div>
              <div className="flex">
                <fieldset className="border border-black mb-4 p-2 w-[40%] mr-2">
                  <legend>Contact Number</legend>
                  <input
                    type="text"
                    name="tk_branchcontactnumber"
                    value={formData?.tk_branchcontactnumber || ""}
                    onChange={handleInputChange}
                    className="w-[80%]"
                  />
                </fieldset>

                <fieldset className="border border-black mb-4 p-2 w-[60%]">
                  <legend>Contact Email</legend>
                  <input
                    type="text"
                    name="tk_branchcontactemail"
                    value={formData?.tk_branchcontactemail || ""}
                    onChange={handleInputChange}
                    className="w-[80%]"
                  />
                </fieldset>
              </div>

              <fieldset className="border border-black mb-4 p-2">
                <legend>Address</legend>
                <input
                  type="text"
                  name="tk_branchaddress"
                  value={formData?.tk_branchaddress || ""}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </fieldset>
            </div>

            <div
              className={`border1 border1-black mb-4 p1-2 w-[50%] ${errors._tk_branchmanager_value ? `border-red-500` : `border-black`} `}
            >
              <SelectList
                name="_tk_branchmanager_value"
                value={formData?._tk_branchmanager_value || ""}
                label={
                  !errors.tk_branchname
                    ? "Manager"
                    : errors._tk_branchmanager_value &&
                      (errors?._tk_branchmanager_value as any)
                }
                data={formData?.managers as Aadusers[]}
                labelKey="displayname" // Tells the component to use this for text
                valueKey="aaduserid" // Tells the component to use this for the ID
                handleSelectedChange={handleSelectedChange}
              />
              {/* {errors._tk_branchmanager_value && (
                  <div className="text-red-500 text-[.7em]">
                    {errors?._tk_branchmanager_value && (
                      <span>{errors._tk_branchmanager_value}</span>
                    )}
                  </div>
                )} */}
            </div>
          </div>

          <div className="flex justify-around mt-2 mb-2">
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
        </form>
      </div>
    </div>
  );
};

export default BranchForm;
