import type { Tk_bookings } from "../../generated/models/Tk_bookingsModel";

import BaseTable, { type ColumnConfig } from "../../lib/base-table";
import type { PaginationProps } from "../../model/interfaces";

type BookingProps = {
  bookings: Tk_bookings[];
  handleEdit?: (booking: Tk_bookings) => void;
  handleDelete?: (hall: Tk_bookings) => void;
  handleConfirmBooking?: (booking: Tk_bookings) => void;
  handleCancelBooking?: (booking: Tk_bookings) => void;
  columns: ColumnConfig<Tk_bookings>[];
  paginationProps: PaginationProps;
};

const BookingTable = ({
  bookings,
  columns,
  handleConfirmBooking,
  handleCancelBooking,
  paginationProps,
}: BookingProps) => {
  return (
    <div>
      <BaseTable
        columns={columns}
        data={bookings}
        handleConfirmBooking={handleConfirmBooking}
        handleCancelBooking={handleCancelBooking}
        sx={{
          "&hover": { backgroundColor: "#ff0000", color: "#000" },
        }}
        paginationProps={paginationProps}
      />
    </div>
  );
};

export default BookingTable;
