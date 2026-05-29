import type { Aadusers } from "../generated/models/AadusersModel";
import type { Tk_bookings } from "../generated/models/Tk_bookingsModel";
import type { Tk_customers } from "../generated/models/Tk_customersModel";
import type { Tk_eventcategories } from "../generated/models/Tk_eventcategoriesModel";
import type { Tk_halls } from "../generated/models/Tk_hallsModel";
import type { Tk_hotelbranchs } from "../generated/models/Tk_hotelbranchsModel";

const eventCategoryLookup = (eventCategories: Tk_eventcategories[]) =>
  Object.fromEntries(
    eventCategories.map((eventCategory) => [
      eventCategory.tk_eventcategoryid,
      eventCategory.tk_categoryname,
    ]),
  );

const hallLookupHallName = (halls: Tk_halls[]) =>
  Object.fromEntries(halls.map((hall) => [hall.tk_hallid, hall.tk_hallname]));

const hallLookupForHall = (halls: Tk_halls[]) =>
  Object.fromEntries(halls.map((h) => [h.tk_hallid, h]));

const eventCategoryLookupForEventCategory = (
  eventCategories: Tk_eventcategories[],
) =>
  Object.fromEntries(
    eventCategories.map((eventCategory) => [
      eventCategory.tk_eventcategoryid,
      eventCategory,
    ]),
  );

const customerNameLookup = (customers: Tk_customers[]) =>
  Object.fromEntries(
    customers.map((customer) => [customer.tk_customerid, customer.tk_fullname]),
  );

const branchNameLookup = (branches: Tk_hotelbranchs[]) =>
  Object.fromEntries(
    branches.map((branch) => [branch.tk_hotelbranchid, branch.tk_branchname]),
  );

const managerNameLookup = (managers: Aadusers[]) =>
  Object.fromEntries(
    managers.map((manager) => [manager.aaduserid, manager.displayname]),
  );

const eventCategoryNameLookup = (eventCategories: Tk_eventcategories[]) =>
  Object.fromEntries(
    eventCategories.map((c) => [c.tk_eventcategoryid, c.tk_categoryname]),
  );

export {
  eventCategoryLookup,
  hallLookupHallName,
  hallLookupForHall,
  eventCategoryLookupForEventCategory,
  customerNameLookup,
  customerNameLookupAnother,
  branchNameLookup,
  managerNameLookup,
  bookingNameLookup,
  eventCategoryNameLookup,
};

const bookingNameLookup = (bookings: Tk_bookings[]) =>
  new Map(bookings.map((b) => [b.tk_bookingid, b.tk_bookingname]));

const customerNameLookupAnother = (customers: any[]) => {
  return customers.reduce(
    (acc, curr) => {
      acc[curr.tk_customerid] = curr.tk_customername;
      return acc;
    },
    {} as Record<string, string>,
  );
};
