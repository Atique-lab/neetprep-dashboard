import { useState, useRef, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckSquare, X, Plus, Trash2, Lightbulb, CheckCheck, 
  User, Shield, Key, Image as ImageIcon, ClipboardList, 
  Settings, Users, Briefcase, ChevronRight, Info, Send,
  AlertCircle, Tag, Calendar as CalendarIcon, MapPin
} from "lucide-react";
import { useTaskStore } from "../hooks/useTaskStore";
import { useAuth } from "../context/AuthContext";
import { useGlobalData } from "../context/DashboardContext";

export default function UserSpace() {
  const location = useLocation();
  const { user, profileImage, updateProfileImage, userList } = useAuth();
  const { centres } = useGlobalData();
  
  const initialTab = (location.state && location.state.tab) || "tasks";
  const [activeTab, setActiveTab] = useState(initialTab); 
  
  // Structured Task State
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

  const [newPassword, setNewPassword] = useState("");
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const { tasks, addTask, sendTaskToUser, toggleTask, deleteTask, clearCompleted, suggestions, pendingCount } =
    useTaskStore(location.pathname);

  useEffect(() => {
    if (activeTab === "tasks") setTimeout(() => inputRef.current?.focus(), 150);
  }, [activeTab]);

  const handleAdd = () => {
    if (!taskForm.text.trim()) return;
    addTask(taskForm, "/");
    setTaskForm({ text: "", type: "General", priority: "Medium", relatedTo: "Global", dueDate: "" });
  };

  const handleAssign = () => {
    if (!assignForm.text.trim() || !assignForm.to) return;
    sendTaskToUser(assignForm.to, assignForm, user?.name);
    alert(`Task assigned to ${assignForm.to}!`);
    setAssignForm({ text: "", type: "General", priority: "High", relatedTo: "Global", to: "" });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => updateProfileImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const taskTypes = ["General", "Data", "Operations", "Accounts", "Reconciliation"];
  const priorities = ["Low", "Medium", "High", "Urgent"];
  
  const relatedOptions = useMemo(() => {
    const base = ["Global"];
    if (centres) centres.forEach(c => base.push(c));
    return base;
  }, [centres]);

  const completedCount = tasks.filter(t => t.completed).length;
  const pendingTasks  = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 max-w-6xl mx-auto px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">User Space</h1>
          <p className="text-slate-500 text-sm mt-1">
            Managing as <span className="text-purple-600 font-bold">{user?.name}</span> • {user?.title}
          </p>
        </div>
        
        <div className="flex gap-2 p-1 bg-slate-200/50 rounded-2xl w-fit border border-white/50">
          <button
            onClick={() => setActiveTab("tasks")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "tasks" ? "bg-white text-purple-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <ClipboardList size={18} />
            My Space
            {pendingCount > 0 && <span className="bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">{pendingCount}</span>}
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "profile" ? "bg-white text-purple-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Settings size={18} />
            Settings
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === "tasks" ? (
            <div className="space-y-6">
              {/* New Task Creator */}
              <div className="glass rounded-[2.5rem] p-8 space-y-6 bg-gradient-to-br from-white to-purple-50/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-200">
                    <Plus size={22} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-lg">Create Task</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Add a new item to your space</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Task description..."
                    value={taskForm.text}
                    onChange={e => setTaskForm({...taskForm, text: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-purple-500/10 text-lg bg-white shadow-sm"
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-1"><Tag size={10}/> Type</label>
                      <select 
                        value={taskForm.type}
                        onChange={e => setTaskForm({...taskForm, type: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 focus:ring-2 focus:ring-purple-500/20"
                      >
                        {taskTypes.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-1"><AlertCircle size={10}/> Priority</label>
                      <select 
                        value={taskForm.priority}
                        onChange={e => setTaskForm({...taskForm, priority: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 focus:ring-2 focus:ring-purple-500/20"
                      >
                        {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-1"><MapPin size={10}/> Related To</label>
                      <select 
                        value={taskForm.relatedTo}
                        onChange={e => setTaskForm({...taskForm, relatedTo: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 focus:ring-2 focus:ring-purple-500/20"
                      >
                        {relatedOptions.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleAdd}
                    disabled={!taskForm.text.trim()}
                    className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-200 transition-all active:scale-[0.98] disabled:opacity-40"
                  >
                    Add Task to List
                  </button>
                </div>
              </div>

              {/* Task List */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-4">
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Active Tasks</h3>
                   {completedCount > 0 && (
                     <button onClick={clearCompleted} className="text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest">Clear Completed</button>
                   )}
                </div>

                {pendingTasks.length > 0 ? (
                  pendingTasks.map(task => <TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />)
                ) : tasks.length === 0 ? (
                  <div className="py-16 text-center glass rounded-[2rem]">
                     <CheckCheck size={48} className="mx-auto mb-4 text-emerald-400" />
                     <p className="text-lg font-black text-slate-800">You're All Done!</p>
                     <p className="text-sm text-slate-400 font-medium">No pending tasks for today.</p>
                  </div>
                ) : null}

                {completedTasks.length > 0 && (
                  <div className="space-y-3 pt-6 border-t border-slate-100">
                    <h3 className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] px-4">Recently Finished</h3>
                    <div className="opacity-60 grayscale-[0.5]">
                      {completedTasks.map(task => <TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="glass rounded-[2rem] p-8 space-y-8 bg-white/60">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div 
                    className="w-32 h-32 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 text-4xl font-bold shadow-2xl border-4 border-white overflow-hidden relative group cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {profileImage ? <img src={profileImage} alt="Profile" className="w-full h-full object-cover" /> : user?.name?.substring(0, 2).toUpperCase()}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"><ImageIcon size={24} /></div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                  </div>
                  <div className="text-center md:text-left">
                    <h2 className="text-3xl font-black text-slate-800">{user?.name}</h2>
                    <p className="text-lg font-bold text-slate-500 mt-1">{user?.title}</p>
                    <div className="flex gap-2 justify-center md:justify-start mt-3">
                      <span className="px-3 py-1 bg-purple-600 text-white text-[10px] font-black rounded-lg uppercase tracking-widest">{user?.role}</span>
                      <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded-lg uppercase tracking-widest">Reports to: {user?.reportsTo}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass rounded-[2rem] p-8 space-y-6">
                 <h3 className="text-lg font-black text-slate-800 flex items-center gap-2"><Key size={20} className="text-amber-500" /> Security Settings</h3>
                 <div className="flex flex-col md:flex-row gap-4">
                    <input
                      type="password"
                      placeholder="Update your password..."
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="flex-1 px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-purple-500/10 text-base"
                    />
                    <button onClick={() => { alert("Password Updated!"); setNewPassword(""); }} className="px-8 py-4 bg-slate-800 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg">Update</button>
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="glass rounded-[2rem] p-8 space-y-6 border border-purple-100 bg-gradient-to-br from-white to-purple-50/50">
            <h4 className="font-black text-slate-800 flex items-center gap-2 text-sm uppercase tracking-widest">
              <Send size={18} className="text-purple-600" /> Assign Task
            </h4>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Assign To</label>
                <select
                  value={assignForm.to}
                  onChange={e => setAssignForm({...assignForm, to: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 bg-white"
                >
                  <option value="">Select User Name</option>
                  {userList.filter(u => u.name !== user?.name).map(u => <option key={u.name} value={u.name}>{u.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Task Content</label>
                <textarea
                  placeholder="Details of the task..."
                  value={assignForm.text}
                  onChange={e => setAssignForm({...assignForm, text: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium bg-white min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Type</label>
                  <select 
                    value={assignForm.type}
                    onChange={e => setAssignForm({...assignForm, type: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] font-bold"
                  >
                    {taskTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Priority</label>
                  <select 
                    value={assignForm.priority}
                    onChange={e => setAssignForm({...assignForm, priority: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] font-bold"
                  >
                    {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <button
                onClick={handleAssign}
                disabled={!assignForm.to || !assignForm.text.trim()}
                className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-purple-200 disabled:opacity-40 transition-all"
              >
                Send Task
              </button>
            </div>
          </div>

          <div className="glass rounded-[2rem] p-6 space-y-4 border-t-4 border-t-amber-400">
             <h4 className="font-black text-slate-800 flex items-center gap-2 text-xs uppercase tracking-widest"><Lightbulb size={16} className="text-amber-500" /> Suggestions</h4>
             <div className="space-y-2">
               {suggestions.map((s, i) => (
                 <button
                    key={i}
                    onClick={() => addTask({ text: s, type: "General", priority: "Medium", relatedTo: "Global" }, "/")}
                    className="w-full text-left text-[11px] font-bold text-slate-600 bg-slate-50 hover:bg-purple-600 hover:text-white p-3 rounded-xl transition-all border border-slate-100 group flex items-center justify-between"
                 >
                   {s} <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                 </button>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskItem({ task, onToggle, onDelete }) {
  const getPriorityColor = (p) => {
    switch (p) {
      case "Urgent": return "bg-rose-100 text-rose-700 border-rose-200";
      case "High": return "bg-orange-100 text-orange-700 border-orange-200";
      case "Medium": return "bg-indigo-100 text-indigo-700 border-indigo-200";
      default: return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const getTypeIcon = (t) => {
    switch (t) {
      case "Data": return <Users size={12} />;
      case "Accounts": return <Tag size={12} />;
      case "Operations": return <Briefcase size={12} />;
      default: return <ClipboardList size={12} />;
    }
  };

  return (
    <div className={`flex items-center gap-5 group px-6 py-6 rounded-[2rem] transition-all border shadow-sm ${
      task.completed ? "bg-slate-50/50 border-transparent opacity-60" : "bg-white border-white hover:border-purple-200 hover:shadow-xl hover:shadow-purple-500/5"
    }`}>
      <button
        onClick={() => onToggle(task.id)}
        className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all ${
          task.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200 hover:border-purple-500 bg-slate-50"
        }`}
      >
        {task.completed && <CheckCheck size={16} />}
      </button>

      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-md">
            {getTypeIcon(task.type)} {task.type}
          </span>
          {task.relatedTo && task.relatedTo !== "Global" && (
            <span className="flex items-center gap-1 text-[9px] font-bold text-purple-400 uppercase tracking-widest bg-purple-50 px-2 py-0.5 rounded-md">
              <MapPin size={9}/> {task.relatedTo}
            </span>
          )}
          {task.assignedBy && (
            <span className="flex items-center gap-1 text-[9px] font-black text-purple-600 uppercase tracking-widest bg-purple-100 px-2 py-0.5 rounded-md">
              From: {task.assignedBy}
            </span>
          )}
        </div>
        <p className={`text-base font-bold leading-tight ${task.completed ? "line-through text-slate-400" : "text-slate-800"}`}>
          {task.text}
        </p>
      </div>

      <button
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 text-slate-200 hover:text-rose-500 transition-all p-2 hover:bg-rose-50 rounded-xl"
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
}
