import { useMemo } from "react";
import { useDashboardData } from "../hooks/useDashboardData";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis
} from "recharts";
import { AlertCircle, TrendingUp, TrendingDown } from "lucide-react";

// Normalize Razorpay variants
const normalizePaymentMethod = (m) => {
  if (!m) return "Unknown";
  const lower = m.trim().toLowerCase();
  if (lower.includes("razorpay") || lower.includes("razor pay")) return "Razorpay";
  return m.trim();
};

// Format raw DB payment method names into human-readable labels
const formatMethod = (m) => {
  if (m === "Razorpay") return "Razorpay";
  const map = {
    cash_centre: "Cash at Centre",
    online_centre: "Online via Centre",
    "Online Through NEETprep Link": "NEETprep Link",
    "Paid in NEETprep A/c": "Bank Transfer",
  };
  return map[m] || m.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
};

export default function Payments() {
  const { filteredData, lastSessionComparison, loading, error } = useDashboardData();
  const lsPaymentMethods = lastSessionComparison?.paymentMethods || {};
  const lsRevBreakdown = lastSessionComparison?.revenueBreakdown || { neetprep: 0, centre: 0, total: 0 };

  const parseNumber = (val) => {
    if (!val) return 0;
    if (typeof val === "number") return val;
    return Number(val.replace(/,/g, "")) || 0;
  };

  const { pieData, methodData, lsPieData } = useMemo(() => {
    if (!filteredData || filteredData.length <= 1) return { pieData: [], methodData: [], lsPieData: [] };

    const processed = filteredData.map((d) => ({
      paymentTo: d.paid_to,
      method: normalizePaymentMethod(d.payment_method || "Unknown"),
      amount: d.revenue || 0,
    }));

    let neetprep = 0, centre = 0;
    const methodMap = {};

    processed.forEach((d) => {
      if (d.paymentTo) {
        const v = d.paymentTo.toLowerCase();
        if (v.includes("neetprep")) neetprep += d.amount;
        else if (v.includes("centre") || v.includes("center")) centre += d.amount;
      }
      const method = d.method;
      if (method) methodMap[method] = (methodMap[method] || 0) + d.amount;
    });

    const mData = Object.keys(methodMap)
      .map(m => ({
        name: formatMethod(m),
        raw: m,
        value: methodMap[m],
        lastValue: lsPaymentMethods[formatMethod(m)] || 0,
      }))
      .sort((a, b) => b.value - a.value);

    return {
      pieData: [
        { name: "Neetprep (This Session)",  value: neetprep },
        { name: "Centre (This Session)",     value: centre },
      ],
      lsPieData: [
        { name: "Neetprep (Last Session)", value: lsRevBreakdown.neetprep },
        { name: "Centre (Last Session)",   value: lsRevBreakdown.centre },
      ],
      methodData: mData,
    };
  }, [filteredData, lsPaymentMethods, lsRevBreakdown]);

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

  const PIE_COLORS      = ["#7c3aed", "#f59e0b"];
  const LS_PIE_COLORS   = ["#a78bfa", "#fcd34d"];

  const totalThis = (pieData[0]?.value || 0) + (pieData[1]?.value || 0);
  const totalLast = lsRevBreakdown.total;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Payment Distribution</h1>
        <p className="text-slate-500 text-sm mt-1">How and where payments were collected — compared against last session.</p>
      </div>

      {/* Summary KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "This Session Total", val: totalThis, color: "text-purple-600" },
          { label: "Last Session Total", val: totalLast, color: "text-slate-500" },
          { label: "Neetprep This Session", val: pieData[0]?.value || 0, color: "text-purple-600" },
          { label: "Centre This Session",   val: pieData[1]?.value || 0, color: "text-amber-600" },
        ].map(({ label, val, color }) => (
          <div key={label} className="glass p-5 rounded-[2rem] hover:-translate-y-1 transition-transform duration-300">
            <p className="text-slate-500 text-xs font-medium mb-1">{label}</p>
            <h2 className={`text-xl font-bold ${color}`}>₹{val.toLocaleString()}</h2>
            {label.includes("Total") && totalLast > 0 && label.includes("This") && (
              <div className="flex items-center gap-1 mt-1 text-xs font-semibold">
                {totalThis > totalLast
                  ? <><TrendingUp size={12} className="text-emerald-500" /><span className="text-emerald-600">+{(((totalThis - totalLast) / totalLast) * 100).toFixed(1)}% vs last</span></>
                  : <><TrendingDown size={12} className="text-rose-500" /><span className="text-rose-600">{(((totalThis - totalLast) / totalLast) * 100).toFixed(1)}% vs last</span></>
                }
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* This Session Pie */}
        <div className="glass p-6 rounded-[2rem]">
          <h2 className="text-lg font-semibold mb-1 text-slate-800">This Session — Payment Receiver</h2>
          <p className="text-xs text-slate-400 mb-3">Who initially collected the payment</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} innerRadius={70} outerRadius={105} dataKey="value" paddingAngle={5}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, "Amount"]}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.12)' }} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Last Session Pie */}
        <div className="glass p-6 rounded-[2rem]">
          <h2 className="text-lg font-semibold mb-1 text-slate-800">Last Session — Payment Receiver</h2>
          <p className="text-xs text-slate-400 mb-3">For comparison reference</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={lsPieData} innerRadius={70} outerRadius={105} dataKey="value" paddingAngle={5}>
                {lsPieData.map((_, i) => <Cell key={i} fill={LS_PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, "Amount"]}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.12)' }} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payment Methods Bar Chart */}
      <div className="glass p-6 rounded-[2rem]">
        <h2 className="text-lg font-semibold mb-4 text-slate-800">Payment Methods Used (This Session)</h2>
        <ResponsiveContainer width="100%" height={Math.max(180, methodData.length * 48)}>
          <BarChart data={methodData} layout="vertical" margin={{ left: 10, right: 30 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(v) => [`₹${v.toLocaleString()}`, "Amount"]}
              cursor={{ fill: '#f1f5f9' }}
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.12)' }}
            />
            <Bar dataKey="value" fill="#10b981" radius={[0, 8, 8, 0]} barSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Methods Table with Last Session comparison */}
      <div className="glass rounded-[2rem] overflow-hidden">
        <div className="p-6 border-b border-slate-100/60">
          <h2 className="text-lg font-semibold text-slate-800">Payment Methods — Session Comparison</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-xs uppercase tracking-wider bg-slate-50/60">
                <th className="p-4 font-medium">Method</th>
                <th className="p-4 font-medium text-right">Last Session (₹)</th>
                <th className="p-4 font-medium text-right text-emerald-600">This Session (₹)</th>
                <th className="p-4 font-medium text-right">Growth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              {methodData.map((m) => {
                const growth = m.lastValue > 0 ? ((m.value - m.lastValue) / m.lastValue) * 100 : null;
                return (
                  <tr key={m.raw} className="hover:bg-emerald-50/20 transition">
                    <td className="p-4 font-medium text-slate-800">{m.name}</td>
                    <td className="p-4 text-right text-slate-500">
                      {m.lastValue > 0 ? `₹${m.lastValue.toLocaleString()}` : "—"}
                    </td>
                    <td className="p-4 text-right font-bold text-emerald-600">₹{m.value.toLocaleString()}</td>
                    <td className="p-4 text-right">
                      {growth !== null ? (
                        <span className={`text-xs font-semibold flex items-center justify-end gap-1 ${growth >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                          {growth >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {growth >= 0 ? "+" : ""}{growth.toFixed(1)}%
                        </span>
                      ) : <span className="text-xs text-slate-400">New</span>}
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