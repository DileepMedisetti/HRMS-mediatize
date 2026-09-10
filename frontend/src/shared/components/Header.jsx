import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import {
  Menu,
  ChevronDown,
  LogOut,
  X,
} from "lucide-react";
import { useAuth } from "../../authentication_service/hooks/useAuth";
import NotificationBell from "../../notification_service/components/NotificationBell";
import ThemeToggle from "./ThemeToggle";
import { Avatar } from "./Badge";

export function getUserDisplayName(user) {
  if (!user) return "User";

  const firstName = user.first_name ? user.first_name.trim() : "";
  const lastName = user.last_name ? user.last_name.trim() : "";

  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }

  if (firstName) {
    return firstName;
  }

  if (lastName) {
    return lastName;
  }

  return "User";
}

export default function Header({ pageTitle, onOpenMobileMenu }) {
  const { user, logout } = useAuth();

  const [now, setNow] = useState(() => new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);

  const dropdownRef = useRef(null);
  const location = useLocation();

  // ============================================================
  // CURRENT DATE AND TIME
  // ============================================================
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ============================================================
  // CLOSE DROPDOWN / PREVIEW ON ROUTE CHANGE
  // ============================================================
  useEffect(() => {
    setIsOpen(false);
    setIsImagePreviewOpen(false);
  }, [location.pathname]);

  // ============================================================
  // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
  // ============================================================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // ============================================================
  // ESCAPE KEY
  // ============================================================
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") {
        return;
      }

      if (isImagePreviewOpen) {
        setIsImagePreviewOpen(false);
        return;
      }

      if (isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen || isImagePreviewOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isImagePreviewOpen]);

  // ============================================================
  // PREVENT BACKGROUND SCROLL WHEN PREVIEW IS OPEN
  // ============================================================
  useEffect(() => {
    if (!isImagePreviewOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isImagePreviewOpen]);

  // ============================================================
  // DATE / TIME
  // ============================================================
  const dateFull = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const dateShort = now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // ============================================================
  // USER INFORMATION
  // ============================================================
  const displayName = getUserDisplayName(user);
  const userRole = user?.role || "EMPLOYEE";
  const userEmail = user?.email || "";
  const profilePhotoUrl = user?.profile_photo_url;

  // ============================================================
  // LOGOUT
  // ============================================================
  const handleLogout = () => {
    setIsOpen(false);
    setIsImagePreviewOpen(false);

    if (logout) {
      logout();
    }
  };

  // ============================================================
  // PROFILE IMAGE PREVIEW
  // ============================================================
  const handleProfileImageClick = () => {
    if (profilePhotoUrl) {
      setIsImagePreviewOpen(true);
    }
  };

  const handleCloseImagePreview = () => {
    setIsImagePreviewOpen(false);
  };

  // ============================================================
  // PROFILE IMAGE LIGHTBOX
  // ============================================================
  const profileImagePreview =
    isImagePreviewOpen &&
    profilePhotoUrl &&
    typeof document !== "undefined"
      ? createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${displayName} profile picture`}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                handleCloseImagePreview();
              }
            }}
            style={{
              position: "fixed",
              inset: 0,

              width: "100vw",
              height: "100vh",

              zIndex: 2147483647,

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              boxSizing: "border-box",

              padding:
                "clamp(12px, 2.5vw, 32px)",

              backgroundColor:
                "rgba(0, 0, 0, 0.88)",

              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",

              overflow: "hidden",
            }}
          >
            {/* ==================================================
                LIGHTBOX CONTENT
                ================================================== */}
            <div
              onMouseDown={(event) => {
                event.stopPropagation();
              }}
              style={{
                width: "100%",
                height: "100%",

                display: "flex",
                flexDirection: "column",

                alignItems: "center",
                justifyContent: "center",

                boxSizing: "border-box",

                minWidth: 0,
                minHeight: 0,
              }}
            >
              {/* ==================================================
                  RESPONSIVE IMAGE VIEWING AREA

                  This is the important correction.

                  The previous implementation allowed a small
                  image to remain at its intrinsic size.

                  Now the viewing area itself is responsive,
                  and the image fills it while maintaining its
                  original aspect ratio.
                  ================================================== */}
              <div
                style={{
                  width: "min(82vw, 900px)",
                  height: "min(76vh, 760px)",

                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",

                  boxSizing: "border-box",

                  minWidth: 0,
                  minHeight: 0,

                  flexShrink: 1,
                }}
              >
                <img
                  src={profilePhotoUrl}
                  alt={`${displayName} profile`}
                  draggable="false"
                  style={{
                    display: "block",

                    /*
                     * Fill the responsive viewing area.
                     * The image will NEVER be stretched because
                     * object-fit is contain.
                     */
                    width: "100%",
                    height: "100%",

                    objectFit: "contain",

                    objectPosition: "center",

                    borderRadius: "20px",

                    backgroundColor: "#ffffff",

                    boxShadow:
                      "0 30px 90px rgba(0, 0, 0, 0.7)",

                    userSelect: "none",

                    WebkitUserDrag: "none",

                    minWidth: 0,
                    minHeight: 0,
                  }}
                />
              </div>

              {/* ==================================================
                  PROFILE NAME
                  ================================================== */}
              <div
                style={{
                  marginTop: "14px",

                  maxWidth: "80vw",

                  color: "#ffffff",

                  fontSize:
                    "clamp(14px, 1.2vw, 18px)",

                  fontWeight: "600",

                  lineHeight: "1.4",

                  textAlign: "center",

                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",

                  flexShrink: 0,
                }}
              >
                {displayName}
              </div>

              {/* ==================================================
                  RED CLOSE BUTTON
                  ================================================== */}
              <button
                type="button"
                onClick={handleCloseImagePreview}
                aria-label="Close profile picture preview"
                style={{
                  marginTop: "14px",

                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",

                  gap: "8px",

                  minWidth: "116px",

                  padding: "11px 22px",

                  border:
                    "1px solid #dc2626",

                  borderRadius: "10px",

                  backgroundColor: "#dc2626",

                  color: "#ffffff",

                  fontSize: "14px",

                  fontWeight: "600",

                  cursor: "pointer",

                  boxShadow:
                    "0 8px 25px rgba(220, 38, 38, 0.35)",

                  transition:
                    "background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease",

                  whiteSpace: "nowrap",

                  flexShrink: 0,

                  WebkitTapHighlightColor:
                    "transparent",
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.backgroundColor =
                    "#b91c1c";

                  event.currentTarget.style.transform =
                    "translateY(-1px)";

                  event.currentTarget.style.boxShadow =
                    "0 10px 28px rgba(220, 38, 38, 0.45)";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.backgroundColor =
                    "#dc2626";

                  event.currentTarget.style.transform =
                    "translateY(0)";

                  event.currentTarget.style.boxShadow =
                    "0 8px 25px rgba(220, 38, 38, 0.35)";
                }}
                onMouseDown={(event) => {
                  event.currentTarget.style.transform =
                    "translateY(0)";
                }}
              >
                <X
                  size={17}
                  strokeWidth={2.5}
                />

                <span>Close</span>
              </button>
            </div>
          </div>,
          document.body
        )
      : null;

  // ============================================================
  // HEADER
  // ============================================================
  return (
    <>
      <header className="hrms-header">
        <div className="hrms-header-left">
          <button
            onClick={onOpenMobileMenu}
            className="hrms-hamburger-btn"
            aria-label="Open navigation menu"
            title="Open Menu"
          >
            <Menu
              size={20}
              strokeWidth={2}
            />
          </button>

          <h1 className="hrms-page-title">
            {pageTitle || "Mediatize HRMS"}
          </h1>
        </div>

        <div className="hrms-header-right">
          <ThemeToggle />

          <NotificationBell />

          <div
            className="hrms-header-datetime"
            aria-label="Current date and time"
          >
            <span className="hrms-header-date hrms-date-full">
              {dateFull}
            </span>

            <span className="hrms-header-date hrms-date-short">
              {dateShort}
            </span>

            <span className="hrms-header-time">
              {timeStr}
            </span>
          </div>

          {/* ======================================================
              GLOBAL PROFILE DROPDOWN
              ====================================================== */}
          <div
            className="hrms-profile-wrapper"
            ref={dropdownRef}
          >
            <button
              type="button"
              className="hrms-user-profile-btn"
              onClick={() =>
                setIsOpen((prev) => !prev)
              }
              aria-haspopup="menu"
              aria-expanded={isOpen}
              aria-label="User profile menu"
            >
              <Avatar
                src={profilePhotoUrl}
                name={displayName}
                size="sm"
              />

              <div className="hrms-user-info">
                <span
                  className="hrms-user-name"
                  title={displayName}
                >
                  {displayName}
                </span>

                <span className="hrms-role-badge">
                  {userRole}
                </span>
              </div>

              <ChevronDown
                size={14}
                className={`hrms-profile-chevron ${
                  isOpen ? "open" : ""
                }`}
              />
            </button>

            {/* ==================================================
                PROFILE DROPDOWN
                ================================================== */}
            {isOpen && (
              <div
                className="hrms-profile-dropdown"
                role="menu"
                aria-label="Profile actions"
              >
                <div className="hrms-dropdown-header">
                  {/* Clickable Profile Picture */}
                  <button
                    type="button"
                    onClick={
                      handleProfileImageClick
                    }
                    disabled={!profilePhotoUrl}
                    aria-label={
                      profilePhotoUrl
                        ? "View profile picture"
                        : "Profile picture unavailable"
                    }
                    title={
                      profilePhotoUrl
                        ? "View profile picture"
                        : "Profile picture unavailable"
                    }
                    style={{
                      border: "none",

                      background:
                        "transparent",

                      padding: 0,
                      margin: 0,

                      display: "inline-flex",

                      alignItems:
                        "center",

                      justifyContent:
                        "center",

                      borderRadius: "50%",

                      cursor: profilePhotoUrl
                        ? "zoom-in"
                        : "default",

                      flexShrink: 0,

                      outline: "none",

                      WebkitTapHighlightColor:
                        "transparent",
                    }}
                  >
                    <Avatar
                      src={profilePhotoUrl}
                      name={displayName}
                      size="md"
                    />
                  </button>

                  <div className="hrms-dropdown-user-details">
                    <span className="hrms-dropdown-name">
                      {displayName}
                    </span>

                    {userEmail && (
                      <span className="hrms-dropdown-email">
                        {userEmail}
                      </span>
                    )}

                    <span className="hrms-dropdown-role-badge">
                      {userRole}
                    </span>
                  </div>
                </div>

                {/* ==================================================
                    LOGOUT
                    ================================================== */}
                <div className="hrms-dropdown-body">
                  <button
                    type="button"
                    className="hrms-dropdown-logout-btn"
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Profile Image Lightbox */}
      {profileImagePreview}
    </>
  );
}