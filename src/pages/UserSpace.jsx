import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  CheckSquare, X, Plus, Trash2, Lightbulb, CheckCheck, 
  User, Shield, Key, Image as ImageIcon, ClipboardList, 
  Settings, Users, Briefcase, ChevronRight, Info, Send
} from "lucide-react";
import { useTaskStore } from "../hooks/useTaskStore";
import { useAuth } from "../context/AuthContext";

export default function UserSpace() {
  const location = useLocation();
  const { user, profileImage, updateProfileImage, userList } = useAuth();
  
  const initialTab = (location.state && location.state.tab) || "tasks";
  const [activeTab, setActiveTab] = useState(initialTab); 
  
  const [input, setInput] = useState("");
  const [assignInput, setAssignInput] = useState("");
  const [assignTo, setAssignTo] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const { tasks, addTask, sendTaskToUser, toggleTask, deleteTask, clearCompleted, suggestions, pendingCount } =
    useTaskStore(location.pathname);

  useEffect(() => {
    if (activeTab === "tasks") setTimeout(() => inputRef.current?.focus(), 150);
  }, [activeTab]);

  const handleAdd = () => {
    if (!input.trim()) return;
    addTask(input, "/");
    setInput("");
    inputRef.current?.focus();
  };

  const handleAssign = () => {
    if (!assignInput.trim() || !assignTo) return;
    sendTaskToUser(assignTo, assignInput, user?.name);
    alert(`Task assigned to ${assignTo}!`);
    setAssignInput("");
    setAssignTo("");
  };

  const handlePasswordChange = () => {
    if (newPassword.trim()) {
      alert("Password change request submitted! (Simulation)");
      setNewPassword("");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const pendingTasks  = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 max-w-6xl mx-auto px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">User Space</h1>
          <p className="text-slate-500 text-sm mt-1">
            Welcome back, <span className="text-purple-600 font-bold">{user?.name}</span>
          </p>
        </div>
        
        {/* Tabs Header */}
        <div className="flex gap-2 p-1 bg-slate-200/50 rounded-2xl w-fit border border-white/50">
          <button
            onClick={() => setActiveTab("tasks")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "tasks"
                ? "bg-white text-purple-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <ClipboardList size={18} />
            My Tasks
            {pendingCount > 0 && (
              <span className="bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "profile"
                ? "bg-white text-purple-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Settings size={18} />
            Profile & Account
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === "tasks" ? (
            <div className="glass rounded-[2rem] overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/50">
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                     <ClipboardList size={18} />
                   </div>
                   <h3 className="font-bold text-slate-800 uppercase tracking-wider text-xs">Personal Task Manager</h3>
                </div>
                {completedCount > 0 && (
                  <button onClick={clearCompleted} className="text-xs text-rose-500 font-bold hover:underline">Clear completed</button>
                )}
              </div>
              
              <div className="p-6 space-y-6">
                <div className="flex gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Enter a new task..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAdd()}
                    className="flex-1 px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-purple-500/10 text-base bg-white shadow-sm transition-all"
                  />
                  <button
                    onClick={handleAdd}
                    disabled={!input.trim()}
                    className="px-6 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-purple-200"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                <div className="space-y-3">
                  {pendingTasks.length > 0 ? (
                    pendingTasks.map(task => (
                      <TaskRow key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
                    ))
                  ) : tasks.length === 0 ? (
                    <div className="py-20 text-center text-slate-400">
                       <CheckSquare size={48} className="mx-auto mb-4 opacity-10" />
                       <p className="text-lg font-medium">All tasks completed!</p>
                       <p className="text-sm">You're all caught up.</p>
                    </div>
                  ) : null}

                  {completedTasks.length > 0 && (
                    <div className="pt-6 mt-6 border-t border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Completed Items</p>
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
              {/* Identity Card */}
              <div className="glass rounded-[2rem] p-8 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full -mr-32 -mt-32 blur-3xl" />
                
                <div className="flex flex-col md:flex-row items-center gap-8 relative">
                  <div 
                    className="w-32 h-32 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 text-4xl font-bold shadow-2xl border-4 border-white overflow-hidden relative group cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.substring(0, 2).toUpperCase()
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <ImageIcon size={24} />
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                    />
                  </div>
                  <div className="text-center md:text-left space-y-2">
                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                      <h2 className="text-3xl font-black text-slate-800">{user?.name}</h2>
                      <span className="px-3 py-1 bg-purple-600 text-white text-[10px] font-black rounded-lg uppercase tracking-widest w-fit mx-auto md:mx-0">
                        {user?.role}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-slate-600">{user?.title}</p>
                    <p className="text-sm text-slate-400 font-medium max-w-md">{user?.desc}</p>
                  </div>
                </div>
              </div>

              {/* Security */}
              <div className="glass rounded-[2rem] p-8 border-l-4 border-l-amber-500 shadow-xl shadow-amber-500/5">
                 <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Key size={20} className="text-amber-500" />
                    Security Settings
                 </h3>
                 <div className="flex flex-col md:flex-row gap-4">
                    <input
                      type="password"
                      placeholder="Update your password..."
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="flex-1 px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-purple-500/10 text-base"
                    />
                    <button
                      onClick={handlePasswordChange}
                      className="px-8 py-4 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-700 transition-all shadow-lg active:scale-95 shrink-0"
                    >
                      Update Password
                    </button>
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Options */}
        <div className="space-y-6">
          
          {/* Assign Task Card */}
          <div className="glass rounded-[2rem] p-6 space-y-4 border border-purple-100 shadow-xl shadow-purple-500/5">
            <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
              <Send size={18} className="text-purple-600" />
              Assign Task
            </h4>
            <div className="space-y-3">
              <select
                value={assignTo}
                onChange={(e) => setAssignTo(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              >
                <option value="">Select User...</option>
                {userList.filter(u => u.name !== user?.name).map(u => (
                  <option key={u.name} value={u.name}>{u.name} ({u.title})</option>
                ))}
              </select>
              <textarea
                placeholder="What task to assign?"
                value={assignInput}
                onChange={(e) => setAssignInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              />
              <button
                onClick={handleAssign}
                disabled={!assignTo || !assignInput.trim()}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-purple-200"
              >
                <Send size={14} /> Assign Now
              </button>
            </div>
          </div>

          <div className="glass rounded-[2rem] p-6 space-y-4 border-t-4 border-t-purple-500">
             <div className="flex items-center justify-between mb-2">
               <h4 className="font-bold text-slate-800 flex items-center gap-2">
                 <Lightbulb size={18} className="text-amber-500" />
                 Contextual Hints
               </h4>
             </div>
             <div className="space-y-2">
               {suggestions.map((s, i) => (
                 <button
                    key={i}
                    onClick={() => addTask(s, "/")}
                    className="w-full text-left text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-purple-600 hover:text-white p-3 rounded-xl transition-all border border-slate-100 group flex items-center justify-between"
                 >
                   {s}
                   <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
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
    <div className={`flex items-center gap-4 group px-5 py-5 rounded-2xl transition-all border ${
      task.completed 
        ? "bg-slate-50/50 border-transparent opacity-60" 
        : "bg-white border-slate-100 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-500/5"
    }`}>
      <button
        onClick={() => onToggle(task.id)}
        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
          task.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 hover:border-purple-500"
        }`}
      >
        {task.completed && <CheckCheck size={14} />}
      </button>
      <div className="flex-1">
        <p className={`text-base font-bold ${task.completed ? "line-through text-slate-400" : "text-slate-700"}`}>
          {task.text}
        </p>
        {task.context === "assigned" && (
           <span className="text-[10px] text-purple-500 font-bold uppercase tracking-wider">Assigned Task</span>
        )}
      </div>
      <button
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all p-1"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}
