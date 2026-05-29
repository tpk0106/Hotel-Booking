import { useEffect, useState } from "react";
import {
  useLoadAllBookingForABranch,
  useLoadAllCustomers,
  useLoadAllEventCategories,
} from "../lib/api";
import {
  PAGE_NUMBER,
  ROWS_PER_PAGE,
  STATUS_MAP_REV,
  type PendingBookingsReportByBranch,
} from "../model/interfaces";
import {
  Box,
  Card,
  CardContent,
  ThemeProvider,
  Tooltip,
  Typography,
  type SelectChangeEvent,
} from "@mui/material";
import {
  branchNameLookup,
  customerNameLookup,
  eventCategoryNameLookup,
  hallLookupHallName,
} from "../model/lookups";
import { useLoadAllHallsAndBranches } from "../lib/api - Copy";
import type { Tk_halls } from "../generated/models/Tk_hallsModel";
import type { Tk_hotelbranchs } from "../generated/models/Tk_hotelbranchsModel";
import type { Tk_eventcategories } from "../generated/models/Tk_eventcategoriesModel";
import type { Tk_bookings } from "../generated/models/Tk_bookingsModel";
import SelectList from "../lib/select-list.component";
import { format } from "date-fns";
import {
  asideSubMenuTypographyTheme,
  formErrorMessageDisplayTypographyTheme,
  formHeaderTitleTypographyTheme,
} from "../lib/themes";
import type { Tk_customers } from "../generated/models/Tk_customersModel";
import { HallThumbnail } from "../lib/hall-thumbnail.component";
import { Link } from "react-router-dom";

import { CloseRounded } from "@mui/icons-material";

