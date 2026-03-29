import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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

function filterByPeriod(items, period, dateKey) {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - diff);
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPrevWeek = new Date(startOfWeek);
  startOfPrevWeek.setDate(startOfWeek.getDate() - 7);
  const endOfPrevWeek = new Date(startOfWeek);
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return items.filter(item => {
    const d = new Date(item[dateKey]);
    if (period === "today") return d.toDateString() === now.toDateString();
    if (period === "week") return d >= startOfWeek;
    if (period === "month") return d >= startOfMonth;
    if (period === "prev_week") return d >= startOfPrevWeek && d < endOfPrevWeek;
    if (period === "prev_month") return d >= startOfPrevMonth && d < endOfPrevMonth;
    return true;
  });
}

function PeriodSelector({ period, onChange }) {
  const periods = [
    { key: "all", label: "All time" },
    { key: "month", label: "This month" },
    { key: "week", label: "This week" },
    { key: "today", label: "Today" },
  ];
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {periods.map(p => (
        <button key={p.key} onClick={() => onChange(p.key)}
          className={`h-8 px-4 rounded-full text-xs font-semibold transition-all duration-150 border ${period === p.key ? "border-green-500 bg-green-500/10 text-green-400" : "border-white/15 bg-transparent text-white/45 hover:text-white/70"}`}
        >{p.label}</button>
      ))}
    </div>
  );
}

function GoalPeriodSelector({ period, onChange }) {
  const periods = [
    { key: "all", label: "All time" },
    { key: "month", label: "This month" },
    { key: "week", label: "This week" },
    { key: "today", label: "Today" },
    { key: "prev_month", label: "Last month" },
    { key: "prev_week", label: "Last week" },
  ];
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {periods.map(p => (
        <button key={p.key} onClick={() => onChange(p.key)}
          className={`h-8 px-4 rounded-full text-xs font-semibold transition-all duration-150 border ${period === p.key ? "border-green-500 bg-green-500/10 text-green-400" : "border-white/15 bg-transparent text-white/45 hover:text-white/70"}`}
        >{p.label}</button>
      ))}
    </div>
  );
}

