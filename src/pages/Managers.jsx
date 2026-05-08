import { useMemo } from "react";
import { useDashboardData } from "../hooks/useDashboardData";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { exportToCSV } from "../utils/exportToCSV";
import { AlertCircle, Download, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Link } from "react-router-dom";

const GrowthBadge = ({ current, last }) => {
  if (!last || last === 0) return <span className="text-xs text-slate-400">—</span>;
  const pct = ((current - last) / last) * 100;
  const isUp = pct > 0;
  const isFlat = Math.abs(pct) < 0.5;
  if (isFlat) return (
    <span className="flex items-center gap-0.5 text-xs text-slate-400 font-medium">
      <Minus size={12} /> 0%
    </span>
  );
  return (
    <span className={`flex items-center gap-0.5 text-xs font-semibold ${isUp ? "text-emerald-600" : "text-rose-500"}`}>
      {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {isUp ? "+" : ""}{pct.toFixed(1)}%
    </span>
  );
};

export default function Managers() {
  const { filteredData, lastSessionComparison, loading, error } = useDashboardData();
  const lsManagerMap = lastSessionComparison?.managerMap || {};

  const parseNumber = (val) => {
    if (!val) return 0;
    if (typeof val === "number") return val;
    return Number(val.replace(/,/g, "")) || 0;
  };

  const { managers, kpi } = useMemo(() => {
    if (!filteredData || filteredData.length <= 1) return { managers: [], kpi: {} };

    const processed = filteredData.slice(1).map((row) => ({
      manager: row[21] || "Unassigned",
      revenue: parseNumber(row[20]),
      students: 1,
      centre: row[6] || "Unknown",
    })).filter(row => row.manager !== "Unassigned");

    const managerMap = {};
    processed.forEach((d) => {
      const name = d.manager.trim();
      if (!name) return;
      if (!managerMap[name]) managerMap[name] = { name, revenue: 0, students: 0, centresSet: new Set() };
      managerMap[name].revenue += d.revenue;
      managerMap[name].students += 1;
      managerMap[name].centresSet.add(d.centre);
    });

    const managerData = Object.values(managerMap).map(m => ({
      ...m,
      centresCount: m.centresSet.size,
      lastRevenue: lsManagerMap[m.name]?.revenue || 0,
      lastStudents: lsManagerMap[m.name]?.students || 0,
    })).sort((a, b) => b.revenue - a.revenue);

    const total = managerData.length;
    const top = managerData[0]?.name || "-";
    const topRevenue = managerData[0]?.revenue || 0;
    const totalRevenue = managerData.reduce((sum, m) => sum + m.revenue, 0);
    const avg = total > 0 ? totalRevenue / total : 0;

    return { managers: managerData, kpi: { total, top, topRevenue, avg } };
  }, [filteredData, lsManagerMap]);

  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 text-red-500">
      <AlertCircle size={48} className="mb-4" />
      <h2 className="text-xl font-semibold">Failed to load data</h2>
      <p>{error}</p>
    </div>
  );

  if (loading) return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-slate-200/50 rounded-lg w-1/4" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="glass rounded-[2rem] h-24 w-full" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-[2rem] h-[400px] w-full" />
        <div className="glass rounded-[2rem] h-[400px] w-full" />
      </div>
    </div>
  );

  const CHART_COLORS = ["#8b5cf6", "#06b6d4", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Manager Performance</h1>
        <p className="text-slate-500 text-sm mt-1">Revenue & student metrics per manager, with last-session comparison.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass p-6 rounded-[2rem] hover:-translate-y-1 transition-transform duration-300">
          <p className="text-slate-500 text-sm font-medium mb-1">Total Managers</p>
          <h2 className="text-3xl font-bold text-slate-800">{kpi.total}</h2>
        </div>
        <div className="glass p-6 rounded-[2rem] hover:-translate-y-1 transition-transform duration-300">
          <p className="text-slate-500 text-sm font-medium mb-1">Top Manager</p>
          <h2 className="text-sm font-bold text-purple-600 truncate" title={kpi.top}>{kpi.top}</h2>
        </div>
        <div className="glass p-6 rounded-[2rem] hover:-translate-y-1 transition-transform duration-300">
          <p className="text-slate-500 text-sm font-medium mb-1">Top Revenue</p>
          <h2 className="text-2xl font-bold text-emerald-600">₹{kpi.topRevenue.toLocaleString()}</h2>
        </div>
        <div className="glass p-6 rounded-[2rem] hover:-translate-y-1 transition-transform duration-300">
          <p className="text-slate-500 text-sm font-medium mb-1">Avg Revenue / Mgr</p>
          <h2 className="text-2xl font-bold text-blue-600">₹{Math.round(kpi.avg).toLocaleString()}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="glass p-6 rounded-[2rem] lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4 text-slate-800">Revenue by Manager (This Session)</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={managers} margin={{ left: 0, right: 10 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={50} />
              <Tooltip
                formatter={(v) => [`₹${v.toLocaleString()}`, "Revenue"]}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.12)' }}
              />
              <Bar dataKey="revenue" radius={[8, 8, 0, 0]} barSize={36}>
                {managers.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Leaderboard */}
        <div className="glass p-6 rounded-[2rem] flex flex-col">
          <h2 className="text-lg font-semibold mb-4 text-slate-800">Leaderboard</h2>
          <div className="space-y-2 overflow-y-auto flex-1 pr-1">
            {managers.map((m, index) => (
              <div key={m.name} className="flex justify-between items-center bg-white/40 px-4 py-3 rounded-xl hover:bg-white/60 transition">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold flex items-center justify-center w-6 h-6 rounded-full ${
                    index === 0 ? "bg-yellow-100 text-yellow-600" :
                    index === 1 ? "bg-slate-200 text-slate-600" :
                    index === 2 ? "bg-orange-100 text-orange-600" :
                    "bg-white text-slate-400"
                  }`}>{index + 1}</span>
                  <span className="font-medium text-slate-800 text-sm">{m.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-purple-600 text-sm">₹{m.revenue.toLocaleString()}</p>
                  <GrowthBadge current={m.revenue} last={m.lastRevenue} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Table with Last Session comparison */}
      <div className="glass rounded-[2rem] overflow-hidden">
        <div className="p-6 border-b border-slate-100/60 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800">Manager Details</h2>
          <button
            onClick={() => exportToCSV(managers, "managers_data")}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition text-sm"
          >
            <Download size={16} /> Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-xs uppercase tracking-wider bg-slate-50/60">
                <th className="p-4 font-semibold">Manager</th>
                <th className="p-4 font-semibold text-right">Centres</th>
                <th className="p-4 font-semibold text-right">Students</th>
                <th className="p-4 font-semibold text-right">Last Session</th>
                <th className="p-4 font-semibold text-right text-purple-600">This Session</th>
                <th className="p-4 font-semibold text-right">Growth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              {managers.map((m) => (
                <tr key={m.name} className="hover:bg-purple-50/20 transition">
                  <td className="p-4 font-semibold text-slate-800">
                    <Link to={`/managers/${encodeURIComponent(m.name)}`} className="text-blue-600 hover:underline">
                      {m.name}
                    </Link>
                  </td>
                  <td className="p-4 text-right text-slate-600">{m.centresCount}</td>
                  <td className="p-4 text-right text-slate-600">{m.students}</td>
                  <td className="p-4 text-right text-slate-500">
                    {m.lastRevenue > 0 ? `₹${m.lastRevenue.toLocaleString()}` : "—"}
                  </td>
                  <td className="p-4 text-right font-bold text-purple-600">₹{m.revenue.toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <GrowthBadge current={m.revenue} last={m.lastRevenue} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}