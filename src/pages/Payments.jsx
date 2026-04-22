import { useMemo } from "react";
import { useDashboardData } from "../hooks/useDashboardData";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from "recharts";
import { AlertCircle } from "lucide-react";

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
      paymentTo: row[13],        // Column N
      method: row[8] || "Unknown", // Column I
      amount: parseNumber(row[11]),   // Column L
    }));

    let neetprep = 0;
    let centre = 0;
    const methodMap = {};

    processed.forEach((d) => {
      // Payment To Logic
      if (d.paymentTo) {
        const value = d.paymentTo.toLowerCase();
        if (value.includes("neetprep")) {
          neetprep += d.amount || 0;
        } else if (value.includes("centre") || value.includes("center")) {
          centre += d.amount || 0;
        }
      }

      // Payment Method Logic
      const method = d.method.trim();
      if (method) {
        if (!methodMap[method]) methodMap[method] = 0;
        methodMap[method] += d.amount;
      }
    });

    const mData = Object.keys(methodMap).map(m => ({
      name: m,
      value: methodMap[m]
    })).sort((a, b) => b.value - a.value);

    return {
      pieData: [
        { name: "Paid directly to Neetprep", value: neetprep },
        { name: "Paid directly to Centre", value: centre },
      ],
      methodData: mData
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

  const PIE_COLORS = ["#7c3aed", "#f59e0b"];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Payment Distribution
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Initial Payment Receiver
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={80}
                outerRadius={110}
                dataKey="value"
                paddingAngle={5}
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={PIE_COLORS[index]} />
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

        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Payment Methods Used
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={methodData} layout="vertical" margin={{ left: 0, right: 20 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} />
              <Tooltip 
                formatter={(value) => [`₹${value.toLocaleString()}`, "Amount"]}
                cursor={{fill: '#f3f4f6'}}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="value" fill="#10b981" radius={[0, 6, 6, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Methods Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Payment Methods Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Method</th>
                <th className="p-4 font-medium text-right">Total Processed (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {methodData.map((m) => (
                <tr key={m.name} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-medium text-gray-800">{m.name}</td>
                  <td className="p-4 text-right font-semibold text-green-600">
                    ₹{m.value.toLocaleString()}
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