import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../screens/Login";
import Layout from "../ui/Layout";
import Dashboard from "../screens/pages/Dashboard";
import Users from "../screens/pages/Users";
import UserDetail from "../screens/pages/UserDetail";
import RoomsPage from "../screens/pages/Rooms";
import BookingPage from "../screens/pages/Booking";
import RoomTypesPage from "../screens/pages/RoomTypes";
import PaymentsPage from "../screens/pages/Payments";
import HomeSlidesPage from "../screens/pages/HomeSlides";

import ReportsRevenuePage from "../screens/pages/ReportsRevenue";
import ReportsOccupancyPage from "../screens/pages/ReportsOccupancy2";
import ReportsBookingsPage from "../screens/pages/ReportsBookings2";

import AdminsPage from "../screens/pages/Admins";
import AdminsRolesPage from "../screens/pages/AdminsRoles";

import SettingsAccountPage from "../screens/pages/SettingsAccount";
import SettingsBankAccountPage from "../screens/pages/SettingsBankAccount";



import { RequireAuth, RequireGuest } from "./Guards.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<RequireGuest />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route path="/" element={<Navigate to="/view_dashboard" replace />} />

      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route path="/view_dashboard" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/users/:id" element={<UserDetail />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/rooms/:id" element={<RoomsPage />} />

          <Route path="/bookings" element={<BookingPage />} />
          <Route path="/bookings/:id" element={<BookingPage />} />
          <Route path="/bookings/:id/receipt" element={<BookingPage />} />
          <Route path="/bookings/:id/action" element={<BookingPage />} />

          <Route path="/room-types" element={<RoomTypesPage />} />
          <Route path="/room-types/:id" element={<RoomTypesPage />} />
          <Route path="/payments" element={<PaymentsPage />} />

          <Route path="/content/home-slides" element={<HomeSlidesPage />} />


          <Route path="/reports/revenue" element={<ReportsRevenuePage />} />
          <Route path="/reports/occupancy" element={<ReportsOccupancyPage />} />
          <Route path="/reports/bookings" element={<ReportsBookingsPage />} />


          <Route path="/admins" element={<AdminsPage />} />
          <Route path="/admins-roles" element={<AdminsRolesPage />} />

          <Route path="/settings-account" element={<SettingsAccountPage />} />
          <Route path="/settings-bankaccount" element={<SettingsBankAccountPage />} />


        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/view_dashboard" replace />} />
    </Routes>
  );
}
