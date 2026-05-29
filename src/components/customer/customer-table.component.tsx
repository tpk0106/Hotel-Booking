import type { Tk_customers } from "../../generated/models/Tk_customersModel";

import BaseTable, { type ColumnConfig } from "../../lib/base-table";
import type { PaginationProps } from "../../model/interfaces";

type CustomerProps = {
  customers: Tk_customers[];
  columns: ColumnConfig<Tk_customers>[];
  handleEdit: (customer: Tk_customers) => void;
  handleDelete: (customer: Tk_customers) => void;
  paginationProps: PaginationProps;
};

const CustomerTable = ({
  customers,
  columns,
  handleEdit,
  handleDelete,
  paginationProps,
}: CustomerProps) => {
  return (
    <div>
      <BaseTable
        sx={{
          "& td": { fontSize: "0.7rem" },
          "& th": { fontSize: "0.8rem" },
          ":hover": { backgroundColor: "#ffffff", color: "#000" },
        }}
        columns={columns}
        data={customers}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        paginationProps={paginationProps}
      />
    </div>
  );
};

export default CustomerTable;
