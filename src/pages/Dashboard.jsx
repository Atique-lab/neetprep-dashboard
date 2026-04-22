import { motion } from "framer-motion";
import { DollarSign, Users, TrendingUp, AlertCircle } from "lucide-react";
import KPICard from "../components/KPICard";
import RevenueChart from "../components/RevenueChart";
import { useDashboardData } from "../hooks/useDashboardData";

export default function Dashboard() {
  const { kpi, insights, monthlyData, rawData, loading, error } = useDashboardData();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <AlertCircle size={48} className="mb-4" />
        <h2 className="text-xl font-semibold">Failed to load dashboard</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-5 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-32 w-full"></div>
          ))}
        </div>
        <div className="mt-6 bg-gray-100 rounded-2xl h-80 w-full"></div>
        <div className="mt-6 grid grid-cols-3 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-24 w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Title */}
      <h1 className="text-2xl font-semibold text-gray-800">
        Dashboard
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        Overview of revenue and performance
      </p>

      <div className="grid grid-cols-5 md:grid-cols-2 lg:grid-cols-5 gap-6">
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

      {/* Chart */}
      <div className="mt-6 bg-white/80 backdrop-blur-md p-5 rounded-2xl border shadow-sm hover:shadow-md transition">
        <h2 className="text-lg font-semibold mb-4">
          Monthly Revenue
        </h2>
        <RevenueChart monthlyData={monthlyData} rawData={rawData} />
      </div>

      {/* Insights */}
      <div className="mt-6 grid grid-cols-3 md:grid-cols-3 gap-6">
        <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border shadow-sm hover:shadow-md transition">
          <p className="text-sm text-gray-500">Best Day</p>
          <h2 className="text-lg font-semibold text-green-600">
            {insights.bestDay}
          </h2>
          <p className="text-sm text-gray-600">
            ₹{insights.bestRevenue.toLocaleString()}
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border shadow-sm hover:shadow-md transition">
          <p className="text-sm text-gray-500">Lowest Day</p>
          <h2 className="text-lg font-semibold text-red-500">
            {insights.worstDay}
          </h2>
          <p className="text-sm text-gray-600">
            ₹{insights.worstRevenue.toLocaleString()}
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border shadow-sm hover:shadow-md transition">
          <p className="text-sm text-gray-500">Avg Daily Revenue</p>
          <h2 className="text-lg font-semibold text-blue-600">
            ₹{Math.round(insights.avg).toLocaleString()}
          </h2>
        </div>
      </div>

      {/* Alerts */}
      <div className="mt-6 bg-white/80 backdrop-blur-md p-5 rounded-2xl border shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Alerts</h2>

        <div className="text-sm text-gray-600 space-y-1">
          {insights.bestRevenue > insights.avg * 1.5 && (
            <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> High revenue spike detected on {insights.bestDay}</p>
          )}

          {insights.worstRevenue > 0 && insights.worstRevenue < insights.avg * 0.5 && (
            <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Low performance detected on {insights.worstDay}</p>
          )}

          {insights.avg === 0 && (
            <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span> No revenue data available</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}