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
 
     
 
      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <div style={{
          fontSize: "15px", fontWeight: 500, color: taskColor === "#ffffff" ? "#e2e8f0" : taskColor,
          textDecoration: task.completed ? "line-through" : "none",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          fontFamily: "'DM Sans', sans-serif",
          opacity: task.completed ? 0.6 : 1,
        }}>{task.text}</div>
        <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
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
// ── Goals Panel ──────────────────────────────────────────────
function GoalsPanel({ textColor, mutedColor }) {
  const [goals, setGoals] = useState(() => {
    try { return JSON.parse(localStorage.getItem("goals_v1")) || []; } catch { return []; }
  });
  const [goalInput, setGoalInput] = useState("");
  const [stepInputs, setStepInputs] = useState({});

  useEffect(() => { localStorage.setItem("goals_v1", JSON.stringify(goals)); }, [goals]);

  const addGoal = () => {
    const text = goalInput.trim();
    if (!text) return;
    setGoals(prev => [...prev, { id: Date.now(), text, steps: [], completed: false }]);
    setGoalInput("");
  };

  const deleteGoal = (id) => setGoals(prev => prev.filter(g => g.id !== id));

  const toggleGoal = (id) => setGoals(prev => prev.map(g => g.id === id ? { ...g, completed: !g.completed } : g));

  const addStep = (goalId) => {
    const text = (stepInputs[goalId] || "").trim();
    if (!text) return;
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, steps: [...g.steps, { id: Date.now(), text, completed: false }] } : g));
    setStepInputs(prev => ({ ...prev, [goalId]: "" }));
  };

  const toggleStep = (goalId, stepId) => {
    setGoals(prev => prev.map(g => g.id === goalId ? {
      ...g, steps: g.steps.map(s => s.id === stepId ? { ...s, completed: !s.completed } : s)
    } : g));
  };

  const deleteStep = (goalId, stepId) => {
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, steps: g.steps.filter(s => s.id !== stepId) } : g));
  };

  return (
    <div>
      {/* Goal input */}
      <div style={{
        background: "rgba(255,255,255,0.07)", border: "0.5px solid rgba(255,255,255,0.12)",
        borderRadius: "14px", padding: "14px", marginBottom: "16px", backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            value={goalInput}
            onChange={e => setGoalInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addGoal()}
            placeholder="Yeni hədəf əlavə et..."
            style={{
              flex: 1, height: "42px", padding: "0 14px",
              background: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.12)",
              borderRadius: "10px", color: textColor, fontSize: "14px",
              fontFamily: "'DM Sans', sans-serif", outline: "none",
            }}
            onFocus={e => { e.target.style.borderColor = "#22c55e"; e.target.style.boxShadow = "0 0 0 2px rgba(34,197,94,0.15)"; }}
            onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; e.target.style.boxShadow = "none"; }}
          />
          <button onClick={addGoal} style={{
            height: "42px", padding: "0 18px", borderRadius: "10px",
            background: "#22c55e", border: "none", color: "#fff",
            fontSize: "14px", fontWeight: 600, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
          }}>+ Əlavə et</button>
        </div>
      </div>

      {/* Goals list */}
      {goals.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px 0", color: "rgba(255,255,255,0.3)", fontSize: "14px" }}>
          🎯 Hələ hədəf yoxdur
        </div>
      ) : (
        goals.map(goal => {
          const doneSteps = goal.steps.filter(s => s.completed).length;
          const progress = goal.steps.length ? Math.round((doneSteps / goal.steps.length) * 100) : 0;
          return (
            <div key={goal.id} style={{
              background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.1)",
              borderRadius: "14px", padding: "14px", marginBottom: "12px",
              backdropFilter: "blur(8px)", animation: "slideIn 0.25s ease",
            }}>
              {/* Goal header */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <button onClick={() => toggleGoal(goal.id)} style={{
                  width: "22px", height: "22px", borderRadius: "6px", flexShrink: 0,
                  border: `2px solid ${goal.completed ? "#22c55e" : "#a855f7"}`,
                  background: goal.completed ? "#22c55e" : "transparent",
                  cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {goal.completed && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </button>
                <span style={{
                  flex: 1, fontSize: "15px", fontWeight: 600, color: textColor,
                  textDecoration: goal.completed ? "line-through" : "none",
                  opacity: goal.completed ? 0.5 : 1,
                }}>{goal.text}</span>
                <span style={{ fontSize: "12px", color: "#a855f7", fontWeight: 600 }}>{progress}%</span>
                <button onClick={() => deleteGoal(goal.id)} style={{
                  width: "26px", height: "26px", borderRadius: "6px", border: "none",
                  background: "rgba(244,63,94,0.12)", color: "#f43f5e",
                  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                  </svg>
                </button>
              </div>

              {/* Progress bar */}
              {goal.steps.length > 0 && (
                <div style={{ height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "999px", overflow: "hidden", marginBottom: "10px" }}>
                  <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#7c3aed,#a855f7)", borderRadius: "999px", transition: "width 0.4s" }} />
                </div>
              )}

              {/* Steps */}
              {goal.steps.map(step => (
                <div key={step.id} style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "7px 10px", marginBottom: "5px",
                  background: "rgba(255,255,255,0.04)", borderRadius: "8px",
                }}>
                  <button onClick={() => toggleStep(goal.id, step.id)} style={{
                    width: "16px", height: "16px", borderRadius: "4px", flexShrink: 0,
                    border: `1.5px solid ${step.completed ? "#22c55e" : "rgba(255,255,255,0.3)"}`,
                    background: step.completed ? "#22c55e" : "transparent",
                    cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {step.completed && <svg width="8" height="8" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </button>
                  <span style={{
                    flex: 1, fontSize: "13px", color: "rgba(255,255,255,0.7)",
                    textDecoration: step.completed ? "line-through" : "none",
                    opacity: step.completed ? 0.5 : 1,
                  }}>{step.text}</span>
                  <button onClick={() => deleteStep(goal.id, step.id)} style={{
                    width: "20px", height: "20px", borderRadius: "4px", border: "none",
                    background: "transparent", color: "rgba(244,63,94,0.6)",
                    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "14px",
                  }}>×</button>
                </div>
              ))}

              {/* Add step */}
              <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                <input
                  value={stepInputs[goal.id] || ""}
                  onChange={e => setStepInputs(prev => ({ ...prev, [goal.id]: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && addStep(goal.id)}
                  placeholder="Addım əlavə et..."
                  style={{
                    flex: 1, height: "34px", padding: "0 12px",
                    background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px", color: textColor, fontSize: "13px",
                    fontFamily: "'DM Sans', sans-serif", outline: "none",
                  }}
                />
                <button onClick={() => addStep(goal.id)} style={{
                  height: "34px", padding: "0 14px", borderRadius: "8px",
                  background: "rgba(168,85,247,0.2)", border: "0.5px solid rgba(168,85,247,0.3)",
                  color: "#a855f7", fontSize: "13px", fontWeight: 600, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                }}>+ Addım</button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
} 

// ── Budget Panel ──────────────────────────────────────────────
function BudgetPanel({ textColor, mutedColor }) {
  const [transactions, setTransactions] = useState(() => {
    try { return JSON.parse(localStorage.getItem("budget_v1")) || []; } catch { return []; }
  });
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income");
  const [currency, setCurrency] = useState("$"); {currency}

  useEffect(() => { localStorage.setItem("budget_v1", JSON.stringify(transactions)); }, [transactions]);

  const addTransaction = () => {
    const text = desc.trim();
    const num = parseFloat(amount);
    if (!text || isNaN(num) || num <= 0) return;
    setTransactions(prev => [...prev, { id: Date.now(), text, amount: num, type, date: new Date().toISOString() }]);
    setDesc(""); setAmount("");
  };

  const deleteTransaction = (id) => setTransactions(prev => prev.filter(t => t.id !== id));

  const totalIncome = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div>
      {/* Currency selector */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "14px", flexWrap: "wrap" }}>
      {[
        { symbol: "$", name: "US Dollar" },
        { symbol: "€", name: "Euro" },
        { symbol: "£", name: "British Pound" },
        { symbol: "₼", name: "Azerbaijani Manat" },
        { symbol: "₺", name: "Turkish Lira" },
        { symbol: "₽", name: "Russian Ruble" },
      ].map(c => (
        <button key={c.symbol} onClick={() => setCurrency(c.symbol)} title={c.name} style={{
          height: "30px", padding: "0 14px", borderRadius: "8px",
          border: `0.5px solid ${currency === c.symbol ? "#22c55e" : "rgba(255,255,255,0.15)"}`,
          background: currency === c.symbol ? "rgba(34,197,94,0.12)" : "transparent",
          color: currency === c.symbol ? "#22c55e" : "rgba(255,255,255,0.45)",
          fontSize: "13px", fontWeight: currency === c.symbol ? 600 : 400,
          cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
        }}>{c.symbol}</button>
      ))}
    </div>
      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "16px" }}>
        {[
          { label: "Gəlir", value: totalIncome, color: "#22c55e" },
          { label: "Xərc", value: totalExpense, color: "#f43f5e" },
          { label: "Balans", value: balance, color: balance >= 0 ? "#22c55e" : "#f43f5e" },
        ].map(card => (
          <div key={card.label} style={{
            background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.1)",
            borderRadius: "12px", padding: "12px", textAlign: "center", backdropFilter: "blur(8px)",
          }}>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>{card.label}</div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: card.color }}>
              {card.value.toFixed(2)} {currency}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div style={{
        background: "rgba(255,255,255,0.07)", border: "0.5px solid rgba(255,255,255,0.12)",
        borderRadius: "14px", padding: "14px", marginBottom: "16px", backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
          <input
            value={desc}
            onChange={e => setDesc(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTransaction()}
            placeholder="Açıqlama..."
            style={{
              flex: 1, height: "40px", padding: "0 12px",
              background: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.12)",
              borderRadius: "10px", color: textColor, fontSize: "14px",
              fontFamily: "'DM Sans', sans-serif", outline: "none",
            }}
            onFocus={e => { e.target.style.borderColor = "#22c55e"; e.target.style.boxShadow = "0 0 0 2px rgba(34,197,94,0.15)"; }}
            onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; e.target.style.boxShadow = "none"; }}
          />
          <input
            value={amount}
            onChange={e => setAmount(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTransaction()}
            placeholder="Məbləğ"
            type="number"
            step="50"
            style={{
              width: "100px", height: "40px", padding: "0 12px",
              background: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.12)",
              borderRadius: "10px", color: textColor, fontSize: "14px",
              fontFamily: "'DM Sans', sans-serif", outline: "none",
            }}
            onFocus={e => { e.target.style.borderColor = "#22c55e"; e.target.style.boxShadow = "0 0 0 2px rgba(34,197,94,0.15)"; }}
            onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; e.target.style.boxShadow = "none"; }}
          />
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {["income", "expense"].map(t => (
            <button key={t} onClick={() => setType(t)} style={{
              flex: 1, height: "36px", borderRadius: "8px", cursor: "pointer",
              border: `0.5px solid ${type === t ? (t === "income" ? "#22c55e" : "#f43f5e") : "rgba(255,255,255,0.15)"}`,
              background: type === t ? (t === "income" ? "rgba(34,197,94,0.12)" : "rgba(244,63,94,0.12)") : "transparent",
              color: type === t ? (t === "income" ? "#22c55e" : "#f43f5e") : "rgba(255,255,255,0.4)",
              fontSize: "13px", fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
            }}>{t === "income" ? "🟢 Gəlir" : "🔴 Xərc"}</button>
          ))}
          <button onClick={addTransaction} style={{
            height: "36px", padding: "0 16px", borderRadius: "8px",
            background: "#22c55e", border: "none", color: "#fff",
            fontSize: "13px", fontWeight: 600, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
          }}>+ Əlavə et</button>
        </div>
      </div>

      {/* Transactions list */}
      {transactions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px 0", color: "rgba(255,255,255,0.3)", fontSize: "14px" }}>
          💰 Hələ əməliyyat yoxdur
        </div>
      ) : (
        [...transactions].reverse().map(t => (
          <div key={t.id} style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "12px 14px", marginBottom: "8px",
            background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.1)",
            borderRadius: "12px", backdropFilter: "blur(8px)", animation: "slideIn 0.25s ease",
          }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "8px", flexShrink: 0,
              background: t.type === "income" ? "rgba(34,197,94,0.15)" : "rgba(244,63,94,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px",
            }}>{t.type === "income" ? "🟢" : "🔴"}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "14px", fontWeight: 500, color: textColor }}>{t.text}</div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>
                {new Date(t.date).toLocaleDateString("az-AZ", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: t.type === "income" ? "#22c55e" : "#f43f5e" }}>
              {t.type === "income" ? "+" : "-"}{t.amount.toFixed(2)} {currency}
            </div>
            <button onClick={() => deleteTransaction(t.id)} style={{
              width: "26px", height: "26px", borderRadius: "6px", border: "none",
              background: "rgba(244,63,94,0.12)", color: "#f43f5e",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
              </svg>
            </button>
          </div>
        ))
      )}
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
  const textColor = "#e2e8f0";
  const mutedColor = "rgba(255,255,255,0.4)";
 
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
              { key: "goals", label: "Goals", emoji: "🎯" },
              { key: "budget", label: "Budget", emoji: "💰" },
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
                  <div style={{ display: "flex", justifyContent: "space-between", height: "22px", alignItems: "center" }}>
                    <span>Total</span>
                    <strong style={{ color: "#e2e8f0" }}>{tasks.length}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", height: "22px", alignItems: "center" }}>
                   <span>Active</span>
                   <strong style={{ color: "#f59e0b" }}>{tasks.filter(t => !t.completed).length}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", height: "22px", alignItems: "center" }}>
                   <span>Done</span>
                   <strong style={{ color: "#22c55e" }}>{completedCount}</strong>
                  </div>
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
            {activePanel === "goals" && (
              <div style={{ maxWidth: "640px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#fff", marginBottom: "20px" }}>🎯 Goals</h1>
                <GoalsPanel textColor="#e2e8f0" mutedColor="rgba(255,255,255,0.4)" />
              </div>
            )}
            {activePanel === "budget" && (
              <div style={{ maxWidth: "640px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: 700, color: textColor, marginBottom: "20px" }}>💰 Budget</h1>
                <BudgetPanel textColor={textColor} mutedColor={mutedColor} />
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