import { useMemo } from "react";
import { useDashboardData } from "../hooks/useDashboardData";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
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
    if (!filteredData || filteredData.length <= 1) return { neetprep: 0, centre: 0, profit: 0, total: 0 };

    const processed = filteredData.slice(1).map((row) => ({
      centre: parseNumber(row[17]),   // Column R (Centre Share)
      neetprep: parseNumber(row[20]), // Column U (Neetprep Share)
    }));

    const totalCentre = processed.reduce((sum, d) => sum + (d.centre || 0), 0);
    const totalNeetprep = processed.reduce((sum, d) => sum + (d.neetprep || 0), 0);
    const total = totalCentre + totalNeetprep;

    return {
      neetprep: totalNeetprep,
      centre: totalCentre,
      profit: totalNeetprep,
      total: total
    };
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-100 rounded-2xl h-[400px] w-full"></div>
          <div className="bg-gray-100 rounded-2xl h-[400px] w-full"></div>
        </div>
      </div>
    );
  }

  const chartData = [
    { name: "Neetprep Share", value: data.neetprep },
    { name: "Centre Share", value: data.centre },
  ];

  const COLORS = ["#7c3aed", "#06b6d4"];
  const neetprepMargin = data.total > 0 ? (data.neetprep / data.total) * 100 : 0;
  const centreMargin = data.total > 0 ? (data.centre / data.total) * 100 : 0;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Revenue Analytics
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* KPI Cards */}
        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center h-full hover:shadow-md transition">
            <h2 className="text-gray-500 font-medium">Total Gross Revenue</h2>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              ₹{data.total.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center h-full hover:shadow-md transition">
            <h2 className="text-gray-500 font-medium">Neetprep Net Profit</h2>
            <p className="text-3xl font-bold text-green-600 mt-2">
              ₹{data.profit.toLocaleString()}
            </p>
            <div className="mt-2 text-sm text-green-600 bg-green-50 px-2 py-1 rounded w-fit font-medium">
              {neetprepMargin.toFixed(1)}% Profit Margin
            </div>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Revenue Split Distribution
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={80}
                outerRadius={120}
                dataKey="value"
                paddingAngle={5}
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`₹${value.toLocaleString()}`, "Amount"]}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Breakdown Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Split Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Entity</th>
                <th className="p-4 font-medium text-right">Amount (₹)</th>
                <th className="p-4 font-medium text-right">Percentage Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50 transition">
                <td className="p-4 font-medium text-gray-800 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-600"></div> Neetprep
                </td>
                <td className="p-4 text-right font-semibold text-purple-600">
                  ₹{data.neetprep.toLocaleString()}
                </td>
                <td className="p-4 text-right font-medium text-gray-600">
                  {neetprepMargin.toFixed(1)}%
                </td>
              </tr>
              <tr className="hover:bg-gray-50 transition">
                <td className="p-4 font-medium text-gray-800 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-500"></div> Centres
                </td>
                <td className="p-4 text-right font-semibold text-cyan-600">
                  ₹{data.centre.toLocaleString()}
                </td>
                <td className="p-4 text-right font-medium text-gray-600">
                  {centreMargin.toFixed(1)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}