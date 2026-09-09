import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit2, ArrowLeft, RefreshCw, X, Check, Power, Tags, FileText } from "lucide-react";
import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import Pagination from "../../shared/components/Pagination";
import {
  getAllComplaintCategories,
  createComplaintCategory,
  updateComplaintCategory,
  toggleComplaintCategoryStatus,
} from "../services/complaintApi";
import { showSuccess, showError } from "../../shared/utils/toast";

function HRComplaintCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE);

  useEffect(() => {
    if (totalPages === 0) {
      setPage(1);
    } else if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedCategories = categories.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [nameInput, setNameInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllComplaintCategories();
      setCategories(res.data || []);
    } catch (err) {
      console.error("Failed to fetch complaint categories", err);
      showError("Failed to load complaint categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setNameInput("");
    setDescriptionInput("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setNameInput(cat.name);
    setDescriptionInput(cat.description || "");
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!nameInput || !nameInput.trim()) {
      showError("Category name is required.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingCategory) {
        await updateComplaintCategory(editingCategory.id, {
          name: nameInput.trim(),
          description: descriptionInput.trim() || undefined,
        });
        showSuccess("Category updated successfully.");
      } else {
        await createComplaintCategory({
          name: nameInput.trim(),
          description: descriptionInput.trim() || undefined,
        });
        showSuccess("New complaint category created.");
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      console.error("Failed to save category", err);
      showError(err.response?.data?.detail || "Failed to save category.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (cat) => {
    const actionText = cat.is_active ? "deactivate" : "activate";
    if (!window.confirm(`Are you sure you want to ${actionText} category '${cat.name}'?`)) return;

    try {
      await toggleComplaintCategoryStatus(cat.id);
      showSuccess(`Category '${cat.name}' ${cat.is_active ? "deactivated" : "activated"}.`);
      fetchCategories();
    } catch (err) {
      console.error("Failed to toggle category status", err);
      showError(err.response?.data?.detail || "Failed to update category status.");
    }
  };

  return (
    <AppLayout title="HR Complaint Categories Configuration">
      <div style={styles.container}>
        <BackToDashboard to="/hr/complaints" role="HR" icon={ArrowLeft} />

        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Complaint Categories</h1>
            <p style={styles.subtitle}>
              Manage workplace grievance categories and soft-deactivate legacy topics
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <button
              style={{ ...styles.secondaryNavBtn, display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
              onClick={fetchCategories}
              disabled={loading}
              title="Refresh"
            >
              <RefreshCw size={15} className={loading ? "spin" : ""} /> Refresh
            </button>
            <button
              style={{ ...styles.primaryNavBtn, display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
              onClick={handleOpenCreateModal}
            >
              <Plus size={16} /> Add New Category
            </button>
          </div>
        </div>

        {/* Categories Table View */}
        {loading ? (
          <div style={styles.emptyState}>Loading categories...</div>
        ) : categories.length === 0 ? (
          <div style={styles.emptyCard}>
            <Tags size={40} style={{ color: "var(--text-muted)", marginBottom: "0.75rem" }} />
            <h3 style={styles.emptyTitle}>No Categories Configured</h3>
            <p style={styles.emptySubtitle}>Click "Add New Category" to create complaint categories.</p>
          </div>
        ) : (
          <div className="employee-desktop-table" style={styles.tableWrapper}>
            <div style={{ overflowX: "auto", maxWidth: "100%" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Category Name</th>
                    <th style={styles.th}>Description</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Created Date</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCategories.map((c) => (
                    <tr key={c.id} style={styles.tr}>
                      <td style={styles.td}>
                        <strong style={{ color: "var(--text-primary)" }}>{c.name}</strong>
                      </td>
                      <td style={{ ...styles.td, color: "var(--text-secondary)" }}>
                        {c.description || "—"}
                      </td>
                      <td style={styles.td}>
                        {c.is_active ? (
                          <span style={{ ...styles.badge, backgroundColor: "rgba(34, 197, 94, 0.15)", color: "#22c55e" }}>Active</span>
                        ) : (
                          <span style={{ ...styles.badge, backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }}>Inactive</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        <span style={styles.subText}>
                          {new Date(c.created_at).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button
                            style={styles.actionBtn}
                            onClick={() => handleOpenEditModal(c)}
                            title="Edit Category"
                          >
                            <Edit2 size={14} /> Edit
                          </button>
                          <button
                            style={{
                              ...styles.actionBtn,
                              color: c.is_active ? "#ef4444" : "#22c55e",
                              borderColor: c.is_active ? "rgba(239, 68, 68, 0.3)" : "rgba(34, 197, 94, 0.3)",
                            }}
                            onClick={() => handleToggleStatus(c)}
                            title={c.is_active ? "Deactivate" : "Activate"}
                          >
                            <Power size={14} /> {c.is_active ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={categories.length}
              onPrevious={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            />
          </div>
        )}

        {/* Create / Edit Category Modal */}
        {isModalOpen && (
          <div style={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <div>
                  <h3 style={styles.modalTitle}>
                    {editingCategory ? "Edit Category" : "Add New Complaint Category"}
                  </h3>
                </div>
                <button style={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit}>
                <div style={styles.modalBody}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Category Name *</label>
                    <input
                      type="text"
                      style={styles.input}
                      placeholder="e.g. WORKPLACE, PAYROLL, FACILITIES..."
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      required
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Description (Optional)</label>
                    <textarea
                      style={styles.textarea}
                      rows={3}
                      placeholder="Short explanation of what types of complaints fall under this topic..."
                      value={descriptionInput}
                      onChange={(e) => setDescriptionInput(e.target.value)}
                    />
                  </div>
                </div>

                <div style={styles.modalFooter}>
                  <button
                    type="button"
                    style={styles.secondaryBtn}
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" style={styles.primaryBtn} disabled={submitting}>
                    {submitting ? "Saving..." : editingCategory ? "Save Changes" : "Create Category"}
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
    padding: "0 0 2.5rem 0",
  },
  header: {
    marginBottom: "1.5rem",
    paddingBottom: "1rem",
    borderBottom: "1px solid var(--border-color)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
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
  secondaryNavBtn: {
    backgroundColor: "var(--bg-surface-elevated)",
    color: "var(--text-primary)",
    border: "1px solid var(--border-color)",
    padding: "0.5rem 1rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.875rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  primaryNavBtn: {
    backgroundColor: "var(--primary-color)",
    color: "var(--text-on-primary)",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.875rem",
    fontWeight: "600",
    cursor: "pointer",
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
  subText: {
    fontSize: "0.75rem",
    color: "var(--text-muted)",
  },
  badge: {
    display: "inline-block",
    fontSize: "0.75rem",
    fontWeight: "700",
    padding: "0.2rem 0.6rem",
    borderRadius: "var(--radius-sm)",
  },
  actionBtn: {
    backgroundColor: "var(--bg-surface-elevated)",
    color: "var(--primary-color)",
    border: "1px solid var(--border-color)",
    padding: "0.35rem 0.65rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.8rem",
    fontWeight: "600",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.3rem",
  },
  emptyState: {
    padding: "3rem",
    textAlign: "center",
    color: "var(--text-muted)",
  },
  emptyCard: {
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
    width: "min(92vw, 500px)",
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
  },
  modalTitle: {
    fontSize: "1.1rem",
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
  },
  modalBody: {
    padding: "1.5rem",
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
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "var(--text-primary)",
  },
  input: {
    backgroundColor: "var(--bg-surface-elevated)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-primary)",
    padding: "0.625rem 0.875rem",
    fontSize: "0.9rem",
    outline: "none",
  },
  textarea: {
    backgroundColor: "var(--bg-surface-elevated)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-primary)",
    padding: "0.75rem 0.875rem",
    fontSize: "0.9rem",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
  },
  modalFooter: {
    padding: "1rem 1.5rem",
    borderTop: "1px solid var(--border-color)",
    backgroundColor: "var(--bg-surface-elevated)",
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
  },
  secondaryBtn: {
    backgroundColor: "var(--bg-surface)",
    color: "var(--text-primary)",
    border: "1px solid var(--border-color)",
    padding: "0.5rem 1.25rem",
    borderRadius: "var(--radius-md)",
    fontWeight: "600",
    fontSize: "0.875rem",
    cursor: "pointer",
  },
  primaryBtn: {
    backgroundColor: "var(--primary-color)",
    color: "var(--text-on-primary)",
    border: "none",
    padding: "0.5rem 1.25rem",
    borderRadius: "var(--radius-md)",
    fontWeight: "600",
    fontSize: "0.875rem",
    cursor: "pointer",
  },
};

export default HRComplaintCategories;
