import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/layout/DashboardLayout";

// =========================================
// PUBLIC PAGES
// =========================================
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";

// =========================================
// CORE PAGES
// =========================================
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

// =========================================
// ADMIN PAGES
// =========================================
import InstitutionManagement from "../pages/Admin/InstitutionManagement";
import InstitutionRequests from "../pages/Admin/InstitutionRequests";
import UserManagement from "../pages/Admin/UserManagement";
import RolePermissions from "../pages/Admin/RolePermissions";
import SystemSettings from "../pages/Admin/SystemSettings";
import RegistrationRequests from "../pages/Admin/RegistrationRequests";

// =========================================
// PROTECTED ROUTE GUARD
// =========================================
const ProtectedRoute = ({ children, permission, role }) => {
  const {
    isAuthenticated,
    activeRole,
    hasPermission,
  } = useAuth();

  // Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Role restriction
  // Admin can access all admin routes
  if (
    role &&
    activeRole !== role &&
    activeRole !== "Admin"
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Permission restriction
  if (
    permission &&
    !hasPermission(permission) &&
    activeRole !== "Admin"
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// =========================================
// APPLICATION ROUTES
// =========================================
export const AppRoutes = () => {
  return (
    <Routes>

      {/* =========================================
          PUBLIC ROUTES
      ========================================= */}

      <Route
        path="/"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />


      {/* =========================================
          PROTECTED APPLICATION
          DashboardLayout wraps all logged-in pages
      ========================================= */}

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >

        {/* =========================================
            GENERAL / DASHBOARD
        ========================================= */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/admin-dashboard"
          element={<Dashboard />}
        />


        {/* =========================================
            INSTITUTION MANAGEMENT
            Shows ACTIVE/CREATED institutions

            GET /institutions
        ========================================= */}

        <Route
          path="/institutions"
          element={
            <ProtectedRoute
              role="Admin"
            >
              <InstitutionManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/institutions"
          element={
            <ProtectedRoute
              role="Admin"
            >
              <InstitutionManagement />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            INSTITUTION REGISTRATION REQUESTS
            Shows PENDING / APPROVED / REJECTED requests

            GET /institution-requests
        ========================================= */}

        <Route
          path="/admin/institution-requests"
          element={
            <ProtectedRoute
              role="Admin"
            >
              <InstitutionRequests />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            DEPARTMENTS
        ========================================= */}

        <Route
          path="/departments"
          element={<Departments />}
        />


        {/* =========================================
            NAAC CRITERIA
        ========================================= */}

        <Route
          path="/criteria"
          element={<Criteria />}
        />


        {/* =========================================
            DOCUMENTS
        ========================================= */}

        <Route
          path="/documents"
          element={<Documents />}
        />


        {/* =========================================
            SUBMISSIONS
        ========================================= */}

        <Route
          path="/submissions"
          element={<Submissions />}
        />


        {/* =========================================
            REVIEW
        ========================================= */}

        <Route
          path="/review"
          element={<Review />}
        />


        {/* =========================================
            REPORTS
        ========================================= */}

        <Route
          path="/reports"
          element={<Reports />}
        />


        {/* =========================================
            NOTIFICATIONS
        ========================================= */}

        <Route
          path="/notifications"
          element={<Notifications />}
        />


        {/* =========================================
            INSTITUTION PROFILE
        ========================================= */}

        <Route
          path="/institution"
          element={<Institution />}
        />


        {/* =========================================
            ADMIN - USER MANAGEMENT
        ========================================= */}

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute
              role="Admin"
            >
              <UserManagement />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            ADMIN - ROLES & PERMISSIONS
        ========================================= */}

        <Route
          path="/admin/roles"
          element={
            <ProtectedRoute
              role="Admin"
            >
              <RolePermissions />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            ADMIN - USER REGISTRATION REQUESTS
        ========================================= */}

        <Route
          path="/admin/registration-requests"
          element={
            <ProtectedRoute
              role="Admin"
            >
              <RegistrationRequests />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            ADMIN - SYSTEM SETTINGS
        ========================================= */}

        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute
              role="Admin"
            >
              <SystemSettings />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            UNAUTHORIZED
        ========================================= */}

        <Route
          path="/unauthorized"
          element={<Unauthorized />}
        />

      </Route>


      {/* =========================================
          FALLBACK
      ========================================= */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
};

export default AppRoutes;