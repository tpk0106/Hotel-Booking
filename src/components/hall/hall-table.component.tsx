import type { Tk_halls } from "../../generated/models/Tk_hallsModel";
import type { Tk_hotelbranchs } from "../../generated/models/Tk_hotelbranchsModel";
import BaseTable, { type ColumnConfig } from "../../lib/base-table";

type HallProps = {
  halls: Tk_halls[];
  branches: Tk_hotelbranchs[];
  columns: ColumnConfig<Tk_halls>[];
  handleEdit: (hall: Tk_halls) => void;
  handleDelete: (hall: Tk_halls) => void;
  paginationProps: {
    count: number;
    page: number;
    rowsPerPage: number;
    onPageChange: (
      event: React.MouseEvent<HTMLButtonElement> | null,
      newPage: number,
    ) => void;
    onRowsPerPageChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => void;
  };
};

const HallTable = ({
  halls,
  columns,
  handleEdit,
  handleDelete,
  paginationProps,
}: HallProps) => {
  return (
    <div>
      <BaseTable
        columns={columns}
        data={halls}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        sx={{
          "& td": { fontSize: "0.7rem" },
          "& th": { fontSize: "0.8rem" },
          ":hover": { backgroundColor: "#ffffff", color: "#000" },
          width: "60%",
        }}
        paginationProps={paginationProps}
      />
    </div>
  );
};

export default HallTable;
