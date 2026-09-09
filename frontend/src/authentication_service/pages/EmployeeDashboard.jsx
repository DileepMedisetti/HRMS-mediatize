import React from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  UserRound,
  ArrowRight,
  AlertCircle,
  Award,
  FolderGit2,
  FileText,
  Megaphone,
} from "lucide-react";

import AppLayout from "../../shared/components/AppLayout";
import DashboardDateTime from "../../shared/components/DashboardDateTime";
import { getUserDisplayName } from "../../shared/components/Header";
import { useAuth } from "../hooks/useAuth";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const displayName = getUserDisplayName(user);
  const firstName = user?.first_name ? user.first_name.trim() : displayName !== "User" ? displayName : "Employee";

  return (
    <AppLayout title="Personal Employee Portal">
      <div className="hrms-page-container">
        {/* Personal Hero Welcome Banner */}
        <div style={styles.heroBanner}>
          <div style={styles.heroContent}>
            <div style={styles.heroBadge}>
              <span style={styles.heroDot} />
              <span>PERSONAL WORKSPACE</span>
            </div>
            <h2 style={styles.heroTitle}>
              Good morning, <span style={styles.highlight}>{firstName}</span>
            </h2>
            <p style={styles.heroSubtitle}>
              Welcome to your personal workforce dashboard. Access daily workforce self-service tools, check attendance, submit reports, and track assigned projects.
            </p>
          </div>
          <div style={styles.heroRight}>
            <DashboardDateTime />
            <div style={styles.roleTag}>
              <span>Role:</span>
              <span className="hrms-badge hrms-badge-info" style={{ fontWeight: "700" }}>
                {user?.role || "EMPLOYEE"}
              </span>
            </div>
          </div>
        </div>

        {/* Self-Service Action Center */}
        <div style={styles.sectionHeaderRow}>
          <h3 style={styles.sectionHeaderTitle}>Self-Service Action Center</h3>
          <span style={styles.sectionHeaderSubtitle}>Quick access to daily workforce tasks and personal records</span>
        </div>

        <div style={styles.actionGrid}>
          {/* Prominent Apply for Leave Card */}
          <div className="hrms-card hrms-card-interactive" style={{ ...styles.actionCard, borderColor: "var(--primary-color)" }}>
            <div style={styles.cardTop}>
              <div style={{ ...styles.iconBox, backgroundColor: "var(--primary-light)", color: "var(--primary-color)" }}>
                <CalendarDays size={24} strokeWidth={2} />
              </div>
              <div>
                <h4 style={styles.cardTitle}>Apply for Leave</h4>
                <p style={styles.cardSub}>Submit leave applications & view balance details on Leave page</p>
              </div>
            </div>
            <Link to="/employee/leave" className="hrms-btn hrms-btn-primary" style={{ width: "100%" }}>
              <span>Apply for Leave</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* My Projects */}
          <div className="hrms-card hrms-card-interactive" style={styles.actionCard}>
            <div style={styles.cardTop}>
              <div style={{ ...styles.iconBox, backgroundColor: "var(--info-bg)", color: "var(--info-color)" }}>
                <FolderGit2 size={24} strokeWidth={2} />
              </div>
              <div>
                <h4 style={styles.cardTitle}>My Assigned Projects</h4>
                <p style={styles.cardSub}>Inspect assigned projects, deliverables & team roles</p>
              </div>
            </div>
            <Link to="/employee/projects" className="hrms-btn hrms-btn-secondary" style={{ width: "100%" }}>
              <span>My Projects</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Attendance Management */}
          <div className="hrms-card hrms-card-interactive" style={styles.actionCard}>
            <div style={styles.cardTop}>
              <div style={{ ...styles.iconBox, backgroundColor: "var(--success-bg)", color: "var(--success-color)" }}>
                <Clock size={24} strokeWidth={2} />
              </div>
              <div>
                <h4 style={styles.cardTitle}>Attendance Management</h4>
                <p style={styles.cardSub}>Check-in, check-out & view daily attendance logs</p>
              </div>
            </div>
            <Link to="/employee/attendance" className="hrms-btn hrms-btn-secondary" style={{ width: "100%" }}>
              <span>View Attendance</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* My Performance & Goals */}
          <div className="hrms-card hrms-card-interactive" style={styles.actionCard}>
            <div style={styles.cardTop}>
              <div style={{ ...styles.iconBox, backgroundColor: "rgba(99, 102, 241, 0.15)", color: "#6366f1" }}>
                <Award size={24} strokeWidth={2} />
              </div>
              <div>
                <h4 style={styles.cardTitle}>Performance & Goals</h4>
                <p style={styles.cardSub}>View HR reviews, ratings & goal progress</p>
              </div>
            </div>
            <Link to="/employee/performance" className="hrms-btn hrms-btn-secondary" style={{ width: "100%" }}>
              <span>My Performance</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Daily Work Reports */}
          <div className="hrms-card hrms-card-interactive" style={styles.actionCard}>
            <div style={styles.cardTop}>
              <div style={{ ...styles.iconBox, backgroundColor: "rgba(14, 165, 233, 0.15)", color: "#0ea5e9" }}>
                <FileText size={24} strokeWidth={2} />
              </div>
              <div>
                <h4 style={styles.cardTitle}>Daily Work Reports</h4>
                <p style={styles.cardSub}>Submit daily work logs & review past submissions</p>
              </div>
            </div>
            <Link to="/employee/work-reports" className="hrms-btn hrms-btn-secondary" style={{ width: "100%" }}>
              <span>Work Reports</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Company Announcements */}
          <div className="hrms-card hrms-card-interactive" style={styles.actionCard}>
            <div style={styles.cardTop}>
              <div style={{ ...styles.iconBox, backgroundColor: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" }}>
                <Megaphone size={24} strokeWidth={2} />
              </div>
              <div>
                <h4 style={styles.cardTitle}>Company Announcements</h4>
                <p style={styles.cardSub}>Stay updated with corporate notices & news</p>
              </div>
            </div>
            <Link to="/employee/announcements" className="hrms-btn hrms-btn-secondary" style={{ width: "100%" }}>
              <span>Announcements</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Workplace Complaints */}
          <div className="hrms-card hrms-card-interactive" style={styles.actionCard}>
            <div style={styles.cardTop}>
              <div style={{ ...styles.iconBox, backgroundColor: "var(--danger-bg)", color: "var(--danger-color)" }}>
                <AlertCircle size={24} strokeWidth={2} />
              </div>
              <div>
                <h4 style={styles.cardTitle}>Workplace Complaints</h4>
                <p style={styles.cardSub}>Submit grievances & track resolution status</p>
              </div>
            </div>
            <Link to="/employee/complaints" className="hrms-btn hrms-btn-secondary" style={{ width: "100%" }}>
              <span>My Complaints</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Employee Profile */}
          <div className="hrms-card hrms-card-interactive" style={styles.actionCard}>
            <div style={styles.cardTop}>
              <div style={{ ...styles.iconBox, backgroundColor: "var(--bg-surface-elevated)", color: "var(--text-secondary)" }}>
                <UserRound size={24} strokeWidth={2} />
              </div>
              <div>
                <h4 style={styles.cardTitle}>My Employee Profile</h4>
                <p style={styles.cardSub}>View personal employee details & contact info</p>
              </div>
            </div>
            <Link to="/employee/profile" className="hrms-btn hrms-btn-secondary" style={{ width: "100%" }}>
              <span>View Profile</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

