import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  Users,
  CheckCircle2,
  Clock,
  Star,
  Target,
  FileText,
  Plus,
  RefreshCw,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import { getHRPerformanceDashboard } from "../services/performanceApi";
import { showError } from "../../shared/utils/toast";

function HRPerformanceDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await getHRPerformanceDashboard();
      setMetrics(res.data);
    } catch (err) {
      console.error("Failed to load HR performance dashboard", err);
      showError("Unable to load performance metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <BackToDashboard />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              HR Performance & Analytics Dashboard
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Executive performance metrics, employee evaluations, and goal tracking.
            </p>
          </div>
          <button
            onClick={fetchDashboard}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* KPI Cards Grid */}
        {metrics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Total Employees */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Active Employees
                </span>
                <div className="p-2 bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-3">
                {metrics.total_employees}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Active headcount</p>
            </div>

            {/* Completed Reviews */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Reviews Completed
                </span>
                <div className="p-2 bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400 rounded-lg">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-3">
                {metrics.reviews_completed}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium">
                {metrics.reviews_pending} draft review(s) pending completion
              </p>
            </div>

            {/* Average System Rating */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-800/50 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                  System Average Rating
                </span>
                <div className="p-2 bg-indigo-600 text-white rounded-lg">
                  <Star className="w-5 h-5 fill-current" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  {metrics.average_rating ? `${metrics.average_rating.toFixed(1)}` : "N/A"}
                </span>
                {metrics.average_rating && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">/ 5.0</span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Across completed evaluations</p>
            </div>

            {/* Goals Completed */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Goals Completed
                </span>
                <div className="p-2 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 rounded-lg">
                  <Target className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-3">
                {metrics.goals_completed}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {metrics.goals_in_progress} in progress
              </p>
            </div>
          </div>
        )}

        {/* Quick Action Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <Link
            to="/hr/performance/reviews"
            className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-xl p-6 shadow-sm transition flex items-center justify-between"
          >
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition flex items-center gap-2">
                <Award className="w-5 h-5" />
                Manage Performance Reviews
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Draft evaluations, rate 8 categories, and complete formal employee appraisals.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition" />
          </Link>

          <Link
            to="/hr/performance/goals"
            className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-xl p-6 shadow-sm transition flex items-center justify-between"
          >
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition flex items-center gap-2">
                <Target className="w-5 h-5" />
                Manage Employee Goals / KPIs
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Create goals, set progress targets, and track objective execution across team.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition" />
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}

export default HRPerformanceDashboard;
