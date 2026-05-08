import { useState, useRef, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckSquare, X, Plus, Trash2, Lightbulb, CheckCheck, 
  User, Shield, Key, Image as ImageIcon, ClipboardList, 
  Settings, Users, Briefcase, ChevronRight, Info, Send,
  AlertCircle, Tag, Calendar as CalendarIcon, MapPin, RefreshCw,
  Clock, Zap, Layout
} from "lucide-react";
import { useTaskStore } from "../hooks/useTaskStore";
import { useAuth } from "../context/AuthContext";
import { useGlobalData } from "../context/DashboardContext";
import { useDashboardData } from "../hooks/useDashboardData";

export default function UserSpace() {
  const location = useLocation();
  const { user, profileImage, updateProfileImage, userList } = useAuth();
  const { centres } = useGlobalData();
  const { reconciliation } = useDashboardData();
  
  const [activeTab, setActiveTab] = useState("workflow"); 
  
  const [taskForm, setTaskForm] = useState({
    text: "",
    type: "General",
    priority: "Medium",
    relatedTo: "Global",
    dueDate: ""
  });

  const [assignForm, setAssignForm] = useState({
    text: "",
    type: "General",
    priority: "High",
    relatedTo: "Global",
    to: ""
  });

  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const { tasks, addTask, sendTaskToUser, toggleTask, deleteTask, clearCompleted, suggestions, loading } =
    useTaskStore(location.pathname);

  const taskTypes = ["General", "Data", "Operations", "Accounts", "Reconciliation"];
  const priorities = ["Low", "Medium", "High", "Urgent"];
  
  const relatedOptions = useMemo(() => {
    const base = ["Global"];
    if (centres) centres.forEach(c => base.push(c));
    return base;
  }, [centres]);

  // Workflow Categorization
  const backlogTasks = tasks.filter(t => !t.completed && t.priority !== 'Urgent');
  const urgentTasks = tasks.filter(t => !t.completed && t.priority === 'Urgent');
  const completedTasks = tasks.filter(t => t.completed).slice(0, 5);

  const handleAdd = () => {
    if (!taskForm.text.trim()) return;
    addTask(taskForm, "/");
    setTaskForm({ text: "", type: "General", priority: "Medium", relatedTo: "Global", dueDate: "" });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => updateProfileImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 lg:px-0">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex items-center gap-6">
           <div className="w-20 h-20 rounded-3xl bg-white dark:bg-slate-800 border-4 border-purple-100 dark:border-slate-700 shadow-xl overflow-hidden relative group">
              {profileImage ? <img src={profileImage} alt="Profile" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl font-black text-purple-600">{user?.name?.substring(0, 2).toUpperCase()}</div>}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <ImageIcon size={20} />
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
           </div>
           <div>
              <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">System Workflow</h1>
              <p className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-2 mt-1">
                <span className="text-purple-600">{user?.name}</span> • {user?.title}
              </p>
           </div>
        </div>
        
        <div className="flex gap-2 p-1.5 bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl w-fit border border-white/50 dark:border-slate-700">
          <button onClick={() => setActiveTab("workflow")} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === "workflow" ? "bg-white dark:bg-slate-700 text-purple-600 shadow-lg" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}><Layout size={16}/> Work Stream</button>
          <button onClick={() => setActiveTab("settings")} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === "settings" ? "bg-white dark:bg-slate-700 text-purple-600 shadow-lg" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}><Settings size={16}/> Config</button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "workflow" ? (
          <motion.div key="workflow" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: The Boards */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Urgent Fire-fighting Board */}
              {urgentTasks.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2 px-2 text-rose-500">
                    <Zap size={18} className="fill-current" />
                    <h3 className="text-sm font-black uppercase tracking-[0.2em]">Priority Blitz</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {urgentTasks.map(task => <TaskCard key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} urgent />)}
                  </div>
                </section>
              )}

              {/* Audit Integration: System Generated Tasks */}
              {reconciliation.length > 0 && (
                <section className="space-y-4">
                   <div className="flex items-center gap-2 px-2 text-amber-500">
                    <AlertCircle size={18} />
                    <h3 className="text-sm font-black uppercase tracking-[0.2em]">Audit Discrepancies</h3>
                  </div>
                  <div className="glass p-6 rounded-[2rem] border-l-8 border-l-amber-500 bg-amber-50/10">
                     <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Our engine found <span className="text-amber-600">{reconciliation.length}</span> anomalies that need verification.</p>
                        <button onClick={() => window.location.href='/audit'} className="text-[10px] font-black text-amber-600 uppercase underline">Go to Audit Page</button>
                     </div>
                     <div className="flex -space-x-2 overflow-hidden">
                        {reconciliation.slice(0, 5).map((r, i) => (
                          <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-800 bg-amber-100 flex items-center justify-center text-amber-700 text-[10px] font-black">{i+1}</div>
                        ))}
                        {reconciliation.length > 5 && <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-800 bg-slate-200 flex items-center justify-center text-slate-600 text-[10px] font-black">+{reconciliation.length - 5}</div>}
                     </div>
                  </div>
                </section>
              )}

              {/* Standard Board */}
              <section className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                    <ClipboardList size={18} />
                    <h3 className="text-sm font-black uppercase tracking-[0.2em]">Daily Queue</h3>
                  </div>
                  <button onClick={clearCompleted} className="text-[10px] font-black text-slate-400 hover:text-rose-500 uppercase">Archive Done</button>
                </div>
                
                <div className="space-y-4">
                  {backlogTasks.length > 0 ? (
                    backlogTasks.map(task => <TaskCard key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />)
                  ) : (
                    <div className="py-20 text-center glass rounded-[2.5rem] border-dashed border-2 border-slate-200 dark:border-slate-700">
                      <CheckCheck size={48} className="mx-auto mb-4 text-emerald-400 opacity-50" />
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Queue is clear</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Archive */}
              {completedTasks.length > 0 && (
                 <section className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 opacity-50">
                    <h3 className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest px-2">Recently Completed</h3>
                    {completedTasks.map(task => <TaskCard key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />)}
                 </section>
              )}
            </div>

            {/* Right Column: Controls & Analytics */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* Creator Card */}
              <div className="glass rounded-[2.5rem] p-8 space-y-6 bg-gradient-to-br from-white to-purple-50/50 dark:from-slate-800 dark:to-slate-900 border-none shadow-2xl">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-200 dark:shadow-none">
                      <Plus size={24} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white">Push to Queue</h3>
                 </div>

                 <div className="space-y-5">
                    <textarea 
                      ref={inputRef}
                      placeholder="What needs to be done?"
                      className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-slate-800 border-none focus:ring-4 focus:ring-purple-500/10 dark:focus:ring-purple-500/20 text-base font-bold dark:text-white min-h-[120px] resize-none"
                      value={taskForm.text}
                      onChange={e => setTaskForm({...taskForm, text: e.target.value})}
                    />

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Priority</label>
                          <select 
                            value={taskForm.priority}
                            onChange={e => setTaskForm({...taskForm, priority: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border-none text-xs font-bold text-slate-700 dark:text-slate-200"
                          >
                            {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Tag</label>
                          <select 
                            value={taskForm.type}
                            onChange={e => setTaskForm({...taskForm, type: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border-none text-xs font-bold text-slate-700 dark:text-slate-200"
                          >
                            {taskTypes.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                       </div>
                    </div>

                    <button 
                      onClick={handleAdd}
                      disabled={!taskForm.text.trim()}
                      className="w-full py-4 bg-slate-800 dark:bg-purple-600 hover:scale-[1.02] active:scale-95 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl disabled:opacity-30"
                    >
                      Initialize Task
                    </button>
                 </div>
              </div>

              {/* Suggestions */}
              <div className="glass rounded-[2rem] p-6 space-y-4 border-t-4 border-t-amber-400 bg-white/50 dark:bg-slate-800/50">
                 <h4 className="font-black text-slate-800 dark:text-white flex items-center gap-2 text-xs uppercase tracking-widest"><Lightbulb size={16} className="text-amber-500" /> Smart Recommendations</h4>
                 <div className="space-y-2">
                   {suggestions.map((s, i) => (
                     <button
                        key={i}
                        onClick={() => addTask({ text: s, type: "General", priority: "Medium", relatedTo: "Global" })}
                        className="w-full text-left text-[11px] font-bold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-700 hover:bg-purple-600 hover:text-white p-3 rounded-xl transition-all border border-slate-100 dark:border-slate-600 group flex items-center justify-between"
                     >
                       {s} <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                     </button>
                   ))}
                 </div>
              </div>

            </div>
          </motion.div>
        ) : (
          <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-2xl mx-auto glass rounded-[2.5rem] p-10 space-y-10">
             <div className="space-y-4">
                <h3 className="text-xl font-black text-slate-800 dark:text-white">Security & Access</h3>
                <div className="space-y-6">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Change Password</label>
                      <div className="flex gap-4">
                        <input type="password" placeholder="New strong password..." className="flex-1 px-5 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-4 focus:ring-purple-500/10 text-base font-bold" />
                        <button className="px-8 py-4 bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest">Update</button>
                      </div>
                   </div>
                </div>
             </div>
             
             <div className="border-t border-slate-100 dark:border-slate-800 pt-10">
                <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6">Profile Details</h3>
                <div className="grid grid-cols-2 gap-8">
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Assigned Role</p>
                      <p className="text-lg font-bold text-slate-800 dark:text-white">{user?.role}</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reports To</p>
                      <p className="text-lg font-bold text-slate-800 dark:text-white">{user?.reportsTo}</p>
                   </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TaskCard({ task, onToggle, onDelete, urgent }) {
  const navigate = useNavigate();
  
  const getPriorityStyle = (p) => {
    switch (p) {
      case "Urgent": return "bg-rose-500 text-white border-rose-600 shadow-lg shadow-rose-200 dark:shadow-none";
      case "High": return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30";
      case "Medium": return "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-400 dark:border-indigo-500/30";
      default: return "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700/50 dark:text-slate-400 dark:border-slate-600";
    }
  };

  return (
    <motion.div 
      layout
      className={`relative group flex flex-col md:flex-row items-start md:items-center gap-4 p-6 rounded-[2rem] transition-all border shadow-sm ${
        task.completed ? "bg-slate-50/50 dark:bg-slate-900/30 border-transparent opacity-60" : "bg-white dark:bg-slate-800 border-white dark:border-slate-700 hover:shadow-2xl hover:border-purple-200 dark:hover:border-purple-500/30"
      }`}
    >
      <button
        onClick={() => onToggle(task.id)}
        className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all ${
          task.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200 dark:border-slate-600 hover:border-purple-500 bg-slate-50 dark:bg-slate-700"
        }`}
      >
        {task.completed && <CheckCheck size={18} />}
      </button>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getPriorityStyle(task.priority)}`}>
            {task.priority}
          </span>
          <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50 dark:bg-slate-700 px-2.5 py-0.5 rounded-lg">
             {task.type}
          </span>
          {task.relatedTo && task.relatedTo !== "Global" && (
            <button 
              onClick={(e) => { e.stopPropagation(); navigate(`/centres/${task.relatedTo}`); }}
              className="flex items-center gap-1.5 text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest bg-purple-100 dark:bg-purple-500/20 px-2.5 py-0.5 rounded-lg hover:bg-purple-200 transition-colors"
            >
              <MapPin size={10}/> {task.relatedTo}
            </button>
          )}
        </div>
        <p className={`text-lg font-bold leading-tight tracking-tight ${task.completed ? "line-through text-slate-400" : "text-slate-800 dark:text-white"}`}>
          {task.text}
        </p>
      </div>

      <div className="flex items-center gap-2 self-end md:self-center">
         <div className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase flex items-center gap-1 mr-2">
            <Clock size={10} /> 
            {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'Today'}
         </div>
         <button
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 text-slate-200 dark:text-slate-600 hover:text-rose-500 transition-all p-2 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </motion.div>
  );
}
