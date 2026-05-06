import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  CheckSquare, X, Plus, Trash2, Lightbulb, CheckCheck, 
  User, Shield, Key, Image as ImageIcon, ClipboardList, 
  Settings, Users, Briefcase, ChevronRight, Info
} from "lucide-react";
import { useTaskStore } from "../hooks/useTaskStore";
import { useAuth } from "../context/AuthContext";

export default function UserSpace() {
  const location = useLocation();
  const { user } = useAuth();
  
  const initialTab = (location.state && location.state.tab) || "tasks";
  const [activeTab, setActiveTab] = useState(initialTab); 
  
  const [input, setInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const inputRef = useRef(null);

  const { tasks, addTask, toggleTask, deleteTask, clearCompleted, suggestions, pendingCount } =
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 max-w-6xl mx-auto px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">User Space</h1>
          <p className="text-slate-500 text-sm mt-1">
            Logged in as <span className="text-purple-600 font-bold">{user?.name}</span> • {user?.title}
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
            Profile & Security
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
                   <h3 className="font-bold text-slate-800 uppercase tracking-wider text-xs">Priority Task List</h3>
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
                       <p className="text-lg font-medium">Clear for today!</p>
                       <p className="text-sm">You have no pending tasks in your space.</p>
                    </div>
                  ) : null}

                  {completedTasks.length > 0 && (
                    <div className="pt-6 mt-6 border-t border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Completed ({completedCount})</p>
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
                  <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold shadow-2xl border-4 border-white/50">
                    {user?.name?.substring(0, 2).toUpperCase()}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100 relative">
                   <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                        <Users size={12} /> Hierarchical Position
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-500 font-medium italic">Reports To:</span>
                          <span className="text-sm font-bold text-slate-700">{user?.reportsTo}</span>
                        </div>
                      </div>
                   </div>
                   <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                        <Shield size={12} /> Data Access Level
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-500 font-medium italic">Permissions:</span>
                          <span className="text-sm font-bold text-slate-700">
                            {user?.role === 'ceo' ? 'Unlimited Global Access' : 
                             user?.role === 'admin' ? 'Administrative Data Access' : 
                             user?.name === 'Praveen' ? 'Managerial + Multi-Centre Accounts' : 
                             'Managerial Level'}
                          </span>
                        </div>
                      </div>
                   </div>
                </div>
              </div>

              {/* Security */}
              <div className="glass rounded-[2rem] p-8 border-l-4 border-l-amber-500 shadow-xl shadow-amber-500/5">
                 <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Key size={20} className="text-amber-500" />
                    Security Update
                 </h3>
                 <div className="flex flex-col md:flex-row gap-4">
                    <input
                      type="password"
                      placeholder="Type your new password..."
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="flex-1 px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-purple-500/10 text-base"
                    />
                    <button
                      onClick={handlePasswordChange}
                      className="px-8 py-4 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-700 transition-all shadow-lg active:scale-95 shrink-0"
                    >
                      Apply Changes
                    </button>
                 </div>
                 <p className="text-[10px] text-slate-400 mt-4 flex items-center gap-1.5">
                   <Info size={12} /> Avoid using common phrases or personal names in your password.
                 </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Context */}
        <div className="space-y-6">
          <div className="glass rounded-[2rem] p-6 bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-2xl relative overflow-hidden group">
             <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
             <h4 className="font-bold mb-6 flex items-center gap-2 text-purple-400">
               <Briefcase size={18} /> Role Protocol
             </h4>
             <div className="space-y-4">
                {user?.role === 'ceo' ? (
                  <ProtocolItem text="Review high-level revenue trends weekly" />
                ) : user?.name === 'Praveen' ? (
                  <>
                    <ProtocolItem text="Reconcile accounts for all centres daily" />
                    <ProtocolItem text="Audit centre-wise share distributions" />
                  </>
                ) : user?.role === 'manager' ? (
                  <ProtocolItem text="Ensure all student data is updated by EOD" />
                ) : (
                  <>
                    <ProtocolItem text="Verify data integrity across all sources" />
                    <ProtocolItem text="Optimize dashboard visuals for clarity" />
                  </>
                )}
                <ProtocolItem text="Monitor daily enrolment growth" />
                <ProtocolItem text="Maintain system security protocols" />
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

function ProtocolItem({ text }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
      <span className="text-xs font-medium opacity-90">{text}</span>
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
      <p className={`text-base flex-1 font-bold ${task.completed ? "line-through text-slate-400" : "text-slate-700"}`}>
        {task.text}
      </p>
      <button
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all p-1"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}
