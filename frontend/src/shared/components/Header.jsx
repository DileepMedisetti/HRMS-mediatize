import React, { useState, useEffect } from "react";
import { Menu } from "lucide-react";
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
  const { user } = useAuth();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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

        <div className="hrms-user-profile">
          <Avatar src={user?.profile_photo_url} name={displayName} size="sm" />
          <div className="hrms-user-info">
            <span className="hrms-user-name" title={displayName}>{displayName}</span>
            <span className="hrms-role-badge">{user?.role || "EMPLOYEE"}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
