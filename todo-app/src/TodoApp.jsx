import { useState, useEffect, useRef, useCallback } from "react";

const PRIORITIES = {
  high: { label: "High", color: "#f43f5e", bg: "rgba(244,63,94,0.12)" },
  medium: { label: "Medium", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  low: { label: "Low", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
};

const FILTERS = ["All", "Active", "Completed"];

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
      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
}

function GripIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="9" cy="6" r="1" fill="currentColor" stroke="none"/>
      <circle cx="15" cy="6" r="1" fill="currentColor" stroke="none"/>
      <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none"/>
      <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none"/>
      <circle cx="9" cy="18" r="1" fill="currentColor" stroke="none"/>
      <circle cx="15" cy="18" r="1" fill="currentColor" stroke="none"/>
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
    </svg>
  );
}

function TaskItem({ task, onToggle, onDelete, onEdit, onDragStart, onDragOver, onDrop, isDragging, theme }) {
  const [hovering, setHovering] = useState(false);
  const p = PRIORITIES[task.priority];
  const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date();

  const cardBg = theme === "dark" ? (hovering ? "#1e293b" : "#131c2e") : (hovering ? "#f1f5f9" : "#ffffff");
  const textColor = theme === "dark" ? "#e2e8f0" : "#1e293b";
  const mutedColor = theme === "dark" ? "#64748b" : "#94a3b8";
  const borderColor = theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";

  return (
    <div
      draggable
      onDragStart={() => onDragStart(task.id)}
      onDragOver={(e) => { e.preventDefault(); onDragOver(task.id); }}
      onDrop={onDrop}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{
        display: "flex", alignItems: "center", gap: "12px",
        padding: "14px 16px",
        background: cardBg,
        border: `1px solid ${borderColor}`,
        borderLeft: `3px solid ${task.completed ? "transparent" : p.color}`,
        borderRadius: "12px",
        marginBottom: "8px",
        opacity: isDragging ? 0.4 : task.completed ? 0.55 : 1,
        transition: "all 0.2s ease",
        cursor: "grab",
        animation: "slideIn 0.25s ease",
      }}
    >
      {/* Grip */}
      <div style={{ color: mutedColor, opacity: hovering ? 1 : 0, transition: "opacity 0.2s", flexShrink: 0 }}>
        <GripIcon />
      </div>

      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        style={{
          width: "22px", height: "22px", borderRadius: "6px", border: `2px solid ${task.completed ? "#22c55e" : p.color}`,
          background: task.completed ? "#22c55e" : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", flexShrink: 0, color: "#fff",
          transition: "all 0.2s ease",
        }}
      >
        {task.completed && <CheckIcon />}
      </button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: "15px", fontWeight: 500, color: textColor,
          textDecoration: task.completed ? "line-through" : "none",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          fontFamily: "'DM Sans', sans-serif",
        }}>{task.text}</div>
        <div style={{ display: "flex", gap: "8px", marginTop: "4px", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{
            fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em",
            color: p.color, background: p.bg,
            padding: "2px 8px", borderRadius: "999px",
          }}>{p.label.toUpperCase()}</span>
          {task.dueDate && (
            <span style={{
              fontSize: "11px", color: isOverdue ? "#f43f5e" : mutedColor,
              fontFamily: "monospace",
            }}>
              {isOverdue ? "⚠ " : "📅 "}{task.dueDate}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "6px", opacity: hovering ? 1 : 0, transition: "opacity 0.2s" }}>
        <button onClick={() => onEdit(task)} style={{
          width: "30px", height: "30px", borderRadius: "8px", border: "none",
          background: "rgba(34,197,94,0.1)", color: "#22c55e",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", transition: "background 0.2s",
        }}><EditIcon /></button>
        <button onClick={() => onDelete(task.id)} style={{
          width: "30px", height: "30px", borderRadius: "8px", border: "none",
          background: "rgba(244,63,94,0.1)", color: "#f43f5e",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", transition: "background 0.2s",
        }}><TrashIcon /></button>
      </div>
    </div>
  );
}

