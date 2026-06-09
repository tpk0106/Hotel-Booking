import { useCallback, useEffect, useState } from "react";

import type { Tk_hotelbranchs } from "../generated/models/Tk_hotelbranchsModel";
import type { Tk_halls } from "../generated/models/Tk_hallsModel";
import { Tk_hotelbranchsService } from "../generated/services/Tk_hotelbranchsService";
import { Tk_hallsService } from "../generated/services/Tk_hallsService";
import type { Aadusers } from "../generated/models/AadusersModel";
import { AadusersService } from "../generated/services/AadusersService";
import type { Tk_bookings } from "../generated/models/Tk_bookingsModel";
import {
  Tk_bookingsService,
  Tk_customersService,
  Tk_eventcategoriesService,
  Tk_halleventtypesService,
} from "../generated";
import type { Tk_customers } from "../generated/models/Tk_customersModel";
import type { Tk_eventcategories } from "../generated/models/Tk_eventcategoriesModel";
import type { Tk_halleventtypes } from "../generated/models/Tk_halleventtypesModel";

const ORDER_BY_BRANCH_NAME = "tk_branchname asc";
const ORDER_BY_HALL_NAME = "tk_hallname asc";
// const ORDER_BY_HALL_NAME_ON_HALL_EVENT_TYPE = "tk_hallnamename asc";
const ORDER_BY_DISPLAY_NAME = "displayname asc";
const ORDER_BY_EVENT_DATE = "tk_eventdate desc";
const ORDER_BY_FULLNAME = "tk_fullname asc";
const ORDER_BY_EVENT_CATEGORY_NAME = "tk_categoryname asc";

// token handling utility

function extractSkipToken(result: unknown): string | undefined {
  const payload = result as Record<string, unknown>;
  const dataPayload = payload.data as Record<string, unknown> | undefined;

  const directToken =
    payload.skipToken ?? payload.nextSkipToken ?? payload.continuationToken;
  if (typeof directToken === "string" && directToken.length > 0) {
    return directToken;
  }

  const nestedToken =
    dataPayload?.skipToken ??
    dataPayload?.nextSkipToken ??
    dataPayload?.continuationToken;
  if (typeof nestedToken === "string" && nestedToken.length > 0) {
    return nestedToken;
  }

  const nextLink =
    payload.nextLink ??
    payload.nextPageLink ??
    payload["@odata.nextLink"] ??
    payload["odata.nextLink"] ??
    dataPayload?.nextLink ??
    dataPayload?.nextPageLink ??
    dataPayload?.["@odata.nextLink"] ??
    dataPayload?.["odata.nextLink"];

  if (typeof nextLink !== "string" || nextLink.length === 0) {
    return undefined;
  }

  try {
    const parsedUrl = new URL(nextLink);
    return (
      parsedUrl.searchParams.get("$skiptoken") ??
      parsedUrl.searchParams.get("skiptoken") ??
      undefined
    );
  } catch {
    const match = nextLink.match(/[?&]\$?skiptoken=([^&]+)/i);
    return match ? decodeURIComponent(match[1]) : undefined;
  }
}

//

