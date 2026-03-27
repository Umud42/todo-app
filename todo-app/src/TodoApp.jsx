import { useState, useEffect, useRef, useCallback } from "react";
 
const PRIORITIES = {
  high: { label: "High", color: "#f43f5e", bg: "rgba(244,63,94,0.12)" },
  medium: { label: "Medium", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  low: { label: "Low", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
};
 
const FILTERS = ["All", "Active", "Completed"];
 
const TASK_COLORS = [
  "#ffffff", "#f43f5e", "#f59e0b", "#22c55e",
  "#3b82f6", "#a855f7", "#ec4899", "#14b8a6",
];
 
function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
}
 
function formatTime() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit",
  });
}
 
function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
 
function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3,6 5,6 21,6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  );
}
 
function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
 
function GripIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="9" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="18" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="18" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
 
function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}
 
function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}
 
function TaskItem({ task, onToggle, onDelete, onEdit, onDragStart, onDragOver, onDrop, isDragging }) {
  const [hovering, setHovering] = useState(false);
  const p = PRIORITIES[task.priority];
  const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date();
  const taskColor = task.color || "#ffffff";
 
  return (
    <div
      draggable
      onDragStart={() => onDragStart(task.id)}
      onDragOver={(e) => { e.preventDefault(); onDragOver(task.id); }}
      onDrop={onDrop}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{
        display: "flex", alignItems: "center", gap: "10px",
        padding: "12px 14px",
        background: hovering ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.06)",
        border: `1px solid rgba(255,255,255,0.1)`,
        borderLeft: `3px solid ${task.completed ? "transparent" : p.color}`,
        borderRadius: "12px",
        marginBottom: "8px",
        opacity: isDragging ? 0.4 : task.completed ? 0.5 : 1,
        transition: "all 0.2s ease",
        cursor: "grab",
        backdropFilter: "blur(8px)",
        animation: "slideIn 0.25s ease",
      }}
    >
      <div style={{ color: "rgba(255,255,255,0.3)", opacity: hovering ? 1 : 0, transition: "opacity 0.2s", flexShrink: 0 }}>
        <GripIcon />
      </div>
 
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        style={{
          width: "20px", height: "20px", borderRadius: "6px",
          border: `2px solid ${task.completed ? "#22c55e" : p.color}`,
          background: task.completed ? "#22c55e" : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", flexShrink: 0, color: "#fff",
          transition: "all 0.2s ease",
        }}
      >
        {task.completed && <CheckIcon />}
      </button>
 
      {/* Color dot */}
      <div style={{
        width: "10px", height: "10px", borderRadius: "50%",
        background: taskColor, flexShrink: 0,
        border: taskColor === "#ffffff" ? "1px solid rgba(255,255,255,0.3)" : "none",
      }} />
 
      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: "14px", fontWeight: 500, color: taskColor === "#ffffff" ? "#e2e8f0" : taskColor,
          textDecoration: task.completed ? "line-through" : "none",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          fontFamily: "'DM Sans', sans-serif",
          opacity: task.completed ? 0.6 : 1,
        }}>{task.text}</div>
        <div style={{ display: "flex", gap: "6px", marginTop: "3px", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{
            fontSize: "10px", fontWeight: 600, letterSpacing: "0.05em",
            color: p.color, background: p.bg, padding: "1px 7px", borderRadius: "999px",
          }}>{p.label.toUpperCase()}</span>
          {task.dueDate && (
            <span style={{ fontSize: "10px", color: isOverdue ? "#f43f5e" : "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>
              {isOverdue ? "⚠ " : "📅 "}{task.dueDate}
            </span>
          )}
        </div>
      </div>
 
      {/* Actions */}
      <div style={{ display: "flex", gap: "5px", opacity: hovering ? 1 : 0, transition: "opacity 0.2s" }}>
        <button onClick={() => onEdit(task)} style={{
          width: "28px", height: "28px", borderRadius: "8px", border: "none",
          background: "rgba(34,197,94,0.15)", color: "#22c55e",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}><EditIcon /></button>
        <button onClick={() => onDelete(task.id)} style={{
          width: "28px", height: "28px", borderRadius: "8px", border: "none",
          background: "rgba(244,63,94,0.15)", color: "#f43f5e",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}><TrashIcon /></button>
      </div>
    </div>
  );
}
 
// ── Notes Panel ──────────────────────────────────────────────
function NotesPanel() {
  const [notes, setNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem("notes_v1")) || []; } catch { return []; }
  });
  const [noteInput, setNoteInput] = useState("");
 
  useEffect(() => { localStorage.setItem("notes_v1", JSON.stringify(notes)); }, [notes]);
 
  const addNote = () => {
    const text = noteInput.trim();
    if (!text) return;
    setNotes(prev => [{ id: Date.now(), text, createdAt: new Date().toISOString() }, ...prev]);
    setNoteInput("");
  };
 
  const deleteNote = (id) => setNotes(prev => prev.filter(n => n.id !== id));
 
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Note input */}
      <div style={{
        background: "rgba(255,255,255,0.07)", border: "0.5px solid rgba(255,255,255,0.12)",
        borderRadius: "14px", padding: "14px", marginBottom: "14px", backdropFilter: "blur(12px)",
      }}>
        <textarea
          value={noteInput}
          onChange={e => setNoteInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) addNote(); }}
          placeholder="Type your note… (Press Ctrl+Enter to send)"
          rows={4}
          style={{
            width: "100%", background: "rgba(255,255,255,0.06)",
            border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: "10px",
            color: "#e2e8f0", fontSize: "14px", fontFamily: "'DM Sans', sans-serif",
            padding: "10px 12px", outline: "none", resize: "none",
            marginBottom: "10px", lineHeight: 1.6,
          }}
          onFocus={e => { e.target.style.borderColor = "#22c55e"; e.target.style.boxShadow = "0 0 0 2px rgba(34,197,94,0.15)"; }}
          onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; e.target.style.boxShadow = "none"; }}
        />
        <button onClick={addNote} style={{
          width: "100%", height: "38px", borderRadius: "10px",
          background: "#22c55e", border: "none", color: "#fff",
          fontSize: "14px", fontWeight: 600, cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif",
        }}>+ Add note</button>
      </div>
 
      {/* Notes list */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {notes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(255,255,255,0.3)", fontSize: "14px" }}>
            📝 Your notes will appear here
          </div>
        ) : (
          notes.map(note => (
            <div key={note.id} style={{
              background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.1)",
              borderRadius: "12px", padding: "12px 14px", marginBottom: "8px",
              backdropFilter: "blur(8px)", animation: "slideIn 0.25s ease",
              position: "relative",
            }}>
              <p style={{ fontSize: "14px", color: "#e2e8f0", lineHeight: 1.6, marginBottom: "6px", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {note.text}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>
                  {new Date(note.createdAt).toLocaleDateString("az-AZ", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
                <button onClick={() => deleteNote(note.id)} style={{
                  width: "24px", height: "24px", borderRadius: "6px", border: "none",
                  background: "rgba(244,63,94,0.12)", color: "#f43f5e",
                  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                }}><TrashIcon /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
 
// ── Main App ─────────────────────────────────────────────────
export default function TodoApp() {
  const [tasks, setTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tasks_v2")) || []; } catch { return []; }
  });
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [taskColor, setTaskColor] = useState("#ffffff");
  const [filter, setFilter] = useState("All");
  const [time, setTime] = useState(formatTime());
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const [activePanel, setActivePanel] = useState("tasks");
  const [editingTask, setEditingTask] = useState(null);
  const [editText, setEditText] = useState("");
  const [editColor, setEditColor] = useState("#ffffff");
  const [dragId, setDragId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const inputRef = useRef(null);
 
  useEffect(() => {
    const t = setInterval(() => setTime(formatTime()), 1000);
    return () => clearInterval(t);
  }, []);
 
  useEffect(() => { localStorage.setItem("tasks_v2", JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem("theme", theme); }, [theme]);
 
  const isDark = theme === "dark";
  const border = "rgba(255,255,255,0.1)";
 
  const addTask = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    setTasks(prev => [{ id: Date.now(), text, priority, dueDate, color: taskColor, completed: false, createdAt: new Date().toISOString() }, ...prev]);
    setInput(""); setDueDate("");
  }, [input, priority, dueDate, taskColor]);
 
  const toggleTask = (id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  const deleteTask = (id) => setTasks(prev => prev.filter(t => t.id !== id));
 
  const saveEdit = () => {
    if (!editText.trim() || !editingTask) return;
    setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, text: editText, color: editColor } : t));
    setEditingTask(null); setEditText(""); setEditColor("#ffffff");
  };
 
  const clearCompleted = () => setTasks(prev => prev.filter(t => !t.completed));
 
  const filtered = tasks.filter(t => {
    if (filter === "Active") return !t.completed;
    if (filter === "Completed") return t.completed;
    return true;
  });
 
  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;
 
  const handleDrop = () => {
    if (dragId === null || dragOverId === null || dragId === dragOverId) return;
    setTasks(prev => {
      const arr = [...prev];
      const from = arr.findIndex(t => t.id === dragId);
      const to = arr.findIndex(t => t.id === dragOverId);
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
    setDragId(null); setDragOverId(null);
  };
 
  return (
    <div style={{
      minHeight: "100vh",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); opacity: 0.5; cursor: pointer; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(34,197,94,0.3); border-radius: 999px; }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.25); }
        button:focus { outline: none; }
        @media (max-width: 768px) { .main-layout { flex-direction: column !important; } .sidebar { width: 100% !important; border-right: none !important; border-bottom: 0.5px solid rgba(255,255,255,0.1) !important; } }
      `}</style>
 
      {/* Dark overlay */}
      <div style={{ minHeight: "100vh", background: "rgba(0,0,0,0.62)", backdropFilter: "blur(2px)" }}>
 
        {/* Header */}
        <div style={{
          borderBottom: "0.5px solid rgba(255,255,255,0.08)",
          padding: "16px 28px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: "rgba(0,0,0,0.2)",
        }}>
          <div>
            <div style={{ fontSize: "12px", color: "#22c55e", fontWeight: 600, letterSpacing: "0.08em", fontFamily: "'DM Mono', monospace" }}>{time}</div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginTop: "1px" }}>{formatDate()}</div>
          </div>
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            style={{
              width: "38px", height: "38px", borderRadius: "10px",
              border: "0.5px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.07)",
              color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
 
        {/* Main layout */}
        <div className="main-layout" style={{ display: "flex", minHeight: "calc(100vh - 65px)" }}>
 
          {/* Sidebar */}
          <div className="sidebar" style={{
            width: "220px", flexShrink: 0,
            borderRight: "0.5px solid rgba(255,255,255,0.08)",
            padding: "24px 16px",
            background: "rgba(0,0,0,0.15)",
          }}>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", fontWeight: 600, marginBottom: "12px" }}>MENU</div>
            {[
              { key: "tasks", label: "My Tasks", emoji: "✅" },
              { key: "notes", label: "Notes", emoji: "📝" },
            ].map(item => (
              <button key={item.key} onClick={() => setActivePanel(item.key)} style={{
                width: "100%", height: "44px", borderRadius: "12px",
                border: activePanel === item.key ? "0.5px solid rgba(34,197,94,0.4)" : "0.5px solid transparent",
                background: activePanel === item.key ? "rgba(34,197,94,0.12)" : "transparent",
                color: activePanel === item.key ? "#22c55e" : "rgba(255,255,255,0.5)",
                fontSize: "14px", fontWeight: activePanel === item.key ? 600 : 400,
                display: "flex", alignItems: "center", gap: "10px",
                padding: "0 14px", cursor: "pointer",
                transition: "all 0.2s", marginBottom: "6px",
                fontFamily: "'DM Sans', sans-serif",
              }}>
                <span style={{ fontSize: "16px" }}>{item.emoji}</span>
                {item.label}
              </button>
            ))}
 
            {/* Stats */}
            {activePanel === "tasks" && tasks.length > 0 && (
              <div style={{ marginTop: "24px" }}>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", fontWeight: 600, marginBottom: "12px" }}>STATS</div>
                <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "12px", padding: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>Completed:</span>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#22c55e" }}>{progress}%</span>
                  </div>
                  <div style={{ height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "999px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#16a34a,#22c55e)", borderRadius: "999px", transition: "width 0.4s" }} />
                  </div>
                  <div style={{ marginTop: "10px", fontSize: "12px", color: "rgba(255,255,255,0.35)", lineHeight: 1.8 }}>
                    <div>Total: <strong style={{ color: "#e2e8f0" }}>{tasks.length}</strong></div>
                    <div>Active: <strong style={{ color: "#f59e0b" }}>{tasks.filter(t => !t.completed).length}</strong></div>
                    <div>Done: <strong style={{ color: "#22c55e" }}>{completedCount}</strong></div>
                  </div>
                </div>
              </div>
            )}
          </div>
 
          {/* Content */}
          <div style={{ flex: 1, padding: "28px", overflowY: "auto", maxHeight: "calc(100vh - 65px)" }}>
 
            {activePanel === "tasks" && (
              <div style={{ maxWidth: "640px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#fff", marginBottom: "20px" }}>My Tasks</h1>
 
                {/* Input Card */}
                <div style={{
                  background: "rgba(255,255,255,0.07)", border: "0.5px solid rgba(255,255,255,0.12)",
                  borderRadius: "16px", padding: "18px", marginBottom: "16px", backdropFilter: "blur(12px)",
                }}>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && addTask()}
                      placeholder="Add a new task…"
                      style={{
                        flex: 1, height: "42px", padding: "0 14px",
                        background: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.12)",
                        borderRadius: "10px", color: "#e2e8f0", fontSize: "14px",
                        fontFamily: "'DM Sans', sans-serif", outline: "none", transition: "border 0.2s, box-shadow 0.2s",
                      }}
                      onFocus={e => { e.target.style.borderColor = "#22c55e"; e.target.style.boxShadow = "0 0 0 2px rgba(34,197,94,0.15)"; }}
                      onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; e.target.style.boxShadow = "none"; }}
                    />
                    <button onClick={addTask} style={{
                      height: "42px", padding: "0 18px", borderRadius: "10px",
                      background: "#22c55e", border: "none", color: "#fff",
                      fontSize: "14px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                      fontFamily: "'DM Sans', sans-serif",
                    }}>+ Add</button>
                  </div>
 
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                    {/* Priority */}
                    {Object.entries(PRIORITIES).map(([key, p]) => (
                      <button key={key} onClick={() => setPriority(key)} style={{
                        height: "30px", padding: "0 12px", borderRadius: "8px",
                        border: `0.5px solid ${priority === key ? p.color : "rgba(255,255,255,0.15)"}`,
                        background: priority === key ? p.bg : "transparent",
                        color: priority === key ? p.color : "rgba(255,255,255,0.45)",
                        fontSize: "12px", fontWeight: 600, cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s",
                      }}>{p.label}</button>
                    ))}
 
                    {/* Due date */}
                    <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{
                      height: "30px", padding: "0 10px",
                      background: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.15)",
                      borderRadius: "8px", color: dueDate ? "#e2e8f0" : "rgba(255,255,255,0.35)",
                      fontSize: "12px", fontFamily: "'DM Mono', monospace", cursor: "pointer", outline: "none",
                    }} />
 
                    {/* Color picker */}
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", marginLeft: "4px" }}>
                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>Color:</span>
                      {TASK_COLORS.map(c => (
                        <button key={c} onClick={() => setTaskColor(c)} style={{
                          width: "18px", height: "18px", borderRadius: "50%", background: c,
                          border: taskColor === c ? "2px solid #22c55e" : c === "#ffffff" ? "1px solid rgba(255,255,255,0.3)" : "2px solid transparent",
                          cursor: "pointer", transition: "transform 0.15s",
                          transform: taskColor === c ? "scale(1.25)" : "scale(1)",
                        }} />
                      ))}
                    </div>
                  </div>
                </div>
 
                {/* Filters */}
                <div style={{ display: "flex", gap: "6px", marginBottom: "14px", flexWrap: "wrap" }}>
                  {FILTERS.map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{
                      height: "32px", padding: "0 14px", borderRadius: "999px",
                      border: `0.5px solid ${filter === f ? "#22c55e" : "rgba(255,255,255,0.15)"}`,
                      background: filter === f ? "rgba(34,197,94,0.12)" : "transparent",
                      color: filter === f ? "#22c55e" : "rgba(255,255,255,0.45)",
                      fontSize: "13px", fontWeight: filter === f ? 600 : 400,
                      cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s",
                    }}>{f}</button>
                  ))}
                  {completedCount > 0 && (
                    <button onClick={clearCompleted} style={{
                      height: "32px", padding: "0 14px", borderRadius: "999px",
                      border: "0.5px solid rgba(244,63,94,0.3)", background: "transparent",
                      color: "#f43f5e", fontSize: "13px", cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif", marginLeft: "auto",
                    }}>Remove completed tasks</button>
                  )}
                </div>
 
                {/* Task list */}
                <div style={{ animation: "fadeIn 0.3s ease" }}>
                  {filtered.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "50px 0", color: "rgba(255,255,255,0.3)" }}>
                      <div style={{ fontSize: "36px", marginBottom: "10px" }}>✓</div>
                      <div style={{ fontSize: "14px" }}>No tasks yet</div>
                    </div>
                  ) : (
                    filtered.map(task => (
                      <TaskItem
                        key={task.id} task={task}
                        onToggle={toggleTask} onDelete={deleteTask}
                        onEdit={t => { setEditingTask(t); setEditText(t.text); setEditColor(t.color || "#ffffff"); }}
                        onDragStart={setDragId} onDragOver={setDragOverId} onDrop={handleDrop}
                        isDragging={dragId === task.id}
                      />
                    ))
                  )}
                </div>
              </div>
            )}
 
            {activePanel === "notes" && (
              <div style={{ maxWidth: "640px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#fff", marginBottom: "20px" }}>Notes</h1>
                <NotesPanel />
              </div>
            )}
          </div>
        </div>
      </div>
 
      {/* Edit Modal */}
      {editingTask && (
        <div onClick={e => e.target === e.currentTarget && setEditingTask(null)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 100, backdropFilter: "blur(6px)", padding: "20px",
        }}>
          <div style={{
            background: "rgba(15,23,42,0.95)", border: "0.5px solid rgba(255,255,255,0.12)",
            borderRadius: "18px", padding: "24px", width: "100%", maxWidth: "420px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.6)", animation: "slideIn 0.2s ease",
          }}>
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#fff", marginBottom: "16px" }}>Edit task</h3>
            <input
              autoFocus value={editText}
              onChange={e => setEditText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && saveEdit()}
              style={{
                width: "100%", height: "42px", padding: "0 14px",
                background: "rgba(255,255,255,0.08)", border: "0.5px solid #22c55e",
                boxShadow: "0 0 0 2px rgba(34,197,94,0.15)",
                borderRadius: "10px", color: "#e2e8f0", fontSize: "14px",
                fontFamily: "'DM Sans', sans-serif", outline: "none", marginBottom: "14px",
              }}
            />
            {/* Color picker in edit */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>Choose a color:</div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {TASK_COLORS.map(c => (
                  <button key={c} onClick={() => setEditColor(c)} style={{
                    width: "24px", height: "24px", borderRadius: "50%", background: c,
                    border: editColor === c ? "2px solid #22c55e" : c === "#ffffff" ? "1px solid rgba(255,255,255,0.3)" : "2px solid transparent",
                    cursor: "pointer", transform: editColor === c ? "scale(1.2)" : "scale(1)", transition: "transform 0.15s",
                  }} />
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setEditingTask(null)} style={{
                height: "38px", padding: "0 16px", borderRadius: "8px",
                border: "0.5px solid rgba(255,255,255,0.15)", background: "transparent",
                color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: "14px",
                fontFamily: "'DM Sans', sans-serif",
              }}>Cancel</button>
              <button onClick={saveEdit} style={{
                height: "38px", padding: "0 20px", borderRadius: "8px",
                background: "#22c55e", border: "none", color: "#fff",
                cursor: "pointer", fontSize: "14px", fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
              }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}