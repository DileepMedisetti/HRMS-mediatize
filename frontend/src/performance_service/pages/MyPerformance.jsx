import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  Target,
  Briefcase,
  FileText,
  Calendar,
  Clock,
  Star,
  Eye,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowRight,
} from "lucide-react";
import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import {
  getMyPerformanceSummary,
  getMyPerformanceReviews,
  getMyGoals,
  updateMyGoalStatus,
} from "../services/performanceApi";
import { showSuccess, showError } from "../../shared/utils/toast";

function MyPerformance() {
  const [summary, setSummary] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState("overview");

  // Modals
  const [selectedReview, setSelectedReview] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [goalStatusInput, setGoalStatusInput] = useState("IN_PROGRESS");
  const [goalProgressInput, setGoalProgressInput] = useState(0);
  const [updatingGoal, setUpdatingGoal] = useState(false);

  // Pagination for reviews & goals
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewTotalPages, setReviewTotalPages] = useState(1);

  // Fetch performance data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, revRes, goalRes] = await Promise.all([
        getMyPerformanceSummary(),
        getMyPerformanceReviews({ page: reviewPage, limit: 5 }),
        getMyGoals({ page: 1, limit: 10 }),
      ]);
      setSummary(sumRes.data);
      setReviews(revRes.data?.items || []);
      setReviewTotalPages(revRes.data?.total_pages || 1);
      setGoals(goalRes.data?.items || []);
    } catch (err) {
      console.error("Failed to fetch performance data", err);
      showError("Unable to load performance overview.");
    } finally {
      setLoading(false);
    }
  }, [reviewPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Goal Status Update
  const handleUpdateGoalStatus = async (e) => {
    e.preventDefault();
    if (!selectedGoal) return;
    setUpdatingGoal(true);
    try {
      await updateMyGoalStatus(selectedGoal.id, {
        status: goalStatusInput,
        progress_percentage: Number(goalProgressInput),
      });
      showSuccess("Goal status updated successfully.");
      setSelectedGoal(null);
      fetchData();
    } catch (err) {
      console.error("Failed to update goal status", err);
      showError("Unable to update goal status.");
    } finally {
      setUpdatingGoal(false);
    }
  };

  const openGoalModal = (goal) => {
    setSelectedGoal(goal);
    setGoalStatusInput(goal.status);
    setGoalProgressInput(goal.progress_percentage || 0);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700";
      default:
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800";
    }
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <BackToDashboard />

        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Award className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              My Performance & Analytics
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              View your performance ratings, assigned goals, and operational contribution metrics.
            </p>
          </div>
          <button
            onClick={fetchData}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Summary KPI Cards */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Latest Rating */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-800/50 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                  Latest Rating
                </span>
                <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-sm">
                  <Star className="w-5 h-5 fill-current" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  {summary.latest_rating ? `${summary.latest_rating.toFixed(1)}` : "N/A"}
                </span>
                {summary.latest_rating && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">/ 5.0</span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {summary.completed_reviews_count} completed HR evaluation(s)
              </p>
            </div>

            {/* Goals */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Active Goals
                </span>
                <div className="p-2 bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 rounded-lg">
                  <Target className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  {summary.active_goals_count}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">active</span>
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {summary.completed_goals_count} goals completed
              </p>
            </div>

            {/* Projects */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Projects Assigned
                </span>
                <div className="p-2 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 rounded-lg">
                  <Briefcase className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  {summary.projects.assigned}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">total</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {summary.projects.active} active | {summary.projects.completed} completed
              </p>
            </div>

            {/* Work Reports */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Work Reports
                </span>
                <div className="p-2 bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400 rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  {summary.work_reports.submitted}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">submitted</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {summary.work_reports.submitted_this_month} submitted this month
              </p>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-800 flex gap-4 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-2 px-4 text-sm font-semibold border-b-2 whitespace-nowrap transition ${
              activeTab === "overview"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Overview & Context
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`py-2 px-4 text-sm font-semibold border-b-2 whitespace-nowrap transition ${
              activeTab === "reviews"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Performance Reviews ({reviews.length})
          </button>
          <button
            onClick={() => setActiveTab("goals")}
            className={`py-2 px-4 text-sm font-semibold border-b-2 whitespace-nowrap transition ${
              activeTab === "goals"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Goals & KPIs ({goals.length})
          </button>
        </div>

        {/* TAB 1: OVERVIEW & CONTEXT */}
        {activeTab === "overview" && summary && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Operational Context: Attendance & Leave */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Attendance & Leave Context
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Operational data shown strictly as context. Approved leave does not reduce performance ratings.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Present Days</span>
                  {summary.attendance.working_days > 0 ? (
                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                      {summary.attendance.present_days} / {summary.attendance.working_days}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 dark:text-gray-500 italic mt-1">
                      No attendance data
                    </p>
                  )}
                  <span className="text-xs text-amber-600 dark:text-amber-400 mt-1 block">
                    {summary.attendance.late_days} late punch(es)
                  </span>
                </div>


                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Approved Leave</span>
                  <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                    {summary.leave.approved_days} days
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                    {summary.leave.pending_requests} pending request(s)
                  </span>
                </div>
              </div>
            </div>

            {/* Operational Context: Projects & Work Reports */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Work Output Context
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Summary of active projects and daily work report submissions.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Active Projects</span>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {summary.projects.active}
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                    {summary.projects.completed} completed project(s)
                  </span>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Work Reports</span>
                  <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                    {summary.work_reports.submitted_this_month}
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                    submitted this month
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PERFORMANCE REVIEWS TABLE */}
        {activeTab === "reviews" && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Completed HR Evaluations
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/50 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                    <th className="py-3 px-4">Review Period</th>
                    <th className="py-3 px-4">Overall Rating</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Completed Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-gray-500 dark:text-gray-400">
                        Loading performance reviews...
                      </td>
                    </tr>
                  ) : reviews.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No completed performance reviews available yet.
                      </td>
                    </tr>
                  ) : (
                    reviews.map((rev) => (
                      <tr key={rev.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                        <td className="py-3.5 px-4 font-medium text-gray-900 dark:text-white">
                          {rev.review_start_date} to {rev.review_end_date}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                          {rev.overall_rating ? (
                            <span className="inline-flex items-center gap-1">
                              <Star className="w-4 h-4 fill-current text-amber-500" />
                              {rev.overall_rating.toFixed(1)} / 5.0
                            </span>
                          ) : (
                            "N/A"
                          )}
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
                        <td className="py-3.5 px-4 text-gray-500 dark:text-gray-400">
                          {rev.completed_at ? new Date(rev.completed_at).toLocaleDateString() : "-"}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedReview(rev)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 rounded-lg transition"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            View Breakdown
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {reviewTotalPages > 1 && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Page {reviewPage} of {reviewTotalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={reviewPage <= 1}
                    onClick={() => setReviewPage((p) => p - 1)}
                    className="p-2 border rounded-lg disabled:opacity-50 text-gray-600 dark:text-gray-300"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={reviewPage >= reviewTotalPages}
                    onClick={() => setReviewPage((p) => p + 1)}
                    className="p-2 border rounded-lg disabled:opacity-50 text-gray-600 dark:text-gray-300"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: GOALS & KPIS */}
        {activeTab === "goals" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Assigned Goals & Objectives
              </h2>
            </div>

            {goals.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center text-gray-500 dark:text-gray-400">
                No performance goals assigned yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goals.map((g) => (
                  <div
                    key={g.id}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{g.title}</h3>
                        {g.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                            {g.description}
                          </p>
                        )}
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(
                          g.status
                        )}`}
                      >
                        {g.status.replace("_", " ")}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{g.progress_percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${g.progress_percentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 text-xs border-t border-gray-100 dark:border-gray-700/50">
                      <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Target: {g.target_date}
                      </span>
                      <button
                        onClick={() => openGoalModal(g)}
                        className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                      >
                        Update Status
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* DETAIL MODAL: PERFORMANCE REVIEW */}
        {selectedReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col my-auto">
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Performance Review Breakdown
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Period: {selectedReview.review_start_date} to {selectedReview.review_end_date}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedReview(null)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-6 overflow-y-auto">
                {/* Overall Rating Banner */}
                <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-indigo-700 dark:text-indigo-300 font-semibold uppercase tracking-wider">
                      Official Overall Rating
                    </span>
                    <p className="text-2xl font-extrabold text-indigo-900 dark:text-indigo-100 mt-1">
                      {selectedReview.overall_rating ? `${selectedReview.overall_rating.toFixed(1)} / 5.0` : "N/A"}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(
                      selectedReview.status
                    )}`}
                  >
                    {selectedReview.status}
                  </span>
                </div>

                {/* Category Ratings List */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    Category Breakdown
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedReview.ratings.map((r) => (
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
                </div>

                {/* Overall HR Feedback */}
                {selectedReview.overall_feedback && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                      HR Feedback
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                      {selectedReview.overall_feedback}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-right">
                <button
                  onClick={() => setSelectedReview(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: UPDATE GOAL STATUS */}
        {selectedGoal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-3 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Update Goal Progress</h3>
                <button onClick={() => setSelectedGoal(null)} className="text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateGoalStatus} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Goal Title
                  </label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedGoal.title}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Status *
                  </label>
                  <select
                    value={goalStatusInput}
                    onChange={(e) => setGoalStatusInput(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                  >
                    <option value="NOT_STARTED">NOT STARTED</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Progress Percentage (0 - 100%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={goalProgressInput}
                    onChange={(e) => setGoalProgressInput(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setSelectedGoal(null)}
                    className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 border rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingGoal}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {updatingGoal ? "Saving..." : "Save Progress"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default MyPerformance;
