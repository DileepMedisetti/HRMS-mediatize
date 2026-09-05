import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Tags, WalletCards, X } from "lucide-react";
import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import { getAllLeaves, approveLeave, rejectLeave } from "../services/leaveApi";
import { showSuccess, showError } from "../../shared/utils/toast";

function getStatusBadge(status) {
  switch (status) {
    case "APPROVED":
      return { label: "APPROVED", bg: "rgba(34, 197, 94, 0.2)", color: "#4ade80" };
    case "REJECTED":
      return { label: "REJECTED", bg: "rgba(239, 68, 68, 0.2)", color: "#f87171" };
    case "CANCELLED":
      return { label: "CANCELLED", bg: "rgba(148, 163, 184, 0.2)", color: "#94a3b8" };
    default:
      return { label: "PENDING", bg: "rgba(234, 179, 8, 0.2)", color: "#facc15" };
  }
}

function HRLeave() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionType, setActionType] = useState(""); // "APPROVE" or "REJECT"
  const [hrRemarks, setHrRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllLeaves({
        page,
        limit: 20,
        status: statusFilter || undefined,
      });
      setLeaves(res.data?.items || []);
      setTotalPages(res.data?.pages || 1);
    } catch (err) {
      console.error("Failed to fetch leave requests", err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLeave) return;

    setSubmitting(true);

    try {
      if (actionType === "APPROVE") {
        await approveLeave(selectedLeave.id, { hr_remarks: hrRemarks });
        showSuccess("Leave request approved successfully!");
      } else if (actionType === "REJECT") {
        await rejectLeave(selectedLeave.id, { hr_remarks: hrRemarks });
        showSuccess("Leave request rejected successfully.");
      }
      setSelectedLeave(null);
      setHrRemarks("");
      fetchLeaves();
    } catch (err) {
      console.error("Failed to update leave request", err);
      const errText = err.response?.data?.detail || "Action failed.";
      showError(errText);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout title="HR Leave Management">
      <div style={styles.container}>
        <BackToDashboard to="/hr/dashboard" role="HR" />

        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>HR Leave Management</h1>
            <p style={styles.subtitle}>Review employee leave applications and manage balances</p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Link to="/hr/leave-types" style={{ ...styles.secondaryNavBtn, display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
              <Tags size={16} /> Leave Types
            </Link>
            <Link to="/hr/leave-balances" style={{ ...styles.secondaryNavBtn, display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
              <WalletCards size={16} /> Leave Balances
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <div style={styles.filterBar}>
          <label style={styles.label}>Filter Status:</label>
          <select
            style={styles.select}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div style={styles.emptyState}>Loading leave requests...</div>
        ) : leaves.length === 0 ? (
          <div style={styles.emptyState}>No leave requests found.</div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Employee</th>
                  <th style={styles.th}>Leave Type</th>
                  <th style={styles.th}>Dates</th>
                  <th style={styles.th}>Duration</th>
                  <th style={styles.th}>Reason</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((req) => {
                  const badge = getStatusBadge(req.status);
                  return (
                    <tr key={req.id} style={styles.tr}>
                      <td style={styles.td}>
                        <strong>{req.employee_name}</strong>
                        <br />
                        <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{req.employee_code}</span>
                      </td>
                      <td style={styles.td}>{req.leave_type_name}</td>
                      <td style={styles.td}>
                        {req.start_date} to {req.end_date}
                      </td>
                      <td style={styles.td}>{req.duration} day(s)</td>
                      <td style={styles.td}>{req.reason}</td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.badge,
                            backgroundColor: badge.bg,
                            color: badge.color,
                          }}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {req.status === "PENDING" && (
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                              style={styles.approveBtn}
                              onClick={() => {
                                setSelectedLeave(req);
                                setActionType("APPROVE");
                                setHrRemarks("");
                              }}
                            >
                              Approve
                            </button>
                            <button
                              style={styles.rejectBtn}
                              onClick={() => {
                                setSelectedLeave(req);
                                setActionType("REJECT");
                                setHrRemarks("");
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Review Modal */}
        {selectedLeave && (
          <div style={styles.modalOverlay} onClick={() => setSelectedLeave(null)}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>
                  {actionType === "APPROVE" ? "Approve Leave Request" : "Reject Leave Request"}
                </h3>
                <button
                  type="button"
                  style={styles.closeBtn}
                  onClick={() => setSelectedLeave(null)}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleActionSubmit} style={styles.formContent}>
                <div style={styles.modalBody}>
                  <p style={{ color: "var(--text-primary)", fontSize: "0.9rem", lineHeight: "1.5", margin: 0 }}>
                    <strong>Employee:</strong> {selectedLeave.employee_name} ({selectedLeave.employee_code})<br />
                    <strong>Leave:</strong> {selectedLeave.leave_type_name} ({selectedLeave.start_date} to {selectedLeave.end_date})
                  </p>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>HR Remarks (Optional)</label>
                    <textarea
                      style={styles.textarea}
                      value={hrRemarks}
                      onChange={(e) => setHrRemarks(e.target.value)}
                      placeholder="Enter remarks for employee..."
                    />
                  </div>
                </div>
                <div style={styles.modalFooter}>
                  <div className="hrms-modal-footer-actions">
                    <button type="button" style={styles.secondaryBtn} onClick={() => setSelectedLeave(null)}>
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{
                        ...styles.primaryBtn,
                        backgroundColor: actionType === "APPROVE" ? "var(--success-color)" : "var(--danger-color)",
                      }}
                      disabled={submitting}
                    >
                      {submitting ? "Processing..." : actionType === "APPROVE" ? "Confirm Approve" : "Confirm Reject"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

const styles = {
  container: {
    padding: "0 0 2rem 0",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
    paddingBottom: "1rem",
    borderBottom: "1px solid var(--border-color)",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "var(--text-primary)",
    margin: 0,
  },
  subtitle: {
    fontSize: "0.95rem",
    color: "var(--text-secondary)",
    marginTop: "0.25rem",
  },
  secondaryNavBtn: {
    backgroundColor: "var(--bg-surface-elevated)",
    color: "var(--text-primary)",
    border: "1px solid var(--border-color)",
    textDecoration: "none",
    padding: "0.5rem 1rem",
    borderRadius: "var(--radius-md)",
    fontWeight: "600",
    fontSize: "0.85rem",
  },
  alert: {
    padding: "0.875rem 1.25rem",
    borderRadius: "var(--radius-md)",
    border: "1px solid",
    marginBottom: "1.5rem",
    fontSize: "0.9rem",
  },
  filterBar: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  label: {
    fontSize: "0.875rem",
    color: "var(--text-secondary)",
    fontWeight: "600",
  },
  select: {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    color: "var(--text-primary)",
    padding: "0.5rem 0.875rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.875rem",
  },
  emptyState: {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    padding: "2.5rem",
    textAlign: "center",
    color: "var(--text-muted)",
  },
  tableWrapper: {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    overflowX: "auto",
    maxWidth: "100%",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
    fontSize: "0.9rem",
  },
  th: {
    backgroundColor: "var(--bg-surface-elevated)",
    color: "var(--text-muted)",
    padding: "0.875rem 1rem",
    fontWeight: "600",
    borderBottom: "1px solid var(--border-color)",
  },
  tr: {
    borderBottom: "1px solid var(--border-color)",
  },
  td: {
    padding: "0.875rem 1rem",
    color: "var(--text-primary)",
  },
  badge: {
    fontSize: "0.75rem",
    fontWeight: "700",
    padding: "0.2rem 0.6rem",
    borderRadius: "9999px",
  },
  approveBtn: {
    backgroundColor: "var(--success-color)",
    color: "#ffffff",
    border: "none",
    padding: "0.35rem 0.75rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.75rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  rejectBtn: {
    backgroundColor: "var(--danger-color)",
    color: "#ffffff",
    border: "none",
    padding: "0.35rem 0.75rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.75rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1100,
    padding: "1rem",
  },
  modal: {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-xl)",
    width: "min(92vw, 540px)",
    maxHeight: "calc(100vh - 32px)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "var(--shadow-overlay)",
  },
  modalHeader: {
    padding: "1.25rem 1.5rem",
    borderBottom: "1px solid var(--border-color)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "var(--bg-surface-elevated)",
    flexShrink: 0,
  },
  modalTitle: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "var(--text-primary)",
    margin: 0,
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "var(--text-secondary)",
    cursor: "pointer",
    padding: "0.375rem",
    borderRadius: "var(--radius-md)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  formContent: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minHeight: 0,
    overflow: "hidden",
  },
  modalBody: {
    padding: "1.5rem",
    overflowY: "auto",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.375rem",
  },
  textarea: {
    width: "100%",
    minHeight: "85px",
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-primary)",
    padding: "0.75rem 0.875rem",
    fontSize: "0.9rem",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  modalFooter: {
    padding: "1rem 1.5rem",
    borderTop: "1px solid var(--border-color)",
    backgroundColor: "var(--bg-surface-elevated)",
    flexShrink: 0,
  },
  secondaryBtn: {
    backgroundColor: "var(--bg-surface)",
    color: "var(--text-primary)",
    border: "1px solid var(--border-color)",
    padding: "0.625rem 1.25rem",
    borderRadius: "var(--radius-md)",
    fontWeight: "600",
    fontSize: "0.875rem",
    cursor: "pointer",
  },
  primaryBtn: {
    color: "#ffffff",
    border: "none",
    padding: "0.625rem 1.25rem",
    borderRadius: "var(--radius-md)",
    fontWeight: "600",
    fontSize: "0.875rem",
    cursor: "pointer",
  },
};

export default HRLeave;
