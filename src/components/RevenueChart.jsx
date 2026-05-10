import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { ChevronLeft } from "lucide-react";

export default function RevenueChart({ monthlyData, rawData, extraData }) {
  const [dailyData, setDailyData] = useState([]);
  const [viewMode, setViewMode] = useState("monthly");
  const [selectedMonth, setSelectedMonth] = useState("");

  const parseNumber = (val) => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    return Number(val.replace(/,/g, "")) || 0;
  };

  // 🔥 Handle click
  const handleClick = (data) => {
    if (!data?.activePayload || !data.activeLabel) return;

    const month = data.activeLabel;
    setSelectedMonth(month);

    // Current Session Daily
    const rawCurrent = rawData.slice(1).map((row) => ({
      date: row[1],
      revenue: parseNumber(row[11]),
    }));

    // Last Session Daily
    const rawLast = (extraData?.lastSession || []).slice(1).map((row) => ({
      date: row[1],
      revenue: parseNumber(row[11]),
    }));

    // Aggregation maps
    const currentDayMap = {};
    const lastDayMap = {};

    rawCurrent.forEach((d) => {
      if (d.date?.includes(month)) {
        const day = parseInt(d.date.split("-")[0].trim(), 10);
        if (!isNaN(day)) currentDayMap[day] = (currentDayMap[day] || 0) + d.revenue;
      }
    });

    rawLast.forEach((d) => {
      if (d.date?.includes(month)) {
        const day = parseInt(d.date.split("-")[0].trim(), 10);
        if (!isNaN(day)) lastDayMap[day] = (lastDayMap[day] || 0) + d.revenue;
      }
    });

    // Create a unified set of days (1 to 31)
    const filtered = Array.from({ length: 31 }, (_, i) => {
      const dayNum = i + 1;
      return {
        day: dayNum,
        revenue: currentDayMap[dayNum] || 0,
        lastRevenue: lastDayMap[dayNum] || 0,
      };
    }).filter(d => d.revenue > 0 || d.lastRevenue > 0);

    setDailyData(filtered);
    setViewMode("daily");
  };

  return (
    <div className="w-full h-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            {viewMode === "monthly"
              ? "Revenue Trend"
              : `${selectedMonth} - Daily Comparison`}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {viewMode === "monthly" 
              ? "Click on any month to see daily breakdown & comparison" 
              : `Comparing Daily Performance: Current Session vs Last Session (${selectedMonth})`}
          </p>
        </div>

        {viewMode === "daily" && (
          <button
            onClick={() => setViewMode("monthly")}
            className="flex items-center gap-1 text-sm font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-xl transition-all shadow-sm"
          >
            <ChevronLeft size={16} /> Back to Monthly View
          </button>
        )}
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={viewMode === "monthly" ? monthlyData : dailyData}
            onClick={viewMode === "monthly" ? handleClick : null}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            style={viewMode === "monthly" ? { cursor: "pointer" } : {}}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorLastRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />

            <XAxis 
              dataKey={viewMode === "monthly" ? "month" : "day"} 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
              dy={15}
              interval={viewMode === "monthly" ? 0 : "preserveStartEnd"}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '16px', 
                border: '1px solid rgba(255,255,255,0.4)', 
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', 
                background: 'rgba(255, 255, 255, 0.8)', 
                backdropFilter: 'blur(12px)',
                padding: '12px 16px'
              }}
              itemStyle={{ color: '#1e293b', fontWeight: 600 }}
              labelStyle={{ color: '#64748b', marginBottom: '4px', fontSize: '13px' }}
              formatter={(value, name) => {
                if (name === 'lastRevenue') return [`₹${value.toLocaleString()}`, 'Last Session'];
                if (name === 'projectedRevenue') return [`₹${value.toLocaleString()}`, 'Anticipated'];
                return [`₹${value.toLocaleString()}`, 'Current Session'];
              }}
              labelFormatter={(label) => {
                if (viewMode === 'daily') {
                  return `${label} ${selectedMonth}`;
                }
                return label;
              }}
            />

            <Area
              type="monotone"
              dataKey="lastRevenue"
              name="lastRevenue"
              stroke="#f59e0b"
              strokeWidth={viewMode === "monthly" ? 3 : 2}
              strokeDasharray={viewMode === "monthly" ? "5 5" : "0"}
              fill="url(#colorLastRevenue)"
              activeDot={{ r: 5, strokeWidth: 3, stroke: '#fff', fill: '#f59e0b' }}
            />

            <Area
              type="monotone"
              dataKey="revenue"
              name="revenue"
              stroke="#8b5cf6"
              strokeWidth={4}
              fill="url(#colorRevenue)"
              activeDot={{ r: 6, strokeWidth: 4, stroke: '#fff', fill: '#8b5cf6', className: "shadow-lg" }}
            />

            {viewMode === "monthly" && (
              <Area
                type="monotone"
                dataKey="projectedRevenue"
                name="projectedRevenue"
                stroke="#a855f7"
                strokeWidth={2}
                strokeDasharray="8 4"
                fill="transparent"
                activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff', fill: '#a855f7' }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}