import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CalendarDays,
  Tags,
  WalletCards,
  ClipboardList,
  Bell,
  UserRound,
  FolderGit2,
  FolderKanban,
  Megaphone,
  FileText,
  AlertCircle,
  Award,
  TrendingUp,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useAuth } from "../../authentication_service/hooks/useAuth";

export default function Sidebar({ isCollapsed, onToggleCollapse, onItemClick }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const role = user?.role || "EMPLOYEE";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navSections =
    role === "HR"
      ? [
          {
            title: "WORKSPACE",
            items: [
              { label: "Dashboard", path: "/hr/dashboard", icon: LayoutDashboard },
              { label: "HR Profile", path: "/hr/profile", icon: UserRound },
              { label: "Employees", path: "/hr/employees", icon: Users },
              { label: "Projects", path: "/hr/projects", icon: FolderGit2 },
              { label: "Project Roles", path: "/hr/project-roles", icon: FolderKanban },
              { label: "My Attendance", path: "/hr/my-attendance", icon: CalendarCheck },
              { label: "Attendance Mgmt", path: "/hr/attendance", icon: CalendarCheck },
              { label: "Leave Requests", path: "/hr/leaves", icon: CalendarDays },
            ],
          },
          {
            title: "PEOPLE & OPERATIONS",
            items: [
              { label: "Performance", path: "/hr/performance", icon: TrendingUp },
              { label: "Announcements", path: "/hr/announcements", icon: Megaphone },
              { label: "Notifications", path: "/notifications", icon: Bell },
              { label: "Leave Types", path: "/hr/leave-types", icon: Tags },
              { label: "Leave Balances", path: "/hr/leave-balances", icon: WalletCards },
            ],
          },
          {
            title: "SUPPORT & SYSTEM",
            items: [
              { label: "Complaints", path: "/hr/complaints", icon: AlertCircle },
              { label: "Work Reports", path: "/hr/work-reports", icon: FileText },
              { label: "Audit Logs", path: "/hr/audit-logs", icon: ClipboardList },
            ],
          },
        ]
      : [
          {
            title: "WORKSPACE",
            items: [
              { label: "Dashboard", path: "/employee/dashboard", icon: LayoutDashboard },
              { label: "My Profile", path: "/employee/profile", icon: UserRound },
              { label: "My Projects", path: "/employee/projects", icon: FolderGit2 },
              { label: "Attendance", path: "/employee/attendance", icon: CalendarCheck },
              { label: "Apply for Leave", path: "/employee/leave", icon: CalendarDays },
            ],
          },
          {
            title: "PEOPLE & OPERATIONS",
            items: [
              { label: "My Performance", path: "/employee/performance", icon: Award },
              { label: "Announcements", path: "/employee/announcements", icon: Megaphone },
              { label: "Notifications", path: "/notifications", icon: Bell },
            ],
          },
          {
            title: "SUPPORT & SYSTEM",
            items: [
              { label: "Complaints", path: "/employee/complaints", icon: AlertCircle },
              { label: "Work Reports", path: "/employee/work-reports", icon: FileText },
            ],
          },
        ];

  return (
    <aside className={`hrms-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="hrms-sidebar-brand">
        <div className="hrms-brand-left">
          <div className="hrms-brand-logo" title="Mediatize Tech HRMS">
            M
          </div>
          {!isCollapsed && (
            <div className="hrms-brand-text">
              <span className="hrms-brand-company">MEDIATIZE TECH</span>
              <span className="hrms-brand-title">HRMS</span>
            </div>
          )}
        </div>
        <button
          type="button"
          className="hrms-sidebar-toggle-btn"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight size={18} strokeWidth={2} />
          ) : (
            <ChevronLeft size={18} strokeWidth={2} />
          )}
        </button>
      </div>

      <nav className="hrms-sidebar-nav">
        {navSections.map((section, idx) => (
          <div key={idx} className="hrms-nav-group">
            {!isCollapsed && <div className="hrms-nav-section-title">{section.title}</div>}
            {section.items.map((item) => {
              const isActive = location.pathname === item.path;
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`hrms-nav-item ${isActive ? "active" : ""}`}
                  onClick={onItemClick}
                  title={isCollapsed ? item.label : undefined}
                >
                  <IconComponent className="hrms-nav-icon" size={18} strokeWidth={2} />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="hrms-sidebar-footer">
        <button
          onClick={handleLogout}
          className="hrms-logout-btn"
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut size={18} strokeWidth={2} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
