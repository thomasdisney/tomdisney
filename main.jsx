import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function TierSection({ title, tasks, onMove, onDraftChange, onPost }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 22, borderBottom: "2px solid #ddd", paddingBottom: 8 }}>
        {title} ({tasks.length})
      </h2>
      {tasks.length === 0 ? (
        <p style={{ color: "#888", fontStyle: "italic" }}>No tasks here.</p>
      ) : (
        tasks.map(task => (
          <div
            key={task.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: 6,
              padding: 16,
              marginTop: 12,
              background: task.tier === "completed" ? "#f5f5f5" : "#fff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 500 }}>{task.title}</div>
            <div style={{ fontSize: 12, color: "#555", margin: "4px 0" }}>
              Assigned to {task.assigned_to}
            </div>
            <div style={{ marginTop: 8 }}>
              {task.updates.map((u, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: 13,
                    padding: "6px 8px",
                    background: "#fafafa",
                    borderRadius: 4,
                    marginTop: 4
                  }}
                >
                  <strong>{u.author}</strong>: {u.content}{" "}
                  <small style={{ color: "#aaa" }}>
                    {new Date(u.date).toLocaleDateString()}
                  </small>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <input
                placeholder="Write comment..."
                value={task.draft || ""}
                onChange={e => onDraftChange(task.id, e.target.value)}
                style={{
                  flex: 1,
                  padding: "8px 10px",
                  borderRadius: 4,
                  border: "1px solid #ccc"
                }}
              />
              <button
                onClick={() => onPost(task.id)}
                style={{
                  padding: "8px 12px",
                  background: "#0070f3",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer"
                }}
              >
                Post
              </button>
              {task.tier !== "completed" && (
                <button
                  onClick={() => onMove(task.id, "completed")}
                  style={{
                    padding: "8px 12px",
                    background: "#28a745",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer"
                  }}
                >
                  Complete
                </button>
              )}
              {task.tier === "current" && (
                <button
                  onClick={() => onMove(task.id, "next")}
                  style={{
                    padding: "8px 12px",
                    background: "#ffc107",
                    color: "#000",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer"
                  }}
                >
                  Backlog
                </button>
              )}
              {task.tier === "next" && (
                <button
                  onClick={() => onMove(task.id, "current")}
                  style={{
                    padding: "8px 12px",
                    background: "#17a2b8",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer"
                  }}
                >
                  Escalate
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function App() {
  const [projects, setProjects] = useState(["Customer A", "Customer B", "Customer C"]);
  const [activeProject, setActiveProject] = useState(projects[0]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({ title: "", assigned_to: "" });
  const [notification, setNotification] = useState("");

  useEffect(() => {
    fetchTasks();
  }, [activeProject]);

  async function fetchTasks() {
    setLoading(true);
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("project", activeProject)
      .order("created", { ascending: true });
    setTasks(data.map(t => ({ ...t, draft: "" })));
    setLoading(false);
  }

  async function createTask() {
    if (!newTask.title || !newTask.assigned_to) return;
    await supabase.from("tasks").insert([
      {
        ...newTask,
        id: `t-${Date.now()}`,
        project: activeProject,
        created_by: "You",
        created: new Date().toISOString(),
        tier: "next",
        updates: []
      }
    ]);
    setNewTask({ title: "", assigned_to: "" });
    notify("Task created");
    fetchTasks();
  }

  async function postComment(id) {
    const task = tasks.find(t => t.id === id);
    const update = { author: "You", content: task.draft, date: new Date().toISOString() };
    await supabase
      .from("tasks")
      .update({
        updates: [...task.updates, update]
      })
      .eq("id", id);
    notify("Comment posted");
    fetchTasks();
  }

  async function moveTier(id, tier) {
    const task = tasks.find(t => t.id === id);
    const update = { author: "You", content: `Moved to ${tier}`, date: new Date().toISOString() };
    await supabase
      .from("tasks")
      .update({
        tier,
        updates: [...task.updates, update]
      })
      .eq("id", id);
    notify("Task moved");
    fetchTasks();
  }

  function notify(msg) {
    setNotification(msg);
    setTimeout(() => setNotification(""), 2000);
  }

  return (
    <div style={{ maxWidth: 800, margin: "auto", padding: 24, fontFamily: "sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 28 }}>Project Tracker</h1>
        <select value={activeProject} onChange={e => setActiveProject(e.target.value)}>
          {projects.map(p => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </header>

      {notification && (
        <div style={{ background: "#d4edda", color: "#155724", padding: 12, borderRadius: 4, marginTop: 16 }}>
          {notification}
        </div>
      )}

      <section style={{ marginTop: 24, padding: 16, border: "1px solid #ccc", borderRadius: 6 }}>
        <h2 style={{ marginBottom: 12 }}>New Task</h2>
        <input
          placeholder="Title"
          value={newTask.title}
          onChange={e => setNewTask({ ...newTask, title: e.target.value })}
          style={{ padding: 8, width: "60%", marginRight: 8, borderRadius: 4, border: "1px solid #ccc" }}
        />
        <input
          placeholder="Assign to"
          value={newTask.assigned_to}
          onChange={e => setNewTask({ ...newTask, assigned_to: e.target.value })}
          style={{ padding: 8, width: "25%", marginRight: 8, borderRadius: 4, border: "1px solid #ccc" }}
        />
        <button
          onClick={createTask}
          style={{ padding: "8px 16px", background: "#0070f3", color: "#fff", border: "none", borderRadius: 4 }}
        >
          Add Task
        </button>
      </section>

      {loading ? (
        <p style={{ marginTop: 24 }}>Loading tasks…</p>
      ) : (
        <>
          <TierSection
            title="Current"
            tasks={tasks.filter(t => t.tier === "current")}
            onMove={moveTier}
            onDraftChange={(id, text) => setTasks(ts => ts.map(t => (t.id === id ? { ...t, draft: text } : t)))}
            onPost={postComment}
          />
          <TierSection
            title="Next Up"
            tasks={tasks.filter(t => t.tier === "next")}
            onMove={moveTier}
            onDraftChange={(id, text) => setTasks(ts => ts.map(t => (t.id === id ? { ...t, draft: text } : t)))}
            onPost={postComment}
          />
          <TierSection
            title="Completed"
            tasks={tasks.filter(t => t.tier === "completed")}
            onMove={() => {}}
            onDraftChange={(id, text) => setTasks(ts => ts.map(t => (t.id === id ? { ...t, draft: text } : t)))}
            onPost={postComment}
          />
        </>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
