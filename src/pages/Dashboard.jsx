import { motion } from "framer-motion";
import { DollarSign, Users, TrendingUp, TrendingDown, AlertCircle, CalendarCheck2, Award } from "lucide-react";
import KPICard from "../components/KPICard";
import RevenueChart from "../components/RevenueChart";
import DailyComparisonChart from "../components/DailyComparisonChart";
import { useDashboardData } from "../hooks/useDashboardData";

function GrowthBadge({ value }) {
  const isPositive = value >= 0;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
      {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {isPositive ? '+' : ''}{value.toFixed(1)}%
    </span>
  );
}

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
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => <div key={i} className="glass rounded-[2rem] h-40 w-full"></div>)}
        </div>
        <div className="glass rounded-[2rem] h-96 w-full mt-6"></div>
        <div className="glass rounded-[2rem] h-96 w-full mt-6"></div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <div key={i} className="glass rounded-[2rem] h-32 w-full"></div>)}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="space-y-8"
    >
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 text-sm mt-1">Monitor your revenue, performance, and key metrics in real-time.</p>
      </div>

      {/* ── ROW 1: This Session KPIs ── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-purple-500 mb-3 pl-1">📊 This Session</p>
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
            title={`Last Month (${kpi.prevMonthName || '–'})`}
            value={`₹${(kpi.lastMonthRev || 0).toLocaleString()}`}
            color="orange"
            icon={<DollarSign size={20} />}
          />
          <KPICard
            title={`This Month (${kpi.currentMonthName || '–'})`}
            value={`₹${(kpi.currentMonthRev || 0).toLocaleString()}`}
            color="green"
            icon={<DollarSign size={20} />}
          />
          <KPICard
            title="Growth vs Last Month"
            value={`${kpi.monthlyGrowth >= 0 ? '+' : ''}${(kpi.monthlyGrowth || 0).toFixed(1)}%`}
            subtitle={kpi.prevMonthName ? `MTD ${kpi.prevMonthName} → ${kpi.currentMonthName}` : null}
            color="pink"
            icon={kpi.monthlyGrowth >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
          />
        </div>
      </div>

      {/* ── ROW 2: Session Charts ── */}
      <div className="grid grid-cols-1 gap-6">
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
      </div>

      {/* ── ROW 3: Last Session KPIs ── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-3 pl-1">📁 Last Session Comparison</p>
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
            value={`${kpi.enrolmentGrowth >= 0 ? '+' : ''}${(kpi.enrolmentGrowth || 0).toFixed(1)}%`}
            subtitle="vs Last Session (till date)"
            color="green"
            icon={kpi.enrolmentGrowth >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
          />
          <KPICard
            title="Revenue Growth"
            value={`${kpi.revenueGrowthVsLastSession >= 0 ? '+' : ''}${(kpi.revenueGrowthVsLastSession || 0).toFixed(1)}%`}
            subtitle="vs Last Session (YTD)"
            color="purple"
            icon={kpi.revenueGrowthVsLastSession >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
          />
          <KPICard
            title="Avg Revenue / Student"
            value={`₹${kpi.students > 0 ? Math.round((kpi.currentSessionRev || 0) / kpi.students).toLocaleString() : 0}`}
            subtitle="This Session"
            color="pink"
            icon={<Award size={20} />}
          />
        </div>
      </div>

      {/* ── ROW 4: Insights ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Centre */}
        <div className="glass p-6 md:p-8 rounded-[2rem] relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <p className="text-sm text-slate-500 font-medium mb-1">🏆 Top Performing Centre</p>
          <h2 className="text-lg font-bold text-green-600 mb-1 truncate" title={insights.topCentre}>
            {insights.topCentre}
          </h2>
        </div>

        {/* Top Manager */}
        <div className="glass p-6 md:p-8 rounded-[2rem] relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <p className="text-sm text-slate-500 font-medium mb-1">👤 Top Manager</p>
          <h2 className="text-2xl font-bold text-purple-600 mb-1 truncate" title={insights.topManager}>
            {insights.topManager}
          </h2>
        </div>

        {/* Yesterday Enrolments */}
        <div className="glass p-6 md:p-8 rounded-[2rem] relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <p className="text-sm text-slate-500 font-medium mb-3">
            <CalendarCheck2 size={14} className="inline mr-1" />
            Yesterday Enrolments ({insights.yesterdayLabel})
          </p>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">External</span>
              <span className="font-bold text-blue-600 text-lg">{insights.yesterdayExternal}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Internal</span>
              <span className="font-bold text-indigo-600 text-lg">{insights.yesterdayInternal}</span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-100 pt-1.5 mt-1.5">
              <span className="text-sm font-semibold text-slate-700">Total</span>
              <span className="font-bold text-slate-800 text-xl">{insights.yesterdayTotal}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Alerts ── */}
      <div className="glass p-6 md:p-8 rounded-[2rem]">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <AlertCircle className="text-purple-500" size={24} />
          Intelligent Alerts
        </h2>
        <div className="space-y-3">
          {insights.bestRevenue > insights.avg * 1.5 && (
            <div className="flex items-center gap-3 p-4 bg-green-50/50 rounded-xl border border-green-100">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
              <p className="text-sm font-medium text-green-800">High revenue spike detected on {insights.bestDay}</p>
            </div>
          )}
          {insights.worstRevenue > 0 && insights.worstRevenue < insights.avg * 0.5 && (
            <div className="flex items-center gap-3 p-4 bg-orange-50/50 rounded-xl border border-orange-100">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]"></span>
              <p className="text-sm font-medium text-orange-800">Low performance detected on {insights.worstDay}</p>
            </div>
          )}
          {insights.avg === 0 && (
            <div className="flex items-center gap-3 p-4 bg-rose-50/50 rounded-xl border border-rose-100">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></span>
              <p className="text-sm font-medium text-rose-800">No revenue data available for analysis</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}