import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";

import { useAuth } from "../hooks/useAuth";
import "./Login.css";

import { useTheme } from "../../shared/context/ThemeContext";
import { showSuccess, showError } from "../../shared/utils/toast";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const darkMode = theme === "dark";

  const [showPassword, setShowPassword] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    role: "EMPLOYEE",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleRoleChange = (role) => {
    setFormData((previousData) => ({
      ...previousData,
      role,
    }));

    setRoleOpen(false);
  };

  /*
   * =========================================================
   * LOGIN
   * =========================================================
   *
   * AuthProvider.login() handles:
   *
   * 1. POST /auth/login
   * 2. Store JWT
   * 3. GET /auth/me
   * 4. Store authenticated user
   * 5. Return user information
   *
   * Login.jsx only handles navigation.
   */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);

    try {
      const user = await login(
        formData.email.trim(),
        formData.role,
        formData.password
      );

      console.log(
        "Authenticated user:",
        user
      );

      showSuccess("Login successful!");

      /*
       * If HR approved a password reset request,
       * the user must change the temporary password
       * before accessing the dashboard.
       */
      if (user.must_change_password) {
        navigate("/change-password", {
          replace: true,
        });

        return;
      }

      /*
       * HR users go to the HR dashboard.
       */
      if (user.role === "HR") {
        navigate("/hr/dashboard", {
          replace: true,
        });

        return;
      }

      /*
       * Employee users go to the Employee dashboard.
       */
      if (user.role === "EMPLOYEE") {
        navigate("/employee/dashboard", {
          replace: true,
        });

        return;
      }

      /*
       * Backend currently supports only HR
       * and EMPLOYEE roles.
       */
      showError(
        "Your account has an invalid role. Please contact HR."
      );
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      if (error.response) {
        showError(
          error.response.data?.detail ||
            "Invalid email, role, or password."
        );
      } else {
        showError(
          "Unable to connect to the authentication server."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className={`login-page ${
        darkMode ? "dark" : "light"
      }`}
    >
      {/* =====================================================
          ANIMATED BACKGROUND
      ===================================================== */}

      <div
        className="login-background"
        aria-hidden="true"
      >
        <div className="login-grid" />

        <div className="login-glow login-glow-one" />
        <div className="login-glow login-glow-two" />
        <div className="login-glow login-glow-three" />

        <div className="login-orbit login-orbit-one" />
        <div className="login-orbit login-orbit-two" />
        <div className="login-orbit login-orbit-three" />

        <div className="login-particles">
          {Array.from({ length: 32 }).map(
            (_, index) => (
              <span
                key={index}
                className="login-particle"
                style={{
                  "--particle-x": `${
                    (index * 37) % 100
                  }%`,
                  "--particle-y": `${
                    (index * 61) % 100
                  }%`,
                  "--particle-delay": `${
                    index * -0.35
                  }s`,
                }}
              />
            )
          )}
        </div>

        <div className="login-wave login-wave-one" />
        <div className="login-wave login-wave-two" />
      </div>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="login-header">
        <button
          type="button"
          className="login-brand"
          onClick={() => navigate("/")}
        >
          <div className="login-brand-icon">
            <svg
              viewBox="0 0 64 64"
              fill="none"
            >
              <circle
                cx="32"
                cy="18"
                r="9"
                stroke="currentColor"
                strokeWidth="4"
              />

              <path
                d="M15 48C15 38.6 22.6 31 32 31C41.4 31 49 38.6 49 48"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />

              <path
                d="M11 28C7 29 4.5 32.5 4.5 37"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              <path
                d="M53 28C57 29 59.5 32.5 59.5 37"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="login-brand-text">
            <h1>HRMS</h1>
            <p>Mediatize Tech Pvt Ltd</p>
          </div>
        </button>

        {/* Theme */}
        <div className="login-theme">
          <span
            className={
              darkMode ? "theme-active" : ""
            }
          >
            <span className="theme-symbol"><Moon size={14} /></span>

            <span className="theme-label">
              Dark
            </span>
          </span>

          <button
            type="button"
            className={`theme-toggle ${
              darkMode
                ? "theme-toggle-dark"
                : ""
            }`}
            onClick={toggleTheme}
            aria-label="Toggle dark and light mode"
          >
            <span />
          </button>

          <span
            className={
              !darkMode ? "theme-active" : ""
            }
          >
            <span className="theme-symbol"><Sun size={14} /></span>

            <span className="theme-label">
              Light
            </span>
          </span>
        </div>
      </header>

      {/* =====================================================
          LOGIN CONTENT
      ===================================================== */}

      <section className="login-content">
        <div className="login-wrapper">

          {/* Small welcome label */}
          <div className="login-overline">
            <span />
            <p>SECURE WORKPLACE ACCESS</p>
            <span />
          </div>

          {/* Card */}
          <div className="login-card">

            {/* Top accent */}
            <div className="card-accent" />

            {/* Icon */}
            <div className="login-icon-wrapper">
              <div className="login-icon">
                <svg
                  viewBox="0 0 64 64"
                  fill="none"
                >
                  <circle
                    cx="32"
                    cy="18"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="3"
                  />

                  <path
                    d="M15 48C15 38.6 22.6 31 32 31C41.4 31 49 38.6 49 48"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  <path
                    d="M11 28C7 29 4.5 32.5 4.5 37"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  <path
                    d="M53 28C57 29 59.5 32.5 59.5 37"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Heading */}
            <div className="login-heading">
              <h2>
                Welcome <span>Back</span>
              </h2>

              <p>
                Sign in to access your HRMS
                workspace
              </p>
            </div>

            {/* Form */}
            <form
              className="login-form"
              onSubmit={handleSubmit}
            >

              {/* Email */}
              <div className="form-group">
                <label htmlFor="email">
                  Email Address
                </label>

                <div className="input-wrapper">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="input-icon"
                  >
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="3"
                    />

                    <path d="M3 7L12 13L21 7" />
                  </svg>

                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@company.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Role */}
              <div className="form-group role-group">
                <label htmlFor="role-button">
                  Sign in as
                </label>

                <button
                  id="role-button"
                  type="button"
                  className={`role-selector ${
                    roleOpen
                      ? "role-selector-open"
                      : ""
                  }`}
                  onClick={() =>
                    setRoleOpen(
                      (value) => !value
                    )
                  }
                  aria-expanded={roleOpen}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="input-icon"
                  >
                    <circle
                      cx="9"
                      cy="8"
                      r="3"
                    />

                    <path d="M3 20C3 16.7 5.7 14 9 14C12.3 14 15 16.7 15 20" />

                    <path d="M17 11H21" />
                    <path d="M19 9V13" />
                  </svg>

                  <span className="selected-role">
                    {formData.role === "EMPLOYEE"
                      ? "Employee"
                      : "HR"}
                  </span>

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className={`role-arrow ${
                      roleOpen
                        ? "role-arrow-open"
                        : ""
                    }`}
                  >
                    <path d="M6 9L12 15L18 9" />
                  </svg>
                </button>

                {roleOpen && (
                  <div className="role-dropdown">

                    {/* Employee */}
                    <button
                      type="button"
                      className={`role-option ${
                        formData.role ===
                        "EMPLOYEE"
                          ? "role-option-selected"
                          : ""
                      }`}
                      onClick={() =>
                        handleRoleChange(
                          "EMPLOYEE"
                        )
                      }
                    >
                      <div className="role-option-icon">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            cx="9"
                            cy="8"
                            r="3"
                          />

                          <path d="M3 20C3 16.7 5.7 14 9 14C12.3 14 15 16.7 15 20" />
                        </svg>
                      </div>

                      <div className="role-option-text">
                        <strong>
                          Employee
                        </strong>

                        <span>
                          Employee workspace
                        </span>
                      </div>

                      {formData.role ===
                        "EMPLOYEE" && (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className="role-check"
                        >
                          <path d="M5 12L10 17L19 7" />
                        </svg>
                      )}
                    </button>

                    {/* HR */}
                    <button
                      type="button"
                      className={`role-option ${
                        formData.role === "HR"
                          ? "role-option-selected"
                          : ""
                      }`}
                      onClick={() =>
                        handleRoleChange("HR")
                      }
                    >
                      <div className="role-option-icon">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path d="M4 21V5C4 4.4 4.4 4 5 4H15C15.6 4 16 4.4 16 5V21" />

                          <path d="M16 9H20V21" />

                          <path d="M8 8H11" />
                          <path d="M8 12H11" />
                          <path d="M8 16H11" />
                        </svg>
                      </div>

                      <div className="role-option-text">
                        <strong>HR</strong>

                        <span>
                          Human Resources
                          workspace
                        </span>
                      </div>

                      {formData.role === "HR" && (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className="role-check"
                        >
                          <path d="M5 12L10 17L19 7" />
                        </svg>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Password */}
              <div className="form-group">
                <div className="password-label-row">
                  <label htmlFor="password">
                    Password
                  </label>

                  <button
                    type="button"
                    className="forgot-button"
                    onClick={() =>
                      navigate(
                        "/forgot-password"
                      )
                    }
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="input-wrapper">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="input-icon"
                  >
                    <rect
                      x="4"
                      y="10"
                      width="16"
                      height="11"
                      rx="3"
                    />

                    <path d="M8 10V7C8 4.8 9.8 3 12 3C14.2 3 16 4.8 16 7V10" />
                  </svg>

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (value) => !value
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path d="M3 3L21 21" />

                        <path d="M10.6 10.6A2 2 0 0 0 13.4 13.4" />

                        <path d="M9.9 4.2A10.5 10.5 0 0 1 12 4C17 4 20.5 8 21 12C20.8 13.5 20.1 15 19 16.2" />

                        <path d="M6.6 6.6C4.6 7.9 3.3 9.8 3 12C3.5 16 7 20 12 20C13.5 20 14.9 19.6 16.1 18.9" />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path d="M2.5 12C4 8 7.3 5 12 5C16.7 5 20 8 21.5 12C20 16 16.7 19 12 19C7.3 19 4 16 2.5 12Z" />

                        <circle
                          cx="12"
                          cy="12"
                          r="3"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="login-submit"
              >
                {loading ? (
                  <>
                    <span className="login-spinner" />

                    <span>
                      Signing in...
                    </span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>

                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path d="M5 12H19" />
                      <path d="M13 6L19 12L13 18" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Security */}
            <div className="login-security">
              <svg
                viewBox="0 0 24 24"
                fill="none"
              >
                <path d="M12 3L20 6V11C20 16.2 16.7 20.4 12 22C7.3 20.4 4 16.2 4 11V6L12 3Z" />

                <path d="M9 12L11 14L15 10" />
              </svg>

              <span>
                Protected by enterprise-grade
                security
              </span>
            </div>
          </div>

          {/* Back */}
          <button
            type="button"
            className="back-button"
            onClick={() => navigate("/")}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
            >
              <path d="M19 12H5" />
              <path d="M11 18L5 12L11 6" />
            </svg>

            Back to Welcome
          </button>

          {/* Footer */}
          <p className="login-footer">
            © 2026 Mediatize Tech Pvt Ltd. All
            rights reserved.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;