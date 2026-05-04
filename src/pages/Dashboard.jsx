import { motion } from "framer-motion";
import { DollarSign, Users, TrendingUp, AlertCircle } from "lucide-react";
import KPICard from "../components/KPICard";
import RevenueChart from "../components/RevenueChart";
import MonthWiseComparisonChart from "../components/MonthWiseComparisonChart";
import { useDashboardData } from "../hooks/useDashboardData";

export default function Dashboard() {
  const { kpi, insights, monthlyData, monthWiseComparison, rawData, loading, error } = useDashboardData();

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
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass rounded-[2rem] h-40 w-full"></div>
          ))}
        </div>
        <div className="glass rounded-[2rem] h-96 w-full mt-6"></div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass rounded-[2rem] h-32 w-full"></div>
          ))}
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
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Monitor your revenue, performance, and key metrics in real-time.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        <KPICard
          title="Total Students"
          value={kpi.students}
          color="blue"
          icon={<Users size={20} />}
        />

        <KPICard
          title="Current Revenue"
          value={`₹${kpi.currentRevenue.toLocaleString()}`}
          color="purple"
          icon={<DollarSign size={20} />}
        />

        <KPICard
          title="Previous Revenue"
          value={`₹${kpi.prevRevenue.toLocaleString()}`}
          color="orange"
          icon={<TrendingUp size={20} />}
        />

        <KPICard
          title="Total Revenue"
          value={`₹${kpi.totalRevenue.toLocaleString()}`}
          color="green"
          icon={<DollarSign size={20} />}
        />

        <KPICard
          title="Growth"
          value={`${kpi.growth.toFixed(1)}%`}
          color="pink"
          icon={<TrendingUp size={20} />}
        />
      </div>

      <div className="mb-2 mt-8">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Year-Over-Year Comparison</h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        <KPICard
          title="Last Year Students"
          value={kpi.lastYearTotalStudents}
          color="blue"
          icon={<Users size={20} />}
        />

        <KPICard
          title="This Year Revenue"
          value={`₹${kpi.thisYearTotalRevenue.toLocaleString()}`}
          color="purple"
          icon={<DollarSign size={20} />}
        />

        <KPICard
          title="Last Year Rev (Till Date)"
          value={`₹${kpi.lastYearRevenueTillToday.toLocaleString()}`}
          color="orange"
          icon={<DollarSign size={20} />}
        />

        <KPICard
          title="Total Last Year Rev"
          value={`₹${kpi.lastYearTotalRevenue.toLocaleString()}`}
          color="green"
          icon={<DollarSign size={20} />}
        />

        <KPICard
          title="YOY Growth (Till Date)"
          value={`${kpi.growthVsLastYearTillToday.toFixed(1)}%`}
          color={kpi.growthVsLastYearTillToday >= 0 ? "pink" : "orange"}
          icon={<TrendingUp size={20} />}
        />
      </div>

      {/* Chart */}
      <div className="glass p-6 md:p-8 rounded-[2rem] transition-all hover:shadow-lg hover:shadow-purple-500/5 group">
        <RevenueChart monthlyData={monthlyData} rawData={rawData} />
      </div>

      {/* Month Wise Comparison Chart */}
      <div className="glass p-6 md:p-8 rounded-[2rem] transition-all hover:shadow-lg hover:shadow-purple-500/5 group">
        <MonthWiseComparisonChart monthWiseComparison={monthWiseComparison} />
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 md:p-8 rounded-[2rem] relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <p className="text-sm text-slate-500 font-medium mb-1">Top Performing Centre</p>
          <h2 className="text-xl font-bold text-green-600 mb-1 truncate" title={insights.topCentre}>
            {insights.topCentre}
          </h2>
        </div>

        <div className="glass p-6 md:p-8 rounded-[2rem] relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <p className="text-sm text-slate-500 font-medium mb-1">Top Manager</p>
          <h2 className="text-2xl font-bold text-purple-600 mb-1 truncate" title={insights.topManager}>
            {insights.topManager}
          </h2>
        </div>

        <div className="glass p-6 md:p-8 rounded-[2rem] relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <p className="text-sm text-slate-500 font-medium mb-1">Top Course</p>
          <h2 className="text-xl font-bold text-blue-600 truncate" title={insights.topCourse}>
            {insights.topCourse}
          </h2>
        </div>
      </div>

      {/* Alerts */}
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