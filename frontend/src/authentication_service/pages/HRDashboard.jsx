import React from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Clock3,
  CalendarDays,
  Tags,
  ClipboardList,
  ShieldCheck,
  ArrowRight,
  Plus,
  FileText,
  AlertCircle,
  Award,
  FolderGit2,
  TrendingUp,
} from "lucide-react";

import AppLayout from "../../shared/components/AppLayout";
import DashboardDateTime from "../../shared/components/DashboardDateTime";
import { getUserDisplayName } from "../../shared/components/Header";
import { useAuth } from "../hooks/useAuth";
import StatCard from "../../shared/components/StatCard";

export default function HRDashboard() {
  const { user } = useAuth();
  const displayName = getUserDisplayName(user);
  const firstName = user?.first_name ? user.first_name.trim() : displayName !== "User" ? displayName : "HR Admin";

  return (
    <AppLayout title="HR Administration Command Center">
      <div className="hrms-page-container">
        {/* Hero Welcome Banner */}
        <div style={styles.heroBanner}>
          <div style={styles.heroContent}>
            <div style={styles.heroBadge}>
              <span style={styles.heroDot} />
              <span>ENTERPRISE HR COMMAND CENTER</span>
            </div>
            <h2 style={styles.heroTitle}>
              Good morning, <span style={styles.highlight}>{firstName}</span>
            </h2>
            <p style={styles.heroSubtitle}>
              Here's what's happening across Mediatize Tech Pvt Ltd today. Monitor workforce operations, leave allocations, project assignments, and system compliance.
            </p>
          </div>
          <div style={styles.heroRight}>
            <DashboardDateTime />
            <div style={styles.roleTag}>
              <span style={styles.roleLabel}>Active Role:</span>
              <span className="hrms-badge hrms-badge-info" style={{ fontWeight: "700" }}>
                {user?.role || "HR"}
              </span>
            </div>
          </div>
        </div>

        {/* Executive KPI Metrics Row */}
        <div style={styles.sectionHeaderRow}>
          <h3 style={styles.sectionHeaderTitle}>Workforce Overview & Key Metrics</h3>
          <span style={styles.sectionHeaderSubtitle}>Real-time company operational status</span>
        </div>

        <div style={styles.kpiGrid}>
          <StatCard
            title="Employee Directory"
            value="Directory"
            subtitle="View, search & manage staff profiles"
            icon={Users}
            variant="primary"
            action={
              <Link to="/hr/employees" className="hrms-btn hrms-btn-primary hrms-btn-sm" style={{ width: "100%" }}>
                Open Directory <ArrowRight size={14} />
              </Link>
            }
          />
          <StatCard
            title="Active Projects"
            value="Projects"
            subtitle="Track project deliverables & teams"
            icon={FolderGit2}
            variant="info"
            action={
              <Link to="/hr/projects" className="hrms-btn hrms-btn-secondary hrms-btn-sm" style={{ width: "100%" }}>
                Manage Projects <ArrowRight size={14} />
              </Link>
            }
          />
          <StatCard
            title="Leave Applications"
            value="Requests"
            subtitle="Review & approve employee leaves"
            icon={CalendarDays}
            variant="warning"
            action={
              <Link to="/hr/leaves" className="hrms-btn hrms-btn-secondary hrms-btn-sm" style={{ width: "100%" }}>
                Review Requests <ArrowRight size={14} />
              </Link>
            }
          />
          <StatCard
            title="Workplace Complaints"
            value="Grievances"
            subtitle="Monitor & resolve workplace issues"
            icon={AlertCircle}
            variant="danger"
            action={
              <Link to="/hr/complaints" className="hrms-btn hrms-btn-secondary hrms-btn-sm" style={{ width: "100%" }}>
                View Complaints <ArrowRight size={14} />
              </Link>
            }
          />
        </div>

        {/* Asymmetric Assembled Main Content Area */}
        <div style={styles.mainAsymmetricGrid}>
          {/* Primary Operations Column */}
          <div style={styles.primaryColumn}>
            {/* Workforce Management Focal Card */}
            <div className="hrms-card hrms-card-interactive" style={styles.primaryCard}>
              <div style={styles.cardHeaderTop}>
                <div style={{ ...styles.iconBox, backgroundColor: "var(--primary-light)", color: "var(--primary-color)" }}>
                  <Users size={24} />
                </div>
                <div>
                  <h4 style={styles.cardTitle}>Employee Directory & Recruitment</h4>
                  <p style={styles.cardSubtitle}>
                    Search company personnel, inspect employment contracts, assign roles, and add new employees.
                  </p>
                </div>
              </div>
              <div style={styles.cardFooterActions}>
                <Link to="/hr/employees" className="hrms-btn hrms-btn-primary">
                  Manage Employees <ArrowRight size={16} />
                </Link>
                <Link to="/hr/employees/new" className="hrms-btn hrms-btn-secondary">
                  <Plus size={16} /> Add New Employee
                </Link>
              </div>
            </div>

            {/* Daily Work Reports & Productivity */}
            <div className="hrms-card hrms-card-interactive" style={styles.primaryCard}>
              <div style={styles.cardHeaderTop}>
                <div style={{ ...styles.iconBox, backgroundColor: "var(--info-bg)", color: "var(--info-color)" }}>
                  <FileText size={24} />
                </div>
                <div>
                  <h4 style={styles.cardTitle}>Employee Work Reports</h4>
                  <p style={styles.cardSubtitle}>
                    Monitor daily progress submissions, project tasks, and blocker reports filed by team members.
                  </p>
                </div>
              </div>
              <div style={styles.cardFooterActions}>
                <Link to="/hr/work-reports" className="hrms-btn hrms-btn-primary">
                  View Work Reports <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Attendance Monitoring Center */}
            <div className="hrms-card hrms-card-interactive" style={styles.primaryCard}>
              <div style={styles.cardHeaderTop}>
                <div style={{ ...styles.iconBox, backgroundColor: "var(--success-bg)", color: "var(--success-color)" }}>
                  <Clock3 size={24} />
                </div>
                <div>
                  <h4 style={styles.cardTitle}>Attendance Center</h4>
                  <p style={styles.cardSubtitle}>
                    Review daily check-in logs, total working hours, late marks, and monthly attendance history.
                  </p>
                </div>
              </div>
              <div style={styles.cardFooterActions}>
                <Link to="/hr/attendance" className="hrms-btn hrms-btn-primary">
                  Attendance Center <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>

          {/* Secondary Governance & Operations Column */}
          <div style={styles.secondaryColumn}>
            {/* Performance Analytics */}
            <div className="hrms-card hrms-card-interactive" style={styles.secondaryCard}>
              <div style={styles.cardHeaderTop}>
                <div style={{ ...styles.iconBox, backgroundColor: "rgba(99, 102, 241, 0.15)", color: "#6366f1" }}>
                  <Award size={22} />
                </div>
                <div>
                  <h4 style={styles.cardTitleSm}>Performance & Reviews</h4>
                  <p style={styles.cardSubtitleSm}>Evaluations, performance reviews, goals & ratings</p>
                </div>
              </div>
              <div style={styles.secondaryCardBody}>
                <Link to="/hr/performance" className="hrms-btn hrms-btn-primary hrms-btn-sm" style={{ width: "100%" }}>
                  Performance Dashboard <TrendingUp size={14} />
                </Link>
                <Link to="/hr/performance/reviews" className="hrms-btn hrms-btn-secondary hrms-btn-sm" style={{ width: "100%" }}>
                  Manage Reviews
                </Link>
              </div>
            </div>

            {/* Leave Configurations */}
            <div className="hrms-card hrms-card-interactive" style={styles.secondaryCard}>
              <div style={styles.cardHeaderTop}>
                <div style={{ ...styles.iconBox, backgroundColor: "var(--warning-bg)", color: "var(--warning-color)" }}>
                  <Tags size={22} />
                </div>
                <div>
                  <h4 style={styles.cardTitleSm}>Leave Configurations</h4>
                  <p style={styles.cardSubtitleSm}>Configure leave categories, rules & balances</p>
                </div>
              </div>
              <div style={styles.secondaryCardBody}>
                <Link to="/hr/leave-types" className="hrms-btn hrms-btn-secondary hrms-btn-sm" style={{ width: "100%" }}>
                  Manage Leave Types
                </Link>
                <Link to="/hr/leave-balances" className="hrms-btn hrms-btn-secondary hrms-btn-sm" style={{ width: "100%" }}>
                  Employee Balances
                </Link>
              </div>
            </div>

            {/* Security Audit Logs */}
            <div className="hrms-card hrms-card-interactive" style={styles.secondaryCard}>
              <div style={styles.cardHeaderTop}>
                <div style={{ ...styles.iconBox, backgroundColor: "var(--bg-surface-elevated)", color: "var(--text-secondary)" }}>
                  <ClipboardList size={22} />
                </div>
                <div>
                  <h4 style={styles.cardTitleSm}>System Security Audit</h4>
                  <p style={styles.cardSubtitleSm}>Inspect system event logs, logins & security actions</p>
                </div>
              </div>
              <div style={styles.secondaryCardBody}>
                <Link to="/hr/audit-logs" className="hrms-btn hrms-btn-secondary hrms-btn-sm" style={{ width: "100%" }}>
                  View Audit Logs <ShieldCheck size={14} />
                </Link>
              </div>
            </div>
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
  roleLabel: {
    fontWeight: "500",
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
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
    gap: "1.25rem",
    marginBottom: "2rem",
  },
  mainAsymmetricGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
    gap: "1.5rem",
    alignItems: "start",
  },
  primaryColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  secondaryColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  primaryCard: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
    padding: "1.5rem",
  },
  secondaryCard: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    padding: "1.25rem",
  },
  cardHeaderTop: {
    display: "flex",
    gap: "1rem",
    alignItems: "flex-start",
  },
  iconBox: {
    width: "48px",
    height: "48px",
    borderRadius: "var(--radius-md)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: "1.15rem",
    fontWeight: "700",
    color: "var(--text-primary)",
    margin: "0 0 0.25rem 0",
  },
  cardTitleSm: {
    fontSize: "1rem",
    fontWeight: "700",
    color: "var(--text-primary)",
    margin: "0 0 0.25rem 0",
  },
  cardSubtitle: {
    fontSize: "0.875rem",
    color: "var(--text-secondary)",
    margin: 0,
    lineHeight: 1.45,
  },
  cardSubtitleSm: {
    fontSize: "0.8125rem",
    color: "var(--text-muted)",
    margin: 0,
    lineHeight: 1.4,
  },
  cardFooterActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.75rem",
  },
  secondaryCardBody: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
};