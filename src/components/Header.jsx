import { useState, useEffect } from "react";
import { useGlobalData } from "../context/DashboardContext";
import { RefreshCw } from "lucide-react";

export default function Header() {
  const { dateRange, setDateRange, lastSynced, refreshData, isRefreshing } = useGlobalData();
  const [timeAgo, setTimeAgo] = useState("Just now");

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

  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        {/* Placeholder for future title or breadcrumbs if needed */}
      </div>

      <div className="flex items-center gap-4">
        
        {/* Sync Status & Refresh */}
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-2 rounded-xl shadow-sm border border-gray-100">
          <span className="hidden md:inline">Last synced: {timeAgo}</span>
          <button 
            onClick={refreshData}
            disabled={isRefreshing}
            className={`p-1 hover:bg-gray-100 rounded text-gray-700 transition ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Refresh Data"
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin text-purple-600" : ""} />
          </button>
        </div>

        {/* Date Filter */}
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl bg-white shadow-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer transition-all"
        >
          <option value="all">All Time</option>
          <option value="this_month">This Month</option>
          <option value="last_30_days">Last 30 Days</option>
          <option value="last_7_days">Last 7 Days</option>
        </select>

        <div className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
          Welcome back Sir! 
        </div>
      </div>
    </div>
  );
}