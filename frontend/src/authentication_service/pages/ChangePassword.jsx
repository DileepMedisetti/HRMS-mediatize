import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Sun, Eye, EyeOff, Check } from "lucide-react";

import authApi from "../services/authApi";
import "./ChangePassword.css";
import { showSuccess, showError, showWarning } from "../../shared/utils/toast";

function ChangePassword() {
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("hrms-theme") !== "light";
  });

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem(
      "hrms-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const validatePassword = () => {
    const {
      current_password,
      new_password,
      confirm_password,
    } = formData;

    if (!current_password) {
      showError("Please enter your current password.");
      return false;
    }

    if (!new_password) {
      showError("Please enter your new password.");
      return false;
    }

    if (new_password.length < 6) {
      showError(
        "New password must contain at least 6 characters."
      );
      return false;
    }

    if (new_password === current_password) {
      showError(
        "New password must be different from your current password."
      );
      return false;
    }

    if (!confirm_password) {
      showError("Please confirm your new password.");
      return false;
    }

    if (new_password !== confirm_password) {
      showError(
        "New password and confirmation password do not match."
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validatePassword()) {
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.post(
        "/change-password",
        {
          current_password: formData.current_password,
          new_password: formData.new_password,
          confirm_password: formData.confirm_password,
        }
      );

      console.log(
        "Change password response:",
        response.data
      );

      /*
       * Password has been changed successfully.
       *
       * The existing JWT should no longer be kept
       * in the browser session.
       */
      localStorage.removeItem("hrms_token");

      /*
       * Clear the form before redirecting.
       */
      setFormData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });

      showSuccess(
        response.data?.message ||
          "Password changed successfully!"
      );

      /*
       * Give the user time to see the success message,
       * then return to the login page.
       */
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);
    } catch (error) {
      console.error(
        "Change password error:",
        error
      );

      if (error.response) {
        showError(
          error.response.data?.detail ||
            "Unable to change password."
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

  const getPasswordStrength = () => {
    const password = formData.new_password;

    if (!password) {
      return {
        label: "",
        level: 0,
      };
    }

    let score = 0;

    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) {
      return {
        label: "Weak",
        level: 1,
      };
    }

    if (score <= 4) {
      return {
        label: "Medium",
        level: 2,
      };
    }

    return {
      label: "Strong",
      level: 3,
    };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <main
      className={`change-password-page ${
        darkMode ? "dark" : "light"
      }`}
    >
      {/* =====================================================
          ANIMATED BACKGROUND
      ===================================================== */}

      <div
        className="change-password-background"
        aria-hidden="true"
      >
        <div className="change-password-grid" />

        <div className="change-password-glow change-password-glow-one" />
        <div className="change-password-glow change-password-glow-two" />
        <div className="change-password-glow change-password-glow-three" />

        <div className="change-password-orbit change-password-orbit-one" />
        <div className="change-password-orbit change-password-orbit-two" />

        <div className="change-password-particles">
          {Array.from({ length: 32 }).map(
            (_, index) => (
              <span
                key={index}
                className="change-password-particle"
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
      </div>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="change-password-header">
        <button
          type="button"
          className="change-password-brand"
          onClick={() => navigate("/")}
        >
          <div className="change-password-brand-icon">
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

          <div className="change-password-brand-text">
            <h1>HRMS</h1>
            <p>Mediatize Tech Pvt Ltd</p>
          </div>
        </button>

        {/* Theme */}
        <div className="change-password-theme">
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
            className={`change-password-theme-toggle ${
              darkMode ? "toggle-dark" : ""
            }`}
            onClick={() =>
              setDarkMode((value) => !value)
            }
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

      <section className="change-password-content">
        <div className="change-password-wrapper">

          <div className="change-password-overline">
            <span />
            <p>ACCOUNT SECURITY</p>
            <span />
          </div>

          <div className="change-password-card">

            <div className="change-password-accent" />

            {/* Icon */}
            <div className="change-password-icon-wrapper">
              <div className="change-password-icon">
                <svg
                  viewBox="0 0 64 64"
                  fill="none"
                >
                  <rect
                    x="14"
                    y="27"
                    width="36"
                    height="25"
                    rx="6"
                    stroke="currentColor"
                    strokeWidth="3"
                  />

                  <path
                    d="M21 27V19C21 12.9 25.9 8 32 8C38.1 8 43 12.9 43 19V27"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  <circle
                    cx="32"
                    cy="39"
                    r="3"
                    fill="currentColor"
                  />

                  <path
                    d="M32 42V46"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Heading */}
            <div className="change-password-heading">
              <h2>
                Change <span>Password</span>
              </h2>

              <p>
                Update your password to keep your
                HRMS account secure.
              </p>
            </div>

            {/* Form */}
            <form
              className="change-password-form"
              onSubmit={handleSubmit}
            >

              {/* Current Password */}
              <div className="change-password-form-group">
                <label htmlFor="current_password">
                  Current Password
                </label>

                <div className="change-password-input">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
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
                    id="current_password"
                    name="current_password"
                    type={
                      showCurrentPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      formData.current_password
                    }
                    onChange={handleChange}
                    placeholder="Enter current password"
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="change-password-toggle"
                    onClick={() =>
                      setShowCurrentPassword(
                        (value) => !value
                      )
                    }
                    aria-label={
                      showCurrentPassword
                        ? "Hide current password"
                        : "Show current password"
                    }
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="change-password-form-group">
                <label htmlFor="new_password">
                  New Password
                </label>

                <div className="change-password-input">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
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
                    id="new_password"
                    name="new_password"
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      formData.new_password
                    }
                    onChange={handleChange}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="change-password-toggle"
                    onClick={() =>
                      setShowNewPassword(
                        (value) => !value
                      )
                    }
                    aria-label={
                      showNewPassword
                        ? "Hide new password"
                        : "Show new password"
                    }
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password Strength */}
                {formData.new_password && (
                  <div className="password-strength">
                    <div className="strength-header">
                      <span>
                        Password strength
                      </span>

                      <strong
                        className={`strength-${passwordStrength.level}`}
                      >
                        {passwordStrength.label}
                      </strong>
                    </div>

                    <div className="strength-bars">
                      {[1, 2, 3].map(
                        (level) => (
                          <span
                            key={level}
                            className={
                              passwordStrength.level >=
                              level
                                ? `strength-filled strength-${passwordStrength.level}`
                                : ""
                            }
                          />
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="change-password-form-group">
                <label htmlFor="confirm_password">
                  Confirm New Password
                </label>

                <div className="change-password-input">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
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
                    id="confirm_password"
                    name="confirm_password"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      formData.confirm_password
                    }
                    onChange={handleChange}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="change-password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        (value) => !value
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirmation password"
                        : "Show confirmation password"
                    }
                  >
                    {showConfirmPassword
                      ? <EyeOff size={16} />
                      : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Requirements */}
              <div className="password-requirements">
                <div className="requirements-title">
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

                  <span>
                    Password requirements
                  </span>
                </div>

                <div className="requirements-list">
                  <span
                    className={
                      formData.new_password
                        .length >= 6
                        ? "requirement-met"
                        : ""
                    }
                  >
                    <Check size={12} style={{ display: "inline-block", marginRight: "4px" }} /> At least 6 characters
                  </span>

                  <span
                    className={
                      formData.new_password &&
                      /[A-Z]/.test(
                        formData.new_password
                      )
                        ? "requirement-met"
                        : ""
                    }
                  >
                    <Check size={12} style={{ display: "inline-block", marginRight: "4px" }} /> Uppercase letter
                  </span>

                  <span
                    className={
                      formData.new_password &&
                      /[0-9]/.test(
                        formData.new_password
                      )
                        ? "requirement-met"
                        : ""
                    }
                  >
                    <Check size={12} style={{ display: "inline-block", marginRight: "4px" }} /> Number
                  </span>

                  <span
                    className={
                      formData.new_password &&
                      /[^A-Za-z0-9]/.test(
                        formData.new_password
                      )
                        ? "requirement-met"
                        : ""
                    }
                  >
                    <Check size={12} style={{ display: "inline-block", marginRight: "4px" }} /> Special character
                  </span>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="change-password-submit"
              >
                {loading ? (
                  <>
                    <span className="change-password-spinner" />

                    <span>
                      Updating Password...
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      Change Password
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

            {/* Security */}
            <div className="change-password-security">
              <svg
                viewBox="0 0 24 24"
                fill="none"
              >
                <path d="M12 3L20 6V11C20 16.2 16.7 20.4 12 22C7.3 20.4 4 16.2 4 11V6L12 3Z" />

                <path d="M9 12L11 14L15 10" />
              </svg>

              <span>
                Your password is securely encrypted
              </span>
            </div>
          </div>

          {/* Back */}
          <button
            type="button"
            className="change-password-back"
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
          <p className="change-password-footer">
            © 2026 Mediatize Tech Pvt Ltd. All
            rights reserved.
          </p>
        </div>
      </section>
    </main>
  );
}

export default ChangePassword;