import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function BackToDashboard({ to, role = "HR" }) {
  const targetPath = to || (role === "EMPLOYEE" ? "/employee/dashboard" : "/hr/dashboard");

  return (
    <div style={styles.container}>
      <Link to={targetPath} style={styles.link}>
        <ArrowLeft size={16} strokeWidth={2} />
        <span>Back to Dashboard</span>
      </Link>
    </div>
  );
}

const styles = {
  container: {
    marginBottom: "1rem",
  },
  link: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.375rem",
    backgroundColor: "var(--bg-surface)",
    color: "var(--primary-color)",
    border: "1px solid var(--border-color)",
    padding: "0.5rem 0.875rem",
    borderRadius: "var(--radius-md)",
    textDecoration: "none",
    fontSize: "0.875rem",
    fontWeight: "600",
    transition: "all var(--transition-fast)",
  },
};