// hook
function useLoadAllBranchesAndAllManagers(
  page: number = 0,
  rowsPerPage: number = 5,
  query?: string,
  version?: number,
) {
  const [branchesData, setBranchesData] = useState<Tk_hotelbranchs[]>([]);
  const [managersData, setManagersData] = useState<Aadusers[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [totalCount, setTotalCount] = useState<number>(0);

  const [currentToken, setCurrentToken] = useState<string | undefined>(
    undefined,
  );
  const [nextToken, setNextToken] = useState<string | undefined>(undefined);
  const [previousTokens, setPreviousTokens] = useState<
    Array<string | undefined>
  >([]);
  const [lastViewedPage, setLastViewedPage] = useState<number>(0);

  // Reset pagination state when search filter changes
  useEffect(() => {
    setCurrentToken(undefined);
    setNextToken(undefined);
    setPreviousTokens([]);
    setLastViewedPage(0);
  }, [query]);

  // Handle Page Changes (Next / Previous)
  useEffect(() => {
    if (page && page > lastViewedPage) {
      if (nextToken) {
        setPreviousTokens((prev) => [...prev, currentToken]);
        setCurrentToken(nextToken);
        setLastViewedPage(page);
      }
    } else if (page < lastViewedPage) {
      const previousToken = previousTokens[previousTokens.length - 1];
      setPreviousTokens((prev) => prev.slice(0, -1));
      setCurrentToken(previousToken);
      setLastViewedPage(page);
    }
  }, [page, lastViewedPage, nextToken, currentToken, previousTokens]);

  const loadPage = useCallback(
    async (size: number, token: string | undefined) => {
      setLoading(true);
      setError(null);

      try {
        let serverFilter = "";

        if (query && query.trim() !== "") {
          const trimmedQuery = query.trim();
          serverFilter = `tk_branchname eq ${trimmedQuery}`;
        }

        const [branches, managersRes] = await Promise.all([
          Tk_hotelbranchsService.getAll({
            select: [
              "tk_hotelbranchid",
              "tk_branchname",
              "tk_branchcontactnumber",
              "tk_branchcontactemail",
              "tk_branchaddress",
              "_tk_branchmanager_value",
            ],
            filter: serverFilter,
            maxPageSize: size,
            skipToken: token,
            orderBy: [ORDER_BY_BRANCH_NAME],
          }),
          AadusersService.getAll({
            select: ["displayname", "aaduserid"],
            orderBy: [ORDER_BY_DISPLAY_NAME],
          }),
        ]);

        if (branches && branches.success && branches.data) {
          setBranchesData(branches.data as Tk_hotelbranchs[]);
          setNextToken(extractSkipToken(branches));
        }
        // managers data
        if (managersRes && managersRes.success && managersRes.data) {
          setManagersData(managersRes.data as Aadusers[]);
        }
      } catch (err) {
        console.error("Dataverse Pagination Exception: ", err);
        setError("Failed to load records.");
        setBranchesData([]);
        setNextToken(undefined);
      } finally {
        setLoading(false);
      }
    },
    [query],
  );

  // Data Reload Trigger
  useEffect(() => {
    loadPage(rowsPerPage, currentToken);
  }, [rowsPerPage, currentToken, loadPage, version]);

  // Updated Global Count Mirror for accurate Slider totals
  useEffect(() => {
    let serverFilter = "";
    if (query && query.trim() !== "") {
      const trimmedQuery = query.trim();
      serverFilter = `tk_eventdate eq ${trimmedQuery}`;
    }

    async function fetchTotalCount() {
      try {
        const countRes = await Tk_hotelbranchsService.getAll({
          select: ["tk_hotelbranchid"],
          filter: serverFilter,
        });
        if (countRes && countRes.data) {
          setTotalCount(countRes.data.length);
        }
      } catch {
        setTotalCount(999);
      }
    }
    fetchTotalCount();
  }, [query, version]);

  return { branchesData, managersData, totalCount, loading, error };
}

function useLoadAllHallsAndBranches(
  page: number,
  rowsPerPage: number,
  version?: number,
  query?: string,
) {
  const [branchesData, setBranchesData] = useState<Tk_hotelbranchs[]>([]);
  const [hallsData, setHallsData] = useState<Tk_halls[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [totalCount, setTotalCount] = useState<number>(0);

  const [currentToken, setCurrentToken] = useState<string | undefined>(
    undefined,
  );
  const [nextToken, setNextToken] = useState<string | undefined>(undefined);
  const [previousTokens, setPreviousTokens] = useState<
    Array<string | undefined>
  >([]);
  const [lastViewedPage, setLastViewedPage] = useState<number>(0);

  // Reset pagination state when search filter changes
  useEffect(() => {
    setCurrentToken(undefined);
    setNextToken(undefined);
    setPreviousTokens([]);
    setLastViewedPage(0);
  }, [query]);

  // Handle Page Changes (Next / Previous)
  useEffect(() => {
    if (page > lastViewedPage) {
      if (nextToken) {
        setPreviousTokens((prev) => [...prev, currentToken]);
        setCurrentToken(nextToken);
        setLastViewedPage(page);
      }
    } else if (page < lastViewedPage) {
      const previousToken = previousTokens[previousTokens.length - 1];
      setPreviousTokens((prev) => prev.slice(0, -1));
      setCurrentToken(previousToken);
      setLastViewedPage(page);
    }
  }, [page, lastViewedPage, nextToken, currentToken, previousTokens]);

  const loadPage = useCallback(
    async (size: number, token: string | undefined) => {
      setLoading(true);
      setError(null);

      try {
        let serverFilter = "";

        if (query && query.trim() !== "") {
          const trimmedQuery = query.trim();
          serverFilter = `tk_EventCategoryType eq ${trimmedQuery}`;
        }

        const [hallsRes, branchesRes] = await Promise.all([
          Tk_hallsService.getAll({
            select: ["tk_hallname", "tk_hallimage", "_tk_hotelbranch_value"],
            filter: serverFilter,
            maxPageSize: size,
            skipToken: token,
            orderBy: [ORDER_BY_HALL_NAME],
          }),
          Tk_hotelbranchsService.getAll({
            select: ["tk_hotelbranchid", "tk_branchname"],
            orderBy: [ORDER_BY_BRANCH_NAME],
          }),
        ]);

        if (hallsRes && hallsRes.success && hallsRes.data) {
          setHallsData(hallsRes.data as Tk_halls[]);
          setNextToken(extractSkipToken(hallsRes));
        }

        // branches data
        if (branchesRes && branchesRes.success && branchesRes.data) {
          setBranchesData(branchesRes.data as Tk_hotelbranchs[]);
          //console.log("branches in hook :", pageTokens);
        }
      } catch (err) {
        console.error("Dataverse Pagination Exception: ", err);
        setError("Failed to load records.");
        setBranchesData([]);
        setNextToken(undefined);
      } finally {
        setLoading(false);
      }
    },
    [query],
  );

  // Data Reload Trigger
  useEffect(() => {
    rowsPerPage && loadPage(rowsPerPage, currentToken);
  }, [rowsPerPage, currentToken, loadPage, version]);

  // Updated Global Count Mirror for accurate Slider totals
  useEffect(() => {
    let serverFilter = "";
    if (query && query.trim() !== "") {
      const trimmedQuery = query.trim();
      serverFilter = `tk_HallName/tk_hallname eq ${trimmedQuery}`;
    }

    async function fetchTotalCount() {
      try {
        const countRes = await Tk_hallsService.getAll({
          select: ["tk_hallid"],
          filter: serverFilter,
        });
        if (countRes && countRes.data) {
          setTotalCount(countRes.data.length);
        }
      } catch {
        setTotalCount(999);
      }
    }
    fetchTotalCount();
  }, [query, version]);

  return { branchesData, hallsData, totalCount, loading, error };
}

// function useLoadAllHallsAndBranches2(
//   version?: number,
//   query?: string,
//   page: number = 0,
//   rowsPerPage: number = 10,
// ) {
//   const [branchesData, setBranchesData] = useState<Tk_hotelbranchs[]>([]);
//   const [hallsData, setHallsData] = useState<Tk_halls[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [totalCount, setTotalCount] = useState<number>(0);

//   const [currentToken, setCurrentToken] = useState<string | undefined>(
//     undefined,
//   );
//   const [nextToken, setNextToken] = useState<string | undefined>(undefined);
//   const [previousTokens, setPreviousTokens] = useState<
//     Array<string | undefined>
//   >([]);
//   const [lastViewedPage, setLastViewedPage] = useState<number>(0);

//   // Reset pagination state when search filter changes
//   useEffect(() => {
//     setCurrentToken(undefined);
//     setNextToken(undefined);
//     setPreviousTokens([]);
//     setLastViewedPage(0);
//   }, [query]);

//   // Handle Page Changes (Next / Previous)
//   useEffect(() => {
//     if (page > lastViewedPage) {
//       if (nextToken) {
//         setPreviousTokens((prev) => [...prev, currentToken]);
//         setCurrentToken(nextToken);
//         setLastViewedPage(page);
//       }
//     } else if (page < lastViewedPage) {
//       const previousToken = previousTokens[previousTokens.length - 1];
//       setPreviousTokens((prev) => prev.slice(0, -1));
//       setCurrentToken(previousToken);
//       setLastViewedPage(page);
//     }
//   }, [page, lastViewedPage, nextToken, currentToken, previousTokens]);

//   // --- REFACTORED SEVER-SIDE STRING/DATE TYPE ROUTER ---
//   const loadPage = useCallback(
//     async (size: number, token: string | undefined) => {
//       setLoading(true);
//       setError(null);

//       try {
//         let serverFilter = "";

//         if (query && query.trim() !== "") {
//           const trimmedQuery = query.trim();

//           // Mirrored logic from your old code snippet: Is the input non-numeric text?
//           // e.g. checking if it's text (isNumber = true in your old code means text)
//           const isTextString = isNaN(+trimmedQuery.substring(0, 3));

//           if (!isTextString) {
//             // Case 1: Input represents numbers/dates -> Filter by Dataverse Event Date
//             serverFilter = `tk_eventdate eq ${trimmedQuery}`;
//           } else {
//             // Case 2: Input is string text -> Filter by Customer Name column inside the Lookup Relation
//             // NOTE: If your Dataverse lookup relationship schema name differs, change "tk_customerid"
//             // to match the logical navigation property name on your booking entity.
//             serverFilter = `contains(tk_CustomerName/tk_fullname, '${trimmedQuery}')`;
//           }
//         }

//         // console.log(`[SERVER FILTER] Applying OData Rule: "${serverFilter}"`);

//         const [hallsRes, branchesRes] = await Promise.all([
//           Tk_hallsService.getAll({
//             select: ["tk_hallname", "tk_hallimage", "_tk_hotelbranch_value"],
//             filter: serverFilter,
//             maxPageSize: size,
//             skipToken: token,
//             orderBy: [ORDER_BY_HALL_NAME],
//           }),
//           Tk_hotelbranchsService.getAll({
//             select: ["tk_hotelbranchid", "tk_branchname"],
//             orderBy: [ORDER_BY_BRANCH_NAME],
//           }),
//         ]);

//         if (branchesRes && branchesRes.success && branchesRes.data) {
//           setBranchesData(branchesRes.data as Tk_hotelbranchs[]);
//           //console.log("branches in hook :", pageTokens);
//           setNextToken(extractSkipToken(branchesRes));
//         }
//       } catch (err) {
//         console.error("Dataverse Pagination Exception: ", err);
//         setError("Failed to load records.");
//         setBranchesData([]);
//         setNextToken(undefined);
//       } finally {
//         setLoading(false);
//       }
//     },
//     [query],
//   );

//   // Data Reload Trigger
//   useEffect(() => {
//     loadPage(rowsPerPage, currentToken);
//   }, [rowsPerPage, currentToken, loadPage, version]);

//   // Updated Global Count Mirror for accurate Slider totals
//   useEffect(() => {
//     let serverFilter = "";
//     if (query && query.trim() !== "") {
//       const trimmedQuery = query.trim();
//       const isTextString = isNaN(+trimmedQuery.substring(0, 3));
//       serverFilter = !isTextString
//         ? `tk_eventdate eq ${trimmedQuery}`
//         : `contains(tk_customerid/tk_customername, '${trimmedQuery}')`;
//     }

//     async function fetchTotalCount() {
//       try {
//         const countRes = await Tk_bookingsService.getAll({
//           select: ["tk_bookingid"],
//           filter: serverFilter,
//         });
//         if (countRes && countRes.data) {
//           setTotalCount(countRes.data.length);
//         }
//       } catch {
//         setTotalCount(999);
//       }
//     }
//     fetchTotalCount();
//   }, [query, version]);

//   return { hallsData, branchesData, totalCount, loading, error };
// }

// function useLoadAllHallsAndBranches1(
//   page: number = 0,
//   rowsPerPage: number = 10,
//   query?: string,
// ) {
//   const [branchesData, setBranchesData] = useState<Tk_hotelbranchs[]>([]);
//   const [hallsData, setHallsData] = useState<Tk_halls[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [totalCount, setTotalCount] = useState<number>(0);

//   const [pageTokens, setPageTokens] = useState<Record<number, string>>({});
//   const [currentToken, setCurrentToken] = useState<string | undefined>(
//     undefined,
//   );
//   const [nextToken, setNextToken] = useState<string | undefined>(undefined);
//   const [previousTokens, setPreviousTokens] = useState<
//     Array<string | undefined>
//   >([]);
//   const [lastViewedPage, setLastViewedPage] = useState<number>(0);

//   // Reset pagination state when search filter changes
//   useEffect(() => {
//     setCurrentToken(undefined);
//     setNextToken(undefined);
//     setPreviousTokens([]);
//     setLastViewedPage(0);
//   }, [query]);

//   // Handle Page Changes (Next / Previous)
//   useEffect(() => {
//     if (page > lastViewedPage) {
//       if (nextToken) {
//         setPreviousTokens((prev) => [...prev, currentToken]);
//         setCurrentToken(nextToken);
//         setLastViewedPage(page);
//       }
//     } else if (page < lastViewedPage) {
//       const previousToken = previousTokens[previousTokens.length - 1];
//       setPreviousTokens((prev) => prev.slice(0, -1));
//       setCurrentToken(previousToken);
//       setLastViewedPage(page);
//     }
//   }, [page, lastViewedPage, nextToken, currentToken, previousTokens]);

//   useEffect(() => {
//     async function load() {
//       try {
//         setLoading(true);

//         const [hallsRes, branchesRes] = await Promise.all([
//           Tk_hallsService.getAll({
//             select: [
//               "tk_hallname",
//               "tk_hallimage",
//               "_tk_hotelbranch_value",
//               //   ""tk_hallimage_url",
//               //   ""tk_hallimageid",
//               //   ""tk_hotelbranchname",
//               //   ""tk_smokingroomname",
//               //   ""tk_wifiname",
//               //   ""tk_audiovisualname",
//               //   ""tk_disableaccessname",
//             ],
//             orderBy: [ORDER_BY_HALL_NAME],
//           }),
//           Tk_hotelbranchsService.getAll({
//             select: ["tk_hotelbranchid", "tk_branchname"],
//             orderBy: [ORDER_BY_BRANCH_NAME],
//           }),
//         ]);

//         if (
//           branchesRes &&
//           (branchesRes as any).success &&
//           (branchesRes as any).data
//         ) {
//           setBranchesData(branchesRes.data as Tk_hotelbranchs[]);
//           console.log("branches in hook :", pageTokens);
//         } else if (branchesRes.data) {
//           setBranchesData(branchesRes.data as Tk_hotelbranchs[]);
//         }

//         if (hallsRes && (hallsRes as any).success && (hallsRes as any).data) {
//           // console.log("Halls in hook :", hallsRes.data);
//           setHallsData(hallsRes.data as Tk_halls[]);

//           // paging
//           // 1. Directly assign the native server count to your state machine
//           if (hallsRes.count !== undefined) {
//             setTotalCount(hallsRes.count);
//           } else {
//             // Fallback: If Dataverse count isn't returned, dynamically estimate
//             // to keep the Material-UI pagination forward button clickable
//             setTotalCount(
//               hallsRes.data.length === rowsPerPage
//                 ? (page + 2) * rowsPerPage
//                 : (page + 1) * hallsRes.data.length,
//             );
//           }

//           // 2. Cache the skipToken for the NEXT page if Microsoft returned one
//           if (hallsRes.skipToken) {
//             setPageTokens((prev) => ({
//               ...prev,
//               [page + 1]: hallsRes.skipToken!, // Save token for the next page index
//             }));
//           }

//           // end of paging
//         } else if (hallsRes.data) {
//           setHallsData(hallsRes.data as Tk_halls[]);
//           console.log("Halls in hook else :", hallsRes.data);
//         }
//       } catch (err) {
//         console.error(err);
//         setError(err instanceof Error ? err.message : String(err));
//       } finally {
//         setLoading(false);
//       }
//     }
//     load();
//     // return () => {
//     //   mounted = false;
//     // };
//   }, []);
//   return { branchesData, hallsData, totalCount, loading, error };
// }

// load bookings

// load all bookings for a branch

function useLoadAllBookingForABranch(
  version?: number,
  query?: string,
  page: number = 0,
  rowsPerPage: number = 10,
) {
  const [bookingsForAHotelData, setBookingsForAHotelData] = useState<
    Tk_bookings[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);

  const [currentToken, setCurrentToken] = useState<string | undefined>(
    undefined,
  );
  const [nextToken, setNextToken] = useState<string | undefined>(undefined);
  const [previousTokens, setPreviousTokens] = useState<
    Array<string | undefined>
  >([]);
  const [lastViewedPage, setLastViewedPage] = useState<number>(0);

  // Reset pagination state when search filter changes
  useEffect(() => {
    setCurrentToken(undefined);
    setNextToken(undefined);
    setPreviousTokens([]);
    setLastViewedPage(0);
  }, [query]);

  // Handle Page Changes (Next / Previous)
  useEffect(() => {
    if (page > lastViewedPage) {
      if (nextToken) {
        setPreviousTokens((prev) => [...prev, currentToken]);
        setCurrentToken(nextToken);
        setLastViewedPage(page);
      }
    } else if (page < lastViewedPage) {
      const previousToken = previousTokens[previousTokens.length - 1];
      setPreviousTokens((prev) => prev.slice(0, -1));
      setCurrentToken(previousToken);
      setLastViewedPage(page);
    }
  }, [page, lastViewedPage, nextToken, currentToken, previousTokens]);

  // --- REFACTORED SEVER-SIDE STRING/DATE TYPE ROUTER ---
  const loadPage = useCallback(
    async (size: number, token: string | undefined) => {
      setLoading(true);
      setError(null);

      try {
        let serverFilter = "";

        if (query && query.trim() !== "") {
          const trimmedQuery = query.trim();
          // console.log("QUERY : ", query);

          // Mirrored logic from your old code snippet: Is the input non-numeric text?
          // e.g. checking if it's text (isNumber = true in your old code means text)
          // const isTextString = isNaN(+trimmedQuery.substring(0, 3));

          // if (!isTextString) {
          // Case 1: Input represents numbers/dates -> Filter by Dataverse Event Date
          serverFilter = `_tk_hotelbranch_value eq ${trimmedQuery}`;
          // } else {
          //   // Case 2: Input is string text -> Filter by Customer Name column inside the Lookup Relation
          //   // NOTE: If your Dataverse lookup relationship schema name differs, change "tk_customerid"
          //   // to match the logical navigation property name on your booking entity.
          //   serverFilter = `contains(tk_CustomerName/tk_fullname, '${trimmedQuery}')`;
          // }
        }

        // console.log(`[SERVER FILTER] Applying OData Rule: "${serverFilter}"`);

        const result = await Tk_bookingsService.getAll({
          select: [
            "tk_bookingid",
            "tk_bookingname",
            "tk_eventcapacity",
            "tk_eventdate",
            "_tk_hallname_value",
            "_tk_eventcategorytype_value",
            "tk_bookingstatus",
            "_tk_customername_value",
            "_tk_hotelbranch_value",
          ],
          filter: serverFilter,
          orderBy: ["tk_eventdate asc"],
          maxPageSize: size,
          skipToken: token,
        });

        if (result && result.success && result.data) {
          setBookingsForAHotelData(result.data as Tk_bookings[]);
          setNextToken(extractSkipToken(result));
        }
      } catch (err) {
        console.error("Dataverse Pagination Exception: ", err);
        setError("Failed to load records.");
        setBookingsForAHotelData([]);
        setNextToken(undefined);
      } finally {
        setLoading(false);
      }
    },
    [query],
  );

  // Data Reload Trigger
  useEffect(() => {
    loadPage(rowsPerPage, currentToken);
  }, [rowsPerPage, currentToken, loadPage, version]);

  // Updated Global Count Mirror for accurate Slider totals
  useEffect(() => {
    let serverFilter = "";
    if (query && query.trim() !== "") {
      const trimmedQuery = query.trim();
      serverFilter = `_tk_hotelbranch_value eq ${trimmedQuery}`;
    }

    async function fetchTotalCount() {
      try {
        const countRes = await Tk_bookingsService.getAll({
          select: ["tk_bookingid"],
          filter: serverFilter,
        });
        if (countRes && countRes.data) {
          setTotalCount(countRes.data.length);
        }
      } catch {
        setTotalCount(999);
      }
    }
    fetchTotalCount();
  }, [query, version]);

  return { bookingsForAHotelData, totalCount, loading, error };
}

//

function useLoadAllBookings(
  version?: number,
  query?: string,
  page: number = 0,
  rowsPerPage: number = 10,
) {
  const [bookingsData, setBookingsData] = useState<Tk_bookings[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);

  const [currentToken, setCurrentToken] = useState<string | undefined>(
    undefined,
  );
  const [nextToken, setNextToken] = useState<string | undefined>(undefined);
  const [previousTokens, setPreviousTokens] = useState<
    Array<string | undefined>
  >([]);
  const [lastViewedPage, setLastViewedPage] = useState<number>(0);

  // Reset pagination state when search filter changes
  useEffect(() => {
    setCurrentToken(undefined);
    setNextToken(undefined);
    setPreviousTokens([]);
    setLastViewedPage(0);
  }, [query]);

  // Handle Page Changes (Next / Previous)
  useEffect(() => {
    if (page > lastViewedPage) {
      if (nextToken) {
        setPreviousTokens((prev) => [...prev, currentToken]);
        setCurrentToken(nextToken);
        setLastViewedPage(page);
      }
    } else if (page < lastViewedPage) {
      const previousToken = previousTokens[previousTokens.length - 1];
      setPreviousTokens((prev) => prev.slice(0, -1));
      setCurrentToken(previousToken);
      setLastViewedPage(page);
    }
  }, [page, lastViewedPage, nextToken, currentToken, previousTokens]);

  // --- REFACTORED SEVER-SIDE STRING/DATE TYPE ROUTER ---
  const loadPage = useCallback(
    async (size: number, token: string | undefined) => {
      setLoading(true);
      setError(null);

      try {
        let serverFilter = "";

        if (query && query.trim() !== "") {
          const trimmedQuery = query.trim();

          // Mirrored logic from your old code snippet: Is the input non-numeric text?
          // e.g. checking if it's text (isNumber = true in your old code means text)
          const isTextString = isNaN(+trimmedQuery.substring(0, 3));

          if (!isTextString) {
            // Case 1: Input represents numbers/dates -> Filter by Dataverse Event Date
            serverFilter = `tk_eventdate eq ${trimmedQuery}`;
          } else {
            // Case 2: Input is string text -> Filter by Customer Name column inside the Lookup Relation
            // NOTE: If your Dataverse lookup relationship schema name differs, change "tk_customerid"
            // to match the logical navigation property name on your booking entity.
            serverFilter = `contains(tk_CustomerName/tk_fullname, '${trimmedQuery}')`;
          }
        }

        // console.log(`[SERVER FILTER] Applying OData Rule: "${serverFilter}"`);

        const result = await Tk_bookingsService.getAll({
          select: [
            "tk_bookingid",
            "tk_bookingname",
            "tk_eventcapacity",
            "tk_eventdate",
            "_tk_hallname_value",
            "_tk_eventcategorytype_value",
            "tk_bookingstatus",
            "_tk_customername_value",
            "_tk_hotelbranch_value",
          ],
          filter: serverFilter,
          orderBy: ["tk_eventdate desc"],
          maxPageSize: size,
          skipToken: token,
        });

        if (result && result.success && result.data) {
          setBookingsData(result.data as Tk_bookings[]);
          setNextToken(extractSkipToken(result));
        }
      } catch (err) {
        console.error("Dataverse Pagination Exception: ", err);
        setError("Failed to load records.");
        setBookingsData([]);
        setNextToken(undefined);
      } finally {
        setLoading(false);
      }
    },
    [query, version],
  );

  // Data Reload Trigger
  useEffect(() => {
    loadPage(rowsPerPage, currentToken);
  }, [rowsPerPage, currentToken, loadPage, version, totalCount]); // verison and total count dependent added by thusith in order to test booking table refresh issues

  // Updated Global Count Mirror for accurate Slider totals
  useEffect(() => {
    let serverFilter = "";
    if (query && query.trim() !== "") {
      const trimmedQuery = query.trim();
      const isTextString = isNaN(+trimmedQuery.substring(0, 3));
      serverFilter = !isTextString
        ? `tk_eventdate eq ${trimmedQuery}`
        : `contains(tk_customerid/tk_customername, '${trimmedQuery}')`;
    }

    async function fetchTotalCount() {
      try {
        const countRes = await Tk_bookingsService.getAll({
          select: ["tk_bookingid"],
          filter: serverFilter ? serverFilter : undefined,
        });
        if (countRes && countRes.success && countRes.data) {
          // console.log("countRes in count fetch.....", countRes.data.length);
          const total = countRes.data.length;
          // console.log("total :", total);
          setTotalCount(total);
          // console.log("totalcount :", totalCount);
          // console.log("filter.....", serverFilter);

          // console.log(
          //   "running total count in countres.data .....",
          //   countRes.data,
          // );
          // console.log("running total count.....>>>>", totalCount);
        }
      } catch (error) {
        console.log("error in count fetch.....", error);
        setTotalCount(999);
      }
    }
    fetchTotalCount();
  }, [query, version, totalCount]);

  return { bookingsData, totalCount, loading, error };
}

// function useLoadAllBookings_correct(
//   version?: number,
//   query?: string,
//   page: number = 0, // Material-UI page index (0, 1, 2...)
//   rowsPerPage: number = 10,
// ) {
//   const [bookingsData, setBookingsData] = useState<Tk_bookings[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [totalCount, setTotalCount] = useState<number>(0);

//   // --- EXACT STATE SIGNATURE FROM THE WORKING SAMPLE ---
//   const [currentToken, setCurrentToken] = useState<string | undefined>(
//     undefined,
//   );
//   const [nextToken, setNextToken] = useState<string | undefined>(undefined);
//   const [previousTokens, setPreviousTokens] = useState<
//     Array<string | undefined>
//   >([]);
//   const [lastViewedPage, setLastViewedPage] = useState<number>(0);

//   // Reset pagination state when search filter changes
//   useEffect(() => {
//     setCurrentToken(undefined);
//     setNextToken(undefined);
//     setPreviousTokens([]);
//     setLastViewedPage(0);
//   }, [query]);

//   // Handle Material-UI page changes (Next / Previous clicks)
//   useEffect(() => {
//     // Scenario A: User clicked "Next"
//     if (page > lastViewedPage) {
//       if (nextToken) {
//         setPreviousTokens((prev) => [...prev, currentToken]);
//         setCurrentToken(nextToken);
//         setLastViewedPage(page);
//       }
//     }
//     // Scenario B: User clicked "Previous"
//     else if (page < lastViewedPage) {
//       const previousToken = previousTokens[previousTokens.length - 1];
//       setPreviousTokens((prev) => prev.slice(0, -1));
//       setCurrentToken(previousToken);
//       setLastViewedPage(page);
//     }
//   }, [page, lastViewedPage, nextToken, currentToken, previousTokens]);

//   // --- EXACT DATA LOAD METHOD FROM THE WORKING SAMPLE ---
//   const loadPage = useCallback(
//     async (size: number, token: string | undefined) => {
//       setLoading(true);
//       setError(null);

//       try {
//         // Server-side filter string builder
//         let serverFilter = "";
//         if (query && query.trim() !== "") {
//           const trimmedQuery = query.trim();
//           const isDatePattern = /^\d{4}-\d{2}-\d{2}/.test(trimmedQuery);
//           if (isDatePattern) {
//             serverFilter = `tk_eventdate eq ${trimmedQuery}`;
//           } else {
//             serverFilter = `contains(tk_bookingname, '${trimmedQuery}')`;
//           }
//         }

//         console.log(
//           `[ENGINE] Calling getAll with token: "${token || "INITIAL_PAGE_0"}"`,
//         );

//         const result = await Tk_bookingsService.getAll({
//           select: [
//             "tk_bookingid",
//             "tk_bookingname",
//             "tk_eventcapacity",
//             "tk_eventdate",
//             "_tk_hallname_value",
//             "_tk_eventcategorytype_value",
//             "tk_bookingstatus",
//             "_tk_customername_value",
//             "_tk_hotelbranch_value",
//           ],
//           filter: serverFilter,
//           orderBy: ["tk_eventdate asc"],
//           maxPageSize: size,
//           skipToken: token,
//         });

//         if (result && result.success && result.data) {
//           setBookingsData(result.data as Tk_bookings[]);
//           setNextToken(extractSkipToken(result));
//         }
//       } catch (err) {
//         console.error("Dataverse Pagination Exception: ", err);
//         setError("Failed to load records.");
//         setBookingsData([]);
//         setNextToken(undefined);
//       }
//       {
//         setLoading(false);
//       }
//     },
//     [query],
//   );

//   // Trigger data load when page size or current token changes (Exactly like sample code)
//   useEffect(() => {
//     loadPage(rowsPerPage, currentToken);
//   }, [rowsPerPage, currentToken, loadPage, version]);

//   // Global Row Count Logic (Runs once on initial setup to power the Material-UI slider)
//   useEffect(() => {
//     let serverFilter = "";
//     if (query && query.trim() !== "") {
//       const trimmedQuery = query.trim();
//       serverFilter = /^\d{4}-\d{2}-\d{2}/.test(trimmedQuery)
//         ? `tk_eventdate eq ${trimmedQuery}`
//         : `contains(tk_bookingname, '${trimmedQuery}')`;
//     }

//     async function fetchTotalCount() {
//       try {
//         const countRes = await Tk_bookingsService.getAll({
//           select: ["tk_bookingid"],
//           filter: serverFilter,
//         });
//         if (countRes && countRes.data) {
//           setTotalCount(countRes.data.length);
//         }
//       } catch {
//         setTotalCount(999);
//       }
//     }
//     fetchTotalCount();
//   }, [query, version]);

//   return { bookingsData, totalCount, loading, error };
// }

// function useLoadAllBookingsxxxx(
//   version?: number,
//   query?: string,
//   page: number = 0,
//   rowsPerPage: number = 10,
// ) {
//   const [bookingsData, setBookingsData] = useState<Tk_bookings[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [totalCount, setTotalCount] = useState<number>(0);

//   // Cache full nextLink strings returned natively by Dataverse
//   const [pageNextLinks, setPageNextLinks] = useState<Record<number, string>>(
//     {},
//   );

//   // Wipe the pagination cache clear if a user types a new search query
//   useEffect(() => {
//     setPageNextLinks({});
//   }, [query]);

//   useEffect(() => {
//     async function load() {
//       try {
//         setLoading(true);
//         setError(null);

//         // 1. Build the OData query components
//         const selectSide =
//           "$select=tk_bookingid,tk_bookingname,tk_eventcapacity,tk_eventdate,_tk_hallname_value,_tk_eventcategorytype_value,tk_bookingstatus,_tk_customername_value,_tk_hotelbranch_value";
//         const orderSide = "$orderby=tk_eventdate asc";

//         let filterSide = "";
//         if (query && query.trim() !== "") {
//           const trimmed = query.trim();
//           const isDate = /^\d{4}-\d{2}-\d{2}/.test(trimmed);
//           filterSide = isDate
//             ? `&$filter=tk_eventdate eq ${trimmed}`
//             : `&$filter=contains(tk_bookingname, '${trimmed}')`;
//         }

//         // Combine system options string
//         let systemQuery = `?${selectSide}${filterSide}&${orderSide}`;

//         // 2. NATIVE PAGINATION RULE:
//         // If we are on page 1+, use the exact nextLink URL string provided by Dataverse.
//         // This completely bypasses having to pass separate select/filters which breaks tokens.
//         if (page > 0 && pageNextLinks[page]) {
//           // Extract just the query string part from the nextLink URL
//           const linkUrl = pageNextLinks[page];
//           if (linkUrl.includes("?")) {
//             systemQuery = linkUrl.substring(linkUrl.indexOf("?"));
//           }
//         }

//         console.log(
//           `[NATIVE ENGINE] Fetching Page Index ${page} with system query:`,
//           systemQuery,
//         );

//         // Execute using the native Power Apps platform client
//         const response = await (
//           window as any
//         ).Xrm.WebApi.retrieveMultipleRecords(
//           "tk_booking", // Pass your exact Dataverse logical table name here
//           `${systemQuery}&$count=true`, // Explicitly requests the total row count header
//         );

//         if (response && response.entities) {
//           setBookingsData(response.entities as Tk_bookings[]);

//           // 3. Extract Global Count natively via Dataverse's formal count metadata variable
//           if (response["@odata.count"] !== undefined) {
//             setTotalCount(Number(response["@odata.count"]));
//           } else if (page === 0) {
//             // Safe fallback logic if table count reads are restricted for the user role
//             setTotalCount(
//               response.entities.length === rowsPerPage
//                 ? (page + 2) * rowsPerPage
//                 : (page + 1) * response.entities.length,
//             );
//           }

//           // 4. Capture the full native paging link string directly from the root payload
//           const nativeNextLink = response["@odata.nextLink"];
//           if (nativeNextLink) {
//             console.log(
//               `[NATIVE ENGINE] Saved next page pointer link for Page ${page + 1}`,
//             );
//             setPageNextLinks((prev) => ({
//               ...prev,
//               [page + 1]: nativeNextLink,
//             }));
//           }
//         }
//       } catch (err) {
//         console.error("[NATIVE ENGINE] Critical Failure: ", err);
//         setError(err instanceof Error ? err.message : String(err));
//       } finally {
//         setLoading(false);
//       }
//     }

//     load();
//   }, [version, query, page, rowsPerPage]);

//   return { bookingsData, totalCount, loading, error };
// }

// function useLoadAllBookingsxxx(
//   version?: number,
//   query?: string,
//   page: number = 0,
//   rowsPerPage: number = 5,
// ) {
//   const [bookingsData, setBookingsData] = useState<Tk_bookings[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [totalCount, setTotalCount] = useState<number>(0);

//   // Track the skipToken for each page index
//   const [pageTokens, setPageTokens] = useState<Record<number, string>>({});

//   // Reset page tokens whenever the search query completely changes
//   useEffect(() => {
//     setPageTokens({});
//   }, [query]);

//   useEffect(() => {
//     async function load() {
//       try {
//         setLoading(true);
//         setError(null);

//         const currentSkipToken = page > 0 ? pageTokens[page] : undefined;

//         // Server-side filter evaluation
//         let serverFilter = "";
//         if (query && query.trim() !== "") {
//           const trimmedQuery = query.trim();
//           const isDatePattern = /^\d{4}-\d{2}-\d{2}/.test(trimmedQuery);
//           if (isDatePattern) {
//             serverFilter = `tk_eventdate eq ${trimmedQuery}`;
//           } else {
//             serverFilter = `contains(tk_bookingname, '${trimmedQuery}')`;
//           }
//         }

//         // --- THE FIXED SPECIFICATION MATRIX ---
//         // Dataverse demands that structural fields ('select' and 'orderBy')
//         // match exactly on all page tokens, otherwise it drops back to page 1 data.
//         const queryOptions: any = {
//           select: [
//             "tk_bookingid",
//             "tk_bookingname",
//             "tk_eventcapacity",
//             "tk_eventdate",
//             "_tk_hallname_value",
//             "_tk_eventcategorytype_value",
//             "tk_bookingstatus",
//             "_tk_customername_value",
//             "_tk_hotelbranch_value",
//           ],
//           filter: serverFilter,
//           top: rowsPerPage,
//           maxPageSize: rowsPerPage,
//           orderBy: ["tk_eventdate asc"],
//         };

//         // Merging the skipToken cleanly if navigating deep into the index
//         if (currentSkipToken) {
//           queryOptions.skipToken = currentSkipToken;
//         }

//         console.log(
//           `[SERVER ENGINE] Requesting Page Index ${page} with options:`,
//           queryOptions,
//         );
//         const bookingsRes = await Tk_bookingsService.getAll(queryOptions);

//         if (bookingsRes && bookingsRes.success && bookingsRes.data) {
//           setBookingsData(bookingsRes.data as Tk_bookings[]);

//           // 1. Fetch total count strictly once on initial boot setup
//           if (page === 0) {
//             try {
//               const countRes = await Tk_bookingsService.getAll({
//                 select: ["tk_bookingid"],
//                 filter: serverFilter,
//               });
//               if (countRes && countRes.data) {
//                 setTotalCount(countRes.data.length);
//               }
//             } catch (countErr) {
//               console.error(
//                 "Failed background total rows calculation",
//                 countErr,
//               );
//               setTotalCount(999);
//             }
//           }

//           // 2. Cache the skip token for the NEXT page index
//           if (bookingsRes.skipToken) {
//             setPageTokens((prev) => ({
//               ...prev,
//               [page + 1]: bookingsRes.skipToken || "",
//             }));
//           }
//         }
//       } catch (err) {
//         console.error("Server-Side Pagination Failure: ", err);
//         setError(err instanceof Error ? err.message : String(err));
//       } finally {
//         setLoading(false);
//       }
//     }

//     load();
//   }, [version, query, page, rowsPerPage]);

//   return { bookingsData, totalCount, loading, error };
// }

// const useLoadAllBookings3 = (
//   version: number,
//   searchQuery?: string,
//   page: number = 0,
//   rowsPerPage: number = 10,
// ) => {
//   const [bookingsData, setBookingsData] = useState<Tk_bookings[]>([]);
//   const [totalCount, setTotalCount] = useState<number>(0);
//   const [loading, setLoading] = useState<boolean>(false);

//   // Use a Mutable Ref to store page data anchors.
//   // This guarantees state updates don't conflict mid-render pass.
//   const pageFiltersRef = useRef<Record<number, string>>({});

//   // Reset page cache entirely if the search query changes
//   useEffect(() => {
//     pageFiltersRef.current = {};
//   }, [searchQuery]);

//   useEffect(() => {
//     const fetchBookings = async () => {
//       setLoading(true);
//       try {
//         // 1. Base query filter
//         let baseFilter = "tk_bookingid ne null";
//         if (searchQuery && searchQuery.trim() !== "") {
//           baseFilter += ` and contains(tk_eventdate, '${searchQuery.trim()}')`;
//         }

//         // 2. Fetch the filter window rule from our Ref cache
//         let finalFilter = baseFilter;
//         if (page > 0 && pageFiltersRef.current[page]) {
//           finalFilter = `${baseFilter} and ${pageFiltersRef.current[page]}`;
//         }

//         // --- HARD SANITY LOG ---
//         console.warn(
//           `[DATAVERSE ENGINE] Fetching Page INDEX: ${page}. Target Row Limit: ${rowsPerPage}`,
//         );
//         console.log(
//           `[DATAVERSE ENGINE] Active OData Filter String: "${finalFilter}"`,
//         );

//         const bookingRes = await Tk_bookingsService.getAll({
//           select: [
//             "tk_bookingid",
//             "tk_bookingname",
//             "tk_eventcapacity",
//             "tk_eventdate",
//             "_tk_hallname_value",
//             "_tk_eventcategorytype_value",
//             "tk_bookingstatus",
//             "_tk_customername_value",
//             "_tk_hotelbranch_value",
//           ],
//           filter: finalFilter,
//           top: rowsPerPage,
//           maxPageSize: rowsPerPage,
//           orderBy: ["tk_eventdate asc", "tk_bookingid asc"],
//         });

//         if (bookingRes && bookingRes.success && bookingRes.data) {
//           // Visual assurance: Print out a quick table of what came back
//           console.log(
//             `[DATAVERSE ENGINE] Server responded with ${bookingRes.data.length} records for Page ${page}`,
//           );
//           console.table(
//             bookingRes.data.map((r) => ({
//               id: r.tk_bookingid,
//               name: r.tk_bookingname,
//               date: r.tk_eventdate,
//             })),
//           );

//           setBookingsData(bookingRes.data);

//           // 3. Compute and cache the boundary rule for the next index position
//           if (bookingRes.data.length === rowsPerPage) {
//             const lastItem = bookingRes.data[bookingRes.data.length - 1];

//             const nextPageBoundary = `(tk_eventdate gt '${lastItem.tk_eventdate}' or (tk_eventdate eq '${lastItem.tk_eventdate}' and tk_bookingid gt '${lastItem.tk_bookingid}'))`;

//             pageFiltersRef.current[page + 1] = nextPageBoundary;
//             console.log(
//               `[DATAVERSE ENGINE] Cached boundary rule for upcoming Page ${page + 1}`,
//             );
//           }

//           // 4. Calculate total count strictly once on initial boot setup
//           if (page === 0) {
//             try {
//               const countRes = await Tk_bookingsService.getAll({
//                 select: ["tk_bookingid"],
//                 filter: baseFilter,
//               });
//               if (countRes && countRes.data) {
//                 setTotalCount(countRes.data.length);
//               }
//             } catch (e) {
//               console.error("Count aggregation error", e);
//             }
//           }
//         }
//       } catch (err) {
//         console.error(
//           "Dataverse Value-Based Pagination Critical Failure: ",
//           err,
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBookings();
//   }, [version, searchQuery, page, rowsPerPage]); // Hook strictly re-fires whenever these drop changes

//   return { bookingsData, totalCount, loading };
// };

// const useLoadAllBookingsx2 = (
//   version: number,
//   searchQuery?: string,
//   page: number = 0,
//   rowsPerPage: number = 10,
// ) => {
//   const [bookingsData, setBookingsData] = useState<Tk_bookings[]>([]);
//   const [totalCount, setTotalCount] = useState<number>(0);
//   const [loading, setLoading] = useState<boolean>(false);

//   // Cache the anchor information for each page boundary
//   // Instead of a token, we store the boundary filter string for that page
//   const [pageFilters, setPageFilters] = useState<Record<number, string>>({});

//   useEffect(() => {
//     const fetchBookings = async () => {
//       setLoading(true);
//       try {
//         // Base user search filter if present
//         const baseFilter = searchQuery
//           ? `contains(tk_eventdate, '${searchQuery.trim()}')`
//           : "";

//         // Pagination boundary filter calculation
//         let dynamicFilter = baseFilter;
//         if (page > 0 && pageFilters[page]) {
//           dynamicFilter = baseFilter
//             ? `${baseFilter} and ${pageFilters[page]}`
//             : pageFilters[page];
//         }

//         console.log(`Requesting Page ${page} with Filter:`, dynamicFilter);

//         const bookingRes = await Tk_bookingsService.getAll({
//           select: [
//             "tk_bookingid",
//             "tk_bookingname",
//             "tk_eventcapacity",
//             "tk_eventdate",
//             "_tk_hallname_value",
//             "_tk_eventcategorytype_value",
//             "tk_bookingstatus",
//             "_tk_customername_value",
//             "_tk_hotelbranch_value",
//           ],
//           filter: dynamicFilter,
//           top: rowsPerPage,
//           maxPageSize: rowsPerPage,
//           orderBy: ["tk_eventdate asc", "tk_bookingid asc"], // Dual-sorting locks positions down securely
//         });

//         if (bookingRes && bookingRes.success && bookingRes.data) {
//           setBookingsData(bookingRes.data);

//           // 1. Core Total Count Management (Run once on initialization)
//           if (page === 0) {
//             try {
//               const countRes = await Tk_bookingsService.getAll({
//                 select: ["tk_bookingid"],
//                 filter: baseFilter,
//               });
//               if (countRes && countRes.data) {
//                 setTotalCount(countRes.data.length);
//               }
//             } catch (e) {
//               console.error("Failed to fetch exact total count", e);
//             }
//           }

//           // 2. Build the "Next Page" token manually using the last item in the array
//           if (bookingRes.data.length === rowsPerPage) {
//             const lastItem = bookingRes.data[bookingRes.data.length - 1];

//             // This tells Dataverse to look past our current window on the next request
//             const nextPageBoundaryFilter = `(tk_eventdate gt '${lastItem.tk_eventdate}' or (tk_eventdate eq '${lastItem.tk_eventdate}' and tk_bookingid gt '${lastItem.tk_bookingid}'))`;

//             setPageFilters((prev) => ({
//               ...prev,
//               [page + 1]: nextPageBoundaryFilter,
//             }));
//           }
//         }
//       } catch (err) {
//         console.error(
//           "Failed to load records via dynamic filter tracking",
//           err,
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBookings();
//   }, [version, searchQuery, page, rowsPerPage]);

//   return { bookingsData, totalCount, loading };
// };

// const useLoadAllBookingsxx = (
//   version: number,
//   searchQuery?: string,
//   page: number = 0,
//   rowsPerPage: number = 10,
// ) => {
//   const [bookingsData, setBookingsData] = useState<Tk_bookings[]>([]);
//   const [totalCount, setTotalCount] = useState<number>(0);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [pageTokens, setPageTokens] = useState<Record<number, string>>({});

//   useEffect(() => {
//     const fetchBookings = async () => {
//       setLoading(true);
//       try {
//         const currentSkipToken = page > 0 ? pageTokens[page] : undefined;

//         // DEFENSIVE STEP: Overwrite any automated background script parameters
//         // Build a highly explicit condition that leaves no room for empty "eq" insertions
//         let explicitFilter = "tk_bookingid ne null";

//         if (searchQuery && searchQuery.trim() !== "") {
//           explicitFilter += ` and contains(tk_eventdate, '${searchQuery.trim()}')`;
//         }

//         const queryOptions: any = {
//           select: [
//             "tk_bookingid",
//             "tk_bookingname",
//             "tk_eventcapacity",
//             "tk_eventdate",
//             "_tk_hallname_value",
//             "_tk_eventcategorytype_value",
//             "tk_bookingstatus",
//             "_tk_customername_value",
//             "_tk_hotelbranch_value",
//           ],
//           filter: explicitFilter, // This overrides any broken background parameters
//           top: rowsPerPage,
//           maxPageSize: rowsPerPage,
//         };

//         if (currentSkipToken) {
//           queryOptions.skipToken = currentSkipToken;
//         }

//         console.log(
//           "Cleaned Fetch payload heading to Dataverse:",
//           queryOptions,
//         );
//         const bookingRes = await Tk_bookingsService.getAll(queryOptions);

//         if (bookingRes && bookingRes.success && bookingRes.data) {
//           setBookingsData(bookingRes.data);

//           // Deep scan to locate the hidden Microsoft paging token
//           let foundToken = (bookingRes as any).skipToken;
//           if (!foundToken) {
//             const potentialKey = Object.keys(bookingRes).find(
//               (k) =>
//                 k.toLowerCase().includes("link") ||
//                 k.toLowerCase().includes("token"),
//             );
//             if (potentialKey && (bookingRes as any)[potentialKey]) {
//               const linkStr = (bookingRes as any)[potentialKey];
//               foundToken = linkStr.includes("$skiptoken=")
//                 ? new URL(linkStr).searchParams.get("$skiptoken")
//                 : linkStr;
//             }
//           }

//           if (foundToken) {
//             setPageTokens((prev) => ({ ...prev, [page + 1]: foundToken }));
//           }

//           // Calculate overall data limit cleanly on mount
//           if (page === 0) {
//             try {
//               const countRes = await Tk_bookingsService.getAll({
//                 select: ["tk_bookingid"],
//                 filter: explicitFilter,
//               });
//               if (countRes && countRes.data) {
//                 setTotalCount(countRes.data.length);
//               }
//             } catch (countError) {
//               console.error("Total rows query execution failed:", countError);
//             }
//           }
//         }
//       } catch (err) {
//         console.error("Dataverse Interface Failure Exception:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBookings();
//   }, [version, searchQuery, page, rowsPerPage]);

//   return { bookingsData, totalCount, loading };
// };

// const useLoadAllBookings2 = (
//   version: number,
//   searchQuery?: string,
//   page: number = 0,
//   rowsPerPage: number = 10,
// ) => {
//   const [bookingsData, setBookingsData] = useState<Tk_bookings[]>([]);
//   const [totalCount, setTotalCount] = useState<number>(0);
//   const [loading, setLoading] = useState<boolean>(false);

//   // Track the skipToken for each page index
//   const [pageTokens, setPageTokens] = useState<Record<number, string>>({});

//   useEffect(() => {
//     const fetchBookings = async () => {
//       setLoading(true);
//       try {
//         // Page 0 has no skipToken. Page 1 needs pageTokens[1], Page 2 needs pageTokens[2], etc.
//         const currentSkipToken = page > 0 ? pageTokens[page] : undefined;

//         // The Fix: Isolate the Pagination Request To bypass this SDK quirk,
//         // when navigating to any page greater than 0, you should pass only the skipToken,
//         // top, and maxPageSize configuration details. Dataverse already knows your filters and
//         // sorting rules because they are baked right into that token string.

//         let queryOptions: any = {};

//         if (page === 0) {
//           // Page 0 MUST contain the full structural configuration
//           queryOptions = {
//             select: [
//               "tk_bookingid",
//               "tk_bookingname",
//               "tk_eventcapacity",
//               "tk_eventdate",
//               "_tk_hallname_value",
//               "_tk_eventcategorytype_value",
//               "tk_bookingstatus",
//               "_tk_customername_value",
//               "_tk_hotelbranch_value",
//             ],
//             filter: searchQuery
//               ? `contains(tk_eventdate, '${searchQuery.trim()}')`
//               : "",
//             top: rowsPerPage,
//             maxPageSize: rowsPerPage,
//             orderBy: [ORDER_BY_EVENT_DATE],
//           };
//         } else {
//           // Pages 1+ ONLY need the token context and sizes.
//           // Adding filters or selections here often corrupts Dataverse's internal token validation.
//           queryOptions = {
//             top: rowsPerPage,
//             maxPageSize: rowsPerPage,
//             skipToken: currentSkipToken,
//           };
//         }

//         console.log(`Requesting Page ${page} with options:`, queryOptions);

//         const bookingRes = await Tk_bookingsService.getAll(queryOptions);

//         // const bookingRes = await Tk_bookingsService.getAll({
//         //   select: [
//         //     "tk_bookingid",
//         //     "tk_bookingname",
//         //     "tk_eventcapacity",
//         //     "tk_eventdate",
//         //     "_tk_hallname_value",
//         //     "_tk_eventcategorytype_value",
//         //     "tk_bookingstatus",
//         //     "_tk_customername_value",
//         //     "_tk_hotelbranch_value",
//         //   ],
//         //   // filter: searchQuery
//         //   //   ? `contains(tk_eventdate, '${searchQuery.trim()}')`
//         //   //   : "",
//         //   top: rowsPerPage,
//         //   maxPageSize: rowsPerPage,
//         //   // count: true,
//         //   // Pass the token we captured from the previous page's response
//         //   skipToken: currentSkipToken,
//         // });

//         if (bookingRes && bookingRes.success && bookingRes.data) {
//           setBookingsData(bookingRes.data);
//           console.log("skip token after load data : ", bookingRes.skipToken);
//           // console.log("skip token : ", bookingRes.skipToken);
//           // bookingRes.skipToken && setPageTokens(bookingRes.skipToken);

//           // console.log("Current Page data chunk from server: ", bookingRes.data);

//           // 1. If the SDK natively returned the count, use it!
//           if (bookingRes.count !== undefined && bookingRes.count !== null) {
//             setTotalCount(bookingRes.count);
//           }
//           // 2. Fallback: Run a super lightweight count fetch on initial load
//           else if (page === 0) {
//             try {
//               // Fetch ONLY the IDs to keep performance lightning fast
//               const countRes = await Tk_bookingsService.getAll({
//                 select: ["tk_bookingid"],
//                 filter: searchQuery
//                   ? `contains(tk_eventdate, '${searchQuery.trim()}')`
//                   : "",
//               });

//               if (countRes && countRes.data) {
//                 setTotalCount(countRes.data.length); // This will return exactly 89
//               }
//             } catch (e) {
//               console.error("Failed to fetch exact total count", e);
//             }
//           }
//           // 3. For pages > 0, just keep the totalCount we already calculated
//           else {
//             // Do nothing; preserve the totalCount state set during page 0
//           }

//           // // 1. Directly assign the native server count to your state machine
//           // if (bookingRes.count !== undefined && bookingRes.count !== null) {
//           //   console.log("response count ------->: ", bookingRes.count);
//           //   setTotalCount(bookingRes.count);
//           // } else {
//           //   // Fallback: If Dataverse count isn't returned, dynamically estimate
//           //   // to keep the Material-UI pagination forward button clickable
//           //   console.log("NO response count : ", bookingRes.count);
//           //   setTotalCount(
//           //     bookingRes.data.length === rowsPerPage
//           //       ? (page + 2) * rowsPerPage
//           //       : (page + 1) * bookingRes.data.length,
//           //   );
//           //   // setTotalCount(bookingRes.data.length);
//           //   // console.log("count : ", bookingRes.data.length);
//           //   console.log("count in else: ", totalCount);
//           // }

//           // 2. Cache the skipToken for the NEXT page if Microsoft returned one
//           if (bookingRes.skipToken) {
//             console.log("Page tokens existing : ", pageTokens);
//             setPageTokens((prev) => ({
//               ...prev,
//               [page + 1]: bookingRes.skipToken!, // Save token for the next page index
//             }));
//           }
//         }
//       } catch (err) {
//         console.error("Failed to load records from Dataverse SDK", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBookings();
//   }, [version, searchQuery, page, rowsPerPage]);

//   return { bookingsData, totalCount, loading };
// };

// function useLoadAllBookings1(
//   version?: number,
//   query?: string,
//   page?: number,
//   rowsPerPage?: number,
// ) {
//   const [bookingsData, setBookingsData] = useState<Tk_bookings[]>([]);
//   const [customers, setCustomers] = useState<Tk_customers[]>();

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [totalCount, setTotalCount] = useState<number>(0);

//   //  Add state to track the tokens for each page index
//   // const [pageTokens, setPageTokens] = useState<Record<number, string>>({});
//   // Track the skipToken for each page index
//   const [pageTokens, setPageTokens] = useState<Record<number, string>>({});

//   const { customersData } = useLoadAllCustomers();

//   useEffect(() => {
//     async function load() {
//       try {
//         setLoading(true);

//         console.log("rows per page :", rowsPerPage);
//         console.log("page no :", page);
//         console.log("total :", totalCount);

//         setCustomers(customersData);

//         // Determine if we have a cached token for the page we are navigating to
//         // Page 0 never has a skipToken; subsequent pages require the token from the prior response
//         // const res = await Tk_hallsService.getAll();
//         const currentSkipToken =
//           page && page > 0 ? pageTokens[page] : undefined;

//         // setHalls(hallsData);

//         // console.log("trigger HOOK ++++++++++++++++++++++++++++++++++:");
//         // // console.log("version in the HOOK :", new Date().toLocaleDateString());
//         // // console.log("version in the HOOK :", version);
//         // console.log("query passed :", query);
//         // console.log("trigger HOOK ++++++++++++++++++++++++++++++++++:");

//         //  method 1
//         // Treat query entirely as a string. Wrap it securely in straight single quotes.
//         // Dataverse OData demands: field eq 'string_value'
//         // const dateFilter = query ? `tk_eventdate eq '${query}'` : "";

//         // method 2
//         // const rawFilter = query ? `tk_eventdate eq '${query}'` : "";
//         // const dateFilter = rawFilter ? encodeURIComponent(rawFilter) : "";
//         // This safely transforms it to: tk_eventdate%20eq%20%272026-09-30%27
//         //

//         //  method 3
//         // Replace 'eq' with 'contains' string manipulation
//         // const dateFilter = query ? `contains(tk_eventdate, '${query}')` : "";

//         // method 4
//         // Replace 'eq' with 'contains' string manipulation
//         // const dateFilter = query ? `contains(tk_eventdate, '${query}')` : "";

//         //  method 5
//         // Using contains to bypass hidden string spacing issues + URL Encoding security
//         // const ODataString = query
//         //   ? `contains(tk_eventdate, '${query.trim()}')`
//         //   : "";
//         // const dateFilter = ODataString ? encodeURIComponent(ODataString) : "";
//         // console.log("NET REQ FILTER => :", ODataString);

//         // method 6
//         // Returns records where the typed string exists anywhere inside the column text
//         // const dateFilter = query
//         //   ? encodeURIComponent(`indexof(tk_eventdate, '${query.trim()}') gt -1`)
//         //   : "";

//         //  method 7
//         // 1. DO NOT use encodeURIComponent here. Let Tk_bookingsService handle it.
//         // 2. Note the capital 'O' in indexOf
//         // const dateFilter = query
//         //   ? `indexOf(tk_eventdate, '${query.trim()}') gt -1`
//         //   : "";

//         // console.log("Sending raw OData filter to service:", dateFilter);

//         // console.log("EXECUTE ODATA FILTER =>:", dateFilter);

//         // if date is date type use below
//         // Convert query input to proper Dataverse ISO date format (YYYY-MM-DD)
//         // let dateFilter = "";
//         // if (query) {
//         //   const parsedDate = new Date(query);
//         //   console.log("time : ", parsedDate.getTime());
//         //   console.log("isNAN: ", isNaN(parsedDate.getTime()));
//         //   if (!isNaN(parsedDate.getTime())) {
//         //     const isoDate = parsedDate.toISOString().split("T")[0]; // Yields "2026-05-15"
//         //     console.log("ISO Date:", isoDate);
//         //     dateFilter = `tk_eventdate eq '${isoDate}'`; // Note the single quotes required by OData
//         //   }
//         // }

//         // Standard server-side parameters formulas:
//         // top = how many records to fetch (rowsPerPage)
//         // skip = offset calculations (page * rowsPerPage)

//         // const res = await Tk_bookingsService.getAll();
//         // console.log("res :", res);
//         // setTotalCount((res && res.success && res.data && res.data.length) || 0);
//         // setTotalCount(res.count || 0);

//         const bookingsRes = await Tk_bookingsService.getAll({
//           select: [
//             "tk_bookingid",
//             "tk_bookingname",
//             "tk_eventcapacity",
//             "tk_eventdate",
//             "_tk_hallname_value",
//             "_tk_eventcategorytype_value",
//             "tk_bookingstatus",
//             "tk_bookingname",
//             "_tk_customername_value",
//             "_tk_hotelbranch_value",
//           ],
//           filter: "",
//           top: rowsPerPage,
//           maxPageSize: rowsPerPage,
//           //  skip: page && rowsPerPage && (page || 0 * rowsPerPage || 0),
//           // Use skipToken INSTEAD of skip
//           skipToken: currentSkipToken,
//           orderBy: [ORDER_BY_EVENT_DATE],
//         });

//         if (
//           bookingsRes &&
//           (bookingsRes as any).success &&
//           (bookingsRes as any).data
//         ) {
//           setBookingsData(bookingsRes.data as Tk_bookings[]);
//           // setTotalCount(bookingsRes.count || 0);

//           // 1. Capture the Total Server Count (if your service exposes it)
//           // Ensure your Service captures the '@odata.count' metadata property from the Dataverse JSON response
//           if (bookingsRes.count !== undefined) {
//             setTotalCount(bookingsRes.count);
//           } else if (page === 0) {
//             // Fallback if your middleware doesn't parse odata.count:
//             // Set count to a larger pool or dynamic evaluation to keep pagination active
//             setTotalCount(
//               bookingsRes.data?.length === rowsPerPage
//                 ? (page + 2) * rowsPerPage
//                 : (page + 1) * bookingsRes.data.length,
//             );
//           }

//           // 2. Cache the token for the NEXT page if it exists
//           // Dataverse returns this inside the response as '@odata.nextLink' or a custom 'skipToken' string
//           if (bookingsRes.skipToken && page) {
//             setPageTokens((prev) => ({
//               ...prev,
//               [page + 1]: bookingsRes.skipToken || "",
//             }));
//           }

//           console.log("bookingsRes", bookingsRes.data);
//           console.log("bookingsRes COUNT :", bookingsRes.count);

//           const rawData = bookingsRes.data as Tk_bookings[];
//           let isNumber = false;
//           isNumber = (query && isNaN(+query.substring(0, 3))) || false;

//           if (query && query.trim() !== "") {
//             //
//             // Frontend filter handles varied spacings or hidden characters
//             let bookingDate: string;
//             let customerName: string;
//             // let hallName: string;
//             const filtered = rawData.filter((booking) => {
//               switch (isNumber) {
//                 case false:
//                   bookingDate = String(booking.tk_eventdate).trim();
//                   return bookingDate.includes(query.trim());

//                 case true:
//                   customerName =
//                     (customers &&
//                       customerNameLookup(customers)[
//                         booking._tk_customername_value || ""
//                       ]) ||
//                     "";

//                   return (
//                     customerName &&
//                     customerName
//                       .toLocaleLowerCase()
//                       .includes(query.toLocaleLowerCase().trim())
//                   );

//                 // both custone rname and hall name try
//                 // customerName =
//                 //   (customers &&
//                 //     customerNameLookup(customers)[
//                 //       booking._tk_customername_value || ""
//                 //     ]) ||
//                 //   "";
//                 // let result =
//                 //   customerName &&
//                 //   customerName
//                 //     .toLocaleLowerCase()
//                 //     .includes(query.toLocaleLowerCase().trim());

//                 // hallName =
//                 //   (halls &&
//                 //     hallLookup(halls)[booking._tk_hallname_value || ""]) ||
//                 //   "";

//                 // result = hallName
//                 //   .toLocaleLowerCase()
//                 //   .includes(query.toLocaleLowerCase().trim());

//                 // return result;
//               }
//             });
//             setBookingsData(filtered);
//           } else {
//             console.log("bookingsRes else", bookingsRes.data);
//             setBookingsData(rawData);
//           }
//         } else if (bookingsRes.data) {
//           setBookingsData(bookingsRes.data as Tk_bookings[]);
//         }
//       } catch (err) {
//         console.error(err);
//         setError(err instanceof Error ? err.message : String(err));
//       } finally {
//         setLoading(false);
//       }

//       //  method 8
//       // try {
//       //   // 1. Build the explicit system query options string
//       //   const selectQuery =
//       //     "?$select=tk_bookingid,tk_bookingname,tk_eventcapacity,tk_eventdate,_tk_hallname_value,_tk_eventcategorytype_value,tk_bookingstatus,_tk_customername_value,_tk_hotelbranch_value";

//       //   // Dataverse standard string function requires lowercase 'contains'
//       //   const filterQuery = query
//       //     ? `&$filter=contains(tk_eventdate, '${query.trim()}')`
//       //     : "";

//       //   const orderQuery = "&$orderby=tk_eventdate asc";

//       //   const fullSystemQuery = `${selectQuery}${filterQuery}${orderQuery}`;

//       //   // 2. Execute via the native Power Apps Web API engine
//       //   // Note: Replace 'tk_bookingses' with your exact logical collection name if different
//       //   const response = await (
//       //     window as any
//       //   ).Xrm.WebApi.retrieveMultipleRecords("tk_bookings", fullSystemQuery);

//       //   if (response && response.entities) {
//       //     setBookingsData(response.entities as Tk_bookings[]);
//       //   }
//       // } catch (err) {
//       //   console.error("Native Dataverse API Error: ", err);
//       //   setError(err instanceof Error ? err.message : String(err));
//       // } finally {
//       //   setLoading(false);
//       // }
//     }
//     load();
//     // return () => {
//     //   mounted = false;
//     // };
//   }, [version, query, page, rowsPerPage]);

//   return { bookingsData, totalCount, loading, error };
// }

function useLoadAllCustomers(
  page: number,
  rowsPerPage: number,
  version?: number,
  query?: string,
) {
  const [customersData, setCustomersData] = useState<Tk_customers[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [totalCount, setTotalCount] = useState<number>(0);

  const [currentToken, setCurrentToken] = useState<string | undefined>(
    undefined,
  );
  const [nextToken, setNextToken] = useState<string | undefined>(undefined);
  const [previousTokens, setPreviousTokens] = useState<
    Array<string | undefined>
  >([]);
  const [lastViewedPage, setLastViewedPage] = useState<number>(0);

  // Reset pagination state when search filter changes
  useEffect(() => {
    setCurrentToken(undefined);
    setNextToken(undefined);
    setPreviousTokens([]);
    setLastViewedPage(0);
  }, [query]);

  // Handle Page Changes (Next / Previous)
  useEffect(() => {
    if (page > lastViewedPage) {
      if (nextToken) {
        setPreviousTokens((prev) => [...prev, currentToken]);
        setCurrentToken(nextToken);
        setLastViewedPage(page);
      }
    } else if (page < lastViewedPage) {
      const previousToken = previousTokens[previousTokens.length - 1];
      setPreviousTokens((prev) => prev.slice(0, -1));
      setCurrentToken(previousToken);
      setLastViewedPage(page);
    }
  }, [page, lastViewedPage, nextToken, currentToken, previousTokens]);

  const loadPage = useCallback(
    async (size: number, token: string | undefined) => {
      setLoading(true);
      setError(null);

      try {
        let serverFilter = "";

        if (query && query.trim() !== "") {
          const trimmedQuery = query.trim();
          serverFilter = `tk_EventCategoryType eq ${trimmedQuery}`;
        }

        const [customersRes] = await Promise.all([
          Tk_customersService.getAll({
            select: [
              "tk_customerid",
              "tk_firstname",
              "tk_lastname",
              "tk_fullname",
              "tk_customeremail",
              "tk_customerref",
              "tk_customeraddress",
              "tk_customertelephone",
            ],
            filter: serverFilter,
            maxPageSize: size,
            skipToken: token,
            orderBy: [ORDER_BY_FULLNAME],
          }),
        ]);

        if (
          customersRes &&
          (customersRes as any).success &&
          (customersRes as any).data
        ) {
          setCustomersData(customersRes.data as Tk_customers[]);
        } else if (customersRes.data) {
          setCustomersData(customersRes.data as Tk_customers[]);
        }
      } catch (err) {
        console.error("Dataverse Pagination Exception: ", err);
        setError("Failed to load records.");
        setCustomersData([]);
        setNextToken(undefined);
      } finally {
        setLoading(false);
      }
    },
    [query],
  );

  // Data Reload Trigger
  useEffect(() => {
    rowsPerPage && loadPage(rowsPerPage, currentToken);
  }, [rowsPerPage, currentToken, loadPage, version]);

  // Updated Global Count Mirror for accurate Slider totals
  useEffect(() => {
    let serverFilter = "";
    if (query && query.trim() !== "") {
      const trimmedQuery = query.trim();
      serverFilter = `tk_fullname eq ${trimmedQuery}`;
    }

    async function fetchTotalCount() {
      try {
        const countRes = await Tk_customersService.getAll({
          select: ["tk_customerid"],
          filter: serverFilter,
        });
        if (countRes && countRes.data) {
          setTotalCount(countRes.data.length);
        }
      } catch {
        setTotalCount(999);
      }
    }
    fetchTotalCount();
  }, [query, version]);

  return { customersData, totalCount, loading, error };
}

// // function useLoadAllCustomers1() {
// //   const [customersData, setCustomersData] = useState<Tk_customers[]>([]);
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState<string | null>(null);

// //   useEffect(() => {
// //     async function load() {
// //       try {
// //         setLoading(true);

// //         const [customersRes] = await Promise.all([
// //           Tk_customersService.getAll({
// //             select: [
// //               "tk_customerid",
// //               "tk_firstname",
// //               "tk_lastname",
// //               "tk_fullname",
// //               "tk_customeremail",
// //               "tk_customerref",
// //               "tk_customeraddress",
// //               "tk_customertelephone",
// //             ],
// //             orderBy: [ORDER_BY_FULLNAME],
// //           }),
// //         ]);

// //         if (
// //           customersRes &&
// //           (customersRes as any).success &&
// //           (customersRes as any).data
// //         ) {
// //           setCustomersData(customersRes.data as Tk_customers[]);
// //         } else if (customersRes.data) {
// //           setCustomersData(customersRes.data as Tk_customers[]);
// //         }
// //       } catch (err) {
// //         console.error(err);
// //         setError(err instanceof Error ? err.message : String(err));
// //       } finally {
// //         setLoading(false);
// //       }
// //     }
// //     load();
// //     // return () => {
// //     //   mounted = false;
// //     // };
// //   }, []);

//   return { customersData, loading, error };
// }

function useLoadAllEventCategories() {
  const [eventCategoriesData, setEventCategoriesData] = useState<
    Tk_eventcategories[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const [EventCategoriesRes] = await Promise.all([
          Tk_eventcategoriesService.getAll({
            select: [
              "tk_eventcategoryid",
              "tk_categoryname",
              "tk_categorydescription",
            ],
            orderBy: [ORDER_BY_EVENT_CATEGORY_NAME],
          }),
        ]);

        if (
          EventCategoriesRes &&
          (EventCategoriesRes as any).success &&
          (EventCategoriesRes as any).data
        ) {
          setEventCategoriesData(
            EventCategoriesRes.data as Tk_eventcategories[],
          );
        } else if (EventCategoriesRes.data) {
          setEventCategoriesData(
            EventCategoriesRes.data as Tk_eventcategories[],
          );
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }
    load();
    // return () => {
    //   mounted = false;
    // };
  }, []);

  return { eventCategoriesData, loading, error };
}

function useLoadAllBranches() {
  const [branchesData, setbranchesData] = useState<Tk_hotelbranchs[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const [branchesRes] = await Promise.all([
          Tk_hotelbranchsService.getAll({
            select: ["tk_hotelbranchid", "tk_branchname"],
            orderBy: [ORDER_BY_BRANCH_NAME],
          }),
        ]);

        if (
          branchesRes &&
          (branchesRes as any).success &&
          (branchesRes as any).data
        ) {
          setbranchesData(branchesRes.data as Tk_hotelbranchs[]);
        } else if (branchesRes.data) {
          setbranchesData(branchesRes.data as Tk_hotelbranchs[]);
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }
    load();
    // return () => {
    //   mounted = false;
    // };
  }, []);

  return { branchesData, loading, error };
}

function useLoadAllPendingBookingsForABranch() {
  const [pendingBookingsData, setPendingBookingsData] = useState<Tk_bookings[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const [pendingBookingRes] = await Promise.all([
          Tk_bookingsService.getAll({
            select: [
              "tk_bookingref",
              "tk_bookingstatus",
              "tk_eventdate",
              "tk_eventcapacity",
              "_tk_hallname_value",
              "_tk_hotelbranch_value",
              "_tk_eventcategorytype_value",
            ],
            // filter: `$["tk_hotelbranchname"]=${},
            orderBy: [ORDER_BY_EVENT_DATE],
          }),
        ]);

        if (
          pendingBookingRes &&
          (pendingBookingRes as any).success &&
          (pendingBookingRes as any).data
        ) {
          setPendingBookingsData(pendingBookingRes.data as Tk_bookings[]);
        } else if (pendingBookingRes.data) {
          setPendingBookingsData(pendingBookingRes.data as Tk_bookings[]);
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }
    load();
    // return () => {
    //   mounted = false;
    // };
  }, []);

  return { pendingBookingsData, loading, error };
}

