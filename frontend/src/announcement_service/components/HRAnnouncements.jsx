import React, { useState, useEffect, useCallback } from "react";
import {
  Megaphone,
  Plus,
  Folder,
  Search,
  Filter,
  Eye,
  Edit,
  Send,
  Archive,
  RefreshCw,
  Calendar,
  AlertCircle,
  Clock,
  Layers,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  getHRAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  publishAnnouncement,
  archiveAnnouncement,
} from "../services/announcementApi";
import Button from "../../shared/components/Button";
import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import Pagination from "../../shared/components/Pagination";
import ProjectSearchModal from "./ProjectSearchModal";
import AnnouncementFormModal from "./AnnouncementFormModal";
import AnnouncementDetailModal from "./AnnouncementDetailModal";

const HRAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("ALL"); // ALL, COMPANY, PROJECT, DRAFT, PUBLISHED, ARCHIVED
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modals state
  const [isProjectSearchOpen, setIsProjectSearchOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [viewingAnnouncement, setViewingAnnouncement] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 15, search: search.trim() || undefined };
      if (activeTab === "COMPANY") params.scope = "COMPANY";
      if (activeTab === "PROJECT") params.scope = "PROJECT";
      if (activeTab === "DRAFT") params.status = "DRAFT";
      if (activeTab === "PUBLISHED") params.status = "PUBLISHED";
      if (activeTab === "ARCHIVED") params.status = "ARCHIVED";

      const res = await getHRAnnouncements(params);
      setAnnouncements(res.data.items || []);
      setTotalPages(res.data.total_pages || 1);
      setTotalItems(res.data.total || 0);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load announcements.");
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  }, [page, activeTab, search]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  const handleOpenCompanyCreate = () => {
    setSelectedProject(null);
    setEditingAnnouncement(null);
    setIsFormOpen(true);
  };

  const handleProjectSelect = (proj) => {
    setIsProjectSearchOpen(false);
    setSelectedProject(proj);
    setEditingAnnouncement(null);
    setIsFormOpen(true);
  };

  const handleEdit = (announcement) => {
    setSelectedProject(null);
    setEditingAnnouncement(announcement);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (payload, announcementId) => {
    setSubmitting(true);
    try {
      if (announcementId) {
        await updateAnnouncement(announcementId, {
          title: payload.title,
          content: payload.content,
          announcement_type: payload.announcement_type,
          priority: payload.priority,
          expires_at: payload.expires_at,
        });
        toast.success("Announcement updated successfully.");
      } else {
        await createAnnouncement(payload);
        toast.success(
          payload.publish_now
            ? "Announcement published successfully!"
            : "Announcement saved as draft."
        );
      }
      setIsFormOpen(false);
      setSelectedProject(null);
      setEditingAnnouncement(null);
      fetchAnnouncements();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to save announcement.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async (id) => {
    try {
      await publishAnnouncement(id);
      toast.success("Announcement published successfully.");
      fetchAnnouncements();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to publish announcement.");
    }
  };

  const handleArchive = async (id) => {
    try {
      await archiveAnnouncement(id);
      toast.success("Announcement archived.");
      fetchAnnouncements();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to archive announcement.");
    }
  };

  return (
    <AppLayout title="Announcements Management">
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-w-0">
        {/* Back to Dashboard Button */}
        <BackToDashboard role="HR" />

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1 text-indigo-600 dark:text-indigo-400">
              <Megaphone className="w-4 h-4 shrink-0" />
              <span>COMMUNICATION CENTER</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Announcements Management
            </h1>
            <p className="text-sm mt-1 text-slate-600 dark:text-slate-300">
              Create, publish, and target company-wide or project-specific announcements.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-1">
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsProjectSearchOpen(true)}
              className="flex items-center gap-2 text-xs sm:text-sm font-medium"
            >
              <Folder className="w-4 h-4 text-amber-500 shrink-0" />
              Project Announcement
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={handleOpenCompanyCreate}
              className="flex items-center gap-2 text-xs sm:text-sm font-semibold"
            >
              <Plus className="w-4 h-4 shrink-0" />
              Company Announcement
            </Button>
          </div>
        </div>

      {/* Tabs & Search Bar Container */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 min-w-0">
        {/* Navigation Tabs Scroller */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 min-w-0 flex-1 hrms-custom-scrollbar border-b lg:border-none border-slate-200 dark:border-slate-800">
          {[
            { id: "ALL", label: "All" },
            { id: "COMPANY", label: "Company Scope" },
            { id: "PROJECT", label: "Project Scope" },
            { id: "DRAFT", label: "Drafts" },
            { id: "PUBLISHED", label: "Published" },
            { id: "ARCHIVED", label: "Archived" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setPage(1);
              }}
              className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white font-semibold shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search announcements..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400"
            />
          </div>

          <button
            onClick={fetchAnnouncements}
            className="p-2.5 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shrink-0"
            title="Refresh announcements"
            aria-label="Refresh announcements"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main List / Table */}
      {loading ? (
        <div className="space-y-4 py-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 bg-slate-100 dark:bg-slate-800/60 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8">
          <Megaphone className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">No announcements found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {search
              ? "No matching announcements found. Try clearing your search query."
              : "No announcements created under this tab filter yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => {
            const isProject = ann.announcement_scope === "PROJECT";
            const priorityBadgeClass =
              ann.priority === "URGENT"
                ? "bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800"
                : ann.priority === "IMPORTANT"
                ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";

            const statusBadgeClass =
              ann.status === "PUBLISHED"
                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800"
                : ann.status === "DRAFT"
                ? "bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-200 border-sky-200 dark:border-sky-800"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700";

            return (
              <div
                key={ann.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all space-y-3"
              >
                {/* Card Top Row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Scope Badge */}
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        isProject
                          ? "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                          : "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                      }`}
                    >
                      {isProject ? `PROJECT • ${ann.project_code || "PRJ"}` : "COMPANY-WIDE"}
                    </span>

                    {/* Priority Badge */}
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${priorityBadgeClass}`}>
                      {ann.priority}
                    </span>

                    {/* Status Badge */}
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${statusBadgeClass}`}>
                      {ann.status}
                    </span>
                  </div>

                  {/* Read Count Badge */}
                  {ann.read_count !== null && (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-900/40">
                      <Eye className="w-3.5 h-3.5" />
                      <span><strong>{ann.read_count}</strong> read{ann.read_count !== 1 ? "s" : ""}</span>
                    </span>
                  )}
                </div>

                {/* Title & Preview */}
                <div>
                  <h3
                    onClick={() => setViewingAnnouncement(ann)}
                    className="text-base sm:text-lg font-bold cursor-pointer transition-colors hover:opacity-80"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {ann.title}
                  </h3>
                  <p className="text-xs sm:text-sm line-clamp-2 mt-1" style={{ color: "var(--text-secondary)" }}>
                    {ann.content}
                  </p>
                </div>

                {/* Footer Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {ann.published_at ? new Date(ann.published_at).toLocaleDateString() : "Not published"}
                    </span>
                    {ann.expires_at && (
                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                        <Clock className="w-3.5 h-3.5" />
                        Expires: {new Date(ann.expires_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingAnnouncement(ann)}
                      className="px-2.5 py-1 text-xs"
                    >
                      View
                    </Button>

                    {ann.status !== "ARCHIVED" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(ann)}
                        className="px-2.5 py-1 text-xs"
                      >
                        <Edit className="w-3.5 h-3.5 mr-1" />
                        Edit
                      </Button>
                    )}

                    {ann.status === "DRAFT" && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handlePublish(ann.id)}
                        className="px-2.5 py-1 text-xs"
                      >
                        <Send className="w-3.5 h-3.5 mr-1" />
                        Publish
                      </Button>
                    )}

                    {ann.status !== "ARCHIVED" && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleArchive(ann.id)}
                        className="px-2.5 py-1 text-xs"
                      >
                        <Archive className="w-3.5 h-3.5 mr-1" />
                        Archive
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination Controls */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            onPrevious={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
        </div>
      )}

      {/* Project Search Modal */}
      <ProjectSearchModal
        isOpen={isProjectSearchOpen}
        onClose={() => setIsProjectSearchOpen(false)}
        onSelectProject={handleProjectSelect}
      />

      {/* Form Modal */}
      <AnnouncementFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedProject(null);
          setEditingAnnouncement(null);
        }}
        onSubmit={handleFormSubmit}
        selectedProject={selectedProject}
        editingAnnouncement={editingAnnouncement}
        loading={submitting}
      />

      {/* Detail Modal */}
      <AnnouncementDetailModal
        isOpen={!!viewingAnnouncement}
        onClose={() => setViewingAnnouncement(null)}
        announcement={viewingAnnouncement}
      />
    </div>
  </AppLayout>
  );
};

export default HRAnnouncements;
