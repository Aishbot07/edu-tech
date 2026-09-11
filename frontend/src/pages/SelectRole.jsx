import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Building2,
  GraduationCap,
  ClipboardList,
  Landmark,
  ArrowRight,
  Check,
  Lock,
  LogOut,
  Info,
} from "lucide-react";

import api from "../services/api";
import "./SelectRole.css";

const roles = [
  {
    id: 1,
    key: "naac",
    title: "NAAC Coordinator",
    badge: "FULL SCOPE",
    description:
      "Coordinate institution-wide NAAC activities, monitor accreditation progress, manage criteria-level work and oversee submissions.",
    summary:
      "You'll enter the NAAC Coordinator workspace with institution-wide accreditation management and SSR submission access.",
    color: "blue",
    icon: ShieldCheck,
  },
  {
    id: 3,
    key: "dept",
    title: "Department Coordinator",
    badge: "DEPT LEAD",
    description:
      "Manage NAAC activities for your department, coordinate faculty contributions and track department-level evidence.",
    summary:
      "You'll enter the Department Coordinator workspace to monitor departmental criteria tasks and faculty evidence.",
    color: "indigo",
    icon: Building2,
  },
  {
    id: 2,
    key: "faculty",
    title: "Faculty / Staff",
    badge: "CONTRIBUTOR",
    description:
      "Submit academic and institutional information, upload evidence and complete assigned NAAC activities.",
    summary:
      "You'll enter the Faculty workspace to fulfill assigned metrics, upload academic artifacts, and review feedback.",
    color: "teal",
    icon: GraduationCap,
  },
  {
    id: 4,
    key: "iqac",
    title: "IQAC Administrator",
    badge: "QUALITY CELL",
    description:
      "Manage quality assurance activities, institutional data, compliance workflows and accreditation documentation.",
    summary:
      "You'll enter the IQAC Quality Assurance console to review compliance workflows and institutional benchmarks.",
    color: "purple",
    icon: ClipboardList,
  },
  {
    id: 6,
    key: "principal",
    title: "Principal / Head",
    badge: "EXECUTIVE",
    description:
      "Monitor overall institutional performance, accreditation readiness, key metrics and strategic progress.",
    summary:
      "You'll enter the Executive Leadership workspace with institutional KPI scorecards and NAAC readiness metrics.",
    color: "amber",
    icon: Landmark,
  },
];

