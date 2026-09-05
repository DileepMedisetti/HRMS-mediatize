import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getEmployeeById } from "../services/employeeApi";
import BackToDashboard from "../../shared/components/BackToDashboard";
import AppLayout from "../../shared/components/AppLayout";
import { showError } from "../../shared/utils/toast";

export default function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await getEmployeeById(id);
        setEmployee(res.data);
      } catch (err) {
        showError(err.response?.data?.detail || "Failed to load employee details.");
        navigate("/hr/employees");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  if (loading) {
    return <div style={styles.loading}>Loading employee details...</div>;
  }

  if (!employee) return null;

  return (
    <AppLayout title="Employee Profile">
      <div style={styles.container}>
        <BackToDashboard to="/hr/dashboard" />
        <div style={styles.card}>
          {/* Top Header */}
          <div style={styles.header}>
            <div style={styles.profileMeta}>
              {employee.profile_photo_url ? (
                <img
                  src={employee.profile_photo_url}
                  alt={`${employee.first_name}`}
                  style={styles.avatarImg}
                />
              ) : (
                <div style={styles.avatarPlaceholder}>
                  {employee.first_name?.[0]}
                  {employee.last_name?.[0]}
                </div>
              )}
              <div>
                <h2 style={styles.name}>{employee.first_name} {employee.last_name}</h2>
                <div style={styles.subMeta}>
                  <span style={styles.codeBadge}>{employee.employee_code}</span>
                  <span style={styles.statusBadge}>{employee.employment_status}</span>
                </div>
              </div>
            </div>

            <div style={styles.actions}>
              <button onClick={() => navigate("/hr/employees")} style={styles.backBtn}>
                &larr; Back to Directory
              </button>
              <button onClick={() => navigate(`/hr/employees/${id}/edit`)} style={styles.editBtn}>
                Edit Employee
              </button>
            </div>
          </div>

          {/* Details Grid */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Employee Information</h3>
            <div style={styles.grid}>
              <div style={styles.fieldItem}>
                <span style={styles.fieldLabel}>Email Address</span>
                <span style={styles.fieldValue}>{employee.email}</span>
              </div>
              <div style={styles.fieldItem}>
                <span style={styles.fieldLabel}>Phone Number</span>
                <span style={styles.fieldValue}>{employee.phone || "Not Provided"}</span>
              </div>
              <div style={styles.fieldItem}>
                <span style={styles.fieldLabel}>Date of Birth</span>
                <span style={styles.fieldValue}>{employee.date_of_birth || "Not Provided"}</span>
              </div>
              <div style={styles.fieldItem}>
                <span style={styles.fieldLabel}>Joining Date</span>
                <span style={styles.fieldValue}>{employee.joining_date || "Not Provided"}</span>
              </div>
              <div style={styles.fieldItem}>
                <span style={styles.fieldLabel}>Account Status</span>
                <span style={styles.fieldValue}>
                  {employee.user_is_active ? (
                    <span style={{ color: "#4ade80", fontWeight: "600" }}>Active System User</span>
                  ) : (
                    <span style={{ color: "#f87171", fontWeight: "600" }}>Deactivated / Disabled</span>
                  )}
                </span>
              </div>
              <div style={styles.fieldItem}>
                <span style={styles.fieldLabel}>Address</span>
                <span style={styles.fieldValue}>{employee.address || "Not Provided"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

const styles = {
  container: {
    padding: "0 0 2rem 0",
    maxWidth: "900px",
  },
  card: {
    backgroundColor: "var(--bg-surface)",
    borderRadius: "var(--radius-lg)",
    padding: "2rem",
    border: "1px solid var(--border-color)",
    color: "var(--text-primary)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    borderBottom: "1px solid var(--border-color)",
    paddingBottom: "1.5rem",
    flexWrap: "wrap",
    gap: "1rem",
  },
  profileMeta: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1.25rem",
  },
  avatarImg: {
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid var(--primary-color)",
  },
  avatarPlaceholder: {
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    backgroundColor: "var(--primary-color)",
    color: "var(--text-on-primary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
    fontWeight: "700",
  },
  name: {
    fontSize: "1.75rem",
    fontWeight: "700",
    color: "var(--text-primary)",
    margin: 0,
  },
  subMeta: {
    display: "flex",
    gap: "0.5rem",
    marginTop: "0.375rem",
  },
  codeBadge: {
    backgroundColor: "var(--bg-surface-elevated)",
    color: "var(--primary-color)",
    padding: "0.2rem 0.5rem",
    borderRadius: "var(--radius-sm)",
    fontFamily: "var(--font-mono)",
    fontSize: "0.875rem",
  },
  statusBadge: {
    backgroundColor: "var(--bg-surface-elevated)",
    color: "var(--text-secondary)",
    border: "1px solid var(--border-color)",
    padding: "0.2rem 0.5rem",
    borderRadius: "var(--radius-sm)",
    fontSize: "0.75rem",
    fontWeight: "600",
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.75rem",
  },
  backBtn: {
    backgroundColor: "var(--bg-surface-elevated)",
    color: "var(--text-primary)",
    border: "1px solid var(--border-color)",
    padding: "0.5rem 1rem",
    borderRadius: "var(--radius-md)",
    cursor: "pointer",
  },
  editBtn: {
    backgroundColor: "var(--primary-color)",
    color: "var(--text-on-primary)",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "var(--radius-md)",
    cursor: "pointer",
    fontWeight: "600",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  sectionTitle: {
    fontSize: "1.125rem",
    fontWeight: "600",
    color: "var(--text-secondary)",
    margin: 0,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
    gap: "1.5rem",
    backgroundColor: "var(--bg-surface-elevated)",
    padding: "1.5rem",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-color)",
  },
  fieldItem: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  fieldLabel: {
    fontSize: "0.75rem",
    textTransform: "uppercase",
    color: "var(--text-muted)",
    letterSpacing: "0.05em",
    fontWeight: "600",
  },
  fieldValue: {
    fontSize: "1rem",
    color: "var(--text-primary)",
    fontWeight: "500",
  },
  loading: {
    textAlign: "center",
    padding: "3rem",
    color: "var(--text-muted)",
  },
};
