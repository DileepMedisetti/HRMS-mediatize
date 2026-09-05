import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getEmployeeById, updateEmployee } from "../services/employeeApi";
import BackToDashboard from "../../shared/components/BackToDashboard";
import AppLayout from "../../shared/components/AppLayout";
import { showSuccess, showError } from "../../shared/utils/toast";

export default function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    address: "",
    joining_date: "",
    employment_status: "ACTIVE",
  });
  const [employeeCode, setEmployeeCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await getEmployeeById(id);
        const emp = res.data;
        setEmployeeCode(emp.employee_code);
        setFormData({
          first_name: emp.first_name || "",
          last_name: emp.last_name || "",
          email: emp.email || "",
          phone: emp.phone || "",
          date_of_birth: emp.date_of_birth || "",
          address: emp.address || "",
          joining_date: emp.joining_date || "",
          employment_status: emp.employment_status || "ACTIVE",
        });
      } catch (err) {
        showError(err.response?.data?.detail || "Failed to load employee.");
        navigate("/hr/employees");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateEmployee(id, formData);
      showSuccess(`Employee ${employeeCode} updated successfully!`);
      navigate(`/hr/employees/${id}`);
    } catch (err) {
      showError(err.response?.data?.detail || "Failed to update employee.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading employee details...</div>;
  }

  return (
    <AppLayout title="Edit Employee">
      <div style={styles.container}>
        <BackToDashboard to="/hr/dashboard" />
        <div style={styles.card}>
          <div style={styles.header}>
            <div>
              <h2 style={styles.title}>Edit Employee Record</h2>
              <p style={styles.subtitle}>Update profile for Employee Code: <span style={styles.code}>{employeeCode}</span></p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.row}>
              <div style={styles.formGroup}>
                <label style={styles.label}>First Name</label>
                <input
                  type="text"
                  name="first_name"
                  required
                  value={formData.first_name}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Date of Birth</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Joining Date</label>
                <input
                  type="date"
                  name="joining_date"
                  value={formData.joining_date}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Employment Status</label>
              <select
                name="employment_status"
                value={formData.employment_status}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="ON_NOTICE">ON NOTICE</option>
                <option value="TERMINATED">TERMINATED</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Address</label>
              <textarea
                name="address"
                rows="3"
                value={formData.address}
                onChange={handleChange}
                style={styles.textarea}
              />
            </div>

            <div style={styles.buttonGroup}>
              <button
                type="button"
                onClick={() => navigate("/hr/employees")}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={submitting ? styles.submitBtnDisabled : styles.submitBtn}
              >
                {submitting ? "Saving Changes..." : "Save Changes"}
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
  },
  card: {
    backgroundColor: "var(--bg-surface)",
    borderRadius: "var(--radius-lg)",
    padding: "2rem",
    border: "1px solid var(--border-color)",
    color: "var(--text-primary)",
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
  code: {
    color: "var(--primary-color)",
    fontFamily: "var(--font-mono)",
    fontWeight: "600",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))",
    gap: "1rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.375rem",
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: "500",
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
  select: {
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
  buttonGroup: {
    display: "flex",
    justifyContent: "flex-end",
    flexWrap: "wrap",
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
  loading: {
    textAlign: "center",
    padding: "3rem",
    color: "var(--text-muted)",
  },
};
