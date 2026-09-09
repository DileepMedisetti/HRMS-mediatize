import React, { useState, useEffect, useCallback } from "react";
import {
  Megaphone,
  Search,
  CheckCircle2,
  Bell,
  Calendar,
  AlertCircle,
  Clock,
  ChevronRight,
  RefreshCw,
  Folder,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  getEmployeeAnnouncements,
  markAnnouncementAsRead,
} from "../services/announcementApi";
import Button from "../../shared/components/Button";
import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import Pagination from "../../shared/components/Pagination";
import AnnouncementDetailModal from "./AnnouncementDetailModal";

const EmployeeAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("ALL"); // ALL, UNREAD, COMPANY, PROJECT
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 15, search: search.trim() || undefined };
      if (filter === "UNREAD") params.unread_only = true;
      if (filter === "COMPANY") params.scope = "COMPANY";
      if (filter === "PROJECT") params.scope = "PROJECT";

      const res = await getEmployeeAnnouncements(params);
      setAnnouncements(res.data.items || []);
      setUnreadCount(res.data.unread_count || 0);
      setTotalPages(res.data.total_pages || 1);
      setTotalItems(res.data.total || 0);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load announcements.");
      toast.error("Failed to load announcements feed");
    } finally {
      setLoading(false);
    }
  }, [page, filter, search]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  const handleOpenDetail = async (announcement) => {
    setSelectedAnnouncement(announcement);

    // If unread, mark as read on demand
    if (!announcement.is_read) {
      try {
        await markAnnouncementAsRead(announcement.id);
        setAnnouncements((prev) =>
          prev.map((a) => (a.id === announcement.id ? { ...a, is_read: true } : a))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        // Silent fail or non-blocking
      }
    }
  };

  return (
    <AppLayout title="Announcements">
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-w-0">
        {/* Back to Dashboard Button */}
        <BackToDashboard role="EMPLOYEE" />
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--primary-color)" }}>
            <Megaphone className="w-4 h-4 shrink-0" />
            <span>EMPLOYEE UPDATES</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Announcements
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Stay informed with official company news and project-specific updates.
          </p>
        </div>

        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold shrink-0">
            <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-bounce" />
            <span>{unreadCount} Unread Announcement{unreadCount !== 1 ? "s" : ""}</span>
          </div>
        )}
      </div>

      {/* Tabs & Search Container */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 min-w-0">
        {/* Navigation Tabs Scroller */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 min-w-0 flex-1 hrms-custom-scrollbar border-b lg:border-none border-slate-200 dark:border-slate-800">
          {[
            { id: "ALL", label: "All Updates" },
            { id: "UNREAD", label: `Unread (${unreadCount})` },
            { id: "COMPANY", label: "Company Wide" },
            { id: "PROJECT", label: "My Projects" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setFilter(tab.id);
                setPage(1);
              }}
              className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                filter === tab.id
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
            title="Refresh feed"
            aria-label="Refresh feed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Feed Cards List */}
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
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">No announcements available</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {filter === "UNREAD"
              ? "Great job! You have caught up on all announcements."
              : "No active announcements published for this filter."}
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

            return (
              <div
                key={ann.id}
                onClick={() => handleOpenDetail(ann)}
                className={`group relative bg-white dark:bg-slate-900 rounded-xl border p-4 sm:p-5 shadow-xs hover:shadow-md transition-all cursor-pointer ${
                  !ann.is_read
                    ? "border-indigo-400 dark:border-indigo-600/80 bg-indigo-50/30 dark:bg-indigo-950/20"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                {/* Unread Indicator Pill */}
                {!ann.is_read && (
                  <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
                )}

                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center gap-2 pr-6">
                    {/* Scope Tag */}
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        isProject
                          ? "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                          : "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                      }`}
                    >
                      {isProject ? `PROJECT • ${ann.project_code || "PRJ"}` : "COMPANY-WIDE"}
                    </span>

                    {/* Priority Badge */}
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${priorityBadgeClass}`}>
                      {ann.priority}
                    </span>

                    {/* Type Tag */}
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {ann.announcement_type}
                    </span>
                  </div>

                  {/* Title & Preview */}
                  <div>
                    <h3 className={`text-base sm:text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors ${
                      !ann.is_read ? "text-slate-900 dark:text-slate-100 font-extrabold" : "text-slate-800 dark:text-slate-200 font-semibold"
                    }`}>
                      {ann.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mt-1">
                      {ann.content}
                    </p>
                  </div>

                  {/* Footer Meta */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Published: {ann.published_at ? new Date(ann.published_at).toLocaleDateString() : "Today"}
                      </span>
                      {ann.creator_name && (
                        <span>By {ann.creator_name}</span>
                      )}
                    </div>

                    <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                      Read full update <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            onPrevious={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
        </div>
      )}

      {/* Detail Modal */}
      <AnnouncementDetailModal
        isOpen={!!selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
        announcement={selectedAnnouncement}
      />
    </div>
  </AppLayout>
  );
};

export default EmployeeAnnouncements;
