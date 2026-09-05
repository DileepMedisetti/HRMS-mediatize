import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  UserRound,
  CalendarDays,
  Pencil,
  X,
  ChevronDown,
  WalletCards,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import { showSuccess, showError } from "../../shared/utils/toast";
import { getEmployeeBalances, updateEmployeeBalance } from "../services/leaveApi";
import { getEmployees } from "../../employee_service/services/employeeApi";

function LeaveBalances() {
  // Current calendar year as default
  const currentYear = new Date().getFullYear();

  // Employee Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Selected Context State
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Balances & Loading State
  const [balances, setBalances] = useState([]);
  const [balancesLoading, setBalancesLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Edit Modal State
  const [editingBalance, setEditingBalance] = useState(null);
  const [allocatedDays, setAllocatedDays] = useState("");
  const [usedDays, setUsedDays] = useState("");
  const [pendingDays, setPendingDays] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const searchRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch employee options for dropdown
  const fetchEmployeeOptions = useCallback(async (query) => {
    setSearchLoading(true);
    try {
      const params = { limit: 12 };
      if (query && query.trim()) {
        params.search = query.trim();
      }
      const res = await getEmployees(params);
      setSearchResults(res.data?.items || []);
    } catch (err) {
      console.error("Failed to search employees:", err);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Initial load of default employee options
  useEffect(() => {
    fetchEmployeeOptions("");
  }, [fetchEmployeeOptions]);

  // Debounced search on typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (dropdownOpen) {
        fetchEmployeeOptions(searchTerm);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, dropdownOpen, fetchEmployeeOptions]);

  // Fetch balances for selected employee & year
  const fetchBalances = useCallback(async (employeeId, year) => {
    if (!employeeId) return;
    setBalancesLoading(true);
    setHasSearched(true);

    try {
      const res = await getEmployeeBalances(employeeId, { year });
      setBalances(res.data || []);
    } catch (err) {
      console.error("Failed to fetch employee balances", err);
      const errText = err.response?.data?.detail || "Failed to load leave balances.";
      showError(errText);
      setBalances([]);
    } finally {
      setBalancesLoading(false);
    }
  }, []);

  // Handle employee selection
  const handleSelectEmployee = (emp) => {
    setSelectedEmployee(emp);
    setSearchTerm(`${emp.first_name} ${emp.last_name} (${emp.employee_code})`);
    setDropdownOpen(false);
    fetchBalances(emp.id, selectedYear);
  };

  // Handle year change
  const handleYearChange = (e) => {
    const newYear = Number(e.target.value);
    setSelectedYear(newYear);
    if (selectedEmployee) {
      fetchBalances(selectedEmployee.id, newYear);
    }
  };

  // Open Edit Modal
  const openEditModal = (b) => {
    setEditingBalance(b);
    setAllocatedDays(String(b.allocated_days));
    setUsedDays(String(b.used_days));
    setPendingDays(String(b.pending_days));
  };

  // Handle Submit Update Balance
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editingBalance || !selectedEmployee) return;

    setSubmitting(true);

    try {
      await updateEmployeeBalance(
        selectedEmployee.id,
        editingBalance.leave_type_id,
        {
          allocated_days: Number(allocatedDays),
          used_days: Number(editingBalance.used_days),
          pending_days: Number(editingBalance.pending_days),
        },
        { year: selectedYear }
      );

      showSuccess("Leave balance updated successfully.");
      setEditingBalance(null);
      fetchBalances(selectedEmployee.id, selectedYear);
    } catch (err) {
      console.error("Failed to update balance", err);
      const errText = err.response?.data?.detail || "Failed to update leave balance.";
      showError(errText);
    } finally {
      setSubmitting(false);
    }
  };

  const yearOptions = [currentYear, currentYear - 1, currentYear - 2];

  // Calculate live remaining balance for edit modal
  const calcAllocated = Number(allocatedDays) || 0;
  const calcUsed = Number(editingBalance?.used_days) || 0;
  const calcPending = Number(editingBalance?.pending_days) || 0;
  const calculatedRemaining = Number((calcAllocated - calcUsed - calcPending).toFixed(2));

  return (
    <AppLayout title="Employee Leave Balances">
      <div style={styles.container}>
        <BackToDashboard to="/hr/leave-types" role="HR" icon={ArrowLeft} />

        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Employee Leave Balances</h1>
            <p style={styles.subtitle}>
              Search employee records to view and adjust annual leave balance allocations
            </p>
          </div>
        </div>

        {/* Top Control Bar: Employee Search & Year Filter */}
        <div style={styles.controlCard}>
          <div style={styles.controlRow}>
            {/* Search Input Control */}
            <div style={styles.searchContainer} ref={searchRef}>
              <label style={styles.controlLabel}>Select Employee</label>
              <div style={styles.inputWrapper}>
                <Search size={18} style={styles.searchIcon} />
                <input
                  type="text"
                  style={styles.searchInput}
                  placeholder="Search by name, employee code, or email..."
                  value={searchTerm}
                  onFocus={() => setDropdownOpen(true)}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setDropdownOpen(true);
                  }}
                  aria-label="Search employee"
                />
                <ChevronDown size={18} style={styles.dropdownChevron} />
              </div>

              {/* Autocomplete Dropdown List */}
              {dropdownOpen && (
                <div style={styles.dropdownMenu}>
                  {searchLoading ? (
                    <div style={styles.dropdownMessage}>Searching employees...</div>
                  ) : searchResults.length === 0 ? (
                    <div style={styles.dropdownMessage}>No matching employees found</div>
                  ) : (
                    searchResults.map((emp) => (
                      <div
                        key={emp.id}
                        style={{
                          ...styles.dropdownItem,
                          backgroundColor:
                            selectedEmployee?.id === emp.id
                              ? "var(--bg-surface-elevated)"
                              : "transparent",
                        }}
                        onClick={() => handleSelectEmployee(emp)}
                      >
                        <div style={styles.itemAvatar}>
                          {emp.profile_photo_url ? (
                            <img
                              src={emp.profile_photo_url}
                              alt={emp.first_name}
                              style={styles.avatarImg}
                            />
                          ) : (
                            <UserRound size={18} style={{ color: "var(--text-secondary)" }} />
                          )}
                        </div>
                        <div style={styles.itemMeta}>
                          <span style={styles.itemName}>
                            {emp.first_name} {emp.last_name}
                          </span>
                          <span style={styles.itemSubText}>
                            {emp.employee_code} &bull; {emp.email}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Year Select Filter */}
            <div style={styles.yearContainer}>
              <label style={styles.controlLabel}>Allocation Year</label>
              <div style={styles.selectWrapper}>
                <CalendarDays size={18} style={styles.selectIcon} />
                <select
                  style={styles.yearSelect}
                  value={selectedYear}
                  onChange={handleYearChange}
                  aria-label="Select year"
                >
                  {yearOptions.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Employee Summary Banner */}
        {selectedEmployee && (
          <div style={styles.summaryCard}>
            <div style={styles.summaryLeft}>
              <div style={styles.summaryAvatar}>
                {selectedEmployee.profile_photo_url ? (
                  <img
                    src={selectedEmployee.profile_photo_url}
                    alt={selectedEmployee.first_name}
                    style={styles.avatarImg}
                  />
                ) : (
                  <span style={styles.summaryInitials}>
                    {selectedEmployee.first_name?.[0]}
                    {selectedEmployee.last_name?.[0]}
                  </span>
                )}
              </div>
              <div>
                <h2 style={styles.summaryName}>
                  {selectedEmployee.first_name} {selectedEmployee.last_name}
                </h2>
                <div style={styles.summaryBadges}>
                  <span style={styles.codeBadge}>{selectedEmployee.employee_code}</span>
                  <span style={styles.emailText}>{selectedEmployee.email}</span>
                </div>
              </div>
            </div>

            <div style={styles.summaryRight}>
              <button
                style={{
                  ...styles.refreshBtn,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.375rem",
                }}
                onClick={() => fetchBalances(selectedEmployee.id, selectedYear)}
                disabled={balancesLoading}
              >
                <RefreshCw size={15} className={balancesLoading ? "spin" : ""} /> Refresh
              </button>
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {balancesLoading ? (
          <div style={styles.skeletonContainer}>
            <div style={styles.skeletonRow} />
            <div style={styles.skeletonRow} />
            <div style={styles.skeletonRow} />
          </div>
        ) : !selectedEmployee ? (
          /* Initial Prompt State */
          <div style={styles.promptState}>
            <Search size={40} style={{ color: "var(--text-muted)", marginBottom: "0.75rem" }} />
            <h3 style={styles.promptTitle}>No Employee Selected</h3>
            <p style={styles.promptSubtitle}>
              Use the search control above to find an employee and display their leave balances.
            </p>
          </div>
        ) : balances.length === 0 && hasSearched ? (
          /* Empty State */
          <div style={styles.emptyState}>
            <WalletCards size={44} style={{ color: "var(--text-muted)", marginBottom: "0.75rem" }} />
            <h3 style={styles.emptyTitle}>No Leave Balances Found</h3>
            <p style={styles.emptySubtitle}>
              No leave balance has been configured for {selectedEmployee.first_name}{" "}
              {selectedEmployee.last_name} for the year {selectedYear}.
            </p>
          </div>
        ) : (
          /* Balances Summary Container */
          <div>
            {/* Desktop Table View (≥768px) */}
            <div className="employee-desktop-table" style={styles.tableWrapper}>
              <div style={styles.tableTitleHeader}>
                <h3 style={styles.tableTitle}>
                  Leave Allocation Summary ({selectedYear})
                </h3>
              </div>
              <div style={{ overflowX: "auto", maxWidth: "100%" }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Leave Type</th>
                      <th style={styles.th}>Year</th>
                      <th style={styles.th}>Allocated Days</th>
                      <th style={styles.th}>Used Days</th>
                      <th style={styles.th}>Pending Requests</th>
                      <th style={styles.th}>Remaining</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {balances.map((b) => {
                      const remaining = b.remaining_days ?? (Number(b.allocated_days) - Number(b.used_days) - Number(b.pending_days));
                      return (
                        <tr key={b.id || b.leave_type_id} style={styles.tr}>
                          <td style={styles.td}>
                            <strong>{b.leave_type_name || "Leave"}</strong>
                          </td>
                          <td style={styles.td}>{b.year}</td>
                          <td style={styles.td}>{b.allocated_days}</td>
                          <td style={styles.td}>{b.used_days}</td>
                          <td style={styles.td}>{b.pending_days}</td>
                          <td style={styles.td}>
                            <span
                              style={{
                                fontWeight: "700",
                                color: remaining > 0 ? "var(--success-color)" : "var(--danger-color)",
                              }}
                            >
                              {remaining}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <button
                              style={{
                                ...styles.editBtn,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.3rem",
                              }}
                              onClick={() => openEditModal(b)}
                            >
                              <Pencil size={13} /> Edit Balance
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards View (<768px) */}
            <div className="employee-mobile-cards">
              <div style={{ padding: "0 0 0.5rem 0" }}>
                <h3 style={{ ...styles.tableTitle, fontSize: "1.1rem" }}>
                  Leave Allocation Summary ({selectedYear})
                </h3>
              </div>
              {balances.map((b) => {
                const remaining = b.remaining_days ?? (Number(b.allocated_days) - Number(b.used_days) - Number(b.pending_days));
                return (
                  <div key={b.id || b.leave_type_id} style={styles.mobileCard}>
                    <div style={styles.mobileCardHeader}>
                      <div>
                        <h4 style={styles.mobileCardTitle}>{b.leave_type_name || "Leave"}</h4>
                        <span style={styles.mobileCardSub}>Year {b.year}</span>
                      </div>
                      <button
                        style={{
                          ...styles.editBtn,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem",
                        }}
                        onClick={() => openEditModal(b)}
                      >
                        <Pencil size={13} /> Edit Balance
                      </button>
                    </div>

                    <div style={styles.mobileCardGrid}>
                      <div style={styles.mobileMetricBox}>
                        <span style={styles.mobileMetricLabel}>Allocated</span>
                        <span style={styles.mobileMetricValue}>{b.allocated_days}</span>
                      </div>
                      <div style={styles.mobileMetricBox}>
                        <span style={styles.mobileMetricLabel}>Used</span>
                        <span style={styles.mobileMetricValue}>{b.used_days}</span>
                      </div>
                      <div style={styles.mobileMetricBox}>
                        <span style={styles.mobileMetricLabel}>Pending Requests</span>
                        <span style={styles.mobileMetricValue}>{b.pending_days}</span>
                      </div>
                      <div style={styles.mobileMetricBox}>
                        <span style={styles.mobileMetricLabel}>Remaining</span>
                        <span
                          style={{
                            ...styles.mobileMetricValue,
                            fontWeight: "700",
                            color: remaining > 0 ? "var(--success-color)" : "var(--danger-color)",
                          }}
                        >
                          {remaining}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Edit Balance Modal */}
        {editingBalance && (
          <div style={styles.modalOverlay} onClick={() => setEditingBalance(null)}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>
                  Update Balance — {editingBalance.leave_type_name} ({selectedYear})
                </h3>
                <button
                  type="button"
                  style={styles.closeBtn}
                  onClick={() => setEditingBalance(null)}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUpdateSubmit} style={styles.formContent}>
                <div style={styles.modalBody}>
                  <p style={styles.modalEmployeeMeta}>
                    Updating leave balance for{" "}
                    <strong>
                      {selectedEmployee?.first_name} {selectedEmployee?.last_name}
                    </strong>{" "}
                    ({selectedEmployee?.employee_code})
                  </p>

                  {/* Allocated Days (Editable) */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Allocated Days *</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      style={styles.modalInput}
                      value={allocatedDays}
                      onChange={(e) => setAllocatedDays(e.target.value)}
                      required
                    />
                  </div>

                  {/* Used Days (Read-Only) */}
                  <div style={styles.formGroup}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <label style={styles.label}>Used Days</label>
                      <span style={styles.readOnlyBadge}>Read-only</span>
                    </div>
                    <input
                      type="text"
                      readOnly
                      style={styles.modalInputReadOnly}
                      value={editingBalance.used_days}
                      tabIndex="-1"
                    />
                  </div>

                  {/* Pending Requests (Read-Only) */}
                  <div style={styles.formGroup}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <label style={styles.label}>Pending Requests</label>
                      <span style={styles.readOnlyBadge}>Read-only</span>
                    </div>
                    <input
                      type="text"
                      readOnly
                      style={styles.modalInputReadOnly}
                      value={editingBalance.pending_days}
                      tabIndex="-1"
                    />
                  </div>

                  {/* Calculated Remaining Card */}
                  <div style={styles.calculatedCard}>
                    <span style={styles.calculatedLabel}>Calculated Remaining</span>
                    <span style={styles.calculatedValue}>
                      {calculatedRemaining} {Math.abs(calculatedRemaining) === 1 ? "day" : "days"}
                    </span>
                  </div>
                </div>

                <div style={styles.modalFooter}>
                  <div className="hrms-modal-footer-actions">
                    <button
                      type="button"
                      style={styles.secondaryBtn}
                      onClick={() => setEditingBalance(null)}
                    >
                      Cancel
                    </button>
                    <button type="submit" style={styles.primaryBtn} disabled={submitting}>
                      {submitting ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

const styles = {
  container: {
    padding: "0 0 2.5rem 0",
  },
  header: {
    marginBottom: "1.5rem",
    paddingBottom: "1rem",
    borderBottom: "1px solid var(--border-color)",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "var(--text-primary)",
    margin: 0,
  },
  subtitle: {
    fontSize: "0.95rem",
    color: "var(--text-secondary)",
    marginTop: "0.25rem",
  },
  controlCard: {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    padding: "1.25rem",
    marginBottom: "1.5rem",
  },
  controlRow: {
    display: "flex",
    gap: "1.25rem",
    flexWrap: "wrap",
    alignItems: "flex-end",
  },
  searchContainer: {
    flex: "1 1 260px",
    position: "relative",
  },
  yearContainer: {
    width: "160px",
  },
  controlLabel: {
    display: "block",
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "var(--text-secondary)",
    marginBottom: "0.375rem",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: "0.875rem",
    color: "var(--text-muted)",
    pointerEvents: "none",
  },
  dropdownChevron: {
    position: "absolute",
    right: "0.875rem",
    color: "var(--text-muted)",
    pointerEvents: "none",
  },
  searchInput: {
    width: "100%",
    backgroundColor: "var(--bg-surface-elevated)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-primary)",
    padding: "0.625rem 2.5rem 0.625rem 2.5rem",
    fontSize: "0.9rem",
    outline: "none",
  },
  selectWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  selectIcon: {
    position: "absolute",
    left: "0.75rem",
    color: "var(--text-muted)",
    pointerEvents: "none",
  },
  yearSelect: {
    width: "100%",
    backgroundColor: "var(--bg-surface-elevated)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-primary)",
    padding: "0.625rem 0.75rem 0.625rem 2.25rem",
    fontSize: "0.9rem",
    outline: "none",
    cursor: "pointer",
  },
  dropdownMenu: {
    position: "absolute",
    top: "calc(100% + 0.25rem)",
    left: 0,
    right: 0,
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
    zIndex: 100,
    maxHeight: "260px",
    overflowY: "auto",
  },
  dropdownMessage: {
    padding: "1rem",
    textAlign: "center",
    color: "var(--text-muted)",
    fontSize: "0.875rem",
  },
  dropdownItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.75rem 1rem",
    cursor: "pointer",
    borderBottom: "1px solid var(--border-color)",
    transition: "background-color 0.15s ease",
  },
  itemAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "var(--bg-surface-elevated)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  itemMeta: {
    display: "flex",
    flexDirection: "column",
  },
  itemName: {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "var(--text-primary)",
  },
  itemSubText: {
    fontSize: "0.75rem",
    color: "var(--text-secondary)",
  },
  summaryCard: {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    padding: "1.25rem 1.5rem",
    marginBottom: "1.5rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1rem",
  },
  summaryLeft: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  summaryAvatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    backgroundColor: "var(--primary-color)",
    color: "var(--text-on-primary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "1.1rem",
    overflow: "hidden",
  },
  summaryInitials: {
    textTransform: "uppercase",
  },
  summaryName: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "var(--text-primary)",
    margin: 0,
  },
  summaryBadges: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginTop: "0.25rem",
  },
  codeBadge: {
    backgroundColor: "var(--bg-surface-elevated)",
    color: "var(--primary-color)",
    border: "1px solid var(--primary-border)",
    padding: "0.15rem 0.5rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.75rem",
    fontWeight: "700",
  },
  emailText: {
    fontSize: "0.85rem",
    color: "var(--text-secondary)",
  },
  summaryRight: {
    display: "flex",
    alignItems: "center",
  },
  refreshBtn: {
    backgroundColor: "var(--bg-surface-elevated)",
    color: "var(--text-primary)",
    border: "1px solid var(--border-color)",
    padding: "0.5rem 1rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.85rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  promptState: {
    backgroundColor: "var(--bg-surface)",
    border: "1px dashed var(--border-color)",
    borderRadius: "var(--radius-lg)",
    padding: "3.5rem 1.5rem",
    textAlign: "center",
  },
  promptTitle: {
    fontSize: "1.125rem",
    fontWeight: "600",
    color: "var(--text-primary)",
    margin: "0 0 0.375rem 0",
  },
  promptSubtitle: {
    fontSize: "0.875rem",
    color: "var(--text-secondary)",
    margin: 0,
  },
  emptyState: {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    padding: "3.5rem 1.5rem",
    textAlign: "center",
  },
  emptyTitle: {
    fontSize: "1.125rem",
    fontWeight: "600",
    color: "var(--text-primary)",
    margin: "0 0 0.375rem 0",
  },
  emptySubtitle: {
    fontSize: "0.875rem",
    color: "var(--text-secondary)",
    margin: 0,
  },
  tableWrapper: {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    overflowX: "auto",
    maxWidth: "100%",
  },
  tableTitleHeader: {
    padding: "1rem 1.25rem",
    borderBottom: "1px solid var(--border-color)",
    backgroundColor: "var(--bg-surface-elevated)",
  },
  tableTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "var(--text-primary)",
    margin: 0,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
    fontSize: "0.9rem",
  },
  th: {
    backgroundColor: "var(--bg-surface-elevated)",
    color: "var(--text-muted)",
    padding: "0.875rem 1rem",
    fontWeight: "600",
    fontSize: "0.8rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "1px solid var(--border-color)",
  },
  tr: {
    borderBottom: "1px solid var(--border-color)",
  },
  td: {
    padding: "0.875rem 1rem",
    color: "var(--text-primary)",
  },
  editBtn: {
    backgroundColor: "transparent",
    color: "var(--primary-color)",
    border: "1px solid var(--border-color)",
    padding: "0.35rem 0.75rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.8rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  mobileCard: {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    padding: "1rem 1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.875rem",
  },
  mobileCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid var(--border-color)",
    paddingBottom: "0.75rem",
  },
  mobileCardTitle: {
    fontSize: "1rem",
    fontWeight: "700",
    color: "var(--text-primary)",
    margin: 0,
  },
  mobileCardSub: {
    fontSize: "0.75rem",
    color: "var(--text-muted)",
    fontWeight: "600",
  },
  mobileCardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "0.75rem",
  },
  mobileMetricBox: {
    backgroundColor: "var(--bg-surface-elevated)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    padding: "0.625rem 0.75rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.15rem",
  },
  mobileMetricLabel: {
    fontSize: "0.7rem",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    color: "var(--text-muted)",
  },
  mobileMetricValue: {
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "var(--text-primary)",
  },
  skeletonContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  skeletonRow: {
    height: "54px",
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    animation: "pulse 1.5s infinite ease-in-out",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1100,
    padding: "1rem",
  },
  modal: {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-xl)",
    width: "min(92vw, 480px)",
    maxHeight: "calc(100vh - 32px)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "var(--shadow-overlay)",
  },
  modalHeader: {
    padding: "1.25rem 1.5rem",
    borderBottom: "1px solid var(--border-color)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "var(--bg-surface-elevated)",
    flexShrink: 0,
  },
  modalTitle: {
    fontSize: "1.05rem",
    fontWeight: "700",
    color: "var(--text-primary)",
    margin: 0,
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "var(--text-secondary)",
    cursor: "pointer",
    padding: "0.375rem",
    borderRadius: "var(--radius-md)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s ease",
  },
  formContent: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minHeight: 0,
    overflow: "hidden",
  },
  modalBody: {
    padding: "1.5rem",
    overflowY: "auto",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "1.125rem",
  },
  modalEmployeeMeta: {
    fontSize: "0.875rem",
    color: "var(--text-secondary)",
    margin: 0,
    lineHeight: "1.4",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.375rem",
  },
  label: {
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "var(--text-secondary)",
    display: "block",
  },
  readOnlyBadge: {
    fontSize: "0.7rem",
    fontWeight: "600",
    color: "var(--text-muted)",
    backgroundColor: "var(--bg-surface-elevated)",
    padding: "0.1rem 0.4rem",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border-color)",
  },
  modalInput: {
    width: "100%",
    height: "42px",
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-primary)",
    padding: "0.625rem 0.875rem",
    fontSize: "0.9rem",
    outline: "none",
    boxSizing: "border-box",
  },
  modalInputReadOnly: {
    width: "100%",
    height: "42px",
    backgroundColor: "var(--bg-surface-elevated)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-muted)",
    padding: "0.625rem 0.875rem",
    fontSize: "0.9rem",
    outline: "none",
    cursor: "not-allowed",
    boxSizing: "border-box",
    fontWeight: "600",
  },
  calculatedCard: {
    backgroundColor: "var(--bg-surface-elevated)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    padding: "1rem 1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    marginTop: "0.25rem",
  },
  calculatedLabel: {
    fontSize: "0.75rem",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "var(--text-muted)",
  },
  calculatedValue: {
    fontSize: "1.35rem",
    fontWeight: "800",
    color: "var(--primary-color)",
  },
  modalFooter: {
    padding: "1rem 1.5rem",
    borderTop: "1px solid var(--border-color)",
    backgroundColor: "var(--bg-surface-elevated)",
    flexShrink: 0,
  },
  secondaryBtn: {
    backgroundColor: "var(--bg-surface)",
    color: "var(--text-primary)",
    border: "1px solid var(--border-color)",
    padding: "0.625rem 1.25rem",
    borderRadius: "var(--radius-md)",
    fontWeight: "600",
    fontSize: "0.875rem",
    cursor: "pointer",
  },
  primaryBtn: {
    backgroundColor: "var(--primary-color)",
    color: "var(--text-on-primary)",
    border: "none",
    padding: "0.625rem 1.25rem",
    borderRadius: "var(--radius-md)",
    fontWeight: "600",
    fontSize: "0.875rem",
    cursor: "pointer",
  },
};

export default LeaveBalances;
