import React from "react";

export const STATUS_CONFIG = {
  // Leave & General Statuses
  APPROVED: { label: "APPROVED", variant: "success" },
  PENDING: { label: "PENDING", variant: "warning" },
  REJECTED: { label: "REJECTED", variant: "danger" },
  CANCELLED: { label: "CANCELLED", variant: "neutral" },
  REVOKED: { label: "REVOKED", variant: "neutral" },

  // User / Employment Statuses
  ACTIVE: { label: "ACTIVE", variant: "success" },
  INACTIVE: { label: "INACTIVE", variant: "neutral" },

  // Project Statuses
  PLANNED: { label: "PLANNED", variant: "info" },
  IN_PROGRESS: { label: "IN PROGRESS", variant: "warning" },
  COMPLETED: { label: "COMPLETED", variant: "success" },
  ON_HOLD: { label: "ON HOLD", variant: "neutral" },

  // Priority Levels
  CRITICAL: { label: "CRITICAL", variant: "danger" },
  HIGH: { label: "HIGH", variant: "warning" },
  MEDIUM: { label: "MEDIUM", variant: "info" },
  LOW: { label: "LOW", variant: "neutral" },

  // Attendance Statuses
  PRESENT: { label: "PRESENT", variant: "success" },
  ABSENT: { label: "ABSENT", variant: "danger" },
  LATE: { label: "LATE", variant: "warning" },
  ON_LEAVE: { label: "ON LEAVE", variant: "info" },
};

export default function StatusBadge({ status, label, variant, className = "", style = {} }) {
  const normalized = status ? String(status).toUpperCase().replace(/\s+/g, "_") : "";
  const config = STATUS_CONFIG[normalized] || {
    label: label || status || "UNKNOWN",
    variant: variant || "neutral",
  };

  const badgeLabel = label || config.label || status;
  const badgeVariant = variant || config.variant;

  return (
    <span className={`hrms-badge hrms-badge-${badgeVariant} ${className}`} style={style}>
      <span className="hrms-badge-dot" aria-hidden="true" />
      <span>{badgeLabel}</span>
    </span>
  );
}
