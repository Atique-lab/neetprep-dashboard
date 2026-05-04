import { useMemo } from "react";
import { useDashboardData } from "../hooks/useDashboardData";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { AlertCircle } from "lucide-react";

export default function Revenue() {
  const { filteredData, loading, error } = useDashboardData();

  const parseNumber = (val) => {
    if (!val) return 0;
    if (typeof val === "number") return val;
    return Number(val.replace(/,/g, "")) || 0;
  };

  const data = useMemo(() => {
    if (!filteredData || filteredData.length <= 1) return { neetprep: 0, centre: 0, gst: 0, courier: 0, total: 0 };

    let totalCentre = 0, totalNeetprep = 0, totalGst = 0, totalCourier = 0;

    filteredData.slice(1).forEach(row => {
      totalCentre   += parseNumber(row[17]); // Centre Share
      totalNeetprep += parseNumber(row[20]); // Neetprep Revenue Share
      totalGst      += parseNumber(row[14]); // GST column
      totalCourier  += parseNumber(row[15]); // Courier cost
    });

    return { neetprep: totalNeetprep, centre: totalCentre, gst: totalGst, courier: totalCourier, total: totalCentre + totalNeetprep };
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

  const chartData = [
    { name: "Neetprep Revenue Share", value: data.neetprep },
    { name: "Centre Share",           value: data.centre },
  ];
  const COLORS = ["#7c3aed", "#06b6d4"];
  const neetprepPct = data.total > 0 ? (data.neetprep / data.total) * 100 : 0;
  const centrePct   = data.total > 0 ? (data.centre   / data.total) * 100 : 0;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Revenue Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Breakdown of revenue distribution across Neetprep and partner centres.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* KPI Summary Cards */}
        <div className="flex flex-col gap-4">
          <div className="glass p-6 rounded-[2rem] hover:-translate-y-1 transition-transform duration-300">
            <p className="text-slate-500 text-sm font-medium mb-1">Total Gross Revenue</p>
            <h2 className="text-3xl font-bold text-slate-800">₹{data.total.toLocaleString()}</h2>
          </div>
          <div className="glass p-6 rounded-[2rem] hover:-translate-y-1 transition-transform duration-300">
            {/* Fix #4: renamed from "Net Profit" to correct "Neetprep Revenue Share" */}
            <p className="text-slate-500 text-sm font-medium mb-1">Neetprep Revenue Share</p>
            <h2 className="text-3xl font-bold text-purple-600">₹{data.neetprep.toLocaleString()}</h2>
            <div className="mt-2 text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded-xl w-fit font-medium">
              {neetprepPct.toFixed(1)}% of total
            </div>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="glass p-6 rounded-[2rem] lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4 text-slate-800">Revenue Split Distribution</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={chartData} innerRadius={80} outerRadius={120} dataKey="value" paddingAngle={5}>
                {chartData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip
                formatter={(v) => [`₹${v.toLocaleString()}`, "Amount"]}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.12)' }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="glass rounded-[2rem] overflow-hidden">
        <div className="p-6 border-b border-slate-100/60">
          <h2 className="text-lg font-semibold text-slate-800">Split Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-xs uppercase tracking-wider bg-slate-50/60">
                <th className="p-4 font-medium">Entity</th>
                <th className="p-4 font-medium text-right">Amount (₹)</th>
                <th className="p-4 font-medium text-right">Share %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              <tr className="hover:bg-purple-50/20 transition">
                <td className="p-4 font-medium text-slate-800 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-600" /> Neetprep Revenue
                </td>
                <td className="p-4 text-right font-bold text-purple-600">₹{data.neetprep.toLocaleString()}</td>
                <td className="p-4 text-right text-slate-500">{neetprepPct.toFixed(1)}%</td>
              </tr>
              <tr className="hover:bg-cyan-50/20 transition">
                <td className="p-4 font-medium text-slate-800 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-500" /> Centre Share
                </td>
                <td className="p-4 text-right font-bold text-cyan-600">₹{data.centre.toLocaleString()}</td>
                <td className="p-4 text-right text-slate-500">{centrePct.toFixed(1)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}