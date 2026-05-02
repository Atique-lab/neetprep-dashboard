import { useState, useEffect } from "react";
import { useGlobalData } from "../context/DashboardContext";
import { useAuth } from "../context/AuthContext";
import { useDashboardData } from "../hooks/useDashboardData";
import { RefreshCw, Bell, Search, LogOut } from "lucide-react";

export default function Header() {
  const { dateRange, setDateRange, lastSynced, refreshData, isRefreshing } = useGlobalData();
  const { user, logout } = useAuth();
  const { notifications } = useDashboardData();
  const [timeAgo, setTimeAgo] = useState("Just now");
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    if (!lastSynced) return;
    
    const updateTimeAgo = () => {
      const mins = Math.floor((new Date() - lastSynced) / 60000);
      if (mins < 1) setTimeAgo("Just now");
      else if (mins === 1) setTimeAgo("1 min ago");
      else setTimeAgo(`${mins} mins ago`);
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 60000);
    return () => clearInterval(interval);
  }, [lastSynced]);

  const getInitials = (name) => {
    if (!name) return "NP";
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      {/* Search Bar - Decorative/Functional placeholder */}
      <div className="relative w-full md:w-96">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Search analytics..." 
          className="w-full pl-11 pr-4 py-3 glass rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-gray-400"
        />
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
        
        {/* Sync Status & Refresh */}
        <div className="flex items-center gap-3 text-sm text-gray-500 glass px-4 py-2.5 rounded-2xl whitespace-nowrap">
          <span className="hidden sm:inline font-medium text-slate-600">Synced: {timeAgo}</span>
          <button 
            onClick={refreshData}
            disabled={isRefreshing}
            className={`p-1.5 hover:bg-purple-100 rounded-xl text-purple-600 transition-colors ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Refresh Data"
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Date Filter */}
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-3 glass rounded-2xl text-slate-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer transition-all appearance-none pr-10 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:10px_10px] bg-[right_16px_center]"
        >
          <option value="all">All Time Overview</option>
          <option value="this_month">This Month</option>
          <option value="last_30_days">Last 30 Days</option>
          <option value="last_7_days">Last 7 Days</option>
        </select>

        {/* Notifications & Profile & Logout */}
        <div className="flex items-center gap-3 pl-2 border-l border-gray-300/50 relative">
          <button 
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-3 glass rounded-full text-slate-600 hover:text-purple-600 transition-colors relative"
          >
            <Bell size={18} />
            {notifications && notifications.length > 0 && (
               <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            )}
          </button>
          
          {showNotifs && (
            <div className="absolute top-14 right-0 md:-right-10 w-80 bg-white/90 backdrop-blur-xl border border-purple-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-4">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-800">Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications && notifications.length > 0 ? (
                  notifications.map((notif, idx) => (
                    <div key={idx} className="p-4 border-b border-slate-50 hover:bg-purple-50/50 transition text-sm text-slate-700">
                      <span className="inline-block w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                      {notif}
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-slate-500 text-sm">
                    No new notifications
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold shadow-md hover:shadow-lg transition-shadow" title={user?.name}>
            {getInitials(user?.name)}
          </div>

          <button 
            onClick={logout}
            className="p-3 glass rounded-full text-slate-600 hover:text-rose-600 transition-colors"
            title="Log out"
          >
            <LogOut size={18} />
          </button>
        </div>

      </div>
    </div>
  );
}