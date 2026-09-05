import React, { useEffect, useState } from "react";
import { Check, ArrowLeft, ArrowRight } from "lucide-react";
import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import {
  checkIn,
  checkOut,
  getMyAttendanceHistory,
  getTodayAttendance,
} from "../services/attendanceApi";
import { showSuccess, showError } from "../../shared/utils/toast";

export default function Attendance() {
  const [todayStatus, setTodayStatus] = useState({
    has_checked_in: false,
    has_checked_out: false,
    attendance: null,
  });
  const [actionLoading, setActionLoading] = useState(false);

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchToday = async () => {
    try {
      const res = await getTodayAttendance();
      setTodayStatus(res.data);
    } catch (err) {
      console.error("Failed to load today's attendance status:", err);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      if (statusFilter) params.status = statusFilter;

      const res = await getMyAttendanceHistory(params);
      setHistory(res.data.items || []);
      setPage(res.data.page || 1);
      setTotalPages(res.data.total_pages || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      showError(err.response?.data?.detail || "Failed to load attendance history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToday();
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [page, fromDate, toDate, statusFilter]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await checkIn();
      showSuccess("Checked in successfully!");
      await fetchToday();
      await fetchHistory();
    } catch (err) {
      showError(err.response?.data?.detail || "Check-in failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      await checkOut();
      showSuccess("Checked out successfully!");
      await fetchToday();
      await fetchHistory();
    } catch (err) {
      showError(err.response?.data?.detail || "Check-out failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return "--:--";
    try {
      return new Date(isoString).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "--:--";
    }
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

  const formatWorkingMinutes = (minutes) => {
    if (minutes === null || minutes === undefined) return "--";
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins}m`;
    if (mins === 0) return `${hrs}h`;
    return `${hrs}h ${mins}m`;
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "PRESENT":
        return { backgroundColor: "rgba(22, 163, 74, 0.2)", color: "#4ade80", border: "1px solid #16a34a" };
      case "LATE":
        return { backgroundColor: "rgba(234, 179, 8, 0.2)", color: "#facc15", border: "1px solid #eab308" };
      case "HALF_DAY":
        return { backgroundColor: "rgba(249, 115, 22, 0.2)", color: "#fb923c", border: "1px solid #f97316" };
      case "ABSENT":
        return { backgroundColor: "rgba(220, 38, 38, 0.2)", color: "#f87171", border: "1px solid #dc2626" };
      default:
        return { backgroundColor: "rgba(148, 163, 184, 0.2)", color: "#cbd5e1", border: "1px solid #64748b" };
    }
  };

  return (
    <AppLayout title="My Attendance">
      <div style={styles.container}>
        <BackToDashboard to="/employee/dashboard" role="EMPLOYEE" />

        <div style={styles.header}>
          <h1 style={styles.title}>Attendance Management</h1>
          <p style={styles.subtitle}>Daily check-in, check-out & work hours history</p>
        </div>

        {/* Today's Card */}
        <div style={styles.todayCard}>
          <div style={styles.todayCardHeader}>
            <div style={styles.dateDisplay}>
              <span style={styles.todayLabel}>Today's Status</span>
              <span style={styles.todayDate}>{new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
            </div>
            <div style={styles.badgeGroup}>
              {todayStatus.attendance && (
                <span style={{ ...styles.statusBadge, ...getStatusBadgeStyle(todayStatus.attendance.status) }}>
                  {todayStatus.attendance.status}
                </span>
              )}
            </div>
          </div>

          <div style={styles.todayGrid}>
            <div style={styles.timeBox}>
              <span style={styles.boxLabel}>Check In</span>
              <span style={styles.boxValue}>
                {todayStatus.attendance?.check_in ? formatTime(todayStatus.attendance.check_in) : "--:--"}
              </span>
            </div>
            <div style={styles.timeBox}>
              <span style={styles.boxLabel}>Check Out</span>
              <span style={styles.boxValue}>
                {todayStatus.attendance?.check_out ? formatTime(todayStatus.attendance.check_out) : "--:--"}
              </span>
            </div>
            <div style={styles.timeBox}>
              <span style={styles.boxLabel}>Work Hours</span>
              <span style={styles.boxValue}>
                {formatWorkingMinutes(todayStatus.attendance?.working_minutes)}
              </span>
            </div>
          </div>

          <div style={styles.actionRow}>
            <button
              onClick={handleCheckIn}
              disabled={todayStatus.has_checked_in || actionLoading}
              style={todayStatus.has_checked_in ? styles.btnDisabled : styles.checkInBtn}
            >
              {actionLoading ? "Processing..." : todayStatus.has_checked_in ? <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}><Check size={16} /> Checked In</span> : "Check In"}
            </button>
            <button
              onClick={handleCheckOut}
              disabled={!todayStatus.has_checked_in || todayStatus.has_checked_out || actionLoading}
              style={!todayStatus.has_checked_in || todayStatus.has_checked_out ? styles.btnDisabled : styles.checkOutBtn}
            >
              {actionLoading ? "Processing..." : todayStatus.has_checked_out ? <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}><Check size={16} /> Checked Out</span> : "Check Out"}
            </button>
          </div>
        </div>

        {/* History Section */}
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Attendance History</h2>
          <span style={styles.totalCount}>Total Records: {total}</span>
        </div>

        {/* Filters */}
        <div style={styles.filterBar}>
          <div style={styles.filterItem}>
            <label style={styles.filterLabel}>From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
              style={styles.dateInput}
            />
          </div>
          <div style={styles.filterItem}>
            <label style={styles.filterLabel}>To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => { setToDate(e.target.value); setPage(1); }}
              style={styles.dateInput}
            />
          </div>
          <div style={styles.filterItem}>
            <label style={styles.filterLabel}>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              style={styles.selectInput}
            >
              <option value="">All Statuses</option>
              <option value="PRESENT">PRESENT</option>
              <option value="LATE">LATE</option>
            </select>
          </div>
          {(fromDate || toDate || statusFilter) && (
            <button
              onClick={() => { setFromDate(""); setToDate(""); setStatusFilter(""); setPage(1); }}
              style={styles.clearBtn}
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Table */}
        <div style={styles.tableCard}>
          {loading ? (
            <div style={styles.stateText}>Loading attendance history...</div>
          ) : history.length === 0 ? (
            <div style={styles.stateText}>No attendance history found.</div>
          ) : (
            <>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Date</th>
                      <th style={styles.th}>Check In</th>
                      <th style={styles.th}>Check Out</th>
                      <th style={styles.th}>Work Hours</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => (
                      <tr key={item.id} style={styles.tr}>
                        <td style={styles.tdDate}>{formatDate(item.attendance_date)}</td>
                        <td style={styles.td}>{formatTime(item.check_in)}</td>
                        <td style={styles.td}>{formatTime(item.check_out)}</td>
                        <td style={styles.tdHours}>{formatWorkingMinutes(item.working_minutes)}</td>
                        <td style={styles.td}>
                          <span style={{ ...styles.statusBadge, ...getStatusBadgeStyle(item.status) }}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div style={styles.paginationRow}>
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  style={{ ...(page <= 1 ? styles.pageBtnDisabled : styles.pageBtn), display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                >
                  <ArrowLeft size={14} /> Previous
                </button>
                <span style={styles.pageInfo}>
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  style={{ ...(page >= totalPages ? styles.pageBtnDisabled : styles.pageBtn), display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                >
                  Next <ArrowRight size={14} />
                </button>
              </div>
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
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
  },
  header: {
    marginBottom: "1.5rem",
  },
  title: {
    fontSize: "clamp(1.35rem, 4vw, 1.875rem)",
    fontWeight: "700",
    color: "var(--text-primary)",
    margin: 0,
    wordBreak: "break-word",
  },
  subtitle: {
    fontSize: "clamp(0.8rem, 2.5vw, 0.875rem)",
    color: "var(--text-secondary)",
    marginTop: "0.25rem",
  },
  todayCard: {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    padding: "1.25rem",
    marginBottom: "2rem",
    width: "100%",
    boxSizing: "border-box",
  },
  todayCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.25rem",
    flexWrap: "wrap",
    gap: "0.75rem",
  },
  dateDisplay: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    flex: "1 1 auto",
  },
  todayLabel: {
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "var(--text-muted)",
    textTransform: "uppercase",
  },
  todayDate: {
    fontSize: "clamp(1rem, 3.5vw, 1.25rem)",
    fontWeight: "700",
    color: "var(--primary-color)",
    wordBreak: "break-word",
  },
  badgeGroup: {
    display: "flex",
    gap: "0.5rem",
  },
  statusBadge: {
    padding: "0.25rem 0.625rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.75rem",
    fontWeight: "600",
  },
  todayGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))",
    gap: "1rem",
    marginBottom: "1.5rem",
    width: "100%",
  },
  timeBox: {
    backgroundColor: "var(--bg-surface-elevated)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    padding: "0.875rem 0.75rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minWidth: 0,
    width: "100%",
    boxSizing: "border-box",
  },
  boxLabel: {
    fontSize: "0.75rem",
    color: "var(--text-muted)",
    textTransform: "uppercase",
    marginBottom: "0.375rem",
    fontWeight: "600",
  },
  boxValue: {
    fontSize: "clamp(1.05rem, 3vw, 1.35rem)",
    fontWeight: "700",
    color: "var(--text-primary)",
    fontFamily: "var(--font-mono)",
  },
  actionRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.875rem",
    width: "100%",
  },
  checkInBtn: {
    flex: "1 1 140px",
    backgroundColor: "var(--success-color)",
    color: "#ffffff",
    border: "none",
    padding: "0.875rem 0.5rem",
    borderRadius: "var(--radius-md)",
    fontWeight: "700",
    fontSize: "0.95rem",
    cursor: "pointer",
    boxSizing: "border-box",
  },
  checkOutBtn: {
    flex: "1 1 140px",
    backgroundColor: "var(--danger-color)",
    color: "#ffffff",
    border: "none",
    padding: "0.875rem 0.5rem",
    borderRadius: "var(--radius-md)",
    fontWeight: "700",
    fontSize: "0.95rem",
    cursor: "pointer",
    boxSizing: "border-box",
  },
  btnDisabled: {
    flex: "1 1 140px",
    backgroundColor: "var(--bg-surface-elevated)",
    color: "var(--text-muted)",
    border: "1px solid var(--border-color)",
    padding: "0.875rem 0.5rem",
    borderRadius: "var(--radius-md)",
    fontWeight: "600",
    fontSize: "0.95rem",
    cursor: "not-allowed",
    boxSizing: "border-box",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "0.5rem",
    marginBottom: "1rem",
  },
  sectionTitle: {
    fontSize: "clamp(1.1rem, 3.5vw, 1.25rem)",
    fontWeight: "700",
    color: "var(--text-primary)",
    margin: 0,
  },
  totalCount: {
    fontSize: "0.875rem",
    color: "var(--text-secondary)",
  },
  filterBar: {
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    padding: "1rem",
    borderRadius: "var(--radius-lg)",
    marginBottom: "1.25rem",
    alignItems: "flex-end",
  },
  filterItem: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    flex: "1 1 130px",
    minWidth: 0,
  },
  filterLabel: {
    fontSize: "0.75rem",
    color: "var(--text-muted)",
    fontWeight: "600",
  },
  dateInput: {
    width: "100%",
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    color: "var(--text-primary)",
    padding: "0.5rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.875rem",
    boxSizing: "border-box",
  },
  selectInput: {
    width: "100%",
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    color: "var(--text-primary)",
    padding: "0.5rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.875rem",
    boxSizing: "border-box",
  },
  clearBtn: {
    backgroundColor: "var(--bg-surface-elevated)",
    color: "var(--text-primary)",
    border: "1px solid var(--border-color)",
    padding: "0.5rem 1rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.875rem",
    cursor: "pointer",
  },
  tableCard: {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    overflow: "hidden",
  },
  tableWrapper: {
    overflowX: "auto",
    width: "100%",
    maxWidth: "100%",
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
    padding: "0.875rem 1.25rem",
    borderBottom: "1px solid var(--border-color)",
  },
  tr: {
    borderBottom: "1px solid var(--border-color)",
  },
  td: {
    padding: "0.875rem 1.25rem",
    fontSize: "0.875rem",
    color: "var(--text-secondary)",
    fontFamily: "var(--font-mono)",
  },
  tdDate: {
    padding: "0.875rem 1.25rem",
    fontSize: "0.875rem",
    color: "var(--text-primary)",
    fontWeight: "600",
  },
  tdHours: {
    padding: "0.875rem 1.25rem",
    fontSize: "0.875rem",
    color: "var(--primary-color)",
    fontWeight: "600",
    fontFamily: "var(--font-mono)",
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
  stateText: {
    padding: "3rem",
    textAlign: "center",
    color: "var(--text-muted)",
  },
};
