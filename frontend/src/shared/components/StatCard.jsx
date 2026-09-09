import React from "react";

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "primary", // primary, success, warning, danger, info, neutral
  action,
  className = "",
  style = {},
}) {
  return (
    <div className={`hrms-kpi-card hrms-kpi-${variant} ${className}`} style={style}>
      <div className="hrms-kpi-top">
        <div className="hrms-kpi-info">
          <span className="hrms-kpi-title">{title}</span>
          <span className="hrms-kpi-value">{value}</span>
        </div>
        {Icon && (
          <div className="hrms-kpi-icon-box">
            <Icon size={24} strokeWidth={2} />
          </div>
        )}
      </div>
      {subtitle && <p className="hrms-kpi-subtitle">{subtitle}</p>}
      {action && <div className="hrms-kpi-action">{action}</div>}
    </div>
  );
}
