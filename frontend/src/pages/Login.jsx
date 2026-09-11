import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
  ShieldCheck,
} from "lucide-react";

import api from "../services/api";


function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState(
    localStorage.getItem("rememberedEmail") || ""
  );

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");


  // =========================================
  // LOGIN
  // =========================================

 const handleLogin = async (event) => {
  event.preventDefault();

  setError("");
  setLoading(true);

  const loginEmail = email.trim();

  console.log("========== LOGIN DEBUG ==========");
  console.log("Email:", JSON.stringify(loginEmail));
  console.log("Password:", JSON.stringify(password));
  console.log("Password length:", password.length);
  console.log("=================================");

  try {
    const response = await api.post("/auth/login", {
      email: loginEmail,
      password: password,
    });

    const data = response.data;

    console.log("Login successful:", data);

    // Save JWT token
    localStorage.setItem(
      "accessToken",
      data.access_token
    );

    // Save user information
    localStorage.setItem(
      "user",
      JSON.stringify(data.user)
    );

    // Remember email only
    if (rememberMe) {
      localStorage.setItem(
        "rememberedEmail",
        loginEmail
      );
    } else {
      localStorage.removeItem("rememberedEmail");
    }

    // Go to role selection
    navigate("/select-role");

  } catch (error) {
    console.error("LOGIN FAILED:", error);

    if (error.response) {
      console.error(
        "Backend status:",
        error.response.status
      );

      console.error(
        "Backend response:",
        error.response.data
      );

      setError(
        error.response.data?.detail ||
        "Invalid email or password"
      );

    } else {
      setError(
        "Unable to connect to the backend server."
      );
    }

  } finally {
    setLoading(false);
  }
};


  // =========================================
  // UI
  // =========================================

  return (
    <div className="login-page">

      {/* =========================================
          LEFT SIDE
      ========================================= */}

      <section className="login-brand-section">

        {/* Brand */}

        <div className="brand-header">

          <div className="brand-logo">
            <span>◆</span>
          </div>

          <div className="brand-name">

            <div className="brand-title">
              EduVerse

              <span className="enterprise-badge">
                ENTERPRISE
              </span>
            </div>

            <div className="brand-subtitle">
              Accreditation | Analytics | Growth
            </div>

          </div>

        </div>


        {/* Main Content */}

        <div className="brand-content">

          <div className="suite-badge">
            ✦ &nbsp; NAAC Accreditation Management Suite
          </div>


          <h1>
            Smarter Accreditation.
            <br />

            <span>
              Stronger Institutions.
            </span>
          </h1>


          <p className="brand-description">
            Empowering institutions to manage
            accreditation, evidence, reviews, and
            institutional growth through one
            intelligent platform.
          </p>


          {/* Feature 1 */}

          <div className="feature-item">

            <div className="feature-icon">
              <Check size={15} />
            </div>

            <div>

              <strong>
                Centralized Accreditation Management
              </strong>

              <span>
                (Criteria 1–7)
              </span>

            </div>

          </div>


          {/* Feature 2 */}

          <div className="feature-item">

            <div className="feature-icon">
              <Check size={15} />
            </div>

            <div>

              <strong>
                Evidence & Document Tracking
              </strong>

              <span>
                with verifiable audit logs
              </span>

            </div>

          </div>


          {/* Feature 3 */}

          <div className="feature-item">

            <div className="feature-icon green">
              <Check size={15} />
            </div>

            <div>

              <strong>
                Secure Role-Based Access
              </strong>

              <span>
                automated upon authentication
              </span>

            </div>

          </div>


          {/* Stats */}

          <div className="stats-card">

            <div>

              <small>
                Accreditation Cycle
              </small>

              <strong>
                SSR & AQAR Ready
              </strong>

            </div>


            <div>

              <small>
                Compliance Standard
              </small>

              <strong className="green-text">
                NAAC RAF 2024–26
              </strong>

            </div>


            <div>

              <small>
                Data Integrity
              </small>

              <strong>
                256-bit Encrypted
              </strong>

            </div>

          </div>

        </div>


        {/* Footer */}

        <div className="brand-footer">

          <span>
            © 2026 EduVerse Systems
          </span>

          <span>
            <i></i>
            Institutional Cloud Architecture •
            ISO/IEC 27001
          </span>

        </div>

      </section>


      {/* =========================================
          RIGHT SIDE
      ========================================= */}

      <section className="login-form-section">

        {/* Top Status */}

        <div className="portal-status">

          <span className="status-dot"></span>

          <span>
            Institutional Portal Active
          </span>

          <small>
            v4.8.2-ent
          </small>

        </div>


        {/* Login Card */}

        <div className="login-card">

          <div className="login-heading">

            <h2>
              Welcome Back
            </h2>

            <p>
              Sign in to continue to your EduVerse
              workspace.
            </p>

          </div>


          {/* Login Form */}

          <form onSubmit={handleLogin}>

            {/* EMAIL */}

            <div className="field">

              <div className="field-label">

                <label>
                  EMAIL ADDRESS
                </label>

                <span>
                  Institutional Domain
                </span>

              </div>


              <div className="input-container">

                <Mail size={17} />

                <input
                  type="email"
                  placeholder="coordinator@university.edu"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  required
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="field">

              <div className="field-label">

                <label>
                  PASSWORD
                </label>

                <span>
                  Standard SSO / Password
                </span>

              </div>


              <div className="input-container">

                <Lock size={17} />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  required
                />


                <button
                  type="button"
                  className="eye-button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >

                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}

                </button>

              </div>

            </div>


            {/* OPTIONS */}

            <div className="login-options">

              <label className="remember-label">

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(
                      event.target.checked
                    )
                  }
                />

                <span>
                  Remember me
                </span>

              </label>


              <button
                type="button"
                className="forgot-button"
              >
                Forgot Password?
              </button>

            </div>


            {/* ERROR */}

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}


            {/* SIGN IN */}

            <button
              type="submit"
              className="sign-in-button"
              disabled={loading}
            >

              {loading
                ? "Signing In..."
                : "Sign In"
              }

              {!loading && (
                <ArrowRight size={19} />
              )}

            </button>

          </form>


          {/* SECURITY */}

          <div className="secure-message">

            <ShieldCheck size={15} />

            <span>
              Secure access powered by
              role-based permissions
            </span>

          </div>


          {/* OR */}

          <div className="or-divider">

            <span></span>

            <small>
              OR
            </small>

            <span></span>

          </div>


          {/* GOOGLE WORKSPACE */}

          <button
            type="button"
            className="google-button"
          >

            <span className="google-icon">
              G
            </span>

            Continue with Google Workspace

          </button>


          {/* CONTACT */}

          <div className="contact-text">

            Don't have an account?

            <button type="button">
              Contact your institution administrator
            </button>

          </div>

        </div>


        {/* ROLE INFORMATION */}

        <div className="role-info-box">

          <div className="info-icon">
            ⓘ
          </div>

          <p>

            <strong>
              Autonomous Role Assignment:
            </strong>{" "}

            Your access level
            (Coordinator, Committee Member,
            Department Lead, Reviewer, Approver,
            Director, or Admin) will be
            automatically authenticated from
            your institutional directory.

          </p>

        </div>


        {/* FOOTER */}

        <div className="form-footer">

          <span>
            © 2026 EduVerse
          </span>

          <span>
            Secure Institutional Accreditation Platform
          </span>

        </div>

      </section>

    </div>
  );
}


export default Login;