import React, { useState, useEffect, useCallback } from "react";
import { X, Plus } from "lucide-react";
import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import { showSuccess, showError } from "../../shared/utils/toast";
import Pagination from "../../shared/components/Pagination";
import {
  getAllLeaveTypes,
  createLeaveType,
  updateLeaveType,
  activateLeaveType,
  deactivateLeaveType,
} from "../services/leaveApi";

function LeaveTypes() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 15;
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [annualAllocation, setAnnualAllocation] = useState("");
  const [isPaid, setIsPaid] = useState(true);
  const [requiresDocument, setRequiresDocument] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const fetchTypes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllLeaveTypes();
      setLeaveTypes(res.data || []);
    } catch (err) {
      console.error("Failed to fetch leave types", err);
      showError("Failed to fetch leave types.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  const openCreateModal = () => {
    setEditingType(null);
    setName("");
    setDescription("");
    setAnnualAllocation("12");
    setIsPaid(true);
    setRequiresDocument(false);
    setIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (t) => {
    setEditingType(t);
    setName(t.name);
    setDescription(t.description || "");
    setAnnualAllocation(String(t.annual_allocation));
    setIsPaid(t.is_paid);
    setRequiresDocument(t.requires_document);
    setIsActive(t.is_active);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      name,
      description: description || undefined,
      annual_allocation: Number(annualAllocation),
      is_paid: isPaid,
      requires_document: requiresDocument,
      is_active: isActive,
    };

    try {
      if (editingType) {
        await updateLeaveType(editingType.id, payload);
        showSuccess("Leave type updated successfully!");
      } else {
        await createLeaveType(payload);
        showSuccess("Leave type created successfully!");
      }
      setShowModal(false);
      fetchTypes();
    } catch (err) {
      console.error("Failed to save leave type", err);
      const errText = err.response?.data?.detail || "Failed to save leave type.";
      showError(errText);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (t) => {
    try {
      if (t.is_active) {
        await deactivateLeaveType(t.id);
        showSuccess(`Deactivated ${t.name}`);
      } else {
        await activateLeaveType(t.id);
        showSuccess(`Activated ${t.name}`);
      }
      fetchTypes();
    } catch (err) {
      console.error("Failed to toggle status", err);
      showError(err.response?.data?.detail || "Failed to toggle status.");
    }
  };

  const totalPages = Math.ceil(leaveTypes.length / ITEMS_PER_PAGE);
  const paginatedLeaveTypes = leaveTypes.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <AppLayout title="Leave Type Configurations">
      <div style={styles.container}>
        <BackToDashboard to="/hr/leaves" role="HR" />

        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Leave Type Configurations</h1>
            <p style={styles.subtitle}>Define annual allocations, paid status, and documentation rules</p>
          </div>

          <button style={{ ...styles.primaryBtn, display: "inline-flex", alignItems: "center", gap: "0.375rem" }} onClick={openCreateModal}>
            <Plus size={16} /> Create Leave Type
          </button>
        </div>

        {loading ? (
          <div style={styles.emptyState}>Loading leave types...</div>
        ) : leaveTypes.length === 0 ? (
          <div style={styles.emptyState}>No leave types configured.</div>
        ) : (
          <>
            <div style={styles.grid}>
              {paginatedLeaveTypes.map((t) => (
                <div key={t.id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <h3 style={styles.cardTitle}>{t.name}</h3>
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: t.is_active ? "rgba(34, 197, 94, 0.2)" : "rgba(148, 163, 184, 0.2)",
                        color: t.is_active ? "#4ade80" : "#94a3b8",
                      }}
                    >
                      {t.is_active ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>
                  <p style={styles.cardSubtitle}>{t.description || "No description provided."}</p>

                  <div style={styles.metaRow}>
                    <div>
                      <span style={styles.metaLabel}>Annual Allocation:</span>
                      <strong style={styles.metaVal}>{t.annual_allocation} days</strong>
                    </div>
                    <div>
                      <span style={styles.metaLabel}>Type:</span>
                      <span style={styles.metaVal}>{t.is_paid ? "Paid" : "Unpaid"}</span>
                    </div>
                  </div>

                  <div style={styles.metaRow}>
                    <div>
                      <span style={styles.metaLabel}>Requires Document:</span>
                      <span style={styles.metaVal}>{t.requires_document ? "Yes" : "No"}</span>
                    </div>
                  </div>

                  <div style={styles.cardActions}>
                    <button style={styles.secondaryBtn} onClick={() => openEditModal(t)}>
                      Edit
                    </button>
                    <button
                      style={{
                        ...styles.secondaryBtn,
                        color: t.is_active ? "#ef4444" : "#4ade80",
                        borderColor: t.is_active ? "#ef4444" : "#22c55e",
                      }}
                      onClick={() => toggleActive(t)}
                    >
                      {t.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={leaveTypes.length}
              onPrevious={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            />
          </>
        )}

        {/* Modal */}
        {showModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>{editingType ? "Edit Leave Type" : "Create Leave Type"}</h3>
                <button
                  style={{ ...styles.closeBtn, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                  onClick={() => setShowModal(false)}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Leave Type Name *</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Casual Leave"
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Description</label>
                  <textarea
                    style={{ ...styles.input, minHeight: "70px" }}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of leave type..."
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Annual Allocation (Days/Year) *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    style={styles.input}
                    value={annualAllocation}
                    onChange={(e) => setAnnualAllocation(e.target.value)}
                    required
                  />
                </div>

                <div style={styles.checkboxGroup}>
                  <label style={styles.checkboxLabel}>
                    <input type="checkbox" checked={isPaid} onChange={(e) => setIsPaid(e.target.checked)} />
                    Paid Leave
                  </label>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={requiresDocument}
                      onChange={(e) => setRequiresDocument(e.target.checked)}
                    />
                    Requires Supporting Document
                  </label>
                  <label style={styles.checkboxLabel}>
                    <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                    Active Status
                  </label>
                </div>

                <div style={styles.modalActions}>
                  <button type="button" style={styles.secondaryBtn} onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" style={styles.primaryBtn} disabled={submitting}>
                    {submitting ? "Saving..." : "Save Leave Type"}
                  </button>
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
  primaryBtn: {
    backgroundColor: "var(--primary-color)",
    color: "var(--text-on-primary)",
    border: "none",
    padding: "0.625rem 1.25rem",
    borderRadius: "var(--radius-md)",
    fontWeight: "600",
    cursor: "pointer",
  },
  alert: {
    padding: "0.875rem 1.25rem",
    borderRadius: "var(--radius-md)",
    border: "1px solid",
    marginBottom: "1.5rem",
    fontSize: "0.9rem",
  },
  emptyState: {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    padding: "2.5rem",
    textAlign: "center",
    color: "var(--text-muted)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 270px), 1fr))",
    gap: "1.25rem",
  },
  card: {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "var(--text-primary)",
    margin: 0,
  },
  statusBadge: {
    fontSize: "0.7rem",
    fontWeight: "700",
    padding: "0.2rem 0.5rem",
    borderRadius: "9999px",
  },
  cardSubtitle: {
    fontSize: "0.85rem",
    color: "var(--text-muted)",
    margin: "0.5rem 0 1rem 0",
  },
  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.8rem",
    color: "var(--text-secondary)",
    marginBottom: "0.5rem",
  },
  metaLabel: {
    color: "var(--text-muted)",
    marginRight: "0.375rem",
  },
  metaVal: {
    fontWeight: "600",
  },
  cardActions: {
    display: "flex",
    gap: "0.5rem",
    marginTop: "1rem",
    paddingTop: "1rem",
    borderTop: "1px solid var(--border-color)",
  },
  secondaryBtn: {
    backgroundColor: "var(--bg-surface-elevated)",
    color: "var(--text-primary)",
    border: "1px solid var(--border-color)",
    padding: "0.375rem 0.875rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.8rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
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
    width: "100%",
    maxWidth: "500px",
  },
  modalHeader: {
    padding: "1.25rem 1.5rem",
    borderBottom: "1px solid var(--border-color)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "var(--bg-surface-elevated)",
  },
  modalTitle: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "var(--text-primary)",
    margin: 0,
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: "var(--text-secondary)",
    fontSize: "1.5rem",
    cursor: "pointer",
  },
  form: {
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
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
  },
  input: {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-primary)",
    padding: "0.625rem 0.875rem",
    fontSize: "0.9rem",
    outline: "none",
  },
  checkboxGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.875rem",
    color: "var(--text-secondary)",
    cursor: "pointer",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
    marginTop: "1rem",
  },
};

export default LeaveTypes;
