import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import { createProject } from "../services/projectApi";
import { showSuccess, showError } from "../../shared/utils/toast";

export default function CreateProject() {
  const [formData, setFormData] = useState({
    name: "",
    project_code: "",
    description: "",
    start_date: "",
    end_date: "",
    priority: "MEDIUM",
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        ...(formData.project_code && { project_code: formData.project_code.trim() }),
        ...(formData.description && { description: formData.description.trim() }),
        start_date: formData.start_date,
        ...(formData.end_date && { end_date: formData.end_date }),
        priority: formData.priority,
      };

      const res = await createProject(payload);
      showSuccess(`Project '${res.data.name}' (${res.data.project_code}) created successfully!`);
      navigate(`/hr/projects/${res.data.id}`);
    } catch (err) {
      showError(err.response?.data?.detail || "Failed to create project.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout title="Create Project">
      <div style={styles.container}>
        <BackToDashboard to="/hr/projects/list" role="HR" />

        <div style={styles.card}>
          <div style={styles.header}>
            <h2 style={styles.title}>Create New Project</h2>
            <p style={styles.subtitle}>Define project metadata, start/end timelines & initial priority level</p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.row}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Project Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="e.g. HRMS Project Management"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Project Code (Optional)</label>
                <input
                  type="text"
                  name="project_code"
                  value={formData.project_code}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Auto-generated if left blank (e.g. PRJ001)"
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                style={styles.textarea}
                placeholder="Enter detailed project summary, goals, or scope..."
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
            </div>

            <div style={styles.buttonGroup}>
              <button
                type="button"
                onClick={() => navigate("/hr/projects/list")}
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
                {submitting ? "Creating Project..." : "Create Project"}
              </button>
            </div>
          </form>
        </div>
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
};
