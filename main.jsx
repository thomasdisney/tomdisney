import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
);

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeProject, setActiveProject] = useState("Customer A");
  const [newTask, setNewTask] = useState({ title: "", assigned_to: "" });
  const [newComment, setNewComment] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  const loadTasks = async () => {
    setLoading(true);
    const res = await fetch("/api/get-tasks");
    const data = await res.json();
    setTasks(data.filter((t) => t.project === activeProject));
    setLoading(false);
  };

  const saveTask = async (task) => {
    await fetch("/api/save-task", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });
  };

  useEffect(() => {
    loadTasks();
  }, [activeProject]);

  const handleNewTask = async () => {
    if (!newTask.title || !newTask.assigned_to) return;
    const task = {
      id: `task-${Date.now()}`,
      title: newTask.title,
      created_by: "You",
      assigned_to: newTask.assigned_to,
      status: "To Do",
      created: new Date().toISOString(),
      updates: [],
      tier: "next",
      project: activeProject,
    };
    await saveTask(task);
    setTasks((prev) => [...prev, task]);
    setNewTask({ title: "", assigned_to: "" });
    setSuccessMsg("Task added");
    setTimeout(() => setSuccessMsg(""), 1500);
  };

  const handleComment = async (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    const update = {
      author: "You",
      content: newComment[taskId],
      date: new Date().toISOString(),
    };
    const updatedTask = {
      ...task,
      updates: [...task.updates, update],
    };
    await saveTask(updatedTask);
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? updatedTask : t))
    );
    setNewComment({ ...newComment, [taskId]: "" });
    setSuccessMsg("Update added");
    setTimeout(() => setSuccessMsg(""), 1500);
  };

  const moveTask = async (taskId, newTier) => {
    const task = tasks.find((t) => t.id === taskId);
    const updatedTask = {
      ...task,
      tier: newTier,
      updates: [
        ...(task.updates || []),
        {
          author: "You",
          content: `Moved to ${newTier}`,
          date: new Date().toISOString(),
        },
      ],
    };
    await saveTask(updatedTask);
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? updatedTask : t))
    );
  };

  const TierSection = ({ label, tier }) => (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">{label}</h2>
      {tasks.filter((t) => t.tier === tier).length === 0 && (
        <div className="text-gray-400 italic mb-2">No tasks</div>
      )}
      {tasks
        .filter((t) => t.tier === tier)
        .map((task) => (
          <div
            key={task.id}
            className={`border rounded p-4 mb-3 ${
              tier === "completed" ? "bg-gray-100" : "bg-white"
            }`}
          >
            <div className="font-medium mb-1">{task.title}</div>
            <div className="text-sm text-gray-600 mb-2">
              Assigned to: {task.assigned_to} • Created by: {task.created_by}
            </div>
            <div className="space-y-1 mb-2">
              {task.updates?.map((u, i) => (
                <div key={i} className="text-sm border rounded px-2 py-1">
                  <span className="font-semibold">{u.author}:</span>{" "}
                  {u.content}{" "}
                  <span className="text-xs text-gray-500">({u.date})</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <input
                type="text"
                placeholder="Add comment"
                className="border rounded px-2 py-1 flex-1"
                value={newComment[task.id] || ""}
                onChange={(e) =>
                  setNewComment({ ...newComment, [task.id]: e.target.value })
                }
              />
              <button
                className="bg-blue-500 text-white px-3 py-1 rounded"
                onClick={() => handleComment(task.id)}
              >
                Comment
              </button>
              {tier !== "completed" && (
                <button
                  className="bg-green-500 text-white px-3 py-1 rounded"
                  onClick={() => moveTask(task.id, "completed")}
                >
                  Complete
                </button>
              )}
              {tier === "current" && (
                <button
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                  onClick={() => moveTask(task.id, "next")}
                >
                  Backlog
                </button>
              )}
              {tier === "next" && (
                <button
                  className="bg-blue-400 text-white px-3 py-1 rounded"
                  onClick={() => moveTask(task.id, "current")}
                >
                  Escalate
                </button>
              )}
            </div>
          </div>
        ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Project Tracker</h1>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Select Project</label>
        <select
          className="border px-2 py-1 rounded"
          value={activeProject}
          onChange={(e) => setActiveProject(e.target.value)}
        >
          <option>Customer A</option>
          <option>Customer B</option>
          <option>Customer C</option>
        </select>
      </div>

      <div className="bg-white border p-4 rounded mb-6">
        <h2 className="text-lg font-semibold mb-2">New Task</h2>
        <input
          type="text"
          placeholder="Task title"
          className="border rounded px-2 py-1 mb-2 w-full"
          value={newTask.title}
          onChange={(e) =>
            setNewTask({ ...newTask, title: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Assign to"
          className="border rounded px-2 py-1 mb-2 w-full"
          value={newTask.assigned_to}
          onChange={(e) =>
            setNewTask({ ...newTask, assigned_to: e.target.value })
          }
        />
        <button
          className="bg-blue-600 text-white px-4 py-1 rounded"
          onClick={handleNewTask}
        >
          Add Task
        </button>
        {successMsg && (
          <div className="text-green-600 text-sm mt-2">{successMsg}</div>
        )}
      </div>

      {loading ? (
        <div>Loading tasks...</div>
      ) : (
        <>
          <TierSection label="Current" tier="current" />
          <TierSection label="Next Up" tier="next" />
          <TierSection label="Completed" tier="completed" />
        </>
      )}
    </div>
  );
}
