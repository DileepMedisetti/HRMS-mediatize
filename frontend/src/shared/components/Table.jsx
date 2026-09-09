import React from "react";
import Button from "./Button";

export function Table({ columns = [], data = [], keyField = "id", loading = false, emptyText = "No records found" }) {
  if (loading) {
    return (
      <div className="hrms-table-container" style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
        Loading table data...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="hrms-table-container" style={{ padding: "2.5rem", textAlign: "center", color: "var(--text-muted)" }}>
        {emptyText}
      </div>
    );
  }

  return (
    <div className="hrms-table-container">
      <table className="hrms-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={col.key || idx} style={col.headerStyle}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row[keyField]}>
              {columns.map((col, idx) => (
                <td key={col.key || idx} style={col.cellStyle}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import StandardPagination from "./Pagination";
export const Pagination = StandardPagination;

