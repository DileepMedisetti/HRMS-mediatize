import React from "react";
import { FolderOpen } from "lucide-react";

export default function EmptyState({
  icon: Icon = FolderOpen,
  title = "No Data Available",
  message = "There are no records to display at this time.",
  action,
  className = "",
  style = {},
}) {
  return (
    <div className={`hrms-empty-state ${className}`} style={style}>
      <div className="hrms-empty-icon-box">
        <Icon size={32} strokeWidth={1.75} />
      </div>
      <h4 className="hrms-empty-title">{title}</h4>
      <p className="hrms-empty-message">{message}</p>
      {action && <div className="hrms-empty-action">{action}</div>}
    </div>
  );
}
