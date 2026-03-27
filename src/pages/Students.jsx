import { useEffect, useState } from "react";
import { fetchSheetData } from "../services/sheetApi";

export default function Students() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadData() {
      const rows = await fetchSheetData();

      const processed = rows.slice(1).map((row) => ({
        date: row[1],
        name: row[2],              // Column C
        centre: row[6],            // Column G
        amount: Number(row[11]),   // Column L
      }));

      setData(processed);
    }

    loadData();
  }, []);

  // 🔍 Filter by search
  const filtered = data.filter((d) =>
    d.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Students Data
      </h1>

      {/* 🔍 Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search student..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm px-4 py-2 border rounded-lg focus:outline-none"
        />
      </div>

      {/* 📋 Table */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">

        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Centre</th>
              <th className="text-right px-4 py-3">Amount</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((d, i) => (
              <tr
                key={i}
                className={`border-t ${
                  d.amount > 10000 ? "bg-green-50" : ""
                }`}
              >

                <td className="px-4 py-3 text-gray-600">
                  {d.date}
                </td>
                
                <td className="px-4 py-3 font-medium text-gray-800">
                  {d.name}
                </td>

                <td className="px-4 py-3 text-gray-600">
                  {d.centre}
                </td>

                <td className="px-4 py-3 text-right font-semibold text-blue-600">
                  ₹{d.amount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </>
  );
}