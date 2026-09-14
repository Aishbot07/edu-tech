import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserPlus,
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  Clock3,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

import api from "../../services/api";
import "./UserManagement.css";

export const UserManagement = () => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [error, setError] = useState("");

  // --------------------------------------------------
  // LOAD REGISTRATION REQUESTS
  // --------------------------------------------------

  const loadRequests = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/admin/registration-requests");

      const data = response.data;

      if (Array.isArray(data)) {
        setRequests(data);
      } else {
        setRequests(data?.requests || data?.data || []);
      }
    } catch (err) {
      console.error("Failed to load registration requests:", err);

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Unable to load registration requests.";

      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // --------------------------------------------------
  // COUNTS
  // --------------------------------------------------

  const counts = useMemo(() => {
    return {
      total: requests.length,

      pending: requests.filter(
        (request) =>
          String(request.status || "").toUpperCase() === "PENDING"
      ).length,

      approved: requests.filter(
        (request) =>
          String(request.status || "").toUpperCase() === "APPROVED"
      ).length,

      rejected: requests.filter(
        (request) =>
          String(request.status || "").toUpperCase() === "REJECTED"
      ).length,
    };
  }, [requests]);

  // --------------------------------------------------
  // FILTER
  // --------------------------------------------------

  const filteredRequests = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return requests.filter((request) => {
      const status = String(
        request.status || ""
      ).toUpperCase();

      const matchesStatus =
        statusFilter === "ALL" ||
        status === statusFilter;

      const matchesSearch =
        !search ||
        String(request.full_name || "")
          .toLowerCase()
          .includes(search) ||
        String(request.email || "")
          .toLowerCase()
          .includes(search) ||
        String(request.institution || "")
          .toLowerCase()
          .includes(search) ||
        String(request.department || "")
          .toLowerCase()
          .includes(search);

      return matchesStatus && matchesSearch;
    });
  }, [requests, searchTerm, statusFilter]);

  // --------------------------------------------------
  // DATE
  // --------------------------------------------------

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // --------------------------------------------------
  // STATUS
  // --------------------------------------------------

  const getStatus = (status) => {
    const normalized = String(status || "").toUpperCase();

    if (normalized === "APPROVED") {
      return (
        <span className="um-status approved">
          <CheckCircle2 size={14} />
          Approved
        </span>
      );
    }

    if (normalized === "REJECTED") {
      return (
        <span className="um-status rejected">
          <XCircle size={14} />
          Rejected
        </span>
      );
    }

    return (
      <span className="um-status pending">
        <Clock3 size={14} />
        Pending
      </span>
    );
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="user-management-page">
        <div className="um-loading">
          <div className="um-spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div className="user-management-page">

      {/* HEADER */}

      <div className="um-header">

        <div>
          <div className="um-eyebrow">
            ADMINISTRATION
          </div>

          <h1>User Management</h1>

          <p>
            Manage registration requests, assign roles,
            and control institutional access.
          </p>
        </div>

        <div className="um-header-actions">

          <button
            className="um-refresh-btn"
            onClick={() => loadRequests(true)}
            disabled={refreshing}
          >
            <RefreshCw
              size={17}
              className={
                refreshing ? "um-spin" : ""
              }
            />

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          <button
            className="um-primary-btn"
            onClick={() =>
              navigate("/admin/registration-requests")
            }
          >
            <UserPlus size={17} />
            Registration Requests
          </button>

        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div className="um-alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* STATS */}

      <div className="um-stats">

        <div className="um-stat-card">
          <div className="um-stat-icon total">
            <Users size={20} />
          </div>

          <div>
            <span>Total Requests</span>
            <strong>{counts.total}</strong>
          </div>
        </div>

        <div className="um-stat-card">
          <div className="um-stat-icon pending">
            <Clock3 size={20} />
          </div>

          <div>
            <span>Pending Approval</span>
            <strong>{counts.pending}</strong>
          </div>
        </div>

        <div className="um-stat-card">
          <div className="um-stat-icon approved">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <span>Approved</span>
            <strong>{counts.approved}</strong>
          </div>
        </div>

        <div className="um-stat-card">
          <div className="um-stat-icon rejected">
            <XCircle size={20} />
          </div>

          <div>
            <span>Rejected</span>
            <strong>{counts.rejected}</strong>
          </div>
        </div>

      </div>

      {/* MAIN PANEL */}

      <div className="um-panel">

        <div className="um-panel-header">

          <div>
            <h2>Registration Requests</h2>

            <p>
              Users must be approved before receiving
              platform access.
            </p>
          </div>

          <button
            className="um-view-all"
            onClick={() =>
              navigate("/admin/registration-requests")
            }
          >
            Manage Requests
            <ArrowRight size={16} />
          </button>

        </div>

        {/* FILTER BAR */}

        <div className="um-toolbar">

          <div className="um-search">

            <Search size={17} />

            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
            />

          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>

        </div>

        {/* TABLE */}

        <div className="um-table-wrapper">

          {filteredRequests.length === 0 ? (

            <div className="um-empty">

              <Users size={40} />

              <h3>No users found</h3>

              <p>
                There are no registration requests
                matching your filters.
              </p>

            </div>

          ) : (

            <table className="um-table">

              <thead>
                <tr>
                  <th>User</th>
                  <th>Institution</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {filteredRequests.map((request) => {

                  const initial = String(
                    request.full_name || "U"
                  )
                    .charAt(0)
                    .toUpperCase();

                  return (
                    <tr key={request.id}>

                      <td>

                        <div className="um-user">

                          <div className="um-avatar">
                            {initial}
                          </div>

                          <div>
                            <strong>
                              {request.full_name || "—"}
                            </strong>

                            <span>
                              {request.email || "—"}
                            </span>
                          </div>

                        </div>

                      </td>

                      <td>
                        {request.institution || "—"}
                      </td>

                      <td>
                        {request.department || "—"}
                      </td>

                      <td>
                        {request.designation || "—"}
                      </td>

                      <td>
                        {getStatus(request.status)}
                      </td>

                      <td>
                        {formatDate(
                          request.created_at
                        )}
                      </td>

                      <td>

                        <button
                          className="um-view-btn"
                          onClick={() =>
                            navigate(
                              "/admin/registration-requests"
                            )
                          }
                        >
                          <Eye size={15} />
                          View
                        </button>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          )}

        </div>

        <div className="um-footer">
          Showing {filteredRequests.length} of{" "}
          {requests.length} registration requests
        </div>

      </div>

    </div>
  );
};

export default UserManagement;