function useLoadAllHallEventTypes() {
  const [hallEventTypesData, setHallEventTypesData] = useState<
    Tk_halleventtypes[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const [hallEventTypesRes] = await Promise.all([
          Tk_halleventtypesService.getAll({
            select: [
              "tk_halleventtypeid",
              "tk_halleventtyperef",
              "tk_eventtypecapacity",
              "tk_mincapacity",
              "tk_surcharge",
              "tk_cancellationwindow",
              "tk_cancellationfee",
              "tk_leadtime",
              "_tk_eventcategorytype_value",
              "_tk_hallname_value",
            ],
          }),
        ]);

        if (
          hallEventTypesRes &&
          (hallEventTypesRes as any).success &&
          (hallEventTypesRes as any).data
        ) {
          setHallEventTypesData(hallEventTypesRes.data as Tk_halleventtypes[]);
        } else if (hallEventTypesRes.data) {
          setHallEventTypesData(hallEventTypesRes.data as Tk_halleventtypes[]);
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }
    load();
    // return () => {
    //   mounted = false;
    // };
  }, []);

  return { hallEventTypesData, loading, error };
}

function useLoadAllHallEventTypesAndEventCategories(
  page: number = 0,
  rowsPerPage: number = 5,
  version?: number,
  query?: string,
) {
  const [hallEventTypesData, setHallEventTypesData] = useState<
    Tk_halleventtypes[]
  >([]);
  const [eventCategoriesData, setEventCategoriesData] = useState<
    Tk_eventcategories[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [totalCount, setTotalCount] = useState<number>(0);

  const [currentToken, setCurrentToken] = useState<string | undefined>(
    undefined,
  );
  const [nextToken, setNextToken] = useState<string | undefined>(undefined);
  const [previousTokens, setPreviousTokens] = useState<
    Array<string | undefined>
  >([]);
  const [lastViewedPage, setLastViewedPage] = useState<number>(0);

  // Reset pagination state when search filter changes
  useEffect(() => {
    setCurrentToken(undefined);
    setNextToken(undefined);
    setPreviousTokens([]);
    setLastViewedPage(0);
  }, [query]);

  // Handle Page Changes (Next / Previous)
  useEffect(() => {
    if (page > lastViewedPage) {
      if (nextToken) {
        setPreviousTokens((prev) => [...prev, currentToken]);
        setCurrentToken(nextToken);
        setLastViewedPage(page);
      }
    } else if (page < lastViewedPage) {
      const previousToken = previousTokens[previousTokens.length - 1];
      setPreviousTokens((prev) => prev.slice(0, -1));
      setCurrentToken(previousToken);
      setLastViewedPage(page);
    }
  }, [page, lastViewedPage, nextToken, currentToken, previousTokens]);

  const loadPage = useCallback(
    async (size: number, token: string | undefined) => {
      setLoading(true);
      setError(null);

      try {
        let serverFilter = "";

        if (query && query.trim() !== "") {
          const trimmedQuery = query.trim();
          serverFilter = `tk_branchname eq ${trimmedQuery}`;
        }

        const [hallEventTypesRes, eventCategoriesRes] = await Promise.all([
          Tk_halleventtypesService.getAll({
            select: [
              "tk_halleventtypeid",
              "tk_eventtypecapacity",
              "tk_mincapacity",
              "tk_leadtime",
              "tk_cancellationwindow",
              "tk_cancellationfee",
              "tk_surcharge",
              "_tk_eventcategorytype_value",
              "_tk_hallname_value",
            ],
            filter: serverFilter,
            maxPageSize: size,
            skipToken: token,
            // orderBy: [ORDER_BY_EVENT_CATEGORY_NAME],
          }),
          Tk_eventcategoriesService.getAll({
            select: [
              "tk_categorydescription",
              "tk_categoryname",
              "tk_categoryref",
              "tk_eventcategoryid",
            ],
            // orderBy: [ORDER_BY_DISPLAY_NAME],
          }),
        ]);

        if (
          hallEventTypesRes &&
          (hallEventTypesRes as any).success &&
          (hallEventTypesRes as any).data
        ) {
          setHallEventTypesData(hallEventTypesRes.data as Tk_halleventtypes[]);
          setNextToken(extractSkipToken(hallEventTypesRes));
        } else if (hallEventTypesRes.data) {
          setHallEventTypesData(hallEventTypesRes.data as Tk_halleventtypes[]);
        }

        if (
          eventCategoriesRes &&
          (eventCategoriesRes as any).success &&
          (eventCategoriesRes as any).data
        ) {
          setEventCategoriesData(
            eventCategoriesRes.data as Tk_eventcategories[],
          );
        } else if (eventCategoriesRes.data) {
          setEventCategoriesData(
            eventCategoriesRes.data as Tk_eventcategories[],
          );
        }
      } catch (err) {
        console.error("Dataverse Pagination Exception: ", err);
        setError("Failed to load records.");
        setHallEventTypesData([]);
        setNextToken(undefined);
      } finally {
        setLoading(false);
      }
    },
    [query],
  );

  // Data Reload Trigger
  useEffect(() => {
    loadPage(rowsPerPage, currentToken);
  }, [rowsPerPage, currentToken, loadPage, version]);

  // Updated Global Count Mirror for accurate Slider totals
  useEffect(() => {
    let serverFilter = "";
    if (query && query.trim() !== "") {
      const trimmedQuery = query.trim();
      serverFilter = `tk_hallname eq ${trimmedQuery}`;
    }

    async function fetchTotalCount() {
      try {
        const countRes = await Tk_halleventtypesService.getAll({
          select: ["tk_halleventtypeid"],
          filter: serverFilter,
        });
        if (countRes && countRes.data) {
          setTotalCount(countRes.data.length);
        }
      } catch {
        setTotalCount(999);
      }
    }
    fetchTotalCount();
  }, [query, version]);

  return {
    hallEventTypesData,
    eventCategoriesData,
    totalCount,
    loading,
    error,
  };
}

// function useLoadAllHallEventTypesAndEventCategories1() {
//   const [hallEventTypesData, setHallEventTypesData] = useState<
//     Tk_halleventtypes[]
//   >([]);
//   const [eventCategoriesData, setEventCategoriesData] = useState<
//     Tk_eventcategories[]
//   >([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     async function load() {
//       try {
//         setLoading(true);

//         const [hallEventTypesRes, eventCategoriesRes] = await Promise.all([
//           Tk_halleventtypesService.getAll({
//             select: [
//               "tk_halleventtypeid",
//               "tk_eventtypecapacity",
//               "_tk_eventcategorytype_value",
//               "_tk_hallname_value",
//               // "tk_hallname",
//               // "tk_hallnamename",
//             ],
//             // orderBy: [ORDER_BY_EVENT_CATEGORY_NAME],
//           }),
//           Tk_eventcategoriesService.getAll({
//             select: [
//               "tk_categorydescription",
//               "tk_categoryname",
//               "tk_categoryref",
//               "tk_eventcategoryid",
//             ],
//             // orderBy: [ORDER_BY_DISPLAY_NAME],
//           }),
//         ]);

//         if (
//           hallEventTypesRes &&
//           (hallEventTypesRes as any).success &&
//           (hallEventTypesRes as any).data
//         ) {
//           setHallEventTypesData(hallEventTypesRes.data as Tk_halleventtypes[]);
//         } else if (hallEventTypesRes.data) {
//           console.log("---HET---", hallEventTypesRes.data);
//           setHallEventTypesData(hallEventTypesRes.data as Tk_halleventtypes[]);
//         }

//         if (
//           eventCategoriesRes &&
//           (eventCategoriesRes as any).success &&
//           (eventCategoriesRes as any).data
//         ) {
//           console.log("..EC....>>>>>>>>>......", eventCategoriesRes.data);
//           setEventCategoriesData(
//             eventCategoriesRes.data as Tk_eventcategories[],
//           );
//         } else if (eventCategoriesRes.data) {
//           console.log("...........]]]]]]].", eventCategoriesRes.data);
//           setEventCategoriesData(
//             eventCategoriesRes.data as Tk_eventcategories[],
//           );
//         }
//       } catch (err) {
//         console.error(err);
//         setError(err instanceof Error ? err.message : String(err));
//       } finally {
//         setLoading(false);
//       }
//     }
//     load();
//     // return () => {
//     //   mounted = false;
//     // };
//   }, []);

//   return { hallEventTypesData, eventCategoriesData, loading, error };
// }

export {
  useLoadAllBranchesAndAllManagers,
  useLoadAllHallsAndBranches,
  useLoadAllBookings,
  useLoadAllCustomers,
  useLoadAllEventCategories,
  useLoadAllBranches,
  useLoadAllPendingBookingsForABranch, // not using
  useLoadAllHallEventTypes,
  useLoadAllHallEventTypesAndEventCategories,
  useLoadAllBookingForABranch,
};
