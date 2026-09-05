import React, { useState, useEffect, useCallback } from "react";
import { KeyRound, CircleCheck, CircleX, RefreshCw, SlidersHorizontal } from "lucide-react";
import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import { ConfirmDialog } from "../../shared/components/Modal";
import { showSuccess, showError } from "../../shared/utils/toast";
import {
  getPasswordResetRequests,
  approvePasswordResetRequest,
  rejectPasswordResetRequest,
} from "../services/authApi";

function getStatusBadge(status) {
  switch (status) {
    case "APPROVED":
      return { label: "APPROVED", bg: "rgba(34, 197, 94, 0.2)", color: "#4ade80" };
    case "REJECTED":
      return { label: "REJECTED", bg: "rgba(239, 68, 68, 0.2)", color: "#f87171" };
    default:
      return { label: "PENDING", bg: "rgba(234, 179, 8, 0.2)", color: "#facc15" };
  }
}

function formatDate(isoString) {
  if (!isoString) return "--";
  try {
    return new Date(isoString).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return isoString;
  }
}

export default function PasswordResetRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Approval & Rejection Modal targets
  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPasswordResetRequests();
      setRequests(res.data || []);
    } catch (err) {
      console.error("Failed to fetch password reset requests:", err);
      showError(
        err.response?.data?.detail || "Failed to load password reset requests."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async () => {
    if (!approveTarget) return;
    setActionLoading(true);
    try {
      const res = await approvePasswordResetRequest(approveTarget.id);
      showSuccess(res.data?.message || "Password reset approved successfully.");
      setApproveTarget(null);
      fetchRequests();
    } catch (err) {
      console.error("Failed to approve password reset request:", err);
      showError(
        err.response?.data?.detail || "Failed to approve password reset request."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setActionLoading(true);
    try {
      const res = await rejectPasswordResetRequest(rejectTarget.id);
      showSuccess(res.data?.message || "Password reset request rejected successfully.");
      setRejectTarget(null);
      fetchRequests();
    } catch (err) {
      console.error("Failed to reject password reset request:", err);
      showError(
        err.response?.data?.detail || "Failed to reject password reset request."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRequests = requests.filter((req) => {
    if (statusFilter === "ALL") return true;
    return req.status === statusFilter;
  });

  return (
    <AppLayout title="Password Reset Requests">
      <div style={styles.container}>
        <BackToDashboard to="/hr/dashboard" role="HR" />

        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Password Reset Requests</h1>
            <p style={styles.subtitle}>
              Review and manage employee requests for temporary password generation
            </p>
          </div>

          <button
            style={{
              ...styles.refreshBtn,
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
            }}
            onClick={fetchRequests}
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? "spin" : ""} /> Refresh List
          </button>
        </div>

        {/* Filter Bar */}
        <div style={styles.filterCard}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <SlidersHorizontal size={18} style={{ color: "var(--text-secondary)" }} />
            <label style={styles.filterLabel}>Filter Status:</label>
          </div>
          <select
            style={styles.selectInput}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter status"
          >
            <option value="ALL">All Statuses ({requests.length})</option>
            <option value="PENDING">
              Pending ({requests.filter((r) => r.status === "PENDING").length})
            </option>
            <option value="APPROVED">
              Approved ({requests.filter((r) => r.status === "APPROVED").length})
            </option>
            <option value="REJECTED">
              Rejected ({requests.filter((r) => r.status === "REJECTED").length})
            </option>
          </select>
        </div>

        {/* Request List */}
        {loading ? (
          <div style={styles.emptyState}>Loading password reset requests...</div>
        ) : filteredRequests.length === 0 ? (
          <div style={styles.emptyState}>
            <KeyRound size={40} style={{ color: "var(--text-muted)", marginBottom: "0.75rem" }} />
            <h3 style={styles.emptyTitle}>No Password Reset Requests</h3>
            <p style={styles.emptySubtitle}>
              {statusFilter === "ALL"
                ? "No employee password reset requests have been submitted yet."
                : `No requests found with status "${statusFilter}".`}
            </p>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Employee Email</th>
                  <th style={styles.th}>User ID</th>
                  <th style={styles.th}>Requested At</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Reviewed At</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => {
                  const badge = getStatusBadge(req.status);
                  return (
                    <tr key={req.id} style={styles.tr}>
                      <td style={styles.td}>
                        <strong>{req.email}</strong>
                      </td>
                      <td style={styles.td}>#{req.user_id}</td>
                      <td style={styles.td}>{formatDate(req.requested_at)}</td>
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
                      <td style={styles.td}>{formatDate(req.reviewed_at)}</td>
                      <td style={styles.td}>
                        {req.status === "PENDING" ? (
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                              style={{
                                ...styles.approveBtn,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.25rem",
                              }}
                              onClick={() => setApproveTarget(req)}
                            >
                              <CircleCheck size={14} /> Approve
                            </button>
                            <button
                              style={{
                                ...styles.rejectBtn,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.25rem",
                              }}
                              onClick={() => setRejectTarget(req)}
                            >
                              <CircleX size={14} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                            No action required
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Approve Confirm Dialog */}
        <ConfirmDialog
          isOpen={Boolean(approveTarget)}
          onClose={() => setApproveTarget(null)}
          onConfirm={handleApprove}
          title="Approve Password Reset Request"
          message={`Approve this password reset request for ${approveTarget?.email}? An existing backend workflow will generate and email a temporary password to the employee.`}
          confirmText="Approve & Send Email"
          confirmVariant="primary"
          loading={actionLoading}
        />

        {/* Reject Confirm Dialog */}
        <ConfirmDialog
          isOpen={Boolean(rejectTarget)}
          onClose={() => setRejectTarget(null)}
          onConfirm={handleReject}
          title="Reject Password Reset Request"
          message={`Are you sure you want to reject this password reset request for ${rejectTarget?.email}?`}
          confirmText="Reject Request"
          confirmVariant="danger"
          loading={actionLoading}
        />
      </div>
    </AppLayout>
  );
}

const styles = {
  container: {
    padding: "0 0 2.5rem 0",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1.5rem",
    paddingBottom: "1rem",
    borderBottom: "1px solid var(--border-color)",
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
  refreshBtn: {
    backgroundColor: "var(--bg-surface-elevated)",
    color: "var(--text-primary)",
    border: "1px solid var(--border-color)",
    padding: "0.5rem 1rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.85rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  filterCard: {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    padding: "1rem 1.25rem",
    marginBottom: "1.5rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    flexWrap: "wrap",
  },
  filterLabel: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "var(--text-secondary)",
  },
  selectInput: {
    backgroundColor: "var(--bg-surface-elevated)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-primary)",
    padding: "0.5rem 0.875rem",
    fontSize: "0.875rem",
    outline: "none",
    cursor: "pointer",
  },
  tableWrapper: {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    overflowX: "auto",
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
    fontSize: "0.8rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
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
    padding: "0.25rem 0.625rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.75rem",
    fontWeight: "700",
    display: "inline-block",
  },
  approveBtn: {
    backgroundColor: "#22c55e",
    color: "#ffffff",
    border: "none",
    padding: "0.375rem 0.75rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.8rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  rejectBtn: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    color: "#f87171",
    border: "1px solid #ef4444",
    padding: "0.375rem 0.75rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.8rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  emptyState: {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    padding: "3.5rem 1.5rem",
    textAlign: "center",
  },
  emptyTitle: {
    fontSize: "1.125rem",
    fontWeight: "600",
    color: "var(--text-primary)",
    margin: "0 0 0.375rem 0",
  },
  emptySubtitle: {
    fontSize: "0.875rem",
    color: "var(--text-secondary)",
    margin: 0,
  },
};
