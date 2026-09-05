import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  SlidersHorizontal,
  Briefcase,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import { getHRProjectMetrics, getProjects } from "../services/projectApi";
import { ProjectStatusBadge, ProjectPriorityBadge, ProjectProgress } from "../components/ProjectBadges";
import { showError } from "../../shared/utils/toast";

export default function HRProjectDashboard() {
  const [metrics, setMetrics] = useState({
    total_projects: 0,
    active_projects: 0,
    completed_projects: 0,
    on_hold_projects: 0,
    overdue_projects: 0,
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const [mRes, pRes] = await Promise.all([
        getHRProjectMetrics(),
        getProjects({ page: 1, limit: 5 }),
      ]);
      setMetrics(mRes.data);
      setRecentProjects(pRes.data.items || []);
    } catch (err) {
      showError(err.response?.data?.detail || "Failed to load project dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <AppLayout title="Project Management Overview">
      <div style={styles.container}>
        <BackToDashboard to="/hr/dashboard" role="HR" />

        {/* Top Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Project Overview</h1>
            <p style={styles.subtitle}>Track company project status, priorities, progress & team assignments</p>
          </div>
          <div style={styles.headerActions}>
            <Link to="/hr/project-roles" style={styles.secondaryBtn}>
              <SlidersHorizontal size={16} /> Manage Roles
            </Link>
            <Link to="/hr/projects/create" style={styles.primaryBtn}>
              <Plus size={16} /> Create Project
            </Link>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div style={styles.metricsGrid}>
          <div style={styles.metricCard}>
            <div style={styles.metricIconBoxPrimary}>
              <FolderKanban size={22} />
            </div>
            <div>
              <span style={styles.metricValue}>{metrics.total_projects}</span>
              <span style={styles.metricLabel}>Total Projects</span>
            </div>
          </div>

          <div style={styles.metricCard}>
            <div style={styles.metricIconBoxInfo}>
              <TrendingUp size={22} />
            </div>
            <div>
              <span style={styles.metricValue}>{metrics.active_projects}</span>
              <span style={styles.metricLabel}>Active Projects</span>
            </div>
          </div>

          <div style={styles.metricCard}>
            <div style={styles.metricIconBoxSuccess}>
              <CheckCircle2 size={22} />
            </div>
            <div>
              <span style={styles.metricValue}>{metrics.completed_projects}</span>
              <span style={styles.metricLabel}>Completed</span>
            </div>
          </div>

          <div style={styles.metricCard}>
            <div style={styles.metricIconBoxWarning}>
              <Clock size={22} />
            </div>
            <div>
              <span style={styles.metricValue}>{metrics.on_hold_projects}</span>
              <span style={styles.metricLabel}>On Hold</span>
            </div>
          </div>

          <div style={styles.metricCard}>
            <div style={styles.metricIconBoxDanger}>
              <AlertCircle size={22} />
            </div>
            <div>
              <span style={styles.metricValue}>{metrics.overdue_projects}</span>
              <span style={styles.metricLabel}>Overdue Projects</span>
            </div>
          </div>
        </div>

        {/* Recent Projects Section */}
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Recent Projects</h2>
          <Link to="/hr/projects/list" style={styles.viewAllLink}>
            View All Projects <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div style={styles.loadingState}>Loading projects...</div>
        ) : recentProjects.length === 0 ? (
          <div style={styles.emptyState}>No projects created yet.</div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Code</th>
                  <th style={styles.th}>Project Name</th>
                  <th style={styles.th}>Priority</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Progress</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentProjects.map((p) => (
                  <tr key={p.id} style={styles.tr}>
                    <td style={styles.td}>
                      <code style={styles.codeBadge}>{p.project_code}</code>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.projName}>{p.name}</div>
                      <div style={styles.projDate}>Start: {p.start_date}</div>
                    </td>
                    <td style={styles.td}>
                      <ProjectPriorityBadge priority={p.priority} />
                    </td>
                    <td style={styles.td}>
                      <ProjectStatusBadge status={p.status} />
                      {p.is_overdue && (
                        <span style={styles.overduePill}>OVERDUE</span>
                      )}
                    </td>
                    <td style={styles.td} style={{ minWidth: "140px" }}>
                      <ProjectProgress percentage={p.progress_percentage} />
                    </td>
                    <td style={styles.td}>
                      <button
                        onClick={() => navigate(`/hr/projects/${p.id}`)}
                        style={styles.actionBtn}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

const styles = {
  container: {
    padding: "0 0 2rem 0",
    maxWidth: "100%",
    minWidth: 0,
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
    gap: "1rem",
  },
  title: {
    fontSize: "clamp(1.35rem, 4vw, 1.875rem)",
    fontWeight: "700",
    color: "var(--text-primary)",
    margin: 0,
  },
  subtitle: {
    fontSize: "0.875rem",
    color: "var(--text-secondary)",
    marginTop: "0.25rem",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  primaryBtn: {
    backgroundColor: "var(--primary-color)",
    color: "var(--text-on-primary)",
    padding: "0.625rem 1.25rem",
    borderRadius: "var(--radius-md)",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "0.875rem",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    boxShadow: "var(--shadow-sm)",
  },
  secondaryBtn: {
    backgroundColor: "var(--bg-surface-elevated)",
    color: "var(--text-primary)",
    border: "1px solid var(--border-color)",
    padding: "0.625rem 1.25rem",
    borderRadius: "var(--radius-md)",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "0.875rem",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "1rem",
    marginBottom: "2rem",
  },
  metricCard: {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    padding: "1.25rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    boxShadow: "var(--shadow-sm)",
  },
  metricIconBoxPrimary: {
    width: "44px",
    height: "44px",
    borderRadius: "var(--radius-md)",
    backgroundColor: "var(--primary-light, rgba(37, 99, 235, 0.12))",
    color: "var(--primary-color)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  metricIconBoxInfo: {
    width: "44px",
    height: "44px",
    borderRadius: "var(--radius-md)",
    backgroundColor: "rgba(59, 130, 246, 0.12)",
    color: "#3b82f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  metricIconBoxSuccess: {
    width: "44px",
    height: "44px",
    borderRadius: "var(--radius-md)",
    backgroundColor: "var(--success-bg)",
    color: "var(--success-color)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  metricIconBoxWarning: {
    width: "44px",
    height: "44px",
    borderRadius: "var(--radius-md)",
    backgroundColor: "var(--warning-bg)",
    color: "var(--warning-color)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  metricIconBoxDanger: {
    width: "44px",
    height: "44px",
    borderRadius: "var(--radius-md)",
    backgroundColor: "var(--danger-bg)",
    color: "var(--danger-color)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  metricValue: {
    fontSize: "1.5rem",
    fontWeight: "800",
    color: "var(--text-primary)",
    display: "block",
    lineHeight: 1.1,
  },
  metricLabel: {
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "var(--text-secondary)",
    marginTop: "0.2rem",
    display: "block",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  sectionTitle: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "var(--text-primary)",
    margin: 0,
  },
  viewAllLink: {
    color: "var(--primary-color)",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "0.875rem",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
  },
  tableWrapper: {
    backgroundColor: "var(--bg-surface)",
    borderRadius: "var(--radius-lg)",
    overflowX: "auto",
    width: "100%",
    maxWidth: "100%",
    border: "1px solid var(--border-color)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  th: {
    backgroundColor: "var(--bg-surface-elevated)",
    color: "var(--text-muted)",
    padding: "0.875rem 1rem",
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    whiteSpace: "nowrap",
  },
  tr: {
    borderBottom: "1px solid var(--border-color)",
  },
  td: {
    padding: "0.875rem 1rem",
    fontSize: "0.875rem",
    color: "var(--text-primary)",
  },
  codeBadge: {
    backgroundColor: "var(--bg-surface-elevated)",
    padding: "0.2rem 0.5rem",
    borderRadius: "var(--radius-sm)",
    color: "var(--primary-color)",
    fontFamily: "var(--font-mono)",
    fontSize: "0.75rem",
  },
  projName: {
    fontWeight: "600",
    color: "var(--text-primary)",
  },
  projDate: {
    fontSize: "0.75rem",
    color: "var(--text-secondary)",
  },
  overduePill: {
    marginLeft: "0.5rem",
    backgroundColor: "var(--danger-bg)",
    color: "var(--danger-color)",
    fontSize: "0.65rem",
    fontWeight: "800",
    padding: "0.15rem 0.4rem",
    borderRadius: "var(--radius-sm)",
  },
  actionBtn: {
    backgroundColor: "var(--bg-surface-elevated)",
    color: "var(--text-primary)",
    border: "1px solid var(--border-color)",
    padding: "0.35rem 0.75rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.75rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  loadingState: {
    textAlign: "center",
    padding: "3rem",
    color: "var(--text-muted)",
  },
  emptyState: {
    textAlign: "center",
    padding: "3rem",
    backgroundColor: "var(--bg-surface)",
    borderRadius: "var(--radius-lg)",
    color: "var(--text-muted)",
  },
};
