import type { Aadusers } from "../../generated/models/AadusersModel";
import type { Tk_hotelbranchs } from "../../generated/models/Tk_hotelbranchsModel";
import type { ColumnConfig } from "../../lib/base-table";
import BaseTable from "../../lib/base-table";
import type { PaginationProps } from "../../model/interfaces";

type BranchProps = {
  managers: Aadusers[];
  branches: Tk_hotelbranchs[];
  columns: ColumnConfig<Tk_hotelbranchs>[];
  handleEdit: (branch: Tk_hotelbranchs) => void;
  handleDelete: (branch: Tk_hotelbranchs) => void;
  paginationProps: PaginationProps;
};

const BranchTable = ({
  branches,
  columns,
  handleEdit,
  handleDelete,
  paginationProps,
}: BranchProps) => {
  return (
    <div>
      <BaseTable
        columns={columns}
        data={branches}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        sx={
          {
            // "& .MuiTableRow-root": {
            //   height: "20", // Sets height for both header and body rows
            // },
            // "& .MuiTableCell-root": {
            //   padding: "4px 8px", // Tightens up internal spacing globally
            // },
            // "& td": { fontSize: "0.7rem" },
            // "& th": { fontSize: "0.8rem" },
            // ":hover": { backgroundColor: "#ffffff", color: "#000" },
            // 1. Force a specific height on the row
            // height: "30px",
            // 2. Target all child cells to ensure padding doesn't stretch the row
            // "& td, & th": { padding: "0px 16px" },
          }
        }
        paginationProps={paginationProps}
      />
    </div>
  );
};

export default BranchTable;
