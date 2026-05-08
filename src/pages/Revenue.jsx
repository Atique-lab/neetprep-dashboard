import { useMemo } from "react";
import { useDashboardData } from "../hooks/useDashboardData";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { AlertCircle, TrendingUp, TrendingDown } from "lucide-react";

const GrowthPill = ({ current, last }) => {
  if (!last) return null;
  const pct = ((current - last) / last) * 100;
  const up = pct >= 0;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${up ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600"}`}>
      {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {up ? "+" : ""}{pct.toFixed(1)}% vs last session
    </span>
  );
};

export default function Revenue() {
  const { filteredData, lastSessionComparison, loading, error } = useDashboardData();
  const lsBreak = lastSessionComparison?.revenueBreakdown || { neetprep: 0, centre: 0, gst: 0, total: 0 };

  const parseNumber = (val) => {
    if (!val) return 0;
    if (typeof val === "number") return val;
    return Number(val.replace(/,/g, "")) || 0;
  };

  const data = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return { neetprep: 0, centre: 0, gst: 0, total: 0 };

    let totalCentre = 0, totalNeetprep = 0, totalGst = 0;
    filteredData.forEach(d => {
      totalCentre   += d.centre_share || 0;
      totalNeetprep += d.neetprep_share || 0;
      totalGst      += d.gst || 0;
    });

    return { neetprep: totalNeetprep, centre: totalCentre, gst: totalGst, total: totalCentre + totalNeetprep };
  }, [filteredData]);

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-[2rem] h-[400px] w-full" />
        <div className="glass rounded-[2rem] h-[400px] w-full" />
      </div>
    </div>
  );

  const neetprepPct = data.total > 0 ? (data.neetprep / data.total) * 100 : 0;
  const centrePct   = data.total > 0 ? (data.centre   / data.total) * 100 : 0;

  const thisChartData = [
    { name: "Neetprep Share", value: data.neetprep },
    { name: "Centre Share",   value: data.centre },
  ];
  const lastChartData = [
    { name: "Neetprep Share", value: lsBreak.neetprep },
    { name: "Centre Share",   value: lsBreak.centre },
  ];
  const COLORS  = ["#7c3aed", "#06b6d4"];
  const LCOLORS = ["#a78bfa", "#67e8f9"];

  // Session bar comparison data
  const sessionBars = [
    { label: "Total Revenue", this: data.total,    last: lsBreak.total },
    { label: "Neetprep Share", this: data.neetprep, last: lsBreak.neetprep },
    { label: "Centre Share",   this: data.centre,   last: lsBreak.centre },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Revenue Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Revenue split breakdown — current session vs last session.</p>
      </div>

      {/* Summary KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue",    val: data.total,    last: lsBreak.total,    color: "text-slate-800" },
          { label: "Neetprep Share",   val: data.neetprep, last: lsBreak.neetprep, color: "text-purple-600" },
          { label: "Centre Share",     val: data.centre,   last: lsBreak.centre,   color: "text-cyan-600" },
          { label: "Last Session Total", val: lsBreak.total, last: null, color: "text-slate-500" },
        ].map(({ label, val, last, color }) => (
          <div key={label} className="glass p-5 rounded-[2rem] hover:-translate-y-1 transition-transform duration-300">
            <p className="text-slate-500 text-xs font-medium mb-1">{label}</p>
            <h2 className={`text-xl font-bold ${color}`}>₹{val.toLocaleString()}</h2>
            {last != null && <div className="mt-1"><GrowthPill current={val} last={last} /></div>}
          </div>
        ))}
      </div>

      {/* Dual Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-[2rem]">
          <h2 className="text-lg font-semibold mb-1 text-slate-800">This Session — Revenue Split</h2>
          <p className="text-xs text-slate-400 mb-3">Current session distribution</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={thisChartData} innerRadius={70} outerRadius={105} dataKey="value" paddingAngle={5}>
                {thisChartData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, "Amount"]}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.12)' }} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="glass p-6 rounded-[2rem]">
          <h2 className="text-lg font-semibold mb-1 text-slate-800">Last Session — Revenue Split</h2>
          <p className="text-xs text-slate-400 mb-3">For comparison reference</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={lastChartData} innerRadius={70} outerRadius={105} dataKey="value" paddingAngle={5}>
                {lastChartData.map((_, i) => <Cell key={i} fill={LCOLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, "Amount"]}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.12)' }} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Session Bar Comparison */}
      <div className="glass p-6 rounded-[2rem]">
        <h2 className="text-lg font-semibold mb-4 text-slate-800">Session-over-Session Comparison</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={sessionBars} margin={{ left: 10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={55} />
            <Tooltip
              formatter={(v, name) => [`₹${v.toLocaleString()}`, name === "this" ? "This Session" : "Last Session"]}
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.12)' }}
            />
            <Bar dataKey="last" name="last" fill="#e2e8f0" radius={[6, 6, 0, 0]} barSize={32} />
            <Bar dataKey="this" name="this" fill="#7c3aed" radius={[6, 6, 0, 0]} barSize={32} />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-slate-400 mt-2 text-center">Grey = Last Session &nbsp;|&nbsp; Purple = This Session</p>
      </div>

      {/* Breakdown Table */}
      <div className="glass rounded-[2rem] overflow-hidden">
        <div className="p-6 border-b border-slate-100/60">
          <h2 className="text-lg font-semibold text-slate-800">Detailed Split Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-xs uppercase tracking-wider bg-slate-50/60">
                <th className="p-4 font-medium">Entity</th>
                <th className="p-4 font-medium text-right">Last Session (₹)</th>
                <th className="p-4 font-medium text-right text-purple-600">This Session (₹)</th>
                <th className="p-4 font-medium text-right">Share %</th>
                <th className="p-4 font-medium text-right">Growth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              {[
                { label: "Neetprep", color: "bg-purple-600", val: data.neetprep, last: lsBreak.neetprep, pct: neetprepPct, textColor: "text-purple-600" },
                { label: "Centres",  color: "bg-cyan-500",   val: data.centre,   last: lsBreak.centre,   pct: centrePct,   textColor: "text-cyan-600" },
              ].map(({ label, color, val, last, pct, textColor }) => {
                const growth = last > 0 ? ((val - last) / last) * 100 : null;
                return (
                  <tr key={label} className="hover:bg-purple-50/20 transition">
                    <td className="p-4 font-medium text-slate-800 flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${color}`} /> {label}
                    </td>
                    <td className="p-4 text-right text-slate-500">{last > 0 ? `₹${last.toLocaleString()}` : "—"}</td>
                    <td className={`p-4 text-right font-bold ${textColor}`}>₹{val.toLocaleString()}</td>
                    <td className="p-4 text-right text-slate-500">{pct.toFixed(1)}%</td>
                    <td className="p-4 text-right">
                      {growth !== null ? (
                        <span className={`text-xs font-semibold flex items-center justify-end gap-1 ${growth >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                          {growth >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {growth >= 0 ? "+" : ""}{growth.toFixed(1)}%
                        </span>
                      ) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}