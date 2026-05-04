import { useState, useEffect, useRef } from "react";
import { useGlobalData } from "../context/DashboardContext";
import { useAuth } from "../context/AuthContext";
import { useDashboardData } from "../hooks/useDashboardData";
import { Bell, LogOut, CheckCheck } from "lucide-react";

export default function Header() {
  const { dateRange, setDateRange, lastSynced } = useGlobalData();
  const { user, logout } = useAuth();
  const { notifications } = useDashboardData();
  const [showNotifs, setShowNotifs] = useState(false);
  const [readCount, setReadCount] = useState(0);
  const popupRef = useRef(null);

  // Close popup on outside click
  useEffect(() => {
    function handleOutside(e) {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // When popup opens, mark all as read
  const handleBellClick = () => {
    const next = !showNotifs;
    setShowNotifs(next);
    if (next) {
      setReadCount(notifications?.length || 0);
    }
  };

  const unreadCount = Math.max(0, (notifications?.length || 0) - readCount);

  const getInitials = (name) => {
    if (!name) return "NP";
    return name.substring(0, 2).toUpperCase();
  };

  const getNotifStyle = (notif) => {
    if (notif.startsWith("Alert:")) return { dot: "bg-rose-500", bg: "bg-rose-50/60", text: "text-rose-800" };
    if (notif.startsWith("Warning:")) return { dot: "bg-amber-500", bg: "bg-amber-50/60", text: "text-amber-800" };
    return { dot: "bg-purple-500", bg: "bg-purple-50/40", text: "text-slate-700" };
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      {/* Left: Date Filter */}
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

      {/* Right: Bell + Avatar + Logout */}
      <div className="flex items-center gap-3 relative" ref={popupRef}>

        {/* Bell */}
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
          <div className="absolute top-14 right-0 w-96 bg-white/95 backdrop-blur-2xl border border-purple-100/60 rounded-2xl shadow-2xl z-50 overflow-hidden">
            {/* Header */}
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

            {/* List */}
            <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-50">
              {notifications && notifications.length > 0 ? (
                notifications.map((notif, idx) => {
                  const style = getNotifStyle(notif);
                  return (
                    <div key={idx} className={`p-4 hover:brightness-95 transition-all text-sm ${style.bg}`}>
                      <div className="flex items-start gap-3">
                        <span className={`mt-1.5 w-2 h-2 flex-shrink-0 rounded-full ${style.dot} shadow-[0_0_6px_currentColor]`}></span>
                        <p className={`leading-snug ${style.text}`}>{notif}</p>
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

        {/* Avatar */}
        <div
          className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold shadow-md hover:shadow-lg transition-shadow cursor-default"
          title={user?.name}
        >
          {getInitials(user?.name)}
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="p-3 glass rounded-full text-slate-600 hover:text-rose-600 transition-colors"
          title="Log out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
}