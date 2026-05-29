import { Button } from "@mui/material";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { Bars } from "react-loading-icons";

import type { Tk_customers } from "../../generated/models/Tk_customersModel";
import { Tk_customersService } from "../../generated";
import type { IOperationResult } from "@microsoft/power-apps/data";

import {
  type CustomerFormData,
  type PaginationProps,
} from "../../model/interfaces";
import type { ColumnConfig } from "../../lib/base-table";
import { useLoadAllCustomers } from "../../lib/api";
import CustomerTable from "./customer-table.component";
import CustomerForm from "./customer-form.component";

const Customer = () => {
  const [customers, setCustomers] = useState<Tk_customers[]>([]);
  // const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CustomerFormData | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

  let toastId: any;

  const {
    customersData,
    totalCount,
    loading: loading,
  } = useLoadAllCustomers(page, rowsPerPage);

  useEffect(() => {
    const loadData = () => {
      setCustomers(customersData);
    };
    loadData();
  }, [customersData]);

  const customerColumns: ColumnConfig<Tk_customers>[] = [
    { header: "First Name", key: "tk_firstname" }, // Maps "Name" header to "tk_name" data key
    { header: "Last Name", key: "tk_lastname" }, // Maps "Name" header to "tk_name" data key
    { header: "Full Name", key: "tk_fullname" }, // Maps "Name" header to "tk_name" data key
    { header: "Contact Number", key: "tk_customertelephone" },
    { header: "Email", key: "tk_customeremail" },
    { header: "Address", key: "tk_customeraddress" },
    { header: "Action", key: "actions" }, // Special key for buttons
  ];

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

  const handleEdit = (editFormData: Tk_customers) => {
    const retRow = editFormData;
    handleEditForm(retRow);
  };

  const handleDelete = (editFormData: Tk_customers) => {
    openDeleteConfirmModal(editFormData);
  };

  function handleNewForm() {
    setIsCreating(true);
    const newCustomer: CustomerFormData = {
      tk_customeraddress: "",
      tk_customeremail: "",
      tk_customerid: "",
      tk_customerref: "",
      tk_customertelephone: "",
      tk_firstname: "",
      tk_fullname: "",
      tk_lastname: "",
    };
    setFormData(newCustomer);
  }

  function handleEditForm(editFormData: Tk_customers) {
    setIsCreating(false);

    // Implement the logic to handle the edit form submission
    setCustomers(customers);
    const editingCustomer: CustomerFormData = {
      tk_customerid: editFormData.tk_customerid,
      tk_customeraddress: editFormData.tk_customeraddress,
      tk_customeremail: editFormData.tk_customeremail,
      tk_customerref: editFormData.tk_customerref,
      tk_customertelephone: editFormData.tk_customertelephone,
      tk_firstname: editFormData.tk_firstname,
      tk_fullname: editFormData.tk_fullname,
      tk_lastname: editFormData.tk_lastname,
    };
    setFormData(editingCustomer);
  }

  //DELETE action
  const openDeleteConfirmModal = (deleteFormData: Tk_customers) => {
    if (window.confirm("Are you sure you want to delete this Customer?")) {
      deleteCustomer(deleteFormData.tk_customerid);
    }
  };

  const updateCustomer = (editedPayload: CustomerFormData) => {
    // 1. Prepare the payload with ONLY writable fields
    const payload: any = {
      tk_firstname: editedPayload.tk_firstname,
      tk_lastname: editedPayload.tk_lastname,
      tk_fullname: editedPayload.tk_fullname,
      tk_customeremail: editedPayload.tk_customeremail,
      tk_customerref: editedPayload.tk_customerref,
      tk_customertelephone: editedPayload.tk_customertelephone,
      tk_customeraddress: editedPayload.tk_customeraddress,
    };

    Tk_customersService.update(editedPayload.tk_customerid, payload)
      .then(() => {
        {
          toast.update(toastId, {
            render: "Branch is saved successfully",
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });
        }

        setCustomers((prev) =>
          prev.map((c) =>
            c.tk_customerid === editedPayload.tk_customerid
              ? {
                  ...c,
                  tk_customeraddress: editedPayload.tk_customeraddress,
                  tk_customeremail: editedPayload.tk_customeremail,
                  tk_customerref: editedPayload.tk_customerref,
                  tk_customertelephone: editedPayload.tk_customertelephone,
                  tk_firstname: editedPayload.tk_firstname,
                  tk_fullname: editedPayload.tk_fullname,
                  tk_lastname: editedPayload.tk_lastname,
                }
              : c,
          ),
        );

        setFormData(null);
      })
      .catch((err) => {
        toast.update(toastId, {
          render: `Failed to save ${err}`,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      })
      .finally(() => {});
  };

  // create customer
  const createCustomer = (newPayload: CustomerFormData) => {
    const payload: any = {
      tk_customeraddress: newPayload.tk_customeraddress,
      tk_customeremail: newPayload.tk_customeremail,
      tk_customerref: newPayload.tk_customerref,
      tk_customertelephone: newPayload.tk_customertelephone,
      tk_firstname: newPayload.tk_firstname,
      tk_fullname: newPayload.tk_fullname,
      tk_lastname: newPayload.tk_lastname,
    };

    Tk_customersService.create(payload)
      .then((result: IOperationResult<Tk_customers>) => {
        const createdCustomer = result.data;
        if (!createdCustomer) return;

        const newCustomer: Tk_customers = {
          ...createdCustomer,
          tk_customeraddress: newPayload.tk_customeraddress,
          tk_customeremail: newPayload.tk_customeremail,
          tk_customerref: newPayload.tk_customerref,
          tk_customertelephone: newPayload.tk_customertelephone,
          tk_firstname: newPayload.tk_firstname,
          tk_fullname: newPayload.tk_fullname,
          tk_lastname: newPayload.tk_lastname,
        };

        setCustomers((prevCustomer) => [newCustomer, ...prevCustomer]);
        setFormData(null);

        {
          toast.update(toastId, {
            render: "Customer is saved successfully",
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

  // delete customer

  const deleteCustomer = (customerId: string) => {
    Tk_customersService.delete(customerId)
      .then(() => {
        // f you want to be even safer and ensure you are working with the most
        // recent version of the list (to avoid race conditions),
        // use the functional update pattern:

        setCustomers((prevCustomers) =>
          prevCustomers.filter(
            (customer) => customer.tk_customerid !== customerId,
          ),
        );
        {
          toast.update(toastId, {
            render: "Customer is deleted successfully",
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
        }
        setFormData(null);
      })
      .catch((err) => {
        {
          toast.update(toastId, {
            render: `Failed to delete ${err}`,
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
        }
      })
      .finally(() => {});
  };
  //

  function handleSave(savePayload: CustomerFormData, isNew: boolean) {
    toastId = toast.loading("Saving... please wait");
    if (isNew) {
      createCustomer(savePayload);
    } else {
      updateCustomer(savePayload);
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
          onClick={() => handleNewForm()}
          className="w-[20%] text-center align-middle m-auto"
        >
          New Customer
        </Button>
      </section>

      <CustomerTable
        customers={customers}
        columns={customerColumns}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        paginationProps={paginationProps}
      />

      <section className="mt-5">
        {formData && (
          <>
            <CustomerForm
              currentCustomer={formData}
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

export default Customer;
