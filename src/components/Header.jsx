import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalData } from "../context/DashboardContext";
import { useAuth } from "../context/AuthContext";
import { useDashboardData } from "../hooks/useDashboardData";
import { Bell, LogOut, CheckCheck, Calendar, User, Shield, RefreshCw, Sun, Moon, Menu } from "lucide-react";
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

  useEffect(() => {
    function handleOutside(e) {
      if (popupRef.current && !popupRef.current.contains(e.target)) setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
      window.dispatchEvent(new Event('refresh-tasks'));
      setTimeout(() => setIsRefreshing(false), 800);
    } catch (err) {
      setIsRefreshing(false);
    }
  };

  const unreadCount = notifications?.filter(n => !readIds.includes(n.id)).length || 0;

  return (
    <div className="flex items-center justify-between gap-4">
      {/* Left: Mobile Menu + Filter */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleMenu}
          className="p-2.5 lg:hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-600 dark:text-zinc-400"
        >
          <Menu size={20} />
        </button>

        <div className="relative group hidden sm:block">
          <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="pl-10 pr-10 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-700 dark:text-zinc-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:8px_8px] bg-[right_14px_center] min-w-[160px]"
          >
            {months.map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        
        {/* Refresh */}
        <button
          onClick={handleRefresh}
          className={`p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-500 hover:text-indigo-600 transition-all ${isRefreshing ? 'rotate-180' : ''}`}
          title="Refresh Data"
          disabled={isRefreshing}
        >
          <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
        </button>

        {/* Theme */}
        <button
          onClick={toggleTheme}
          className="p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-500 hover:text-amber-500 transition-all"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifs */}
        <div className="relative" ref={popupRef}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-500 hover:text-indigo-600 transition-all relative"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900">
                {unreadCount}
              </span>
            )}
          </button>
          
          {/* Popups would go here (simplified for space) */}
        </div>

        {/* Profile / Logout */}
        <button
          onClick={logout}
          className="ml-2 p-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all"
        >
          <span className="text-xs font-black px-1 uppercase hidden sm:block">{user?.name}</span>
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}