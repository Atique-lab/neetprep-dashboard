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

export default function Centres() {
  const [centres, setCentres] = useState([]);

  useEffect(() => {
    async function loadData() {
      const rows = await fetchSheetData();

      const processed = rows.slice(1).map((row) => ({
        centre: row[6],             // Column G (Centre Name)
        revenue: Number(row[11]),   // Column U (Neetprep Share)
      }));

      // 🔹 Group by centre
      const centreMap = {};

      processed.forEach((d) => {
        if (!d.centre) return;

        if (!centreMap[d.centre]) {
          centreMap[d.centre] = 0;
        }

        centreMap[d.centre] += d.revenue || 0;
      });

      // 🔹 Convert + sort
      const centreData = Object.keys(centreMap)
        .map((name) => ({
          name,
          revenue: centreMap[name],
        }))
        .sort((a, b) => b.revenue - a.revenue);

      setCentres(centreData);
    }

    loadData();
  }, []);

  return (
    <>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Centres Performance
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 🔹 Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">
            Revenue by Centre
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={centres.slice(0, 8)}>
              <XAxis dataKey="name" hide />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#06b6d4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 🔹 Leaderboard */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">
            Top Centres
          </h2>

          <div className="space-y-3 max-h-[300px] overflow-y-auto">
  {centres.map((c) => (
    <div
      key={c.name}
      className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-xl"
    >
      <span className="font-medium text-gray-800">
        {c.name}
      </span>

      <span className="font-semibold text-blue-600">
        ₹{c.revenue.toLocaleString()}
      </span>
    </div>
  ))}
</div>
        </div>

      </div>
    </>
  );
}