import { motion } from "framer-motion";
import {
  DollarSign, Users, TrendingUp, TrendingDown,
  AlertCircle, CalendarCheck2, Award, Trophy, UserCheck
} from "lucide-react";
import KPICard from "../components/KPICard";
import RevenueChart from "../components/RevenueChart";
import DailyComparisonChart from "../components/DailyComparisonChart";
import { useDashboardData } from "../hooks/useDashboardData";

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
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => <div key={i} className="glass rounded-[2rem] h-40 w-full"></div>)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <div key={i} className="glass rounded-[2rem] h-32 w-full"></div>)}
        </div>
      </div>
    );
  }

  const sessionGrowthPositive = (kpi.sessionGrowth || 0) >= 0;
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
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 text-sm mt-1">Monitor your revenue, performance, and key metrics in real-time.</p>
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

        {/* Top Centre + Top Manager – Combined Card */}
        <div className="glass p-6 md:p-8 rounded-[2rem] relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 md:col-span-1">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Trophy size={15} className="text-amber-500" />
                <p className="text-sm text-slate-500 font-medium">Top Performing Centre</p>
              </div>
              <h2 className="text-base font-bold text-green-600 truncate" title={insights.topCentre}>
                {insights.topCentre}
              </h2>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2 mb-1">
                <UserCheck size={15} className="text-purple-500" />
                <p className="text-sm text-slate-500 font-medium">Top Manager</p>
              </div>
              <h2 className="text-xl font-bold text-purple-600 truncate" title={insights.topManager}>
                {insights.topManager}
              </h2>
            </div>
          </div>
        </div>

        {/* Yesterday Enrolments */}
        <div className="glass p-6 md:p-8 rounded-[2rem] relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="flex items-center gap-2 mb-4">
            <CalendarCheck2 size={15} className="text-blue-500" />
            <p className="text-sm text-slate-500 font-medium">
              Yesterday Enrolments ({insights.yesterdayLabel})
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">External</span>
              <span className="font-bold text-blue-600 text-xl">{insights.yesterdayExternal}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Internal</span>
              <span className="font-bold text-indigo-600 text-xl">{insights.yesterdayInternal}</span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-100 pt-2 mt-2">
              <span className="text-sm font-semibold text-slate-700">Total</span>
              <span className="font-bold text-slate-800 text-2xl">{insights.yesterdayTotal}</span>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="glass p-6 md:p-8 rounded-[2rem] relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-rose-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={15} className="text-rose-500" />
            <p className="text-sm text-slate-500 font-medium">Intelligent Alerts</p>
          </div>
          <div className="space-y-2.5">
            {insights.bestRevenue > insights.avg * 1.5 && (
              <div className="flex items-start gap-2 p-3 bg-green-50/70 rounded-xl border border-green-100">
                <span className="mt-1.5 w-2 h-2 flex-shrink-0 rounded-full bg-green-500"></span>
                <p className="text-xs font-medium text-green-800">Revenue spike on {insights.bestDay}</p>
              </div>
            )}
            {insights.worstRevenue > 0 && insights.worstRevenue < insights.avg * 0.5 && (
              <div className="flex items-start gap-2 p-3 bg-orange-50/70 rounded-xl border border-orange-100">
                <span className="mt-1.5 w-2 h-2 flex-shrink-0 rounded-full bg-orange-500"></span>
                <p className="text-xs font-medium text-orange-800">Low performance on {insights.worstDay}</p>
              </div>
            )}
            {insights.avg === 0 && (
              <div className="flex items-start gap-2 p-3 bg-rose-50/70 rounded-xl border border-rose-100">
                <span className="mt-1.5 w-2 h-2 flex-shrink-0 rounded-full bg-rose-500"></span>
                <p className="text-xs font-medium text-rose-800">No revenue data available</p>
              </div>
            )}
            {insights.bestRevenue <= insights.avg * 1.5 && insights.avg > 0 && (insights.worstRevenue === 0 || insights.worstRevenue >= insights.avg * 0.5) && (
              <div className="flex items-start gap-2 p-3 bg-emerald-50/70 rounded-xl border border-emerald-100">
                <span className="mt-1.5 w-2 h-2 flex-shrink-0 rounded-full bg-emerald-500"></span>
                <p className="text-xs font-medium text-emerald-800">Performance is stable. No anomalies detected.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}