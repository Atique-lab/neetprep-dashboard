import { useEffect, useState } from "react";
import { fetchSheetData } from "../services/sheetApi";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Revenue() {
  const [data, setData] = useState({
    neetprep: 0,
    centre: 0,
    profit: 0,
  });

  useEffect(() => {
    async function loadData() {
      const rows = await fetchSheetData();

      const processed = rows.slice(1).map((row) => ({
        centre: Number(row[17]),   // Column R
        neetprep: Number(row[20]), // Column U
      }));

      const totalCentre = processed.reduce(
        (sum, d) => sum + (d.centre || 0),
        0
      );

      const totalNeetprep = processed.reduce(
        (sum, d) => sum + (d.neetprep || 0),
        0
      );

      setData({
        neetprep: totalNeetprep,
        centre: totalCentre,
        profit: totalNeetprep,
      });
    }

    loadData();
  }, []);

  const chartData = [
    { name: "Neetprep", value: data.neetprep },
    { name: "Centre", value: data.centre },
  ];

  const COLORS = ["#7c3aed", "#06b6d4"];

  return (
    <>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Revenue Analytics
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Donut Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">
            Revenue Split
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={80}
                outerRadius={110}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Profit Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border flex flex-col justify-center">
          <h2 className="text-gray-500">Total Profit</h2>
          <p className="text-3xl font-bold text-green-600 mt-2">
            ₹{data.profit.toLocaleString()}
          </p>
        </div>

      </div>
    </>
  );
}