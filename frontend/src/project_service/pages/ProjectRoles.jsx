import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  ShieldAlert,
  Plus,
  Search,
  Edit2,
  CheckCircle2,
  XCircle,
  Briefcase,
  Loader2,
  RefreshCw,
} from "lucide-react";
import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import Modal from "../../shared/components/Modal";
import Input, { TextArea } from "../../shared/components/Input";
import Button from "../../shared/components/Button";
import Pagination from "../../shared/components/Pagination";
import { RoleStatusBadge } from "../components/ProjectBadges";
import {
  getProjectRoles,
  createProjectRole,
  updateProjectRole,
} from "../services/projectApi";

export default function ProjectRoles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Pagination
  const ITEMS_PER_PAGE = 15;
  const [currentPage, setCurrentPage] = useState(1);

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
  });
  const [submittingCreate, setSubmittingCreate] = useState(false);
  const [createErrors, setCreateErrors] = useState({});

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    is_active: true,
  });
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [editErrors, setEditErrors] = useState({});

  const fetchRoles = async () => {
    setLoading(true);

    try {
      const res = await getProjectRoles();
      setRoles(res.data || []);
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          "Failed to load project roles"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateErrors({});

    if (!createForm.name.trim()) {
      setCreateErrors({
        name: "Role name is required",
      });
      return;
    }

    setSubmittingCreate(true);

    try {
      await createProjectRole(createForm);

      toast.success(
        "Project role created successfully!"
      );

      setIsCreateOpen(false);
      setCreateForm({
        name: "",
        description: "",
      });

      setCurrentPage(1);

      fetchRoles();
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        "Failed to create project role";

      toast.error(msg);

      if (
        typeof msg === "string" &&
        msg.toLowerCase().includes("name")
      ) {
        setCreateErrors({
          name: msg,
        });
      }
    } finally {
      setSubmittingCreate(false);
    }
  };

  const handleOpenEdit = (role) => {
    setSelectedRole(role);

    setEditForm({
      name: role.name,
      description: role.description || "",
      is_active: role.is_active,
    });

    setEditErrors({});
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRole) return;

    setEditErrors({});

    if (!editForm.name.trim()) {
      setEditErrors({
        name: "Role name is required",
      });
      return;
    }

    setSubmittingEdit(true);

    try {
      await updateProjectRole(
        selectedRole.id,
        editForm
      );

      toast.success(
        "Project role updated successfully!"
      );

      setIsEditOpen(false);
      setSelectedRole(null);

      fetchRoles();
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        "Failed to update project role";

      toast.error(msg);

      if (
        typeof msg === "string" &&
        msg.toLowerCase().includes("name")
      ) {
        setEditErrors({
          name: msg,
        });
      }
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleToggleStatus = async (role) => {
    const nextStatus = !role.is_active;

    try {
      await updateProjectRole(role.id, {
        is_active: nextStatus,
      });

      toast.success(
        `Role ${
          nextStatus ? "activated" : "deactivated"
        } successfully`
      );

      fetchRoles();
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          "Failed to change role status"
      );
    }
  };

  // Search / Filter
  const filteredRoles = roles.filter(
    (r) =>
      r.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (r.description &&
        r.description
          .toLowerCase()
          .includes(search.toLowerCase()))
  );

  // ============================================================
  // PAGINATION
  // ============================================================

  const totalPages = Math.ceil(
    filteredRoles.length / ITEMS_PER_PAGE
  );

  const startIndex =
    (currentPage - 1) * ITEMS_PER_PAGE;

  const endIndex =
    startIndex + ITEMS_PER_PAGE;

  const paginatedRoles = filteredRoles.slice(
    startIndex,
    endIndex
  );

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Make sure current page is valid
  useEffect(() => {
    if (totalPages === 0) {
      setCurrentPage(1);
    } else if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <AppLayout>
      <div className="hrms-page-container">
        <BackToDashboard />

        {/* Page Header */}
        <div className="hrms-page-header">
          <div>
            <h1 className="hrms-page-title">
              Project Roles
            </h1>

            <p className="hrms-page-subtitle">
              Define and manage standard roles for employee
              project assignments (e.g. Lead, Developer, QA).
            </p>
          </div>

          <div className="hrms-page-actions">
            <Button
              variant="outline"
              icon={RefreshCw}
              onClick={fetchRoles}
              disabled={loading}
            >
              Refresh
            </Button>

            <Button
              variant="primary"
              icon={Plus}
              onClick={() => {
                setCreateForm({
                  name: "",
                  description: "",
                });

                setCreateErrors({});
                setIsCreateOpen(true);
              }}
            >
              Create Role
            </Button>
          </div>
        </div>

        {/* Controls Section */}
        <div
          className="hrms-card"
          style={{ marginBottom: "1.5rem" }}
        >
          <div
            className="hrms-card-body"
            style={{
              padding: "1rem 1.25rem",
            }}
          >
            <div
              style={{
                position: "relative",
                maxWidth: "360px",
              }}
            >
              <Search
                size={18}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                  color:
                    "var(--hrms-text-muted, #64748b)",
                }}
              />

              <input
                type="text"
                className="hrms-input-field"
                placeholder="Search roles..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  paddingLeft: "2.35rem",
                }}
              />
            </div>
          </div>
        </div>

        {/* Table / List View */}
        <div className="hrms-card">
          <div
            className="hrms-card-body"
            style={{ padding: 0 }}
          >
            {loading ? (
              <div
                style={{
                  padding: "3rem",
                  textAlign: "center",
                }}
              >
                <Loader2
                  className="hrms-spinner"
                  size={32}
                  style={{
                    margin:
                      "0 auto 1rem",
                  }}
                />

                <p
                  style={{
                    color:
                      "var(--hrms-text-secondary, #64748b)",
                  }}
                >
                  Loading project roles...
                </p>
              </div>
            ) : filteredRoles.length === 0 ? (
              <div
                style={{
                  padding:
                    "3rem 1.5rem",
                  textAlign: "center",
                }}
              >
                <Briefcase
                  size={40}
                  style={{
                    color:
                      "var(--hrms-text-muted, #94a3b8)",
                    marginBottom:
                      "0.75rem",
                  }}
                />

                <h3
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: 600,
                    margin:
                      "0 0 0.5rem",
                  }}
                >
                  {search
                    ? "No matching roles found"
                    : "No project roles created yet"}
                </h3>

                <p
                  style={{
                    color:
                      "var(--hrms-text-secondary, #64748b)",
                    margin:
                      "0 0 1.25rem",
                  }}
                >
                  {search
                    ? "Try adjusting your search keywords."
                    : "Create project roles to assign to team members when allocating projects."}
                </p>

                {!search && (
                  <Button
                    variant="primary"
                    icon={Plus}
                    onClick={() =>
                      setIsCreateOpen(true)
                    }
                  >
                    Create First Role
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="hrms-table-container">
                  <table className="hrms-table">
                    <thead>
                      <tr>
                        <th>Role Name</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Created Date</th>
                        <th
                          style={{
                            textAlign: "right",
                          }}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedRoles.map(
                        (role) => (
                          <tr key={role.id}>
                            <td
                              style={{
                                fontWeight: 600,
                                color:
                                  "var(--hrms-text-primary)",
                              }}
                            >
                              {role.name}
                            </td>

                            <td
                              style={{
                                color:
                                  "var(--hrms-text-secondary)",
                                maxWidth: "320px",
                              }}
                            >
                              {role.description || (
                                <span
                                  style={{
                                    fontStyle:
                                      "italic",
                                    opacity: 0.6,
                                  }}
                                >
                                  No description
                                </span>
                              )}
                            </td>

                            <td>
                              <RoleStatusBadge
                                isActive={
                                  role.is_active
                                }
                              />
                            </td>

                            <td
                              style={{
                                color:
                                  "var(--hrms-text-secondary)",
                                fontSize:
                                  "0.875rem",
                              }}
                            >
                              {new Date(
                                role.created_at
                              ).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </td>

                            <td>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent:
                                    "flex-end",
                                  gap: "0.5rem",
                                }}
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  icon={Edit2}
                                  onClick={() =>
                                    handleOpenEdit(
                                      role
                                    )
                                  }
                                  title="Edit Role"
                                >
                                  Edit
                                </Button>

                                <Button
                                  variant={
                                    role.is_active
                                      ? "outline"
                                      : "primary"
                                  }
                                  size="sm"
                                  icon={
                                    role.is_active
                                      ? XCircle
                                      : CheckCircle2
                                  }
                                  onClick={() =>
                                    handleToggleStatus(
                                      role
                                    )
                                  }
                                  title={
                                    role.is_active
                                      ? "Deactivate Role"
                                      : "Activate Role"
                                  }
                                >
                                  {role.is_active
                                    ? "Deactivate"
                                    : "Activate"}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                {/* ==================================================
                    PAGINATION
                    ================================================== */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredRoles.length}
                  onPrevious={handlePreviousPage}
                  onNext={handleNextPage}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* CREATE ROLE MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() =>
          setIsCreateOpen(false)
        }
        title="Create New Project Role"
      >
        <form
          onSubmit={handleCreateSubmit}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
            }}
          >
            <Input
              label="Role Name *"
              placeholder="e.g. Lead Engineer, UI/UX Designer, QA Specialist"
              value={createForm.name}
              onChange={(e) =>
                setCreateForm({
                  ...createForm,
                  name: e.target.value,
                })
              }
              error={createErrors.name}
              required
            />

            <TextArea
              label="Description (Optional)"
              rows={4}
              placeholder="Briefly describe the key responsibilities of this project role..."
              value={
                createForm.description
              }
              onChange={(e) =>
                setCreateForm({
                  ...createForm,
                  description:
                    e.target.value,
                })
              }
            />

            <div
              style={{
                display: "flex",
                justifyContent:
                  "flex-end",
                gap: "0.75rem",
                marginTop: "0.5rem",
                flexWrap: "wrap",
              }}
            >
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setIsCreateOpen(false)
                }
                disabled={
                  submittingCreate
                }
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="primary"
                loading={
                  submittingCreate
                }
                icon={Plus}
              >
                Create Role
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* EDIT ROLE MODAL */}
      <Modal
        isOpen={isEditOpen}
        onClose={() =>
          setIsEditOpen(false)
        }
        title="Edit Project Role"
      >
        <form
          onSubmit={handleEditSubmit}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
            }}
          >
            <Input
              label="Role Name *"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  name: e.target.value,
                })
              }
              error={editErrors.name}
              required
            />

            <TextArea
              label="Description"
              rows={4}
              placeholder="Briefly describe the key responsibilities..."
              value={
                editForm.description
              }
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  description:
                    e.target.value,
                })
              }
            />

            <div
              style={{
                display: "flex",
                alignItems:
                  "center",
                gap: "0.75rem",
              }}
            >
              <input
                type="checkbox"
                id="edit_role_is_active"
                checked={
                  editForm.is_active
                }
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    is_active:
                      e.target.checked,
                  })
                }
                style={{
                  width: "18px",
                  height: "18px",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              />

              <label
                htmlFor="edit_role_is_active"
                style={{
                  cursor: "pointer",
                  fontWeight: 500,
                  fontSize:
                    "0.875rem",
                }}
              >
                Active Status (Allow
                assignment to projects)
              </label>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent:
                  "flex-end",
                gap: "0.75rem",
                marginTop: "0.5rem",
                flexWrap: "wrap",
              }}
            >
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setIsEditOpen(false)
                }
                disabled={
                  submittingEdit
                }
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="primary"
                loading={
                  submittingEdit
                }
              >
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}