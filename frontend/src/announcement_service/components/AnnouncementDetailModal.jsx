import React from "react";
import { X, Calendar, User, Folder, Clock, CheckCircle2, Eye, ShieldAlert } from "lucide-react";
import Button from "../../shared/components/Button";

const AnnouncementDetailModal = ({ isOpen, onClose, announcement }) => {
  if (!isOpen || !announcement) return null;

  const isProjectScope = announcement.announcement_scope === "PROJECT";
  const priorityColor =
    announcement.priority === "URGENT"
      ? "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800"
      : announcement.priority === "IMPORTANT"
      ? "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800"
      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {/* Scope Badge */}
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                    isProjectScope
                      ? "bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                      : "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                  }`}
                >
                  {isProjectScope ? `PROJECT • ${announcement.project_code || "PRJ"}` : "COMPANY-WIDE"}
                </span>

                {/* Priority Badge */}
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${priorityColor}`}>
                  {announcement.priority}
                </span>

                {/* Type Tag */}
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                  {announcement.announcement_type}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                {announcement.title}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0"
              aria-label="Close details modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Meta Bar */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200/60 dark:border-gray-700/60 mt-3">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-gray-400" />
              <span>Posted by <strong>{announcement.creator_name || "HR Admin"}</strong></span>
            </span>

            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>
                Published: {announcement.published_at ? new Date(announcement.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Draft"}
              </span>
            </span>

            {announcement.expires_at && (
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Expires: {new Date(announcement.expires_at).toLocaleDateString()}</span>
              </span>
            )}

            {announcement.read_count !== null && announcement.read_count !== undefined && (
              <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
                <Eye className="w-3.5 h-3.5" />
                <span>{announcement.read_count} employee read{announcement.read_count !== 1 ? "s" : ""}</span>
              </span>
            )}
          </div>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 hrms-custom-scrollbar space-y-4 text-gray-800 dark:text-gray-200 text-sm leading-relaxed whitespace-pre-line">
          {isProjectScope && announcement.project_name && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700/80 text-xs">
              <Folder className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>
                This announcement is targeted exclusively to members of <strong>{announcement.project_name}</strong> ({announcement.project_code}).
              </span>
            </div>
          )}

          <div className="prose dark:prose-invert max-w-none">
            {announcement.content}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>Marked as Read</span>
          </div>

          <Button variant="secondary" size="md" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementDetailModal;
