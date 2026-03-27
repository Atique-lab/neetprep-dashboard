import { useEffect, useState } from "react";
import KPICard from "../components/KPICard";
import RevenueChart from "../components/RevenueChart";
import { fetchSheetData } from "../services/sheetApi";

export default function Dashboard() {
  const [kpi, setKpi] = useState({
    students: 0,
    currentRevenue: 0,
    prevRevenue: 0,
    totalRevenue: 0,
    growth: 0,
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

      // 🔹 Total Revenue (All time)
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
    }

    loadData();
  }, []);

  return (
    <>
      {/* Page Title */}
      <h1 className="text-2xl font-semibold text-white">
        Dashboard
      </h1>
      <p className="text-gray-400 text-sm mb-6">
        Overview of revenue and performance
      </p>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-6">
        <KPICard title="Total Students" value={kpi.students} />

        <KPICard
          title="Current Revenue"
          value={`₹${kpi.currentRevenue.toLocaleString()}`}
        />

        <KPICard
          title="Previous Revenue"
          value={`₹${kpi.prevRevenue.toLocaleString()}`}
        />

        <KPICard
          title="Total Revenue"
          value={`₹${kpi.totalRevenue.toLocaleString()}`}
        />

        <KPICard
          title="Growth"
          value={`${kpi.growth.toFixed(1)}%`}
        />
      </div>

      {/* Chart */}
      <div className="mt-6">
        <RevenueChart />
      </div>
    </>
  );
}