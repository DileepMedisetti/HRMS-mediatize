import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Pencil } from "lucide-react";
import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import { useAuth } from "../hooks/useAuth";
import {
  getHRProfile,
  updateHRProfile,
  uploadHRProfilePhoto,
  deleteHRProfilePhoto,
} from "../services/authApi";

export default function HRProfile({ editMode = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshUser } = useAuth();

  const isEditing = editMode || location.pathname === "/hr/profile/edit";

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");

  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getHRProfile();
      const data = res.data;
      setProfileData(data);
      setFirstName(data.first_name || "");
      setLastName(data.last_name || "");
      setAddress(data.address || "");
    } catch (err) {
      console.error("Failed to load HR profile:", err);
      toast.error(err.response?.data?.detail || "Failed to load HR profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [location.pathname]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!firstName.trim()) {
      toast.error("First name is required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        address: address.trim() || null,
      };

      const res = await updateHRProfile(payload);
      setProfileData(res.data);

      if (refreshUser) {
        await refreshUser();
      }

      toast.success("HR Profile updated successfully!");
      navigate("/hr/profile");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5 MB.");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      toast.error("Invalid file format. Please upload JPG, PNG, or WebP.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploadingPhoto(true);
    try {
      const res = await uploadHRProfilePhoto(formData);
      setProfileData(res.data);
      if (refreshUser) {
        await refreshUser();
      }
      toast.success("Profile photo updated!");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Photo upload failed.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      const res = await deleteHRProfilePhoto();
      setProfileData(res.data);
      if (refreshUser) {
        await refreshUser();
      }
      toast.info("Profile photo removed.");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Photo removal failed.");
    }
  };

  const getFullName = () => {
    const fn = (profileData?.first_name || firstName || "").trim();
    const ln = (profileData?.last_name || lastName || "").trim();
    const full = [fn, ln].filter(Boolean).join(" ");
    return full || "Mohan Medisetti";
  };

  const getInitials = () => {
    const fn = (profileData?.first_name || firstName || "").trim();
    const ln = (profileData?.last_name || lastName || "").trim();
    if (fn && ln) {
      return `${fn.charAt(0)}${ln.charAt(0)}`.toUpperCase();
    }
    if (fn) {
      return fn.slice(0, 2).toUpperCase();
    }
    if (ln) {
      return ln.slice(0, 2).toUpperCase();
    }
    return "MM";
  };

  const displayEmail = profileData?.email || user?.email || "nameismohan123@gmail.com";
  const displayRole = profileData?.role || user?.role || "HR";

  if (loading) {
    return (
      <AppLayout title="HR Profile">
        <div style={styles.loading}>Loading HR profile...</div>
      </AppLayout>
    );
  }

  if (!profileData) return null;

  return (
    <AppLayout title={isEditing ? "Edit HR Profile" : "HR Profile"}>
      <div style={styles.container}>
        <BackToDashboard to="/hr/dashboard" role="HR" />
        <div style={styles.card}>
          {/* Profile Header */}
          <div style={styles.header}>
            <div style={styles.avatarSection}>
              <div style={styles.avatarContainer}>
                {profileData.profile_photo_url ? (
                  <img
                    src={profileData.profile_photo_url}
                    alt={getFullName()}
                    style={styles.avatarImg}
                  />
                ) : (
                  <div style={styles.avatarPlaceholder}>
                    {getInitials()}
                  </div>
                )}
              </div>

              {isEditing && (
                <div style={styles.photoControls}>
                  <label style={uploadingPhoto ? styles.uploadBtnDisabled : styles.uploadBtn}>
                    {uploadingPhoto ? "Uploading..." : "Change Photo"}
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handlePhotoUpload}
                      disabled={uploadingPhoto}
                      style={{ display: "none" }}
                    />
                  </label>

                  {profileData.profile_photo_url && (
                    <button onClick={handleRemovePhoto} style={styles.removePhotoBtn}>
                      Remove Photo
                    </button>
                  )}
                </div>
              )}
            </div>

            <div>
              <h2 style={styles.name}>{getFullName()}</h2>
              <div style={styles.subMeta}>
                <span style={styles.codeBadge}>{displayRole}</span>
                <span style={styles.statusBadge}>ACTIVE</span>
              </div>
            </div>
          </div>

          {/* Details View or Edit Form */}
          {!isEditing ? (
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>Personal & Contact Information</h3>
                <button
                  onClick={() => navigate("/hr/profile/edit")}
                  style={styles.editBtn}
                  aria-label="Edit Profile"
                >
                  <Pencil size={14} style={{ marginRight: "0.35rem", display: "inline-block", verticalAlign: "middle" }} />
                  Edit Profile
                </button>
              </div>

              <div style={styles.grid}>
                <div style={styles.fieldItem}>
                  <span style={styles.fieldLabel}>Name</span>
                  <span style={styles.fieldValue}>{getFullName()}</span>
                </div>
                <div style={styles.fieldItem}>
                  <span style={styles.fieldLabel}>Email Address</span>
                  <span style={styles.fieldValue}>{displayEmail}</span>
                </div>
                <div style={styles.fieldItem}>
                  <span style={styles.fieldLabel}>Role</span>
                  <span style={styles.fieldValue}>{displayRole}</span>
                </div>
                <div style={styles.fieldItemFull}>
                  <span style={styles.fieldLabel}>Address</span>
                  <span style={styles.fieldValue}>
                    {profileData.address ? profileData.address : "Not provided"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} style={styles.form}>
              <h3 style={styles.sectionTitle}>Update Your HR Profile Info</h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
                  gap: "1rem",
                }}
              >
                <div style={styles.formGroup}>
                  <label style={styles.label}>First Name *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    style={styles.input}
                    placeholder="First Name"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    style={styles.input}
                    placeholder="Last Name"
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Address (Optional)</label>
                <textarea
                  rows="3"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={styles.textarea}
                  placeholder="Enter your address (e.g. Hyderabad, Telangana, India)"
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
                  gap: "1rem",
                  opacity: 0.85,
                }}
              >
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email Address (Read Only)</label>
                  <input
                    type="email"
                    value={displayEmail}
                    disabled
                    style={{
                      ...styles.input,
                      backgroundColor: "var(--bg-surface-elevated)",
                      cursor: "not-allowed",
                      color: "var(--text-muted)",
                    }}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Role (Read Only)</label>
                  <input
                    type="text"
                    value={displayRole}
                    disabled
                    style={{
                      ...styles.input,
                      backgroundColor: "var(--bg-surface-elevated)",
                      cursor: "not-allowed",
                      color: "var(--text-muted)",
                    }}
                  />
                </div>
              </div>

              <div style={styles.buttonGroup}>
                <button
                  type="button"
                  onClick={() => navigate("/hr/profile")}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={saving ? styles.submitBtnDisabled : styles.submitBtn}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

