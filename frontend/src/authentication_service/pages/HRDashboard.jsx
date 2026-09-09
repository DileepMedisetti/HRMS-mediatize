import React from "react";
import { Link } from "react-router-dom";
import { Users, Clock3, CalendarDays, Tags, ClipboardList, ShieldCheck, ArrowRight, Plus, FileText, AlertCircle, Award } from "lucide-react";

import AppLayout from "../../shared/components/AppLayout";
import DashboardDateTime from "../../shared/components/DashboardDateTime";
import { getUserDisplayName } from "../../shared/components/Header";
import { useAuth } from "../hooks/useAuth";

export default function HRDashboard() {
  const { user } = useAuth();
  const displayName = getUserDisplayName(user);

  return (
    <AppLayout title="HR Administration Portal">
      {/* Welcome Banner */}
      <div style={styles.welcomeBanner}>
        <div>
          <h2 style={styles.welcomeTitle}>
            Welcome back, <span style={styles.highlight}>{displayName !== "User" ? displayName : "HR Admin"}</span>
          </h2>
          <p style={styles.subtitle || styles.welcomeSubtitle}>
            Mediatize Tech HRMS — Workforce Management & Administration Overview
          </p>
        </div>
        <div style={styles.welcomeRight}>
          <DashboardDateTime />
          <div style={styles.roleTag}>
            <span>Role:</span> <strong style={{ color: "var(--primary-color)" }}>{user?.role || "HR"}</strong>
          </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <h3 style={styles.sectionHeader}>Management Center</h3>
      <div style={styles.grid}>
        {/* Employee Directory Card */}
        <div className="hrms-card hrms-card-interactive" style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={{ ...styles.iconBox, backgroundColor: "var(--primary-light)", color: "var(--primary-color)" }}>
              <Users size={22} />
            </div>
            <div>
              <h4 style={styles.cardTitle}>Employee Directory</h4>
              <p style={styles.cardSubtitle}>Search, filter, view details & create employee profiles</p>
            </div>
          </div>
          <div style={styles.cardActions}>
            <Link to="/hr/employees" className="hrms-btn hrms-btn-primary" style={{ textAlign: "center", textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              Manage Employees <ArrowRight size={14} />
            </Link>
            <Link to="/hr/employees/new" className="hrms-btn hrms-btn-secondary" style={{ textAlign: "center", textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              <Plus size={14} /> Add New Employee
            </Link>
          </div>
        </div>

        {/* Workplace Complaints Card */}
        <div className="hrms-card hrms-card-interactive" style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={{ ...styles.iconBox, backgroundColor: "rgba(239, 68, 68, 0.15)", color: "var(--danger-color)" }}>
              <AlertCircle size={22} />
            </div>
            <div>
              <h4 style={styles.cardTitle}>Workplace Complaints</h4>
              <p style={styles.cardSubtitle}>Review employee complaints, respond & manage resolutions</p>
            </div>
          </div>
          <div style={styles.cardActions}>
            <Link to="/hr/complaints" className="hrms-btn hrms-btn-primary" style={{ textAlign: "center", textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              View All Complaints <ArrowRight size={14} />
            </Link>
            <Link to="/hr/complaint-categories" className="hrms-btn hrms-btn-secondary" style={{ textAlign: "center", textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              Manage Categories <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Work Reports Management Card */}
        <div className="hrms-card hrms-card-interactive" style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={{ ...styles.iconBox, backgroundColor: "var(--info-bg)", color: "var(--info-color)" }}>
              <FileText size={22} />
            </div>
            <div>
              <h4 style={styles.cardTitle}>Employee Work Reports</h4>
              <p style={styles.cardSubtitle}>Monitor daily work submissions, project progress & blockers</p>
            </div>
          </div>
          <div style={styles.cardActions}>
            <Link to="/hr/work-reports" className="hrms-btn hrms-btn-primary" style={{ textAlign: "center", textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              View All Reports <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Attendance Management Card */}
        <div className="hrms-card hrms-card-interactive" style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={{ ...styles.iconBox, backgroundColor: "var(--success-bg)", color: "var(--success-color)" }}>
              <Clock3 size={22} />
            </div>
            <div>
              <h4 style={styles.cardTitle}>Attendance Management</h4>
              <p style={styles.cardSubtitle}>Monitor employee attendance logs & filter records</p>
            </div>
          </div>
          <div style={styles.cardActions}>
            <Link to="/hr/attendance" className="hrms-btn hrms-btn-primary" style={{ textAlign: "center", textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              Attendance Center <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Leave Requests Card */}
        <div className="hrms-card hrms-card-interactive" style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={{ ...styles.iconBox, backgroundColor: "var(--warning-bg)", color: "var(--warning-color)" }}>
              <CalendarDays size={22} />
            </div>
            <div>
              <h4 style={styles.cardTitle}>Leave Applications</h4>
              <p style={styles.cardSubtitle}>Review, approve, or reject employee leave requests</p>
            </div>
          </div>
          <div style={styles.cardActions}>
            <Link to="/hr/leaves" className="hrms-btn hrms-btn-primary" style={{ textAlign: "center", textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              Review Leave Requests <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Leave Configurations */}
        <div className="hrms-card hrms-card-interactive" style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={{ ...styles.iconBox, backgroundColor: "var(--info-bg)", color: "var(--info-color)" }}>
              <Tags size={22} />
            </div>
            <div>
              <h4 style={styles.cardTitle}>Leave Configurations</h4>
              <p style={styles.cardSubtitle}>Configure leave types, rules, allocations & balances</p>
            </div>
          </div>
          <div style={styles.cardActions}>
            <Link to="/hr/leave-types" className="hrms-btn hrms-btn-primary" style={{ textAlign: "center", textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              Manage Leave Types <ArrowRight size={14} />
            </Link>
            <Link to="/hr/leave-balances" className="hrms-btn hrms-btn-secondary" style={{ textAlign: "center", textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              Manage Employee Balances <ArrowRight size={14} />
            </Link>
          </div>
        </div>


        {/* Audit Logs Card */}
        <div className="hrms-card hrms-card-interactive" style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={{ ...styles.iconBox, backgroundColor: "var(--bg-surface-elevated)", color: "var(--text-secondary)" }}>
              <ClipboardList size={22} />
            </div>
            <div>
              <h4 style={styles.cardTitle}>System Audit Logs</h4>
              <p style={styles.cardSubtitle}>Inspect system audit logs, logins & security actions</p>
            </div>
          </div>
          <div style={styles.cardActions}>
            <Link to="/hr/audit-logs" className="hrms-btn hrms-btn-primary" style={{ textAlign: "center", textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              View Audit Logs <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Performance & Analytics Card */}
        <div className="hrms-card hrms-card-interactive" style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={{ ...styles.iconBox, backgroundColor: "rgba(99, 102, 241, 0.15)", color: "#6366f1" }}>
              <Award size={22} />
            </div>
            <div>
              <h4 style={styles.cardTitle}>Performance & Analytics</h4>
              <p style={styles.cardSubtitle}>Employee evaluations, ratings, goals & metrics</p>
            </div>
          </div>
          <div style={styles.cardActions}>
            <Link to="/hr/performance" className="hrms-btn hrms-btn-primary" style={{ textAlign: "center", textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              Performance Dashboard <ArrowRight size={14} />
            </Link>
            <Link to="/hr/performance/reviews" className="hrms-btn hrms-btn-secondary" style={{ textAlign: "center", textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              Manage Reviews
            </Link>
          </div>
        </div>


        {/* Account & Role Card */}
        <div className="hrms-card hrms-card-interactive" style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={{ ...styles.iconBox, backgroundColor: "var(--primary-light)", color: "var(--primary-color)" }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4 style={styles.cardTitle}>Role & Privileges</h4>
              <p style={styles.cardSubtitle}>Authenticated Administrator Account</p>
            </div>
          </div>
          <div style={styles.infoBox}>
            <span style={styles.infoLabel}>Role:</span>
            <span className="hrms-badge hrms-badge-info">{user?.role || "HR"}</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

const styles = {
  welcomeBanner: {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    padding: "1.5rem",
    marginBottom: "2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1rem",
    boxShadow: "var(--shadow-sm)",
  },
  welcomeTitle: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "var(--text-primary)",
    margin: 0,
  },
  welcomeSubtitle: {
    fontSize: "0.9rem",
    color: "var(--text-muted)",
    marginTop: "0.375rem",
    margin: 0,
  },
  highlight: {
    color: "var(--primary-color)",
  },
  welcomeRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "0.625rem",
  },
  roleTag: {
    backgroundColor: "var(--bg-surface-elevated)",
    border: "1px solid var(--border-color)",
    padding: "0.5rem 1rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.85rem",
    color: "var(--text-secondary)",
  },
  sectionHeader: {
    fontSize: "1.15rem",
    fontWeight: "700",
    color: "var(--text-primary)",
    marginBottom: "1rem",
    marginTop: "1rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
    gap: "1.25rem",
    marginBottom: "2rem",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: "1.25rem",
  },
  cardHeader: {
    display: "flex",
    gap: "1rem",
    alignItems: "center",
  },
  iconBox: {
    width: "48px",
    height: "48px",
    borderRadius: "var(--radius-md)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: "1.15rem",
    fontWeight: "600",
    color: "var(--text-primary)",
    margin: 0,
  },
  cardSubtitle: {
    fontSize: "0.85rem",
    color: "var(--text-muted)",
    marginTop: "0.25rem",
    margin: 0,
  },
  cardActions: {
    display: "flex",
    flexDirection: "column",
    gap: "0.625rem",
  },
  infoBox: {
    backgroundColor: "var(--bg-surface-elevated)",
    padding: "0.75rem 1rem",
    borderRadius: "var(--radius-md)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid var(--border-color)",
  },
  infoLabel: {
    color: "var(--text-muted)",
    fontSize: "0.875rem",
  },
};