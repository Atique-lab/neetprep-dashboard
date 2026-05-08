import { motion } from "framer-motion";
import {
  DollarSign, Users, TrendingUp, TrendingDown,
  AlertCircle, CalendarCheck2, Award, Trophy, UserCheck, Wallet, School, Download
} from "lucide-react";
import KPICard from "../components/KPICard";
import RevenueChart from "../components/RevenueChart";
import DailyComparisonChart from "../components/DailyComparisonChart";
import { useDashboardData } from "../hooks/useDashboardData";
import { generateRevenueReport } from "../utils/reportGenerator";

export default function Dashboard() {
  const { kpi, insights, monthlyData, dailyComparison, rawData, loading, error } = useDashboardData();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-red-500 glass rounded-3xl m-2">
        <AlertCircle size={64} className="mb-4 opacity-80" />
        <h2 className="text-2xl font-semibold mb-2">Failed to load dashboard</h2>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div>
          <div className="h-8 bg-slate-200/50 rounded-lg w-1/4 mb-2"></div>
          <div className="h-4 bg-slate-200/50 rounded-lg w-1/3 mb-8"></div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => <div key={i} className="glass rounded-[2rem] h-40 w-full"></div>)}
        </div>
        <div className="glass rounded-[2rem] h-96 w-full"></div>
        <div className="glass rounded-[2rem] h-96 w-full"></div>
      </div>
    );
  }

  const monthlyGrowthPositive = (kpi.monthlyGrowth || 0) >= 0;
  const enrolmentGrowthPositive = (kpi.enrolmentGrowth || 0) >= 0;
  const revGrowthPositive = (kpi.revenueGrowthVsLastSession || 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Monitor your revenue, performance, and key metrics in real-time.</p>
        </div>
        
        <button
          onClick={() => generateRevenueReport(rawData, kpi, insights)}
          className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm group"
        >
          <Download size={18} className="text-purple-600 group-hover:scale-110 transition-transform" />
          Download PDF Report
        </button>
      </div>

      {/* ── ROW 1: This Session KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        <KPICard
          title="Total Students"
          value={kpi.students}
          color="blue"
          icon={<Users size={20} />}
        />
        <KPICard
          title="Total Revenue"
          value={`₹${(kpi.currentSessionRev || 0).toLocaleString()}`}
          color="purple"
          icon={<DollarSign size={20} />}
        />
        <KPICard
          title={`Last Month (${kpi.prevMonthName || "–"})`}
          value={`₹${(kpi.lastMonthRev || 0).toLocaleString()}`}
          color="orange"
          icon={<DollarSign size={20} />}
        />
        <KPICard
          title={`This Month (${kpi.currentMonthName || "–"})`}
          value={`₹${(kpi.currentMonthRev || 0).toLocaleString()}`}
          color="green"
          icon={<DollarSign size={20} />}
        />
        <KPICard
          title="Growth"
          value={`${monthlyGrowthPositive ? "+" : ""}${(kpi.monthlyGrowth || 0).toFixed(1)}%`}
          color="pink"
          icon={monthlyGrowthPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
        />
      </div>

      {/* ── Charts ── */}
      <div className="glass p-6 md:p-8 rounded-[2rem] transition-all hover:shadow-lg hover:shadow-purple-500/5">
        <RevenueChart monthlyData={monthlyData} rawData={rawData} />
      </div>
      <div className="glass p-6 md:p-8 rounded-[2rem] transition-all hover:shadow-lg hover:shadow-purple-500/5">
        <DailyComparisonChart
          dailyData={dailyComparison}
          currentMonthName={kpi.currentMonthName || "This Month"}
          prevMonthName={kpi.prevMonthName || "Last Month"}
        />
      </div>

      {/* ── ROW 2: Last Session KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        <KPICard
          title="Last Session Students"
          value={kpi.lastSessionStudents || 0}
          color="blue"
          icon={<Users size={20} />}
        />
        <KPICard
          title="Last Session Revenue"
          value={`₹${(kpi.lastSessionRev || 0).toLocaleString()}`}
          color="orange"
          icon={<DollarSign size={20} />}
        />
        <KPICard
          title="Enrolment Growth"
          value={`${enrolmentGrowthPositive ? "+" : ""}${(kpi.enrolmentGrowth || 0).toFixed(1)}%`}
          color="green"
          icon={enrolmentGrowthPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
        />
        <KPICard
          title="Revenue Growth"
          value={`${revGrowthPositive ? "+" : ""}${(kpi.revenueGrowthVsLastSession || 0).toFixed(1)}%`}
          color="purple"
          icon={revGrowthPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
        />
        <KPICard
          title="Avg Revenue / Student"
          value={`₹${kpi.students > 0 ? Math.round((kpi.currentSessionRev || 0) / kpi.students).toLocaleString() : 0}`}
          color="pink"
          icon={<Award size={20} />}
        />
      </div>

      {/* ── Insights Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Top Performers Card */}
        <div className="glass p-6 md:p-8 rounded-[2rem] relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 md:col-span-1">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="space-y-5 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1 text-slate-500 dark:text-slate-400">
                <Trophy size={15} className="text-amber-500" />
                <p className="text-sm font-medium uppercase tracking-wider">Top Performing Centre</p>
              </div>
              <h2 className="text-lg font-black text-emerald-600 dark:text-emerald-400 break-words" title={insights.topCentre}>
                {insights.topCentre}
              </h2>
            </div>
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <div className="flex items-center gap-2 mb-1 text-slate-500 dark:text-slate-400">
                <UserCheck size={15} className="text-purple-500" />
                <p className="text-sm font-medium uppercase tracking-wider">Top Manager</p>
              </div>
              <h2 className="text-lg font-black text-purple-600 dark:text-purple-400 break-words" title={insights.topManager}>
                {insights.topManager}
              </h2>
            </div>
          </div>
        </div>

        {/* Yesterday Enrolments */}
        <div className="glass p-6 md:p-8 rounded-[2rem] relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="flex items-center gap-2 mb-4 relative z-10">
            <CalendarCheck2 size={15} className="text-blue-500" />
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
              Yesterday Enrolments ({insights.yesterdayLabel})
            </p>
          </div>
          {insights.yesterdayTotal === 0 ? (
            <div className="flex flex-col items-center justify-center py-4 text-center relative z-10">
              <CalendarCheck2 size={32} className="text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-sm text-slate-400 font-medium">No enrolments recorded yesterday</p>
            </div>
          ) : (
            <div className="space-y-2 relative z-10">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase">External</span>
                <span className="font-black text-blue-600 dark:text-blue-400 text-2xl">{insights.yesterdayExternal}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase">Internal</span>
                <span className="font-black text-indigo-600 dark:text-indigo-400 text-2xl">{insights.yesterdayInternal}</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-2 mt-2">
                <span className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase">Total</span>
                <span className="font-black text-slate-800 dark:text-white text-3xl">{insights.yesterdayTotal}</span>
              </div>
            </div>
          )}
        </div>

        {/* Predictive Analytics Card */}
        <div className="glass p-6 md:p-8 rounded-[2rem] relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="flex items-center gap-2 mb-4 relative z-10">
            <TrendingUp size={15} className="text-purple-500" />
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Anticipated Month End ({kpi.currentMonthName})</p>
          </div>
          
          {(() => {
            const currentMonthData = monthlyData.find(m => m.month === kpi.currentMonthName);
            const projection = currentMonthData?.projectedRevenue || 0;
            const current = kpi.currentMonthRev || 0;
            const progress = projection > 0 ? (current / projection) * 100 : 0;
            
            return (
              <div className="space-y-4 relative z-10">
                <div>
                  <span className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">
                    ₹{projection.toLocaleString()}
                  </span>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                    Based on current run rate
                  </p>
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Month Progress</span>
                    <span className="text-sm font-black text-purple-600 dark:text-purple-400">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                    />
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
      
      {/* Spacer for FAB on mobile */}
      <div className="h-20 lg:hidden" />
    </motion.div>
  );
}