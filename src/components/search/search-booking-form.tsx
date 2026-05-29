import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  ThemeProvider,
  Tooltip,
  Typography,
  type SelectChangeEvent,
} from "@mui/material";

// import { format } from "date-fns";
import type { Tk_hotelbranchs } from "../../generated/models/Tk_hotelbranchsModel";
import {
  useLoadAllBookingForABranch,
  useLoadAllEventCategories,
  useLoadAllHallEventTypes,
  useLoadAllHallsAndBranches,
} from "../../lib/api";

import type { Tk_eventcategories } from "../../generated/models/Tk_eventcategoriesModel";
import type { Tk_bookings } from "../../generated/models/Tk_bookingsModel";
import SearchResults from "./serach-results.component";
import SelectList from "../../lib/select-list.component";
import {
  asideMenuTitleTypographyTheme,
  formErrorMessageDisplayTypographyTheme,
} from "../../lib/themes";
import type { Tk_halleventtypes } from "../../generated/models/Tk_halleventtypesModel";
import type { Tk_halls } from "../../generated/models/Tk_hallsModel";
import {
  PAGE_NUMBER,
  ROWS_PER_PAGE,
  STATUS_MAP_REV,
  type HallsAvailableQueryResults,
} from "../../model/interfaces";
import {
  branchNameLookup,
  eventCategoryNameLookup,
  hallLookupForHall,
  hallLookupHallName,
} from "../../model/lookups";
import { format } from "date-fns";

// import { addDays, format } from "date-fns";
// import { Today } from "@mui/icons-material";

type SearchData = {
  Branch: string | null;
  Capacity: number;
  EventCategory: string | null;
  BookingDate: string | null;
  BookingName: string | null;
};

