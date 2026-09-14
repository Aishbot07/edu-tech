import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "../../pages/AdminDashboard.css";

export const DashboardLayout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="admin-dashboard">
      <Sidebar mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />
      <main className="admin-main">
        <Header />
        <div className="dashboard-content">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
