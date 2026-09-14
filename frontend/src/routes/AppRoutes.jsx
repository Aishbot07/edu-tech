import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/layout/DashboardLayout";

// Core Pages
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";

import Dashboard from "../pages/Dashboard";
import Departments from "../pages/Departments";
import Criteria from "../pages/Criteria";
import Documents from "../pages/Documents";
import Submissions from "../pages/Submissions";
import Review from "../pages/Review";
import Reports from "../pages/Reports";
import Notifications from "../pages/Notifications";
import Institution from "../pages/Institution";
import Unauthorized from "../pages/Unauthorized";

// Admin Pages
import InstitutionManagement from "../pages/Admin/InstitutionManagement";
import UserManagement from "../pages/Admin/UserManagement";
import RolePermissions from "../pages/Admin/RolePermissions";
import SystemSettings from "../pages/Admin/SystemSettings";
import RegistrationRequests from "../pages/Admin/RegistrationRequests";

// Protected Route Guard
const ProtectedRoute = ({ children, permission, role }) => {
  const { isAuthenticated, activeRole, hasPermission } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (role && activeRole !== role && activeRole !== "Admin") {
    return <Navigate to="/unauthorized" replace />;
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* PROTECTED DASHBOARD LAYOUT */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* General */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin-dashboard" element={<Dashboard />} />

        <Route path="/institutions" element={<InstitutionManagement />} />
        <Route path="/departments" element={<Departments />} />
        <Route path="/criteria" element={<Criteria />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/submissions" element={<Submissions />} />
        <Route path="/review" element={<Review />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/institution" element={<Institution />} />

        {/* ADMIN ROUTES */}
        <Route
          path="/admin/institutions"
          element={<InstitutionManagement />}
        />

        <Route
          path="/admin/users"
          element={<UserManagement />}
        />

        <Route
          path="/admin/roles"
          element={<RolePermissions />}
        />

        <Route
          path="/admin/registration-requests"
          element={<RegistrationRequests />}
        />

        <Route
          path="/admin/settings"
          element={<SystemSettings />}
        />

        {/* Unauthorized */}
        <Route
          path="/unauthorized"
          element={<Unauthorized />}
        />
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;