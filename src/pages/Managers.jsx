import { useEffect, useState } from "react";
import { fetchSheetData } from "../services/sheetApi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Managers() {
  const [managers, setManagers] = useState([]);

  useEffect(() => {
    async function loadData() {
      const rows = await fetchSheetData();

      const processed = rows.slice(1).map((row) => ({
        manager: row[21],            // Column V
        revenue: Number(row[20]),    // Column U (Neetprep Share)
      }));

      // 🔹 Group by manager
      const managerMap = {};

      processed.forEach((d) => {
        if (!d.manager) return;

        if (!managerMap[d.manager]) {
          managerMap[d.manager] = 0;
        }

        managerMap[d.manager] += d.revenue || 0;
      });

      // 🔹 Convert to array + sort
      const managerData = Object.keys(managerMap)
        .map((name) => ({
          name,
          revenue: managerMap[name],
        }))
        .sort((a, b) => b.revenue - a.revenue);

      setManagers(managerData);
    }

    loadData();
  }, []);

  return (
    <>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Manager Performance
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 🔹 Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">
            Revenue by Manager
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={managers}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#7c3aed" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 🔹 Leaderboard */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">
            Top Managers
          </h2>

          <div className="space-y-3">
            {managers.map((m, index) => (
              <div
                key={m.name}
                className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-500">
                    #{index + 1}
                  </span>
                  <span className="font-medium text-gray-800">
                    {m.name}
                  </span>
                </div>

                <span className="font-semibold text-purple-600">
                  ₹{m.revenue.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}