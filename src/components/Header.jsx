import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalData } from "../context/DashboardContext";
import { useAuth } from "../context/AuthContext";
import { useDashboardData } from "../hooks/useDashboardData";
import { Bell, LogOut, CheckCheck, Calendar, User, Shield, ExternalLink, RefreshCw, Sun, Moon, Menu } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function Header({ onToggleMenu }) {
  const navigate = useNavigate();
  const { dateRange, setDateRange, refreshData } = useGlobalData();
  const { user, logout, profileImage } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { notifications } = useDashboardData();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [readIds, setReadIds] = useState(() => {
    const saved = localStorage.getItem('read_notifications');
    return saved ? JSON.parse(saved) : [];
  });
  const popupRef = useRef(null);
  const profileRef = useRef(null);

  const months = [
    { id: "all", label: "All Time" },
    { id: "Jan", label: "January" },
    { id: "Feb", label: "February" },
    { id: "Mar", label: "March" },
    { id: "Apr", label: "April" },
    { id: "May", label: "May" },
    { id: "Jun", label: "June" },
    { id: "Jul", label: "July" },
    { id: "Aug", label: "August" },
    { id: "Sep", label: "September" },
    { id: "Oct", label: "October" },
    { id: "Nov", label: "November" },
    { id: "Dec", label: "December" },
  ];

  // Close popups on outside click
  useEffect(() => {
    function handleOutside(e) {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleBellClick = () => {
    setShowProfile(false);
    const next = !showNotifs;
    setShowNotifs(next);
    if (next && notifications?.length > 0) {
      const allIds = notifications.map(n => n.id).filter(Boolean);
      const newReadIds = Array.from(new Set([...readIds, ...allIds]));
      setReadIds(newReadIds);
      localStorage.setItem('read_notifications', JSON.stringify(newReadIds));
    }
  };

  const handleAvatarClick = () => {
    setShowNotifs(false);
    setShowProfile(!showProfile);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
      // Also trigger a task refresh for the current window
      window.dispatchEvent(new Event('refresh-tasks'));
      setTimeout(() => setIsRefreshing(false), 1000);
    } catch (err) {
      setIsRefreshing(false);
    }
  };

  const goToUserSpace = (tab = "tasks") => {
    setShowProfile(false);
    navigate("/user-space", { state: { tab } });
  };

  const unreadCount = notifications?.filter(n => !readIds.includes(n.id)).length || 0;

  const getInitials = (name) => {
    if (!name) return "NP";
    return name.substring(0, 2).toUpperCase();
  };

  const getNotifStyle = (notif) => {
    const text = typeof notif === 'string' ? notif : notif.text;
    if (text.startsWith("Alert:")) return { dot: "bg-rose-500", bg: "bg-rose-50/60", text: "text-rose-800" };
    if (text.startsWith("Warning:")) return { dot: "bg-amber-500", bg: "bg-amber-50/60", text: "text-amber-800" };
    return { dot: "bg-purple-500", bg: "bg-purple-50/40", text: "text-slate-700" };
  };

  const getRelativeTime = (isoStr) => {
    if (!isoStr) return "";
    const diff = Math.floor((Date.now() - new Date(isoStr).getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      {/* Left: Mobile Menu + Simplified Month Filter */}
      <div className="flex items-center gap-4 w-full md:w-auto">
        <button 
          onClick={onToggleMenu}
          className="p-3 glass rounded-xl text-slate-600 dark:text-slate-300 lg:hidden"
        >
          <Menu size={20} />
        </button>
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-purple-500 transition-colors">
            <Calendar size={16} />
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="pl-11 pr-10 py-3 glass rounded-2xl text-slate-700 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:10px_10px] bg-[right_16px_center] min-w-[200px]"
          >
            {months.map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </div>

        {/* Global Filter Badge */}
        <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
             Active View: {months.find(m => m.id === dateRange)?.label}
           </span>
        </div>
      </div>

      {/* Right: Bell + Avatar + Refresh + Logout */}
      <div className="flex items-center gap-3 relative">

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-3 glass rounded-full text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 transition-all"
          title="Toggle Theme"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          className={`p-3 glass rounded-full text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-all ${isRefreshing ? 'rotate-180 text-emerald-600' : ''}`}
          title="Refresh Data & Tasks"
          disabled={isRefreshing}
        >
          <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
        </button>

        {/* Bell */}
        <div className="relative" ref={popupRef}>
          <button
            onClick={handleBellClick}
            className="p-3 glass rounded-full text-slate-600 hover:text-purple-600 transition-colors relative"
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white px-0.5">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Popup */}
          {showNotifs && (
            <div className="absolute top-14 right-0 w-96 bg-white/95 backdrop-blur-2xl border border-purple-100/60 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-indigo-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Bell size={16} className="text-purple-500" />
                  Notifications
                </h3>
                {notifications && notifications.length > 0 && (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCheck size={13} /> All Read
                  </span>
                )}
              </div>
              <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-50">
                {notifications && notifications.length > 0 ? (
                  notifications.map((notif, idx) => {
                    const text = typeof notif === 'string' ? notif : notif.text;
                    const ts = typeof notif === 'object' ? notif.ts : null;
                    const style = getNotifStyle(notif);
                    return (
                      <div key={idx} className={`p-4 hover:brightness-95 transition-all text-sm ${style.bg}`}>
                        <div className="flex items-start gap-3">
                          <span className={`mt-1.5 w-2 h-2 flex-shrink-0 rounded-full ${style.dot} shadow-[0_0_6px_currentColor]`}></span>
                          <div className="flex-1 min-w-0">
                            <p className={`leading-snug ${style.text}`}>{text}</p>
                            {ts && (
                              <p className="text-xs text-slate-400 mt-1">{getRelativeTime(ts)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    <Bell size={32} className="mx-auto mb-2 opacity-30" />
                    No notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avatar & Profile Popup */}
        <div className="relative" ref={profileRef}>
          <div
            className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all cursor-pointer border-2 border-white"
            onClick={handleAvatarClick}
          >
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover rounded-full" />
            ) : (
              getInitials(user?.name)
            )}
          </div>

          {showProfile && (
            <div className="absolute top-14 right-0 w-72 bg-white/95 backdrop-blur-2xl border border-purple-100/60 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 text-center bg-gradient-to-br from-purple-50 to-indigo-50 border-b border-slate-100">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-white text-2xl font-bold shadow-xl mx-auto mb-3 overflow-hidden">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    getInitials(user?.name)
                  )}
                </div>
                <button 
                  onClick={() => goToUserSpace("profile")}
                  className="text-lg font-bold text-slate-800 hover:text-purple-600 flex items-center justify-center gap-1.5 mx-auto group"
                >
                  {user?.name}
                  <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                {user?.name === 'Atique' && (
                  <div className="flex items-center justify-center gap-1.5 text-[10px] font-black text-purple-600 bg-purple-100/50 px-2 py-0.5 rounded-full mt-1 w-fit mx-auto uppercase tracking-wider">
                    <Shield size={10} /> {user?.role}
                  </div>
                )}
              </div>
              <div className="p-4 space-y-1">
                <button 
                  onClick={() => goToUserSpace("tasks")}
                  className="w-full text-left p-3 rounded-xl hover:bg-slate-50 transition flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">User Space</p>
                    <p className="text-[10px] text-slate-400 font-medium">Manage tasks & security</p>
                  </div>
                </button>
                <button 
                  onClick={logout}
                  className="w-full text-left p-3 rounded-xl hover:bg-rose-50 transition flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-rose-100 group-hover:text-rose-600 transition-colors">
                    <LogOut size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">Sign Out</p>
                    <p className="text-[10px] text-slate-400 font-medium">Log out of your session</p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Logout */}
        <button
          onClick={logout}
          className="p-3 glass rounded-full text-slate-600 hover:text-rose-600 transition-colors hidden md:block"
          title="Quick Log out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
}