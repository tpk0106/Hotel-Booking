import {
  Badge,
  // Badge,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  // useTheme,
  type SxProps,
  type Theme,
} from "@mui/material";

import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import BeenhereIcon from "@mui/icons-material/Beenhere";

import { Tooltip } from "@mui/material";

import {
  DeleteOutlined,
  EditOutlined,

  // FloodRounded,
} from "@mui/icons-material";
import { type ReactNode } from "react";

import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import { STATUS_MAP_REV } from "../model/interfaces";
import type React from "react";

export type ColumnConfig<T> = {
  header: string;
  key: keyof T | "actions"; // "actions" is a special case for buttons
  // New: This function takes the row data and returns a React element
  render?: (row: T) => React.ReactNode;
  // filter: {
  //   name: {
  //     operator: "contains";
  //     value: "";
  //   };
  // };
};

type BaseTableProps<T> = {
  columns: ColumnConfig<T>[];
  data: T[];
  handleEdit?: (row: T) => void | undefined;
  handleDelete?: (row: T) => void | undefined;
  handlePendingBooking?: (row: T) => void | undefined;
  handleConfirmBooking?: (row: T) => void | undefined;
  handleCancelBooking?: (row: T) => void | undefined;
  halls?: any[];
  branches?: any[];
  eventCategories?: any[];
  sx?: SxProps<Theme>; // Allow the parent to pass custom styles
  paginationProps?: {
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

const BaseTable = <T,>({
  columns,
  data,
  handleEdit,
  handleDelete,
  handlePendingBooking,
  handleConfirmBooking,
  handleCancelBooking,
  sx,
  paginationProps,
}: BaseTableProps<T>) => {
  return (
    <TableContainer
      sx={{
        borderRadius: 2,
        border: "1px solid #e0e0e0",
        margin: "0 auto",
        ...sx,
      }}
      // sx={{
      //   maxWidth: "100%", // Ensures it doesn't overflow the screen
      //   width: "80%", // Fixed width
      //   margin: "0 auto", // Centers the table
      //   boxShadow: 3, // Optional: adds a nice MUI shadow
      //   overflowX: "auto", // Enables horizontal scroll if columns are too wide
      // }}
    >
      <Table
        stickyHeader={true}
        sx={{
          "& .MuiTableRow-root": {
            height: "20", // Sets height for both header and body rows
          },
          "& .MuiTableCell-root": {
            padding: "4px 8px", // Tightens up internal spacing globally
          },
          "& td": { fontSize: "0.7rem" },
          "& th": { fontSize: "0.8rem" },
          ":hover": { backgroundColor: "#ffffff", color: "#000" },
          "& tr td": { height: "5" },
          // "&hover": { backgroundColor: "#ffffff", color: "#000" },
          minWidth: 650,
          cursor: "pointer",
          color: "#fff",
          "& tr:nth-of-type(odd)": {
            backgroundColor: "#4B9CD3",
          },
          "& tr:nth-of-type(even)": {
            backgroundColor: "#7CB9E8",
          },
        }}
      >
        <TableHead>
          <TableRow
            sx={{
              minWidth: 650,
              height: "20px",
              color: "secondary.main",
              cursor: "pointer",
              fontSize: 3,
              "&:last-row td th": {
                backgroundColor: "#000000",
              },
              "& .MuiTableRow-root": {
                height: 8,
                border: 4,
                padding: "8px 16px",
              },
              "& .MuiTableCell-root": {
                height: "15px",
              },
              // header
              "&:last-child td, &:last-child th": {
                margin: "auto auto",
                height: "40px",
              },
              // 1. Force a specific height on the row

              // 2. Target all child cells to ensure padding doesn't stretch the row
              "& td, & th": { padding: "0px 16px" },

              // height: 48,
              //   color: "#ffffff",
              //   "& tr:nth-of-type(even)": {
              //     backgroundColor: "#ffffff",
              //     color: "primary.main",
              //     // backgroundColor: "#7CB9E8", // aero blue
              //   },
              // border: "4px solid red",
            }}
          >
            {columns.map((col) => (
              <TableCell
                size="small"
                key={col.header}
                sx={{
                  color: "#ffffff",
                  fontSize: 15,
                  fontWeight: 700,
                  backgroundColor: "#000000",
                }}
                // {...(
                //   <input
                //     type="text"
                //     name=""
                //     value={col.key.toString()}
                //     className="border-2 border-amber-400"
                //   />
                // )}
                // onClick={() => {
                //   data.sort((a, b) => (a > b ? 1 : 0));
                //   console.log("Header clicked !", col);
                // }}
              >
                {col.header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody sx={{ fontSize: 10 }}>
          {data.map((row: any, rowIndex) => {
            // 1. Check booking conflict at the row level (Runs exactly once per row)
            const isCurrentPending =
              row.tk_bookingstatus !== STATUS_MAP_REV["Confirmed"];

            // FIXED: Pull count right from the row payload generated above
            const pendingBookingCount: number =
              row.totalPendingCountForHall || 0;

            // const pendingBookingCount: number = data.reduce(
            //   (count, row: any) =>
            //     row.bookingStatus === STATUS_MAP_REV["Pending"]
            //       ? count + 1
            //       : count,
            //   0,
            // );

            const isHallAlreadyBooked =
              isCurrentPending &&
              data.some(
                (otherRow: any) =>
                  otherRow._tk_hallname_value === row._tk_hallname_value &&
                  otherRow.tk_eventdate === row.tk_eventdate &&
                  otherRow.tk_bookingstatus === STATUS_MAP_REV["Confirmed"],
              );

            return (
              <TableRow
                key={rowIndex}
                sx={{
                  fontSize: 8,
                  "&hover": { backgroundColor: "#FFE4B3", color: "#fff" },
                  "& td": { fontSize: "0.7rem" },
                }}
                hover
              >
                {columns.map((col) => {
                  if (col.key === "actions") {
                    return (
                      <TableCell
                        key="actions"
                        className="flex border1-4 border1-amber-300"
                        sx={{ fontSize: 5 }}
                      >
                        <div className="flex flex-row justify1-between justify-items-start border1-4 border1-green-600">
                          {handleEdit && (
                            <Tooltip title={`Edit`} placement="top" arrow>
                              <IconButton
                                sx={{
                                  // gap: 2,
                                  color: "#000000",
                                  //  width: 25,
                                  // border: 2,
                                  borderColor: "secondary.main",
                                }}
                                className="border-4 border-amber-700 p1-3 bg-1amber-400"
                              >
                                <EditOutlined
                                  onClick={() => handleEdit && handleEdit(row)}
                                />
                              </IconButton>
                            </Tooltip>
                          )}

                          {handleDelete && (
                            <Tooltip title={`Delete`} placement="top" arrow>
                              <IconButton
                                className="border-4 border-amber-700"
                                sx={{
                                  color: "#000000",
                                  borderColor: "secondary.main",
                                }}
                              >
                                <DeleteOutlined
                                  onClick={() =>
                                    handleDelete && handleDelete(row)
                                  }
                                />
                              </IconButton>
                            </Tooltip>
                          )}
                          {handlePendingBooking && (
                            <Tooltip title={`Reserve Me`} placement="top" arrow>
                              <IconButton
                                className="border-4 border-amber-700"
                                sx={{
                                  color: "#000000",
                                  borderColor: "secondary.main",
                                }}
                              >
                                <BeenhereIcon
                                  onClick={() =>
                                    handlePendingBooking &&
                                    handlePendingBooking(row)
                                  }
                                />
                                {/* <Stack spacing={10} direction="column">
                                  <Badge
                                    sx={{
                                      "& .MuiBadge-badge": {
                                        right: -4,
                                        top: 13,
                                        backgroundColor: "#ffa500",
                                        // border: `2px solid ${(theme.vars ?? theme).palette.background.paper}`,
                                        padding: "0 4px",
                                      },
                                    }}
                                    color="primary"
                                    variant="standard"
                                    overlap="circular"
                                    anchorOrigin={{
                                      vertical: "top",
                                      horizontal: "right",
                                    }}
                                    max={999}
                                    badgeContent={
                                      <span>{pendingBookingCount} </span>
                                    }
                                    invisible={
                                      row.availabilityStatus ===
                                        "Fully Available" ||
                                      pendingBookingCount === 0
                                    }
                                  ></Badge>
                                </Stack> */}
                              </IconButton>
                            </Tooltip>
                          )}

                          {handleConfirmBooking && (
                            <Tooltip title={`Confirm Me`} placement="top" arrow>
                              {/* Span wrapper ensures tooltip displays even if button is disabled */}
                              <span>
                                <IconButton
                                  disabled={
                                    (isHallAlreadyBooked &&
                                      (row[
                                        "tk_bookingstatus" as keyof T
                                      ] as ReactNode) ===
                                        STATUS_MAP_REV["Pending"]) ||
                                    (row[
                                      "tk_bookingstatus" as keyof T
                                    ] as ReactNode) ===
                                      STATUS_MAP_REV["Confirmed"] ||
                                    (row[
                                      "tk_bookingstatus" as keyof T
                                    ] as ReactNode) ===
                                      STATUS_MAP_REV["Cancelled"]
                                  }
                                  sx={{
                                    color: "#000000",
                                    borderColor: "secondary.main",
                                  }}
                                >
                                  {/* <div className="flex flex1-col"> */}
                                  <ConfirmationNumberOutlinedIcon
                                    onClick={() =>
                                      handleConfirmBooking &&
                                      handleConfirmBooking(row)
                                    }
                                  />

                                  {/* {isHallAlreadyBooked && (
                                      <div className="text-red-500 font-bold mt-1 text-[40%] w-41.5">
                                        Hall is already booked
                                      </div>
                                    )} */}
                                  {/* </div> */}
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                          {handleCancelBooking && (
                            <Tooltip title={`Cancel Me`} placement="top" arrow>
                              <span>
                                <IconButton
                                  className="border-4 border-amber-700"
                                  sx={{
                                    color: "#000000",
                                    borderColor: "secondary.main",
                                  }}
                                  disabled={
                                    (row[
                                      "tk_bookingstatus" as keyof T
                                    ] as ReactNode) ===
                                    STATUS_MAP_REV["Cancelled"]
                                  }
                                >
                                  <CancelOutlinedIcon
                                    onClick={() =>
                                      handleCancelBooking &&
                                      handleCancelBooking(row)
                                    }
                                  />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                    );
                  }
                  return (
                    <TableCell key={col.key as string}>
                      {col.render
                        ? col.render(row)
                        : ((row[col.key as keyof T] as React.ReactNode) ?? "")}

                      <div className="flex items-center justify-around ml-20">
                        {row[col.key as keyof T] ===
                        "Pending Bookings Exist" ? (
                          <Stack
                          // spacing={5}
                          // direction="column"
                          // className="border-4 border-red-600"
                          >
                            <Badge
                              sx={{
                                "& .MuiBadge-badge": {
                                  right: 2,
                                  top: -22,
                                  backgroundColor: "#ffa500",
                                  // border: `2px solid #fff`,
                                  // padding: "0 4px",
                                },
                              }}
                              color="primary"
                              variant="standard"
                              overlap="circular"
                              anchorOrigin={{
                                vertical: "top",
                                horizontal: "right",
                              }}
                              max={999}
                              badgeContent={<span>{pendingBookingCount} </span>}
                            ></Badge>
                          </Stack>
                        ) : null}
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter
          sx={{
            backgroundColor: "#1976d2", // Custom background
            "& .MuiTableCell-root": {
              color: "#fff", // Text color
              fontWeight: "bold",
              fontSize: "17px",
            },
          }}
        >
          <TableRow sx={{ backgroundColor: "#000000" }}>
            {paginationProps && (
              <TablePagination
                showFirstButton={true}
                showLastButton={true}
                slotProps={{
                  actions: {
                    firstButtonIcon: (
                      <FirstPageIcon key="first" {...paginationProps} />
                    ),
                    lastButtonIcon: (
                      <LastPageIcon key="last" {...paginationProps} />
                    ),
                    nextButtonIcon: (
                      <KeyboardArrowRight key="next" {...paginationProps} />
                    ),
                    previousButtonIcon: (
                      <KeyboardArrowLeft key="previous" {...paginationProps} />
                    ),
                  },
                }}
                rowsPerPageOptions={[5, 10, 25, 50, 100]}
                colSpan={columns.length} // Match dynamic layout span completely
                count={paginationProps?.count} // Controlled server size tracking
                rowsPerPage={paginationProps?.rowsPerPage} // Controlled setting
                page={paginationProps?.page} // Controlled setting
                onPageChange={paginationProps?.onPageChange} // Fires parent engine state
                onRowsPerPageChange={paginationProps?.onRowsPerPageChange} // Fires parent engine size
              />
            )}
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
};

export default BaseTable;

// https://blogs.purecode.ai/blogs/mui-table
