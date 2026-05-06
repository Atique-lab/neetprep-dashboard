import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckSquare, X, Plus, Trash2, Lightbulb, CheckCheck, User, Shield, Key, Image as ImageIcon, ClipboardList, Settings } from "lucide-react";
import { useTaskStore } from "../hooks/useTaskStore";
import { useAuth } from "../context/AuthContext";

export default function UserSpace() {
  const location = useLocation();
  const { user } = useAuth();
  
  // Use location state to determine initial tab (passed from Header navigate)
  const initialTab = (location.state && location.state.tab) || "tasks";
  const [activeTab, setActiveTab] = useState(initialTab); 
  
  const [input, setInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const inputRef = useRef(null);

  const { tasks, addTask, toggleTask, deleteTask, clearCompleted, suggestions, pendingCount } =
    useTaskStore(location.pathname);

  // Focus input when tasks tab is active
  useEffect(() => {
    if (activeTab === "tasks") setTimeout(() => inputRef.current?.focus(), 150);
  }, [activeTab]);

  const handleAdd = () => {
    addTask(input, "/"); // Default context to dashboard for page-based tasks or handle as global
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

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">User Space</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your personal tasks, profile settings, and account security.</p>
      </div>

      {/* Tabs Header */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("tasks")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "tasks"
              ? "bg-white text-purple-600 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <ClipboardList size={18} />
          Personal Tasks
          {pendingCount > 0 && (
            <span className="bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "profile"
              ? "bg-white text-purple-600 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Settings size={18} />
          Profile & Security
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === "tasks" ? (
            <div className="glass rounded-[2rem] overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/50">
                <h3 className="font-bold text-slate-800">Your Tasks</h3>
                {completedCount > 0 && (
                  <button onClick={clearCompleted} className="text-xs text-rose-500 font-bold hover:underline">Clear completed</button>
                )}
              </div>
              
              <div className="p-6 space-y-6">
                {/* Add Input */}
                <div className="flex gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="What needs to be done?"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAdd()}
                    className="flex-1 px-5 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-purple-500/10 text-base bg-white shadow-sm transition-all"
                  />
                  <button
                    onClick={handleAdd}
                    disabled={!input.trim()}
                    className="px-6 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-purple-200"
                  >
                    <Plus size={20} className="mr-2" /> Add Task
                  </button>
                </div>

                {/* Task List */}
                <div className="space-y-3">
                  {pendingTasks.length > 0 ? (
                    pendingTasks.map(task => (
                      <TaskRow key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
                    ))
                  ) : tasks.length === 0 ? (
                    <div className="py-20 text-center text-slate-400">
                       <CheckSquare size={48} className="mx-auto mb-4 opacity-10" />
                       <p className="text-lg font-medium">No pending tasks</p>
                       <p className="text-sm">Enjoy your day or add something new!</p>
                    </div>
                  ) : null}

                  {completedTasks.length > 0 && (
                    <div className="pt-6 mt-6 border-t border-slate-100">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Completed Items</p>
                      <div className="space-y-2 opacity-60">
                        {completedTasks.map(task => (
                          <TaskRow key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Settings */}
              <div className="glass rounded-[2rem] p-8 space-y-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-white text-4xl font-bold shadow-2xl relative group">
                    {user?.name?.substring(0, 2).toUpperCase()}
                    <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white text-slate-600 rounded-full shadow-lg flex items-center justify-center hover:text-purple-600 transition-all border border-slate-100">
                      <ImageIcon size={14} />
                    </button>
                  </div>
                  <div className="text-center md:text-left">
                    <h2 className="text-2xl font-black text-slate-800">{user?.name}</h2>
                    <div className="flex items-center gap-2 justify-center md:justify-start mt-1">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-black rounded-full uppercase tracking-wider flex items-center gap-1.5">
                        <Shield size={12} /> {user?.role}
                      </span>
                      <span className="text-slate-400 text-xs font-medium">Joined: Session 2026-27</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                   <div className="space-y-4">
                      <label className="block text-sm font-bold text-slate-700">Display Name</label>
                      <input type="text" defaultValue={user?.name} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 cursor-not-allowed" disabled />
                      <p className="text-[10px] text-slate-400">Contact admin to change your display name.</p>
                   </div>
                   <div className="space-y-4">
                      <label className="block text-sm font-bold text-slate-700">Account Role</label>
                      <input type="text" defaultValue={user?.role} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 cursor-not-allowed uppercase" disabled />
                      <p className="text-[10px] text-slate-400">Permissions are based on your role.</p>
                   </div>
                </div>
              </div>

              {/* Password Section */}
              <div className="glass rounded-[2rem] p-8">
                 <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Key size={20} className="text-amber-500" />
                    Change Security Password
                 </h3>
                 <div className="flex flex-col md:flex-row gap-4">
                    <input
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="flex-1 px-5 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-purple-500/10 text-base"
                    />
                    <button
                      onClick={handlePasswordChange}
                      className="px-8 py-3.5 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-700 transition shadow-lg active:scale-95"
                    >
                      Update Security
                    </button>
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info Area */}
        <div className="space-y-6">
          <div className="glass rounded-[2rem] p-6 bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-xl shadow-purple-200">
             <h4 className="font-bold mb-4 flex items-center gap-2">
               <Shield size={18} /> Role Permissions
             </h4>
             <ul className="space-y-3 text-sm opacity-90">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 shrink-0" />
                  <span>Access to {user?.role === 'admin' ? 'full' : 'assigned'} revenue data metrics</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 shrink-0" />
                  <span>Manage {user?.role === 'admin' ? 'all global' : 'your assigned'} centres</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 shrink-0" />
                  <span>View comprehensive student analytics</span>
                </li>
                {user?.role === 'admin' && (
                   <li className="flex items-start gap-2 border-t border-white/20 pt-3 mt-3">
                     <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 shrink-0" />
                     <span>Global administrative control & data exports</span>
                   </li>
                )}
             </ul>
          </div>

          <div className="glass rounded-[2rem] p-6 space-y-4">
             <h4 className="font-bold text-slate-800 flex items-center gap-2">
               <Lightbulb size={18} className="text-amber-500" />
               Daily Suggestions
             </h4>
             <div className="space-y-2">
               {suggestions.map((s, i) => (
                 <button
                    key={i}
                    onClick={() => addTask(s, "/")}
                    className="w-full text-left text-xs font-medium text-slate-600 bg-slate-50 hover:bg-purple-50 hover:text-purple-600 p-3 rounded-xl transition-all border border-slate-100"
                 >
                   + {s}
                 </button>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskRow({ task, onToggle, onDelete }) {
  return (
    <div className={`flex items-center gap-4 group px-5 py-4 rounded-2xl transition-all border ${
      task.completed 
        ? "bg-slate-50/50 border-transparent opacity-60" 
        : "bg-white border-slate-100 hover:border-purple-200 hover:shadow-md hover:shadow-purple-500/5"
    }`}>
      <button
        onClick={() => onToggle(task.id)}
        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
          task.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 hover:border-purple-500"
        }`}
      >
        {task.completed && <CheckCheck size={14} />}
      </button>
      <p className={`text-base flex-1 font-medium ${task.completed ? "line-through text-slate-400" : "text-slate-700"}`}>
        {task.text}
      </p>
      <button
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all p-1"
      >
        <X size={18} />
      </button>
    </div>
  );
}
