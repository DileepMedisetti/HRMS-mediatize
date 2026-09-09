import React, { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import { getHRAttendance } from "../services/attendanceApi";
import { showError } from "../../shared/utils/toast";
import Pagination from "../../shared/components/Pagination";

export default function HRAttendance() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const limit = 15;
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit };
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;

      const res = await getHRAttendance(params);
      const data = res.data;
      setLogs(data.items || []);
      setPage(data.page || 1);
      setTotalPages(data.total_pages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Error fetching HR attendance list:", err);
      const msg = err.response?.data?.detail || "Failed to load employee attendance records.";
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [page, statusFilter, fromDate, toDate]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, fromDate, toDate]);

  // Ensure current page does not exceed totalPages
  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchAttendance();
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  const formatTime = (isoStr) => {
    if (!isoStr) return "--:--";
    const dt = new Date(isoStr);
    return dt.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "--";
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const dt = new Date(year, month, day);
        return dt.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }
      return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatWorkingHours = (minutes) => {
    if (minutes === null || minutes === undefined) return "--";
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins}m`;
    if (mins === 0) return `${hrs}h`;
    return `${hrs}h ${mins}m`;
  };

  const getStatusBadgeStyle = (st) => {
    if (st === "LATE") {
      return { backgroundColor: "#78350f", color: "#fde68a", border: "1px solid #b45309" };
    }
    return { backgroundColor: "#065f46", color: "#6ee7b7", border: "1px solid #047857" };
  };

  return (
    <AppLayout title="HR Attendance Management">
      <div style={styles.container}>
        <BackToDashboard to="/hr/dashboard" role="HR" />

        <div style={styles.headerArea}>
          <div>
            <h1 style={styles.title}>Employee Attendance Management</h1>
            <p style={styles.subtitle}>
              Monitor, search and filter attendance records across all employees
            </p>
          </div>
          <div style={styles.countBadge}>
            Total Records: <strong>{total}</strong>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div style={styles.filterCard}>
          <form onSubmit={handleSearchSubmit} style={styles.filterForm}>
            <div style={styles.searchGroup}>
              <input
                type="text"
                placeholder="Search employee name, code, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={styles.searchInput}
              />
              <button type="submit" style={styles.searchBtn}>
                Search
              </button>
            </div>

            <div style={styles.filterRow}>
              <div style={styles.filterItem}>
                <label style={styles.filterLabel}>Status Filter</label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  style={styles.selectInput}
                >
                  <option value="">All Statuses</option>
                  <option value="PRESENT">PRESENT</option>
                  <option value="LATE">LATE</option>
                </select>
              </div>

              <div style={styles.filterItem}>
                <label style={styles.filterLabel}>From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setPage(1);
                  }}
                  style={styles.dateInput}
                />
              </div>

              <div style={styles.filterItem}>
                <label style={styles.filterLabel}>To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setPage(1);
                  }}
                  style={styles.dateInput}
                />
              </div>

              {(search || statusFilter || fromDate || toDate) && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  style={styles.clearBtn}
                >
                  Reset Filters
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Table Card */}
        <div style={styles.tableCard}>
          {loading ? (
            <div style={styles.stateContainer}>
              <div style={styles.loadingSpinner}>Loading attendance records...</div>
            </div>
          ) : error ? (
            <div style={styles.stateContainer}>
              <div style={styles.errorText}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                  <AlertCircle size={18} /> {error}
                </span>
              </div>
              <button onClick={fetchAttendance} style={styles.retryBtn}>
                Retry
              </button>
            </div>
          ) : logs.length === 0 ? (
            <div style={styles.stateContainer}>
              <div style={styles.emptyText}>No attendance records found matching criteria.</div>
            </div>
          ) : (
            <>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Employee</th>
                      <th style={styles.th}>Code</th>
                      <th style={styles.th}>Date</th>
                      <th style={styles.th}>Check-In</th>
                      <th style={styles.th}>Check-Out</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Working Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((row) => (
                      <tr key={row.id} style={styles.tr}>
                        <td style={styles.tdEmployee}>
                          <div style={styles.empName}>
                            {row.first_name} {row.last_name}
                          </div>
                          <div style={styles.empEmail}>{row.email}</div>
                        </td>
                        <td style={styles.tdCode}>
                          <span style={styles.codeBadge}>{row.employee_code}</span>
                        </td>
                        <td style={styles.tdDate}>{formatDate(row.attendance_date)}</td>
                        <td style={styles.tdTime}>{formatTime(row.check_in)}</td>
                        <td style={styles.tdTime}>{formatTime(row.check_out)}</td>
                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.statusBadge,
                              ...getStatusBadgeStyle(row.status),
                            }}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td style={styles.tdHours}>{formatWorkingHours(row.working_minutes)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={total}
                onPrevious={() => setPage((p) => Math.max(1, p - 1))}
                onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
              />
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

const styles = {
  container: {
    padding: "0 0 2rem 0",
  },
  headerArea: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
    gap: "0.75rem",
  },
  title: {
    fontSize: "1.875rem",
    fontWeight: "700",
    color: "var(--text-primary)",
    margin: 0,
  },
  subtitle: {
    fontSize: "0.875rem",
    color: "var(--text-secondary)",
    marginTop: "0.25rem",
  },
  countBadge: {
    backgroundColor: "var(--bg-surface-elevated)",
    border: "1px solid var(--border-color)",
    padding: "0.5rem 1rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.875rem",
    color: "var(--text-secondary)",
  },
  filterCard: {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    padding: "1.25rem",
    marginBottom: "1.5rem",
  },
  filterForm: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  searchGroup: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.75rem",
  },
  searchInput: {
    flex: 1,
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    color: "var(--text-primary)",
    padding: "0.625rem 1rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.875rem",
  },
  searchBtn: {
    backgroundColor: "var(--primary-color)",
    color: "var(--text-on-primary)",
    border: "none",
    padding: "0.625rem 1.25rem",
    borderRadius: "var(--radius-md)",
    fontWeight: "600",
    cursor: "pointer",
  },
  filterRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
    alignItems: "flex-end",
  },
  filterItem: {
    display: "flex",
    flexDirection: "column",
    gap: "0.375rem",
  },
  filterLabel: {
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  selectInput: {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    color: "var(--text-primary)",
    padding: "0.5rem 0.75rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.875rem",
    minWidth: "160px",
  },
  dateInput: {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    color: "var(--text-primary)",
    padding: "0.5rem 0.75rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.875rem",
  },
  clearBtn: {
    backgroundColor: "var(--bg-surface-elevated)",
    color: "var(--text-primary)",
    border: "1px solid var(--border-color)",
    padding: "0.5rem 1rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.875rem",
    cursor: "pointer",
    alignSelf: "flex-end",
  },
  tableCard: {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    overflow: "hidden",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  th: {
    backgroundColor: "var(--bg-surface-elevated)",
    color: "var(--text-muted)",
    fontSize: "0.75rem",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    padding: "0.875rem 1.25rem",
    borderBottom: "1px solid var(--border-color)",
  },
  tr: {
    borderBottom: "1px solid var(--border-color)",
  },
  td: {
    padding: "0.875rem 1.25rem",
    fontSize: "0.875rem",
  },
  tdEmployee: {
    padding: "0.875rem 1.25rem",
  },
  empName: {
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "var(--text-primary)",
  },
  empEmail: {
    fontSize: "0.75rem",
    color: "var(--text-muted)",
  },
  tdCode: {
    padding: "0.875rem 1.25rem",
  },
  codeBadge: {
    backgroundColor: "var(--bg-surface-elevated)",
    color: "var(--primary-color)",
    padding: "0.2rem 0.5rem",
    borderRadius: "var(--radius-sm)",
    fontFamily: "var(--font-mono)",
    fontSize: "0.8125rem",
  },
  tdDate: {
    padding: "0.875rem 1.25rem",
    fontSize: "0.875rem",
    color: "var(--text-primary)",
  },
  tdTime: {
    padding: "0.875rem 1.25rem",
    fontSize: "0.875rem",
    color: "var(--text-secondary)",
    fontFamily: "var(--font-mono)",
  },
  tdHours: {
    padding: "0.875rem 1.25rem",
    fontSize: "0.875rem",
    color: "var(--primary-color)",
    fontWeight: "600",
    fontFamily: "var(--font-mono)",
  },
  statusBadge: {
    display: "inline-block",
    padding: "0.25rem 0.625rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.75rem",
    fontWeight: "600",
  },
  paginationRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "0.75rem",
    padding: "1rem 1.25rem",
    backgroundColor: "var(--bg-surface-elevated)",
    borderTop: "1px solid var(--border-color)",
  },
  pageBtn: {
    backgroundColor: "var(--primary-color)",
    color: "var(--text-on-primary)",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "var(--radius-md)",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: "600",
  },
  pageBtnDisabled: {
    backgroundColor: "var(--bg-surface-elevated)",
    color: "var(--text-muted)",
    border: "1px solid var(--border-color)",
    padding: "0.5rem 1rem",
    borderRadius: "var(--radius-md)",
    cursor: "not-allowed",
    fontSize: "0.875rem",
  },
  pageInfo: {
    fontSize: "0.875rem",
    color: "var(--text-secondary)",
  },
  stateContainer: {
    padding: "4rem 2rem",
    textAlign: "center",
  },
  loadingSpinner: {
    color: "var(--primary-color)",
    fontSize: "1rem",
  },
  emptyText: {
    color: "var(--text-muted)",
    fontSize: "1rem",
  },
  errorText: {
    color: "var(--danger-color)",
    fontSize: "1rem",
    marginBottom: "1rem",
  },
  retryBtn: {
    backgroundColor: "var(--danger-color)",
    color: "#ffffff",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "var(--radius-md)",
    cursor: "pointer",
  },
};
