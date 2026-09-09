import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Pencil,
  Camera,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  Briefcase,
  User,
  BadgeCheck,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Heart,
  Clock,
} from "lucide-react";
import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import {
  getMyProfile,
  updateMyProfile,
  uploadProfilePhoto,
  deleteProfilePhoto,
} from "../services/employeeApi";
import "./MyProfile.css";

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

  const getFullName = () => {
    if (!profile) return "Employee Profile";
    const fn = (profile.first_name || "").trim();
    const ln = (profile.last_name || "").trim();
    return [fn, ln].filter(Boolean).join(" ") || "Employee";
  };

  const getInitials = () => {
    if (!profile) return "EP";
    const fn = (profile.first_name || "").trim();
    const ln = (profile.last_name || "").trim();
    if (fn && ln) {
      return `${fn.charAt(0)}${ln.charAt(0)}`.toUpperCase();
    }
    if (fn) return fn.slice(0, 2).toUpperCase();
    if (ln) return ln.slice(0, 2).toUpperCase();
    return "EP";
  };

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
      <AppLayout title="My Employee Profile">
        <div className="profile-page-wrapper">
          <BackToDashboard to="/employee/dashboard" role="EMPLOYEE" />
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

  if (!profile) return null;

  return (
    <AppLayout title="My Employee Profile">
      <div className="profile-page-wrapper">
        <BackToDashboard to="/employee/dashboard" role="EMPLOYEE" />

        {/* HERO CARD */}
        <div className="profile-hero-card">
          <div className="profile-cover-banner"></div>

          <div className="profile-hero-body">
            <div className="profile-hero-top-bar">
              <div className="profile-avatar-wrapper">
                {profile.profile_photo_url ? (
                  <img
                    src={profile.profile_photo_url}
                    alt={getFullName()}
                    className="profile-avatar-img"
                  />
                ) : (
                  <div className="profile-avatar-initials">
                    {getInitials()}
                  </div>
                )}

                {/* Upload Camera Overlay in Edit Mode */}
                {editing && (
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
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="btn-profile-primary"
                    aria-label="Edit Profile Details"
                  >
                    <Pencil size={15} />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setEditing(false)}
                      className="btn-profile-secondary"
                    >
                      Cancel
                    </button>
                    {profile.profile_photo_url && (
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
                <span className="profile-role-pill role-pill-employee">
                  <User size={13} />
                  <span>EMPLOYEE</span>
                </span>
                <span className="profile-code-tag">
                  <BadgeCheck size={13} />
                  <span>{profile.employee_code || "EMP001"}</span>
                </span>
                {renderStatusBadge(profile.employment_status || "ACTIVE")}
              </div>
            </div>
          </div>
        </div>

        {!editing ? (
          <>
            {/* QUICK INFO STATS CARDS */}
            <div className="profile-stats-grid">
              <div className="profile-stat-card">
                <div className="stat-icon-wrapper">
                  <BadgeCheck size={20} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Employee Code</span>
                  <span className="stat-value">{profile.employee_code || "N/A"}</span>
                </div>
              </div>

              <div className="profile-stat-card">
                <div className="stat-icon-wrapper">
                  <Calendar size={20} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Joining Date</span>
                  <span className="stat-value">
                    {profile.joining_date ? profile.joining_date : "Not Provided"}
                  </span>
                </div>
              </div>

              <div className="profile-stat-card">
                <div className="stat-icon-wrapper">
                  <CheckCircle2 size={20} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Employment Status</span>
                  <span className="stat-value">{profile.employment_status || "ACTIVE"}</span>
                </div>
              </div>

              <div className="profile-stat-card">
                <div className="stat-icon-wrapper">
                  <ShieldCheck size={20} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">System Role</span>
                  <span className="stat-value">EMPLOYEE</span>
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
                    <span className="info-field-value">{profile.email}</span>
                  </div>

                  <div className="info-field-item">
                    <span className="info-field-label">
                      <Phone size={13} className="info-field-icon" />
                      <span>Phone Number</span>
                    </span>
                    <span className="info-field-value">
                      {profile.phone ? (
                        profile.phone
                      ) : (
                        <span className="info-field-empty">Not Provided</span>
                      )}
                    </span>
                  </div>

                  <div className="info-field-item">
                    <span className="info-field-label">
                      <MapPin size={13} className="info-field-icon" />
                      <span>Residential Address</span>
                    </span>
                    <span className="info-field-value">
                      {profile.address ? (
                        profile.address
                      ) : (
                        <span className="info-field-empty">Not Provided</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Personal & Employment Information */}
              <div className="profile-info-card">
                <div className="info-card-header">
                  <h3 className="info-card-title">
                    <User size={18} className="info-card-title-icon" />
                    <span>Personal & Employment Info</span>
                  </h3>
                </div>
                <div className="info-card-fields">
                  <div className="info-field-item">
                    <span className="info-field-label">
                      <Calendar size={13} className="info-field-icon" />
                      <span>Date of Birth</span>
                    </span>
                    <span className="info-field-value">
                      {profile.date_of_birth ? (
                        profile.date_of_birth
                      ) : (
                        <span className="info-field-empty">Not Provided</span>
                      )}
                    </span>
                  </div>

                  <div className="info-field-item">
                    <span className="info-field-label">
                      <Calendar size={13} className="info-field-icon" />
                      <span>Joining Date</span>
                    </span>
                    <span className="info-field-value">
                      {profile.joining_date ? (
                        profile.joining_date
                      ) : (
                        <span className="info-field-empty">Not Provided</span>
                      )}
                    </span>
                  </div>

                  <div className="info-field-item">
                    <span className="info-field-label">
                      <CheckCircle2 size={13} className="info-field-icon" />
                      <span>Employment Status</span>
                    </span>
                    <div style={{ marginTop: "0.15rem" }}>
                      {renderStatusBadge(profile.employment_status || "ACTIVE")}
                    </div>
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
              <span>Update Contact Information</span>
            </h2>

            <form onSubmit={handleUpdateSelf}>
              <div className="profile-form-group" style={{ marginBottom: "1.25rem" }}>
                <label className="profile-form-label">
                  <Phone size={14} />
                  <span>Phone Number</span>
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="profile-form-input"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="profile-form-group" style={{ marginBottom: "1.25rem" }}>
                <label className="profile-form-label">
                  <MapPin size={14} />
                  <span>Residential Address</span>
                </label>
                <textarea
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="profile-form-textarea"
                  placeholder="Enter your current residential address"
                />
              </div>

              <div className="profile-form-grid-2" style={{ opacity: 0.85 }}>
                <div className="profile-form-group">
                  <label className="profile-form-label">
                    <span>Email Address (Read Only)</span>
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="profile-form-input profile-form-input-disabled"
                  />
                </div>

                <div className="profile-form-group">
                  <label className="profile-form-label">
                    <span>Employee Code (Read Only)</span>
                  </label>
                  <input
                    type="text"
                    value={profile.employee_code || "EMP001"}
                    disabled
                    className="profile-form-input profile-form-input-disabled"
                  />
                </div>
              </div>

              <div className="profile-form-actions">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
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