export default function TodoApp() {
  const [tasks, setTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tasks_v2")) || []; } catch { return []; }
  });
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [filter, setFilter] = useState("All");
  const [time, setTime] = useState(formatTime());
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const [editingTask, setEditingTask] = useState(null);
  const [editText, setEditText] = useState("");
  const [dragId, setDragId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setTime(formatTime()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks_v2", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const isDark = theme === "dark";
  const bg = isDark ? "#0f172a" : "#f8fafc";
  const cardBg = isDark ? "#131c2e" : "#ffffff";
  const textPrimary = isDark ? "#e2e8f0" : "#1e293b";
  const textMuted = isDark ? "#64748b" : "#94a3b8";
  const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const inputBg = isDark ? "#1e293b" : "#f1f5f9";

  const addTask = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    const newTask = { id: Date.now(), text, priority, dueDate, completed: false, createdAt: new Date().toISOString() };
    setTasks(prev => [newTask, ...prev]);
    setInput("");
    setDueDate("");
  }, [input, priority, dueDate]);

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const saveEdit = () => {
    if (!editText.trim() || !editingTask) return;
    setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, text: editText } : t));
    setEditingTask(null);
    setEditText("");
  };

  const clearCompleted = () => setTasks(prev => prev.filter(t => !t.completed));

  const filtered = tasks.filter(t => {
    if (filter === "Active") return !t.completed;
    if (filter === "Completed") return t.completed;
    return true;
  });

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Drag and drop
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
    setDragId(null);
    setDragOverId(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "'DM Sans', 'Segoe UI', sans-serif", transition: "background 0.3s" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: ${isDark ? "invert(1)" : "none"}; opacity: 0.5; cursor: pointer; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(34,197,94,0.3); border-radius: 999px; }
        input::placeholder { color: #64748b; }
        button:focus { outline: none; }
      `}</style>

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "40px 20px 80px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
          <div>
            <div style={{ fontSize: "13px", color: "#22c55e", fontWeight: 600, letterSpacing: "0.08em", marginBottom: "4px", fontFamily: "'DM Mono', monospace" }}>
              {time}
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: 700, color: textPrimary, lineHeight: 1.2 }}>My Tasks</h1>
            <div style={{ fontSize: "13px", color: textMuted, marginTop: "4px" }}>{formatDate()}</div>
          </div>
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            style={{
              width: "40px", height: "40px", borderRadius: "10px",
              border: `1px solid ${border}`, background: cardBg,
              color: textMuted, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "all 0.2s",
            }}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>

        {/* Progress */}
        {tasks.length > 0 && (
          <div style={{ marginBottom: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "13px", color: textMuted }}>{completedCount} of {tasks.length} completed</span>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#22c55e" }}>{progress}%</span>
            </div>
            <div style={{ height: "6px", background: isDark ? "#1e293b" : "#e2e8f0", borderRadius: "999px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #16a34a, #22c55e)", borderRadius: "999px", transition: "width 0.4s ease" }} />
            </div>
          </div>
        )}

        {/* Input Card */}
        <div style={{
          background: cardBg, border: `1px solid ${border}`, borderRadius: "16px",
          padding: "20px", marginBottom: "20px",
          boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.06)",
        }}>
          <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addTask()}
              placeholder="Add a new task..."
              style={{
                flex: 1, height: "44px", padding: "0 16px",
                background: inputBg, border: `1px solid ${border}`,
                borderRadius: "10px", color: textPrimary, fontSize: "15px",
                fontFamily: "'DM Sans', sans-serif",
                outline: "none", transition: "border 0.2s, box-shadow 0.2s",
              }}
              onFocus={e => { e.target.style.borderColor = "#22c55e"; e.target.style.boxShadow = "0 0 0 3px rgba(34,197,94,0.15)"; }}
              onBlur={e => { e.target.style.borderColor = border; e.target.style.boxShadow = "none"; }}
            />
            <button
              onClick={addTask}
              style={{
                height: "44px", padding: "0 20px", borderRadius: "10px",
                background: "#22c55e", border: "none", color: "#fff",
                fontSize: "15px", fontWeight: 600, cursor: "pointer",
                transition: "all 0.2s", fontFamily: "'DM Sans', sans-serif",
                whiteSpace: "nowrap",
              }}
              onMouseOver={e => e.target.style.background = "#16a34a"}
              onMouseOut={e => e.target.style.background = "#22c55e"}
            >+ Add</button>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {/* Priority */}
            <div style={{ display: "flex", gap: "6px" }}>
              {Object.entries(PRIORITIES).map(([key, p]) => (
                <button key={key} onClick={() => setPriority(key)} style={{
                  height: "32px", padding: "0 12px", borderRadius: "8px",
                  border: `1px solid ${priority === key ? p.color : border}`,
                  background: priority === key ? p.bg : "transparent",
                  color: priority === key ? p.color : textMuted,
                  fontSize: "12px", fontWeight: 600, letterSpacing: "0.05em",
                  cursor: "pointer", transition: "all 0.15s",
                  fontFamily: "'DM Sans', sans-serif",
                }}>{p.label}</button>
              ))}
            </div>

            {/* Due date */}
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              style={{
                height: "32px", padding: "0 10px",
                background: inputBg, border: `1px solid ${border}`,
                borderRadius: "8px", color: dueDate ? textPrimary : textMuted,
                fontSize: "12px", fontFamily: "'DM Mono', monospace",
                cursor: "pointer", outline: "none",
              }}
            />
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              height: "34px", padding: "0 16px", borderRadius: "999px",
              border: `1px solid ${filter === f ? "#22c55e" : border}`,
              background: filter === f ? "rgba(34,197,94,0.1)" : "transparent",
              color: filter === f ? "#22c55e" : textMuted,
              fontSize: "13px", fontWeight: filter === f ? 600 : 400,
              cursor: "pointer", transition: "all 0.15s",
              fontFamily: "'DM Sans', sans-serif",
            }}>{f}</button>
          ))}
          {completedCount > 0 && (
            <button onClick={clearCompleted} style={{
              height: "34px", padding: "0 16px", borderRadius: "999px",
              border: `1px solid ${border}`, background: "transparent",
              color: "#f43f5e", fontSize: "13px", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", marginLeft: "auto",
              transition: "all 0.15s",
            }}>Clear done</button>
          )}
        </div>

        {/* Task list */}
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: textMuted }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>✓</div>
              <div style={{ fontSize: "15px" }}>{filter === "Completed" ? "No completed tasks yet" : "No tasks here — add one above!"}</div>
            </div>
          ) : (
            filtered.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onDelete={deleteTask}
                onEdit={t => { setEditingTask(t); setEditText(t.text); }}
                onDragStart={setDragId}
                onDragOver={setDragOverId}
                onDrop={handleDrop}
                isDragging={dragId === task.id}
                theme={theme}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {tasks.length > 0 && (
          <div style={{ textAlign: "center", marginTop: "24px", fontSize: "13px", color: textMuted }}>
            {tasks.filter(t => !t.completed).length} task{tasks.filter(t => !t.completed).length !== 1 ? "s" : ""} remaining
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingTask && (
        <div
          onClick={e => e.target === e.currentTarget && setEditingTask(null)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 100, backdropFilter: "blur(4px)", padding: "20px",
          }}
        >
          <div style={{
            background: isDark ? "#131c2e" : "#fff",
            border: `1px solid ${border}`, borderRadius: "16px",
            padding: "24px", width: "100%", maxWidth: "420px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            animation: "slideIn 0.2s ease",
          }}>
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: textPrimary, marginBottom: "16px" }}>Edit task</h3>
            <input
              autoFocus
              value={editText}
              onChange={e => setEditText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && saveEdit()}
              style={{
                width: "100%", height: "44px", padding: "0 14px",
                background: inputBg, border: `1px solid #22c55e`,
                boxShadow: "0 0 0 3px rgba(34,197,94,0.15)",
                borderRadius: "10px", color: textPrimary, fontSize: "15px",
                fontFamily: "'DM Sans', sans-serif", outline: "none",
                marginBottom: "16px",
              }}
            />
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setEditingTask(null)} style={{
                height: "38px", padding: "0 16px", borderRadius: "8px",
                border: `1px solid ${border}`, background: "transparent",
                color: textMuted, cursor: "pointer", fontSize: "14px",
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
