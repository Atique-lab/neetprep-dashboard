import { useEffect, useState } from "react";
import { fetchSheetData } from "../services/sheetApi";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Payments() {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function loadData() {
      const rows = await fetchSheetData();

      const processed = rows.slice(1).map((row) => ({
        paymentTo: row[13],        // Column N
        amount: Number(row[11]),   // Column L (Total Amount)
      }));

      let neetprep = 0;
      let centre = 0;

      processed.forEach((d) => {
        if (!d.paymentTo) return;

        const value = d.paymentTo.toLowerCase();

        if (value.includes("neetprep")) {
          neetprep += d.amount || 0;
        } else if (value.includes("centre") || value.includes("center")) {
          centre += d.amount || 0;
        }
      });

      setData([
        { name: "Neetprep", value: neetprep },
        { name: "Centre", value: centre },
      ]);
    }

    loadData();
  }, []);

  const COLORS = ["#7c3aed", "#06b6d4"];

  return (
    <>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Payment Distribution
      </h1>

      <div className="bg-white p-6 rounded-2xl shadow-sm border">

        <h2 className="text-lg font-semibold mb-4">
          Payment To (Neetprep vs Centre)
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              innerRadius={80}
              outerRadius={110}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

      </div>
    </>
  );
}