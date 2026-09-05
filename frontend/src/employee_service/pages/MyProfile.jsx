import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import {
  getMyProfile,
  updateMyProfile,
  uploadProfilePhoto,
  deleteProfilePhoto,
} from "../services/employeeApi";

export default function MyProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await getMyProfile();
      const emp = res.data;
      setProfile(emp);
      setPhone(emp.phone || "");
      setAddress(emp.address || "");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to load self profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateSelf = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateMyProfile({ phone, address });
      toast.success("Profile updated successfully!");
      setEditing(false);
      fetchProfile();
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

    const formData = new FormData();
    formData.append("file", file);

    setUploadingPhoto(true);
    try {
      await uploadProfilePhoto(formData);
      toast.success("Profile photo updated!");
      fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Photo upload failed.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      await deleteProfilePhoto();
      toast.info("Profile photo removed.");
      fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Photo removal failed.");
    }
  };

  if (loading) {
    return (
      <AppLayout title="My Employee Profile">
        <div style={styles.loading}>Loading your profile...</div>
      </AppLayout>
    );
  }

  if (!profile) return null;

  return (
    <AppLayout title="My Employee Profile">
      <div style={styles.container}>
        <BackToDashboard to="/employee/dashboard" role="EMPLOYEE" />
        <div style={styles.card}>
          {/* Profile Avatar Header */}
          <div style={styles.header}>
            <div style={styles.avatarSection}>
              <div style={styles.avatarContainer}>
                {profile.profile_photo_url ? (
                  <img
                    src={profile.profile_photo_url}
                    alt={profile.first_name}
                    style={styles.avatarImg}
                  />
                ) : (
                  <div style={styles.avatarPlaceholder}>
                    {profile.first_name?.[0]}
                    {profile.last_name?.[0]}
                  </div>
                )}
              </div>

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

                {profile.profile_photo_url && (
                  <button onClick={handleRemovePhoto} style={styles.removePhotoBtn}>
                    Remove Photo
                  </button>
                )}
              </div>
            </div>

            <div>
              <h2 style={styles.name}>{profile.first_name} {profile.last_name}</h2>
              <div style={styles.subMeta}>
                <span style={styles.codeBadge}>{profile.employee_code}</span>
                <span style={styles.statusBadge}>{profile.employment_status}</span>
              </div>
            </div>
          </div>

          {/* Info or Edit Form */}
          {!editing ? (
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>Personal & Contact Information</h3>
                <button onClick={() => setEditing(true)} style={styles.editBtn}>
                  Edit Contact Details
                </button>
              </div>

              <div style={styles.grid}>
                <div style={styles.fieldItem}>
                  <span style={styles.fieldLabel}>Email Address</span>
                  <span style={styles.fieldValue}>{profile.email}</span>
                </div>
                <div style={styles.fieldItem}>
                  <span style={styles.fieldLabel}>Phone Number</span>
                  <span style={styles.fieldValue}>{profile.phone || "Not Provided"}</span>
                </div>
                <div style={styles.fieldItem}>
                  <span style={styles.fieldLabel}>Date of Birth</span>
                  <span style={styles.fieldValue}>{profile.date_of_birth || "Not Provided"}</span>
                </div>
                <div style={styles.fieldItem}>
                  <span style={styles.fieldLabel}>Joining Date</span>
                  <span style={styles.fieldValue}>{profile.joining_date || "Not Provided"}</span>
                </div>
                <div style={styles.fieldItemFull}>
                  <span style={styles.fieldLabel}>Residential Address</span>
                  <span style={styles.fieldValue}>{profile.address || "Not Provided"}</span>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdateSelf} style={styles.form}>
              <h3 style={styles.sectionTitle}>Update Your Contact Info</h3>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={styles.input}
                  placeholder="+91 9876543210"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Residential Address</label>
                <textarea
                  rows="3"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={styles.textarea}
                  placeholder="Enter your updated address"
                />
              </div>

              <div style={styles.buttonGroup}>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
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
