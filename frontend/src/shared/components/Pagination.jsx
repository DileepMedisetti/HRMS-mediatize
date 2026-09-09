import React from "react";

/**
 * Enterprise HRMS Reusable Pagination Component
 *
 * Conforms to HRMS UI standard:
 *   « Previous        Page X of Y        Next »
 *
 * Rules:
 * - Hidden if totalPages <= 1 or totalPages === 0
 * - Previous button disabled on page 1
 * - Next button disabled on last page
 * - Fully responsive with theme variable support
 */
export default function Pagination({
  currentPage,
  page,
  totalPages = 1,
  total,
  totalItems,
  onPrevious,
  onNext,
  onPageChange,
  className = "",
  style = {},
}) {
  // Support both currentPage and page props
  const activePage = Number(currentPage || page || 1);
  const pagesCount = Number(totalPages || 1);
  const itemCount = total !== undefined ? total : totalItems;

  // Hide pagination if 1 or 0 pages
  if (pagesCount <= 1) {
    return null;
  }

  const handlePrev = () => {
    if (activePage > 1) {
      if (onPrevious) {
        onPrevious();
      } else if (onPageChange) {
        onPageChange(activePage - 1);
      }
    }
  };

  const handleNext = () => {
    if (activePage < pagesCount) {
      if (onNext) {
        onNext();
      } else if (onPageChange) {
        onPageChange(activePage + 1);
      }
    }
  };

  const isPrevDisabled = activePage <= 1;
  const isNextDisabled = activePage >= pagesCount;

  return (
    <nav
      aria-label="Pagination Navigation"
      className={`hrms-pagination-container ${className}`}
      style={{ ...styles.container, ...style }}
    >
      <button
        type="button"
        onClick={handlePrev}
        disabled={isPrevDisabled}
        aria-label="Previous Page"
        style={isPrevDisabled ? styles.btnDisabled : styles.btn}
      >
        &laquo; Previous
      </button>

      <span style={styles.pageInfo}>
        Page <strong style={styles.strongText}>{activePage}</strong> of{" "}
        <strong style={styles.strongText}>{pagesCount}</strong>
        {itemCount !== undefined && itemCount > 0 ? (
          <span style={styles.totalBadge}> ({itemCount} total)</span>
        ) : null}
      </span>

      <button
        type="button"
        onClick={handleNext}
        disabled={isNextDisabled}
        aria-label="Next Page"
        style={isNextDisabled ? styles.btnDisabled : styles.btn}
      >
        Next &raquo;
      </button>
    </nav>
  );
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "0.875rem",
    padding: "1rem 0.5rem",
    marginTop: "1.25rem",
    width: "100%",
    boxSizing: "border-box",
  },
  btn: {
    backgroundColor: "var(--primary-color)",
    color: "var(--text-on-primary)",
    border: "1px solid var(--primary-color)",
    padding: "0.45rem 1rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.875rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.15s ease, opacity 0.15s ease",
    whiteSpace: "nowrap",
    userSelect: "none",
  },
  btnDisabled: {
    backgroundColor: "var(--bg-surface-elevated)",
    color: "var(--text-muted)",
    border: "1px solid var(--border-color)",
    padding: "0.45rem 1rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.875rem",
    fontWeight: "500",
    cursor: "not-allowed",
    opacity: 0.7,
    whiteSpace: "nowrap",
    userSelect: "none",
  },
  pageInfo: {
    fontSize: "0.875rem",
    color: "var(--text-secondary)",
    whiteSpace: "nowrap",
    padding: "0.25rem 0.5rem",
    userSelect: "none",
  },
  strongText: {
    color: "var(--text-primary)",
    fontWeight: "700",
  },
  totalBadge: {
    color: "var(--text-muted)",
    fontSize: "0.8125rem",
  },
};
