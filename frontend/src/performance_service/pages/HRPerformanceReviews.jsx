import React, { useState, useEffect, useCallback } from "react";
import {
  Award,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  CheckCircle2,
  Star,
  RefreshCw,
  X,
} from "lucide-react";
import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import Pagination from "../../shared/components/Pagination";
import {
  getAllPerformanceReviews,
  createPerformanceReview,
  updatePerformanceReview,
  completePerformanceReview,
} from "../services/performanceApi";
import { getEmployees } from "../../employee_service/services/employeeApi";
import { showSuccess, showError } from "../../shared/utils/toast";

const DEFAULT_CATEGORIES = [
  "Technical Skills",
  "Work Quality",
  "Task Completion",
  "Problem Solving",
  "Communication",
  "Teamwork",
  "Project Contribution",
  "Initiative",
];

function HRPerformanceReviews() {
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [viewingReview, setViewingReview] = useState(null);

  // Form State
  const [formEmployeeId, setFormEmployeeId] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formFeedback, setFormFeedback] = useState("");
  const [categoryRatings, setCategoryRatings] = useState(
    DEFAULT_CATEGORIES.map((cat) => ({ category: cat, rating: 3, comments: "" }))
  );
  const [submitting, setSubmitting] = useState(false);

  // Load employees for selector
  useEffect(() => {
    async function loadEmployees() {
      try {
        const res = await getEmployees({ limit: 100 });
        setEmployees(res.data?.items || []);
      } catch (err) {
        console.error("Failed to load employees list", err);
      }
    }
    loadEmployees();
  }, []);

  // Fetch performance reviews
  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 15,
        status: selectedStatus || undefined,
        employee_id: selectedEmployeeId ? Number(selectedEmployeeId) : undefined,
      };
      const res = await getAllPerformanceReviews(params);
      setReviews(res.data?.items || []);
      setTotalPages(res.data?.total_pages || 1);
      setTotalItems(res.data?.total || 0);
    } catch (err) {
      console.error("Failed to fetch performance reviews", err);
      showError("Unable to load performance reviews.");
    } finally {
      setLoading(false);
    }
  }, [page, selectedStatus, selectedEmployeeId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  // Open Create Modal
  const openCreateModal = () => {
    setEditingReview(null);
    setFormEmployeeId(employees[0]?.id || "");
    setFormStartDate("");
    setFormEndDate("");
    setFormFeedback("");
    setCategoryRatings(DEFAULT_CATEGORIES.map((cat) => ({ category: cat, rating: 3, comments: "" })));
    setShowCreateModal(true);
  };

  // Open Edit Modal for Draft Review
  const openEditModal = (review) => {
    setEditingReview(review);
    setFormEmployeeId(review.employee_id);
    setFormStartDate(review.review_start_date);
    setFormEndDate(review.review_end_date);
    setFormFeedback(review.overall_feedback || "");
    
    // Map existing ratings or fill missing categories
    const existingMap = new Map(review.ratings.map((r) => [r.category, r]));
    const mapped = DEFAULT_CATEGORIES.map((cat) => {
      const found = existingMap.get(cat);
      return {
        category: cat,
        rating: found ? found.rating : 3,
        comments: found ? found.comments || "" : "",
      };
    });
    setCategoryRatings(mapped);
    setShowCreateModal(true);
  };

  const handleRatingChange = (idx, rating) => {
    const next = [...categoryRatings];
    next[idx].rating = rating;
    setCategoryRatings(next);
  };

  const handleCommentChange = (idx, comments) => {
    const next = [...categoryRatings];
    next[idx].comments = comments;
    setCategoryRatings(next);
  };

  // Save Review (Draft or Immediate Complete)
  const handleSaveReview = async (shouldComplete = false) => {
    if (!formEmployeeId) {
      showError("Please select an employee.");
      return;
    }
    if (!formStartDate || !formEndDate) {
      showError("Please select review start and end dates.");
      return;
    }
    if (new Date(formStartDate) > new Date(formEndDate)) {
      showError("Review start date must be on or before end date.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        employee_id: Number(formEmployeeId),
        review_start_date: formStartDate,
        review_end_date: formEndDate,
        overall_feedback: formFeedback,
        ratings: categoryRatings,
      };

      let savedReview;
      if (editingReview) {
        const res = await updatePerformanceReview(editingReview.id, {
          review_start_date: formStartDate,
          review_end_date: formEndDate,
          overall_feedback: formFeedback,
          ratings: categoryRatings,
        });
        savedReview = res.data;
        showSuccess("Draft performance review updated.");
      } else {
        const res = await createPerformanceReview(payload);
        savedReview = res.data;
        showSuccess("Draft performance review created.");
      }

      // If user clicked "Complete Evaluation"
      if (shouldComplete && savedReview) {
        await completePerformanceReview(savedReview.id);
        showSuccess("Performance evaluation completed successfully!");
      }

      setShowCreateModal(false);
      fetchReviews();
    } catch (err) {
      console.error("Failed to save performance review", err);
      showError(err.response?.data?.detail || "Unable to save performance review.");
    } finally {
      setSubmitting(false);
    }
  };

  // Direct Complete Action from Table
  const handleCompleteReviewDirect = async (reviewId) => {
    try {
      await completePerformanceReview(reviewId);
      showSuccess("Performance review completed successfully!");
      fetchReviews();
    } catch (err) {
      console.error("Failed to complete review", err);
      showError(err.response?.data?.detail || "Unable to complete performance review.");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-800";
      default:
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800";
    }
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <BackToDashboard />

        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Award className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              Employee Performance Reviews
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Create draft evaluations, rate 8 performance categories, and complete formal HR reviews.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Performance Review
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            {/* Filter by Status */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
            >
              <option value="">All Review Statuses</option>
              <option value="DRAFT">DRAFT</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>

            {/* Filter by Employee */}
            <select
              value={selectedEmployeeId}
              onChange={(e) => {
                setSelectedEmployeeId(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
            >
              <option value="">All Employees</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name} ({emp.employee_code})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchReviews}
            className="p-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Reviews Table */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Review Period</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Overall Rating</th>
                  <th className="py-3 px-4">Completed Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500 dark:text-gray-400">
                      Loading performance reviews...
                    </td>
                  </tr>
                ) : reviews.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No performance reviews found matching filters.
                    </td>
                  </tr>
                ) : (
                  reviews.map((rev) => (
                    <tr key={rev.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                      <td className="py-3.5 px-4 font-semibold text-gray-900 dark:text-white">
                        {rev.employee_name} ({rev.employee_code})
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300">
                        {rev.review_start_date} to {rev.review_end_date}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(
                            rev.status
                          )}`}
                        >
                          {rev.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                        {rev.overall_rating ? (
                          <span className="inline-flex items-center gap-1">
                            <Star className="w-4 h-4 fill-current text-amber-500" />
                            {rev.overall_rating.toFixed(1)} / 5.0
                          </span>
                        ) : (
                          "Draft"
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 dark:text-gray-400">
                        {rev.completed_at ? new Date(rev.completed_at).toLocaleDateString() : "-"}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => setViewingReview(rev)}
                          className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 rounded-lg transition"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          View
                        </button>

                        {rev.status === "DRAFT" && (
                          <>
                            <button
                              onClick={() => openEditModal(rev)}
                              className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded-lg transition"
                            >
                              <Edit className="w-3.5 h-3.5 mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleCompleteReviewDirect(rev.id)}
                              className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              Complete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            onPrevious={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
        </div>

        {/* MODAL: CREATE / EDIT PERFORMANCE REVIEW */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col my-auto">
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {editingReview ? "Edit Draft Performance Review" : "Create Performance Review"}
                </h3>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-6 overflow-y-auto">
                {/* Employee & Date Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Employee *
                    </label>
                    <select
                      disabled={!!editingReview}
                      value={formEmployeeId}
                      onChange={(e) => setFormEmployeeId(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                    >
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.first_name} {emp.last_name} ({emp.employee_code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={formStartDate}
                      onChange={(e) => setFormStartDate(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={formEndDate}
                      onChange={(e) => setFormEndDate(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                    />
                  </div>
                </div>

                {/* 8 Category Ratings Selector */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    Evaluation Category Ratings (1 - 5 Scale)
                  </h4>

                  <div className="space-y-3">
                    {categoryRatings.map((item, idx) => (
                      <div
                        key={item.category}
                        className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1 sm:w-1/3">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {item.category}
                          </span>
                        </div>

                        {/* 1-5 Rating Button Selector */}
                        <div className="flex gap-1.5 sm:w-1/3 justify-center">
                          {[1, 2, 3, 4, 5].map((score) => (
                            <button
                              key={score}
                              type="button"
                              onClick={() => handleRatingChange(idx, score)}
                              className={`w-9 h-9 text-xs font-bold rounded-lg border transition ${
                                item.rating === score
                                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              {score}
                            </button>
                          ))}
                        </div>

                        {/* Optional Comment */}
                        <div className="sm:w-1/3">
                          <input
                            type="text"
                            placeholder="Comments (optional)"
                            value={item.comments}
                            onChange={(e) => handleCommentChange(idx, e.target.value)}
                            className="w-full px-3 py-1.5 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Overall Feedback */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Overall HR Feedback & Comments
                  </label>
                  <textarea
                    rows={4}
                    value={formFeedback}
                    onChange={(e) => setFormFeedback(e.target.value)}
                    placeholder="Enter comprehensive evaluation summary and recommendations..."
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSaveReview(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-800 dark:text-white bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSaveReview(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save & Complete Evaluation"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: VIEW REVIEW DETAILS */}
        {viewingReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col my-auto">
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {viewingReview.employee_name} ({viewingReview.employee_code})
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Period: {viewingReview.review_start_date} to {viewingReview.review_end_date}
                  </p>
                </div>
                <button onClick={() => setViewingReview(null)} className="text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-6 overflow-y-auto">
                <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-indigo-700 dark:text-indigo-300 font-semibold uppercase tracking-wider">
                      Overall Rating
                    </span>
                    <p className="text-2xl font-extrabold text-indigo-900 dark:text-indigo-100 mt-1">
                      {viewingReview.overall_rating ? `${viewingReview.overall_rating.toFixed(1)} / 5.0` : "Draft (Pending)"}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(
                      viewingReview.status
                    )}`}
                  >
                    {viewingReview.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {viewingReview.ratings.map((r) => (
                    <div
                      key={r.id}
                      className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                          {r.category}
                        </span>
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {r.rating} / 5
                        </span>
                      </div>
                      {r.comments && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                          "{r.comments}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {viewingReview.overall_feedback && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                      HR Feedback
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                      {viewingReview.overall_feedback}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-right">
                <button
                  onClick={() => setViewingReview(null)}
                  className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default HRPerformanceReviews;
