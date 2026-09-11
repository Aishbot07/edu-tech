import React from "react";

function Dashboard() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8f9fc",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          padding: "40px",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
          textAlign: "center",
        }}
      >
        <h1>EduVerse NAAC Dashboard</h1>

        <p>
          Welcome to your accreditation management dashboard.
        </p>
      </div>
    </div>
  );
}

export default Dashboard;