function CheckIcon() {
  return <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
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
      onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; onDragStart(task.id); }}
      onDragEnd={() => onDragStart(null)}
      onDragOver={(e) => { e.preventDefault(); onDragOver(task.id); }}
      onDrop={onDrop}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className="flex items-center gap-3 px-4 py-3 rounded-xl mb-2 border border-white/10 cursor-grab transition-all duration-200"
      style={{
        background: hovering ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.06)",
        borderLeft: `3px solid ${task.completed ? "transparent" : p.color}`,
        opacity: isDragging ? 0.4 : task.completed ? 0.5 : 1,
        animation: "slideIn 0.25s ease",
      }}
    >
      <div className="flex-shrink-0 text-white/30 transition-opacity duration-200" style={{ opacity: hovering ? 1 : 0 }}><GripIcon /></div>

      <button onClick={() => onToggle(task.id)}
        className="flex-shrink-0 flex items-center justify-center cursor-pointer text-white transition-all duration-200 min-w-[20px] min-h-[20px] w-5 h-5 rounded-md"
        style={{ border: `2px solid ${task.completed ? "#22c55e" : p.color}`, background: task.completed ? "#22c55e" : "transparent" }}
      >
        {task.completed && <CheckIcon />}
      </button>

      <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
        <div className="text-sm font-medium truncate" style={{ color: taskColor === "#ffffff" ? "#e2e8f0" : taskColor, textDecoration: task.completed ? "line-through" : "none", opacity: task.completed ? 0.6 : 1 }}>{task.text}</div>
        <div className="flex gap-1.5 items-center flex-wrap">
          <span className="text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full" style={{ color: p.color, background: p.bg }}>{p.label.toUpperCase()}</span>
          {task.dueDate && (
            <span className="text-[10px] font-mono" style={{ color: isOverdue ? "#f43f5e" : "rgba(255,255,255,0.4)" }}>
              {isOverdue ? "⚠ " : "📅 "}{new Date(task.dueDate + "T00:00:00").toLocaleDateString("az-AZ", { day: "2-digit", month: "2-digit", year: "numeric" })}
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-1.5 transition-opacity duration-200" style={{ opacity: hovering ? 1 : 0 }}>
        <button onClick={() => onEdit(task)} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border-none" style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}><EditIcon /></button>
        <button onClick={() => onDelete(task.id)} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border-none" style={{ background: "rgba(244,63,94,0.15)", color: "#f43f5e" }}><TrashIcon /></button>
      </div>
    </div>
  );
}
function HabitsPanel({ filter, onFilterChange }) {
  const [habits, setHabits] = useState(() => {
    try { return JSON.parse(localStorage.getItem("habits_v2")) || []; } catch { return []; }
  });

  // Form state-ləri
  const [name, setName]       = useState("");
  const [type, setType]       = useState("daily");
  const [target, setTarget]   = useState(3);
  const [icon, setIcon]       = useState("⭐");
  const [diff, setDiff]       = useState("medium");
  const [color, setColor]     = useState("#22c55e");


  // Animasiya state-ləri
  const [popId, setPopId]     = useState(null);   // streak artanda
  const [shakeId, setShakeId] = useState(null);   // streak qırılanda
  const [confettiId, setConfettiId] = useState(null);

  // Edit state
  const [editingId, setEditingId]   = useState(null);
  const [editName, setEditName]     = useState("");
  const [editIcon, setEditIcon]     = useState("⭐");

  // Drag state
  const [dragId, setDragId]         = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  // Heatmap: hansı habit-in heatmap-i açıqdır
  const [heatmapId, setHeatmapId]   = useState(null);

  useEffect(() => {
    localStorage.setItem("habits_v2", JSON.stringify(habits));
  }, [habits]);

  const today     = new Date().toISOString().split("T")[0];
  const ICONS     = ["⭐","💪","📚","🏃","🧘","💧","🥗","😴","🎯","🎨","✍️","🧠"];
  const COLORS = ["#ffffff","#f43f5e","#f59e0b","#22c55e","#3b82f6","#a855f7","#ec4899","#14b8a6"];   
  const DIFFS = [
    { key:"hard",   label:"Hard",   color:"#f43f5e" },
    { key:"medium", label:"Medium", color:"#f59e0b" },
    { key:"easy",   label:"Easy",   color:"#22c55e" },
  ];

  // Bu həftənin başlanğıcı (Bazar ertəsi)
  const weekStart = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? 6 : day - 1;
    const ws = new Date(now);
    ws.setDate(now.getDate() - diff);
    ws.setHours(0,0,0,0);
    return ws.toISOString().split("T")[0];
  }, []);

  // Son 30 günün tarixlərini qaytarır (heatmap üçün)
  const last30Days = useMemo(() => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split("T")[0]);
    }
    return days;
  }, []);

  // Daily streak hesabla
  function calcDailyStreak(history) {
    let streak = 0;
    const d = new Date();
    if (!history[today]) d.setDate(d.getDate() - 1);
    while (true) {
      const key = d.toISOString().split("T")[0];
      if (!history[key]) break;
      streak++;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  }

  // Bu həftəki tamamlanma sayı
  function getWeeklyCount(history) {
    return Object.entries(history || {})
      .filter(([date]) => date >= weekStart)
      .reduce((sum, [, val]) => sum + (val || 0), 0);
  }

  // Son 7 günün completion faizi (consistency score)
  function getConsistency(habit) {
    let done = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      if (habit.type === "daily" && habit.history[key]) done++;
      if (habit.type === "weekly" && (habit.history[key] || 0) > 0) done++;
    }
    return Math.round((done / 7) * 100);
  }

  // Habit əlavə et
  const addHabit = useCallback(() => {
    const text = name.trim();
    if (!text) return;
    setHabits(prev => [...prev, {
      id: Date.now(), name: text, type, target: type === "weekly" ? target : 1,
      icon, color, difficulty: diff,
      history: {}, streak: 0, bestStreak: 0,
      archived: false,
    }]);
    setName("");
  }, [name, type, target, icon, diff, color]);

  // Daily toggle — streak + animasiya
  const toggleDaily = useCallback((id) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id || h.type !== "daily") return h;
      const done       = !h.history[today];
      const newHistory = { ...h.history, [today]: done };
      const newStreak  = calcDailyStreak(newHistory);
      const best       = Math.max(h.bestStreak || 0, newStreak);

      if (newStreak > h.streak) {
        setPopId(id);
        setTimeout(() => setPopId(null), 700);
        if (newStreak % 7 === 0) { // Hər 7 gündə confetti
          setConfettiId(id);
          setTimeout(() => setConfettiId(null), 1000);
        }
      } else if (newStreak < h.streak) {
        setShakeId(id);
        setTimeout(() => setShakeId(null), 500);
      }
      return { ...h, history: newHistory, streak: newStreak, bestStreak: best };
    }));
  }, [today, calcDailyStreak]);

  // Weekly toggle
  const toggleWeekly = useCallback((id) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id || h.type !== "weekly") return h;
      const currentCount = getWeeklyCount(h.history);
      const isAtTarget   = currentCount >= h.target;
      const diff         = isAtTarget ? -1 : 1;
      const newHistory   = { ...h.history, [today]: Math.max(0, (h.history[today] || 0) + diff) };
      const newCount     = getWeeklyCount(newHistory);
      let   newStreak    = h.streak;

      if (newCount >= h.target && currentCount < h.target) {
        newStreak = h.streak + 1;
        setPopId(id);
        setTimeout(() => setPopId(null), 700);
      } else if (newCount < h.target && currentCount >= h.target) {
        newStreak = Math.max(0, h.streak - 1);
        setShakeId(id);
        setTimeout(() => setShakeId(null), 500);
      }
      const best = Math.max(h.bestStreak || 0, newStreak);
      return { ...h, history: newHistory, streak: newStreak, bestStreak: best };
    }));
  }, [today, weekStart]);

  const deleteHabit  = (id) => setHabits(prev => prev.filter(h => h.id !== id));
  const archiveHabit = (id) => setHabits(prev => prev.map(h => h.id === id ? { ...h, archived: !h.archived } : h));

  // Edit saxla
  const saveEdit = () => {
    if (!editName.trim()) return;
    setHabits(prev => prev.map(h => h.id === editingId ? { ...h, name: editName, icon: editIcon } : h));
    setEditingId(null);
  };

  // Drag-and-drop
  const handleDrop = () => {
    if (!dragId || !dragOverId || dragId === dragOverId) return;
    setHabits(prev => {
      const arr  = [...prev];
      const from = arr.findIndex(h => h.id === dragId);
      const to   = arr.findIndex(h => h.id === dragOverId);
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
    setDragId(null); setDragOverId(null);
  };

  const activeHabits = habits.filter(h => !h.archived);
  const filtered = activeHabits.filter(h =>
    filter === "All" ? true : filter === "Daily" ? h.type === "daily" : h.type === "weekly"
  );

  // Bu həftənin overall completion faizi
  const weeklyOverall = useMemo(() => {
    // Archived filtrdədirsə hesablama lazım deyil
    if (filter === "Archived") return 0;
  
    // Filtrə görə hansı habitlər nəzərə alınacaq
    const base = filter === "Daily"
      ? activeHabits.filter(h => h.type === "daily")
      : filter === "Weekly"
      ? activeHabits.filter(h => h.type === "weekly")
      : activeHabits; // "All"
  
    if (!base.length) return 0;
  
    const total = base.reduce((sum, h) => {
      if (h.type === "daily") {
        // Yalnız bu günün tamamlanması
        return sum + (h.history[today] ? 100 : 0);
      } else {
        // Bu həftəki hədəfə nə qədər çatılıb
        return sum + Math.min((getWeeklyCount(h.history) / h.target) * 100, 100);
      }
    }, 0);
  
    return Math.round(total / base.length);
  }, [habits, weekStart, today, filter]);

  return (
    <div>
      {/* ── Həftəlik ümumi irəliləyiş ── */}
      {activeHabits.length > 0 && filter !== "Archived" && (
        <div className="rounded-2xl p-4 mb-4 border border-white/10"
          style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-white/40 font-semibold tracking-wider">WEEKLY PROGRESS</span>
            <span className="text-lg font-bold" style={{ color: weeklyOverall >= 70 ? "#22c55e" : weeklyOverall >= 40 ? "#f59e0b" : "#f43f5e" }}>
              {weeklyOverall}%
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${weeklyOverall}%`, background: weeklyOverall >= 70 ? "#22c55e" : weeklyOverall >= 40 ? "#f59e0b" : "#f43f5e" }} />
          </div>
        </div>
      )}

      {/* ── Yeni habit formu ── */}
      <div className="rounded-2xl p-4 mb-4 border border-white/10"
        style={{ background: "rgba(255,255,255,0.07)" }}>

        {/* İkon seçimi */}
        <div className="flex gap-1.5 flex-wrap mb-3">
          {ICONS.map(ic => (
            <button key={ic} onClick={() => setIcon(ic)}
              className="w-8 h-8 rounded-lg text-base cursor-pointer border transition-all"
              style={{ borderColor: icon === ic ? "#22c55e" : "transparent", background: icon === ic ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)" }}>
              {ic}
            </button>
          ))}
        </div>

        {/* Ad input */}
        <div className="flex gap-2 mb-3">
          <input value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addHabit()}
            placeholder="New habit name…"
            className="flex-1 h-11 px-4 rounded-xl text-sm outline-none"
            style={{ background: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.12)", color: "#e2e8f0", fontFamily: "'DM Sans',sans-serif" }}
            onFocus={e => { e.target.style.borderColor="#22c55e"; e.target.style.boxShadow="0 0 0 2px rgba(34,197,94,0.15)"; }}
            onBlur={e =>  { e.target.style.borderColor="rgba(255,255,255,0.12)"; e.target.style.boxShadow="none"; }}
          />
          <button onClick={addHabit}
            className="h-11 px-5 rounded-xl bg-green-500 text-white text-sm font-semibold border-none cursor-pointer">
            + Add
          </button>
        </div>

        {/* Tip, Çətinlik, Rəng */}
        <div className="flex gap-2 flex-wrap mb-3">
          {["daily","weekly"].map(t => (
            <button key={t} onClick={() => setType(t)}
              className="flex-1 h-9 rounded-lg text-sm font-semibold cursor-pointer border transition-all"
              style={{ borderColor: type===t?"#22c55e":"rgba(255,255,255,0.15)", background: type===t?"rgba(34,197,94,0.12)":"transparent", color: type===t?"#22c55e":"rgba(255,255,255,0.4)" }}>
              {t === "daily" ? "📅 Daily" : "📆 Weekly"}
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap items-center mb-3">
        {DIFFS.map(v => (
          <button key={v.key} onClick={() => setDiff(v.key)}
            className="h-7 px-3 rounded-full text-xs font-semibold cursor-pointer border transition-all"
            style={{ borderColor: diff===v.key?v.color:"rgba(255,255,255,0.15)", background: diff===v.key?v.color+"22":"transparent", color: diff===v.key?v.color:"rgba(255,255,255,0.4)" }}>
            {v.label}
          </button>
        ))}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-[11px] text-white/35">Color:</span>
            {COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)}
                className="rounded-full cursor-pointer transition-transform"
                style={{ width:16, height:16, background:c,
                        border: color===c ? "2px solid #22c55e" : c==="#ffffff" ? "1px solid rgba(255,255,255,0.3)" : "2px solid transparent",
                        transform: color===c ? "scale(1.3)" : "scale(1)" }}/>
            ))}
          </div>
        </div>

        {/* Weekly target */}
        {type === "weekly" && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/40">Target per week:</span>
            <button onClick={() => setTarget(t => Math.max(1,t-1))}
              className="w-8 h-8 rounded-lg text-white font-bold cursor-pointer border-none"
              style={{ background:"rgba(255,255,255,0.1)", fontSize:16 }}>−</button>
            <span className="text-white font-bold w-5 text-center">{target}</span>
            <button onClick={() => setTarget(t => Math.min(7,t+1))}
              className="w-8 h-8 rounded-lg text-white font-bold cursor-pointer border-none"
              style={{ background:"rgba(255,255,255,0.1)", fontSize:16 }}>+</button>
          </div>
        )}
      </div>

      {/* ── Filter ── */}
      <div className="flex gap-2 mb-4">
        {["All","Weekly","Daily","Archived"].map(f => (
          <button key={f} onClick={() => onFilterChange(f)}
            className="h-8 px-4 rounded-full text-xs font-semibold transition-all border cursor-pointer"
            style={{ borderColor: filter===f?"#22c55e":"rgba(255,255,255,0.15)", background: filter===f?"rgba(34,197,94,0.1)":"transparent", color: filter===f?"#22c55e":"rgba(255,255,255,0.45)" }}>
            {f}
          </button>
        ))}
      </div>

      {/* ── Habit siyahısı ── */}
      {(filter === "Archived" ? habits.filter(h=>h.archived) : filtered).length === 0 ? (
        <div className="text-center py-12 text-white/30 text-sm">🔁 No habits yet</div>
      ) : (
        (filter === "Archived" ? habits.filter(h=>h.archived) : filtered).map(habit => {
          const isDone        = habit.type === "daily" && !!habit.history[today];
          const weeklyCount   = habit.type === "weekly" ? getWeeklyCount(habit.history) : 0;
          const isWeeklyDone  = habit.type === "weekly" && weeklyCount >= habit.target;
          const consistency   = getConsistency(habit);
          const isPopping     = popId === habit.id;
          const isShaking     = shakeId === habit.id;
          const hasConfetti   = confettiId === habit.id;
          const diffInfo = DIFFS.find(d => d.key === (habit.difficulty || "medium")) || DIFFS[1];
          return (
            <div key={habit.id}
              draggable
              onDragStart={e => { e.dataTransfer.effectAllowed="move"; setDragId(habit.id); }}
              onDragEnd={() => setDragId(null)}
              onDragOver={e => { e.preventDefault(); setDragOverId(habit.id); }}
              onDrop={handleDrop}
              className="rounded-xl mb-2 border border-white/10 overflow-hidden transition-all duration-200"
              style={{
                background: (isDone||isWeeklyDone) ? "rgba(34,197,94,0.07)" : "rgba(255,255,255,0.06)",
                borderLeft: `3px solid ${habit.color || "#22c55e"}`,
                opacity: dragId === habit.id ? 0.4 : 1,
                cursor: "grab",
                animation: isShaking ? "shake 0.4s ease" : "slideIn 0.25s ease",
              }}>

              <div className="flex items-center gap-3 px-4 py-3">
                {/* İkon */}
                <span className="text-xl flex-shrink-0">{habit.icon || "⭐"}</span>

                {/* Toggle düyməsi */}
                {habit.type === "daily" ? (
                  <button onClick={() => toggleDaily(habit.id)}
                    className="flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center cursor-pointer text-white transition-all"
                    style={{ border:`2px solid ${isDone?"#22c55e":"rgba(255,255,255,0.3)"}`, background: isDone?"#22c55e":"transparent" }}>
                    {isDone && <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </button>
                ) : (
                  <button onClick={() => toggleWeekly(habit.id)}
                    className="flex-shrink-0 w-8 h-8 rounded-lg text-xs font-bold cursor-pointer border-none transition-all"
                    style={{ background: isWeeklyDone?"rgba(34,197,94,0.2)":"rgba(255,255,255,0.1)", color: isWeeklyDone?"#22c55e":"#e2e8f0" }}>
                    {isWeeklyDone ? "✓" : "+"}
                  </button>
                )}

                {/* Məzmun */}
                <div className="flex-1 min-w-0 min-h-0">
                  {editingId === habit.id ? (
                    <div className="flex gap-2 items-center">
                      <input value={editName} onChange={e=>setEditName(e.target.value)}
                        className="flex-1 h-8 px-2 rounded-lg text-sm outline-none"
                        style={{ background:"rgba(255,255,255,0.1)", border:"0.5px solid #22c55e", color:"#e2e8f0", fontFamily:"'DM Sans',sans-serif" }}/>
                      <button onClick={saveEdit}
                        className="h-8 px-3 rounded-lg text-xs font-semibold cursor-pointer border-none"
                        style={{ background:"#22c55e", color:"#fff" }}>Save</button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <span className="text-sm font-medium truncate min-w-0" style={{ color:"#e2e8f0", textDecoration: isDone?"line-through":"none", opacity: isDone?0.6:1 }}>
                          {habit.name}
                        </span>
                        {/* Çətinlik etiketi */}
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ color: diffInfo.color, background: diffInfo.color+"22" }}>
                          {diffInfo.label.toUpperCase()}
                        </span>
                      </div>

                      {/* Weekly progress bar */}
                      {habit.type === "weekly" && (
                        <div className="mt-1">
                          <div className="flex justify-between mb-0.5">
                            <span className="text-[10px] text-white/35">{weeklyCount}/{habit.target}</span>
                            <span className="text-[10px]" style={{ color: isWeeklyDone?"#22c55e":"rgba(255,255,255,0.3)" }}>
                              {isWeeklyDone ? "✅ Done!" : `${habit.target-weeklyCount} left`}
                            </span>
                          </div>
                          <div className="h-1 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.1)" }}>
                            <div className="h-full rounded-full transition-all duration-500"
                              style={{ width:`${Math.min((weeklyCount/habit.target)*100,100)}%`, background: isWeeklyDone?"#22c55e":"#f59e0b" }}/>
                          </div>
                        </div>
                      )}

                      {/* Consistency score */}
                      <div className="text-[10px] mt-0.5" style={{ color:"rgba(255,255,255,0.3)" }}>
                        7-day consistency: <span style={{ color: consistency>=70?"#22c55e":consistency>=40?"#f59e0b":"#f43f5e" }}>{consistency}%</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Streak — animasiyalı */}
                <div className="flex flex-col items-center flex-shrink-0 relative">
                  {hasConfetti && (
                    // Konfetti effekti — 6 kiçik dairə
                    ["#f43f5e","#f59e0b","#22c55e","#3b82f6","#a855f7","#ec4899"].map((c,i) => (
                      <div key={i} style={{
                        position:"absolute", top:0, left: (i-3)*8,
                        width:6, height:6, borderRadius:"50%", background:c,
                        animation:`confetti 0.8s ease-out ${i*80}ms forwards`,
                        pointerEvents:"none",
                      }}/>
                    ))
                  )}
                  <span style={{
                    fontSize:20,
                    display:"inline-block",
                    animation: isPopping?"streakPop 0.6s ease":undefined,
                    filter: isPopping?"drop-shadow(0 0 8px #f59e0b)":"none",
                    transition:"filter 0.3s",
                  }}>🔥</span>
                  <span className="text-xs font-bold" style={{ color: habit.streak>0?"#f59e0b":"rgba(255,255,255,0.2)" }}>
                    {habit.streak}
                  </span>
                  {(habit.bestStreak||0) > 0 && (
                    <span className="text-[9px]" style={{ color:"rgba(255,255,255,0.2)" }}>
                      best {habit.bestStreak}
                    </span>
                  )}
                </div>

                {/* Heatmap toggle + Edit + Archive düymələri */}
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => setHeatmapId(heatmapId===habit.id?null:habit.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border-none text-xs"
                    style={{ background:"rgba(59,130,246,0.12)", color:"#3b82f6" }}>
                    📊
                  </button>
                  <button onClick={() => { setEditingId(habit.id); setEditName(habit.name); setEditIcon(habit.icon||"⭐"); }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border-none"
                    style={{ background:"rgba(34,197,94,0.12)", color:"#22c55e" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button onClick={() => archiveHabit(habit.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border-none text-xs"
                    style={{ background:"rgba(245,158,11,0.12)", color:"#f59e0b" }}>
                    {habit.archived ? "↩" : "📦"}
                  </button>
                  <button onClick={() => deleteHabit(habit.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border-none"
                    style={{ background:"rgba(244,63,94,0.12)", color:"#f43f5e" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* ── Heatmap (son 30 gün) ── */}
              {heatmapId === habit.id && (
                <div className="px-4 pb-3 border-t border-white/[0.06]">
                  <div className="text-[10px] text-white/30 mt-2 mb-1.5 tracking-wider">LAST 30 DAYS</div>
                  <div style={{ display:"flex", flexDirection:"row", flexWrap:"wrap", gap:"4px" }}>
                  {[...last30Days].map(date => {
                    const val = habit.history[date];
                    const done = habit.type==="daily" ? !!val : (val||0) > 0;
                    return (
                      <div key={date}
                        title={date}
                        className="rounded-sm transition-all"
                        style={{ width:14, height:14, flexShrink:0, background: done?(habit.color||"#22c55e")+"cc":"rgba(255,255,255,0.08)", cursor:"default" }}/>
                    );
                  })}
                </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
function GymPanel() {
  const [program, setProgram] = useState(() => {
    try { return JSON.parse(localStorage.getItem("gym_program_v2")) || []; } catch { return []; }
  });
  const [logs, setLogs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("gym_logs_v2")) || []; } catch { return []; }
  });

  const [tab,          setTab]          = useState("program");
  const [newDayName,   setNewDayName]   = useState("");
  const [selectedDay,  setSelectedDay]  = useState(null); // açıq olan gün id-si
  const [exInputs,     setExInputs]     = useState({});
  const [logDayId,     setLogDayId]     = useState(null);
  const [logInputs,    setLogInputs]    = useState({});
  const [activeWorkout,setActiveWorkout]= useState(false); // "Start Workout" rejimi
  const [restTimer,    setRestTimer]    = useState(null);  // saniyə
  const [restRunning,  setRestRunning]  = useState(false);
  const [histFilter,   setHistFilter]   = useState("");    // history axtarışı
  const [dragId,       setDragId]       = useState(null);
  const [dragOverId,   setDragOverId]   = useState(null);

  // Exercise drag — gün id-si + exercise id-si
  const [exDragId,     setExDragId]     = useState(null);
  const [exDragOver,   setExDragOver]   = useState(null);
  const [exDragDayId,  setExDragDayId]  = useState(null);

  useEffect(() => { localStorage.setItem("gym_program_v2", JSON.stringify(program)); }, [program]);
  useEffect(() => { localStorage.setItem("gym_logs_v2",    JSON.stringify(logs));    }, [logs]);

  // Rest timer
  useEffect(() => {
    if (!restRunning || restTimer === null) return;
    if (restTimer <= 0) { setRestRunning(false); return; }
    const t = setTimeout(() => setRestTimer(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [restRunning, restTimer]);

  const today = new Date().toISOString().split("T")[0];

  // ─── Köməkçi funksiyalar ─────────────────────────────────────────────────

  // Müəyyən məşqin bütün log qeydlərini tapır (son 5-i)
  const getExLogs = useCallback((exName) => {
    return logs
      .filter(log => log.exercises.some(e => e.name === exName))
      .slice(-5)
      .map(log => ({ date: log.date, ...log.exercises.find(e => e.name === exName) }));
  }, [logs]);

  // Son log
  const getLastLog = useCallback((exName) => {
    for (let i = logs.length-1; i >= 0; i--) {
      const ex = logs[i].exercises.find(e => e.name === exName);
      if (ex) return ex;
    }
    return null;
  }, [logs]);

  // Personal record (ən yüksək weight × reps)
  const getPR = useCallback((exName) => {
    let best = 0;
    logs.forEach(log => {
      const ex = log.exercises.find(e => e.name === exName);
      if (ex) best = Math.max(best, (ex.weight||0) * (ex.reps||1));
    });
    return best;
  }, [logs]);

  // Həcm (volume = weight × reps × sets)
  function calcVolume(ex) {
    return ((ex.weight||0) * (ex.reps||0) * (ex.sets||1));
  }

  // Növbəti tövsiyə: son log + 2.5kg və ya +1 rep
  function getSuggestion(exName, planSets, planReps) {
    const last = getLastLog(exName);
    if (!last) return null;
    return { weight: (last.weight||0) + 2.5, reps: (last.reps||0) + 1, note: "Progressive overload suggestion" };
  }

  // Progress indicator
  function getIndicator(exName, cw, cr) {
    const last = getLastLog(exName);
    if (!last) return null;
    const w = parseFloat(cw)||0, r = parseInt(cr)||0;
    if (w > last.weight || r > last.reps) return "up";
    if (w < last.weight || r < last.reps) return "down";
    return "same";
  }

  // İndiki log-un PR olub-olmadığını yoxlayır
  function isNewPR(exName, cw, cr, sets) {
    const pr = getPR(exName);
    const vol = (parseFloat(cw)||0) * (parseInt(cr)||0) * (parseInt(sets)||1);
    return vol > pr && pr > 0;
  }

  // ─── Program funksiyaları ────────────────────────────────────────────────

  const addDay = () => {
    const text = newDayName.trim();
    if (!text) return;
    setProgram(prev => [...prev, { id: Date.now(), dayName: text, exercises: [] }]);
    setNewDayName("");
  };

  const deleteDay = (id) => setProgram(prev => prev.filter(d => d.id !== id));

  // Exercise əlavə et
  const addExercise = (dayId) => {
    const inp = exInputs[dayId] || {};
    const name = (inp.name || "").trim();
    if (!name) return;
    setProgram(prev => prev.map(d => d.id !== dayId ? d : {
      ...d, exercises: [...d.exercises, {
        id: Date.now(), name,
        sets: parseInt(inp.sets)||3,
        reps: parseInt(inp.reps)||10,
        notes: inp.notes||"",
      }]
    }));
    setExInputs(prev => ({ ...prev, [dayId]: {} }));
  };

  const deleteExercise = (dayId, exId) =>
    setProgram(prev => prev.map(d => d.id !== dayId ? d : { ...d, exercises: d.exercises.filter(e => e.id !== exId) }));

  // Exercise drag-and-drop
  const handleExDrop = (dayId) => {
    if (!exDragId || !exDragOver || exDragId === exDragOver || exDragDayId !== dayId) return;
    setProgram(prev => prev.map(d => {
      if (d.id !== dayId) return d;
      const arr  = [...d.exercises];
      const from = arr.findIndex(e => e.id === exDragId);
      const to   = arr.findIndex(e => e.id === exDragOver);
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return { ...d, exercises: arr };
    }));
    setExDragId(null); setExDragOver(null); setExDragDayId(null);
  };

  // Gün drag-and-drop
  const handleDayDrop = () => {
    if (!dragId || !dragOverId || dragId === dragOverId) return;
    setProgram(prev => {
      const arr  = [...prev];
      const from = arr.findIndex(d => d.id === dragId);
      const to   = arr.findIndex(d => d.id === dragOverId);
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
    setDragId(null); setDragOverId(null);
  };

  // ─── Log funksiyaları ────────────────────────────────────────────────────

  const saveLog = () => {
    if (!logDayId) return;
    const day = program.find(d => d.id === logDayId);
    if (!day) return;
    const exercises = day.exercises.map(ex => ({
      name: ex.name,
      weight: parseFloat(logInputs[ex.id]?.weight)||0,
      reps:   parseInt(logInputs[ex.id]?.reps)||0,
      sets:   ex.sets,
    }));
    setLogs(prev => [...prev, { id: Date.now(), date: today, dayId: logDayId, dayName: day.dayName, exercises }]);
    setLogInputs({});
    setActiveWorkout(false);
  };

  // Total volume hesabla (log forması üçün)
  const totalVolume = useMemo(() => {
    if (!logDayId) return 0;
    const day = program.find(d => d.id === logDayId);
    if (!day) return 0;
    return day.exercises.reduce((sum, ex) => {
      const w = parseFloat(logInputs[ex.id]?.weight)||0;
      const r = parseInt(logInputs[ex.id]?.reps)||0;
      return sum + w * r * ex.sets;
    }, 0);
  }, [logInputs, logDayId, program]);

  // Filter edilmiş log history
  const filteredLogs = useMemo(() => {
    if (!histFilter.trim()) return [...logs].reverse().slice(0,10);
    const q = histFilter.toLowerCase();
    return [...logs]
      .filter(l => l.dayName.toLowerCase().includes(q) || l.exercises.some(e => e.name.toLowerCase().includes(q)))
      .reverse().slice(0,10);
  }, [logs, histFilter]);

  // ─── RENDER ──────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Tab seçimi */}
      <div className="flex gap-2 mb-4">
        {[
          { key:"program", label:"📋 Program" },
          { key:"log",     label:"📝 Log"     },
          { key:"history", label:"📁 History" },
          { key:"records", label:"🏆 PRs"     },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="flex-1 h-10 rounded-xl text-sm font-semibold cursor-pointer border transition-all"
            style={{ borderColor: tab===t.key?"#22c55e":"rgba(255,255,255,0.15)", background: tab===t.key?"rgba(34,197,94,0.12)":"transparent", color: tab===t.key?"#22c55e":"rgba(255,255,255,0.4)" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══ PROGRAM TAB ══ */}
      {tab === "program" && (
        <div>
          <div className="flex gap-2 mb-4">
            <input value={newDayName} onChange={e=>setNewDayName(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&addDay()} placeholder="Day name (e.g. Push Day)…"
              className="flex-1 h-11 px-4 rounded-xl text-sm outline-none"
              style={{ background:"rgba(255,255,255,0.08)", border:"0.5px solid rgba(255,255,255,0.12)", color:"#e2e8f0", fontFamily:"'DM Sans',sans-serif" }}
              onFocus={e=>{e.target.style.borderColor="#22c55e";e.target.style.boxShadow="0 0 0 2px rgba(34,197,94,0.15)";}}
              onBlur={e=>{e.target.style.borderColor="rgba(255,255,255,0.12)";e.target.style.boxShadow="none";}}/>
            <button onClick={addDay}
              className="h-11 px-5 rounded-xl bg-green-500 text-white text-sm font-semibold border-none cursor-pointer">
              + Add
            </button>
          </div>

          {program.length === 0 ? (
            <div className="text-center py-12 text-white/30 text-sm">🏋️ No workout days yet</div>
          ) : (
            program.map(day => (
              <div key={day.id}
                draggable
                onDragStart={e=>{e.dataTransfer.effectAllowed="move";setDragId(day.id);}}
                onDragEnd={()=>setDragId(null)}
                onDragOver={e=>{e.preventDefault();setDragOverId(day.id);}}
                onDrop={handleDayDrop}
                className="rounded-2xl p-4 mb-3 border border-white/10"
                style={{ background:"rgba(255,255,255,0.06)", opacity:dragId===day.id?0.4:1, cursor:"grab", animation:"slideIn 0.25s ease" }}>

                {/* Gün başlığı */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-white">{day.dayName}</span>
                  <div className="flex gap-1.5">
                    <button onClick={()=>setSelectedDay(selectedDay===day.id?null:day.id)}
                      className="h-7 px-3 rounded-lg text-xs font-semibold cursor-pointer border"
                      style={{ borderColor:"rgba(59,130,246,0.4)", background:"rgba(59,130,246,0.1)", color:"#3b82f6" }}>
                      {selectedDay===day.id?"Close":"+ Exercise"}
                    </button>
                    <button onClick={()=>deleteDay(day.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border-none"
                      style={{ background:"rgba(244,63,94,0.12)", color:"#f43f5e" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Məşqlər */}
                {day.exercises.length === 0 ? (
                  <div className="text-xs text-white/25 py-2 text-center">No exercises yet</div>
                ) : (
                  day.exercises.map(ex => {
                    const last = getLastLog(ex.name);
                    const pr   = getPR(ex.name);
                    const exLogs = getExLogs(ex.name);
                    return (
                      <div key={ex.id}
                        draggable
                        onDragStart={e=>{e.dataTransfer.effectAllowed="move";setExDragId(ex.id);setExDragDayId(day.id);}}
                        onDragEnd={()=>{setExDragId(null);setExDragDayId(null);}}
                        onDragOver={e=>{e.preventDefault();setExDragOver(ex.id);}}
                        onDrop={()=>handleExDrop(day.id)}
                        className="flex items-start gap-2 px-3 py-2 mb-1 rounded-lg transition-all"
                        style={{ background:"rgba(255,255,255,0.04)", opacity:exDragId===ex.id?0.4:1, cursor:"grab" }}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm text-white/80">{ex.name}</span>
                            <span className="text-[10px] text-white/30">{ex.sets}×{ex.reps}</span>
                            {last && <span className="text-[10px] text-white/25">Last: {last.weight}kg×{last.reps}</span>}
                            {pr > 0 && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background:"rgba(250,204,21,0.15)", color:"#facc15" }}>PR: {pr}vol</span>}
                          </div>
                          {/* Mini trend — son 5 həcm */}
                          {exLogs.length > 1 && (
                            <div className="flex gap-1 mt-1 items-end">
                              {exLogs.map((l,i) => {
                                const vol = (l.weight||0)*(l.reps||0);
                                const maxVol = Math.max(...exLogs.map(x=>(x.weight||0)*(x.reps||0)));
                                const h = maxVol > 0 ? Math.round((vol/maxVol)*20) : 4;
                                return <div key={i} style={{ width:6, height:Math.max(4,h), borderRadius:2, background:i===exLogs.length-1?"#22c55e":"rgba(255,255,255,0.2)" }}/>;
                              })}
                              <span className="text-[9px] text-white/25 ml-1">trend</span>
                            </div>
                          )}
                          {ex.notes && <div className="text-[10px] text-white/25 mt-0.5 italic">{ex.notes}</div>}
                        </div>
                        <button onClick={()=>deleteExercise(day.id,ex.id)}
                          style={{ background:"none", border:"none", color:"rgba(244,63,94,0.5)", cursor:"pointer", fontSize:16, lineHeight:1, padding:"0 2px" }}>×</button>
                      </div>
                    );
                  })
                )}

                {/* Məşq əlavə etmə formu */}
                {selectedDay === day.id && (
                  <div className="mt-3 pt-3 border-t border-white/[0.07]">
                    <div className="flex gap-2 flex-wrap">
                      <input placeholder="Exercise name"
                        value={exInputs[day.id]?.name||""}
                        onChange={e=>setExInputs(p=>({...p,[day.id]:{...p[day.id],name:e.target.value}}))}
                        className="flex-1 h-9 px-3 rounded-lg text-sm outline-none"
                        style={{ background:"rgba(255,255,255,0.07)", border:"0.5px solid rgba(255,255,255,0.12)", color:"#e2e8f0", fontFamily:"'DM Sans',sans-serif", minWidth:120 }}/>
                      <input placeholder="Sets" type="number"
                        value={exInputs[day.id]?.sets||""}
                        onChange={e=>setExInputs(p=>({...p,[day.id]:{...p[day.id],sets:e.target.value}}))}
                        className="w-16 h-9 px-2 rounded-lg text-sm outline-none text-center"
                        style={{ background:"rgba(255,255,255,0.07)", border:"0.5px solid rgba(255,255,255,0.12)", color:"#e2e8f0", fontFamily:"'DM Mono',monospace" }}/>
                      <input placeholder="Reps" type="number"
                        value={exInputs[day.id]?.reps||""}
                        onChange={e=>setExInputs(p=>({...p,[day.id]:{...p[day.id],reps:e.target.value}}))}
                        className="w-16 h-9 px-2 rounded-lg text-sm outline-none text-center"
                        style={{ background:"rgba(255,255,255,0.07)", border:"0.5px solid rgba(255,255,255,0.12)", color:"#e2e8f0", fontFamily:"'DM Mono',monospace" }}/>
                      <input placeholder="Notes (optional)"
                        value={exInputs[day.id]?.notes||""}
                        onChange={e=>setExInputs(p=>({...p,[day.id]:{...p[day.id],notes:e.target.value}}))}
                        className="flex-1 h-9 px-3 rounded-lg text-sm outline-none"
                        style={{ background:"rgba(255,255,255,0.07)", border:"0.5px solid rgba(255,255,255,0.12)", color:"#e2e8f0", fontFamily:"'DM Sans',sans-serif", minWidth:100 }}/>
                      <button onClick={()=>addExercise(day.id)}
                        className="h-9 px-4 rounded-lg text-sm font-semibold cursor-pointer border-none"
                        style={{ background:"rgba(34,197,94,0.2)", color:"#22c55e" }}>+ Add</button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ══ LOG TAB ══ */}
      {tab === "log" && (
        <div>
          {program.length === 0 ? (
            <div className="text-center py-12 text-white/30 text-sm">First create a program</div>
          ) : (
            <>
              {/* Gün seçimi */}
              <div className="flex flex-wrap gap-2 mb-4">
                {program.map(d => (
                  <button key={d.id} onClick={()=>{setLogDayId(d.id);setLogInputs({});setActiveWorkout(false);}}
                    className="h-9 px-4 rounded-xl text-sm font-semibold cursor-pointer border transition-all"
                    style={{ borderColor:logDayId===d.id?"#22c55e":"rgba(255,255,255,0.15)", background:logDayId===d.id?"rgba(34,197,94,0.12)":"rgba(255,255,255,0.05)", color:logDayId===d.id?"#22c55e":"rgba(255,255,255,0.5)" }}>
                    {d.dayName}
                  </button>
                ))}
              </div>

              {logDayId && (() => {
                const day = program.find(d=>d.id===logDayId);
                if (!day) return null;

                return (
                  <div>
                    {/* Rest timer */}
                    <div className="flex items-center gap-3 mb-3 p-3 rounded-xl border border-white/10"
                      style={{ background:"rgba(255,255,255,0.05)" }}>
                      <span className="text-xs text-white/40">Rest Timer:</span>
                      {[60,90,120,180].map(s => (
                        <button key={s} onClick={()=>{setRestTimer(s);setRestRunning(true);}}
                          className="h-7 px-3 rounded-lg text-xs font-semibold cursor-pointer border"
                          style={{ borderColor:"rgba(59,130,246,0.3)", background:"rgba(59,130,246,0.1)", color:"#3b82f6" }}>
                          {s}s
                        </button>
                      ))}
                      {restTimer !== null && (
                        <div className="ml-auto flex items-center gap-2">
                          <span className="text-lg font-bold font-mono"
                            style={{ color: restTimer<=10?"#f43f5e":"#22c55e", animation:restTimer<=10?"timerPulse 1s infinite":undefined }}>
                            {String(Math.floor(restTimer/60)).padStart(2,"0")}:{String(restTimer%60).padStart(2,"0")}
                          </span>
                          <button onClick={()=>setRestRunning(r=>!r)}
                            className="h-7 px-2 rounded-lg text-xs cursor-pointer border-none"
                            style={{ background:restRunning?"rgba(244,63,94,0.15)":"rgba(34,197,94,0.15)", color:restRunning?"#f43f5e":"#22c55e" }}>
                            {restRunning?"Pause":"Resume"}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Volume göstəricisi */}
                    {totalVolume > 0 && (
                      <div className="flex items-center justify-between mb-3 px-3 py-2 rounded-xl border border-white/10"
                        style={{ background:"rgba(255,255,255,0.04)" }}>
                        <span className="text-xs text-white/40">Total Volume</span>
                        <span className="text-sm font-bold" style={{ color:"#3b82f6" }}>{totalVolume.toFixed(0)} kg·reps</span>
                      </div>
                    )}

                    {/* Məşqlər */}
                    <div className="rounded-2xl p-4 border border-white/10"
                      style={{ background:"rgba(255,255,255,0.06)", animation:"slideIn 0.25s ease" }}>
                      <div className="text-sm font-bold text-white mb-3">{day.dayName}</div>

                      {day.exercises.map(ex => {
                        const last      = getLastLog(ex.name);
                        const suggest   = getSuggestion(ex.name, ex.sets, ex.reps);
                        const indicator = getIndicator(ex.name, logInputs[ex.id]?.weight, logInputs[ex.id]?.reps);
                        const isPR      = isNewPR(ex.name, logInputs[ex.id]?.weight, logInputs[ex.id]?.reps, ex.sets);
                        const exVol     = calcVolume({ weight:parseFloat(logInputs[ex.id]?.weight)||0, reps:parseInt(logInputs[ex.id]?.reps)||0, sets:ex.sets });

                        return (
                          <div key={ex.id} className="mb-4 pb-4 border-b border-white/[0.06] last:border-0 last:mb-0 last:pb-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-white/80">{ex.name}</span>
                                <span className="text-[10px] text-white/30">{ex.sets}×{ex.reps}</span>
                                {isPR && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                                    style={{ background:"rgba(250,204,21,0.2)", color:"#facc15", animation:"prPulse 1.5s infinite" }}>
                                    🏆 NEW PR!
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {exVol > 0 && <span className="text-[10px] text-white/30">{exVol.toFixed(0)}vol</span>}
                                {indicator && (
                                  <span className="text-sm font-bold"
                                    style={{ color: indicator==="up"?"#22c55e":indicator==="down"?"#f43f5e":"#f59e0b" }}>
                                    {indicator==="up"?"↑":indicator==="down"?"↓":"="}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Son nəticə + tövsiyə */}
                            {last && (
                              <div className="text-[10px] text-white/25 mb-1.5">
                                Last: {last.weight}kg × {last.reps} reps
                                {suggest && <span className="ml-2 text-green-400/50">→ Try {suggest.weight}kg × {suggest.reps}</span>}
                              </div>
                            )}

                            <div className="flex gap-2">
                              <input placeholder={suggest?`${suggest.weight}kg`:last?`${last.weight}kg`:"Weight (kg)"}
                                type="number"
                                value={logInputs[ex.id]?.weight||""}
                                onChange={e=>setLogInputs(p=>({...p,[ex.id]:{...p[ex.id],weight:e.target.value}}))}
                                className="flex-1 h-9 px-3 rounded-lg text-sm outline-none"
                                style={{ background:"rgba(255,255,255,0.07)", border:"0.5px solid rgba(255,255,255,0.12)", color:"#e2e8f0", fontFamily:"'DM Mono',monospace" }}/>
                              <input placeholder={suggest?`${suggest.reps}`:last?`${last.reps}`:"Reps"}
                                type="number"
                                value={logInputs[ex.id]?.reps||""}
                                onChange={e=>setLogInputs(p=>({...p,[ex.id]:{...p[ex.id],reps:e.target.value}}))}
                                className="flex-1 h-9 px-3 rounded-lg text-sm outline-none"
                                style={{ background:"rgba(255,255,255,0.07)", border:"0.5px solid rgba(255,255,255,0.12)", color:"#e2e8f0", fontFamily:"'DM Mono',monospace" }}/>
                              {/* Rest timer tətikləyici */}
                              <button onClick={()=>{setRestTimer(90);setRestRunning(true);}}
                                className="h-9 px-3 rounded-lg text-xs cursor-pointer border-none"
                                style={{ background:"rgba(59,130,246,0.15)", color:"#3b82f6" }}>⏱</button>
                            </div>
                          </div>
                        );
                      })}

                      <button onClick={saveLog}
                        className="w-full h-11 mt-2 rounded-xl bg-green-500 text-white text-sm font-semibold border-none cursor-pointer">
                        💾 Save Workout
                      </button>
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </div>
      )}

      {/* ══ HISTORY TAB ══ */}
      {tab === "history" && (
        <div>
          <div className="relative mb-3">
            <input value={histFilter} onChange={e=>setHistFilter(e.target.value)}
              placeholder="Filter by exercise or day…"
              className="w-full h-10 pl-9 pr-4 rounded-xl text-sm outline-none"
              style={{ background:"rgba(255,255,255,0.07)", border:"0.5px solid rgba(255,255,255,0.12)", color:"#e2e8f0", fontFamily:"'DM Sans',sans-serif" }}/>
            <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,0.3)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            </span>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-white/30 text-sm">📁 No workout history yet</div>
          ) : (
            filteredLogs.map(log => (
              <div key={log.id} className="rounded-xl px-4 py-3 mb-2 border border-white/10"
                style={{ background:"rgba(255,255,255,0.05)", animation:"slideIn 0.25s ease" }}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-semibold text-white/70">{log.dayName}</span>
                  <span className="text-[10px] text-white/25 font-mono">{log.date}</span>
                </div>
                {log.exercises.map((ex,i) => {
                  const vol = (ex.weight||0)*(ex.reps||0)*(ex.sets||1);
                  return (
                    <div key={i} className="flex items-center justify-between py-0.5">
                      <span className="text-xs text-white/40 truncate">{ex.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-white/30">{ex.weight}kg × {ex.reps}</span>
                        <span className="text-[10px] text-white/20">{vol.toFixed(0)}vol</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      )}

      {/* ══ PERSONAL RECORDS TAB ══ */}
      {tab === "records" && (
        <div>
          {/* Bütün unikal məşqləri tap */}
          {(() => {
            const allExNames = [...new Set(logs.flatMap(l => l.exercises.map(e => e.name)))];
            if (allExNames.length === 0) return (
              <div className="text-center py-12 text-white/30 text-sm">🏆 No records yet</div>
            );
            return allExNames.map(exName => {
              const pr = getPR(exName);
              const last = getLastLog(exName);
              const exLogs = getExLogs(exName);
              return (
                <div key={exName} className="rounded-xl px-4 py-3 mb-2 border border-white/10"
                  style={{ background:"rgba(255,255,255,0.055)", animation:"slideIn 0.25s ease" }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-white/80">{exName}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background:"rgba(250,204,21,0.15)", color:"#facc15" }}>
                      🏆 {pr.toFixed(0)} vol
                    </span>
                  </div>
                  {last && (
                    <div className="text-[10px] text-white/30">
                      Latest: {last.weight}kg × {last.reps} reps
                    </div>
                  )}
                  {/* Mini bar chart */}
                  {exLogs.length > 1 && (
                    <div className="flex gap-1 mt-2 items-end">
                      {exLogs.map((l,i) => {
                        const vol = (l.weight||0)*(l.reps||0);
                        const maxVol = Math.max(...exLogs.map(x=>(x.weight||0)*(x.reps||0)));
                        const h = maxVol>0?Math.round((vol/maxVol)*32):4;
                        return (
                          <div key={i} style={{ flex:1, height:Math.max(4,h), borderRadius:3, background:i===exLogs.length-1?"#22c55e":"rgba(255,255,255,0.15)" }}/>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            });
          })()}
        </div>
      )}
    </div>
  );
}
function GoalsPanel({ textColor, period, onPeriodChange }) {
  const [goals, setGoals] = useState(() => {
    try { return JSON.parse(localStorage.getItem("goals_v1")) || []; } catch { return []; }
  });
  const [goalInput, setGoalInput] = useState("");
  const [stepInputs, setStepInputs] = useState({});
  const [dragId, setDragId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  useEffect(() => { localStorage.setItem("goals_v1", JSON.stringify(goals)); }, [goals]);

  const filteredGoals = filterByPeriod(goals, period, "createdAt");

  const totalProgress = filteredGoals.length === 0 ? 0 : Math.round(
    filteredGoals.reduce((sum, goal) => {
      if (goal.steps.length === 0) return sum + (goal.completed ? 100 : 0);
      const done = goal.steps.filter(s => s.completed).length;
      return sum + (done / goal.steps.length) * 100;
    }, 0) / filteredGoals.length
  );

  const addGoal = () => {
    const text = goalInput.trim();
    if (!text) return;
    setGoals(prev => [...prev, { id: Date.now(), text, steps: [], completed: false, createdAt: new Date().toISOString() }]);
    setGoalInput("");
  };

  const deleteGoal = (id) => setGoals(prev => prev.filter(g => g.id !== id));

  const toggleGoal = (id) => setGoals(prev => prev.map(g => {
    if (g.id !== id) return g;
    const nowCompleted = !g.completed;
    return { ...g, completed: nowCompleted, steps: g.steps.map(s => ({ ...s, completed: nowCompleted })) };
  }));

  const addStep = (goalId) => {
    const text = (stepInputs[goalId] || "").trim();
    if (!text) return;
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, steps: [...g.steps, { id: Date.now(), text, completed: false }] } : g));
    setStepInputs(prev => ({ ...prev, [goalId]: "" }));
  };

  const toggleStep = (goalId, stepId) => setGoals(prev => prev.map(g => g.id === goalId ? { ...g, steps: g.steps.map(s => s.id === stepId ? { ...s, completed: !s.completed } : s) } : g));
  const deleteStep = (goalId, stepId) => setGoals(prev => prev.map(g => g.id === goalId ? { ...g, steps: g.steps.filter(s => s.id !== stepId) } : g));
  const handleGoalDrop = () => {
    if (dragId === null || dragOverId === null || dragId === dragOverId) return;
    setGoals(prev => {
      const arr = [...prev];
      const from = arr.findIndex(g => g.id === dragId);
      const to   = arr.findIndex(g => g.id === dragOverId);
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
    setDragId(null); setDragOverId(null);
  };
  return (
    <div>
      <GoalPeriodSelector period={period} onChange={onPeriodChange} />

      {filteredGoals.length > 0 && (
        <div className="rounded-2xl p-4 mb-4 border" style={{ background: "rgba(168,85,247,0.08)", borderColor: "rgba(168,85,247,0.2)" }}>
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-sm text-white/50">Overall progress</span>
            <span className="text-xl font-bold text-purple-400">{totalProgress}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${totalProgress}%`, background: "linear-gradient(90deg,#7c3aed,#a855f7)" }} />
          </div>
          <div className="flex justify-between">
            <span className="text-[11px] text-white/30">{filteredGoals.filter(g => g.completed).length} of {filteredGoals.length} goals done</span>
            <span className="text-[11px] text-white/30">{filteredGoals.reduce((s, g) => s + g.steps.filter(st => st.completed).length, 0)} of {filteredGoals.reduce((s, g) => s + g.steps.length, 0)} steps done</span>
          </div>
        </div>
      )}

      <div className="rounded-2xl p-4 mb-4 border border-white/10" style={{ background: "rgba(255,255,255,0.07)" }}>
        <div className="flex gap-2">
          <input value={goalInput} onChange={e => setGoalInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addGoal()}
            placeholder="Add new goal..." className="flex-1 h-11 px-4 rounded-xl text-sm outline-none"
            style={{ background: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.12)", color: textColor, fontFamily: "'DM Sans',sans-serif" }}
            onFocus={e => { e.target.style.borderColor = "#22c55e"; e.target.style.boxShadow = "0 0 0 2px rgba(34,197,94,0.15)"; }}
            onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; e.target.style.boxShadow = "none"; }}
          />
          <button onClick={addGoal} className="h-11 px-5 rounded-xl bg-green-500 text-white text-sm font-semibold border-none cursor-pointer whitespace-nowrap">+ Add</button>
        </div>
      </div>

      {filteredGoals.length === 0 ? (
        <div className="text-center py-12 text-white/30 text-sm">🎯 No goals yet</div>
      ) : (
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
          {filteredGoals.map(goal => {
            const doneSteps = goal.steps.filter(s => s.completed).length;
            const progress = goal.steps.length ? Math.round((doneSteps / goal.steps.length) * 100) : (goal.completed ? 100 : 0);
            return (
            <div key={goal.id}
              draggable
              onDragStart={e => { e.dataTransfer.effectAllowed = "move"; setDragId(goal.id); }}
              onDragEnd={() => setDragId(null)}
              onDragOver={e => { e.preventDefault(); setDragOverId(goal.id); }}
              onDrop={handleGoalDrop}
              className="rounded-2xl p-4 border border-white/10"
              style={{ background: "rgba(255,255,255,0.06)", animation: "slideIn 0.25s ease", opacity: dragId === goal.id ? 0.4 : 1, cursor: "grab" }}>                <div className="flex items-center gap-2.5 mb-2.5">
                  <button onClick={() => toggleGoal(goal.id)} className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center cursor-pointer text-white transition-all min-w-[22px] min-h-[22px]"
                    style={{ border: `2px solid ${goal.completed ? "#22c55e" : "#a855f7"}`, background: goal.completed ? "#22c55e" : "transparent" }}>
                    {goal.completed && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  </button>
                  <span className="flex-1 text-sm font-semibold truncate min-w-0" style={{ color: textColor, textDecoration: goal.completed ? "line-through" : "none", opacity: goal.completed ? 0.5 : 1 }}>{goal.text}</span>
                  <span className="text-xs font-semibold text-purple-400">{progress}%</span>
                  <button onClick={() => deleteGoal(goal.id)} className="w-6 h-6 rounded-md flex items-center justify-center cursor-pointer border-none" style={{ background: "rgba(244,63,94,0.12)", color: "#f43f5e" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,6 5,6 21,6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /></svg>
                  </button>
                </div>

                {goal.steps.length > 0 && (
                  <div className="h-1 rounded-full overflow-hidden mb-2.5" style={{ background: "rgba(255,255,255,0.1)" }}>
                    <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: "linear-gradient(90deg,#7c3aed,#a855f7)" }} />
                  </div>
                )}

                {goal.steps.map(step => (
                  <div key={step.id} className="flex items-center gap-2 px-2.5 py-1.5 mb-1 rounded-lg" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <button onClick={() => toggleStep(goal.id, step.id)} className="flex-shrink-0 rounded flex items-center justify-center cursor-pointer text-white transition-all" style={{ width: "16px", height: "16px", border: `1.5px solid ${step.completed ? "#22c55e" : "rgba(255,255,255,0.3)"}`, background: step.completed ? "#22c55e" : "transparent" }}>
                      {step.completed && <svg width="8" height="8" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </button>
                    <span className="flex-1 text-[13px] truncate min-w-0" style={{ color: "rgba(255,255,255,0.7)", textDecoration: step.completed ? "line-through" : "none", opacity: step.completed ? 0.5 : 1 }}>{step.text}</span>
                    <button onClick={() => deleteStep(goal.id, step.id)} className="flex items-center justify-center cursor-pointer border-none bg-transparent text-sm" style={{ width: "20px", height: "20px", color: "rgba(244,63,94,0.6)" }}>×</button>
                  </div>
                ))}

                <div className="flex gap-1.5 mt-2">
                  <input value={stepInputs[goal.id] || ""} onChange={e => setStepInputs(prev => ({ ...prev, [goal.id]: e.target.value }))} onKeyDown={e => e.key === "Enter" && addStep(goal.id)}
                    placeholder="Add step..." className="flex-1 h-9 px-3 rounded-lg text-[13px] outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.1)", color: textColor, fontFamily: "'DM Sans',sans-serif" }}
                  />
                  <button onClick={() => addStep(goal.id)} className="h-9 px-3.5 rounded-lg text-[13px] font-semibold cursor-pointer border" style={{ background: "rgba(168,85,247,0.2)", borderColor: "rgba(168,85,247,0.3)", color: "#a855f7" }}>+ Step</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BudgetPanel({ textColor, period, onPeriodChange }) {
  const [transactions, setTransactions] = useState(() => {
    try { return JSON.parse(localStorage.getItem("budget_v1")) || []; } catch { return []; }
  });
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income");
  const [currency, setCurrency] = useState("$");
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);

  useEffect(() => { localStorage.setItem("budget_v1", JSON.stringify(transactions)); }, [transactions]);

  const addTransaction = () => {
    const text = desc.trim();
    const num = parseFloat(amount);
    if (!text || isNaN(num) || num <= 0) return;
    setTransactions(prev => [...prev, { id: Date.now(), text, amount: num, type, date: new Date().toISOString() }]);
    setDesc(""); setAmount("");
  };

  const deleteTransaction = (id) => setTransactions(prev => prev.filter(t => t.id !== id));
  const filteredTransactions = filterByPeriod(transactions, period, "date");
  const totalIncome = filteredTransactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = filteredTransactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div>
      <PeriodSelector period={period} onChange={onPeriodChange} />

      <div className="relative inline-block mb-4">
        <button onClick={() => setShowCurrencyMenu(m => !m)} className="h-9 px-4 rounded-lg flex items-center gap-2 text-sm font-semibold border cursor-pointer" style={{ background: "rgba(255,255,255,0.07)", borderColor: "rgba(255,255,255,0.15)", color: "#e2e8f0", minHeight: "44px" }}>
          {currency} <span className="text-[10px] opacity-60">▼</span>
        </button>
        {showCurrencyMenu && (
          <div className="absolute top-11 left-0 z-50 rounded-xl p-1.5 border border-white/15 shadow-2xl" style={{ background: "#0f172a", minWidth: "200px" }}>
            {[
              { symbol: "$", name: "US Dollar" }, { symbol: "€", name: "Euro" }, { symbol: "£", name: "British Pound" },
              { symbol: "¥", name: "Japanese Yen" }, { symbol: "₼", name: "Azerbaijani Manat" }, { symbol: "₺", name: "Turkish Lira" },
              { symbol: "₽", name: "Russian Ruble" }, { symbol: "₩", name: "South Korean Won" }, { symbol: "Fr", name: "Swiss Franc" },
              { symbol: "C$", name: "Canadian Dollar" }, { symbol: "A$", name: "Australian Dollar" }, { symbol: "د.إ", name: "UAE Dirham" },
            ].map(c => (
              <button key={c.symbol} onClick={() => { setCurrency(c.symbol); setShowCurrencyMenu(false); }}
                className="w-full h-9 px-3 rounded-lg flex items-center gap-2.5 text-sm cursor-pointer border-none text-left"
                style={{ background: currency === c.symbol ? "rgba(34,197,94,0.12)" : "transparent", color: currency === c.symbol ? "#22c55e" : "rgba(255,255,255,0.7)" }}>
                <span className="font-bold min-w-6">{c.symbol}</span>
                <span className="text-xs opacity-60">{c.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {[{ label: "Income", value: totalIncome, color: "#22c55e" }, { label: "Expense", value: totalExpense, color: "#f43f5e" }, { label: "Balance", value: balance, color: balance >= 0 ? "#22c55e" : "#f43f5e" }].map(card => (
          <div key={card.label} className="rounded-xl p-3 text-center border border-white/10" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="text-[11px] text-white/40 mb-1">{card.label}</div>
            <div className="text-lg font-bold" style={{ color: card.color }}>{card.value.toFixed(2)} {currency}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-4 mb-4 border border-white/10" style={{ background: "rgba(255,255,255,0.07)" }}>
        <div className="flex gap-2 mb-2.5">
          <input value={desc} onChange={e => setDesc(e.target.value)} onKeyDown={e => e.key === "Enter" && addTransaction()}
            placeholder="Description..." className="flex-1 h-10 px-3 rounded-xl text-sm outline-none"
            style={{ background: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.12)", color: textColor, fontFamily: "'DM Sans',sans-serif" }}
            onFocus={e => { e.target.style.borderColor = "#22c55e"; e.target.style.boxShadow = "0 0 0 2px rgba(34,197,94,0.15)"; }}
            onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; e.target.style.boxShadow = "none"; }}
          />
          <input value={amount} onChange={e => setAmount(e.target.value)} onKeyDown={e => e.key === "Enter" && addTransaction()}
            placeholder="Amount" type="number" step="50" className="w-24 h-10 px-3 rounded-xl text-sm outline-none"
            style={{ background: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.12)", color: textColor, fontFamily: "'DM Sans',sans-serif" }}
            onFocus={e => { e.target.style.borderColor = "#22c55e"; e.target.style.boxShadow = "0 0 0 2px rgba(34,197,94,0.15)"; }}
            onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; e.target.style.boxShadow = "none"; }}
          />
        </div>
        <div className="flex gap-2">
          {["income", "expense"].map(t => (
            <button key={t} onClick={() => setType(t)} className="flex-1 h-11 rounded-lg text-sm font-semibold cursor-pointer border transition-all"
              style={{ borderColor: type === t ? (t === "income" ? "#22c55e" : "#f43f5e") : "rgba(255,255,255,0.15)", background: type === t ? (t === "income" ? "rgba(34,197,94,0.12)" : "rgba(244,63,94,0.12)") : "transparent", color: type === t ? (t === "income" ? "#22c55e" : "#f43f5e") : "rgba(255,255,255,0.4)" }}>
              {t === "income" ? "🟢 Income" : "🔴 Expense"}
            </button>
          ))}
          <button onClick={addTransaction} className="h-11 px-4 rounded-lg bg-green-500 text-white text-sm font-semibold border-none cursor-pointer whitespace-nowrap">+ Add</button>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-12 text-white/30 text-sm">💰 No transactions yet</div>
      ) : (
        [...filteredTransactions].reverse().map(t => (
          <div key={t.id} className="flex items-center gap-2.5 px-4 py-3 mb-2 rounded-xl border border-white/10" style={{ background: "rgba(255,255,255,0.06)", animation: "slideIn 0.25s ease" }}>
            <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-base" style={{ background: t.type === "income" ? "rgba(34,197,94,0.15)" : "rgba(244,63,94,0.15)" }}>{t.type === "income" ? "🟢" : "🔴"}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: textColor }}>{t.text}</div>
              <div className="text-[11px] font-mono text-white/35">{new Date(t.date).toLocaleDateString("az-AZ", { day: "2-digit", month: "2-digit", year: "numeric" })}</div>
            </div>
            <div className="text-sm font-bold" style={{ color: t.type === "income" ? "#22c55e" : "#f43f5e" }}>{t.type === "income" ? "+" : "-"}{t.amount.toFixed(2)} {currency}</div>
            <button onClick={() => deleteTransaction(t.id)} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border-none" style={{ background: "rgba(244,63,94,0.12)", color: "#f43f5e" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,6 5,6 21,6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /></svg>
            </button>
          </div>
        ))
      )}
    </div>
  );
}

function NoteItem({ note, onDelete, onEdit, onDragStart, onDragOver, onDrop, isDragging }) {
  const [expanded, setExpanded] = useState(false);
  const words = note.text.trim().split(/[\s,،.!?;:]+/).filter(w => w.length > 0);
  const title = words.slice(0, 3).join(" ") + (words.length > 3 ? "..." : "");
  const noteColor = note.color || "#ffffff";

  return (
    <div
      draggable
      onDragStart={e => { e.dataTransfer.effectAllowed = "move"; onDragStart(note.id); }}
      onDragEnd={() => onDragStart(null)}
      onDragOver={e => { e.preventDefault(); onDragOver(note.id); }}
      onDrop={onDrop}
      onClick={() => setExpanded(e => !e)}
      className="rounded-xl px-4 py-3 mb-2 border border-white/10"
      style={{ background: "rgba(255,255,255,0.06)", borderLeft: `3px solid ${noteColor === "#ffffff" ? "rgba(255,255,255,0.2)" : noteColor}`, animation: "slideIn 0.25s ease", opacity: isDragging ? 0.4 : 1, cursor: "grab" }}>      <p className="text-sm font-bold break-words" style={{ color: noteColor === "#ffffff" ? "#ffffff" : noteColor, marginBottom: expanded ? "6px" : "0" }}>{title}</p>
      {expanded && <p className="text-[13px] text-white/60 whitespace-pre-wrap break-words mb-1.5 leading-relaxed">{note.text}</p>}
      <div className="flex justify-between items-center mt-1.5">
        <span className="text-[11px] text-white/30 font-mono">
          {new Date(note.createdAt).toLocaleDateString("az-AZ", { day: "2-digit", month: "2-digit", year: "numeric" })}
          {!expanded && <span className="text-white/20 ml-1.5">▼</span>}
          {expanded && <span className="text-white/20 ml-1.5">▲</span>}
        </span>
        <div className="flex gap-1.5">
          <button onClick={e => { e.stopPropagation(); onEdit(note); }} className="w-6 h-6 rounded-md flex items-center justify-center cursor-pointer border-none" style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}><EditIcon /></button>
          <button onClick={e => { e.stopPropagation(); onDelete(note.id); }} className="w-6 h-6 rounded-md flex items-center justify-center cursor-pointer border-none" style={{ background: "rgba(244,63,94,0.12)", color: "#f43f5e" }}><TrashIcon /></button>
        </div>
      </div>
    </div>
  );
}

function NotesPanel() {
  const [notes, setNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem("notes_v1")) || []; } catch { return []; }
  });
  const [noteInput, setNoteInput] = useState("");
  const [noteColor, setNoteColor] = useState("#ffffff");
  const [editingNote, setEditingNote] = useState(null);
  const [editNoteText, setEditNoteText] = useState("");
  const [editNoteColor, setEditNoteColor] = useState("#ffffff");
  const [dragId, setDragId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  useEffect(() => { localStorage.setItem("notes_v1", JSON.stringify(notes)); }, [notes]);

  const addNote = () => {
    const text = noteInput.trim();
    if (!text) return;
    setNotes(prev => [{ id: Date.now(), text, color: noteColor, createdAt: new Date().toISOString() }, ...prev]);
    setNoteInput("");
  };

  const deleteNote = (id) => setNotes(prev => prev.filter(n => n.id !== id));
  const handleNoteDrop = () => {
    if (dragId === null || dragOverId === null || dragId === dragOverId) return;
    setNotes(prev => {
      const arr = [...prev];
      const from = arr.findIndex(n => n.id === dragId);
      const to   = arr.findIndex(n => n.id === dragOverId);
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
    setDragId(null); setDragOverId(null);
  };
  const saveNoteEdit = () => {
    if (!editNoteText.trim() || !editingNote) return;
    setNotes(prev => prev.map(n => n.id === editingNote.id ? { ...n, text: editNoteText, color: editNoteColor } : n));
    setEditingNote(null); setEditNoteText(""); setEditNoteColor("#ffffff");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="rounded-2xl p-4 mb-4 border border-white/10" style={{ background: "rgba(255,255,255,0.07)" }}>
        <textarea value={noteInput} onChange={e => setNoteInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) addNote(); }}
          placeholder="Type your note… (Ctrl+Enter to save)" rows={4}
          className="w-full rounded-xl text-sm outline-none resize-none mb-2.5 leading-relaxed p-3"
          style={{ background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.12)", color: "#e2e8f0", fontFamily: "'DM Sans',sans-serif" }}
          onFocus={e => { e.target.style.borderColor = "#22c55e"; e.target.style.boxShadow = "0 0 0 2px rgba(34,197,94,0.15)"; }}
          onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; e.target.style.boxShadow = "none"; }}
        />
        <div className="flex items-center gap-1.5 mb-2.5">
          <span className="text-[11px] text-white/35">Color:</span>
          {TASK_COLORS.map(c => (
            <button key={c} onClick={() => setNoteColor(c)} className="rounded-full cursor-pointer transition-transform duration-150"
              style={{ width: "18px", height: "18px", background: c, border: noteColor === c ? "2px solid #22c55e" : c === "#ffffff" ? "1px solid rgba(255,255,255,0.3)" : "2px solid transparent", transform: noteColor === c ? "scale(1.25)" : "scale(1)" }}
            />
          ))}
        </div>
        <button onClick={addNote} className="w-full h-10 rounded-xl bg-green-500 text-white text-sm font-semibold border-none cursor-pointer">+ Add note</button>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: "touch" }}>
        {notes.length === 0 ? (
          <div className="text-center py-10 text-white/30 text-sm">📝 Your notes will appear here</div>
        ) : (
          notes.map(note => (
            <NoteItem key={note.id} note={note}
              onDelete={deleteNote}
              onEdit={n => { setEditingNote(n); setEditNoteText(n.text); setEditNoteColor(n.color || "#ffffff"); }}
              onDragStart={setDragId}
              onDragOver={setDragOverId}
              onDrop={handleNoteDrop}
              isDragging={dragId === note.id}
            />
          ))
      )}
    </div>

      {editingNote && (
        <div onClick={e => e.target === e.currentTarget && setEditingNote(null)} className="fixed inset-0 flex items-center justify-center z-50 p-5" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}>
          <div className="w-full max-w-md rounded-2xl p-6 border border-white/10" style={{ background: "rgba(15,23,42,0.95)", animation: "slideIn 0.2s ease" }}>
            <h3 className="text-base font-semibold text-white mb-4">Edit note</h3>
            <textarea autoFocus value={editNoteText} onChange={e => setEditNoteText(e.target.value)} rows={4}
              className="w-full p-3.5 rounded-xl text-sm outline-none resize-none mb-4 leading-relaxed"
              style={{ background: "rgba(255,255,255,0.08)", border: "0.5px solid #22c55e", boxShadow: "0 0 0 2px rgba(34,197,94,0.15)", color: "#e2e8f0", fontFamily: "'DM Sans',sans-serif" }}
            />
            <div className="flex items-center gap-1.5 mb-4">
              <span className="text-[11px] text-white/35">Color:</span>
              {TASK_COLORS.map(c => (
                <button key={c} onClick={() => setEditNoteColor(c)} className="rounded-full cursor-pointer transition-transform duration-150"
                  style={{ width: "20px", height: "20px", background: c, border: editNoteColor === c ? "2px solid #22c55e" : c === "#ffffff" ? "1px solid rgba(255,255,255,0.3)" : "2px solid transparent", transform: editNoteColor === c ? "scale(1.2)" : "scale(1)" }}
                />
              ))}
            </div>
            <div className="flex gap-2.5 justify-end">
              <button onClick={() => setEditingNote(null)} className="h-10 px-4 rounded-lg text-sm cursor-pointer border" style={{ borderColor: "rgba(255,255,255,0.15)", background: "transparent", color: "rgba(255,255,255,0.5)" }}>Cancel</button>
              <button onClick={saveNoteEdit} className="h-10 px-5 rounded-lg bg-green-500 text-white text-sm font-semibold border-none cursor-pointer">Save</button>
            </div>
          </div>
        </div>
      )}
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
  const [taskColor, setTaskColor] = useState("#ffffff");
  const [filter, setFilter] = useState("Daily");  
  const [time, setTime] = useState(formatTime());
  const [activePanel, setActivePanel] = useState("tasks");
  const [editingTask, setEditingTask] = useState(null);
  const [editText, setEditText] = useState("");
  const [editColor, setEditColor] = useState("#ffffff");
  const [dragId, setDragId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [goalPeriod, setGoalPeriod] = useState("month");
  const [budgetPeriod, setBudgetPeriod] = useState("month");
  const [habitsFilter, setHabitsFilter] = useState("Daily");
  const inputRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setTime(formatTime()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { localStorage.setItem("tasks_v2", JSON.stringify(tasks)); }, [tasks]);

  const textColor = "#e2e8f0";

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
  const completedCount = filtered.filter(t => t.completed).length;
  const progress = filtered.length ? Math.round((completedCount / filtered.length) * 100) : 0;

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

  const menuItems = [
    { key: "tasks", label: "My Tasks", emoji: "✅" },
    { key: "notes", label: "Notes", emoji: "📝" },
    { key: "goals", label: "Goals", emoji: "🎯" },
    { key: "budget", label: "Budget", emoji: "💰" },
    { key: "habits", label: "Habits",   emoji: "🔁" },
    { key: "gym",    label: "Gym",      emoji: "🏋️" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1e]" style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes streakPop { 0% { transform: scale(1); } 40% { transform: scale(1.6); } 70% { transform: scale(0.9); } 100% { transform: scale(1); } }
        @keyframes streakGlow { 0%,100% { text-shadow: none; } 50% { text-shadow: 0 0 12px #f59e0b, 0 0 24px #f59e0baa; } }
        @keyframes shake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-5px); } 40% { transform: translateX(5px); } 60% { transform: translateX(-3px); } 80% { transform: translateX(3px); } }
        @keyframes confetti { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(-60px) rotate(360deg); opacity: 0; } }
        @keyframes prPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(250,204,21,0.4); } 50% { box-shadow: 0 0 0 6px rgba(250,204,21,0); } }
        @keyframes timerPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); opacity: 0.5; cursor: pointer; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(34,197,94,0.3); border-radius: 999px; }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.25); }
        button:focus { outline: none; }
      `}</style>

      <header className="border-b border-white/[0.06] px-5 md:px-7 py-4 flex justify-between items-center" style={{ background: "rgba(0,0,0,0.3)" }}>
        <div>
          <div className="text-xs font-semibold tracking-widest text-green-400 font-mono">{time}</div>
          <div className="text-sm text-white/40 mt-0.5">{formatDate()}</div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row min-h-[calc(100vh-65px)]">
        <aside className="w-full md:w-56 flex-shrink-0 border-b md:border-b-0 md:border-r border-white/[0.06] px-4 py-4" style={{ background: "rgba(0,0,0,0.15)" }}>
          <div className="text-[11px] font-semibold tracking-widest text-white/30 mb-3 hidden md:block">MENU</div>
          <nav className="flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-1 md:pb-0" style={{ WebkitOverflowScrolling: "touch" }}>
            {menuItems.map(item => (
              <button key={item.key} onClick={() => setActivePanel(item.key)}
                className="flex items-center gap-2.5 px-3.5 h-11 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap border cursor-pointer flex-shrink-0"
                style={{ borderColor: activePanel === item.key ? "rgba(34,197,94,0.4)" : "transparent", background: activePanel === item.key ? "rgba(34,197,94,0.12)" : "transparent", color: activePanel === item.key ? "#22c55e" : "rgba(255,255,255,0.5)" }}>
                <span className="text-base">{item.emoji}</span>
                {item.label}
              </button>
            ))}
          </nav>

          {activePanel === "tasks" && tasks.length > 0 && (
            <div className="mt-5 hidden md:block">
              <div className="text-[11px] font-semibold tracking-widest text-white/30 mb-3">STATS</div>
              <div className="rounded-xl p-3.5" style={{ background: "rgba(255,255,255,0.05)" }}>
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-white/40">Completed:</span>
                  <span className="text-xs font-semibold text-green-400">{progress}%</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden mb-2.5" style={{ background: "rgba(255,255,255,0.1)" }}>
                  <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: "linear-gradient(90deg,#16a34a,#22c55e)" }} />
                </div>
                {[{ label: "Total", value: filtered.length, color: "#e2e8f0" }, { label: "Active", value: filtered.filter(t => !t.completed).length, color: "#f59e0b" }, { label: "Done", value: completedCount, color: "#22c55e" }].map(s => (
                  <div key={s.label} className="flex justify-between items-center h-6">
                    <span className="text-xs text-white/35">{s.label}</span>
                    <strong className="text-xs" style={{ color: s.color }}>{s.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        <main className="flex-1 p-5 md:p-7 overflow-y-auto" style={{ maxHeight: "calc(100vh - 65px)", WebkitOverflowScrolling: "touch" }}>
          {activePanel === "tasks" && (
            <div className="max-w-2xl">
              <h1 className="text-2xl font-bold text-white mb-5">My Tasks</h1>
              <div className="rounded-2xl p-4 mb-4 border border-white/10" style={{ background: "rgba(255,255,255,0.07)" }}>
                <div className="flex gap-2 mb-3">
                  <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addTask()}
                    placeholder="Add a new task…" className="flex-1 h-11 px-4 rounded-xl text-sm outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.12)", color: "#e2e8f0", fontFamily: "'DM Sans',sans-serif" }}
                    onFocus={e => { e.target.style.borderColor = "#22c55e"; e.target.style.boxShadow = "0 0 0 2px rgba(34,197,94,0.15)"; }}
                    onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; e.target.style.boxShadow = "none"; }}
                  />
                  <button onClick={addTask} className="h-11 px-5 rounded-xl bg-green-500 text-white text-sm font-semibold border-none cursor-pointer whitespace-nowrap">+ Add</button>
                </div>
                <div className="flex gap-2 flex-wrap items-center">
                  {Object.entries(PRIORITIES).map(([key, p]) => (
                    <button key={key} onClick={() => setPriority(key)} className="h-8 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-all border"
                      style={{ borderColor: priority === key ? p.color : "rgba(255,255,255,0.15)", background: priority === key ? p.bg : "transparent", color: priority === key ? p.color : "rgba(255,255,255,0.45)" }}>
                      {p.label}
                    </button>
                  ))}
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="h-8 px-2.5 rounded-lg text-xs cursor-pointer outline-none font-mono"
                    style={{ background: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.15)", color: dueDate ? "#e2e8f0" : "rgba(255,255,255,0.35)" }}
                  />
                  <div className="flex items-center gap-1.5 ml-1">
                    <span className="text-[11px] text-white/35">Color:</span>
                    {TASK_COLORS.map(c => (
                      <button key={c} onClick={() => setTaskColor(c)} className="rounded-full cursor-pointer transition-transform duration-150"
                        style={{ width: "18px", height: "18px", background: c, border: taskColor === c ? "2px solid #22c55e" : c === "#ffffff" ? "1px solid rgba(255,255,255,0.3)" : "2px solid transparent", transform: taskColor === c ? "scale(1.25)" : "scale(1)" }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-1.5 mb-3.5 flex-wrap">
                {FILTERS.map(f => (
                  <button key={f} onClick={() => setFilter(f)} className="h-8 px-3.5 rounded-full text-sm transition-all border cursor-pointer"
                    style={{ borderColor: filter === f ? "#22c55e" : "rgba(255,255,255,0.15)", background: filter === f ? "rgba(34,197,94,0.12)" : "transparent", color: filter === f ? "#22c55e" : "rgba(255,255,255,0.45)", fontWeight: filter === f ? 600 : 400 }}>
                    {f}
                  </button>
                ))}
                {completedCount > 0 && (
                  <button onClick={clearCompleted} className="h-8 px-3.5 rounded-full text-sm border cursor-pointer ml-auto" style={{ borderColor: "rgba(244,63,94,0.3)", background: "transparent", color: "#f43f5e" }}>Remove completed</button>
                )}
              </div>

              <div style={{ animation: "fadeIn 0.3s ease" }}>
                {filtered.length === 0 ? (
                  <div className="text-center py-12 text-white/30"><div className="text-4xl mb-2.5">✓</div><div className="text-sm">No tasks yet</div></div>
                ) : (
                  filtered.map(task => (
                    <TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask}
                      onEdit={t => { setEditingTask(t); setEditText(t.text); setEditColor(t.color || "#ffffff"); }}
                      onDragStart={setDragId} onDragOver={setDragOverId} onDrop={handleDrop} isDragging={dragId === task.id}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {activePanel === "notes" && (
            <div className="max-w-2xl">
              <h1 className="text-2xl font-bold text-white mb-5">Notes</h1>
              <NotesPanel />
            </div>
          )}

          {activePanel === "goals" && (
            <div className="max-w-2xl">
              <h1 className="text-2xl font-bold text-white mb-5">🎯 Goals</h1>
              <GoalsPanel textColor={textColor} period={goalPeriod} onPeriodChange={setGoalPeriod} />
            </div>
          )}

          {activePanel === "budget" && (
            <div className="max-w-2xl">
              <h1 className="text-2xl font-bold text-white mb-5">💰 Budget</h1>
              <BudgetPanel textColor={textColor} period={budgetPeriod} onPeriodChange={setBudgetPeriod} />
            </div>
          )}
          {activePanel === "habits" && (
            <div className="max-w-2xl">
              <h1 className="text-2xl font-bold text-white mb-5">🔁 Habits</h1>
              <HabitsPanel filter={habitsFilter} onFilterChange={setHabitsFilter} />
            </div>
          )}

          {activePanel === "gym" && (
            <div className="max-w-2xl">
              <h1 className="text-2xl font-bold text-white mb-5">🏋️ Gym</h1>
              <GymPanel />
            </div>
          )}
        </main>
      </div>

      {editingTask && (
        <div onClick={e => e.target === e.currentTarget && setEditingTask(null)} className="fixed inset-0 flex items-center justify-center z-50 p-5" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}>
          <div className="w-full max-w-md rounded-2xl p-6 border border-white/10 shadow-2xl" style={{ background: "rgba(15,23,42,0.95)", animation: "slideIn 0.2s ease" }}>
            <h3 className="text-base font-semibold text-white mb-4">Edit task</h3>
            <input autoFocus value={editText} onChange={e => setEditText(e.target.value)} onKeyDown={e => e.key === "Enter" && saveEdit()}
              className="w-full h-11 px-4 rounded-xl text-sm outline-none mb-4"
              style={{ background: "rgba(255,255,255,0.08)", border: "0.5px solid #22c55e", boxShadow: "0 0 0 2px rgba(34,197,94,0.15)", color: "#e2e8f0", fontFamily: "'DM Sans',sans-serif" }}
            />
            <div className="mb-4">
              <div className="text-xs text-white/40 mb-2">Choose a color:</div>
              <div className="flex gap-2 flex-wrap">
                {TASK_COLORS.map(c => (
                  <button key={c} onClick={() => setEditColor(c)} className="rounded-full cursor-pointer transition-transform duration-150"
                    style={{ width: "24px", height: "24px", background: c, border: editColor === c ? "2px solid #22c55e" : c === "#ffffff" ? "1px solid rgba(255,255,255,0.3)" : "2px solid transparent", transform: editColor === c ? "scale(1.2)" : "scale(1)" }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2.5 justify-end">
              <button onClick={() => setEditingTask(null)} className="h-10 px-4 rounded-lg text-sm cursor-pointer border" style={{ borderColor: "rgba(255,255,255,0.15)", background: "transparent", color: "rgba(255,255,255,0.5)" }}>Cancel</button>
              <button onClick={saveEdit} className="h-10 px-5 rounded-lg bg-green-500 text-white text-sm font-semibold border-none cursor-pointer">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}