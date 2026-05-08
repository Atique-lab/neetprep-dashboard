import { useDashboardData } from "../hooks/useDashboardData";
import KPICard from "../components/KPICard";
import RevenueChart from "../components/RevenueChart";
import { 
  Users, Wallet, TrendingUp, Calendar, 
  ArrowUpRight, ArrowDownRight, Zap, Target,
  AlertCircle
} from "lucide-react";
import { KPISkeleton, ChartSkeleton } from "../components/Skeleton";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { kpi, insights, loading, error, refreshData } = useDashboardData();

  if (error) return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <div className="p-4 bg-rose-50 dark:bg-rose-500/10 rounded-2xl mb-4">
        <AlertCircle className="text-rose-600" size={32} />
      </div>
      <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50">Sync failed</h2>
      <p className="text-zinc-500 max-w-md mt-2 mb-6">{error}</p>
      <button onClick={refreshData} className="btn-primary">Try again</button>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Performance Overview</p>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">SaaS Analytics</h1>
        </div>
        <div className="flex items-center gap-2 text-zinc-500 text-sm font-medium bg-white dark:bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <Calendar size={16} />
          <span>Session: 2025-26</span>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <>
            <KPISkeleton />
            <KPISkeleton />
            <KPISkeleton />
            <KPISkeleton />
          </>
        ) : (
          <>
            <KPICard 
              title="Current Revenue" 
              value={`₹${Math.round(kpi.currentSessionRev).toLocaleString()}`} 
              subtitle={`${kpi.revenueGrowthVsLastSession > 0 ? '+' : ''}${Math.round(kpi.revenueGrowthVsLastSession)}% vs last session`}
              icon={<Wallet size={20} />} 
              color="purple" 
            />
            <KPICard 
              title="Total Students" 
              value={kpi.students.toLocaleString()} 
              subtitle={`${kpi.enrolmentGrowth > 0 ? '+' : ''}${Math.round(kpi.enrolmentGrowth)}% growth`}
              icon={<Users size={20} />} 
              color="blue" 
            />
            <KPICard 
              title="Last Session Revenue" 
              value={`₹${Math.round(kpi.lastSessionRev).toLocaleString()}`} 
              subtitle="Comparison target"
              icon={<Target size={20} />} 
              color="orange" 
            />
            <KPICard 
              title="Current Month" 
              value={`₹${Math.round(kpi.currentMonthRev).toLocaleString()}`} 
              subtitle={`${kpi.currentMonthName} actuals`}
              icon={<Zap size={20} />} 
              color="green" 
            />
          </>
        )}
      </div>

      {/* Main Insights Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="xl:col-span-2">
          {loading ? <ChartSkeleton /> : <RevenueChart />}
        </div>

        {/* Quick Insights Card */}
        <div className="space-y-6">
          <div className="bg-zinc-900 text-white rounded-3xl p-8 shadow-2xl shadow-indigo-500/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <Zap size={120} />
            </div>
            
            <h3 className="text-xl font-black mb-6 relative z-10">Smart Insights</h3>
            
            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl"><TrendingUp size={20} /></div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Top Performer</p>
                  <p className="font-bold text-lg leading-tight">{insights.topCentre}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl"><Users size={20} /></div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Leading Manager</p>
                  <p className="font-bold text-lg leading-tight">{insights.topManager}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl"><Zap size={20} /></div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Yesterday's Enrolments</p>
                  <p className="font-bold text-2xl leading-tight">{insights.yesterdayTotal}</p>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-white/10">
              <button className="w-full py-3 bg-white text-zinc-950 font-bold rounded-2xl hover:bg-zinc-100 transition-colors">
                View Full Analysis
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
            <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50 mb-4">Reconciliation</h3>
            <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
              We've identified {insights.yesterdayTotal > 5 ? 'anomalies' : '0 issues'} in yesterday's revenue splits.
            </p>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <div className="flex justify-between text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                <span>Metric</span>
                <span>Value</span>
              </div>
              <div className="flex justify-between text-sm py-1 font-bold">
                <span className="text-zinc-600 dark:text-zinc-400">Avg Ticket Size</span>
                <span>₹{Math.round(insights.avg).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}