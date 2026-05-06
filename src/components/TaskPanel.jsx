import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckSquare, X, Plus, Trash2, Lightbulb, CheckCheck, ClipboardList } from "lucide-react";
import { useTaskStore } from "../hooks/useTaskStore";

export default function TaskPanel() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const inputRef = useRef(null);
  const panelRef = useRef(null);

  const { tasks, addTask, toggleTask, deleteTask, clearCompleted, suggestions, pendingCount } =
    useTaskStore(location.pathname);

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  const handleAdd = () => {
    addTask(input, location.pathname);
    setInput("");
    inputRef.current?.focus();
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const pendingTasks  = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  const pageLabel = {
    "/": "Dashboard",
    "/revenue": "Revenue",
    "/managers": "Managers",
    "/centres": "Centres",
    "/payments": "Payments",
  }[location.pathname] || "This Page";

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={panelRef}>
      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(o => !o)}
        className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-xl shadow-purple-500/30 flex items-center justify-center text-white relative"
        title="Task Manager"
      >
        <ClipboardList size={22} />
        {pendingCount > 0 && (
          <span className="absolute -top-2 -right-2 min-w-[20px] h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white px-1">
            {pendingCount > 9 ? "9+" : pendingCount}
          </span>
        )}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute bottom-16 right-0 w-[360px] bg-white/95 backdrop-blur-2xl border border-purple-100/60 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CheckSquare size={18} className="text-purple-600" />
                <h3 className="font-bold text-slate-800">Task Manager</h3>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                  {pendingCount} pending
                </span>
              </div>
              <div className="flex items-center gap-2">
                {completedCount > 0 && (
                  <button
                    onClick={clearCompleted}
                    className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1 transition"
                    title="Clear completed"
                  >
                    <Trash2 size={12} /> Clear done
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-700 transition">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Add Task Input */}
            <div className="p-4 border-b border-slate-100">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Add a task..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAdd()}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-sm bg-white placeholder:text-slate-400"
                />
                <button
                  onClick={handleAdd}
                  disabled={!input.trim()}
                  className="w-10 h-10 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition shrink-0"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Task List */}
            <div className="max-h-[380px] overflow-y-auto">
              {/* Contextual Suggestions */}
              {suggestions.length > 0 && (
                <div className="p-4 border-b border-slate-100">
                  <p className="text-xs font-semibold text-amber-600 flex items-center gap-1.5 mb-2">
                    <Lightbulb size={12} /> Suggested for {pageLabel}
                  </p>
                  <div className="space-y-1.5">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => addTask(s, location.pathname)}
                        className="w-full text-left text-xs text-slate-600 bg-amber-50 hover:bg-amber-100 px-3 py-2 rounded-lg flex items-center gap-2 transition group"
                      >
                        <Plus size={12} className="text-amber-500 shrink-0 group-hover:scale-110 transition-transform" />
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending Tasks */}
              {pendingTasks.length > 0 && (
                <div className="p-4 space-y-1.5">
                  {pendingTasks.map(task => (
                    <TaskRow key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
                  ))}
                </div>
              )}

              {/* Completed Tasks */}
              {completedTasks.length > 0 && (
                <div className="px-4 pb-4">
                  <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-2">
                    <CheckCheck size={12} /> Completed ({completedCount})
                  </p>
                  <div className="space-y-1">
                    {completedTasks.map(task => (
                      <TaskRow key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {tasks.length === 0 && (
                <div className="py-10 text-center text-slate-400">
                  <CheckSquare size={36} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">No tasks yet</p>
                  <p className="text-xs mt-0.5">Add a task or pick a suggestion above</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TaskRow({ task, onToggle, onDelete }) {
  return (
    <div className={`flex items-start gap-2.5 group px-3 py-2.5 rounded-xl transition ${task.completed ? "opacity-50" : "hover:bg-slate-50"}`}>
      <button
        onClick={() => onToggle(task.id)}
        className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition ${
          task.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 hover:border-purple-500"
        }`}
      >
        {task.completed && <CheckCheck size={12} />}
      </button>
      <p className={`text-sm flex-1 leading-snug ${task.completed ? "line-through text-slate-400" : "text-slate-700"}`}>
        {task.text}
      </p>
      <button
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-400 transition shrink-0 mt-0.5"
      >
        <X size={14} />
      </button>
    </div>
  );
}
