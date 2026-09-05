import React, { useState, useEffect } from "react";
import { X, Megaphone, Folder, Calendar, AlertCircle, Send, Save } from "lucide-react";
import Button from "../../shared/components/Button";

const ANNOUNCEMENT_TYPES = [
  { value: "GENERAL", label: "General Announcement" },
  { value: "COMPANY_UPDATE", label: "Company Update" },
  { value: "HR_NOTICE", label: "HR Notice" },
  { value: "HOLIDAY", label: "Holiday" },
  { value: "SALARY", label: "Salary / Payroll Notice" },
];

const PRIORITIES = [
  { value: "NORMAL", label: "Normal", color: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200" },
  { value: "IMPORTANT", label: "Important", color: "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300" },
  { value: "URGENT", label: "Urgent", color: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300" },
];

const AnnouncementFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  selectedProject = null, // If passed, scope is PROJECT and pre-associated
  editingAnnouncement = null, // If editing existing
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    announcement_type: "GENERAL",
    priority: "NORMAL",
    announcement_scope: "COMPANY",
    expires_at: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingAnnouncement) {
      setFormData({
        title: editingAnnouncement.title || "",
        content: editingAnnouncement.content || "",
        announcement_type: editingAnnouncement.announcement_type || "GENERAL",
        priority: editingAnnouncement.priority || "NORMAL",
        announcement_scope: editingAnnouncement.announcement_scope || "COMPANY",
        expires_at: editingAnnouncement.expires_at
          ? new Date(editingAnnouncement.expires_at).toISOString().slice(0, 16)
          : "",
      });
    } else if (selectedProject) {
      setFormData({
        title: "",
        content: "",
        announcement_type: "GENERAL",
        priority: "NORMAL",
        announcement_scope: "PROJECT",
        expires_at: "",
      });
    } else {
      setFormData({
        title: "",
        content: "",
        announcement_type: "GENERAL",
        priority: "NORMAL",
        announcement_scope: "COMPANY",
        expires_at: "",
      });
    }
    setErrors({});
  }, [isOpen, selectedProject, editingAnnouncement]);

  if (!isOpen) return null;

  const isProjectScope = selectedProject || formData.announcement_scope === "PROJECT";

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = "Title is required.";
    if (!formData.content.trim()) errs.content = "Message content is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (publishNow) => {
    if (!validate()) return;

    const payload = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      announcement_type: formData.announcement_type,
      priority: formData.priority,
      announcement_scope: isProjectScope ? "PROJECT" : "COMPANY",
      project_id: isProjectScope ? (selectedProject ? selectedProject.id : editingAnnouncement?.project_id) : null,
      expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
      publish_now: publishNow,
    };

    onSubmit(payload, editingAnnouncement?.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${isProjectScope ? "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" : "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"}`}>
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingAnnouncement ? "Edit Announcement" : isProjectScope ? "Make Project Announcement" : "Create Company Announcement"}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isProjectScope ? "Targeted to active project team members only" : "Visible to all active employees company-wide"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 hrms-custom-scrollbar">
          {/* Selected Project Summary Card */}
          {selectedProject && (
            <div className="p-3.5 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/20 text-gray-900 dark:text-gray-100 space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
                <Folder className="w-4 h-4" />
                <span>ASSOCIATED PROJECT</span>
              </div>
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-base font-bold text-gray-900 dark:text-white">
                  {selectedProject.name}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300">
                  {selectedProject.project_code}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {selectedProject.member_count} active team member{selectedProject.member_count !== 1 ? "s" : ""} will receive this announcement.
              </p>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              Announcement Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="e.g. Q3 Town Hall Scheduled / Sprint Release Notes"
              className={`w-full px-3.5 py-2.5 text-sm bg-white dark:bg-gray-900 border ${errors.title ? "border-red-500" : "border-gray-300 dark:border-gray-600"} rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white`}
            />
            {errors.title && <p className="text-xs text-red-500 mt-0.5">{errors.title}</p>}
          </div>

          {/* Type & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Type */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Announcement Type
              </label>
              <select
                value={formData.announcement_type}
                onChange={(e) => handleChange("announcement_type", e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
              >
                {ANNOUNCEMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Priority Level
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleChange("priority", e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional Expiry Date */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center justify-between">
              <span>Optional Expiry Date & Time</span>
              <span className="text-gray-400 font-normal">Leave blank if no expiry</span>
            </label>
            <input
              type="datetime-local"
              value={formData.expires_at}
              onChange={(e) => handleChange("expires_at", e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
            />
          </div>

          {/* Content / Message */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              Message Content <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={6}
              value={formData.content}
              onChange={(e) => handleChange("content", e.target.value)}
              placeholder="Write announcement details here..."
              className={`w-full p-3.5 text-sm bg-white dark:bg-gray-900 border ${errors.content ? "border-red-500" : "border-gray-300 dark:border-gray-600"} rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white resize-y`}
            />
            {errors.content && <p className="text-xs text-red-500 mt-0.5">{errors.content}</p>}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 flex flex-wrap items-center justify-between gap-3">
          <Button variant="secondary" size="md" onClick={onClose} disabled={loading}>
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            {!editingAnnouncement && (
              <Button
                variant="outline"
                size="md"
                onClick={() => handleSubmit(false)}
                disabled={loading}
                className="flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                Save as Draft
              </Button>
            )}

            <Button
              variant="primary"
              size="md"
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              {editingAnnouncement ? "Save Changes" : "Publish Announcement"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementFormModal;
