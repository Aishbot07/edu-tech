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
  UserCheck,
  UserX,
  ShieldCheck,
} from "lucide-react";

import api from "../../services/api";
import "./UserManagement.css";

export const UserManagement = () => {
  const navigate = useNavigate();

  // --------------------------------------------------
  // STATE
  // --------------------------------------------------

  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);

  const [currentUser, setCurrentUser] = useState(null);
  const [currentRole, setCurrentRole] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [activeTab, setActiveTab] = useState("USERS");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [error, setError] = useState("");

  // --------------------------------------------------
  // ROLE HIERARCHY
  // --------------------------------------------------

  const REGISTRATION_AUTHORITY = {
    "Committee Member": "Dept. Coordinator",
    "Dept. Coordinator": "NAAC Coordinator",
    "NAAC Coordinator": "Principal / Director",
    "Principal / Director": "Admin",
    Reviewer: "Admin",
    "Data Approver": "Admin",
  };

  const getAuthorityForRole = (roleName) => {
    return REGISTRATION_AUTHORITY[roleName] || null;
  };

  // --------------------------------------------------
  // LOAD CURRENT USER
  // --------------------------------------------------

  const loadCurrentUser = async () => {
    try {
      const response = await api.get("/auth/me");

      const data = response.data;

      console.log("CURRENT USER:", data);

      setCurrentUser(data?.user || null);
      setCurrentRole(data?.role?.name || "");
    } catch (err) {
      console.error("Failed to load current user:", err);
    }
  };

  // --------------------------------------------------
  // LOAD USERS + REGISTRATION REQUESTS
  // --------------------------------------------------

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [usersResponse, requestsResponse] =
        await Promise.all([
          api.get("/admin/users"),
          api.get("/admin/registration-requests"),
        ]);

      const usersData = usersResponse.data;
      const requestsData = requestsResponse.data;

      console.log(
        "USER MANAGEMENT - USERS:",
        usersData
      );

      console.log(
        "USER MANAGEMENT - REGISTRATION REQUESTS:",
        requestsData
      );

      if (Array.isArray(usersData)) {
        setUsers(usersData);
      } else {
        setUsers(
          usersData?.users ||
            usersData?.data ||
            []
        );
      }

      if (Array.isArray(requestsData)) {
        setRequests(requestsData);
      } else {
        setRequests(
          requestsData?.requests ||
            requestsData?.data ||
            []
        );
      }
    } catch (err) {
      console.error(
        "Failed to load user management data:",
        err
      );

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Unable to load user management data.";

      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCurrentUser();
    loadData();
  }, []);

  // --------------------------------------------------
  // REQUEST COUNTS
  // --------------------------------------------------

  const requestCounts = useMemo(() => {
    return {
      total: requests.length,

      pending: requests.filter(
        (request) =>
          String(request.status || "").toUpperCase() ===
          "PENDING"
      ).length,

      approved: requests.filter(
        (request) =>
          String(request.status || "").toUpperCase() ===
          "APPROVED"
      ).length,

      rejected: requests.filter(
        (request) =>
          String(request.status || "").toUpperCase() ===
          "REJECTED"
      ).length,
    };
  }, [requests]);

  // --------------------------------------------------
  // USER COUNTS
  // --------------------------------------------------

  const userCounts = useMemo(() => {
    const active = users.filter(
      (user) => user.is_active === true
    ).length;

    const inactive = users.filter(
      (user) => user.is_active === false
    ).length;

    return {
      total: users.length,
      active,
      inactive,
    };
  }, [users]);

  // --------------------------------------------------
  // FILTER USERS
  // --------------------------------------------------

  const filteredUsers = useMemo(() => {
    const search = searchTerm
      .toLowerCase()
      .trim();

    return users.filter((user) => {
      const isActive = user.is_active === true;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && isActive) ||
        (statusFilter === "INACTIVE" && !isActive);

      const matchesSearch =
        !search ||
        String(user.name || "")
          .toLowerCase()
          .includes(search) ||
        String(user.email || "")
          .toLowerCase()
          .includes(search) ||
        String(user.institution_name || "")
          .toLowerCase()
          .includes(search) ||
        String(user.institution || "")
          .toLowerCase()
          .includes(search) ||
        String(user.faculty_name || "")
          .toLowerCase()
          .includes(search) ||
        String(user.faculty || "")
          .toLowerCase()
          .includes(search) ||
        String(user.department_name || "")
          .toLowerCase()
          .includes(search) ||
        String(user.department || "")
          .toLowerCase()
          .includes(search) ||
        String(user.role_name || "")
          .toLowerCase()
          .includes(search) ||
        String(user.role || "")
          .toLowerCase()
          .includes(search);

      return matchesStatus && matchesSearch;
    });
  }, [users, searchTerm, statusFilter]);

  // --------------------------------------------------
  // FILTER REQUESTS
  // --------------------------------------------------

  const filteredRequests = useMemo(() => {
    const search = searchTerm
      .toLowerCase()
      .trim();

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
        String(request.institution_name || "")
          .toLowerCase()
          .includes(search) ||
        String(request.department || "")
          .toLowerCase()
          .includes(search) ||
        String(request.department_name || "")
          .toLowerCase()
          .includes(search) ||
        String(request.designation || "")
          .toLowerCase()
          .includes(search) ||
        String(
          request.requested_role_name ||
            request.requested_role ||
            request.role_name ||
            request.role ||
            ""
        )
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
  // USER STATUS
  // --------------------------------------------------

  const getUserStatus = (isActive) => {
    if (isActive) {
      return (
        <span className="um-status approved">
          <CheckCircle2 size={14} />
          Active
        </span>
      );
    }

    return (
      <span className="um-status rejected">
        <XCircle size={14} />
        Inactive
      </span>
    );
  };

  // --------------------------------------------------
  // REQUEST STATUS
  // --------------------------------------------------

  const getRequestStatus = (status) => {
    const normalized = String(
      status || ""
    ).toUpperCase();

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
  // REQUESTED ROLE
  // --------------------------------------------------

  const getRequestedRole = (request) => {
    return (
      request.requested_role_name ||
      request.requested_role ||
      request.role_name ||
      request.role ||
      "—"
    );
  };

  // --------------------------------------------------
  // AUTHORITY LABEL
  // --------------------------------------------------

  const getAuthorityLabel = () => {
    if (!currentRole) {
      return "Loading authorization...";
    }

    if (currentRole === "Admin") {
      return "Admin can authorize all registration requests.";
    }

    const authority = getAuthorityForRole(
      currentRole
    );

    if (!authority) {
      return `${currentRole} does not have registration authorization.`;
    }

    return `${currentRole} authorizes requests assigned to this level.`;
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="user-management-page">
        <div className="um-loading">
          <div className="um-spinner"></div>
          <p>Loading user management...</p>
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
            Manage users, registration requests,
            roles, and institutional access.
          </p>
        </div>

        <div className="um-header-actions">

          <button
            className="um-refresh-btn"
            onClick={() => loadData(true)}
            disabled={refreshing}
          >
            <RefreshCw
              size={17}
              className={
                refreshing ? "um-spin" : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

          <button
            className="um-primary-btn"
            onClick={() =>
              navigate(
                "/admin/registration-requests"
              )
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

      {/* AUTHORITY INFORMATION */}

      <div
        className="um-alert"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <ShieldCheck size={18} />

        <span>
          <strong>
            Authorization:
          </strong>{" "}
          {getAuthorityLabel()}
        </span>
      </div>

      {/* USER STATS */}

      <div className="um-stats">

        <div className="um-stat-card">
          <div className="um-stat-icon total">
            <Users size={20} />
          </div>

          <div>
            <span>Total Users</span>
            <strong>
              {userCounts.total}
            </strong>
          </div>
        </div>

        <div className="um-stat-card">
          <div className="um-stat-icon approved">
            <UserCheck size={20} />
          </div>

          <div>
            <span>Active Users</span>
            <strong>
              {userCounts.active}
            </strong>
          </div>
        </div>

        <div className="um-stat-card">
          <div className="um-stat-icon pending">
            <Clock3 size={20} />
          </div>

          <div>
            <span>Pending Requests</span>
            <strong>
              {requestCounts.pending}
            </strong>
          </div>
        </div>

        <div className="um-stat-card">
          <div className="um-stat-icon rejected">
            <UserX size={20} />
          </div>

          <div>
            <span>Inactive Users</span>
            <strong>
              {userCounts.inactive}
            </strong>
          </div>
        </div>

      </div>

      {/* TABS */}

      <div className="um-tabs">

        <button
          className={
            activeTab === "USERS"
              ? "um-tab active"
              : "um-tab"
          }
          onClick={() => {
            setActiveTab("USERS");
            setSearchTerm("");
            setStatusFilter("ALL");
          }}
        >
          <Users size={16} />
          Users
          <span>{userCounts.total}</span>
        </button>

        <button
          className={
            activeTab === "REQUESTS"
              ? "um-tab active"
              : "um-tab"
          }
          onClick={() => {
            setActiveTab("REQUESTS");
            setSearchTerm("");
            setStatusFilter("ALL");
          }}
        >
          <UserPlus size={16} />
          Registration Requests
          <span>{requestCounts.total}</span>
        </button>

      </div>

      {/* MAIN PANEL */}

      <div className="um-panel">

        {/* USERS */}

        {activeTab === "USERS" && (
          <>
            <div className="um-panel-header">

              <div>
                <h2>Platform Users</h2>

                <p>
                  Manage approved users and
                  their institutional access.
                </p>
              </div>

              <button
                className="um-view-all"
                onClick={() =>
                  navigate(
                    "/admin/registration-requests"
                  )
                }
              >
                Registration Requests
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
                    setSearchTerm(
                      e.target.value
                    )
                  }
                />

              </div>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
              >
                <option value="ALL">
                  All Users
                </option>

                <option value="ACTIVE">
                  Active
                </option>

                <option value="INACTIVE">
                  Inactive
                </option>
              </select>

            </div>

            {/* USER TABLE */}

            <div className="um-table-wrapper">

              {filteredUsers.length === 0 ? (

                <div className="um-empty">

                  <Users size={40} />

                  <h3>
                    No users found
                  </h3>

                  <p>
                    No users match your
                    current filters.
                  </p>

                </div>

              ) : (

                <table className="um-table">

                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Institution</th>
                      <th>Faculty</th>
                      <th>Department</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredUsers.map(
                      (user) => {

                        const initial =
                          String(
                            user.name || "U"
                          )
                            .charAt(0)
                            .toUpperCase();

                        return (
                          <tr key={user.id}>

                            <td>
                              <div className="um-user">

                                <div className="um-avatar">
                                  {initial}
                                </div>

                                <div>
                                  <strong>
                                    {user.name ||
                                      "—"}
                                  </strong>

                                  <span>
                                    {user.email ||
                                      "—"}
                                  </span>
                                </div>

                              </div>
                            </td>

                            <td>
                              {user.institution_name ||
                                user.institution ||
                                "—"}
                            </td>

                            <td>
                              {user.faculty_name ||
                                user.faculty ||
                                "—"}
                            </td>

                            <td>
                              {user.department_name ||
                                user.department ||
                                "—"}
                            </td>

                            <td>
                              {user.role_name ||
                                user.role ||
                                "—"}
                            </td>

                            <td>
                              {getUserStatus(
                                user.is_active
                              )}
                            </td>

                            <td>

                              <button
                                className="um-view-btn"
                                onClick={() =>
                                  navigate(
                                    `/admin/users/${user.id}`
                                  )
                                }
                              >
                                <Eye size={15} />
                                View
                              </button>

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              )}

            </div>

            <div className="um-footer">
              Showing{" "}
              {filteredUsers.length} of{" "}
              {users.length} users
            </div>
          </>
        )}

        {/* REGISTRATION REQUESTS */}

        {activeTab === "REQUESTS" && (
          <>
            <div className="um-panel-header">

              <div>
                <h2>
                  Registration Requests
                </h2>

                <p>
                  Requests are routed to the
                  authorized role according to
                  the registration hierarchy.
                </p>
              </div>

              <button
                className="um-view-all"
                onClick={() =>
                  navigate(
                    "/admin/registration-requests"
                  )
                }
              >
                Manage Requests
                <ArrowRight size={16} />
              </button>

            </div>

            {/* REQUEST FILTER BAR */}

            <div className="um-toolbar">

              <div className="um-search">

                <Search size={17} />

                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(
                      e.target.value
                    )
                  }
                />

              </div>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
              >
                <option value="ALL">
                  All Status
                </option>

                <option value="PENDING">
                  Pending
                </option>

                <option value="APPROVED">
                  Approved
                </option>

                <option value="REJECTED">
                  Rejected
                </option>

              </select>

            </div>

            {/* REQUEST TABLE */}

            <div className="um-table-wrapper">

              {filteredRequests.length === 0 ? (

                <div className="um-empty">

                  <UserPlus size={40} />

                  <h3>
                    No requests found
                  </h3>

                  <p>
                    There are no registration
                    requests matching your
                    filters.
                  </p>

                </div>

              ) : (

                <table className="um-table">

                  <thead>
                    <tr>
                      <th>Applicant</th>
                      <th>Institution</th>
                      <th>Department</th>
                      <th>Designation</th>
                      <th>Requested Role</th>
                      <th>Status</th>
                      <th>Submitted</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredRequests.map(
                      (request) => {

                        const initial =
                          String(
                            request.full_name ||
                              "U"
                          )
                            .charAt(0)
                            .toUpperCase();

                        const requestedRole =
                          getRequestedRole(
                            request
                          );

                        const requiredAuthority =
                          getAuthorityForRole(
                            requestedRole
                          );

                        return (
                          <tr key={request.id}>

                            {/* APPLICANT */}

                            <td>

                              <div className="um-user">

                                <div className="um-avatar">
                                  {initial}
                                </div>

                                <div>

                                  <strong>
                                    {request.full_name ||
                                      "—"}
                                  </strong>

                                  <span>
                                    {request.email ||
                                      "—"}
                                  </span>

                                </div>

                              </div>

                            </td>

                            {/* INSTITUTION */}

                            <td>
                              {request.institution ||
                                request.institution_name ||
                                "—"}
                            </td>

                            {/* DEPARTMENT */}

                            <td>
                              {request.department ||
                                request.department_name ||
                                "—"}
                            </td>

                            {/* DESIGNATION */}

                            <td>
                              {request.designation ||
                                "—"}
                            </td>

                            {/* REQUESTED ROLE */}

                            <td>

                              <div>
                                <strong>
                                  {requestedRole}
                                </strong>

                                {requiredAuthority && (
                                  <span
                                    style={{
                                      display:
                                        "block",
                                      fontSize:
                                        "11px",
                                      marginTop:
                                        "4px",
                                      opacity:
                                        0.7,
                                    }}
                                  >
                                    Authority:{" "}
                                    {
                                      requiredAuthority
                                    }
                                  </span>
                                )}

                              </div>

                            </td>

                            {/* STATUS */}

                            <td>
                              {getRequestStatus(
                                request.status
                              )}
                            </td>

                            {/* SUBMITTED */}

                            <td>
                              {formatDate(
                                request.created_at
                              )}
                            </td>

                            {/* ACTION */}

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
                      }
                    )}

                  </tbody>

                </table>

              )}

            </div>

            <div className="um-footer">
              Showing{" "}
              {filteredRequests.length} of{" "}
              {requests.length} registration
              requests
            </div>

          </>
        )}

      </div>

    </div>
  );
};

export default UserManagement;