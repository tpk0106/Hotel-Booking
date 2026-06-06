import type { Aadusers } from "../generated/models/AadusersModel";
import type { Tk_bookingstk_bookingstatus } from "../generated/models/Tk_bookingsModel";
import type {
  Tk_customers,
  Tk_customerstk_title,
} from "../generated/models/Tk_customersModel";
import type { Tk_eventcategories } from "../generated/models/Tk_eventcategoriesModel";
import type { Tk_halls } from "../generated/models/Tk_hallsModel";
// import type { Tk_eventcategories } from "../generated/models/Tk_eventcategoriesModel";
// import type { Tk_halls } from "../generated/models/Tk_hallsModel";
import type { Tk_hotelbranchs } from "../generated/models/Tk_hotelbranchsModel";

export interface BranchFormData {
  tk_hotelbranchid: string;
  tk_branchname: string;
  tk_branchcontactnumber: string;
  tk_branchcontactemail: string;
  tk_branchaddress: string;
  tk_branchmanager: object | "";
  _tk_branchmanager_value?: string;

  managers?: Aadusers[]; // Add this line to include the list of managers in the form data

  //   tk_branchmanager: string | Aadusers | null;
}

export interface HallFormData {
  tk_hallid: string;
  tk_hallname: string;
  tk_hallimage: File | string | null;
  tk_hotelbranchname: string;

  //   tk_hallref: string;
  //   tk_hallimage_url: string;
  //   tk_hallimageid: string;
  //   tk_smokingroomname: string;
  //   tk_wifiname: string;
  //   tk_audiovisualname: string;
  //   tk_disableaccessname: string;

  _tk_hotelbranch_value: string;
  tk_hotelbranch: object;

  //tk_branchmanager: object | "";
  //_tk_branchmanager_value?: string;

  branches?: Tk_hotelbranchs[]; // Add this line to include the list of hotel branches in the form data
}

export interface BranchFormData {
  tk_hotelbranchid: string;
  tk_branchname: string;
  tk_branchcontactnumber: string;
  tk_branchcontactemail: string;
  tk_branchaddress: string;
  tk_branchmanager: object | "";
  _tk_branchmanager_value?: string;

  managers?: Aadusers[]; // Add this line to include the list of managers in the form data

  //   tk_branchmanager: string | Aadusers | null;
}

export interface BookingFormData {
  tk_bookingname: string;
  tk_eventcapacity?: number;
  tk_eventdate?: string;
  tk_bookingstatus?: Tk_bookingstk_bookingstatus;

  tk_bookingstatusname?: string;
  tk_customernamename?: string;
  tk_eventcategorytypename?: string;
  tk_hallnamename?: string;
  tk_hotelbranchname?: string;

  // branches: Tk_hotelbranchs[];
  // halls: Tk_halls[];
  customers?: Tk_customers[];
  // eventCategories: Tk_eventcategories[];
}

// export interface BookingNowFormData extends HallsAvailableQueryResults<Omit<HallsAvailableQueryResults,"availabilityStatus">> {}
export interface BookingNowFormData extends HallsAvailableQueryResults {
  // hallName: string;
  // capacity: number;
  // category: string;
  // status: string;
  // tk_bookingname: string;
  bookingStatus: number;
  customer?: Tk_customers;
  customerid?: string;
}

export const STATUS_MAP: Record<number, string> = {
  126790000: "Inquiry",
  126790001: "Pending",
  126790002: "Waitlisted",
  126790003: "Confirmed",
  126790004: "Cancelled",
  126790005: "No Show",
};

export const STATUS_MAP_REV: Record<string, number> = {
  Inquiry: 126790000,
  Pending: 126790001,
  Waitlisted: 126790002,
  Confirmed: 126790003,
  Cancelled: 126790004,
  "No Show": 126790004,
};

export interface HallsAvailableQueryResults {
  bookingId: string;
  hallId: string;
  hallName: string;
  branch: string;
  branchId: string;
  category: string;
  categoryId: string;
  capacity: number;
  bookingCapacity: number;
  eventDate: string;
  bookingName: string;
  availabilityStatus: string;
  statusColor: string;
  bookingStatus: number;
  _tk_customername_value: string;
  totalPendingCountForHall: number;
}

export interface CustomerFormData {
  tk_customeraddress?: string;
  tk_customeremail?: string;
  tk_customerid: string;
  tk_customerref?: string;
  tk_customertelephone?: string;
  tk_firstname: string;
  tk_fullname: string;
  tk_lastname: string;
  tk_title?: Tk_customerstk_title;
}

export interface HallEventTypeFormData {
  tk_eventtypecapacity: number;
  tk_mincapacity: number;
  tk_cancellationfee: number;
  tk_cancellationwindow: number;
  tk_leadtime: number;
  tk_halleventtypeid: string;
  _tk_eventcategorytype_value: string;
  _tk_hallname_value: string;
  tk_hallname?: object;
  tk_eventcategorytype?: object;

  eventCategories: Tk_eventcategories[];
  halls: Tk_halls[];
}

export interface PaginationProps {
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
}

export interface ConfirmedBookingsReportByBranch {
  _tk_hotelbranch_value: string;
  // tk_hotelbranch: object;

  // branches?: Tk_hotelbranchs[];
}

export interface PendingBookingsReportByBranch {
  _tk_hotelbranch_value: string;
  // tk_hotelbranch: object;
}

export const PAGE_NUMBER = 0;
export const ROWS_PER_PAGE = 999;