const styles = {
  heroBanner: {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-xl)",
    padding: "1.75rem 2rem",
    marginBottom: "2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1.5rem",
    boxShadow: "var(--shadow-md)",
    background: "linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-elevated) 100%)",
  },
  heroContent: {
    flex: "1 1 360px",
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    fontSize: "0.6875rem",
    fontWeight: "800",
    letterSpacing: "0.08em",
    color: "var(--primary-color)",
    backgroundColor: "var(--primary-light)",
    padding: "0.2rem 0.6rem",
    borderRadius: "9999px",
    marginBottom: "0.75rem",
  },
  heroDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "var(--primary-color)",
  },
  heroTitle: {
    fontSize: "1.75rem",
    fontWeight: "800",
    color: "var(--text-primary)",
    margin: "0 0 0.35rem 0",
    lineHeight: 1.2,
    letterSpacing: "-0.02em",
  },
  highlight: {
    color: "var(--primary-color)",
  },
  heroSubtitle: {
    fontSize: "0.9375rem",
    color: "var(--text-secondary)",
    margin: 0,
    lineHeight: 1.5,
    maxWidth: "680px",
  },
  heroRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "0.75rem",
  },
  roleTag: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.8125rem",
    color: "var(--text-secondary)",
  },
  sectionHeaderRow: {
    marginBottom: "1rem",
  },
  sectionHeaderTitle: {
    fontSize: "1.25rem",
    fontWeight: "800",
    color: "var(--text-primary)",
    margin: 0,
    letterSpacing: "-0.01em",
  },
  sectionHeaderSubtitle: {
    fontSize: "0.85rem",
    color: "var(--text-muted)",
    marginTop: "0.15rem",
    display: "block",
  },
  actionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
    gap: "1.25rem",
  },
  actionCard: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: "1.25rem",
    padding: "1.25rem",
  },
  cardTop: {
    display: "flex",
    gap: "1rem",
    alignItems: "flex-start",
  },
  iconBox: {
    width: "44px",
    height: "44px",
    borderRadius: "var(--radius-md)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "var(--text-primary)",
    margin: "0 0 0.25rem 0",
  },
  cardSub: {
    fontSize: "0.825rem",
    color: "var(--text-muted)",
    margin: 0,
    lineHeight: 1.4,
  },
};