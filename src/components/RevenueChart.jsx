import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchSheetData } from "../services/sheetApi";

export default function RevenueChart() {
  const [monthlyData, setMonthlyData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [viewMode, setViewMode] = useState("monthly");
  const [selectedMonth, setSelectedMonth] = useState("");

  useEffect(() => {
    async function loadData() {
      const rows = await fetchSheetData();

      const raw = rows.slice(1).map((row) => ({
        date: row[1],
        revenue: Number(row[11]),
      }));

      // 🔥 Monthly aggregation
      const monthMap = {};
      raw.forEach((d) => {
        if (!d.date || !d.revenue) return;

        const month = d.date.split("-")[1];

        if (!monthMap[month]) monthMap[month] = 0;
        monthMap[month] += d.revenue;
      });

      const monthArr = Object.keys(monthMap).map((m) => ({
        month: m,
        revenue: monthMap[m],
      }));

      setMonthlyData(monthArr);
    }

    loadData();
  }, []);

  // 🔥 Handle click
  const handleClick = (data) => {
    if (!data?.activePayload) return;

    const month = data.activePayload[0].payload.month;
    setSelectedMonth(month);

    // Filter daily data
    fetchSheetData().then((rows) => {
      const raw = rows.slice(1).map((row) => ({
        date: row[1],
        revenue: Number(row[11]),
      }));

      const filtered = raw
        .filter((d) => d.date?.includes(month))
        .map((d) => ({
          day: d.date,
          revenue: d.revenue,
        }));

      setDailyData(filtered);
      setViewMode("daily");
    });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <div className="flex justify-between mb-4">
        <h2 className="font-semibold">
          {viewMode === "monthly"
            ? "Monthly Revenue"
            : `${selectedMonth} - Daily Revenue`}
        </h2>

        {viewMode === "daily" && (
          <button
            onClick={() => setViewMode("monthly")}
            className="text-sm text-purple-600"
          >
            ← Back
          </button>
        )}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={viewMode === "monthly" ? monthlyData : dailyData}
          onClick={viewMode === "monthly" ? handleClick : null}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.7} />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
            </linearGradient>
          </defs>

          <XAxis dataKey={viewMode === "monthly" ? "month" : "day"} />
          <Tooltip />

          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#7c3aed"
            strokeWidth={3}
            fill="url(#colorRevenue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}