import BaseTable, { type ColumnConfig } from "../../lib/base-table";
import type {
  BookingNowFormData,
  HallsAvailableQueryResults,
} from "../../model/interfaces";

type SearchResultsProps = {
  bookings: HallsAvailableQueryResults[];
  handlePendingBooking?: (booking: HallsAvailableQueryResults) => void;
  handleConfirmBooking?: (booking: HallsAvailableQueryResults) => void;
  handleSave?: (booking: BookingNowFormData) => void;
  columns: ColumnConfig<HallsAvailableQueryResults>[];
  onSuccess: () => void;
};

const SearchResultsTable = ({
  bookings,
  columns,
  handlePendingBooking,
  handleConfirmBooking,
}: SearchResultsProps) => {
  return (
    <div className="overflow1-scroll overflow-y-auto w-full">
      <BaseTable
        sx={{ width: "80%", overflowX1: "auto", overflowY1: "auto" }}
        columns={columns}
        data={bookings}
        handlePendingBooking={handlePendingBooking}
        handleConfirmBooking={handleConfirmBooking}
      />
    </div>
  );
};

export default SearchResultsTable;