function SelectRole() {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/auth/me");

        setUser(response.data);

        /*
         * Automatically select the role assigned
         * to the logged-in user.
         */
        const assignedRole = roles.find(
          (role) => role.id === response.data.role_id
        );

        if (assignedRole) {
          setSelectedRole(assignedRole);
        }
      } catch (error) {
        console.error("Unable to fetch current user:", error);

        navigate("/");
      }
    };

    fetchUser();
  }, [navigate]);

  const selectRole = (role) => {
    setSelectedRole(role);
  };

  const resetRoleSelection = () => {
    setSelectedRole(null);
  };

  const navigateToDashboard = () => {
    if (!selectedRole) return;

    setLoading(true);

    localStorage.setItem(
      "selectedRole",
      JSON.stringify(selectedRole)
    );

    setTimeout(() => {
      navigate("/dashboard");
    }, 700);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("selectedRole");

    navigate("/");
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "AK";

  return (
    <div className="select-role-page">

      {/* ================= HEADER ================= */}

      <header className="role-header">

        <div className="header-inner">

          {/* Brand */}
          <div className="brand-section">

            <div className="brand-logo">
              <ShieldCheck size={23} strokeWidth={2.2} />
            </div>

            <div className="brand-text">

              <div className="brand-title-row">
                <span className="brand-name">
                  EduVerse
                </span>

                <span className="naac-badge">
                  NAAC PORTAL
                </span>
              </div>

              <p className="brand-subtitle">
                Accreditation & Quality Management Platform
              </p>

            </div>
          </div>

          {/* Right Header */}
          <div className="header-right">

            <div className="institution-info">

              <div className="institution-name">
                <span className="online-dot"></span>
                St. Xavier's Autonomous Institute
              </div>

              <div className="institution-domain">
                Institutional Domain: stxaviers.edu
              </div>

            </div>

            <div className="header-divider"></div>

            {/* User */}
            <div className="user-section">

              <div className="user-capsule">

                <div className="user-avatar">
                  {initials}
                </div>

                <div className="user-details">

                  <div className="user-name">
                    {user?.name || "Dr. Ananya K."}

                    <span className="sso-badge">
                      SSO
                    </span>
                  </div>

                  <div className="active-session">
                    Active Session
                  </div>

                </div>

              </div>

              <button
                className="logout-button"
                onClick={handleLogout}
                title="Sign Out of Session"
              >
                <LogOut size={17} />
              </button>

            </div>

          </div>

        </div>

      </header>

      {/* ================= MAIN ================= */}

      <main className="role-main">

        {/* Hero */}

        <section className="role-hero">

          <div className="gateway-badge">
            <ShieldCheck size={13} />
            Authenticated Role Gateway • Step 2 of 2
          </div>

          <h1>
            Choose Your Role
          </h1>

          <p className="hero-description">
            Select your role to continue to your personalized NAAC workspace.
          </p>

          <p className="hero-subdescription">
            Your access, permissions, criteria modules, and analytical
            dashboards are customized according to the selected role.
          </p>

        </section>

        {/* ================= ROLE CARDS ================= */}

        <section className="roles-container">

          {/* First Row */}

          <div className="roles-row-three">

            {roles.slice(0, 3).map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                selected={selectedRole?.id === role.id}
                onSelect={selectRole}
              />
            ))}

          </div>

          {/* Second Row */}

          <div className="roles-row-two">

            {roles.slice(3).map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                selected={selectedRole?.id === role.id}
                onSelect={selectRole}
              />
            ))}

          </div>

        </section>

        {/* ================= SELECTION SUMMARY ================= */}

        <section className="selection-summary">

          {selectedRole ? (

            <div className="summary-active">

              <div className="summary-left">

                <div className="summary-icon">
                  <Check size={21} strokeWidth={2.5} />
                </div>

                <div className="summary-content">

                  <div className="summary-title-row">

                    <span className="summary-label">
                      SELECTED ROLE:
                    </span>

                    <span className="summary-role">
                      {selectedRole.title}
                    </span>

                    <button
                      className="change-button"
                      onClick={resetRoleSelection}
                    >
                      Change
                    </button>

                  </div>

                  <p>
                    {selectedRole.summary}
                  </p>

                </div>

              </div>

              <button
                className="continue-button"
                onClick={navigateToDashboard}
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Redirecting...
                  </>
                ) : (
                  <>
                    Continue to Dashboard
                    <ArrowRight size={17} />
                  </>
                )}

              </button>

            </div>

          ) : (

            <div className="summary-empty">

              <Info size={16} />

              <span>
                Click any of the 5 roles above to unlock your personalized
                accreditation dashboard.
              </span>

            </div>

          )}

        </section>

        {/* ================= RBAC ================= */}

        <section className="rbac-banner">

          <div className="rbac-icon">
            <Lock size={15} />
          </div>

          <div>

            <h4>
              ROLE-BASED ACCESS CONTROL (RBAC) ACTIVE
            </h4>

            <p>
              Your workspace is customized according to your assigned
              permissions. You can only view data, upload documents, and
              approve criteria authorized for your role under Institutional
              NAAC Guidelines.
            </p>

          </div>

        </section>

      </main>

      {/* ================= FOOTER ================= */}

      <footer className="role-footer">

        <div>
          © 2026 EduVerse NAAC Management System • Institutional Quality Suite
        </div>

        <div className="footer-right">

          <span className="compliance">

            <span className="footer-dot"></span>

            NAAC RAF 2024–26 Compliant

          </span>

          <span>•</span>

          <span>
            256-bit AES Role Authorization
          </span>

        </div>

      </footer>

    </div>
  );
}


/* =====================================================
   ROLE CARD
===================================================== */

function RoleCard({
  role,
  selected,
  onSelect,
}) {

  const Icon = role.icon;

  return (
    <div
      className={`role-card role-${role.color} ${
        selected ? "role-card-selected" : ""
      }`}
      onClick={() => onSelect(role)}
    >

      {/* Top */}

      <div>

        <div className="role-card-top">

          <div className="role-icon">
            <Icon size={23} strokeWidth={2} />
          </div>

          <div className="radio-button">

            {selected && (
              <div className="radio-inner"></div>
            )}

          </div>

        </div>

        {/* Title */}

        <div className="role-title-row">

          <h3>
            {role.title}
          </h3>

          <span className="role-badge">
            {role.badge}
          </span>

        </div>

        {/* Description */}

        <p className="role-description">
          {role.description}
        </p>

      </div>

      {/* Bottom */}

      <div className="role-card-footer">

        <span>
          {selected ? "Selected ✓" : "Select role"}
        </span>

        <ArrowRight
          size={16}
          className="role-arrow"
        />

      </div>

    </div>
  );
}

export default SelectRole;