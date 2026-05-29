import { Routes, Route } from "react-router-dom";

import Home from "./home/home.component";
import Hall from "./components/hall/hall.component";
import Branch from "./components/branch/branch.component";
import Customer from "./components/customer/customer.component";
import Booking from "./components/booking/booking.component";
import MainMenu from "./navigation/main-menu.component";
import HallEventType from "./components/hall-event-type/hall-event-type.component";
import ConfirmedBookings from "./reports/confirmed-bookings.component";
import PendingBookings from "./reports/pending-booking-for-branch.component";

const MenuRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainMenu />}>
        <Route index path="/" element={<Home />} />
        <Route index path="/branches" element={<Branch />} />
        <Route index path="/hall" element={<Hall />} />
        <Route index path="/customer" element={<Customer />} />
        <Route index path="bookings" element={<Booking />} />
        <Route index path="halleventtype" element={<HallEventType />} />
        <Route
          index
          path="confirmed-report-by-branch"
          element={<ConfirmedBookings />}
        />
        <Route
          index
          path="pending-booking-report-by-branch"
          element={<PendingBookings />}
        />
      </Route>
    </Routes>
  );
};

export default MenuRoutes;
