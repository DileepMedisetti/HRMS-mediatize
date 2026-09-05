import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  UserPlus,
  Edit,
  UserX,
  UserRound,
  CheckCircle2,
  AlertCircle,
  Sliders,
} from "lucide-react";
import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import { ConfirmDialog } from "../../shared/components/Modal";
import {
  getProjectById,
  getProjectTeam,
  updateProjectStatus,
  updateProjectProgress,
  removeEmployee,
} from "../services/projectApi";
import { ProjectStatusBadge, ProjectPriorityBadge, ProjectProgress } from "../components/ProjectBadges";
import AssignEmployeeModal from "../components/AssignEmployeeModal";
import { showSuccess, showError } from "../../shared/utils/toast";

export default function HRProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [removing, setRemoving] = useState(false);

  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [editingProgress, setEditingProgress] = useState(false);
  const [progressVal, setProgressVal] = useState(0);

  const loadProjectData = async () => {
    setLoading(true);
    try {
      const [pRes, tRes] = await Promise.all([getProjectById(id), getProjectTeam(id)]);
      setProject(pRes.data);
      setProgressVal(pRes.data.progress_percentage || 0);
      setTeam(tRes.data || []);
    } catch (err) {
      showError(err.response?.data?.detail || "Failed to load project details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await updateProjectStatus(id, newStatus);
      setProject(res.data);
      showSuccess(`Project status updated to ${newStatus}`);
    } catch (err) {
      showError(err.response?.data?.detail || "Failed to update status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleProgressSave = async () => {
    try {
      const res = await updateProjectProgress(id, progressVal);
      setProject(res.data);
      setEditingProgress(false);
      showSuccess("Project progress updated successfully!");
    } catch (err) {
      showError(err.response?.data?.detail || "Failed to update progress.");
    }
  };

  const confirmRemoveEmployee = async () => {
    if (!removeTarget) return;
    setRemoving(true);
    try {
      await removeEmployee(id, removeTarget.assignment_id);
      showSuccess(`Removed ${removeTarget.employee_name} from project.`);
      setRemoveTarget(null);
      loadProjectData();
    } catch (err) {
      showError(err.response?.data?.detail || "Failed to remove employee.");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <AppLayout title="Project Details">
      <div style={styles.container}>
        <BackToDashboard to="/hr/projects/list" role="HR" />

        {loading || !project ? (
          <div style={styles.loadingState}>Loading project information...</div>
        ) : (
          <>
            {/* Header / Banner */}
            <div style={styles.headerCard}>
              <div style={styles.headerTop}>
                <div>
                  <div style={styles.codeRow}>
                    <code style={styles.codeBadge}>{project.project_code}</code>
                    <ProjectStatusBadge status={project.status} />
                    <ProjectPriorityBadge priority={project.priority} />
                    {project.is_overdue && <span style={styles.overduePill}>OVERDUE</span>}
                  </div>
                  <h1 style={styles.title}>{project.name}</h1>
                </div>

                <div style={styles.headerButtons}>
                  <button
                    onClick={() => navigate(`/hr/projects/${id}/edit`)}
                    style={styles.editBtn}
                  >
                    <Edit size={16} /> Edit Project
                  </button>
                  <button
                    onClick={() => setAssignModalOpen(true)}
                    style={styles.assignBtn}
                  >
                    <UserPlus size={16} /> Assign Employee
                  </button>
                </div>
              </div>

              {/* Description */}
              {project.description && (
                <p style={styles.description}>{project.description}</p>
              )}

              {/* Metadata Grid */}
              <div style={styles.metaGrid}>
                <div style={styles.metaBox}>
                  <Calendar size={18} style={{ color: "var(--primary-color)" }} />
                  <div>
                    <span style={styles.metaLabel}>Start Date</span>
                    <span style={styles.metaVal}>{project.start_date}</span>
                  </div>
                </div>

                <div style={styles.metaBox}>
                  <Clock size={18} style={{ color: "var(--primary-color)" }} />
                  <div>
                    <span style={styles.metaLabel}>End Date</span>
                    <span style={styles.metaVal}>{project.end_date || "Ongoing"}</span>
                  </div>
                </div>

                <div style={styles.metaBoxFull}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <span style={styles.metaLabel}>Overall Progress</span>
                    <button
                      onClick={() => setEditingProgress(!editingProgress)}
                      style={styles.inlineEditBtn}
                    >
                      {editingProgress ? "Cancel" : "Adjust Progress"}
                    </button>
                  </div>

                  {editingProgress ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={progressVal}
                        onChange={(e) => setProgressVal(parseInt(e.target.value, 10))}
                        style={{ flex: 1, accentColor: "var(--primary-color)" }}
                      />
                      <button onClick={handleProgressSave} style={styles.saveProgressBtn}>
                        Save ({progressVal}%)
                      </button>
                    </div>
                  ) : (
                    <ProjectProgress percentage={project.progress_percentage} />
                  )}
                </div>
              </div>

              {/* Status Change Control Bar */}
              <div style={styles.statusChangeBar}>
                <span style={styles.statusChangeLabel}>Change Status:</span>
                <div style={styles.statusButtonsGroup}>
                  {["PLANNED", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"].map((st) => (
                    <button
                      key={st}
                      disabled={project.status === st || updatingStatus}
                      onClick={() => handleStatusChange(st)}
                      style={{
                        ...styles.statusToggleBtn,
                        backgroundColor:
                          project.status === st
                            ? "var(--primary-color)"
                            : "var(--bg-surface-elevated)",
                        color:
                          project.status === st
                            ? "var(--text-on-primary)"
                            : "var(--text-primary)",
                      }}
                    >
                      {st.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Team Roster Section */}
            <div style={styles.teamSection}>
              <div style={styles.teamHeader}>
                <div>
                  <h2 style={styles.sectionTitle}>Project Team ({team.filter((t) => t.assignment_status === "ACTIVE").length} active members)</h2>
                  <p style={styles.subtitle}>Assigned team members and project roles</p>
                </div>
                <button
                  onClick={() => setAssignModalOpen(true)}
                  style={styles.assignBtnSm}
                >
                  <UserPlus size={15} /> Add Team Member
                </button>
              </div>

              {team.length === 0 ? (
                <div style={styles.emptyState}>No employees assigned to this project yet.</div>
              ) : (
                <>
                  {/* DESKTOP TABLE VIEW */}
                  <div className="employee-desktop-table" style={styles.tableWrapper}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Employee</th>
                          <th style={styles.th}>Project Role</th>
                          <th style={styles.th}>Assigned Date</th>
                          <th style={styles.th}>Status</th>
                          <th style={styles.th}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {team.map((member) => (
                          <tr key={member.assignment_id} style={styles.tr}>
                            <td style={styles.td}>
                              <div style={styles.empCell}>
                                {member.profile_photo_url ? (
                                  <img
                                    src={member.profile_photo_url}
                                    alt={member.employee_name}
                                    style={styles.avatarImg}
                                  />
                                ) : (
                                  <div style={styles.avatarPlaceholder}>
                                    {member.employee_name?.[0]}
                                  </div>
                                )}
                                <div>
                                  <div style={styles.empName}>{member.employee_name}</div>
                                  <code style={styles.codeBadgeSm}>{member.employee_code}</code>
                                </div>
                              </div>
                            </td>
                            <td style={styles.td}>
                              <span style={styles.projectRoleBadge}>
                                {member.project_role_name}
                              </span>
                            </td>
                            <td style={styles.td}>{member.assigned_date}</td>
                            <td style={styles.td}>
                              {member.assignment_status === "ACTIVE" ? (
                                <span style={styles.activeTag}>ACTIVE</span>
                              ) : (
                                <span style={styles.removedTag}>
                                  REMOVED ({member.removed_date})
                                </span>
                              )}
                            </td>
                            <td style={styles.td}>
                              {member.assignment_status === "ACTIVE" && (
                                <button
                                  onClick={() => setRemoveTarget(member)}
                                  style={styles.removeBtn}
                                  title="Remove from project"
                                >
                                  Remove
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* MOBILE CARDS VIEW */}
                  <div className="employee-mobile-cards">
                    {team.map((member) => (
                      <div key={member.assignment_id} style={styles.teamCardMobile}>
                        <div style={styles.teamCardMobileHeader}>
                          <div style={styles.empCell}>
                            {member.profile_photo_url ? (
                              <img src={member.profile_photo_url} alt={member.employee_name} style={styles.avatarImg} />
                            ) : (
                              <div style={styles.avatarPlaceholder}>{member.employee_name?.[0]}</div>
                            )}
                            <div>
                              <div style={styles.empName}>{member.employee_name}</div>
                              <code style={styles.codeBadgeSm}>{member.employee_code}</code>
                            </div>
                          </div>
                          <div>
                            {member.assignment_status === "ACTIVE" ? (
                              <span style={styles.activeTag}>ACTIVE</span>
                            ) : (
                              <span style={styles.removedTag}>REMOVED</span>
                            )}
                          </div>
                        </div>

                        <div style={styles.teamCardMobileBody}>
                          <div style={styles.fieldBlock}>
                            <span style={styles.fieldLabel}>Project Role</span>
                            <span style={styles.projectRoleBadge}>{member.project_role_name}</span>
                          </div>
                          <div style={styles.fieldBlock}>
                            <span style={styles.fieldLabel}>Assigned Date</span>
                            <span style={styles.fieldVal}>{member.assigned_date}</span>
                          </div>
                        </div>

                        {member.assignment_status === "ACTIVE" && (
                          <button
                            onClick={() => setRemoveTarget(member)}
                            style={styles.removeBtnMobile}
                          >
                            <UserX size={14} /> Remove Employee from Project
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Modal & Confirm Dialog */}
            <AssignEmployeeModal
              isOpen={assignModalOpen}
              onClose={() => setAssignModalOpen(false)}
              projectId={id}
              onAssignmentSuccess={loadProjectData}
            />

            <ConfirmDialog
              isOpen={Boolean(removeTarget)}
              onClose={() => setRemoveTarget(null)}
              onConfirm={confirmRemoveEmployee}
              title="Remove Employee from Project"
              message={`Are you sure you want to remove ${removeTarget?.employee_name} from project '${project.name}'?`}
              confirmText="Remove Employee"
              confirmVariant="danger"
              loading={removing}
            />
          </>
        )}
      </div>
    </AppLayout>
  );
}

const styles = {
  container: {
    padding: "0 0 2rem 0",
    maxWidth: "100%",
    minWidth: 0,
    boxSizing: "border-box",
  },
  headerCard: {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    padding: "1.75rem",
    marginBottom: "2rem",
    boxShadow: "var(--shadow-sm)",
  },
  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "1rem",
    marginBottom: "1rem",
  },
  codeRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "0.5rem",
    flexWrap: "wrap",
  },
  codeBadge: {
    backgroundColor: "var(--bg-surface-elevated)",
    padding: "0.25rem 0.625rem",
    borderRadius: "var(--radius-sm)",
    color: "var(--primary-color)",
    fontFamily: "var(--font-mono)",
    fontWeight: "700",
    fontSize: "0.8125rem",
  },
  title: {
    fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
    fontWeight: "800",
    color: "var(--text-primary)",
    margin: 0,
    lineHeight: "1.2",
  },
  headerButtons: {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  editBtn: {
    backgroundColor: "var(--bg-surface-elevated)",
    color: "var(--text-primary)",
    border: "1px solid var(--border-color)",
    padding: "0.625rem 1.25rem",
    borderRadius: "var(--radius-md)",
    fontWeight: "600",
    fontSize: "0.875rem",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  assignBtn: {
    backgroundColor: "var(--primary-color)",
    color: "var(--text-on-primary)",
    border: "none",
    padding: "0.625rem 1.25rem",
    borderRadius: "var(--radius-md)",
    fontWeight: "600",
    fontSize: "0.875rem",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  description: {
    fontSize: "0.9375rem",
    color: "var(--text-secondary)",
    lineHeight: "1.6",
    marginBottom: "1.5rem",
    borderTop: "1px solid var(--border-color)",
    paddingTop: "1rem",
  },
  metaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  metaBox: {
    backgroundColor: "var(--bg-surface-elevated)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    padding: "0.875rem 1rem",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  metaBoxFull: {
    gridColumn: "1 / -1",
    backgroundColor: "var(--bg-surface-elevated)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    padding: "1rem",
  },
  metaLabel: {
    fontSize: "0.75rem",
    fontWeight: "700",
    textTransform: "uppercase",
    color: "var(--text-muted)",
    display: "block",
  },
  metaVal: {
    fontSize: "0.9375rem",
    fontWeight: "700",
    color: "var(--text-primary)",
  },
  inlineEditBtn: {
    backgroundColor: "transparent",
    border: "none",
    color: "var(--primary-color)",
    fontSize: "0.75rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  saveProgressBtn: {
    backgroundColor: "var(--primary-color)",
    color: "var(--text-on-primary)",
    border: "none",
    padding: "0.35rem 0.75rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.75rem",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  statusChangeBar: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    borderTop: "1px solid var(--border-color)",
    paddingTop: "1.25rem",
    flexWrap: "wrap",
  },
  statusChangeLabel: {
    fontSize: "0.875rem",
    fontWeight: "700",
    color: "var(--text-secondary)",
  },
  statusButtonsGroup: {
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap",
  },
  statusToggleBtn: {
    border: "1px solid var(--border-color)",
    padding: "0.4rem 0.875rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.75rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all var(--transition-fast)",
  },
  teamSection: {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    padding: "1.5rem",
    boxShadow: "var(--shadow-sm)",
  },
  teamHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.25rem",
    flexWrap: "wrap",
    gap: "1rem",
  },
  sectionTitle: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "var(--text-primary)",
    margin: 0,
  },
  subtitle: {
    fontSize: "0.85rem",
    color: "var(--text-secondary)",
    marginTop: "0.2rem",
  },
  assignBtnSm: {
    backgroundColor: "var(--primary-color)",
    color: "var(--text-on-primary)",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.8125rem",
    fontWeight: "600",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
  },
  tableWrapper: {
    backgroundColor: "var(--bg-surface)",
    borderRadius: "var(--radius-lg)",
    overflowX: "auto",
    width: "100%",
    maxWidth: "100%",
    border: "1px solid var(--border-color)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  th: {
    backgroundColor: "var(--bg-surface-elevated)",
    color: "var(--text-muted)",
    padding: "0.875rem 1rem",
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    whiteSpace: "nowrap",
  },
  tr: {
    borderBottom: "1px solid var(--border-color)",
  },
  td: {
    padding: "0.875rem 1rem",
    fontSize: "0.875rem",
    color: "var(--text-primary)",
  },
  empCell: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  avatarImg: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    objectFit: "cover",
    flexShrink: 0,
  },
  avatarPlaceholder: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "var(--primary-color)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
    fontSize: "0.875rem",
    flexShrink: 0,
  },
  empName: {
    fontWeight: "600",
    color: "var(--text-primary)",
  },
  codeBadgeSm: {
    backgroundColor: "var(--bg-surface-elevated)",
    padding: "0.15rem 0.4rem",
    borderRadius: "var(--radius-sm)",
    color: "var(--primary-color)",
    fontFamily: "var(--font-mono)",
    fontSize: "0.7rem",
  },
  officialDesignationBadge: {
    backgroundColor: "var(--bg-surface-elevated)",
    border: "1px solid var(--border-color)",
    color: "var(--text-secondary)",
    padding: "0.2rem 0.6rem",
    borderRadius: "var(--radius-sm)",
    fontSize: "0.8125rem",
    fontWeight: "500",
  },
  projectRoleBadge: {
    backgroundColor: "var(--primary-light, rgba(37, 99, 235, 0.12))",
    color: "var(--primary-color)",
    border: "1px solid rgba(37, 99, 235, 0.3)",
    padding: "0.25rem 0.625rem",
    borderRadius: "9999px",
    fontSize: "0.75rem",
    fontWeight: "700",
    display: "inline-block",
  },
  activeTag: {
    color: "var(--success-color)",
    fontWeight: "700",
    fontSize: "0.75rem",
  },
  removedTag: {
    color: "var(--text-muted)",
    fontWeight: "600",
    fontSize: "0.75rem",
  },
  removeBtn: {
    backgroundColor: "var(--danger-bg)",
    color: "var(--danger-color)",
    border: "1px solid var(--danger-border)",
    padding: "0.25rem 0.5rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.75rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  teamCardMobile: {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  teamCardMobileHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  teamCardMobileBody: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    borderTop: "1px solid var(--border-color)",
    borderBottom: "1px solid var(--border-color)",
    padding: "0.625rem 0",
  },
  fieldBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "0.15rem",
  },
  fieldLabel: {
    fontSize: "0.7rem",
    fontWeight: "700",
    color: "var(--text-muted)",
    textTransform: "uppercase",
  },
  fieldVal: {
    fontSize: "0.875rem",
    color: "var(--text-primary)",
  },
  removeBtnMobile: {
    backgroundColor: "var(--danger-bg)",
    color: "var(--danger-color)",
    border: "1px solid var(--danger-border)",
    padding: "0.5rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.8125rem",
    fontWeight: "600",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.35rem",
  },
  loadingState: {
    textAlign: "center",
    padding: "3rem",
    color: "var(--text-muted)",
  },
  emptyState: {
    textAlign: "center",
    padding: "3rem",
    backgroundColor: "var(--bg-surface)",
    borderRadius: "var(--radius-lg)",
    color: "var(--text-muted)",
  },
  overduePill: {
    backgroundColor: "var(--danger-bg)",
    color: "var(--danger-color)",
    fontSize: "0.7rem",
    fontWeight: "800",
    padding: "0.2rem 0.5rem",
    borderRadius: "var(--radius-sm)",
  },
};
