"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";

export default function Page() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    desc: "",
    due_date: "",
    status: true, // Default to active
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

 const fetchTasks = async () => {
    try {
      const response = await axios.get("https://task-backend-one-brown.vercel.app/api/tasks", {
        headers: {
          auth: process.env.auth,
        },
      });
      console.log("API Response:", response.data);
      setTasks(response.data.data || []);
    } catch (error) {
      console.log("API not available, using mock data:", error.message);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter((task) => {
    if (!task || task.status === undefined || task.status === null) {
      return filter === "all"; // Only show in "all" filter
    }

    if (filter === "active") return task.status === true;
    if (filter === "inactive") return task.status === false;
    return true;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "No date set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError(""); // Clear error when user starts typing
  };

  const validateForm = () => {
    if (!form.title?.trim()) {
      setError("Title is required");
      return false;
    }
    if (!form.desc?.trim()) {
      setError("Description is required");
      return false;
    }
    if (!form.due_date) {
      setError("Due date is required");
      return false;
    }
    setError("");
    return true;
  };

  const handleNewTask = async () => {
    if (!validateForm()) return;
    console.log(form);
    setLoading(true);
    try {
      if (editingTask) {
        // Update existing task
        const response = await axios.put(
          `https://task-backend-one-brown.vercel.app/api/edittask/${editingTask.id}`,
          form,
          {
            headers: {
              auth: process.env.auth,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Task updated:", response.data);

        // Update task in the list
        setTasks((prev) => 
          prev.map((task) => 
            task.id === editingTask.id 
              ? { ...task, ...form, id: editingTask.id }
              : task
          )
        );
      } else {
        // Create new task
        const response = await axios.post(
          "https://task-backend-one-brown.vercel.app/api/addtask",
          form,
          {
            headers: {
              auth: process.env.auth,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Task created:", response.data);

        setTasks((prev) => [...prev, response.data.data]);
      }

      // update 
      await fetchTasks();

      // reset
      setForm({
        title: "",
        desc: "",
        due_date: "",
        status: true,
      });
      setShowModal(false);
      setEditingTask(null);
      setError("");
    } catch (error) {
      console.error("Error saving task:", error);
      setError(editingTask ? "Failed to update task. Please try again." : "Failed to create task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId, index) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      await axios.delete(`https://task-backend-one-brown.vercel.app/api/delete/${taskId}`, {
        headers: {
          auth: process.env.auth,
        },
      });

      // remove task from list
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      console.log("Task deleted successfully");
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task. Please try again.");
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title || task.name || "",
      desc: task.desc || "",
      due_date: task.due_date || "",
      status: task.status !== undefined ? task.status : true,
    });
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Task-U-Do
            </h1>
            <p className="text-gray-600 text-lg">
              Organize your life, one task at a time
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Filter Buttons */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 cursor-pointer rounded-md text-sm font-medium transition-all ${
                  filter === "all"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                All Tasks
              </button>
              <button
                onClick={() => setFilter("active")}
                className={`px-4 py-2 cursor-pointer rounded-md text-sm font-medium transition-all ${
                  filter === "active"
                    ? "bg-white text-green-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter("inactive")}
                className={`px-4 py-2 rounded-md cursor-pointer text-sm font-medium transition-all ${
                  filter === "inactive"
                    ? "bg-white text-gray-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Inactive
              </button>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r cursor-pointer from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Task
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {filteredTasks.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTasks.map((task, index) => {
              if (!task) {
                console.warn(`Task at index ${index} is undefined`);
                return null;
              }

              return (
                <div
                  key={task.id || index}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 overflow-hidden"
                >
                  <div className="p-6">
                    {/* Status Badge */}
                    <div className="flex justify-between items-start mb-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          task.status === true
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-red-100 text-red-700 border border-red-200"
                        }`}
                      >
                        {task.status === true ? "Active" : "Inactive"}
                      </span>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEditTask(task)}
                          className="p-2 cursor-pointer text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit task"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id, index)}
                          className="p-2 text-red-600 cursor-pointer hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete task"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Task Content */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {task.title || task.name || "Untitled Task"}
                      </h3>

                      {task.desc && (
                        <p className="text-gray-600 text-sm line-clamp-3">
                          {task.desc}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>{formatDate(task.due_date)}</span>
                        </div>
                      </div>

                      {task.created_at && (
                        <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                          Created: {formatDate(task.created_at)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No tasks found
            </h3>
            <p className="text-gray-500 mb-6">
              {filter === "all"
                ? "Get started by creating your first task!"
                : `No ${filter} tasks at the moment.`}
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r cursor-pointer from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2 mx-auto"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Your First Task
            </button>
          </div>
        )}
      </div>

      {/* New Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Create New Task
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setError("");
                  setForm({
                    title: "",
                    desc: "",
                    due_date: "",
                    status: true,
                  });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-6 h-6 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Task Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleInputChange}
                  placeholder="Enter task title..."
                  className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Task Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="desc"
                  value={form.desc}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Add task description..."
                  className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date *
                </label>
                <input
                  type="date"
                  name="due_date"
                  value={form.due_date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Task Status
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="status"
                    checked={form.status}
                    onChange={handleInputChange}
                    className="sr-only peer text-black"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {form.status ? "Active" : "Inactive"}
                  </span>
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowModal(false);
                  setError("");
                  setForm({
                    title: "",
                    desc: "",
                    due_date: "",
                    status: true,
                  });
                }}
                className="flex-1 px-4 py-3 cursor-pointer border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleNewTask}
                disabled={loading}
                className="flex-1 px-4 py-3 cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}