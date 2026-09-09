import React, { useState, useEffect, useCallback } from "react";
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
  RefreshCw,
  X,
  TrendingUp,
  BarChart2,
  PieChart as PieChartIcon,
  Activity,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import Pagination from "../../shared/components/Pagination";
import {
  getMyPerformanceAnalytics,
  getMyPerformanceReviews,
  getMyGoals,
  updateMyGoalStatus,
} from "../services/performanceApi";
import { showSuccess, showError } from "../../shared/utils/toast";

const GOAL_COLORS = {
  COMPLETED: "#10B981",
  IN_PROGRESS: "#3B82F6",
  NOT_STARTED: "#F59E0B",
  CANCELLED: "#EF4444",
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-lg shadow-lg text-xs space-y-1">
        <p className="font-bold text-gray-900 dark:text-white">{label || payload[0]?.name}</p>
        {payload.map((item, idx) => (
          <p key={idx} style={{ color: item.color || item.fill }} className="font-semibold">
            {item.name}: {item.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function MyPerformance() {
  const [analytics, setAnalytics] = useState(null);
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

  // Pagination for reviews
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewTotalPages, setReviewTotalPages] = useState(1);
  const [reviewTotalItems, setReviewTotalItems] = useState(0);

  // Pagination for goals
  const [goalPage, setGoalPage] = useState(1);
  const [goalTotalPages, setGoalTotalPages] = useState(1);
  const [goalTotalItems, setGoalTotalItems] = useState(0);

  // Fetch performance data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [analyticsRes, revRes, goalRes] = await Promise.all([
        getMyPerformanceAnalytics(),
        getMyPerformanceReviews({ page: reviewPage, limit: 15 }),
        getMyGoals({ page: goalPage, limit: 15 }),
      ]);
      setAnalytics(analyticsRes.data);
      setReviews(revRes.data?.items || []);
      setReviewTotalPages(revRes.data?.total_pages || 1);
      setReviewTotalItems(revRes.data?.total || 0);
      setGoals(goalRes.data?.items || []);
      setGoalTotalPages(goalRes.data?.total_pages || 1);
      setGoalTotalItems(goalRes.data?.total || 0);
    } catch (err) {
      console.error("Failed to fetch performance analytics", err);
      showError("Unable to load performance analytics.");
    } finally {
      setLoading(false);
    }
  }, [reviewPage, goalPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (reviewPage > reviewTotalPages && reviewTotalPages > 0) {
      setReviewPage(reviewTotalPages);
    }
  }, [reviewTotalPages, reviewPage]);

  useEffect(() => {
    if (goalPage > goalTotalPages && goalTotalPages > 0) {
      setGoalPage(goalTotalPages);
    }
  }, [goalTotalPages, goalPage]);

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

  // Prepare Goal Distribution Chart Data
  const goalDistributionData = analytics
    ? [
        { name: "Completed", status: "COMPLETED", value: analytics.goals.completed },
        { name: "In Progress", status: "IN_PROGRESS", value: analytics.goals.in_progress },
        { name: "Not Started", status: "NOT_STARTED", value: analytics.goals.not_started },
        { name: "Cancelled", status: "CANCELLED", value: analytics.goals.cancelled },
      ]
    : [];

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
              Personalized performance analytics dashboard, rating trends, competency evaluation, goal progress, and work output context.
            </p>
          </div>
          <button
            onClick={fetchData}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh Analytics
          </button>
        </div>

        {/* Executive Summary KPI Strip */}
        {analytics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
            {/* Latest Rating */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-800/50 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                  Latest Rating
                </span>
                <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-sm">
                  <Star className="w-4 h-4 fill-current" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  {analytics.latest_rating ? analytics.latest_rating.toFixed(1) : "N/A"}
                </span>
                {analytics.latest_rating && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">/ 5.0</span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {analytics.completed_reviews_count} completed HR review(s)
              </p>
            </div>

            {/* Average Rating */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Average Rating
                </span>
                <div className="p-2 bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400 rounded-lg">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  {analytics.average_rating ? analytics.average_rating.toFixed(1) : "N/A"}
                </span>
                {analytics.highest_rating && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">Max: {analytics.highest_rating.toFixed(1)}</span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Overall average score</p>
            </div>

            {/* Goal Completion Rate */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Goal Completion Rate
                </span>
                <div className="p-2 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 rounded-lg">
                  <Target className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  {analytics.goals.completion_rate !== null ? `${analytics.goals.completion_rate}%` : "N/A"}
                </span>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {analytics.goals.completed} of {analytics.goals.total_goals} goals completed
              </p>
            </div>

            {/* Projects Assigned */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Projects Assigned
                </span>
                <div className="p-2 bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 rounded-lg">
                  <Briefcase className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  {analytics.projects.assigned}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">total</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {analytics.projects.active} active | {analytics.projects.completed} completed
              </p>
            </div>

            {/* Work Reports */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Work Reports
                </span>
                <div className="p-2 bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400 rounded-lg">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  {analytics.work_reports.total_submitted}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {analytics.work_reports.submitted_this_month} this month
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
            Analytics & Rating Trends
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
          <button
            onClick={() => setActiveTab("context")}
            className={`py-2 px-4 text-sm font-semibold border-b-2 whitespace-nowrap transition ${
              activeTab === "context"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Work & Operational Context
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
        </div>

        {/* TAB 1: ANALYTICS & RATING TRENDS */}
        {activeTab === "overview" && analytics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Rating Trend Line Chart */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Performance Rating Trend Over Time
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Completed Evaluations</span>
                </div>

                {analytics.rating_trend && analytics.rating_trend.length > 0 ? (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics.rating_trend} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                        <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fontSize: 11 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="rating"
                          name="Overall Rating"
                          stroke="#6366F1"
                          strokeWidth={3}
                          dot={{ r: 5, fill: "#6366F1" }}
                          activeDot={{ r: 7 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                    <TrendingUp className="w-10 h-10 text-gray-400 mb-2" />
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No Rating History Yet</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Your rating trend chart will populate automatically once your HR performance reviews are completed.
                    </p>
                  </div>
                )}
              </div>

              {/* Rating Category Breakdown */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Star className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    Rating Category Analytics
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Core Competencies</span>
                </div>

                {analytics.category_ratings && analytics.category_ratings.length > 0 ? (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={analytics.category_ratings}
                        margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis type="number" domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fontSize: 11 }} />
                        <YAxis dataKey="category" type="category" tick={{ fontSize: 11 }} width={120} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey="average_rating"
                          name="Category Score"
                          fill="#8B5CF6"
                          radius={[0, 4, 4, 0]}
                          maxBarSize={28}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                    <Star className="w-10 h-10 text-gray-400 mb-2" />
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No Category Data Available</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Competency breakdown scores across technical skills, teamwork, and initiative will display here after evaluation.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GOALS & KPIS */}
        {activeTab === "goals" && analytics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Goal Status Donut Chart */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-500" />
                  Goal Status Distribution
                </h3>

                {goalDistributionData.some((g) => g.value > 0) ? (
                  <div className="h-60 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={goalDistributionData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={75}
                          innerRadius={40}
                          paddingAngle={4}
                          label={({ name, value }) => (value > 0 ? `${name}: ${value}` : "")}
                        >
                          {goalDistributionData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={GOAL_COLORS[entry.status] || "#9CA3AF"}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-56 flex flex-col items-center justify-center text-center p-6 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                    <Target className="w-10 h-10 text-gray-400 mb-2" />
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No Goals Assigned</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      No goal status distribution available.
                    </p>
                  </div>
                )}
              </div>

              {/* Goal Overview Metrics */}
              <div className="md:col-span-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-500" />
                  Goal Progress Overview
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-100 dark:border-gray-800 text-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold block uppercase">Total Goals</span>
                    <span className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1 block">
                      {analytics.goals.total_goals}
                    </span>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-100 dark:border-green-800/50 text-center">
                    <span className="text-xs text-green-700 dark:text-green-300 font-semibold block uppercase">Completed</span>
                    <span className="text-2xl font-extrabold text-green-600 dark:text-green-400 mt-1 block">
                      {analytics.goals.completed}
                    </span>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-100 dark:border-blue-800/50 text-center">
                    <span className="text-xs text-blue-700 dark:text-blue-300 font-semibold block uppercase">In Progress</span>
                    <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1 block">
                      {analytics.goals.in_progress}
                    </span>
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800/50 text-center">
                    <span className="text-xs text-indigo-700 dark:text-indigo-300 font-semibold block uppercase">Avg Progress</span>
                    <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1 block">
                      {analytics.goals.average_progress !== null ? `${analytics.goals.average_progress}%` : "N/A"}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                {analytics.goals.average_progress !== null && (
                  <div className="pt-2">
                    <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      <span>Overall Goal Progression</span>
                      <span>{analytics.goals.average_progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${analytics.goals.average_progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Goals List */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Assigned Goals & Objectives</h3>
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
                          <h4 className="font-bold text-gray-900 dark:text-white">{g.title}</h4>
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
              <Pagination
                currentPage={goalPage}
                totalPages={goalTotalPages}
                totalItems={goalTotalItems}
                onPrevious={() => setGoalPage((p) => Math.max(1, p - 1))}
                onNext={() => setGoalPage((p) => Math.min(goalTotalPages, p + 1))}
              />
            </div>
          </div>
        )}

        {/* TAB 3: WORK & OPERATIONAL CONTEXT */}
        {activeTab === "context" && analytics && (
          <div className="space-y-6">
            {/* Context Notice Banner */}
            <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                <strong>Operational Context Disclaimer:</strong> Metrics below (attendance, leave requests, work report counts) provide supporting context for your day-to-day work activities. Formal performance ratings are based on HR reviews, goal outcomes, and project contributions — approved leave does NOT penalize performance scores.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Projects & Work Output Context */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Project Contribution & Progress
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Assigned Projects</span>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {analytics.projects.assigned}
                    </p>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 block">
                      {analytics.projects.active} active | {analytics.projects.completed} completed
                    </span>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Avg Project Progress</span>
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                      {analytics.projects.average_progress !== null ? `${analytics.projects.average_progress}%` : "N/A"}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                      Across assigned deliverables
                    </span>
                  </div>
                </div>

                {/* Work Reports Summary */}
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider block mb-3">
                    Daily Work Report Activity
                  </span>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      <span className="text-xs text-gray-500 dark:text-gray-400 block">Total</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white mt-1 block">
                        {analytics.work_reports.total_submitted}
                      </span>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      <span className="text-xs text-gray-500 dark:text-gray-400 block">This Month</span>
                      <span className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-1 block">
                        {analytics.work_reports.submitted_this_month}
                      </span>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      <span className="text-xs text-gray-500 dark:text-gray-400 block">Projects Logged</span>
                      <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1 block">
                        {analytics.work_reports.projects_reported}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendance & Leave Context */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Attendance & Leave Overview
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Attendance Record</span>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {analytics.attendance.present_days} / {analytics.attendance.working_days}
                    </p>
                    <span className="text-xs text-amber-600 dark:text-amber-400 mt-1 block">
                      {analytics.attendance.late_days} late punch(es)
                    </span>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Approved Leave</span>
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                      {analytics.leave.approved_days} days
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                      {analytics.leave.pending_requests} pending | {analytics.leave.rejected_requests} rejected
                    </span>
                  </div>
                </div>

                {/* Attendance Rate */}
                {analytics.attendance.attendance_rate !== null && (
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      <span>Attendance Consistency Rate</span>
                      <span>{analytics.attendance.attendance_rate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${analytics.attendance.attendance_rate}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PERFORMANCE REVIEWS TABLE */}
        {activeTab === "reviews" && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Completed HR Performance Evaluations
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Only finalized and released performance reviews are displayed here.
                </p>
              </div>
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
            <Pagination
              currentPage={reviewPage}
              totalPages={reviewTotalPages}
              totalItems={reviewTotalItems}
              onPrevious={() => setReviewPage((p) => Math.max(1, p - 1))}
              onNext={() => setReviewPage((p) => Math.min(reviewTotalPages, p + 1))}
            />
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
