import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";

import authApi from "../services/authApi";
import "./ForgotPassword.css";

import { useTheme } from "../../shared/context/ThemeContext";
import { showSuccess, showError } from "../../shared/utils/toast";

function ForgotPassword() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const darkMode = theme === "dark";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      showError("Please enter your registered email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.post(
        "/forgot-password",
        {
          email: email.trim(),
        }
      );

      console.log(
        "Forgot password response:",
        response.data
      );

      showSuccess(
        response.data?.message ||
          "Password reset request submitted successfully."
      );

      setEmail("");
    } catch (error) {
      console.error(
        "Forgot password error:",
        error
      );

      if (error.response) {
        showError(
          error.response.data?.detail ||
            "Unable to submit password reset request."
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
      className={`forgot-page ${
        darkMode ? "dark" : "light"
      }`}
    >
      {/* =====================================================
          ANIMATED BACKGROUND
      ===================================================== */}

      <div
        className="forgot-background"
        aria-hidden="true"
      >
        <div className="forgot-grid" />

        <div className="forgot-glow forgot-glow-one" />
        <div className="forgot-glow forgot-glow-two" />
        <div className="forgot-glow forgot-glow-three" />

        <div className="forgot-orbit forgot-orbit-one" />
        <div className="forgot-orbit forgot-orbit-two" />
        <div className="forgot-orbit forgot-orbit-three" />

        <div className="forgot-particles">
          {Array.from({ length: 32 }).map(
            (_, index) => (
              <span
                key={index}
                className="forgot-particle"
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

        <div className="forgot-wave forgot-wave-one" />
        <div className="forgot-wave forgot-wave-two" />
      </div>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="forgot-header">
        <button
          type="button"
          className="forgot-brand"
          onClick={() => navigate("/")}
        >
          <div className="forgot-brand-icon">
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

          <div className="forgot-brand-text">
            <h1>HRMS</h1>
            <p>Mediatize Tech Pvt Ltd</p>
          </div>
        </button>

        {/* Theme */}
        <div className="forgot-theme">
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
          CONTENT
      ===================================================== */}

      <section className="forgot-content">
        <div className="forgot-wrapper">

          {/* Overline */}
          <div className="forgot-overline">
            <span />
            <p>ACCOUNT RECOVERY</p>
            <span />
          </div>

          {/* Card */}
          <div className="forgot-card">

            {/* Accent */}
            <div className="forgot-card-accent" />

            {/* Icon */}
            <div className="forgot-icon-wrapper">
              <div className="forgot-icon">
                <svg
                  viewBox="0 0 64 64"
                  fill="none"
                >
                  <rect
                    x="16"
                    y="25"
                    width="32"
                    height="25"
                    rx="6"
                    stroke="currentColor"
                    strokeWidth="3"
                  />

                  <path
                    d="M22 25V19C22 13.5 26.5 9 32 9C37.5 9 42 13.5 42 19V25"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  <circle
                    cx="32"
                    cy="37"
                    r="3"
                    fill="currentColor"
                  />

                  <path
                    d="M32 40V44"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Heading */}
            <div className="forgot-heading">
              <h2>
                Forgot <span>Password?</span>
              </h2>

              <p>
                Enter your registered email address
                and submit a password reset request.
              </p>
            </div>

            {/* Form */}
            <form
              className="forgot-form"
              onSubmit={handleSubmit}
            >
              <div className="form-group">
                <label htmlFor="forgot-email">
                  Registered Email Address
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
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@company.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="forgot-submit"
              >
                {loading ? (
                  <>
                    <span className="forgot-spinner" />

                    <span>
                      Submitting...
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      Submit Reset Request
                    </span>

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

            {/* Information */}
            <div className="forgot-info">
              <svg
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                />

                <path d="M12 11V16" />

                <path d="M12 8H12.01" />
              </svg>

              <p>
                Your request will be reviewed by HR.
                If approved, a temporary password
                will be sent to your registered email
                address.
              </p>
            </div>
          </div>

          {/* Back to Login */}
          <button
            type="button"
            className="forgot-back-button"
            onClick={() => navigate("/login")}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
            >
              <path d="M19 12H5" />
              <path d="M11 18L5 12L11 6" />
            </svg>

            Back to Login
          </button>

          {/* Footer */}
          <p className="forgot-footer">
            © 2026 Mediatize Tech Pvt Ltd. All
            rights reserved.
          </p>
        </div>
      </section>
    </main>
  );
}

export default ForgotPassword;