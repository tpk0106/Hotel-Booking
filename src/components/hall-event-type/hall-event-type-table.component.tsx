import type { Tk_eventcategories } from "../../generated/models/Tk_eventcategoriesModel";
import type { Tk_halleventtypes } from "../../generated/models/Tk_halleventtypesModel";

import type { ColumnConfig } from "../../lib/base-table";
import BaseTable from "../../lib/base-table";
import type { PaginationProps } from "../../model/interfaces";

type HallEventTypeProps = {
  eventCategories: Tk_eventcategories[];
  hallEventTypes: Tk_halleventtypes[];
  columns: ColumnConfig<Tk_halleventtypes>[];
  handleEdit: (hallEventType: Tk_halleventtypes) => void;
  handleDelete: (hallEventType: Tk_halleventtypes) => void;
  paginationProps: PaginationProps;
};

const HallEventTypeTable = ({
  hallEventTypes,
  columns,
  handleEdit,
  handleDelete,
  paginationProps,
}: HallEventTypeProps) => {
  return (
    <div>
      <BaseTable
        columns={columns}
        data={hallEventTypes}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        sx={{
          width: "60%",
          "& td": { fontSize: "0.7rem" },
          "& th": { fontSize: "0.8rem" },
          ":hover": { backgroundColor: "#ffffff", color: "#000" },
        }}
        paginationProps={paginationProps}
      />
    </div>
  );
};

export default HallEventTypeTable;
