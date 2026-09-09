import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Menu, ChevronDown, LogOut } from "lucide-react";
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
  const dropdownRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Close dropdown menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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

  // Close dropdown menu on Escape keypress
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

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

  const displayName = getUserDisplayName(user);
  const userRole = user?.role || "EMPLOYEE";
  const userEmail = user?.email || "";

  const handleLogout = () => {
    setIsOpen(false);
    if (logout) {
      logout();
    }
  };

  return (
    <header className="hrms-header">
      <div className="hrms-header-left">
        <button
          onClick={onOpenMobileMenu}
          className="hrms-hamburger-btn"
          aria-label="Open navigation menu"
          title="Open Menu"
        >
          <Menu size={20} strokeWidth={2} />
        </button>

        <h1 className="hrms-page-title">{pageTitle || "Mediatize HRMS"}</h1>
      </div>

      <div className="hrms-header-right">
        <ThemeToggle />
        <NotificationBell />

        <div className="hrms-header-datetime" aria-label="Current date and time">
          <span className="hrms-header-date hrms-date-full">{dateFull}</span>
          <span className="hrms-header-date hrms-date-short">{dateShort}</span>
          <span className="hrms-header-time">{timeStr}</span>
        </div>

        {/* Global Profile Dropdown Component */}
        <div className="hrms-profile-wrapper" ref={dropdownRef}>
          <button
            type="button"
            className="hrms-user-profile-btn"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-haspopup="menu"
            aria-expanded={isOpen}
            aria-label="User profile menu"
          >
            <Avatar src={user?.profile_photo_url} name={displayName} size="sm" />
            <div className="hrms-user-info">
              <span className="hrms-user-name" title={displayName}>
                {displayName}
              </span>
              <span className="hrms-role-badge">{userRole}</span>
            </div>
            <ChevronDown
              size={14}
              className={`hrms-profile-chevron ${isOpen ? "open" : ""}`}
            />
          </button>

          {/* Dropdown Menu Popover */}
          {isOpen && (
            <div className="hrms-profile-dropdown" role="menu" aria-label="Profile actions">
              <div className="hrms-dropdown-header">
                <Avatar src={user?.profile_photo_url} name={displayName} size="md" />
                <div className="hrms-dropdown-user-details">
                  <span className="hrms-dropdown-name">{displayName}</span>
                  {userEmail && <span className="hrms-dropdown-email">{userEmail}</span>}
                  <span className="hrms-dropdown-role-badge">{userRole}</span>
                </div>
              </div>

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
  );
}

