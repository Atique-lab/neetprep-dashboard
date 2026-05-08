import { useState, useRef, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckSquare, X, Plus, Trash2, Lightbulb, CheckCheck, 
  User, Shield, Key, Image as ImageIcon, ClipboardList, 
  Settings, Users, Briefcase, ChevronRight, Info, Send,
  AlertCircle, Tag, Calendar as CalendarIcon, MapPin, RefreshCw,
  Clock, Zap, Layout, TrendingUp
} from "lucide-react";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell, Tooltip
} from "recharts";
import { useTaskStore } from "../hooks/useTaskStore";
import { useAuth } from "../context/AuthContext";
import { useGlobalData } from "../context/DashboardContext";
import { useDashboardData } from "../hooks/useDashboardData";

export default function UserSpace() {
  const location = useLocation();
  const { user, profileImage, updateProfileImage, userList, presence, changePassword } = useAuth();
  const { centres } = useGlobalData();
  const { reconciliation } = useDashboardData();
  
  const [activeTab, setActiveTab] = useState("workflow"); 
  const [newPassword, setNewPassword] = useState("");
  const [passStatus, setPassStatus] = useState(null);
  
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

  const { tasks, addTask, sendTaskToUser, toggleTask, deleteTask, updateTaskNotes, clearCompleted, suggestions, loading } =
    useTaskStore(location.pathname);

  const taskTypes = ["General", "Data", "Operations", "Accounts", "Reconciliation"];
  const priorities = ["Low", "Medium", "High", "Urgent"];
  
  const relatedOptions = useMemo(() => {
    const base = ["Global"];
    if (centres) centres.forEach(c => base.push(c));
    return base;
  }, [centres]);

  // Workflow Categorization
  const backlogTasks = (tasks || []).filter(t => !t.completed && t.priority !== 'Urgent');
  const urgentTasks = (tasks || []).filter(t => !t.completed && t.priority === 'Urgent');
  const completedTasks = (tasks || []).filter(t => t.completed).slice(0, 5);

  const handleAdd = () => {
    if (!taskForm.text.trim()) return;
    addTask(taskForm, "/");
    setTaskForm({ text: "", type: "General", priority: "Medium", relatedTo: "Global", dueDate: "" });
  };

  const [cropModal, setCropModal] = useState({ open: false, src: null });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCropModal({ open: true, src: reader.result });
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
                <span className="text-purple-600">{user?.name}</span> {user?.name === 'Atique' && `• ${user?.title}`}
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
                    {urgentTasks.map(task => <TaskCard key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} onUpdateNotes={updateTaskNotes} urgent />)}
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
                    backlogTasks.map(task => <TaskCard key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} onUpdateNotes={updateTaskNotes} />)
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
                    {completedTasks.map(task => <TaskCard key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} onUpdateNotes={updateTaskNotes} />)}
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

                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Deadline (Optional)</label>
                       <input 
                         type="date"
                         value={taskForm.dueDate}
                         onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})}
                         className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border-none text-xs font-bold text-slate-700 dark:text-slate-200"
                       />
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

            {/* Delegation Card */}
            <div className="glass rounded-[2.5rem] p-8 space-y-6 bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-800 dark:to-slate-900 border-none shadow-2xl">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none">
                    <Send size={20} />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white">Delegate Work</h3>
               </div>

               <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Assign To</label>
                    <select 
                      value={assignForm.to}
                      onChange={e => setAssignForm({...assignForm, to: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border-none text-xs font-bold text-slate-700 dark:text-slate-200"
                    >
                      <option value="">Select Manager...</option>
                      {userList.filter(u => u.name !== user?.name).map(u => (
                        <option key={u.name} value={u.name}>
                          {u.name} {user?.name === 'Atique' ? `(${u.title})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <textarea 
                    placeholder="Task details for colleague..."
                    className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-slate-800 border-none focus:ring-4 focus:ring-blue-500/10 text-sm font-bold dark:text-white min-h-[80px] resize-none"
                    value={assignForm.text}
                    onChange={e => setAssignForm({...assignForm, text: e.target.value})}
                  />

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Colleague Deadline</label>
                    <input 
                      type="date"
                      value={assignForm.dueDate}
                      onChange={e => setAssignForm({...assignForm, dueDate: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border-none text-xs font-bold text-slate-700 dark:text-slate-200"
                    />
                  </div>

                  <button 
                    onClick={() => {
                      if (!assignForm.text.trim() || !assignForm.to) return;
                      sendTaskToUser(assignForm.to, assignForm, user?.name);
                      setAssignForm({ text: "", type: "General", priority: "High", relatedTo: "Global", to: "" });
                    }}
                    disabled={!assignForm.text.trim() || !assignForm.to}
                    className="w-full py-4 bg-blue-600 hover:scale-[1.02] active:scale-95 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-200 dark:shadow-none disabled:opacity-30"
                  >
                    Send to {assignForm.to || 'Manager'}
                  </button>
               </div>
            </div>

            {/* Productivity Card */}
            <div className="glass rounded-[2rem] p-6 space-y-4 bg-gradient-to-br from-white to-emerald-50/30 dark:from-slate-800 dark:to-slate-900 border-none">
               <div className="flex items-center justify-between">
                  <h4 className="font-black text-slate-800 dark:text-white flex items-center gap-2 text-xs uppercase tracking-widest"><TrendingUp size={16} className="text-emerald-500" /> Task Velocity</h4>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 dark:bg-emerald-500/20 px-2 py-0.5 rounded-lg">LIVE</span>
               </div>
               
               <div className="h-32 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Pending', count: backlogTasks.length + urgentTasks.length, fill: '#6366f1' },
                      { name: 'Done', count: tasks.filter(t => t.completed).length, fill: '#10b981' }
                    ]}>
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        <Cell fill="#6366f1" />
                        <Cell fill="#10b981" />
                      </Bar>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', fontWeight: 'bold', fontSize: '10px' }}
                        cursor={{ fill: 'transparent' }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white/60 dark:bg-slate-800/60 rounded-2xl border border-white dark:border-slate-700">
                     <p className="text-[9px] font-black text-slate-400 uppercase">Completion</p>
                     <p className="text-lg font-black text-slate-800 dark:text-white">
                        {tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0}%
                     </p>
                  </div>
                  <div className="p-3 bg-white/60 dark:bg-slate-800/60 rounded-2xl border border-white dark:border-slate-700">
                     <p className="text-[9px] font-black text-slate-400 uppercase">Velocity</p>
                     <p className="text-lg font-black text-slate-800 dark:text-white">
                        {tasks.filter(t => t.completed && new Date(t.updated_at) > new Date(Date.now() - 86400000)).length} <span className="text-[10px] text-slate-400">/24h</span>
                     </p>
                  </div>
               </div>
            </div>

            {/* Presence Card */}
            {user?.name === 'Atique' && (
              <div className="glass rounded-[2rem] p-6 space-y-4 bg-white/50 dark:bg-slate-800/50">
                 <h4 className="font-black text-slate-800 dark:text-white flex items-center gap-2 text-xs uppercase tracking-widest"><Users size={16} className="text-emerald-500" /> Live Team Presence</h4>
                 <div className="space-y-3">
                    {userList.map(u => {
                      const status = presence?.[u.name];
                      return (
                        <div key={u.name} className="flex items-center justify-between p-2 rounded-xl hover:bg-white dark:hover:bg-slate-700 transition-all">
                          <div className="flex items-center gap-3">
                             <div className="relative">
                                <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase">
                                   {status?.avatar_url ? <img src={status.avatar_url} className="w-full h-full object-cover rounded-lg" /> : u.name.substring(0, 2)}
                                </div>
                                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 ${status?.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                             </div>
                             <div>
                                <p className="text-xs font-black text-slate-700 dark:text-slate-200">{u.name}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{u.title}</p>
                             </div>
                          </div>
                          <div className="text-[9px] font-black text-slate-400 uppercase">
                             {status?.isOnline ? 'Active' : status?.last_seen ? new Date(status.last_seen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Offline'}
                          </div>
                        </div>
                      );
                    })}
                 </div>
              </div>
            )}

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
                        <input 
                           type="password" 
                           value={newPassword}
                           onChange={e => setNewPassword(e.target.value)}
                           placeholder="New strong password..." 
                           className="flex-1 px-5 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-4 focus:ring-purple-500/10 text-base font-bold dark:text-white" 
                         />
                         <button 
                           onClick={async () => {
                             if (!newPassword) return;
                             setPassStatus('updating');
                             const res = await changePassword(newPassword);
                             setPassStatus(res.success ? 'success' : 'error');
                             if (res.success) setNewPassword("");
                             setTimeout(() => setPassStatus(null), 3000);
                           }}
                           className="px-8 py-4 bg-slate-800 dark:bg-purple-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all"
                         >
                           {passStatus === 'updating' ? '...' : 'Update'}
                         </button>
                       </div>
                       {passStatus === 'success' && <p className="text-[10px] font-bold text-emerald-500 ml-4 mt-2">Password updated successfully!</p>}
                       {passStatus === 'error' && <p className="text-[10px] font-bold text-rose-500 ml-4 mt-2">Error updating password.</p>}
                   </div>
                </div>
             </div>
             
             <div className="border-t border-slate-100 dark:border-slate-800 pt-10">
                <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6">Profile Details</h3>
                 {user?.name === 'Atique' && (
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
                 )}
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ImageCropModal 
        isOpen={cropModal.open} 
        onClose={() => setCropModal({ open: false, src: null })}
        imageSrc={cropModal.src}
        onCropComplete={(croppedImage) => {
          updateProfileImage(croppedImage);
          setCropModal({ open: false, src: null });
        }}
      />
    </div>
  );
}

function TaskCard({ task, onToggle, onDelete, onUpdateNotes, urgent }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [noteText, setNoteText] = useState(task.notes || "");
  
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
  const isDueSoon = task.dueDate && !isOverdue && !task.completed && 
                   (new Date(task.dueDate) - new Date()) < (24 * 60 * 60 * 1000);

  const getPriorityStyle = (p) => {
    if (isOverdue) return "bg-rose-600 text-white border-rose-700 animate-pulse";
    if (isDueSoon) return "bg-amber-500 text-white border-amber-600";
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
          {task.assignedBy && task.assignedBy !== user?.name && (
            <span className="flex items-center gap-1 text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-500/10 px-2.5 py-0.5 rounded-lg">
              <User size={10}/> From: {task.assignedBy}
            </span>
          )}
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
         <div className="flex flex-col items-end gap-1 mr-2">
            <div className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase flex items-center gap-1">
               <Clock size={10} /> 
               {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'Today'}
            </div>
            {task.dueDate && (
               <div className={`text-[10px] font-black uppercase flex items-center gap-1 ${isOverdue ? 'text-rose-500' : isDueSoon ? 'text-amber-500' : 'text-slate-400'}`}>
                  <CalendarIcon size={10} /> 
                  Due: {new Date(task.dueDate).toLocaleDateString()}
               </div>
            )}
         </div>
         <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-2 rounded-xl transition-all ${isExpanded ? 'bg-purple-100 text-purple-600' : 'text-slate-300 hover:text-slate-500 hover:bg-slate-50'}`}
        >
          <Info size={20} />
        </button>
         <button
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 text-slate-200 dark:text-slate-600 hover:text-rose-500 transition-all p-2 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 overflow-hidden"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <Lightbulb size={12} className="text-amber-500" />
                Notes & Activity Log
              </div>
              <textarea 
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add status updates, notes or log activity here..."
                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-none text-sm font-bold text-slate-700 dark:text-slate-300 resize-none min-h-[100px] focus:ring-2 focus:ring-purple-500/20"
              />
              <div className="flex justify-end">
                <button 
                  onClick={() => onUpdateNotes(task.id, noteText)}
                  className="px-4 py-2 bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-purple-700 transition-all shadow-md active:scale-95"
                >
                  Save Note
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
function ImageCropModal({ isOpen, onClose, imageSrc, onCropComplete }) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        imageRef.current = img;
        draw();
      };
    }
  }, [imageSrc, zoom, position]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Background (Dimmed)
    ctx.globalAlpha = 0.3;
    const drawWidth = canvas.width * zoom;
    const drawHeight = (img.height / img.width) * drawWidth;
    ctx.drawImage(img, position.x, position.y, drawWidth, drawHeight);
    
    // Draw Circular Mask
    ctx.globalAlpha = 1.0;
    ctx.beginPath();
    ctx.arc(canvas.width/2, canvas.height/2, canvas.width/2 - 10, 0, Math.PI * 2);
    ctx.clip();
    
    ctx.drawImage(img, position.x, position.y, drawWidth, drawHeight);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleSave = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    ctx.beginPath();
    ctx.arc(200, 200, 200, 0, Math.PI * 2);
    ctx.clip();

    const scale = 400 / (canvasRef.current.width);
    const drawWidth = canvasRef.current.width * zoom * scale;
    const drawHeight = (img.height / img.width) * drawWidth;
    
    ctx.drawImage(img, position.x * scale, position.y * scale, drawWidth, drawHeight);
    onCropComplete(canvas.toDataURL('image/jpeg', 0.8));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-slate-800 rounded-[3rem] p-8 max-w-md w-full shadow-2xl space-y-6"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800 dark:text-white">Adjust Avatar</h3>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"><X size={20} /></button>
            </div>

            <div 
              className="relative aspect-square w-full bg-slate-100 dark:bg-slate-900 rounded-[2rem] overflow-hidden cursor-move border-4 border-purple-50 dark:border-slate-700"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
            >
              <canvas ref={canvasRef} width={400} height={400} className="w-full h-full" />
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-[calc(100%-20px)] h-[calc(100%-20px)] border-4 border-white/50 border-dashed rounded-full" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <TrendingUp size={16} className="text-purple-500" />
                <input 
                  type="range" min="1" max="3" step="0.01" 
                  value={zoom} onChange={e => setZoom(parseFloat(e.target.value))}
                  className="flex-1 accent-purple-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase text-center tracking-widest">Drag to reposition • Scroll to zoom</p>
              
              <button 
                onClick={handleSave}
                className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
              >
                Apply Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