const PendingBookings = () => {
  const [formData, setFormData] =
    useState<PendingBookingsReportByBranch | null>({
      _tk_hotelbranch_value: "",
    });
  const [showReport, setShowReport] = useState<boolean>(false);
  const [halls, setHalls] = useState<Tk_halls[]>([]);
  const [branches, setBranches] = useState<Tk_hotelbranchs[]>([]);
  const [customers, setCustpmers] = useState<Tk_customers[]>([]);

  const [eventCategories, setEventCategories] = useState<Tk_eventcategories[]>(
    [],
  );

  const { hallsData, branchesData } = useLoadAllHallsAndBranches();
  const { eventCategoriesData } = useLoadAllEventCategories();
  const { customersData } = useLoadAllCustomers(PAGE_NUMBER, ROWS_PER_PAGE);

  const [, setAllBookingsForAHotel] = useState<Tk_bookings[]>([]);

  const [
    filteredPendingBookingsForAHotel,
    setFilteredPendingBookingsForAHotel,
  ] = useState<Tk_bookings[]>([]);
  const { bookingsForAHotelData } = useLoadAllBookingForABranch(
    undefined,
    formData?._tk_hotelbranch_value || "",
    PAGE_NUMBER,
    ROWS_PER_PAGE,
  );

  useEffect(() => {
    function loadAllBookingForABranch() {
      setHalls(hallsData);
      setBranches(branchesData);
      setCustpmers(customersData);
      setEventCategories(eventCategoriesData);

      setAllBookingsForAHotel(bookingsForAHotelData);
      setFilteredPendingBookingsForAHotel(
        bookingsForAHotelData
          .filter((b) => b.tk_bookingstatus === STATUS_MAP_REV["Pending"])
          .sort((a, b) => {
            const dateA = new Date(a.tk_eventdate || "").getTime();
            const dateB = new Date(b.tk_eventdate || "").getTime();
            //return dateA - dateB; // Sort in ascending order (earliest first)
            return dateB - dateA; // Sort in descending order (latest first)
          }),
      );
    }
    loadAllBookingForABranch();
  }, [
    bookingsForAHotelData,
    hallsData,
    branchesData,
    formData?._tk_hotelbranch_value,
    customersData,
  ]);

  function handleSelectedChange(e: SelectChangeEvent) {
    const { name, value } = e.target;
    console.log(name);
    console.log(value);

    // Update the form data state with the new value
    setFormData((prevData: PendingBookingsReportByBranch | null) => {
      if (!prevData) {
        console.warn("No current branch data to update");
        return null;
      }

      return {
        ...prevData,
        [name]: value,
      };
    });
    setShowReport(true);
  }

  return (
    <>
      <div className="flex flex-col w-full ">
        {
          <div className="flex justify-end w-full">
            <div className="flex justify-end p-5">
              <Link
                to={"/"}
                className="m-auto rounded-full bg-blue-400 w-7.5 pl-0.5 border-2 inset border-blue-500"
              >
                <Tooltip title="Close">
                  <CloseRounded />
                </Tooltip>
              </Link>
            </div>
          </div>
        }

        <div className="flex flex-col w-[80%] m-auto bg-white my-3">
          <div className="flex flex-col justify-around py-2">
            <div className="flex w-full justify-around my-4">
              <ThemeProvider theme={formHeaderTitleTypographyTheme}>
                <Typography color="black">Pending Bookings</Typography>
              </ThemeProvider>
            </div>
            <div className="flex m-auto w-[50%] border1 border1-black">
              <fieldset
                className={`border1 border1-black mb-4 p-2 m-auto mt-2  w-[80%] `}
              >
                <SelectList
                  name="_tk_hotelbranch_value"
                  value={formData?._tk_hotelbranch_value || ""}
                  label="Hotel Branch"
                  data={branches as Tk_hotelbranchs[]}
                  labelKey="tk_branchname"
                  valueKey="tk_hotelbranchid"
                  handleSelectedChange={handleSelectedChange}
                />
              </fieldset>
            </div>
          </div>
          {filteredPendingBookingsForAHotel.length === 0 && (
            <ThemeProvider theme={formErrorMessageDisplayTypographyTheme}>
              <Card className="flex m-auto my-4">
                <CardContent>
                  <Typography sx={{ color: "text.secondary", fontSize: 20 }}>
                    {`Sorry No Pending bookings for ${branchNameLookup(branches)[formData?._tk_hotelbranch_value || ""]} `}
                  </Typography>
                </CardContent>
              </Card>
            </ThemeProvider>
          )}
        </div>
      </div>

      {showReport && filteredPendingBookingsForAHotel.length > 0 && (
        <div
          className="mx-auto border-4 border-blue-300 rounded-lg shadow-2xl 
       w-[80%] max1-w-md bg-white my-1 flex flex-col "
        >
          <div className="text-center mt-3 bg-gray-400 mx-2">
            <ThemeProvider theme={formHeaderTitleTypographyTheme}>
              <Typography color="black">
                {`Pending Bookings for ${branchNameLookup(branches)[formData?._tk_hotelbranch_value || ""]}`}
              </Typography>
            </ThemeProvider>
          </div>

          <div className="flex flex-wrap flex:0 0 50%">
            {filteredPendingBookingsForAHotel.map((booking) => {
              return (
                <Card
                  className="flex flex-col w-[45%] m-auto my-4 p-4 shadow-xl/30 
                             shadow-blue-800/50 rounded-lg"
                  key={booking.tk_bookingid}
                >
                  <CardContent>
                    <ThemeProvider theme={asideSubMenuTypographyTheme}>
                      <Typography
                        sx={{ color: "text.secondary", fontSize: 20, mb: 1 }}
                      >
                        {
                          hallLookupHallName(halls)[
                            booking._tk_hallname_value || ""
                          ]
                        }
                      </Typography>
                    </ThemeProvider>
                    <Typography
                      sx={{ color: "text.secondary", fontSize: 16, mb: 1 }}
                    >
                      Customer :
                      <span style={{ color: "#ff0000" }}>
                        {
                          customerNameLookup(customers)[
                            booking._tk_customername_value || ""
                          ]
                        }
                      </span>
                    </Typography>
                    <Typography>
                      Description :{booking.tk_bookingname || ""}
                    </Typography>
                    <Typography>
                      <Box
                      // component="section"
                      // sx={{ p: 2, border: "1px dashed grey" }}
                      >
                        Booking Date :
                        {format(booking.tk_eventdate || "", "dd MMM yyyy")}
                      </Box>
                    </Typography>
                    <Typography>
                      <Box
                        component="section"
                        // sx={{ p: 2, border: "1px dashed grey" }}
                      >
                        Hall Capacity: {booking.tk_eventcapacity} persons/head
                      </Box>
                    </Typography>
                    <Typography>
                      <Box
                        component="section"
                        // sx={{ p: 2, border: "1px dashed grey" }}
                      >
                        Event :
                        {
                          eventCategoryNameLookup(eventCategories)[
                            booking._tk_eventcategorytype_value || ""
                          ]
                        }
                      </Box>
                    </Typography>
                    <Typography>
                      <Box
                        component="section"
                        // sx={{ p: 2, border: "1px dashed grey" }}
                      >
                        Photos:
                        <HallThumbnail
                          hallId={booking._tk_hallname_value || ""}
                          version={Date.now().toString()}
                          // width={200}
                        />
                      </Box>
                    </Typography>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default PendingBookings;
