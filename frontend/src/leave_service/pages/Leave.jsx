import React, { useState, useEffect, useCallback } from "react";
import { CalendarDays, X, Plus } from "lucide-react";
import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import { ConfirmDialog } from "../../shared/components/Modal";
import { getLeaveTypes, getMyLeaveBalance, getMyLeaves, applyLeave, cancelLeave } from "../services/leaveApi";
import { showSuccess, showError, showWarning } from "../../shared/utils/toast";

function getStatusBadge(status) {
  switch (status) {
    case "APPROVED":
      return { label: "APPROVED", bg: "rgba(34, 197, 94, 0.2)", color: "#4ade80" };
    case "REJECTED":
      return { label: "REJECTED", bg: "rgba(239, 68, 68, 0.2)", color: "#f87171" };
    case "CANCELLED":
      return { label: "CANCELLED", bg: "rgba(148, 163, 184, 0.2)", color: "#94a3b8" };
    case "REVOKED":
      return { label: "REVOKED", bg: "rgba(100, 116, 139, 0.2)", color: "#cbd5e1" };
    default:
      return { label: "PENDING", bg: "rgba(234, 179, 8, 0.2)", color: "#facc15" };
  }
}

function Leave() {
  const [balances, setBalances] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  // Form fields
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [leaveDuration, setLeaveDuration] = useState("SINGLE"); // "SINGLE" (1 Day) or "MULTI" (More than 1 Day)

  // Single Day state
  const [singleDate, setSingleDate] = useState("");
  const [singleDayType, setSingleDayType] = useState("FULL_DAY");

  // Multi Day state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startDayType, setStartDayType] = useState("FULL_DAY");
  const [endDayType, setEndDayType] = useState("FULL_DAY");

  const [reason, setReason] = useState("");
  const [file, setFile] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [typesRes, balanceRes, leavesRes] = await Promise.allSettled([
        getLeaveTypes(),
        getMyLeaveBalance(),
        getMyLeaves({ page: 1, limit: 20 }),
      ]);

      if (typesRes.status === "fulfilled") {
        setLeaveTypes(typesRes.value?.data || []);
      }
      if (balanceRes.status === "fulfilled") {
        setBalances(balanceRes.value?.data || []);
      }
      if (leavesRes.status === "fulfilled") {
        setLeaveRequests(leavesRes.value?.data?.items || []);
      }
    } catch (err) {
      console.error("Failed to fetch leave data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDurationChange = (mode) => {
    setLeaveDuration(mode);
    if (mode === "SINGLE") {
      if (startDate) {
        setSingleDate(startDate);
      }
      setSingleDayType("FULL_DAY");
      setStartDate("");
      setEndDate("");
      setStartDayType("FULL_DAY");
      setEndDayType("FULL_DAY");
    } else {
      if (singleDate) {
        setStartDate(singleDate);
      }
      setSingleDate("");
      setSingleDayType("FULL_DAY");
      setStartDayType("FULL_DAY");
      setEndDayType("FULL_DAY");
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!leaveTypeId || !reason) {
      showWarning("Please fill in all required fields.");
      return;
    }

    let finalStartDate = "";
    let finalEndDate = "";
    let finalStartDayType = "FULL_DAY";
    let finalEndDayType = "FULL_DAY";

    if (leaveDuration === "SINGLE") {
      if (!singleDate) {
        showWarning("Please select a date.");
        return;
      }
      finalStartDate = singleDate;
      finalEndDate = singleDate;
      finalStartDayType = singleDayType;
      finalEndDayType = singleDayType;
    } else {
      if (!startDate || !endDate) {
        showWarning("Please select both start and end dates.");
        return;
      }
      if (endDate < startDate) {
        showWarning("End Date cannot be before Start Date.");
        return;
      }
      finalStartDate = startDate;
      finalEndDate = endDate;
      finalStartDayType = startDayType;
      finalEndDayType = endDayType;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("leave_type_id", leaveTypeId);
      formData.append("start_date", finalStartDate);
      formData.append("end_date", finalEndDate);
      formData.append("start_day_type", finalStartDayType);
      formData.append("end_day_type", finalEndDayType);
      formData.append("reason", reason);
      if (file) {
        formData.append("document", file);
      }

      await applyLeave(formData);
      showSuccess("Leave request submitted successfully!");
      setShowApplyModal(false);
      resetForm();
      fetchData();

      // Trigger notification bell count refresh
      window.dispatchEvent(new Event("hrms:notification_update"));
    } catch (err) {
      console.error("Failed to apply for leave", err);
      const errText = err.response?.data?.detail || "Failed to submit leave request. Please check inputs.";
      showError(errText);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmCancelRequest = async (e) => {
    if (e) e.preventDefault();
    if (!cancelTargetId) return;
    if (!cancellationReason.trim()) {
      showWarning("Cancellation reason is required.");
      return;
    }
    setCancelling(true);
    try {
      await cancelLeave(cancelTargetId, { cancellation_reason: cancellationReason.trim() });
      showSuccess("Leave request cancelled successfully.");
      setCancelTargetId(null);
      setCancellationReason("");
      fetchData();
    } catch (err) {
      console.error("Failed to cancel leave request", err);
      const errText = err.response?.data?.detail || "Unable to cancel leave request.";
      showError(errText);
    } finally {
      setCancelling(false);
    }
  };

  const resetForm = () => {
    setLeaveTypeId("");
    setLeaveDuration("SINGLE");
    setSingleDate("");
    setSingleDayType("FULL_DAY");
    setStartDate("");
    setEndDate("");
    setStartDayType("FULL_DAY");
    setEndDayType("FULL_DAY");
    setReason("");
    setFile(null);
  };

  return (
    <AppLayout title="Apply for Leave">
      <div style={styles.container}>
        <BackToDashboard to="/employee/dashboard" role="EMPLOYEE" />

        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Leave Management</h1>
            <p style={styles.subtitle}>
              Track leave balances, apply for leave, and view request status
            </p>
          </div>

          <button
            style={{ ...styles.applyBtn, display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
            onClick={() => {
              resetForm();
              setShowApplyModal(true);
            }}
          >
            <Plus size={16} /> Apply for Leave
          </button>
        </div>

        {/* Leave Balances Grid */}
        <h2 style={styles.sectionTitle}>Leave Balances</h2>
        <div style={styles.balanceGrid}>
          {balances.length === 0 ? (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>No Leave Balances Assigned</h3>
              <p style={styles.cardSubtitle}>
                No active leave balance is allocated for this year. Please contact HR if your balances need to be initialized.
              </p>
            </div>
          ) : (
            balances.map((b) => (
              <div key={b.id || b.leave_type_id} style={styles.card}>
                <h3 style={styles.cardTitle}>{b.leave_type_name || "Leave Balance"}</h3>
                <p style={styles.cardSubtitle}>Year {b.year}</p>
                <div style={styles.balanceRow}>
                  <span style={styles.balanceNum}>
                    {Number(b.allocated_days - b.used_days - b.pending_days).toFixed(1)}
                  </span>
                  <span style={styles.balanceLabel}>remaining</span>
                </div>
                <div style={styles.balanceMeta}>
                  <span>Allocated: {b.allocated_days}</span>
                  <span>Used: {b.used_days}</span>
                  <span>Pending: {b.pending_days}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Leave Requests History */}
        <h2 style={styles.sectionTitle}>My Leave Requests</h2>
        {loading ? (
          <div style={styles.emptyState}>Loading leave history...</div>
        ) : leaveRequests.length === 0 ? (
          <div style={styles.emptyState}>
            <CalendarDays size={36} style={{ margin: "0 auto 0.5rem auto", color: "var(--text-muted)", display: "block" }} />
            No leave requests submitted yet.
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Leave Type</th>
                  <th style={styles.th}>Dates</th>
                  <th style={styles.th}>Duration</th>
                  <th style={styles.th}>Reason</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.map((req) => {
                  const badge = getStatusBadge(req.status);
                  return (
                    <tr key={req.id} style={styles.tr}>
                      <td style={styles.td}>
                        <strong>{req.leave_type_name || "Leave"}</strong>
                      </td>
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
                        {(req.status === "PENDING" || req.status === "APPROVED") && (
                          <button
                            style={styles.cancelBtn}
                            onClick={() => {
                              setCancelTargetId(req.id);
                              setCancellationReason("");
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Apply Leave Modal */}
        {showApplyModal && (
          <div style={styles.modalOverlay} onClick={() => setShowApplyModal(false)}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>Apply for Leave</h2>
                <button
                  type="button"
                  style={styles.closeBtn}
                  onClick={() => setShowApplyModal(false)}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleApplySubmit} style={styles.formContent}>
                <div style={styles.modalBody}>
                  {/* Leave Type */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Leave Type <span style={styles.required}>*</span>
                    </label>
                    <select
                      style={styles.select}
                      value={leaveTypeId}
                      onChange={(e) => setLeaveTypeId(e.target.value)}
                      required
                    >
                      <option value="">Select Leave Type</option>
                      {leaveTypes
                        .filter((t) => t.is_active)
                        .map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.code}) - {t.max_days_per_year} days/yr
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Leave Duration */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Leave Duration <span style={styles.required}>*</span>
                    </label>
                    <select
                      style={styles.select}
                      value={leaveDuration}
                      onChange={(e) => handleDurationChange(e.target.value)}
                      required
                    >
                      <option value="SINGLE">1 Day</option>
                      <option value="MULTI">More than 1 Day</option>
                    </select>
                  </div>

                  {/* 1 Day vs Multi-Day fields */}
                  {leaveDuration === "SINGLE" ? (
                    <div className="hrms-form-grid-2">
                      <div style={styles.formGroup}>
                        <label style={styles.label}>
                          Date <span style={styles.required}>*</span>
                        </label>
                        <input
                          type="date"
                          style={styles.input}
                          value={singleDate}
                          onChange={(e) => setSingleDate(e.target.value)}
                          required
                        />
                      </div>

                      <div style={styles.formGroup}>
                        <label style={styles.label}>
                          Day Type <span style={styles.required}>*</span>
                        </label>
                        <select
                          style={styles.select}
                          value={singleDayType}
                          onChange={(e) => setSingleDayType(e.target.value)}
                        >
                          <option value="FULL_DAY">Full Day</option>
                          <option value="FIRST_HALF">First Half (Morning)</option>
                          <option value="SECOND_HALF">Second Half (Afternoon)</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="hrms-form-grid-2">
                        <div style={styles.formGroup}>
                          <label style={styles.label}>
                            Start Date <span style={styles.required}>*</span>
                          </label>
                          <input
                            type="date"
                            style={styles.input}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                          />
                        </div>

                        <div style={styles.formGroup}>
                          <label style={styles.label}>Start Day Type</label>
                          <select
                            style={styles.select}
                            value={startDayType}
                            onChange={(e) => setStartDayType(e.target.value)}
                          >
                            <option value="FULL_DAY">Full Day</option>
                            <option value="FIRST_HALF">First Half (Morning)</option>
                            <option value="SECOND_HALF">Second Half (Afternoon)</option>
                          </select>
                        </div>
                      </div>

                      <div className="hrms-form-grid-2">
                        <div style={styles.formGroup}>
                          <label style={styles.label}>
                            End Date <span style={styles.required}>*</span>
                          </label>
                          <input
                            type="date"
                            style={styles.input}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                          />
                        </div>

                        <div style={styles.formGroup}>
                          <label style={styles.label}>End Day Type</label>
                          <select
                            style={styles.select}
                            value={endDayType}
                            onChange={(e) => setEndDayType(e.target.value)}
                          >
                            <option value="FULL_DAY">Full Day</option>
                            <option value="FIRST_HALF">First Half (Morning)</option>
                            <option value="SECOND_HALF">Second Half (Afternoon)</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Reason */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Reason for Leave <span style={styles.required}>*</span>
                    </label>
                    <textarea
                      style={styles.textarea}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Please provide a clear reason..."
                      required
                    />
                  </div>

                  {/* Supporting Document */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Supporting Document (Optional)</label>
                    <input
                      type="file"
                      style={styles.input}
                      onChange={(e) => setFile(e.target.files[0] || null)}
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    />
                  </div>
                </div>

                <div style={styles.modalFooter}>
                  <div className="hrms-modal-footer-actions">
                    <button
                      type="button"
                      style={styles.secondaryBtn}
                      onClick={() => setShowApplyModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" style={styles.submitBtn} disabled={submitting}>
                      {submitting ? "Submitting..." : "Submit Leave Request"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Cancel Leave Modal */}
        {Boolean(cancelTargetId) && (
          <div style={styles.modalOverlay} onClick={() => setCancelTargetId(null)}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>Cancel Leave Request</h3>
                <button
                  type="button"
                  style={styles.closeBtn}
                  onClick={() => setCancelTargetId(null)}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={confirmCancelRequest} style={styles.formContent}>
                <div style={styles.modalBody}>
                  <p style={{ color: "var(--text-primary)", fontSize: "0.9rem", margin: 0 }}>
                    Please provide a reason for cancelling this leave request.
                  </p>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Cancellation Reason <span style={styles.required}>*</span>
                    </label>
                    <textarea
                      style={styles.textarea}
                      value={cancellationReason}
                      onChange={(e) => setCancellationReason(e.target.value)}
                      placeholder="Enter reason for cancellation..."
                      required
                    />
                  </div>
                </div>
                <div style={styles.modalFooter}>
                  <div className="hrms-modal-footer-actions">
                    <button
                      type="button"
                      style={styles.secondaryBtn}
                      onClick={() => setCancelTargetId(null)}
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      style={{ ...styles.primaryBtn, backgroundColor: "var(--danger-color)" }}
                      disabled={cancelling}
                    >
                      {cancelling ? "Cancelling..." : "Confirm Cancellation"}
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
    alignItems: "flex-start",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
    gap: "1rem",
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
  applyBtn: {
    backgroundColor: "var(--primary-color)",
    color: "var(--text-on-primary)",
    border: "none",
    padding: "0.625rem 1.25rem",
    borderRadius: "var(--radius-md)",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  alert: {
    padding: "0.875rem 1.25rem",
    borderRadius: "var(--radius-md)",
    border: "1px solid",
    marginBottom: "1.5rem",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "var(--text-primary)",
    marginBottom: "1rem",
    marginTop: "1.5rem",
  },
  balanceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
    gap: "1.25rem",
    marginBottom: "2rem",
  },
  card: {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    padding: "1.25rem",
  },
  cardTitle: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "var(--text-primary)",
    margin: 0,
  },
  cardSubtitle: {
    fontSize: "0.8rem",
    color: "var(--text-muted)",
    marginTop: "0.2rem",
  },
  balanceRow: {
    display: "flex",
    alignItems: "baseline",
    gap: "0.5rem",
    margin: "1rem 0 0.5rem 0",
  },
  balanceNum: {
    fontSize: "2.25rem",
    fontWeight: "700",
    color: "var(--primary-color)",
  },
  balanceLabel: {
    fontSize: "0.875rem",
    color: "var(--text-secondary)",
  },
  balanceMeta: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.75rem",
    color: "var(--text-muted)",
    borderTop: "1px solid var(--border-color)",
    paddingTop: "0.5rem",
    marginTop: "0.5rem",
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
  cancelBtn: {
    backgroundColor: "transparent",
    color: "var(--danger-color)",
    border: "1px solid var(--danger-color)",
    padding: "0.25rem 0.625rem",
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
    width: "min(92vw, 680px)",
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
    transition: "all 0.15s ease",
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
  label: {
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "var(--text-secondary)",
    display: "block",
  },
  required: {
    color: "var(--danger-color)",
    marginLeft: "0.2rem",
  },
  input: {
    width: "100%",
    height: "42px",
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-primary)",
    padding: "0.625rem 0.875rem",
    fontSize: "0.9rem",
    outline: "none",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    height: "42px",
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-primary)",
    padding: "0.625rem 0.875rem",
    fontSize: "0.9rem",
    outline: "none",
    cursor: "pointer",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    minHeight: "95px",
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
  fileInput: {
    width: "100%",
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-primary)",
    padding: "0.5rem 0.75rem",
    fontSize: "0.85rem",
    outline: "none",
    boxSizing: "border-box",
  },
  modalFooter: {
    padding: "1rem 1.5rem",
    borderTop: "1px solid var(--border-color)",
    backgroundColor: "var(--bg-surface-elevated)",
    flexShrink: 0,
  },
  cancelModalBtn: {
    backgroundColor: "var(--bg-surface)",
    color: "var(--text-primary)",
    border: "1px solid var(--border-color)",
    padding: "0.625rem 1.25rem",
    borderRadius: "var(--radius-md)",
    fontWeight: "600",
    fontSize: "0.875rem",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  submitBtn: {
    backgroundColor: "var(--primary-color)",
    color: "var(--text-on-primary)",
    border: "none",
    padding: "0.625rem 1.25rem",
    borderRadius: "var(--radius-md)",
    fontWeight: "600",
    fontSize: "0.875rem",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
};

export default Leave;
