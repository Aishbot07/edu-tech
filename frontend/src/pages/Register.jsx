import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./Register.css";

export default function Register() {
  // ============================================================
  // FORM DATA
  // ============================================================

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    institution_id: "",
    faculty_id: "",
    department_id: "",
    designation: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  // ============================================================
  // DROPDOWN DATA
  // ============================================================

  const [institutions, setInstitutions] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);

  // ============================================================
  // LOADING
  // ============================================================

  const [loadingInstitutions, setLoadingInstitutions] =
    useState(true);

  const [loadingFaculties, setLoadingFaculties] =
    useState(false);

  const [loadingDepartments, setLoadingDepartments] =
    useState(false);

  const [submitting, setSubmitting] = useState(false);

  // ============================================================
  // ALERT / SUCCESS
  // ============================================================

  const [error, setError] = useState("");

  const [success, setSuccess] = useState(false);

  const [requestId, setRequestId] = useState(null);

  const [requestStatus, setRequestStatus] = useState("");

  // ============================================================
  // LOAD INSTITUTIONS
  // ============================================================

  useEffect(() => {
    const loadInstitutions = async () => {
      try {
        setLoadingInstitutions(true);
        setError("");

        const response = await api.get("/auth/institutions");

        console.log(
          "INSTITUTIONS RESPONSE:",
          response.data
        );

        setInstitutions(response.data || []);
      } catch (err) {
        console.error(
          "INSTITUTIONS ERROR:",
          err
        );

        setError(
          err.response?.data?.detail ||
            "Unable to load institutions."
        );
      } finally {
        setLoadingInstitutions(false);
      }
    };

    loadInstitutions();
  }, []);

  // ============================================================
  // LOAD FACULTIES
  // ============================================================

  const loadFaculties = async (institutionId) => {
    if (!institutionId) {
      setFaculties([]);
      return;
    }

    try {
      setLoadingFaculties(true);
      setError("");

      const response = await api.get(
        "/auth/faculties",
        {
          params: {
            institution_id: institutionId,
          },
        }
      );

      console.log(
        "FACULTIES RESPONSE:",
        response.data
      );

      setFaculties(response.data || []);
    } catch (err) {
      console.error(
        "FACULTIES ERROR:",
        err
      );

      setFaculties([]);

      setError(
        err.response?.data?.detail ||
          "Unable to load faculties."
      );
    } finally {
      setLoadingFaculties(false);
    }
  };

  // ============================================================
  // LOAD DEPARTMENTS
  // ============================================================

  const loadDepartments = async (
    institutionId,
    facultyId
  ) => {
    if (!institutionId || !facultyId) {
      setDepartments([]);
      return;
    }

    try {
      setLoadingDepartments(true);
      setError("");

      const response = await api.get(
        "/auth/departments",
        {
          params: {
            institution_id: institutionId,
            faculty_id: facultyId,
          },
        }
      );

      console.log(
        "DEPARTMENTS RESPONSE:",
        response.data
      );

      setDepartments(response.data || []);
    } catch (err) {
      console.error(
        "DEPARTMENTS ERROR:",
        err
      );

      setDepartments([]);

      setError(
        err.response?.data?.detail ||
          "Unable to load departments."
      );
    } finally {
      setLoadingDepartments(false);
    }
  };

  // ============================================================
  // HANDLE INPUT
  // ============================================================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    // ----------------------------------------------------------
    // INSTITUTION
    // ----------------------------------------------------------

    if (name === "institution_id") {
      setFormData((prev) => ({
        ...prev,
        institution_id: value,
        faculty_id: "",
        department_id: "",
      }));

      setFaculties([]);
      setDepartments([]);

      setError("");

      loadFaculties(value);

      return;
    }

    // ----------------------------------------------------------
    // FACULTY
    // ----------------------------------------------------------

    if (name === "faculty_id") {
      setFormData((prev) => ({
        ...prev,
        faculty_id: value,
        department_id: "",
      }));

      setDepartments([]);

      setError("");

      loadDepartments(
        formData.institution_id,
        value
      );

      return;
    }

    // ----------------------------------------------------------
    // NORMAL INPUT / CHECKBOX
    // ----------------------------------------------------------

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setError("");
  };

  // ============================================================
  // VALIDATION
  // ============================================================

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      return "Please enter your full name.";
    }

    if (!formData.email.trim()) {
      return "Please enter your email address.";
    }

    if (!formData.institution_id) {
      return "Please select your institution.";
    }

    if (!formData.faculty_id) {
      return "Please select your faculty.";
    }

    if (!formData.department_id) {
      return "Please select your department.";
    }

    if (!formData.designation.trim()) {
      return "Please enter your designation.";
    }

    if (!formData.password) {
      return "Please enter a password.";
    }

    if (formData.password.length < 8) {
      return "Password must contain at least 8 characters.";
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      return "Passwords do not match.";
    }

    if (!formData.terms) {
      return "Please accept the terms and conditions.";
    }

    return null;
  };

  // ============================================================
  // SUBMIT REGISTRATION
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);

      // --------------------------------------------------------
      // FIND SELECTED INSTITUTION
      // --------------------------------------------------------

      const selectedInstitution =
        institutions.find(
          (institution) =>
            String(institution.id) ===
            String(formData.institution_id)
        );

      // --------------------------------------------------------
      // FIND SELECTED FACULTY
      // --------------------------------------------------------

      const selectedFaculty =
        faculties.find(
          (faculty) =>
            String(faculty.id) ===
            String(formData.faculty_id)
        );

      // --------------------------------------------------------
      // FIND SELECTED DEPARTMENT
      // --------------------------------------------------------

      const selectedDepartment =
        departments.find(
          (department) =>
            String(department.id) ===
            String(formData.department_id)
        );

      // --------------------------------------------------------
      // REQUEST PAYLOAD
      // --------------------------------------------------------

      const payload = {
        full_name:
          formData.full_name.trim(),

        email:
          formData.email.trim().toLowerCase(),

        institution:
          selectedInstitution?.name || "",

        institution_id:
          Number(formData.institution_id),

        faculty_id:
          Number(formData.faculty_id),

        department:
          selectedDepartment?.name || "",

        department_id:
          Number(formData.department_id),

        designation:
          formData.designation.trim(),

        password:
          formData.password,
      };

      console.log(
        "REGISTRATION PAYLOAD:",
        payload
      );

      console.log(
        "SELECTED FACULTY:",
        selectedFaculty
      );

      // --------------------------------------------------------
      // API CALL
      // --------------------------------------------------------

      const response = await api.post(
        "/auth/register",
        payload
      );

      console.log(
        "REGISTRATION RESPONSE:",
        response.data
      );

      // --------------------------------------------------------
      // SUCCESS
      // --------------------------------------------------------

      setRequestId(
        response.data.request_id
      );

      setRequestStatus(
        response.data.status
      );

      setSuccess(true);

    } catch (err) {
      console.error(
        "REGISTRATION ERROR:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Registration failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // SUCCESS SCREEN
  // ============================================================

  if (success) {
    return (
      <div className="register-page">

        {/* LEFT BRAND SECTION */}
        <section className="register-brand-section">

          <div className="register-brand-content">

            <div className="register-logo">

              <div className="register-logo-icon">
                E
              </div>

              <div>
                <h2>
                  EduVerse
                </h2>

                <span>
                  NAAC ACCREDITATION PLATFORM
                </span>
              </div>

            </div>


            <div className="register-brand-main">

              <div className="register-badge">
                <span className="badge-dot"></span>
                ACCOUNT REGISTRATION
              </div>

              <h1>
                Build a stronger
                <span> accreditation journey.</span>
              </h1>

              <p>
                EduVerse brings institutions,
                departments, committees and
                accreditation teams together on
                one intelligent platform.
              </p>

            </div>

          </div>

          <div className="register-footer">
            © 2026 EduVerse · NAAC Accreditation Management
          </div>

        </section>


        {/* RIGHT SUCCESS SECTION */}
        <section className="register-form-section">

          <div className="register-card">

            <div className="register-card-header">

              <span className="form-step">
                REGISTRATION COMPLETE
              </span>

              <h1>
                Request Submitted
              </h1>

              <p>
                Your registration request has
                been successfully submitted.
              </p>

            </div>


            <div className="register-success-card">

              <div className="success-icon">
                ✓
              </div>

              <div className="success-content">

                <h3>
                  Registration successful
                </h3>

                <p>
                  Your account is currently
                  waiting for approval from an
                  authorized administrator.
                </p>

              </div>

            </div>


            <div className="success-details">

              <div className="success-detail-item">

                <span>
                  Request ID
                </span>

                <strong>
                  #{requestId}
                </strong>

              </div>


              <div className="success-detail-item">

                <span>
                  Status
                </span>

                <strong className="pending-status">
                  {requestStatus || "PENDING"}
                </strong>

              </div>

            </div>


            <div className="success-note">
              Your selected institution,
              faculty and department have been
              recorded with your registration
              request. Once approved, you will
              be able to access your assigned
              EduVerse dashboard.
            </div>


            <div className="registration-next-step">

              <div className="next-step-title">
                What happens next?
              </div>

              <div className="registration-steps">

                <div className="registration-step completed">

                  <div className="step-circle">
                    ✓
                  </div>

                  <div>
                    <strong>
                      Registration submitted
                    </strong>

                    <span>
                      Your request has been received.
                    </span>
                  </div>

                </div>


                <div className="registration-step active">

                  <div className="step-circle">
                    2
                  </div>

                  <div>
                    <strong>
                      Admin approval
                    </strong>

                    <span>
                      An authorized administrator
                      will review your request.
                    </span>
                  </div>

                </div>


                <div className="registration-step">

                  <div className="step-circle">
                    3
                  </div>

                  <div>
                    <strong>
                      Account activation
                    </strong>

                    <span>
                      Your role-based account will
                      become available after approval.
                    </span>
                  </div>

                </div>

              </div>

            </div>


            <div className="register-login-link">
              Already have an account?
              {" "}
              <Link to="/login">
                Login
              </Link>
            </div>

          </div>

        </section>

      </div>
    );
  }

  // ============================================================
  // MAIN REGISTRATION PAGE
  // ============================================================

  return (
    <div className="register-page">

      {/* ====================================================== */}
      {/* LEFT BRAND SECTION */}
      {/* ====================================================== */}

      <section className="register-brand-section">

        <div className="register-brand-content">

          {/* LOGO */}

          <div className="register-logo">

            <div className="register-logo-icon">
              E
            </div>

            <div>
              <h2>
                EduVerse
              </h2>

              <span>
                NAAC ACCREDITATION PLATFORM
              </span>
            </div>

          </div>


          {/* BRAND CONTENT */}

          <div className="register-brand-main">

            <div className="register-badge">

              <span className="badge-dot"></span>

              INSTITUTIONAL ACCESS

            </div>


            <h1>
              Join the future of
              <span> accreditation.</span>
            </h1>


            <p>
              Create your EduVerse account and
              become part of a unified platform
              for managing NAAC accreditation,
              institutional data and evidence.
            </p>


            {/* FEATURES */}

            <div className="register-features">

              <div className="register-feature">

                <div className="feature-icon">
                  ✓
                </div>

                <div>

                  <strong>
                    Structured accreditation
                  </strong>

                  <p>
                    Organize institutional data,
                    criteria and evidence in one
                    centralized platform.
                  </p>

                </div>

              </div>


              <div className="register-feature">

                <div className="feature-icon">
                  ✓
                </div>

                <div>

                  <strong>
                    Role-based access
                  </strong>

                  <p>
                    Get access based on your
                    institution, faculty,
                    department and assigned role.
                  </p>

                </div>

              </div>


              <div className="register-feature">

                <div className="feature-icon">
                  ✓
                </div>

                <div>

                  <strong>
                    Secure approval workflow
                  </strong>

                  <p>
                    Registration requests are
                    reviewed and approved before
                    account activation.
                  </p>

                </div>

              </div>

            </div>


            {/* INFO CARD */}

            <div className="register-info-card">

              <div className="info-number">
                01
              </div>

              <div>

                <span>
                  SIMPLE ONBOARDING
                </span>

                <strong>
                  Register → Get Approved → Get Started
                </strong>

                <p>
                  Your account remains pending until
                  an authorized administrator reviews
                  and assigns the appropriate role.
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* FOOTER */}

        <div className="register-footer">
          © 2026 EduVerse · NAAC Accreditation Management
        </div>

      </section>


      {/* ====================================================== */}
      {/* RIGHT FORM SECTION */}
      {/* ====================================================== */}

      <section className="register-form-section">

        <div className="register-card">

          {/* HEADER */}

          <div className="register-card-header">

            <span className="form-step">
              STEP 01 · REGISTRATION
            </span>

            <h1>
              Create your account
            </h1>

            <p>
              Submit your details to request
              access to EduVerse.
            </p>

          </div>


          {/* ERROR */}

          {error && (
            <div className="register-alert error">
              {error}
            </div>
          )}


          {/* ================================================== */}
          {/* PERSONAL INFORMATION */}
          {/* ================================================== */}

          <div className="form-section-title">
            Personal Information
          </div>


          {/* NAME + EMAIL */}

          <div className="form-row">

            <div className="form-group">

              <label>
                Full Name <span>*</span>
              </label>

              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Enter your full name"
                disabled={submitting}
              />

            </div>


            <div className="form-group">

              <label>
                Email Address <span>*</span>
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@institution.edu"
                disabled={submitting}
              />

            </div>

          </div>


          {/* ================================================== */}
          {/* INSTITUTION DETAILS */}
          {/* ================================================== */}

          <div className="form-section-title institution-title">
            Institution Details
          </div>


          {/* INSTITUTION */}

          <div className="form-group">

            <label>
              Institution <span>*</span>
            </label>

            <select
              name="institution_id"
              value={formData.institution_id}
              onChange={handleChange}
              disabled={
                submitting ||
                loadingInstitutions
              }
            >

              <option value="">
                {loadingInstitutions
                  ? "Loading institutions..."
                  : "Select institution"}
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

            <small>
              Select the institution you are
              associated with.
            </small>

          </div>


          {/* FACULTY + DEPARTMENT */}

          <div className="form-row">

            <div className="form-group">

              <label>
                Faculty <span>*</span>
              </label>

              <select
                name="faculty_id"
                value={formData.faculty_id}
                onChange={handleChange}
                disabled={
                  submitting ||
                  !formData.institution_id ||
                  loadingFaculties
                }
              >

                <option value="">
                  {!formData.institution_id
                    ? "Select institution first"
                    : loadingFaculties
                      ? "Loading faculties..."
                      : "Select faculty"}
                </option>

                {faculties.map(
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


            <div className="form-group">

              <label>
                Department <span>*</span>
              </label>

              <select
                name="department_id"
                value={formData.department_id}
                onChange={handleChange}
                disabled={
                  submitting ||
                  !formData.faculty_id ||
                  loadingDepartments
                }
              >

                <option value="">
                  {!formData.faculty_id
                    ? "Select faculty first"
                    : loadingDepartments
                      ? "Loading departments..."
                      : "Select department"}
                </option>

                {departments.map(
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


          {/* DESIGNATION */}

          <div className="form-group">

            <label>
              Designation <span>*</span>
            </label>

            <input
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              placeholder="e.g. Assistant Professor"
              disabled={submitting}
            />

          </div>


          {/* ================================================== */}
          {/* ACCOUNT SECURITY */}
          {/* ================================================== */}

          <div className="form-section-title institution-title">
            Account Security
          </div>


          {/* PASSWORD + CONFIRM */}

          <div className="form-row">

            <div className="form-group">

              <label>
                Password <span>*</span>
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                disabled={submitting}
              />

            </div>


            <div className="form-group">

              <label>
                Confirm Password <span>*</span>
              </label>

              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                disabled={submitting}
              />

            </div>

          </div>


          {/* ================================================== */}
          {/* TERMS */}
          {/* ================================================== */}

          <div className="register-checkbox">

            <input
              id="terms"
              type="checkbox"
              name="terms"
              checked={formData.terms}
              onChange={handleChange}
              disabled={submitting}
            />

            <label htmlFor="terms">
              I agree to the EduVerse terms and
              conditions and confirm that the
              information provided is accurate.
            </label>

          </div>


          {/* ================================================== */}
          {/* SUBMIT */}
          {/* ================================================== */}

          <button
            type="button"
            className="register-submit"
            onClick={handleSubmit}
            disabled={submitting}
          >

            {submitting
              ? "Submitting Registration..."
              : "Submit Registration"}

          </button>


          {/* ================================================== */}
          {/* PENDING NOTE */}
          {/* ================================================== */}

          <div className="pending-note">

            <span>
              🔒
            </span>

            <div>

              <p>
                Your account will remain pending
                until approved by an authorized
                administrator.
              </p>

            </div>

          </div>


          {/* LOGIN */}

          <div className="register-login-link">

            Already have an account?

            {" "}

            <Link to="/login">
              Login
            </Link>

          </div>

        </div>

      </section>

    </div>
  );
}