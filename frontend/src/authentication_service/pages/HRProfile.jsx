import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Pencil,
  Camera,
  Trash2,
  Mail,
  MapPin,
  ShieldCheck,
  Calendar,
  Building2,
  Briefcase,
  User,
  BadgeCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import { useAuth } from "../hooks/useAuth";
import {
  getHRProfile,
  updateHRProfile,
  uploadHRProfilePhoto,
  deleteHRProfilePhoto,
} from "../services/authApi";
import "./HRProfile.css";

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
    return full || "HR Executive";
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
    return "HR";
  };

  const displayEmail = profileData?.email || user?.email || "hr@mediatizetech.com";
  const displayRole = profileData?.role || user?.role || "HR";

  const renderStatusBadge = (status = "ACTIVE") => {
    const normalized = (status || "ACTIVE").toUpperCase();
    let colorClass = "status-badge-active";
    let label = normalized;

    if (normalized === "ACTIVE") {
      colorClass = "status-badge-active";
    } else if (normalized === "INACTIVE") {
      colorClass = "status-badge-inactive";
    } else if (normalized === "ON_NOTICE") {
      colorClass = "status-badge-notice";
    } else if (normalized === "TERMINATED") {
      colorClass = "status-badge-terminated";
    }

    return (
      <span className={`profile-status-badge ${colorClass}`}>
        <span className="status-dot">●</span>
        <span>{label}</span>
      </span>
    );
  };

  if (loading) {
    return (
      <AppLayout title="HR Profile">
        <div className="profile-page-wrapper">
          <BackToDashboard to="/hr/dashboard" role="HR" />
          <div className="profile-skeleton-wrapper">
            <div className="skeleton-hero-card profile-shimmer"></div>
            <div className="skeleton-stats-grid">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton-stat-box profile-shimmer"></div>
              ))}
            </div>
            <div className="skeleton-info-grid">
              <div className="skeleton-info-box profile-shimmer"></div>
              <div className="skeleton-info-box profile-shimmer"></div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!profileData) return null;

  return (
    <AppLayout title={isEditing ? "Edit HR Profile" : "HR Executive Profile"}>
      <div className="profile-page-wrapper">
        <BackToDashboard to="/hr/dashboard" role="HR" />

        {/* HERO CARD */}
        <div className="profile-hero-card">
          <div className="profile-cover-banner"></div>

          <div className="profile-hero-body">
            <div className="profile-hero-top-bar">
              <div className="profile-avatar-wrapper">
                {profileData.profile_photo_url ? (
                  <img
                    src={profileData.profile_photo_url}
                    alt={getFullName()}
                    className="profile-avatar-img"
                  />
                ) : (
                  <div className="profile-avatar-initials">
                    {getInitials()}
                  </div>
                )}

                {/* Upload Overlay Button in Edit Mode */}
                {isEditing && (
                  <label
                    className="profile-avatar-upload-overlay"
                    title={uploadingPhoto ? "Uploading..." : "Upload Profile Photo"}
                  >
                    <Camera size={16} />
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handlePhotoUpload}
                      disabled={uploadingPhoto}
                      style={{ display: "none" }}
                    />
                  </label>
                )}
              </div>

              <div className="profile-hero-actions">
                {!isEditing ? (
                  <button
                    onClick={() => navigate("/hr/profile/edit")}
                    className="btn-profile-primary"
                    aria-label="Edit HR Profile"
                  >
                    <Pencil size={15} />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => navigate("/hr/profile")}
                      className="btn-profile-secondary"
                    >
                      Cancel
                    </button>
                    {profileData.profile_photo_url && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="btn-profile-photo-remove"
                      >
                        <Trash2 size={13} />
                        <span>Remove Photo</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="profile-hero-identity">
              <h1 className="profile-hero-name">{getFullName()}</h1>
              <div className="profile-meta-badges">
                <span className="profile-role-pill role-pill-hr">
                  <ShieldCheck size={13} />
                  <span>{displayRole}</span>
                </span>
                <span className="profile-code-tag">
                  <BadgeCheck size={13} />
                  <span>HR-ADMIN</span>
                </span>
                {renderStatusBadge("ACTIVE")}
              </div>
            </div>
          </div>
        </div>

        {!isEditing ? (
          <>
            {/* QUICK INFO STATS CARDS */}
            <div className="profile-stats-grid">
              <div className="profile-stat-card">
                <div className="stat-icon-wrapper">
                  <BadgeCheck size={20} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Admin ID</span>
                  <span className="stat-value">HR-{profileData.id || "001"}</span>
                </div>
              </div>

              <div className="profile-stat-card">
                <div className="stat-icon-wrapper">
                  <Building2 size={20} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Department</span>
                  <span className="stat-value">Human Resources</span>
                </div>
              </div>

              <div className="profile-stat-card">
                <div className="stat-icon-wrapper">
                  <Briefcase size={20} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Executive Role</span>
                  <span className="stat-value">{displayRole} Management</span>
                </div>
              </div>

              <div className="profile-stat-card">
                <div className="stat-icon-wrapper">
                  <ShieldCheck size={20} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Access Control</span>
                  <span className="stat-value">Super Admin</span>
                </div>
              </div>
            </div>

            {/* TWO-COLUMN DETAILED INFO GRID */}
            <div className="profile-info-grid">
              {/* Card 1: Contact Information */}
              <div className="profile-info-card">
                <div className="info-card-header">
                  <h3 className="info-card-title">
                    <Mail size={18} className="info-card-title-icon" />
                    <span>Contact Information</span>
                  </h3>
                </div>
                <div className="info-card-fields">
                  <div className="info-field-item">
                    <span className="info-field-label">
                      <Mail size={13} className="info-field-icon" />
                      <span>Email Address</span>
                    </span>
                    <span className="info-field-value">{displayEmail}</span>
                  </div>

                  <div className="info-field-item">
                    <span className="info-field-label">
                      <MapPin size={13} className="info-field-icon" />
                      <span>Office / Residential Address</span>
                    </span>
                    <span className="info-field-value">
                      {profileData.address ? (
                        profileData.address
                      ) : (
                        <span className="info-field-empty">Not provided</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: System & Account Security */}
              <div className="profile-info-card">
                <div className="info-card-header">
                  <h3 className="info-card-title">
                    <ShieldCheck size={18} className="info-card-title-icon" />
                    <span>Account & Security</span>
                  </h3>
                </div>
                <div className="info-card-fields">
                  <div className="info-field-item">
                    <span className="info-field-label">
                      <User size={13} className="info-field-icon" />
                      <span>Full Name</span>
                    </span>
                    <span className="info-field-value">{getFullName()}</span>
                  </div>

                  <div className="info-field-item">
                    <span className="info-field-label">
                      <CheckCircle2 size={13} className="info-field-icon" />
                      <span>Account Status</span>
                    </span>
                    <div style={{ marginTop: "0.15rem" }}>
                      {renderStatusBadge("ACTIVE")}
                    </div>
                  </div>

                  <div className="info-field-item">
                    <span className="info-field-label">
                      <Sparkles size={13} className="info-field-icon" />
                      <span>Authentication Method</span>
                    </span>
                    <span className="info-field-value">Passwordless OTP Verification</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* EDIT PROFILE FORM CARD */
          <div className="profile-edit-card">
            <h2 className="profile-form-title">
              <Pencil size={18} style={{ color: "var(--primary-color)" }} />
              <span>Update HR Profile Information</span>
            </h2>

            <form onSubmit={handleSaveProfile}>
              <div className="profile-form-grid-2">
                <div className="profile-form-group">
                  <label className="profile-form-label">
                    <span>First Name</span>
                    <span style={{ color: "var(--danger-color)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="profile-form-input"
                    placeholder="Enter first name"
                  />
                </div>

                <div className="profile-form-group">
                  <label className="profile-form-label">
                    <span>Last Name</span>
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="profile-form-input"
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="profile-form-group" style={{ marginBottom: "1.25rem" }}>
                <label className="profile-form-label">
                  <span>Address</span>
                </label>
                <textarea
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="profile-form-textarea"
                  placeholder="Enter office or residential address (e.g. Hyderabad, Telangana, India)"
                />
              </div>

              <div className="profile-form-grid-2" style={{ opacity: 0.85 }}>
                <div className="profile-form-group">
                  <label className="profile-form-label">
                    <span>Email Address (Read Only)</span>
                  </label>
                  <input
                    type="email"
                    value={displayEmail}
                    disabled
                    className="profile-form-input profile-form-input-disabled"
                  />
                </div>

                <div className="profile-form-group">
                  <label className="profile-form-label">
                    <span>System Role (Read Only)</span>
                  </label>
                  <input
                    type="text"
                    value={displayRole}
                    disabled
                    className="profile-form-input profile-form-input-disabled"
                  />
                </div>
              </div>

              <div className="profile-form-actions">
                <button
                  type="button"
                  onClick={() => navigate("/hr/profile")}
                  className="btn-profile-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-profile-primary"
                >
                  {saving ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
