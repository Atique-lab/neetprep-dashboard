import { useMemo, useState } from "react";
import { useGlobalData } from "../context/DashboardContext";
import { Users, TrendingUp, TrendingDown, Activity, Calendar, BarChart3 } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from "recharts";
import { motion } from "framer-motion";

export default function Enrolments() {
  const { filteredData, rawData, extraData, loading, error } = useGlobalData();
  const [activeTab, setActiveTab] = useState("daily"); // "daily" or "monthly"

  const stats = useMemo(() => {
    if (!filteredData || filteredData.length <= 1) return null;

    const getMonth = (dateStr) => {
      if (!dateStr) return null;
      const parts = dateStr.split("-");
      if (parts.length >= 2) return parts[1].trim();
      return null;
    };

    const getAbsoluteDate = (str) => {
      if (!str) return null;
      const parts = str.split("-");
      if (parts.length < 2) return null;
      const day = parseInt(parts[0].trim());
      const monthStr = parts[1].trim();
      const yearStr = parts[2] ? `20${parts[2].trim()}` : new Date().getFullYear();
      const parsed = new Date(`${monthStr} ${day}, ${yearStr}`);
      return isNaN(parsed.getTime()) ? null : parsed;
    };

    const getValidStart = (dates) => {
      if (!dates || dates.length === 0) return null;
      const sorted = [...dates].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      const oneYearBefore = new Date(median);
      oneYearBefore.setFullYear(median.getFullYear() - 1);
      return sorted.find(d => d >= oneYearBefore) || sorted[0];
    };

    const processRows = (rows) => {
      if (!rows || rows.length <= 1) return [];
      return rows.slice(1).map((row, idx) => {
        const email = (row[4] || "").toString().trim().toLowerCase();
        const name = (row[2] || "").toString().trim().toLowerCase();
        return {
          date: row[1],
          key: email || name || `unknown-${idx}`,
        };
      }).filter(row => row.date);
    };

    const currentData = processRows(filteredData);
    const lastSessionData = processRows(extraData?.lastSession || []);

    // Helper to get unique counts
    const getUniqueCount = (data) => new Set(data.map(d => d.key)).size;

    // 1. Total Unique Students Current Session
    const currentTotal = getUniqueCount(currentData);

    // Filter Last Session Till Today
    const currentDates = processRows(rawData).map(d => getAbsoluteDate(d.date)).filter(Boolean);
    const currentStart = getValidStart(currentDates) || new Date();
    const daysInCurrentSession = Math.ceil((new Date() - currentStart) / (1000 * 60 * 60 * 24));

    const lsDates = lastSessionData.map(d => getAbsoluteDate(d.date)).filter(Boolean);
    const lsStart = getValidStart(lsDates);

    const lsTillTodayData = lastSessionData.filter(d => {
      const dDate = getAbsoluteDate(d.date);
      if (!dDate || !lsStart) return true;
      const diff = Math.ceil((dDate - lsStart) / (1000 * 60 * 60 * 24));
      return diff <= daysInCurrentSession;
    });

    const lastSessionTotal = getUniqueCount(lsTillTodayData);
    const sessionGrowth = lastSessionTotal > 0 ? ((currentTotal - lastSessionTotal) / lastSessionTotal) * 100 : 0;

    // 2. Month-wise comparison (Current Session)
    const monthsOrder = ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
    const currentMonthMap = {};
    const lastSessionMonthMap = {};

    // To avoid duplicates in a month, we group by month then by key
    currentData.forEach(d => {
      const month = getMonth(d.date);
      if (!month) return;
      if (!currentMonthMap[month]) currentMonthMap[month] = new Set();
      currentMonthMap[month].add(d.key);
    });

    lastSessionData.forEach(d => {
      const dateObj = getAbsoluteDate(d.date);
      if (!dateObj) return;
      
      const year = dateObj.getFullYear();
      const mIdx = dateObj.getMonth();
      if (year >= 2026 && mIdx >= 2) return; // Exclude Mar 2026 onwards

      const month = dateObj.toLocaleString("default", { month: "short" });
      if (!lastSessionMonthMap[month]) lastSessionMonthMap[month] = new Set();
      lastSessionMonthMap[month].add(d.key);
    });

    const monthlyComparison = monthsOrder
      .filter(m => currentMonthMap[m] || lastSessionMonthMap[m])
      .map(m => ({
        month: m,
        current: currentMonthMap[m]?.size || 0,
        lastSession: lastSessionMonthMap[m]?.size || 0
      }));

    // 3. Last month vs This month (Current Session)
    const now = new Date();
    const currentMonthName = now.toLocaleString("default", { month: "short" });
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthName = prevDate.toLocaleString("default", { month: "short" });
    const todayDay = now.getDate();

    const thisMonthCount = currentMonthMap[currentMonthName]?.size || 0;
    
    // Till today for last month
    const prevMonthTillTodayEmails = new Set();
    currentData.forEach(d => {
      if (getMonth(d.date) === prevMonthName) {
        const day = parseInt(d.date.split("-")[0], 10);
        if (!isNaN(day) && day <= todayDay) {
          prevMonthTillTodayEmails.add(d.key);
        }
      }
    });
    const lastMonthCount = prevMonthTillTodayEmails.size;
    const monthlyGrowth = lastMonthCount > 0 ? ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100 : 0;

    // 4. Day-wise comparison (Current Month vs Last Session Same Month)
    const dailyComparison = Array.from({ length: 31 }, (_, i) => {
      const dayStr = (i + 1).toString();
      return {
        day: dayStr,
        currentMonth: new Set(),
        lastSessionMonth: new Set()
      };
    });

    currentData.forEach(d => {
      const month = getMonth(d.date);
      if (month === currentMonthName) {
        const day = parseInt(d.date.split("-")[0], 10);
        if (!isNaN(day) && day >= 1 && day <= 31) {
          dailyComparison[day - 1].currentMonth.add(d.key);
        }
      }
    });

    lastSessionData.forEach(d => {
      const dateObj = getAbsoluteDate(d.date);
      if (!dateObj) return;

      const year = dateObj.getFullYear();
      const mIdx = dateObj.getMonth();
      if (year >= 2026 && mIdx >= 2) return; // Exclude Mar 2026 onwards

      const month = dateObj.toLocaleString("default", { month: "short" });
      // We compare current month name with the same month from last session
      if (month === currentMonthName) {
        const day = dateObj.getDate();
        if (!isNaN(day) && day >= 1 && day <= 31) {
          dailyComparison[day - 1].lastSessionMonth.add(d.key);
        }
      }
    });

    const dailyData = dailyComparison.map(d => ({
      day: d.day,
      Current: d.currentMonth.size,
      LastSession: d.lastSessionMonth.size
    }));

    return {
      currentTotal,
      lastSessionTotal,
      sessionGrowth,
      thisMonthCount,
      lastMonthCount,
      monthlyGrowth,
      monthlyComparison,
      dailyData,
      currentMonthName,
      prevMonthName
    };
  }, [filteredData, rawData, extraData]);

  if (loading) return <div className="flex h-full items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div></div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  if (!stats) return <div className="p-6">No data available.</div>;

  const cards = [
    {
      title: "Total Enrolments (Current)",
      value: stats.currentTotal.toLocaleString(),
      subtext: `Current Session`,
      trend: stats.sessionGrowth,
      icon: <Users size={24} className="text-purple-500" />
    },
    {
      title: "Enrolments Till Now Last session",
      value: stats.lastSessionTotal.toLocaleString(),
      subtext: `Matched Duration`,
      trend: null,
      icon: <Users size={24} className="text-slate-500" />
    },
    {
      title: "This Month Enrolments",
      value: stats.thisMonthCount.toLocaleString(),
      subtext: `(${stats.currentMonthName})`,
      trend: stats.monthlyGrowth,
      icon: <Calendar size={24} className="text-indigo-500" />
    },
    {
      title: "Last Month Enrolments",
      value: stats.lastMonthCount.toLocaleString(),
      subtext: `(${stats.prevMonthName} Till Today)`,
      trend: null,
      icon: <Calendar size={24} className="text-slate-500" />
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            Enrolment Analytics
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Unique student counts and session comparisons.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass p-6 rounded-3xl relative overflow-hidden group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-white/50 dark:bg-slate-800/50 rounded-2xl shadow-sm">
                {card.icon}
              </div>
              {card.trend != null && (
                <div className={`flex items-center gap-1 text-sm font-medium px-2.5 py-1 rounded-full ${card.trend >= 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'}`}>
                  {card.trend >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {Math.abs(card.trend).toFixed(1)}%
                </div>
              )}
            </div>
            <div className="space-y-1">
              <h3 className="text-slate-500 dark:text-slate-400 font-medium text-sm">{card.title}</h3>
              <div className="text-3xl font-bold text-slate-800 dark:text-white">
                {card.value}
              </div>
              <p className="text-xs text-slate-400">{card.subtext}</p>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
          </motion.div>
        ))}
      </div>

      {/* Chart Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass p-6 rounded-3xl"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Activity className="text-purple-500" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Enrolment Trends</h2>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("daily")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === "daily" ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
            >
              Daily ({stats.currentMonthName})
            </button>
            <button
              onClick={() => setActiveTab("monthly")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === "monthly" ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
            >
              Monthly View
            </button>
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === "daily" ? (
              <AreaChart data={stats.dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCurrentDaily" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLastDaily" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 600 }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Area type="monotone" name="Current Session" dataKey="Current" stroke="#8b5cf6" strokeWidth={3} fill="url(#colorCurrentDaily)" />
                <Area type="monotone" name="Last Session" dataKey="LastSession" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" fill="url(#colorLastDaily)" />
              </AreaChart>
            ) : (
              <BarChart data={stats.monthlyComparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <RechartsTooltip 
                  cursor={{ fill: '#f1f5f9', opacity: 0.4 }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 600 }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar name="Current Session" dataKey="current" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar name="Last Session" dataKey="lastSession" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </motion.div>

    </div>
  );
}
