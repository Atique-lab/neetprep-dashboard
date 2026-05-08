import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useDashboardData } from "../hooks/useDashboardData";
import { AlertCircle, ArrowLeft, Users, Building, Wallet, TrendingUp } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

export default function ManagerDetail() {
  const { id } = useParams();
  const decodedName = decodeURIComponent(id);
  const { filteredData, loading, error } = useDashboardData();

  const parseNumber = (val) => {
    if (!val) return 0;
    if (typeof val === "number") return val;
    return Number(val.replace(/,/g, "")) || 0;
  };

  const getMonth = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split("-");
    return parts.length >= 2 ? parts[1].trim() : null;
  };

  const monthsOrder = ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];

  const managerData = useMemo(() => {
    if (!filteredData || filteredData.length <= 1) return null;

    const rows = filteredData.slice(1).filter(row => row[21]?.trim() === decodedName);
    if (rows.length === 0) return { notFound: true };

    let totalRevenue = 0;
    const centresSet = new Set();
    const studentsList = [];
    const monthlyMap = {};

    rows.forEach(row => {
      const rev = parseNumber(row[20]);
      totalRevenue += rev;

      const centreName = row[6] || "Unknown";
      centresSet.add(centreName);

      const month = getMonth(row[1]);
      if (month) monthlyMap[month] = (monthlyMap[month] || 0) + rev;

      studentsList.push({
        date: row[1] || "-",
        name: row[2] || "Unknown",
        course: row[7] || "-",
        centre: centreName,
        amount: rev,
      });
    });

    // Fix #15: Build monthly trend data in session order
    const trendData = monthsOrder
      .filter(m => monthlyMap[m] !== undefined)
      .map(m => ({ month: m, revenue: monthlyMap[m] }));

    return {
      name: decodedName,
      totalRevenue,
      studentsCount: studentsList.length,
      centresCount: centresSet.size,
      students: studentsList.sort((a, b) => b.amount - a.amount),
      trendData,
    };
  }, [filteredData, decodedName]);

  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 text-red-500">
      <AlertCircle size={48} className="mb-4" />
      <h2 className="text-xl font-semibold">Failed to load data</h2>
      <p>{error}</p>
    </div>
  );

  if (loading || !managerData) return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-slate-200/50 rounded-lg w-1/4" />
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="glass rounded-[2rem] h-24 w-full" />)}
      </div>
    </div>
  );

  if (managerData.notFound) return (
    <div className="text-center mt-20">
      <h2 className="text-2xl font-semibold text-gray-800">Manager Not Found</h2>
      <p className="text-gray-500 mt-2">Could not find any data for "{decodedName}".</p>
      <Link to="/managers" className="text-purple-600 mt-4 inline-block hover:underline">← Back to Managers</Link>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      <Link to="/managers" className="text-slate-500 hover:text-slate-800 flex items-center gap-2 w-fit transition">
        <ArrowLeft size={16} /> Back to Managers
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-slate-800">{managerData.name}</h1>
        <p className="text-slate-500 mt-1">Manager Performance Overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-[2rem] flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
          <div className="p-4 bg-purple-100 text-purple-600 rounded-2xl"><Wallet size={24} /></div>
          <div>
            <p className="text-slate-500 text-sm mb-1">Generated Revenue</p>
            <h2 className="text-2xl font-bold text-slate-800">₹{managerData.totalRevenue.toLocaleString()}</h2>
          </div>
        </div>
        <div className="glass p-6 rounded-[2rem] flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl"><Users size={24} /></div>
          <div>
            <p className="text-slate-500 text-sm mb-1">Total Students</p>
            <h2 className="text-2xl font-bold text-slate-800">{managerData.studentsCount}</h2>
          </div>
        </div>
        <div className="glass p-6 rounded-[2rem] flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
          <div className="p-4 bg-orange-100 text-orange-600 rounded-2xl"><Building size={24} /></div>
          <div>
            <p className="text-slate-500 text-sm mb-1">Centres Managed</p>
            <h2 className="text-2xl font-bold text-slate-800">{managerData.centresCount}</h2>
          </div>
        </div>
      </div>

      {/* Fix #15: Monthly Revenue Trend Chart */}
      {managerData.trendData.length > 1 && (
        <div className="glass p-6 rounded-[2rem]">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-purple-500" />
            <h2 className="text-lg font-semibold text-slate-800">Monthly Revenue Trend</h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={managerData.trendData} margin={{ left: 0, right: 10, top: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={52} />
              <Tooltip
                formatter={(v) => [`₹${v.toLocaleString()}`, "Revenue"]}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.12)' }}
              />
              <Bar dataKey="revenue" fill="#7c3aed" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Students Table */}
      <div className="glass rounded-[2rem] overflow-hidden">
        <div className="p-6 border-b border-slate-100/60">
          <h2 className="text-lg font-semibold text-slate-800">Students Managed by {managerData.name}</h2>
        </div>
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-white/80 backdrop-blur-sm z-10 shadow-sm">
              <tr className="text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Student Name</th>
                <th className="p-4 font-medium">Course</th>
                <th className="p-4 font-medium">Centre</th>
                <th className="p-4 font-medium text-right text-purple-600">Neetprep Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              {managerData.students.map((s, idx) => (
                <tr key={idx} className="hover:bg-purple-50/20 transition">
                  <td className="p-4 text-slate-500 text-sm whitespace-nowrap">{s.date}</td>
                  <td className="p-4 font-medium text-slate-800">{s.name}</td>
                  <td className="p-4 text-slate-600 text-sm">{s.course}</td>
                  <td className="p-4 text-slate-600 text-sm">
                    <Link to={`/centres/${encodeURIComponent(s.centre)}`} className="text-blue-600 hover:underline">
                      {s.centre}
                    </Link>
                  </td>
                  <td className="p-4 text-right font-bold text-purple-600">₹{s.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
