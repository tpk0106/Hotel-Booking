import React, { useState } from "react";
import z from "zod";

import { Button, ThemeProvider, Tooltip, Typography } from "@mui/material";
import type { CustomerFormData } from "../../model/interfaces";

import { asideMenuTitleTypographyTheme } from "../../lib/themes";

type CustomerFormProps = {
  currentCustomer: CustomerFormData | null;
  handleCancel: () => void;
  handleSave: (savedEdited: CustomerFormData, isNew: boolean) => void;
  isCreating: boolean;
  isSaving: boolean;
};

const CREATE = "New Customer";
const EDIT = "Edit Customer";

const CustomerForm = ({
  currentCustomer,
  handleCancel,
  handleSave,
  isCreating,
}: CustomerFormProps) => {
  const [formData, setFormData] = React.useState<CustomerFormData | null>(
    currentCustomer,
  );

  const [errors, setErrors] = useState<branchFormErrors>({});

  const customerFormSchema = z.object({
    tk_firstname: z.string().min(1, "First name cannot be blank"),
    tk_lastname: z.string().min(1, "Last name cannot be blank"),
    tk_fullname: z.string().min(1, "Full name cannot be blank"),
  });

  type customerFormData = z.infer<typeof customerFormSchema>;
  type branchFormErrors = Partial<Record<keyof customerFormData, string[]>>;

  const validateForm = (data: customerFormData): branchFormErrors => {
    try {
      customerFormSchema.parse(data);
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
    setFormData(currentCustomer);
  }, [currentCustomer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Update the form data state with the new value
    setFormData((prevData: CustomerFormData | null) => {
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
      className={`fixed w-full inset-0 bg1-gray-500 opacity1-90 bg1-opacity-50 bg-white
                  items-center justify-center z-50 ${formData ? "flex" : "hidden"}`}
    >
      <div
        className="flex-col opacity-100 w-[80%] border-4 border-blue-300 rounded-lg 
                   shadow-lg max1-w-md relative bg-white"
      >
        <div className="text-center mt-3 bg-gray-400 mx-2">
          <ThemeProvider theme={asideMenuTitleTypographyTheme}>
            <Typography color="black">{isCreating ? CREATE : EDIT}</Typography>
          </ThemeProvider>
        </div>
        <form className="flex flex-col w-full" onSubmit={handleSubmit}>
          <div className="flex flex-col w-[80%] m-auto">
            <div className="flex justify-around">
              <input
                type="hidden"
                name="hallId"
                value={formData?.tk_customerid}
              />
              <fieldset
                className={`border border-black mb-4 p-2 
                  ${errors.tk_firstname ? `border-red-500` : `border-black`} w-[50%] mr-3`}
              >
                <legend>First Name</legend>
                <input
                  type="text"
                  name="tk_firstname"
                  value={formData?.tk_firstname || ""}
                  onChange={handleInputChange}
                  className="w-[80%]"
                />
                {errors.tk_firstname && (
                  <div className="text-red-500 text-[.7em]">
                    {errors?.tk_firstname && <span>{errors.tk_firstname}</span>}
                  </div>
                )}
              </fieldset>
              <fieldset
                className={`border border-black mb-4 p-2 
                  ${errors.tk_lastname ? `border-red-500` : `border-black`} w-[50%] `}
              >
                <legend>Last Name</legend>
                <input
                  type="text"
                  name="tk_lastname"
                  value={formData?.tk_lastname || ""}
                  onChange={handleInputChange}
                  className="w-[80%]"
                />
                {errors.tk_lastname && (
                  <div className="text-red-500 text-[.7em]">
                    {errors?.tk_lastname && <span>{errors.tk_lastname}</span>}
                  </div>
                )}
              </fieldset>
            </div>
            <div className="flex justify-around">
              <fieldset
                className={`border border-black mb-4 p-2 
                  ${errors.tk_fullname ? `border-red-500` : `border-black`} w-[50%] mr-3`}
              >
                <legend>Full Name</legend>
                <input
                  type="text"
                  name="tk_fullname"
                  value={formData?.tk_fullname || ""}
                  onChange={handleInputChange}
                  className="w-[80%]"
                />
                {errors.tk_fullname && (
                  <div className="text-red-500 text-[.7em]">
                    {errors?.tk_fullname && <span>{errors.tk_fullname}</span>}
                  </div>
                )}
              </fieldset>
              <fieldset className="border border-black mb-4 p-2 w-[50%]">
                <legend>Contact Number</legend>
                <input
                  type="text"
                  name="tk_customertelephone"
                  value={formData?.tk_customertelephone || ""}
                  onChange={handleInputChange}
                  className="w-[80%]"
                />
              </fieldset>
            </div>
            <div className="flex justify-between">
              <fieldset className="border border-black mb-4 p-2 w-[40%] mr-3">
                <legend>Contact Email</legend>
                <input
                  type="text"
                  name="tk_customeremail"
                  value={formData?.tk_customeremail || ""}
                  onChange={handleInputChange}
                  className="w-[80%]"
                />
              </fieldset>
              <fieldset className="border border-black mb-4 p-2 w-[60%]">
                <legend>Address</legend>
                <input
                  type="text"
                  name="tk_customeraddress"
                  value={formData?.tk_customeraddress || ""}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </fieldset>
            </div>
          </div>

          <div className="flex mt-3 mb-2">
            <div className="m-auto w-full flex justify-around">
              <Tooltip title={`Save`} placement="top" arrow>
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

export default CustomerForm;