const styles = {
  container: {
    padding: "0 0 2rem 0",
    maxWidth: "800px",
  },
  card: {
    backgroundColor: "var(--bg-surface)",
    borderRadius: "var(--radius-lg)",
    padding: "2rem",
    border: "1px solid var(--border-color)",
    color: "var(--text-primary)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1.5rem",
    marginBottom: "2rem",
    borderBottom: "1px solid var(--border-color)",
    paddingBottom: "1.5rem",
  },
  avatarSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.75rem",
  },
  avatarContainer: {
    width: "96px",
    height: "96px",
    borderRadius: "50%",
    overflow: "hidden",
    border: "3px solid var(--primary-color)",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "var(--primary-color)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
    fontWeight: "700",
  },
  photoControls: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
  },
  uploadBtn: {
    backgroundColor: "var(--primary-color)",
    color: "var(--text-on-primary)",
    padding: "0.25rem 0.625rem",
    borderRadius: "var(--radius-sm)",
    fontSize: "0.75rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  uploadBtnDisabled: {
    backgroundColor: "var(--bg-surface-elevated)",
    color: "var(--text-muted)",
    padding: "0.25rem 0.625rem",
    borderRadius: "var(--radius-sm)",
    fontSize: "0.75rem",
    cursor: "not-allowed",
  },
  removePhotoBtn: {
    backgroundColor: "var(--danger-color)",
    color: "#ffffff",
    border: "none",
    padding: "0.25rem 0.625rem",
    borderRadius: "var(--radius-sm)",
    fontSize: "0.75rem",
    cursor: "pointer",
  },
  name: {
    fontSize: "1.75rem",
    fontWeight: "700",
    color: "var(--text-primary)",
    margin: 0,
  },
  subMeta: {
    display: "flex",
    gap: "0.5rem",
    marginTop: "0.375rem",
  },
  codeBadge: {
    backgroundColor: "var(--bg-surface-elevated)",
    color: "var(--primary-color)",
    padding: "0.2rem 0.5rem",
    borderRadius: "var(--radius-sm)",
    fontFamily: "var(--font-mono)",
    fontSize: "0.875rem",
  },
  statusBadge: {
    backgroundColor: "var(--bg-surface-elevated)",
    color: "var(--text-secondary)",
    border: "1px solid var(--border-color)",
    padding: "0.2rem 0.5rem",
    borderRadius: "var(--radius-sm)",
    fontSize: "0.75rem",
    fontWeight: "600",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "0.75rem",
  },
  sectionTitle: {
    fontSize: "1.125rem",
    fontWeight: "600",
    color: "var(--text-secondary)",
    margin: 0,
  },
  editBtn: {
    backgroundColor: "var(--primary-color)",
    color: "var(--text-on-primary)",
    border: "none",
    padding: "0.375rem 0.875rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.875rem",
    cursor: "pointer",
    fontWeight: "500",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
    gap: "1.5rem",
    backgroundColor: "var(--bg-surface-elevated)",
    padding: "1.5rem",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-color)",
  },
  fieldItem: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  fieldItemFull: {
    gridColumn: "1 / -1",
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  fieldLabel: {
    fontSize: "0.75rem",
    textTransform: "uppercase",
    color: "var(--text-muted)",
    letterSpacing: "0.05em",
    fontWeight: "600",
  },
  fieldValue: {
    fontSize: "1rem",
    color: "var(--text-primary)",
    fontWeight: "500",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
    backgroundColor: "var(--bg-surface-elevated)",
    padding: "1.5rem",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-color)",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.375rem",
  },
  label: {
    fontSize: "0.875rem",
    color: "var(--text-secondary)",
    fontWeight: "500",
  },
  input: {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    color: "var(--text-primary)",
    padding: "0.625rem 0.875rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.875rem",
  },
  textarea: {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    color: "var(--text-primary)",
    padding: "0.625rem 0.875rem",
    borderRadius: "var(--radius-md)",
    fontSize: "0.875rem",
    resize: "vertical",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: "0.75rem",
  },
  cancelBtn: {
    backgroundColor: "var(--bg-surface-elevated)",
    color: "var(--text-primary)",
    border: "1px solid var(--border-color)",
    padding: "0.5rem 1rem",
    borderRadius: "var(--radius-md)",
    cursor: "pointer",
  },
  submitBtn: {
    backgroundColor: "var(--primary-color)",
    color: "var(--text-on-primary)",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "var(--radius-md)",
    cursor: "pointer",
    fontWeight: "600",
  },
  submitBtnDisabled: {
    backgroundColor: "var(--bg-surface-elevated)",
    color: "var(--text-muted)",
    border: "1px solid var(--border-color)",
    padding: "0.5rem 1rem",
    borderRadius: "var(--radius-md)",
    cursor: "not-allowed",
  },
  loading: {
    textAlign: "center",
    padding: "3rem",
    color: "var(--text-muted)",
  },
};
