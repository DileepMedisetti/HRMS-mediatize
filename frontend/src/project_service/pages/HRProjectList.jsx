import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Filter, SlidersHorizontal, ArrowLeft, ArrowRight, Eye, Edit } from "lucide-react";
import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import { getProjects } from "../services/projectApi";
import { ProjectStatusBadge, ProjectPriorityBadge, ProjectProgress } from "../components/ProjectBadges";
import { showError } from "../../shared/utils/toast";

export default function HRProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const navigate = useNavigate();

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        ...(search.trim() && { search: search.trim() }),
        ...(statusFilter && { status: statusFilter }),
        ...(priorityFilter && { priority: priorityFilter }),
      };
      const res = await getProjects(params);
      setProjects(res.data.items || []);
      setTotalPages(res.data.total_pages || 1);
      setTotalItems(res.data.total || 0);
    } catch (err) {
      showError(err.response?.data?.detail || "Failed to load project directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [page, statusFilter, priorityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProjects();
  };

  return (
    <AppLayout title="All Projects">
      <div style={styles.container}>
        <BackToDashboard to="/hr/projects" role="HR" />

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Company Projects</h1>
            <p style={styles.subtitle}>Manage project lifecycles, progress, priorities & teams ({totalItems} projects)</p>
          </div>
          <Link to="/hr/projects/create" style={styles.createBtn}>
            <Plus size={16} /> Create Project
          </Link>
        </div>

        {/* Filters Card */}
        <div style={styles.filterCard}>
          <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
            <input
              type="text"
              placeholder="Search code, name, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
            <button type="submit" style={styles.searchBtn}>
              <Search size={15} /> Search
            </button>
          </form>

          <div style={styles.filterRow}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                style={styles.selectInput}
              >
                <option value="">All Statuses</option>
                <option value="PLANNED">Planned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Priority:</label>
              <select
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value);
                  setPage(1);
                }}
                style={styles.selectInput}
              >
                <option value="">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={styles.loadingState}>Loading projects...</div>
        ) : projects.length === 0 ? (
          <div style={styles.emptyState}>No projects found matching your criteria.</div>
        ) : (
          <>
            {/* DESKTOP TABLE VIEW (≥768px) */}
            <div className="employee-desktop-table" style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Code</th>
                    <th style={styles.th}>Project Name</th>
                    <th style={styles.th}>Start Date</th>
                    <th style={styles.th}>End Date</th>
                    <th style={styles.th}>Priority</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Progress</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => (
                    <tr key={p.id} style={styles.tr}>
                      <td style={styles.td}>
                        <code style={styles.codeBadge}>{p.project_code}</code>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.projName}>{p.name}</div>
                      </td>
                      <td style={styles.td}>{p.start_date}</td>
                      <td style={styles.td}>{p.end_date || "Ongoing"}</td>
                      <td style={styles.td}>
                        <ProjectPriorityBadge priority={p.priority} />
                      </td>
                      <td style={styles.td}>
                        <ProjectStatusBadge status={p.status} />
                        {p.is_overdue && <span style={styles.overduePill}>OVERDUE</span>}
                      </td>
                      <td style={styles.td} style={{ minWidth: "130px" }}>
                        <ProjectProgress percentage={p.progress_percentage} />
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actionGroup}>
                          <button
                            onClick={() => navigate(`/hr/projects/${p.id}`)}
                            style={styles.actionBtnView}
                          >
                            View
                          </button>
                          <button
                            onClick={() => navigate(`/hr/projects/${p.id}/edit`)}
                            style={styles.actionBtnEdit}
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS VIEW (<768px) */}
            <div className="employee-mobile-cards">
              {projects.map((p) => (
                <div key={p.id} style={styles.mobileCard}>
                  <div style={styles.mobileCardHeader}>
                    <div>
                      <code style={styles.codeBadge}>{p.project_code}</code>
                      <h3 style={styles.mobileProjTitle}>{p.name}</h3>
                    </div>
                    <div>
                      <ProjectStatusBadge status={p.status} />
                    </div>
                  </div>

                  <div style={styles.mobileCardBody}>
                    <div style={styles.mobileRow}>
                      <span style={styles.mobileLabel}>Priority:</span>
                      <ProjectPriorityBadge priority={p.priority} />
                      {p.is_overdue && <span style={styles.overduePill}>OVERDUE</span>}
                    </div>
                    <div style={styles.mobileRow}>
                      <span style={styles.mobileLabel}>Timeline:</span>
                      <span style={styles.mobileValue}>{p.start_date} &rarr; {p.end_date || "Ongoing"}</span>
                    </div>
                    <div style={{ marginTop: "0.5rem" }}>
                      <span style={styles.mobileLabel}>Progress:</span>
                      <ProjectProgress percentage={p.progress_percentage} />
                    </div>
                  </div>

                  <div style={styles.mobileActionGroup}>
                    <button
                      onClick={() => navigate(`/hr/projects/${p.id}`)}
                      style={styles.mobileBtnView}
                    >
                      <Eye size={14} /> View Details & Team
                    </button>
                    <button
                      onClick={() => navigate(`/hr/projects/${p.id}/edit`)}
                      style={styles.mobileBtnEdit}
                    >
                      <Edit size={14} /> Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={styles.pagination}>
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              style={page === 1 ? styles.pageBtnDisabled : styles.pageBtn}
            >
              <ArrowLeft size={14} /> Previous
            </button>
            <span style={styles.pageInfo}>
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              style={page === totalPages ? styles.pageBtnDisabled : styles.pageBtn}
            >
              Next <ArrowRight size={14} />
            </button>
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
  createBtn: {
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
  filterCard: {
    backgroundColor: "var(--bg-surface)",
    padding: "1rem",
    borderRadius: "var(--radius-lg)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
    border: "1px solid var(--border-color)",
    flexWrap: "wrap",
    gap: "1rem",
  },
  searchForm: {
    display: "flex",
    gap: "0.5rem",
    flex: "1 1 260px",
    maxWidth: "100%",
  },
  searchInput: {
    flex: 1,
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    color: "var(--text-primary)",
    padding: "0.5rem 0.875rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.875rem",
    minWidth: 0,
  },
  searchBtn: {
    backgroundColor: "var(--bg-surface-elevated)",
    color: "var(--text-primary)",
    border: "1px solid var(--border-color)",
    padding: "0.5rem 1rem",
    borderRadius: "var(--radius-md)",
    cursor: "pointer",
    fontWeight: "500",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
  },
  filterRow: {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  filterGroup: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  filterLabel: {
    fontSize: "0.875rem",
    color: "var(--text-secondary)",
  },
  selectInput: {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    color: "var(--text-primary)",
    padding: "0.5rem 0.875rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.875rem",
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
  overduePill: {
    marginLeft: "0.5rem",
    backgroundColor: "var(--danger-bg)",
    color: "var(--danger-color)",
    fontSize: "0.65rem",
    fontWeight: "800",
    padding: "0.15rem 0.4rem",
    borderRadius: "var(--radius-sm)",
  },
  actionGroup: {
    display: "flex",
    gap: "0.375rem",
  },
  actionBtnView: {
    backgroundColor: "var(--bg-surface-elevated)",
    color: "var(--text-primary)",
    border: "1px solid var(--border-color)",
    padding: "0.35rem 0.625rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.75rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  actionBtnEdit: {
    backgroundColor: "var(--primary-color)",
    color: "var(--text-on-primary)",
    border: "none",
    padding: "0.35rem 0.625rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.75rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  mobileCard: {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  mobileCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "0.5rem",
  },
  mobileProjTitle: {
    fontSize: "1rem",
    fontWeight: "700",
    color: "var(--text-primary)",
    margin: "0.25rem 0 0 0",
  },
  mobileCardBody: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    borderTop: "1px solid var(--border-color)",
    borderBottom: "1px solid var(--border-color)",
    padding: "0.625rem 0",
  },
  mobileRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.85rem",
  },
  mobileLabel: {
    fontSize: "0.75rem",
    fontWeight: "700",
    color: "var(--text-muted)",
    textTransform: "uppercase",
  },
  mobileValue: {
    color: "var(--text-primary)",
  },
  mobileActionGroup: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.5rem",
  },
  mobileBtnView: {
    backgroundColor: "var(--bg-surface-elevated)",
    color: "var(--text-primary)",
    border: "1px solid var(--border-color)",
    padding: "0.5rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.8125rem",
    fontWeight: "600",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.35rem",
  },
  mobileBtnEdit: {
    backgroundColor: "var(--primary-color)",
    color: "var(--text-on-primary)",
    border: "none",
    padding: "0.5rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.8125rem",
    fontWeight: "600",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.35rem",
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
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "0.75rem",
    marginTop: "1.5rem",
  },
  pageBtn: {
    backgroundColor: "var(--primary-color)",
    color: "var(--text-on-primary)",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "var(--radius-md)",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
  },
  pageBtnDisabled: {
    backgroundColor: "var(--bg-surface-elevated)",
    color: "var(--text-muted)",
    border: "1px solid var(--border-color)",
    padding: "0.5rem 1rem",
    borderRadius: "var(--radius-md)",
    cursor: "not-allowed",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
  },
  pageInfo: {
    fontSize: "0.875rem",
    color: "var(--text-secondary)",
  },
};
