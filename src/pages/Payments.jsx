import { useMemo } from "react";
import { useDashboardData } from "../hooks/useDashboardData";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis
} from "recharts";
import { AlertCircle } from "lucide-react";

// Fix #1: Format raw DB payment method names into human-readable labels
const formatMethod = (m) => {
  const map = {
    cash_centre: "Cash at Centre",
    online_centre: "Online via Centre",
    "Online Through NEETprep Link": "NEETprep Link",
    "Razorpay Scanner (Neetprep)": "Razorpay Scanner",
    "Paid in NEETprep A/c": "Bank Transfer",
  };
  return map[m] || m.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
};

export default function Payments() {
  const { filteredData, loading, error } = useDashboardData();

  const parseNumber = (val) => {
    if (!val) return 0;
    if (typeof val === "number") return val;
    return Number(val.replace(/,/g, "")) || 0;
  };

  const { pieData, methodData } = useMemo(() => {
    if (!filteredData || filteredData.length <= 1) return { pieData: [], methodData: [] };

    const processed = filteredData.slice(1).map((row) => ({
      paymentTo: row[13],
      method:    row[8] || "Unknown",
      amount:    parseNumber(row[11]),
    }));

    let neetprep = 0, centre = 0;
    const methodMap = {};

    processed.forEach((d) => {
      if (d.paymentTo) {
        const v = d.paymentTo.toLowerCase();
        if (v.includes("neetprep")) neetprep += d.amount || 0;
        else if (v.includes("centre") || v.includes("center")) centre += d.amount || 0;
      }
      const method = d.method.trim();
      if (method) methodMap[method] = (methodMap[method] || 0) + d.amount;
    });

    const mData = Object.keys(methodMap)
      .map(m => ({ name: formatMethod(m), raw: m, value: methodMap[m] }))
      .sort((a, b) => b.value - a.value);

    return {
      pieData: [
        { name: "Paid directly to Neetprep", value: neetprep },
        { name: "Paid directly to Centre",   value: centre },
      ],
      methodData: mData,
    };
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

  const PIE_COLORS = ["#7c3aed", "#f59e0b"];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Payment Distribution</h1>
        <p className="text-slate-500 text-sm mt-1">How and where payments were collected across this session.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="glass p-6 rounded-[2rem]">
          <h2 className="text-lg font-semibold mb-4 text-slate-800">Initial Payment Receiver</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} innerRadius={80} outerRadius={110} dataKey="value" paddingAngle={5}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip
                formatter={(v) => [`₹${v.toLocaleString()}`, "Amount"]}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.12)' }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart – fix #1: formatted names */}
        <div className="glass p-6 rounded-[2rem]">
          <h2 className="text-lg font-semibold mb-4 text-slate-800">Payment Methods Used</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={methodData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v) => [`₹${v.toLocaleString()}`, "Amount"]}
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.12)' }}
              />
              <Bar dataKey="value" fill="#10b981" radius={[0, 6, 6, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Methods Table */}
      <div className="glass rounded-[2rem] overflow-hidden">
        <div className="p-6 border-b border-slate-100/60">
          <h2 className="text-lg font-semibold text-slate-800">Payment Methods Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-xs uppercase tracking-wider bg-slate-50/60">
                <th className="p-4 font-medium">Method</th>
                <th className="p-4 font-medium text-right">Total Processed (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              {methodData.map((m) => (
                <tr key={m.raw} className="hover:bg-emerald-50/20 transition">
                  <td className="p-4 font-medium text-slate-800">{m.name}</td>
                  <td className="p-4 text-right font-bold text-emerald-600">₹{m.value.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}