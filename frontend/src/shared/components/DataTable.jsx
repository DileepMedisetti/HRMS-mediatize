import React from "react";

export default function DataTable({
  headers = [],
  children,
  emptyState,
  loading = false,
  className = "",
  style = {},
}) {
  return (
    <div className={`hrms-table-container ${className}`} style={style}>
      <table className="hrms-table">
        {headers.length > 0 && (
          <thead>
            <tr>
              {headers.map((h, idx) => (
                <th key={idx} style={h.style || {}} className={h.className || ""}>
                  {h.label || h}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={headers.length || 1} className="hrms-table-loading">
                <div className="hrms-skeleton" style={{ height: "40px", width: "100%", margin: "8px 0" }} />
                <div className="hrms-skeleton" style={{ height: "40px", width: "100%", margin: "8px 0" }} />
                <div className="hrms-skeleton" style={{ height: "40px", width: "100%", margin: "8px 0" }} />
              </td>
            </tr>
          ) : React.Children.count(children) === 0 && emptyState ? (
            <tr>
              <td colSpan={headers.length || 1} className="hrms-table-empty">
                {emptyState}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}
