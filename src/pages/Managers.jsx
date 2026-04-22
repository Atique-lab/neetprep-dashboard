import { useMemo } from "react";
import { useDashboardData } from "../hooks/useDashboardData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { exportToCSV } from "../utils/exportToCSV";
import { AlertCircle, Download } from "lucide-react";
import { Link } from "react-router-dom";

export default function Managers() {
  const { filteredData, loading, error } = useDashboardData();

  const parseNumber = (val) => {
    if (!val) return 0;
    if (typeof val === "number") return val;
    return Number(val.replace(/,/g, "")) || 0;
  };

  const { managers, kpi } = useMemo(() => {
    if (!filteredData || filteredData.length <= 1) return { managers: [], kpi: {} };

    const processed = filteredData.slice(1).map((row) => ({
      manager: row[21] || "Unassigned",
      revenue: parseNumber(row[20]), // Neetprep Share Revenue generated
      centre: row[6] || "Unknown",
    })).filter(row => row.manager !== "Unassigned");

    const managerMap = {};

    processed.forEach((d) => {
      const name = d.manager.trim();
      if (!name) return;

      if (!managerMap[name]) {
        managerMap[name] = {
          name,
          revenue: 0,
          students: 0,
          centresSet: new Set(),
        };
      }

      managerMap[name].revenue += d.revenue;
      managerMap[name].students += 1;
      managerMap[name].centresSet.add(d.centre);
    });

    const managerData = Object.values(managerMap).map(m => ({
      ...m,
      centresCount: m.centresSet.size
    })).sort((a, b) => b.revenue - a.revenue);

    const total = managerData.length;
    const top = managerData[0]?.name || "-";
    const topRevenue = managerData[0]?.revenue || 0;
    const totalRevenue = managerData.reduce((sum, m) => sum + m.revenue, 0);
    const avg = total > 0 ? totalRevenue / total : 0;

    return { managers: managerData, kpi: { total, top, topRevenue, avg } };
  }, [filteredData]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <AlertCircle size={48} className="mb-4" />
        <h2 className="text-xl font-semibold">Failed to load data</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-24 w-full"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-100 rounded-2xl h-[400px] w-full"></div>
          <div className="bg-gray-100 rounded-2xl h-[400px] w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Manager Performance Analytics
      </h1>

      {/* 🔹 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
          <p className="text-gray-500 text-sm mb-1">Total Managers</p>
          <h2 className="text-2xl font-bold text-gray-800">{kpi.total}</h2>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
          <p className="text-gray-500 text-sm mb-1">Top Manager</p>
          <h2 className="text-sm font-semibold text-purple-600 truncate" title={kpi.top}>
            {kpi.top}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
          <p className="text-gray-500 text-sm mb-1">Top Revenue</p>
          <h2 className="text-2xl font-bold text-green-600">
            ₹{kpi.topRevenue.toLocaleString()}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
          <p className="text-gray-500 text-sm mb-1">Avg Revenue / Mgr</p>
          <h2 className="text-2xl font-bold text-blue-600">
            ₹{Math.round(kpi.avg).toLocaleString()}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* 🔹 Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Revenue by Manager
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={managers}>
              <XAxis dataKey="name" tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} />
              <YAxis tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} />
              <Tooltip 
                formatter={(value) => [`₹${value.toLocaleString()}`, "Revenue"]}
                cursor={{fill: '#f3f4f6'}}
              />
              <Bar
                dataKey="revenue"
                fill="#ec4899"
                radius={[6, 6, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 🔹 Leaderboard */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[380px]">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Top Managers Leaderboard
          </h2>

          <div className="space-y-3 overflow-y-auto pr-2 flex-1">
            {managers.map((m, index) => (
              <div
                key={m.name}
                className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold flex items-center justify-center w-6 h-6 rounded-full ${
                    index === 0 ? "bg-yellow-100 text-yellow-600" : 
                    index === 1 ? "bg-gray-200 text-gray-600" :
                    index === 2 ? "bg-orange-100 text-orange-600" :
                    "bg-white text-gray-400"
                  }`}>
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-800">
                    {m.name}
                  </span>
                </div>

                <span className="font-semibold text-pink-600">
                  ₹{m.revenue.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🔹 Detailed Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            Manager Details
          </h2>
          <button
            onClick={() => exportToCSV(managers, "managers_data")}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition text-sm"
          >
            <Download size={16} /> Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Manager Name</th>
                <th className="p-4 font-medium text-right">Centres Managed</th>
                <th className="p-4 font-medium text-right">Total Students</th>
                <th className="p-4 font-medium text-right text-pink-600">Neetprep Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {managers.map((m) => (
                <tr key={m.name} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-medium text-gray-800">
                    <Link to={`/managers/${encodeURIComponent(m.name)}`} className="text-blue-600 hover:underline">
                      {m.name}
                    </Link>
                  </td>
                  <td className="p-4 text-right font-medium text-gray-600">{m.centresCount}</td>
                  <td className="p-4 text-right font-medium text-gray-600">{m.students}</td>
                  <td className="p-4 text-right font-semibold text-pink-600">
                    ₹{m.revenue.toLocaleString()}
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