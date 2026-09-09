import React, { useState, useEffect, useCallback } from "react";
import {
  Target,
  Plus,
  Edit,
  CheckCircle2,
  Calendar,
  RefreshCw,
  X,
} from "lucide-react";
import AppLayout from "../../shared/components/AppLayout";
import BackToDashboard from "../../shared/components/BackToDashboard";
import Pagination from "../../shared/components/Pagination";
import { getAllGoals, createGoal, updateGoal } from "../services/performanceApi";
import { getEmployees } from "../../employee_service/services/employeeApi";
import { showSuccess, showError } from "../../shared/utils/toast";

function HRGoals() {
  const [goals, setGoals] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  // Form State
  const [formEmployeeId, setFormEmployeeId] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formTargetDate, setFormTargetDate] = useState("");
  const [formProgress, setFormProgress] = useState(0);
  const [formStatus, setFormStatus] = useState("NOT_STARTED");
  const [submitting, setSubmitting] = useState(false);

  // Load employees list
  useEffect(() => {
    async function loadEmployees() {
      try {
        const res = await getEmployees({ limit: 100 });
        setEmployees(res.data?.items || []);
      } catch (err) {
        console.error("Failed to load employees", err);
      }
    }
    loadEmployees();
  }, []);

  // Fetch performance goals
  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 15,
        status: selectedStatus || undefined,
        employee_id: selectedEmployeeId ? Number(selectedEmployeeId) : undefined,
      };
      const res = await getAllGoals(params);
      setGoals(res.data?.items || []);
      setTotalPages(res.data?.total_pages || 1);
      setTotalItems(res.data?.total || 0);
    } catch (err) {
      console.error("Failed to fetch goals", err);
      showError("Unable to load performance goals.");
    } finally {
      setLoading(false);
    }
  }, [page, selectedStatus, selectedEmployeeId]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  const openCreateModal = () => {
    setEditingGoal(null);
    setFormEmployeeId(employees[0]?.id || "");
    setFormTitle("");
    setFormDescription("");
    setFormTargetDate("");
    setFormProgress(0);
    setFormStatus("NOT_STARTED");
    setShowModal(true);
  };

  const openEditModal = (goal) => {
    setEditingGoal(goal);
    setFormEmployeeId(goal.employee_id);
    setFormTitle(goal.title);
    setFormDescription(goal.description || "");
    setFormTargetDate(goal.target_date);
    setFormProgress(goal.progress_percentage || 0);
    setFormStatus(goal.status);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formEmployeeId) {
      showError("Please select an employee.");
      return;
    }
    if (!formTitle.trim()) {
      showError("Goal title is required.");
      return;
    }
    if (!formTargetDate) {
      showError("Target date is required.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingGoal) {
        await updateGoal(editingGoal.id, {
          title: formTitle,
          description: formDescription,
          target_date: formTargetDate,
          progress_percentage: Number(formProgress),
          status: formStatus,
        });
        showSuccess("Goal updated successfully.");
      } else {
        await createGoal({
          employee_id: Number(formEmployeeId),
          title: formTitle,
          description: formDescription,
          target_date: formTargetDate,
          progress_percentage: Number(formProgress),
          status: formStatus,
        });
        showSuccess("Goal created successfully.");
      }
      setShowModal(false);
      fetchGoals();
    } catch (err) {
      console.error("Failed to save goal", err);
      showError(err.response?.data?.detail || "Unable to save goal.");
    } finally {
      setSubmitting(false);
    }
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

        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Target className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              Employee Performance Goals & KPIs
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Assign measurable goals, set target completion dates, and track employee progress.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Goal
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
            >
              <option value="">All Goal Statuses</option>
              <option value="NOT_STARTED">NOT STARTED</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>

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
            onClick={fetchGoals}
            className="p-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Goals List Grid */}
        {loading ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center text-gray-500 dark:text-gray-400">
            Loading performance goals...
          </div>
        ) : goals.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center text-gray-500 dark:text-gray-400">
            No goals found matching filters.
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
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 block mb-1">
                      {g.employee_name} ({g.employee_code})
                    </span>
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
                    onClick={() => openEditModal(g)}
                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit Goal
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          onPrevious={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
        />

        {/* MODAL: CREATE / EDIT GOAL */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-3 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {editingGoal ? "Edit Performance Goal" : "Create Performance Goal"}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Employee *
                  </label>
                  <select
                    disabled={!!editingGoal}
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
                    Goal Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Complete Leave Management APIs"
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Details about goal scope and deliverables..."
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Target Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formTargetDate}
                      onChange={(e) => setFormTargetDate(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                    >
                      <option value="NOT_STARTED">NOT STARTED</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Progress Percentage (0 - 100%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formProgress}
                    onChange={(e) => setFormProgress(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 border rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : editingGoal ? "Update Goal" : "Create Goal"}
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

export default HRGoals;
