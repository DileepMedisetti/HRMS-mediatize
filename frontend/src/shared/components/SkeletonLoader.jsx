import React from "react";

export default function SkeletonLoader({
  height = "24px",
  width = "100%",
  borderRadius = "var(--radius-md)",
  className = "",
  style = {},
}) {
  return (
    <div
      className={`hrms-skeleton ${className}`}
      style={{
        height,
        width,
        borderRadius,
        ...style,
      }}
    />
  );
}

export function SkeletonCard({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="hrms-card hrms-skeleton-card">
          <SkeletonLoader height="20px" width="40%" style={{ marginBottom: "12px" }} />
          <SkeletonLoader height="36px" width="60%" style={{ marginBottom: "12px" }} />
          <SkeletonLoader height="16px" width="80%" />
        </div>
      ))}
    </>
  );
}
