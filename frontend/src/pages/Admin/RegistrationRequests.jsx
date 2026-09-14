import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Building2,
  GraduationCap,
  BriefcaseBusiness,
  X,
  AlertCircle,
  UserCheck,
} from "lucide-react";

import api from "../../services/api";
import "./RegistrationRequests.css";

const RegistrationRequests = () => {
  const navigate = useNavigate();

  // =========================
  // STATE
  // =========================

  const [requests, setRequests] = useState([]);
  const [roles, setRoles] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedRequest, setSelectedRequest] = useState(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const [selectedRole, setSelectedRole] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");

  const [rejectReason, setRejectReason] = useState("");

  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================
  // ADMIN CHECK
  // =========================

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser);

      if (user.role !== "Admin") {
        navigate("/login");
      }
    } catch (err) {
      console.error("USER PARSE ERROR:", err);
      navigate("/login");
    }
  }, [navigate]);

  // =========================
  // LOAD DATA
  // =========================

  const loadData = async (isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [
        requestsResponse,
        rolesResponse,
        institutionsResponse,
        facultiesResponse,
        departmentsResponse,
      ] = await Promise.all([
        api.get("/admin/registration-requests"),
        api.get("/admin/roles"),
        api.get("/institutions"),
        api.get("/faculties"),
        api.get("/departments"),
      ]);

      console.log(
        "REGISTRATION REQUESTS:",
        requestsResponse.data
      );

      console.log(
        "ROLES:",
        rolesResponse.data
      );

      console.log(
        "INSTITUTIONS:",
        institutionsResponse.data
      );

      console.log(
        "FACULTIES:",
        facultiesResponse.data
      );

      console.log(
        "DEPARTMENTS:",
        departmentsResponse.data
      );

      setRequests(
        Array.isArray(requestsResponse.data)
          ? requestsResponse.data
          : []
      );

      setRoles(
        Array.isArray(rolesResponse.data)
          ? rolesResponse.data
          : []
      );

      setInstitutions(
        Array.isArray(institutionsResponse.data)
          ? institutionsResponse.data
          : []
      );

      setFaculties(
        Array.isArray(facultiesResponse.data)
          ? facultiesResponse.data
          : []
      );

      setDepartments(
        Array.isArray(departmentsResponse.data)
          ? departmentsResponse.data
          : []
      );
    } catch (err) {
      console.error("LOAD REGISTRATION DATA ERROR:", err);

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load registration data.";

      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =========================
  // COUNTS
  // =========================

  const pendingCount = requests.filter(
    (request) => request.status === "PENDING"
  ).length;

  const approvedCount = requests.filter(
    (request) => request.status === "APPROVED"
  ).length;

  const rejectedCount = requests.filter(
    (request) => request.status === "REJECTED"
  ).length;

  // =========================
  // FILTERED REQUESTS
  // =========================

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !search ||
        request.full_name?.toLowerCase().includes(search) ||
        request.email?.toLowerCase().includes(search) ||
        request.institution?.toLowerCase().includes(search) ||
        request.department?.toLowerCase().includes(search) ||
        request.designation?.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "ALL" ||
        request.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, searchTerm, statusFilter]);

  // =========================
  // FACULTY FILTER
  // =========================

  const filteredFaculties = useMemo(() => {
    if (!selectedInstitution) {
      return [];
    }

    return faculties.filter(
      (faculty) =>
        Number(faculty.institution_id) ===
        Number(selectedInstitution)
    );
  }, [faculties, selectedInstitution]);

  // =========================
  // DEPARTMENT FILTER
  // =========================

  const filteredDepartments = useMemo(() => {
    if (!selectedInstitution || !selectedFaculty) {
      return [];
    }

    return departments.filter(
      (department) =>
        Number(department.institution_id) ===
          Number(selectedInstitution) &&
        Number(department.faculty_id) ===
          Number(selectedFaculty)
    );
  }, [
    departments,
    selectedInstitution,
    selectedFaculty,
  ]);

  // =========================
  // GET ROLE NAME
  // =========================

  const getRoleName = (roleId) => {
    const role = roles.find(
      (item) => Number(item.id) === Number(roleId)
    );

    return role?.name || "";
  };

  // =========================
  // OPEN VIEW MODAL
  // =========================

  const handleView = async (request) => {
    try {
      setError("");

      const response = await api.get(
        `/admin/registration-requests/${request.id}`
      );

      console.log(
        "REGISTRATION REQUEST DETAILS:",
        response.data
      );

      setSelectedRequest(response.data);
      setShowViewModal(true);
    } catch (err) {
      console.error("VIEW REQUEST ERROR:", err);

      const message =
        err?.response?.data?.detail ||
        "Failed to load registration details.";

      setError(message);
    }
  };

  // =========================
  // OPEN APPROVE MODAL
  // =========================

  const openApproveModal = (request) => {
    setSelectedRequest(request);

    setSelectedRole("");
    setSelectedInstitution("");
    setSelectedFaculty("");
    setSelectedDepartment("");

    setError("");
    setSuccess("");

    setShowApproveModal(true);
  };

  // =========================
  // INSTITUTION CHANGE
  // =========================

  const handleInstitutionChange = (e) => {
    const institutionId = e.target.value;

    setSelectedInstitution(institutionId);

    // Reset dependent selections
    setSelectedFaculty("");
    setSelectedDepartment("");
  };

  // =========================
  // FACULTY CHANGE
  // =========================

  const handleFacultyChange = (e) => {
    const facultyId = e.target.value;

    setSelectedFaculty(facultyId);

    // Reset department
    setSelectedDepartment("");
  };

  // =========================
  // APPROVE REQUEST
  // =========================

  const handleApprove = async () => {
    if (!selectedRequest) {
      return;
    }

    setError("");
    setSuccess("");

    // Role validation
    if (!selectedRole) {
      setError("Please select a role.");
      return;
    }

    const selectedRoleName = getRoleName(selectedRole);

    const normalizedRoleName = selectedRoleName
      .toLowerCase()
      .replace(/\s+/g, "");

    // Institution required for every non-admin role
    if (
      normalizedRoleName !== "admin" &&
      !selectedInstitution
    ) {
      setError("Please select an institution.");
      return;
    }

    // Faculty required when institution is selected
    if (
      normalizedRoleName !== "admin" &&
      !selectedFaculty
    ) {
      setError("Please select a faculty.");
      return;
    }

    // Department required for Department Coordinator
    // and Committee Member
    const departmentRequired =
      normalizedRoleName === "dept.coordinator" ||
      normalizedRoleName === "deptcoordinator" ||
      normalizedRoleName === "committeemember";

    if (
      departmentRequired &&
      !selectedDepartment
    ) {
      setError("Please select a department.");
      return;
    }

    try {
      setActionLoading(true);

      const approvalPayload = {
        role_id: Number(selectedRole),

        institution_id: selectedInstitution
          ? Number(selectedInstitution)
          : null,

        faculty_id: selectedFaculty
          ? Number(selectedFaculty)
          : null,

        department_id: selectedDepartment
          ? Number(selectedDepartment)
          : null,
      };

      console.log(
        "APPROVAL PAYLOAD:",
        approvalPayload
      );

      const response = await api.post(
        `/admin/registration-requests/${selectedRequest.id}/approve`,
        approvalPayload
      );

      console.log(
        "APPROVAL RESPONSE:",
        response.data
      );

      setSuccess(
        response.data?.message ||
          "Registration request approved successfully."
      );

      setShowApproveModal(false);

      // Refresh request list
      await loadData(true);
    } catch (err) {
      console.error(
        "APPROVE REQUEST ERROR:",
        err
      );

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to approve registration request.";

      setError(message);
    } finally {
      setActionLoading(false);
    }
  };

  // =========================
  // OPEN REJECT MODAL
  // =========================

  const openRejectModal = (request) => {
    setSelectedRequest(request);
    setRejectReason("");
    setError("");
    setSuccess("");
    setShowRejectModal(true);
  };

  // =========================
  // REJECT REQUEST
  // =========================

  const handleReject = async () => {
    if (!selectedRequest) {
      return;
    }

    if (!rejectReason.trim()) {
      setError("Please provide a rejection reason.");
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const response = await api.post(
        `/admin/registration-requests/${selectedRequest.id}/reject`,
        {
          reason: rejectReason.trim(),
        }
      );

      console.log(
        "REJECTION RESPONSE:",
        response.data
      );

      setSuccess(
        response.data?.message ||
          "Registration request rejected successfully."
      );

      setShowRejectModal(false);

      await loadData(true);
    } catch (err) {
      console.error(
        "REJECT REQUEST ERROR:",
        err
      );

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to reject registration request.";

      setError(message);
    } finally {
      setActionLoading(false);
    }
  };

  // =========================
  // CLOSE MODALS
  // =========================

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedRequest(null);
  };

  const closeApproveModal = () => {
    if (actionLoading) return;

    setShowApproveModal(false);
    setSelectedRequest(null);

    setSelectedRole("");
    setSelectedInstitution("");
    setSelectedFaculty("");
    setSelectedDepartment("");
  };

  const closeRejectModal = () => {
    if (actionLoading) return;

    setShowRejectModal(false);
    setSelectedRequest(null);
    setRejectReason("");
  };

  // =========================
  // GET INSTITUTION NAME
  // =========================

  const getInstitutionName = (institutionId) => {
    const institution = institutions.find(
      (item) =>
        Number(item.id) === Number(institutionId)
    );

    return institution?.name || "Not assigned";
  };

  // =========================
  // GET FACULTY NAME
  // =========================

  const getFacultyName = (facultyId) => {
    const faculty = faculties.find(
      (item) =>
        Number(item.id) === Number(facultyId)
    );

    return faculty?.name || "Not assigned";
  };

  // =========================
  // GET DEPARTMENT NAME
  // =========================

  const getDepartmentName = (departmentId) => {
    const department = departments.find(
      (item) =>
        Number(item.id) === Number(departmentId)
    );

    return department?.name || "Not assigned";
  };

  // =========================
  // STATUS BADGE
  // =========================

  const renderStatus = (status) => {
    const normalizedStatus =
      status?.toUpperCase();

    if (normalizedStatus === "APPROVED") {
      return (
        <span className="status-badge approved">
          <CheckCircle2 size={14} />
          Approved
        </span>
      );
    }

    if (normalizedStatus === "REJECTED") {
      return (
        <span className="status-badge rejected">
          <XCircle size={14} />
          Rejected
        </span>
      );
    }

    return (
      <span className="status-badge pending">
        <Clock size={14} />
        Pending
      </span>
    );
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="registration-page">
        <div className="registration-loading">
          <RefreshCw
            size={32}
            className="spin"
          />
          <p>Loading registration requests...</p>
        </div>
      </div>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <div className="registration-page">

      {/* HEADER */}

      <div className="registration-header">

        <div className="header-left">

          <button
            className="back-button"
            onClick={() =>
              navigate("/admin/dashboard")
            }
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <div className="page-title-row">
              <h1>Registration Requests</h1>

              {pendingCount > 0 && (
                <span className="pending-count">
                  {pendingCount} Pending
                </span>
              )}
            </div>

            <p>
              Review and manage new user registration
              requests.
            </p>
          </div>

        </div>

        <button
          className="refresh-button"
          onClick={() => loadData(true)}
          disabled={refreshing}
        >
          <RefreshCw
            size={17}
            className={
              refreshing ? "spin" : ""
            }
          />
          Refresh
        </button>

      </div>

      {/* ERROR */}

      {error && (
        <div className="alert-message error">
          <AlertCircle size={18} />
          <span>{error}</span>

          <button
            onClick={() => setError("")}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* SUCCESS */}

      {success && (
        <div className="alert-message success">
          <CheckCircle2 size={18} />
          <span>{success}</span>

          <button
            onClick={() => setSuccess("")}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* STAT CARDS */}

      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon total">
            <Users size={22} />
          </div>

          <div>
            <span>Total Requests</span>
            <strong>{requests.length}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending">
            <Clock size={22} />
          </div>

          <div>
            <span>Pending</span>
            <strong>{pendingCount}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon approved">
            <CheckCircle2 size={22} />
          </div>

          <div>
            <span>Approved</span>
            <strong>{approvedCount}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon rejected">
            <XCircle size={22} />
          </div>

          <div>
            <span>Rejected</span>
            <strong>{rejectedCount}</strong>
          </div>
        </div>

      </div>

      {/* FILTER BAR */}

      <div className="filter-bar">

        <div className="search-box">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search by name, email, institution..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />
        </div>

        <select
          className="status-filter"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
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

      {/* TABLE */}

      <div className="table-card">

        <div className="table-header">
          <div>
            <h2>Registration Requests</h2>
            <p>
              {filteredRequests.length} request
              {filteredRequests.length !== 1
                ? "s"
                : ""}{" "}
              found
            </p>
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="empty-state">
            <Users size={40} />

            <h3>
              No registration requests found
            </h3>

            <p>
              Try changing your search or filter.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">

            <table>

              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Institution</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredRequests.map(
                  (request) => (
                    <tr key={request.id}>

                      <td>
                        <div className="applicant-cell">

                          <div className="applicant-avatar">
                            {request.full_name
                              ?.charAt(0)
                              ?.toUpperCase() || "U"}
                          </div>

                          <div>
                            <strong>
                              {request.full_name}
                            </strong>

                            <span>
                              {request.email}
                            </span>
                          </div>

                        </div>
                      </td>

                      <td>
                        <div className="table-info">
                          <Building2 size={15} />
                          <span>
                            {request.institution ||
                              getInstitutionName(
                                request.institution_id
                              ) ||
                              "—"}
                          </span>
                        </div>
                      </td>

                      <td>
                        {request.department ||
                          getDepartmentName(
                            request.department_id
                          ) ||
                          "—"}
                      </td>

                      <td>
                        {request.designation ||
                          "—"}
                      </td>

                      <td>
                        {renderStatus(
                          request.status
                        )}
                      </td>

                      <td>
                        {request.created_at
                          ? new Date(
                              request.created_at
                            ).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "—"}
                      </td>

                      <td>

                        <div className="action-buttons">

                          <button
                            className="icon-action view"
                            title="View"
                            onClick={() =>
                              handleView(request)
                            }
                          >
                            <Eye size={16} />
                          </button>

                          {request.status ===
                            "PENDING" && (
                            <>
                              <button
                                className="icon-action approve"
                                title="Approve"
                                onClick={() =>
                                  openApproveModal(
                                    request
                                  )
                                }
                              >
                                <CheckCircle2
                                  size={16}
                                />
                              </button>

                              <button
                                className="icon-action reject"
                                title="Reject"
                                onClick={() =>
                                  openRejectModal(
                                    request
                                  )
                                }
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}

                        </div>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* =========================
          VIEW MODAL
          ========================= */}

      {showViewModal &&
        selectedRequest && (
          <div
            className="modal-overlay"
            onClick={closeViewModal}
          >

            <div
              className="modal-card view-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="modal-header">

                <div>
                  <h2>
                    Registration Details
                  </h2>

                  <p>
                    Request #
                    {selectedRequest.id}
                  </p>
                </div>

                <button
                  className="modal-close"
                  onClick={closeViewModal}
                >
                  <X size={20} />
                </button>

              </div>

              <div className="details-grid">

                <div className="detail-item">
                  <span>Full Name</span>
                  <strong>
                    {selectedRequest.full_name ||
                      "—"}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Email</span>
                  <strong>
                    {selectedRequest.email ||
                      "—"}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Institution</span>
                  <strong>
                    {selectedRequest.institution ||
                      getInstitutionName(
                        selectedRequest.institution_id
                      ) ||
                      "—"}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Faculty</span>
                  <strong>
                    {selectedRequest.faculty ||
                      getFacultyName(
                        selectedRequest.faculty_id
                      ) ||
                      "Not assigned"}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Department</span>
                  <strong>
                    {selectedRequest.department ||
                      getDepartmentName(
                        selectedRequest.department_id
                      ) ||
                      "—"}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Designation</span>
                  <strong>
                    {selectedRequest.designation ||
                      "—"}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Status</span>
                  <div>
                    {renderStatus(
                      selectedRequest.status
                    )}
                  </div>
                </div>

                <div className="detail-item">
                  <span>Submitted On</span>
                  <strong>
                    {selectedRequest.created_at
                      ? new Date(
                          selectedRequest.created_at
                        ).toLocaleString(
                          "en-IN"
                        )
                      : "—"}
                  </strong>
                </div>

              </div>

              {selectedRequest.rejection_reason && (
                <div className="rejection-info">
                  <strong>
                    Rejection Reason
                  </strong>

                  <p>
                    {
                      selectedRequest.rejection_reason
                    }
                  </p>
                </div>
              )}

              <div className="modal-footer">

                <button
                  className="secondary-button"
                  onClick={closeViewModal}
                >
                  Close
                </button>

                {selectedRequest.status ===
                  "PENDING" && (
                  <>
                    <button
                      className="danger-button"
                      onClick={() => {
                        closeViewModal();
                        openRejectModal(
                          selectedRequest
                        );
                      }}
                    >
                      <XCircle size={17} />
                      Reject
                    </button>

                    <button
                      className="primary-button"
                      onClick={() => {
                        closeViewModal();
                        openApproveModal(
                          selectedRequest
                        );
                      }}
                    >
                      <CheckCircle2 size={17} />
                      Approve
                    </button>
                  </>
                )}

              </div>

            </div>

          </div>
        )}

      {/* =========================
          APPROVE MODAL
          ========================= */}

      {showApproveModal &&
        selectedRequest && (
          <div
            className="modal-overlay"
            onClick={closeApproveModal}
          >

            <div
              className="modal-card approval-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="modal-header">

                <div>
                  <h2>
                    Approve Registration
                  </h2>

                  <p>
                    Assign role and organizational
                    access.
                  </p>
                </div>

                <button
                  className="modal-close"
                  onClick={closeApproveModal}
                  disabled={actionLoading}
                >
                  <X size={20} />
                </button>

              </div>

              <div className="approval-applicant">

                <div className="applicant-avatar large">
                  {selectedRequest.full_name
                    ?.charAt(0)
                    ?.toUpperCase() || "U"}
                </div>

                <div>
                  <strong>
                    {selectedRequest.full_name}
                  </strong>

                  <span>
                    {selectedRequest.email}
                  </span>
                </div>

              </div>

              <div className="approval-form">

                {/* ROLE */}

                <div className="form-group">

                  <label>
                    Role <span>*</span>
                  </label>

                  <select
                    value={selectedRole}
                    onChange={(e) =>
                      setSelectedRole(
                        e.target.value
                      )
                    }
                    disabled={actionLoading}
                  >
                    <option value="">
                      Select role
                    </option>

                    {roles.map((role) => (
                      <option
                        key={role.id}
                        value={role.id}
                      >
                        {role.name}
                      </option>
                    ))}
                  </select>

                </div>

                {/* INSTITUTION */}

                <div className="form-group">

                  <label>
                    Institution <span>*</span>
                  </label>

                  <select
                    value={
                      selectedInstitution
                    }
                    onChange={
                      handleInstitutionChange
                    }
                    disabled={actionLoading}
                  >
                    <option value="">
                      Select institution
                    </option>

                    {institutions.map(
                      (institution) => (
                        <option
                          key={institution.id}
                          value={institution.id}
                        >
                          {institution.name}
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* FACULTY */}

                <div className="form-group">

                  <label>
                    Faculty <span>*</span>
                  </label>

                  <select
                    value={selectedFaculty}
                    onChange={
                      handleFacultyChange
                    }
                    disabled={
                      actionLoading ||
                      !selectedInstitution
                    }
                  >

                    <option value="">
                      {!selectedInstitution
                        ? "Select institution first"
                        : filteredFaculties.length ===
                          0
                        ? "No faculty available"
                        : "Select faculty"}
                    </option>

                    {filteredFaculties.map(
                      (faculty) => (
                        <option
                          key={faculty.id}
                          value={faculty.id}
                        >
                          {faculty.name}
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* DEPARTMENT */}

                <div className="form-group">

                  <label>
                    Department
                    <span>
                      {selectedRole &&
                      (
                        getRoleName(
                          selectedRole
                        )
                          .toLowerCase()
                          .replace(/\s+/g, "") ===
                          "dept.coordinator" ||
                        getRoleName(
                          selectedRole
                        )
                          .toLowerCase()
                          .replace(/\s+/g, "") ===
                          "deptcoordinator" ||
                        getRoleName(
                          selectedRole
                        )
                          .toLowerCase()
                          .replace(/\s+/g, "") ===
                          "committeemember"
                      )
                        ? " *"
                        : ""}
                    </span>
                  </label>

                  <select
                    value={
                      selectedDepartment
                    }
                    onChange={(e) =>
                      setSelectedDepartment(
                        e.target.value
                      )
                    }
                    disabled={
                      actionLoading ||
                      !selectedFaculty
                    }
                  >

                    <option value="">
                      {!selectedFaculty
                        ? "Select faculty first"
                        : filteredDepartments.length ===
                          0
                        ? "No department available"
                        : "Select department"}
                    </option>

                    {filteredDepartments.map(
                      (department) => (
                        <option
                          key={department.id}
                          value={department.id}
                        >
                          {department.name}
                        </option>
                      )
                    )}

                  </select>

                </div>

              </div>

              <div className="approval-info">
                <UserCheck size={17} />

                <span>
                  The selected role and organizational
                  assignment will be applied when this
                  registration is approved.
                </span>
              </div>

              <div className="modal-footer">

                <button
                  className="secondary-button"
                  onClick={closeApproveModal}
                  disabled={actionLoading}
                >
                  Cancel
                </button>

                <button
                  className="primary-button"
                  onClick={handleApprove}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <RefreshCw
                        size={17}
                        className="spin"
                      />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={17} />
                      Approve Registration
                    </>
                  )}
                </button>

              </div>

            </div>

          </div>
        )}

      {/* =========================
          REJECT MODAL
          ========================= */}

      {showRejectModal &&
        selectedRequest && (
          <div
            className="modal-overlay"
            onClick={closeRejectModal}
          >

            <div
              className="modal-card reject-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="modal-header">

                <div>
                  <h2>
                    Reject Registration
                  </h2>

                  <p>
                    Please provide a reason for
                    rejection.
                  </p>
                </div>

                <button
                  className="modal-close"
                  onClick={closeRejectModal}
                  disabled={actionLoading}
                >
                  <X size={20} />
                </button>

              </div>

              <div className="reject-applicant">

                <div className="applicant-avatar large">
                  {selectedRequest.full_name
                    ?.charAt(0)
                    ?.toUpperCase() || "U"}
                </div>

                <div>
                  <strong>
                    {selectedRequest.full_name}
                  </strong>

                  <span>
                    {selectedRequest.email}
                  </span>
                </div>

              </div>

              <div className="form-group">

                <label>
                  Rejection Reason <span>*</span>
                </label>

                <textarea
                  rows="5"
                  value={rejectReason}
                  onChange={(e) =>
                    setRejectReason(
                      e.target.value
                    )
                  }
                  placeholder="Enter the reason for rejecting this registration request..."
                  disabled={actionLoading}
                />

              </div>

              <div className="modal-footer">

                <button
                  className="secondary-button"
                  onClick={closeRejectModal}
                  disabled={actionLoading}
                >
                  Cancel
                </button>

                <button
                  className="danger-button"
                  onClick={handleReject}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <RefreshCw
                        size={17}
                        className="spin"
                      />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle size={17} />
                      Reject Registration
                    </>
                  )}
                </button>

              </div>

            </div>

          </div>
        )}

    </div>
  );
};

export default RegistrationRequests;