type SearchProps = {
  handleShowCancel: () => void;
  onSuccess: () => void;
  version: number;
};
const SearchBookingForm = ({
  handleShowCancel,
  onSuccess,
  version,
}: SearchProps) => {
  const [branches, setBranches] = useState<Tk_hotelbranchs[]>([]);
  const [allHalls, setAllHalls] = useState<Tk_halls[]>([]);
  const [branch, setBranch] = useState<string | null>(null);
  const [eventCategories, setEventCategories] = useState<Tk_eventcategories[]>(
    [],
  );
  const [allHallEventTypes, setAllHallEventTypes] = useState<
    Tk_halleventtypes[]
  >([]);
  const [bookingsForAHotel, setBookingsForAHotel] = useState<Tk_bookings[]>([]);

  const [queryResults, setQueryResults] = useState<
    HallsAvailableQueryResults[]
  >([]);

  const [bookingCapacity, setBookingCapacity] = useState<number>(0);
  // const [bookingDate, setBookingDate] = useState<string | null>(null);
  const [searching, setSearching] = useState<boolean>(false);

  const searchFormData: SearchData = {
    Capacity: 0,
    EventCategory: null,
    BookingDate: format(new Date(), "yyyy-MM-dd"),
    Branch: null,
    BookingName: null,
  };
  const [formData, setFormData] = React.useState<SearchData | null>(
    searchFormData,
  );

  const { branchesData, hallsData } = useLoadAllHallsAndBranches(
    PAGE_NUMBER,
    ROWS_PER_PAGE,
  );

  const { eventCategoriesData } = useLoadAllEventCategories();
  const { hallEventTypesData } = useLoadAllHallEventTypes();

  const { bookingsForAHotelData } = useLoadAllBookingForABranch(
    version,
    branch || "",
    PAGE_NUMBER,
    ROWS_PER_PAGE,
  );

  useEffect(() => {
    // If we already have results visible and the data refreshes,
    // re-run the search to move the hall from "Available" to "Pending/Booked"
    if (queryResults.length > 0) {
      setQueryResults([]);
      searchBookings();
      handleSubmit;
    }

    if (branchesData) setBranches(branchesData);
    if (hallsData) setAllHalls(hallsData);
    if (eventCategoriesData) setEventCategories(eventCategoriesData);
    if (hallEventTypesData) setAllHallEventTypes(hallEventTypesData);
    setBookingsForAHotel(bookingsForAHotelData);
    //if (bookingsForAHotelData) setBookingsForAHotel(bookingsForAHotelData);
  }, [
    branchesData,
    hallsData,
    eventCategoriesData,
    bookingsForAHotelData,
    // bookingsData,
    hallEventTypesData,
    branch,
    bookingCapacity,
    formData,
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "Capacity") {
      // console.log("before setting capacity---->", bookingCapacity);
      setBookingCapacity(+value);
      searchBookings();
      setSearching(false);
      // console.log("after setting capacity---->", bookingCapacity);
      // if (
      //   formData?.Capacity! >
      //   queryResults.reduce(
      //     (max, r) => (r.bookingCapacity > max ? r.bookingCapacity : max),
      //     0,
      //   )
      // ) {
      //   console.log("current capacity---->", bookingCapacity);
      //   // setBookingCapacity(
      //   //   queryResults.reduce(
      //   //     (max, r) => (r.bookingCapacity > max ? r.bookingCapacity : max),
      //   //     0,
      //   //   ),
      //   // );
      //   console.log("after setting capacity---->", bookingCapacity);
      //   setSearching(false);
      //  // setBookingCapacity(0);
      //   searchBookings();
      // } else {
      //   searchBookings();
      //   setSearching(false);
      //   // setQueryResults([]);
      // }
    }

    // if (name === "Capacity") {
    //   setSearching(false);
    //   // setQueryResults([]);
    // }
    // if (name === "BookingDate") {
    //   setBookingDate(value);
    //   handleSubmit;
    // }

    // Update the form data state with the new value
    setFormData((prevData: SearchData | null) => {
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

    setSearching(false);

    if (name === "Branch") {
      setBranch(value);

      // searchBookings;
      // bookingsForAHotel.length = 0;
    }

    // if (name === "EventCategory") {
    //   searchBookings();
    //   setSearching(false);
    // }

    // Update the form data state with the new value
    setFormData((prevData: SearchData | null) => {
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

  // search operation
  function searchBookings() {
    if (!formData?.BookingDate || !formData?.Branch) return;

    setSearching(true);

    const allBookingsForThisHotel: Tk_bookings[] = bookingsForAHotel;

    // 1. Get IDs of halls that are CONFIRMED for the selected date
    // format(formData.BookingDate || "", "yyyy-mm-dd")
    const confirmedHallIds = allBookingsForThisHotel
      .filter(
        (b) =>
          b.tk_eventdate === formData.BookingDate &&
          b.tk_bookingstatus === STATUS_MAP_REV["Confirmed"], //126790003,
      )
      .map((b) => b._tk_hallname_value);

    // 2. Get IDs of halls that are PENDING for the selected date

    // let pendingHallIds: (string | undefined)[] = [];
    // if (formData) {
    //   pendingHallIds = allBookingsForThisHotel
    //     .filter(
    //       (b) =>
    //         b.tk_eventdate === formData.BookingDate?.toString() &&
    //         b.tk_bookingstatus === STATUS_MAP_REV["Pending"] &&
    //         b._tk_eventcategorytype_value === formData.EventCategory,
    //     )
    //     .map((b) => b._tk_hallname_value);
    // } else {
    //   pendingHallIds = allBookingsForThisHotel
    //     .filter(
    //       (b) =>
    //         b.tk_eventdate ===
    //           (formData as SearchData).BookingDate?.toString() &&
    //         b.tk_bookingstatus === STATUS_MAP_REV["Pending"],
    //     )
    //     .map((b) => b._tk_hallname_value);
    // }

    // 3. Filter the Hall Event Types by looking up the Branch via the Hall list

    const availableHalls = allHallEventTypes.filter((het) => {
      // --- FIX STARTS HERE ---
      // Find the actual Hall record associated with this event type
      const associatedHall = allHalls.find(
        (h) => h.tk_hallid === het._tk_hallname_value,
      );

      // Check if the Hall belongs to the selected Branch
      const isCorrectBranch =
        associatedHall?._tk_hotelbranch_value === formData.Branch;

      //  console.log("isCorrectBranch : ", isCorrectBranch);
      // --- FIX ENDS HERE ---

      // Filter by Event Category
      // 2. Optional: If EventCategory exists in form, it MUST match.
      // If it's empty, we treat it as "true" (don't filter by category).
      const matchesCategory = !formData.EventCategory
        ? true
        : het._tk_eventcategorytype_value?.toLocaleLowerCase() ===
          formData.EventCategory.trim().toLocaleLowerCase();

      // 3. Mandatory: Capacity
      const hasCapacity =
        (het.tk_eventtypecapacity || 0) >= (formData.Capacity || 0);

      // const hasCapacity = formData.Capacity === 0 ? true : hasCapacity1;
      // const hasCapacity = formData.Capacity
      //   ? (het.tk_eventtypecapacity || 0) >= formData.Capacity
      //   : true;
      // const hasCapacity = true; // Temporarily disable capacity filtering to avoid confusion, will re-enable after testing other filters

      // exclude confirmed hall
      // 4. Mandatory: Date Availability (Calculated outside the loop)
      const isNotConfirmed = !confirmedHallIds.includes(het._tk_hallname_value);

      // pending count filter
      // const pendingCountForThisHall = allBookingsForThisHotel.reduce(
      //   (total, booking) => {
      //     if (
      //       booking._tk_hallname_value === het._tk_hallname_value &&
      //       booking.tk_eventdate === formData.BookingDate &&
      //       booking.tk_bookingstatus === STATUS_MAP_REV["Pending"]
      //     ) {
      //       return total + (booking.tk_eventcapacity || 0);
      //     }
      //     return total;
      //   },
      //   0,
      // );

      // console.log("pendingCountForThisHall", pendingCountForThisHall);

      // const bookingCapacity = allBookingsForThisHotel.reduce(
      //   (total, booking) => {
      //     if (
      //       booking._tk_hallname_value === het._tk_hallname_value &&
      //       booking.tk_eventdate === formData.BookingDate &&
      //       booking.tk_bookingstatus === STATUS_MAP_REV["Pending"]
      //     ) {
      //       return total + (booking.tk_eventcapacity || 0);
      //     }
      //     return total;
      //   },
      //   0,
      // );

      // All conditions must be true
      return (
        isCorrectBranch && matchesCategory && hasCapacity && isNotConfirmed
      );
    });

    // 4. Map to display objects (Handling multiple duplicates safely across categories)
    const results: HallsAvailableQueryResults[] = [];

    availableHalls.forEach((het) => {
      const hallId = het._tk_hallname_value || "";
      const hetCategory = het._tk_eventcategorytype_value || "";

      // Find ALL matching pending bookings for this specific hall
      const associatedPendingBookings = allBookingsForThisHotel.filter((b) => {
        const isTargetHallAndDate =
          b._tk_hallname_value === hallId &&
          b.tk_eventdate === formData.BookingDate?.toString() &&
          b.tk_bookingstatus === STATUS_MAP_REV["Pending"];

        if (!isTargetHallAndDate) return false;

        // --- CRITICAL FIX HERE ---
        if (formData.EventCategory) {
          // If user searched for a specific category, match only that one
          return b._tk_eventcategorytype_value === formData.EventCategory;
        } else {
          // If user left category blank, ONLY match the booking if its category
          // perfectly aligns with the current loop's Hall-Event-Type configuration category.
          return b._tk_eventcategorytype_value === hetCategory;
        }
      });

      // Calculate total pending count across ALL categories for the badge icon display
      const totalPendingForThisHallAllCategories =
        allBookingsForThisHotel.filter(
          (b) =>
            b._tk_hallname_value === hallId &&
            b.tk_eventdate === formData.BookingDate?.toString() &&
            b.tk_bookingstatus === STATUS_MAP_REV["Pending"] &&
            (!formData.EventCategory ||
              b._tk_eventcategorytype_value === formData.EventCategory),
        ).length;

      const hallNameStr = hallLookupHallName(hallsData)[hallId];
      const categoryStr =
        eventCategoryNameLookup(eventCategories)[hetCategory] || "none";
      const branchStr =
        branchNameLookup(branches)[
          hallLookupForHall(hallsData)[hallId]?._tk_hotelbranch_value || ""
        ] || "";
      const branchIdStr =
        hallLookupForHall(hallsData)[hallId]?._tk_hotelbranch_value || "";

      if (associatedPendingBookings.length > 0) {
        // Generate exactly one row per explicit booking row
        associatedPendingBookings.forEach((booking) => {
          results.push({
            hallId: hallId,
            hallName: hallNameStr,
            categoryId: hetCategory,
            category: categoryStr,
            branch: branchStr,
            branchId: branchIdStr,
            capacity: het.tk_eventtypecapacity || 0,
            bookingCapacity:
              (bookingCapacity === 0
                ? het.tk_eventtypecapacity
                : bookingCapacity) || 0,
            // booking.tk_eventcapacity || het.tk_eventtypecapacity || 0,
            eventDate: formData.BookingDate || "",
            bookingName: booking.tk_bookingname || "",
            availabilityStatus: "Pending Bookings Exist",
            statusColor: "orange",
            bookingId: booking.tk_bookingid || "",
            // _tk_customername_value: booking._tk_customername_value || "",
            _tk_customername_value: "",
            bookingStatus: STATUS_MAP_REV["Pending"],
            // The badge receives the total combined hall count (e.g., 4)
            totalPendingCountForHall: totalPendingForThisHallAllCategories,
          });
        });
      } else {
        // Only output a "Fully Available" layout template row if there are absolutely NO
        // bookings for this specific category configuration layout context.
        // However, if the user left category blank, we don't want to show "Fully Available"
        // for Conference if there are total bookings elsewhere stretching the hall capacity.
        const hasAnyBookingsAtAllForHall =
          totalPendingForThisHallAllCategories > 0;

        // If there's an active category filter or the hall is truly pristine, push it through
        if (formData.EventCategory || !hasAnyBookingsAtAllForHall) {
          results.push({
            hallId: hallId,
            hallName: hallNameStr,
            categoryId: hetCategory,
            category: categoryStr,
            branch: branchStr,
            branchId: branchIdStr,
            capacity: het.tk_eventtypecapacity || 0,
            // bookingCapacity: het.tk_eventtypecapacity || 0,
            bookingCapacity:
              (bookingCapacity === 0
                ? het.tk_eventtypecapacity
                : bookingCapacity) || 0,
            eventDate: formData.BookingDate || "",
            bookingName: "",
            availabilityStatus: "Fully Available",
            statusColor: "green",
            bookingId: "",
            _tk_customername_value: "",
            bookingStatus: 0,
            totalPendingCountForHall: 0,
          });
        }
      }
    });

    setQueryResults(results);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData) return;
    searchBookings();
  };

  function handleSearchReset() {
    const txtCapcity = document.getElementById("capacity") as HTMLInputElement;
    txtCapcity.value = "0";
    const txtDate = document.getElementById("bookingdate") as HTMLInputElement;
    const date = new Date().toString();
    txtDate.value = format(date, "yyyy-MM-dd");
    setFormData(searchFormData); // Clears the inputs
    setQueryResults([]); // Clears the table results
    setSearching(false);
  }

  return (
    <div
      id="modal"
      className={`fixed flex-col w-screen inset-0 bg-white opacity-100 
                  bg-opacity-50 mt-2 my-5 z-50 h-full`}
    >
      <div
        className="flex-col opacity-100 mx-auto h-[35%] border-4 
                border-blue-300 rounded-lg shadow-2xl drop1-shadow-blue-700
                  w-[80%] max1-w-md relative bg-white my-1"
      >
        <div className="h-full flex flex-col m-auto w-full">
          <div className="text-center pt-3">
            <ThemeProvider theme={asideMenuTitleTypographyTheme}>
              <Typography color="black">Search/Inquire Halls</Typography>
            </ThemeProvider>
          </div>
          <div className="">
            <div className="m-auto flex flex-wrap overflow-hidden">
              <form
                className="flex flex-col w-full h-auto"
                onSubmit={handleSubmit}
              >
                <div className="h-full">
                  <div className="flex w-full m-auto h-[70%]">
                    <div className="w-1/4 ml-1 h-[60%] mt-3">
                      <SelectList
                        name="Branch"
                        value={formData?.Branch || ""}
                        data={branches}
                        labelKey="tk_branchname" // Tells the component to use this for text
                        valueKey="tk_hotelbranchid" // Tells the component to use this for the ID
                        handleSelectedChange={handleSelectedChange}
                        label="Hotel Branch"
                      />
                    </div>
                    <div className="w-1/4 ml-2 mt-3">
                      <SelectList
                        name="EventCategory"
                        value={formData?.EventCategory || ""}
                        label="Category"
                        data={eventCategories}
                        labelKey="tk_categoryname" // Tells the component to use this for text
                        valueKey="tk_eventcategoryid" // Tells the component to use this for the ID
                        handleSelectedChange={handleSelectedChange}
                      />
                    </div>

                    <div className="w-1/4 mx-2 my-0">
                      <fieldset
                        className="border p-2 rounded-s"
                        style={{ color: "gray" }}
                      >
                        <legend>Capacity</legend>
                        <input
                          id="capacity"
                          type="text"
                          name="Capacity"
                          onChange={handleInputChange}
                          className="w-[80%]"
                          // height={5}
                        />
                      </fieldset>
                    </div>
                    <div className="w-1/4 mr-1">
                      <fieldset
                        className="border mb-4 p-2 rounded-sm"
                        style={{ color: "gray" }}
                      >
                        <legend>Booking Date</legend>
                        <input
                          type="date"
                          id="bookingdate"
                          value={formData?.BookingDate?.toString()}
                          name="BookingDate"
                          onChange={handleInputChange}
                          className="w-[80%]"
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </fieldset>
                    </div>
                  </div>

                  <div className="flex h-[30%]">
                    <div className="m-auto w-[50%] flex justify-around mb-2">
                      <Tooltip
                        sx={
                          {
                            // color: "#000000",
                            // border: "2px #000 solid",
                            // backgroundColor: "#ffffff",
                          }
                        }
                        title={`fill out your criteria and click this button to search, Hotel branch and booking date minimum`}
                        placement="bottom"
                        arrow
                      >
                        <Button
                          type="submit"
                          variant="contained"
                          size="small"
                          color="primary"
                          className="w-[60%] text-center align-middle m-auto mb-2"
                        >
                          Search Availability
                        </Button>
                      </Tooltip>
                    </div>
                    <div className="m-auto w-[50%] flex justify-around mb-2">
                      <Button
                        type="button"
                        variant="contained"
                        size="small"
                        color="primary"
                        className="w-[60%] text-center align-middle m-auto mb-2"
                        onClick={() => {
                          handleSearchReset();
                        }}
                      >
                        Clear Search
                      </Button>
                    </div>
                    <div className="m-auto w-[50%] flex justify-around mb-2">
                      <Button
                        type="button"
                        variant="contained"
                        size="small"
                        color="secondary"
                        onClick={handleShowCancel}
                        className="w-[60%] text-center align-middle m-auto"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="scroll1-auto flex my-2 h-[60%]">
        {queryResults.length > 0 && (
          <SearchResults
            results={queryResults}
            onSuccess={onSuccess}
            version={version}
          />
        )}
        {queryResults.length === 0 &&
          formData?.BookingDate &&
          searching &&
          formData.Capacity &&
          formData.Branch && (
            <ThemeProvider theme={formErrorMessageDisplayTypographyTheme}>
              <Card className="flex m-auto mt-5">
                <CardContent>
                  <Typography sx={{ color: "text.secondary", fontSize: 20 }}>
                    {`Sorry No available halls on ${formData?.Capacity} capacity`}
                  </Typography>
                </CardContent>
              </Card>
            </ThemeProvider>
          )}
        {queryResults.length === 0 &&
          formData?.BookingDate &&
          searching &&
          formData?.Capacity === 0 &&
          formData.Branch && (
            <ThemeProvider theme={formErrorMessageDisplayTypographyTheme}>
              <Card className="flex m-auto mt-5">
                <CardContent>
                  <Typography sx={{ color: "text.secondary", fontSize: 20 }}>
                    {`Sorry No available halls on ${formData?.BookingDate} `}
                  </Typography>
                </CardContent>
              </Card>
            </ThemeProvider>
          )}
      </div>
    </div>
  );
};

export default SearchBookingForm;
