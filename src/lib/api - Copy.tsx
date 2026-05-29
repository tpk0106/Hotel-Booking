import { useEffect, useState } from "react";

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

// hook
function useLoadAllBranchesAndAllManagers() {
  const [branchesData, setBranchesData] = useState<Tk_hotelbranchs[]>([]);
  const [managersData, setManagersData] = useState<Aadusers[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const [branches, managersRes] = await Promise.all([
          Tk_hotelbranchsService.getAll({
            select: [
              "tk_hotelbranchid",
              "tk_branchname",
              "tk_branchcontactnumber",
              "tk_branchcontactemail",
              "tk_branchaddress",
              "_tk_branchmanager_value",
              //   ""tk_branchmanager",
            ],
            orderBy: [ORDER_BY_BRANCH_NAME],
          }),
          AadusersService.getAll({
            select: ["displayname", "aaduserid"],
            orderBy: [ORDER_BY_DISPLAY_NAME],
          }),
        ]);

        if (branches && (branches as any).success && (branches as any).data) {
          setBranchesData(branches.data as Tk_hotelbranchs[]);
        } else if (branches.data) {
          setBranchesData(branches.data as Tk_hotelbranchs[]);
        }

        if (
          managersRes &&
          (managersRes as any).success &&
          (managersRes as any).data
        ) {
          setManagersData(managersRes.data as Aadusers[]);
        } else if (managersRes.data) {
          setManagersData(managersRes.data as Aadusers[]);
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

  return { branchesData, managersData, loading, error };
}

// interface HallProps {
//   context: any; // Using unknown; cast when properties are needed
//   // halls?: Tk_halls;
// }

function useLoadAllHallsAndBranches() {
  const [branchesData, setBranchesData] = useState<Tk_hotelbranchs[]>([]);
  const [hallsData, setHallsData] = useState<Tk_halls[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const [hallsRes, branchesRes] = await Promise.all([
          Tk_hallsService.getAll({
            select: [
              "tk_hallname",
              "tk_hallimage",
              "_tk_hotelbranch_value",
              //   ""tk_hallimage_url",
              //   ""tk_hallimageid",
              //   ""tk_hotelbranchname",
              //   ""tk_smokingroomname",
              //   ""tk_wifiname",
              //   ""tk_audiovisualname",
              //   ""tk_disableaccessname",
            ],
            orderBy: [ORDER_BY_HALL_NAME],
          }),
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
          setBranchesData(branchesRes.data as Tk_hotelbranchs[]);
          // console.log("branches in hook :", branchesRes.data);
        } else if (branchesRes.data) {
          setBranchesData(branchesRes.data as Tk_hotelbranchs[]);
        }

        if (hallsRes && (hallsRes as any).success && (hallsRes as any).data) {
          // console.log("Halls in hook :", hallsRes.data);
          setHallsData(hallsRes.data as Tk_halls[]);
        } else if (hallsRes.data) {
          setHallsData(hallsRes.data as Tk_halls[]);
          console.log("Halls in hook else :", hallsRes.data);
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
  return { branchesData, hallsData, loading, error };
}

function useLoadAllBookings(version?: number, query?: string) {
  const [bookingsData, setBookingsData] = useState<Tk_bookings[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        console.log("trigger HOOK ++++++++++++++++++++++++++++++++++:");
        // console.log("version in the HOOK :", new Date().toLocaleDateString());
        // console.log("version in the HOOK :", version);
        console.log("query passed :", query);
        console.log("trigger HOOK ++++++++++++++++++++++++++++++++++:");

        //  method 1
        // Treat query entirely as a string. Wrap it securely in straight single quotes.
        // Dataverse OData demands: field eq 'string_value'
        // const dateFilter = query ? `tk_eventdate eq '${query}'` : "";

        // method 2
        // const rawFilter = query ? `tk_eventdate eq '${query}'` : "";
        // const dateFilter = rawFilter ? encodeURIComponent(rawFilter) : "";
        // This safely transforms it to: tk_eventdate%20eq%20%272026-09-30%27
        //

        //  method 3
        // Replace 'eq' with 'contains' string manipulation
        // const dateFilter = query ? `contains(tk_eventdate, '${query}')` : "";

        // method 4
        // Replace 'eq' with 'contains' string manipulation
        // const dateFilter = query ? `contains(tk_eventdate, '${query}')` : "";

        //  method 5
        // Using contains to bypass hidden string spacing issues + URL Encoding security
        // const ODataString = query
        //   ? `contains(tk_eventdate, '${query.trim()}')`
        //   : "";
        // const dateFilter = ODataString ? encodeURIComponent(ODataString) : "";
        // console.log("NET REQ FILTER => :", ODataString);

        // method 6
        // Returns records where the typed string exists anywhere inside the column text
        // const dateFilter = query
        //   ? encodeURIComponent(`indexof(tk_eventdate, '${query.trim()}') gt -1`)
        //   : "";

        //  method 7
        // 1. DO NOT use encodeURIComponent here. Let Tk_bookingsService handle it.
        // 2. Note the capital 'O' in indexOf
        // const dateFilter = query
        //   ? `indexOf(tk_eventdate, '${query.trim()}') gt -1`
        //   : "";

        // console.log("Sending raw OData filter to service:", dateFilter);

        // console.log("EXECUTE ODATA FILTER =>:", dateFilter);

        // if date is date type use below
        // Convert query input to proper Dataverse ISO date format (YYYY-MM-DD)
        // let dateFilter = "";
        // if (query) {
        //   const parsedDate = new Date(query);
        //   console.log("time : ", parsedDate.getTime());
        //   console.log("isNAN: ", isNaN(parsedDate.getTime()));
        //   if (!isNaN(parsedDate.getTime())) {
        //     const isoDate = parsedDate.toISOString().split("T")[0]; // Yields "2026-05-15"
        //     console.log("ISO Date:", isoDate);
        //     dateFilter = `tk_eventdate eq '${isoDate}'`; // Note the single quotes required by OData
        //   }
        // }

        const [bookingsRes] = await Promise.all([
          Tk_bookingsService.getAll({
            select: [
              "tk_bookingid",
              "tk_bookingname",
              "tk_eventcapacity",
              "tk_eventdate",
              "_tk_hallname_value",
              "_tk_eventcategorytype_value",
              "tk_bookingstatus",
              "tk_bookingname",
              "_tk_customername_value",
              "_tk_hotelbranch_value",
            ],
            filter: "",
            orderBy: [ORDER_BY_EVENT_DATE],
          }),
        ]);

        if (
          bookingsRes &&
          (bookingsRes as any).success &&
          (bookingsRes as any).data
        ) {
          setBookingsData(bookingsRes.data as Tk_bookings[]);

          const rawData = bookingsRes.data as Tk_bookings[];
          if (query && query.trim() !== "") {
            // Frontend filter handles varied spacings or hidden characters
            const filtered = rawData.filter((booking) => {
              const bookingDate = String(booking.tk_eventdate || "").trim();
              return bookingDate.includes(query.trim());
            });
            setBookingsData(filtered);
          } else {
            setBookingsData(rawData);
          }

          console.log("Bookings in the hook :", bookingsData);
        } else if (bookingsRes.data) {
          setBookingsData(bookingsRes.data as Tk_bookings[]);
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }

      //  method 8
      // try {
      //   // 1. Build the explicit system query options string
      //   const selectQuery =
      //     "?$select=tk_bookingid,tk_bookingname,tk_eventcapacity,tk_eventdate,_tk_hallname_value,_tk_eventcategorytype_value,tk_bookingstatus,_tk_customername_value,_tk_hotelbranch_value";

      //   // Dataverse standard string function requires lowercase 'contains'
      //   const filterQuery = query
      //     ? `&$filter=contains(tk_eventdate, '${query.trim()}')`
      //     : "";

      //   const orderQuery = "&$orderby=tk_eventdate asc";

      //   const fullSystemQuery = `${selectQuery}${filterQuery}${orderQuery}`;

      //   // 2. Execute via the native Power Apps Web API engine
      //   // Note: Replace 'tk_bookingses' with your exact logical collection name if different
      //   const response = await (
      //     window as any
      //   ).Xrm.WebApi.retrieveMultipleRecords("tk_bookings", fullSystemQuery);

      //   if (response && response.entities) {
      //     setBookingsData(response.entities as Tk_bookings[]);
      //   }
      // } catch (err) {
      //   console.error("Native Dataverse API Error: ", err);
      //   setError(err instanceof Error ? err.message : String(err));
      // } finally {
      //   setLoading(false);
      // }
    }
    load();
    // return () => {
    //   mounted = false;
    // };
  }, [version, query]);

  return { bookingsData, loading, error };
}

function useLoadAllCustomers() {
  const [customersData, setCustomersData] = useState<Tk_customers[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

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

  return { customersData, loading, error };
}

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

function useLoadAllHallEventTypesAndEventCategories() {
  const [hallEventTypesData, setHallEventTypesData] = useState<
    Tk_halleventtypes[]
  >([]);
  const [eventCategoriesData, setEventCategoriesData] = useState<
    Tk_eventcategories[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const [hallEventTypesRes, eventCategoriesRes] = await Promise.all([
          Tk_halleventtypesService.getAll({
            select: [
              "tk_halleventtypeid",
              "tk_eventtypecapacity",
              "_tk_eventcategorytype_value",
              "_tk_hallname_value",
              // "tk_hallname",
              // "tk_hallnamename",
            ],
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
        } else if (hallEventTypesRes.data) {
          console.log("---HET---", hallEventTypesRes.data);
          setHallEventTypesData(hallEventTypesRes.data as Tk_halleventtypes[]);
        }

        if (
          eventCategoriesRes &&
          (eventCategoriesRes as any).success &&
          (eventCategoriesRes as any).data
        ) {
          console.log("..EC....>>>>>>>>>......", eventCategoriesRes.data);
          setEventCategoriesData(
            eventCategoriesRes.data as Tk_eventcategories[],
          );
        } else if (eventCategoriesRes.data) {
          console.log("...........]]]]]]].", eventCategoriesRes.data);
          setEventCategoriesData(
            eventCategoriesRes.data as Tk_eventcategories[],
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

  return { hallEventTypesData, eventCategoriesData, loading, error };
}

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
};
