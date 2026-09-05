import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import { getProjectById, updateProject } from "../services/projectApi";
import { showSuccess, showError } from "../../shared/utils/toast";

export default function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    priority: "MEDIUM",
    progress_percentage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const res = await getProjectById(id);
        const p = res.data;
        setFormData({
          name: p.name || "",
          description: p.description || "",
          start_date: p.start_date || "",
          end_date: p.end_date || "",
          priority: p.priority || "MEDIUM",
          progress_percentage: p.progress_percentage || 0,
        });
      } catch (err) {
        showError(err.response?.data?.detail || "Failed to load project details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description ? formData.description.trim() : None,
        start_date: formData.start_date,
        end_date: formData.end_date ? formData.end_date : null,
        priority: formData.priority,
        progress_percentage: parseInt(formData.progress_percentage, 10),
      };

      await updateProject(id, payload);
      showSuccess(`Project updated successfully!`);
      navigate(`/hr/projects/${id}`);
    } catch (err) {
      showError(err.response?.data?.detail || "Failed to update project.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout title="Edit Project">
      <div style={styles.container}>
        <BackToDashboard to={`/hr/projects/${id}`} role="HR" />

        {loading ? (
          <div style={styles.loadingState}>Loading project details...</div>
        ) : (
          <div style={styles.card}>
            <div style={styles.header}>
              <h2 style={styles.title}>Edit Project Details</h2>
              <p style={styles.subtitle}>Update project scope, timelines, progress percentage & priority level</p>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Project Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  style={styles.textarea}
                />
              </div>

              <div style={styles.row}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Start Date *</label>
                  <input
                    type="date"
                    name="start_date"
                    required
                    value={formData.start_date}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>End Date (Optional for ongoing)</label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Priority Level *</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    style={styles.select}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Progress Percentage ({formData.progress_percentage}%)</label>
                  <input
                    type="range"
                    name="progress_percentage"
                    min={0}
                    max={100}
                    value={formData.progress_percentage}
                    onChange={handleChange}
                    style={styles.rangeInput}
                  />
                </div>
              </div>

              <div style={styles.buttonGroup}>
                <button
                  type="button"
                  onClick={() => navigate(`/hr/projects/${id}`)}
                  style={styles.cancelBtn}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={submitting ? styles.submitBtnDisabled : styles.submitBtn}
                  disabled={submitting}
                >
                  {submitting ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

const styles = {
  container: {
    padding: "0 0 2rem 0",
    maxWidth: "800px",
    margin: "0 auto",
  },
  card: {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    padding: "1.75rem",
    boxShadow: "var(--shadow-sm)",
  },
  header: {
    marginBottom: "1.5rem",
    borderBottom: "1px solid var(--border-color)",
    paddingBottom: "1rem",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "var(--text-primary)",
    margin: 0,
  },
  subtitle: {
    fontSize: "0.875rem",
    color: "var(--text-secondary)",
    marginTop: "0.25rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
    gap: "1rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.375rem",
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "var(--text-secondary)",
  },
  input: {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    color: "var(--text-primary)",
    padding: "0.625rem 0.875rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.875rem",
  },
  textarea: {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    color: "var(--text-primary)",
    padding: "0.625rem 0.875rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.875rem",
    resize: "vertical",
  },
  select: {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    color: "var(--text-primary)",
    padding: "0.625rem 0.875rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.875rem",
  },
  rangeInput: {
    accentColor: "var(--primary-color)",
    cursor: "pointer",
    height: "38px",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
    marginTop: "1rem",
  },
  cancelBtn: {
    backgroundColor: "var(--bg-surface-elevated)",
    color: "var(--text-primary)",
    border: "1px solid var(--border-color)",
    padding: "0.625rem 1.25rem",
    borderRadius: "var(--radius-md)",
    cursor: "pointer",
    fontWeight: "500",
  },
  submitBtn: {
    backgroundColor: "var(--primary-color)",
    color: "var(--text-on-primary)",
    border: "none",
    padding: "0.625rem 1.25rem",
    borderRadius: "var(--radius-md)",
    cursor: "pointer",
    fontWeight: "600",
  },
  submitBtnDisabled: {
    backgroundColor: "var(--bg-surface-elevated)",
    color: "var(--text-muted)",
    border: "1px solid var(--border-color)",
    padding: "0.625rem 1.25rem",
    borderRadius: "var(--radius-md)",
    cursor: "not-allowed",
  },
  loadingState: {
    textAlign: "center",
    padding: "3rem",
    color: "var(--text-muted)",
  },
};
