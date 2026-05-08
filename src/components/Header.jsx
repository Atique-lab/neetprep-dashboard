import { 
  Bell, Search, RefreshCw, Moon, Sun, 
  Filter, Calendar, ChevronDown, User, LogOut
} from "lucide-react";
import { useState } from "react";
import { useGlobalData } from "../context/DashboardContext";
import { useTheme } from "../context/ThemeContext";

export default function Header() {
  const { dateRange, setDateRange, refreshData, isRefreshing, lastSynced } = useGlobalData();
  const { theme, toggleTheme } = useTheme();
  const userStr = sessionStorage.getItem('auth_user');
  const user = userStr ? JSON.parse(userStr) : { name: "Atique", role: "admin" };

  const months = [
    { value: "all", label: "All Time" },
    { value: "Jan", label: "January" },
    { value: "Feb", label: "February" },
    { value: "Mar", label: "March" },
    { value: "Apr", label: "April" },
    { value: "May", label: "May" },
    { value: "Jun", label: "June" },
    { value: "Jul", label: "July" },
    { value: "Aug", label: "August" },
    { value: "Sep", label: "September" },
    { value: "Oct", label: "October" },
    { value: "Nov", label: "November" },
    { value: "Dec", label: "December" },
  ];

  return (
    <header className="h-16 flex items-center justify-between px-8 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/60 dark:border-zinc-800/60 sticky top-0 z-40">
      
      {/* Left: Global Month Filter */}
      <div className="flex items-center gap-4">
        <div className="relative group">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="appearance-none bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-10 py-2 text-sm font-bold text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer hover:border-zinc-300 pr-8"
          >
            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-hover:text-indigo-500 transition-colors" size={16} />
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
        </div>
        
        {lastSynced && (
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hidden md:block">
            Last Sync: {new Date(lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <button 
          onClick={refreshData}
          disabled={isRefreshing}
          className={`p-2.5 text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`}
          title="Refresh Data"
        >
          <RefreshCw size={18} />
        </button>

        <button 
          onClick={toggleTheme}
          className="p-2.5 text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button className="p-2.5 text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all relative">
          <Bell size={18} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 border-2 border-white dark:border-zinc-950 rounded-full" />
        </button>

        <div className="h-6 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-1" />

        <div className="flex items-center gap-3 pl-1">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-tighter">
              {user.name}
            </p>
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
              {user.role}
            </p>
          </div>
          <button className="p-1 border-2 border-zinc-900 dark:border-zinc-50 rounded-lg group hover:bg-zinc-900 dark:hover:bg-zinc-50 transition-all">
            <LogOut size={16} className="text-zinc-900 dark:text-zinc-50 group-hover:text-white dark:group-hover:text-zinc-950" />
          </button>
        </div>
      </div>
    </header>
  );
}