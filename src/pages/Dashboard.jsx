import { useEffect, useState } from "react";
import KPICard from "../components/KPICard";
import RevenueChart from "../components/RevenueChart";
import { fetchSheetData } from "../services/sheetApi";
import { motion } from "framer-motion";
import { DollarSign, Users, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const [kpi, setKpi] = useState({
    students: 0,
    currentRevenue: 0,
    prevRevenue: 0,
    totalRevenue: 0,
    growth: 0,
  });

  const [insights, setInsights] = useState({
    bestDay: "",
    bestRevenue: 0,
    worstDay: "",
    worstRevenue: 0,
    avg: 0,
  });

  useEffect(() => {
    async function loadData() {
      const rows = await fetchSheetData();

      const processed = rows.slice(1).map((row) => ({
        date: row[1],
        revenue: Number(row[11]),
        neetprep: Number(row[20]),
      }));

      const getMonth = (dateStr) => dateStr?.split("-")[1];

      const monthsOrder = [
        "Jan","Feb","Mar","Apr","May","Jun",
        "Jul","Aug","Sep","Oct","Nov","Dec"
      ];

      // 🔹 Total Revenue
      const totalRevenueAll = processed.reduce(
        (sum, d) => sum + (d.revenue || 0),
        0
      );

      // 🔹 Monthly aggregation
      const monthlyMap = {};

      processed.forEach((d) => {
        const month = getMonth(d.date);
        if (!month) return;

        if (!monthlyMap[month]) monthlyMap[month] = 0;
        monthlyMap[month] += d.revenue || 0;
      });

      const monthlyData = Object.keys(monthlyMap)
        .map((m) => ({
          month: m,
          revenue: monthlyMap[m],
        }))
        .sort(
          (a, b) =>
            monthsOrder.indexOf(a.month) - monthsOrder.indexOf(b.month)
        );

      const currentMonthData = monthlyData[monthlyData.length - 1];
      const prevMonthData = monthlyData[monthlyData.length - 2];

      const currentRevenue = currentMonthData?.revenue || 0;
      const prevRevenue = prevMonthData?.revenue || 0;

      let growth = 0;
      if (prevRevenue > 0) {
        growth =
          ((currentRevenue - prevRevenue) / prevRevenue) * 100;
      }

      setKpi({
        students: processed.filter((d) => d.date).length,
        currentRevenue,
        prevRevenue,
        totalRevenue: totalRevenueAll,
        growth,
      });

      // 🔥 INSIGHTS
      const dayMap = {};

      processed.forEach((d) => {
        if (!d.date) return;

        if (!dayMap[d.date]) {
          dayMap[d.date] = 0;
        }

        dayMap[d.date] += d.neetprep || 0;
      });

      const dayData = Object.keys(dayMap).map((date) => ({
        date,
        revenue: dayMap[date],
      }));

      const sorted = [...dayData].sort((a, b) => b.revenue - a.revenue);

      const bestDay = sorted[0];
      const worstDay = sorted[sorted.length - 1];

      const total = dayData.reduce((sum, d) => sum + d.revenue, 0);
      const avg = dayData.length > 0 ? total / dayData.length : 0;

      setInsights({
        bestDay: bestDay?.date || "-",
        bestRevenue: bestDay?.revenue || 0,
        worstDay: worstDay?.date || "-",
        worstRevenue: worstDay?.revenue || 0,
        avg,
      });
    }

    loadData();
  }, []);

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

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
        <RevenueChart />
      </div>

      {/* Insights */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border shadow-sm">
          <p className="text-sm text-gray-500">Best Day</p>
          <h2 className="text-lg font-semibold text-green-600">
            {insights.bestDay}
          </h2>
          <p className="text-sm text-gray-600">
            ₹{insights.bestRevenue.toLocaleString()}
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border shadow-sm">
          <p className="text-sm text-gray-500">Lowest Day</p>
          <h2 className="text-lg font-semibold text-red-500">
            {insights.worstDay}
          </h2>
          <p className="text-sm text-gray-600">
            ₹{insights.worstRevenue.toLocaleString()}
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border shadow-sm">
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
            <p> High revenue spike detected</p>
          )}

          {insights.worstRevenue < insights.avg * 0.5 && (
            <p> Low performance detected</p>
          )}

          {insights.avg === 0 && (
            <p> No revenue data available</p>
          )}

        </div>
      </div>
    </motion.div>
  );
}