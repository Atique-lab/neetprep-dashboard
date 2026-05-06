import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckSquare, X, Plus, Trash2, Lightbulb, CheckCheck, User, Shield, Key, Image as ImageIcon } from "lucide-react";
import { useTaskStore } from "../hooks/useTaskStore";
import { useAuth } from "../context/AuthContext";

export default function UserSpace() {
  const location = useLocation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("tasks"); // tasks, profile
  const [input, setInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
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

  // Focus input when panel opens and tasks tab is active
  useEffect(() => {
    if (open && activeTab === "tasks") setTimeout(() => inputRef.current?.focus(), 150);
  }, [open, activeTab]);

  const handleAdd = () => {
    addTask(input, location.pathname);
    setInput("");
    inputRef.current?.focus();
  };

  const handlePasswordChange = () => {
    if (newPassword.trim()) {
      alert("Password change request submitted! (Simulation)");
      setNewPassword("");
    }
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
        title="User Space"
      >
        <User size={22} />
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
            {/* Header / Tabs */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-slate-100">
              <div className="p-4 flex justify-between items-center pb-2">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <User size={18} className="text-purple-600" />
                  User Space
                </h3>
                <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-700 transition">
                  <X size={18} />
                </button>
              </div>
              <div className="flex px-4 pb-0">
                <button 
                  onClick={() => setActiveTab("tasks")}
                  className={`px-4 py-2 text-xs font-bold transition-all border-b-2 ${activeTab === "tasks" ? "border-purple-600 text-purple-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                >
                  TASKS ({pendingCount})
                </button>
                <button 
                  onClick={() => setActiveTab("profile")}
                  className={`px-4 py-2 text-xs font-bold transition-all border-b-2 ${activeTab === "profile" ? "border-purple-600 text-purple-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                >
                  PROFILE
                </button>
              </div>
            </div>

            {activeTab === "tasks" ? (
              <div className="max-h-[450px] overflow-y-auto">
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
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                        <CheckCheck size={12} /> Completed ({completedCount})
                      </p>
                      <button onClick={clearCompleted} className="text-[10px] text-rose-400 hover:text-rose-600 font-bold uppercase tracking-wider">Clear all</button>
                    </div>
                    <div className="space-y-1">
                      {completedTasks.map(task => (
                        <TaskRow key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
                      ))}
                    </div>
                  </div>
                )}

                {tasks.length === 0 && (
                  <div className="py-10 text-center text-slate-400">
                    <CheckSquare size={36} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-medium">No tasks yet</p>
                    <p className="text-xs mt-0.5">Add a task or pick a suggestion above</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 space-y-6 max-h-[450px] overflow-y-auto">
                {/* User Info */}
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {user?.name?.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">{user?.name}</h4>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md mt-1 w-fit">
                      <Shield size={10} /> {user?.role?.toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Image Upload Option */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon size={12} /> Profile Image
                  </p>
                  <button className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-medium hover:border-purple-400 hover:text-purple-600 transition-all flex items-center justify-center gap-2">
                    <Plus size={14} /> Upload New Photo
                  </button>
                </div>

                {/* Password Change */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Key size={12} /> Security
                  </p>
                  <div className="space-y-2">
                    <input
                      type="password"
                      placeholder="New Password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-sm bg-white"
                    />
                    <button
                      onClick={handlePasswordChange}
                      className="w-full py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 transition shadow-sm"
                    >
                      Update Password
                    </button>
                  </div>
                </div>

                {/* Role Info */}
                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-2">
                  <h5 className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Your Permissions</h5>
                  <ul className="text-xs text-indigo-600 space-y-1 font-medium">
                    <li>• Access to {user?.role === 'admin' ? 'full' : 'assigned'} revenue data</li>
                    <li>• Manage {user?.role === 'admin' ? 'all' : 'your'} centres</li>
                    <li>• View students analytics</li>
                    {user?.role === 'admin' && <li>• View global performance metrics</li>}
                  </ul>
                </div>
              </div>
            )}
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
