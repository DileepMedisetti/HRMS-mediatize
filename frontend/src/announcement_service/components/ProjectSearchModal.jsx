import React, { useState, useEffect } from "react";
import { Search, X, Users, Folder, AlertCircle } from "lucide-react";
import { searchProjectsForAnnouncement } from "../services/announcementApi";
import Button from "../../shared/components/Button";

const ProjectSearchModal = ({ isOpen, onClose, onSelectProject }) => {
  const [search, setSearch] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchProjects("");
    } else {
      setSearch("");
      setProjects([]);
      setError(null);
    }
  }, [isOpen]);

  const fetchProjects = async (searchTerm) => {
    setLoading(true);
    setError(null);
    try {
      const res = await searchProjectsForAnnouncement({ search: searchTerm });
      setProjects(res.data || []);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to search projects.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearch(term);
    fetchProjects(term);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-search-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <h2 id="project-search-title" className="text-lg font-bold text-gray-900 dark:text-white">
                Select Project for Announcement
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Search and choose a project to target announcement only to its active team members.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-800">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by project name or project code (e.g. PRJ001)..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white placeholder-gray-400"
              autoFocus
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  fetchProjects("");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Project Results List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 min-h-0 hrms-custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-2">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Searching projects...</p>
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <Folder className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No projects found</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Try refining your search by project name or code.
              </p>
            </div>
          ) : (
            projects.map((proj) => (
              <div
                key={proj.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700/80 bg-white dark:bg-gray-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md transition-all gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {proj.project_code}
                    </span>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      {proj.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      <strong>{proj.member_count}</strong> active member{proj.member_count !== 1 ? "s" : ""}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                      {proj.status}
                    </span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onSelectProject(proj)}
                  className="w-full sm:w-auto shrink-0"
                >
                  Make Announcement
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 flex justify-end">
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectSearchModal;
