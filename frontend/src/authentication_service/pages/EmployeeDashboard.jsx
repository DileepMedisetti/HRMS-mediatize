import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Clock, UserRound, ArrowRight, AlertCircle, Award } from "lucide-react";

import AppLayout from "../../shared/components/AppLayout";
import DashboardDateTime from "../../shared/components/DashboardDateTime";
import { getUserDisplayName } from "../../shared/components/Header";
import { useAuth } from "../hooks/useAuth";
import { getMyLeaveBalance } from "../../leave_service/services/leaveApi";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const displayName = getUserDisplayName(user);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const res = await getMyLeaveBalance();
        setBalances(res.data || []);
      } catch (err) {
        console.error("Failed to fetch leave balance summary", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  return (
    <AppLayout title="Employee Portal">
      {/* Welcome Banner */}
      <div style={styles.welcomeBanner}>
        <div>
          <h2 style={styles.welcomeTitle}>
            Welcome back, <span style={styles.highlight}>{displayName !== "User" ? displayName : "Employee"}</span>
          </h2>
          <p style={styles.welcomeSubtitle}>
            Here's your personal workforce & self-service overview.
          </p>
        </div>
        <div style={styles.welcomeRight}>
          <DashboardDateTime />
          <div style={styles.roleTag}>
            <span>Role:</span> <strong>{user?.role || "EMPLOYEE"}</strong>
          </div>
        </div>
      </div>

      {/* Leave Balances Summary (Real Data) */}
      <h3 style={styles.sectionHeader}>My Leave Entitlements</h3>
      <div style={styles.grid}>
        {loading ? (
          <div style={styles.loadingCard}>Loading leave balances...</div>
        ) : balances.length === 0 ? (
          <div style={styles.infoCard}>
            <div style={styles.infoTitle}>Annual Leave Entitlement</div>
            <div style={styles.infoSub}>No active leave balances assigned yet.</div>
          </div>
        ) : (
          balances.map((b) => (
            <div key={b.id || b.leave_type_id} className="hrms-card hrms-card-interactive" style={styles.metricCard}>
              <div style={styles.metricHeader}>
                <span style={styles.metricTitle}>{b.leave_type_name}</span>
                <span style={styles.metricYear}>Yr {b.year}</span>
              </div>
              <div style={styles.metricNum}>
                {Number(b.allocated_days - b.used_days - b.pending_days).toFixed(1)}
              </div>
              <div style={styles.metricLabel}>Days Remaining</div>
              <div style={styles.metricFooter}>
                <span>Allocated: {b.allocated_days}</span>
                <span>Used: {b.used_days}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Action Cards */}
      <h3 style={styles.sectionHeader}>Quick Actions</h3>
      <div style={styles.grid}>
        {/* Prominent Apply for Leave Card */}
        <div className="hrms-card hrms-card-interactive" style={{ ...styles.actionCard, borderColor: "var(--primary-color)" }}>
          <div style={styles.cardTop}>
            <div style={{ ...styles.iconBox, backgroundColor: "var(--primary-light)", color: "var(--primary-color)" }}>
              <CalendarDays size={22} strokeWidth={2} />
            </div>
            <div>
              <h4 style={styles.cardTitle}>Apply for Leave</h4>
              <p style={styles.cardSub}>Submit leave requests & view application status</p>
            </div>
          </div>
          <Link to="/employee/leave" className="hrms-btn hrms-btn-primary" style={{ textAlign: "center", textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.375rem" }}>
            <span>Apply for Leave</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Submit Complaint Card */}
        <div className="hrms-card hrms-card-interactive" style={styles.actionCard}>
          <div style={styles.cardTop}>
            <div style={{ ...styles.iconBox, backgroundColor: "rgba(239, 68, 68, 0.15)", color: "var(--danger-color)" }}>
              <AlertCircle size={22} strokeWidth={2} />
            </div>
            <div>
              <h4 style={styles.cardTitle}>Workplace Complaints</h4>
              <p style={styles.cardSub}>Submit grievances & track HR resolution progress</p>
            </div>
          </div>
          <Link to="/employee/complaints" className="hrms-btn hrms-btn-secondary" style={{ textAlign: "center", textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.375rem" }}>
            <span>My Complaints</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* View Attendance Card */}
        <div className="hrms-card hrms-card-interactive" style={styles.actionCard}>
          <div style={styles.cardTop}>
            <div style={{ ...styles.iconBox, backgroundColor: "var(--success-bg)", color: "var(--success-color)" }}>
              <Clock size={22} strokeWidth={2} />
            </div>
            <div>
              <h4 style={styles.cardTitle}>Attendance Management</h4>
              <p style={styles.cardSub}>Check-in, check-out & track daily working hours</p>
            </div>
          </div>
          <Link to="/employee/attendance" className="hrms-btn hrms-btn-secondary" style={{ textAlign: "center", textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.375rem" }}>
            <span>View Attendance</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* My Profile Card */}
        <div className="hrms-card hrms-card-interactive" style={styles.actionCard}>
          <div style={styles.cardTop}>
            <div style={{ ...styles.iconBox, backgroundColor: "var(--info-bg)", color: "var(--info-color)" }}>
              <UserRound size={22} strokeWidth={2} />
            </div>
            <div>
              <h4 style={styles.cardTitle}>My Employee Profile</h4>
              <p style={styles.cardSub}>View personal details, contact info & job information</p>
            </div>
          </div>
          <Link to="/employee/profile" className="hrms-btn hrms-btn-secondary" style={{ textAlign: "center", textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.375rem" }}>
            <span>View Profile</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* My Performance Card */}
        <div className="hrms-card hrms-card-interactive" style={styles.actionCard}>
          <div style={styles.cardTop}>
            <div style={{ ...styles.iconBox, backgroundColor: "rgba(99, 102, 241, 0.15)", color: "#6366f1" }}>
              <Award size={22} strokeWidth={2} />
            </div>
            <div>
              <h4 style={styles.cardTitle}>My Performance & Goals</h4>
              <p style={styles.cardSub}>View HR evaluations, category ratings & assigned goals</p>
            </div>
          </div>
          <Link to="/employee/performance" className="hrms-btn hrms-btn-primary" style={{ textAlign: "center", textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.375rem" }}>
            <span>My Performance</span>
            <ArrowRight size={16} />
          </Link>
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
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
    gap: "1.25rem",
    marginBottom: "2rem",
  },
  metricCard: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  metricHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metricTitle: {
    fontWeight: "600",
    fontSize: "1rem",
    color: "var(--text-primary)",
  },
  metricYear: {
    fontSize: "0.75rem",
    color: "var(--text-muted)",
  },
  metricNum: {
    fontSize: "2.25rem",
    fontWeight: "800",
    color: "var(--primary-color)",
    lineHeight: 1,
  },
  metricLabel: {
    fontSize: "0.8rem",
    color: "var(--text-muted)",
  },
  metricFooter: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.75rem",
    color: "var(--text-muted)",
    borderTop: "1px solid var(--border-color)",
    paddingTop: "0.625rem",
    marginTop: "0.5rem",
  },
  actionCard: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: "1.25rem",
  },
  cardTop: {
    display: "flex",
    gap: "1rem",
    alignItems: "center",
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
    fontWeight: "600",
    color: "var(--text-primary)",
    margin: 0,
  },
  cardSub: {
    fontSize: "0.825rem",
    color: "var(--text-muted)",
    marginTop: "0.25rem",
    margin: 0,
  },
  loadingCard: {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    padding: "2rem",
    color: "var(--text-muted)",
    gridColumn: "1 / -1",
    textAlign: "center",
  },
  infoCard: {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    padding: "1.5rem",
    gridColumn: "1 / -1",
  },
  infoTitle: {
    color: "var(--text-primary)",
    fontWeight: "600",
  },
  infoSub: {
    color: "var(--text-muted)",
    fontSize: "0.85rem",
    marginTop: "0.25rem",
  },
};