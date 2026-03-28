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

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [kpi, setKpi] = useState({
    totalCourses: 0,
    topCourse: "",
    topRevenue: 0,
    avgRevenue: 0,
  });

  useEffect(() => {
    async function loadData() {
      const rows = await fetchSheetData();

      const processed = rows.slice(1).map((row) => ({
        course: row[7],              // Column H
        revenue: Number(row[20]),    // Column U (Neetprep Share)
      }));

      // 🔹 Group by course
      const courseMap = {};

      processed.forEach((d) => {
        if (!d.course) return;

        if (!courseMap[d.course]) {
          courseMap[d.course] = 0;
        }

        courseMap[d.course] += d.revenue || 0;
      });

      // 🔹 Convert + sort
      const courseData = Object.keys(courseMap)
        .map((name) => ({
          name,
          revenue: courseMap[name],
        }))
        .sort((a, b) => b.revenue - a.revenue);

      // 🔹 KPIs
      const totalCourses = courseData.length;
      const topCourse = courseData[0]?.name || "-";
      const topRevenue = courseData[0]?.revenue || 0;

      const totalRevenue = courseData.reduce(
        (sum, c) => sum + c.revenue,
        0
      );

      const avgRevenue =
        totalCourses > 0 ? totalRevenue / totalCourses : 0;

      setCourses(courseData);
      setKpi({
        totalCourses,
        topCourse,
        topRevenue,
        avgRevenue,
      });
    }

    loadData();
  }, []);

  return (
    <>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Course Analytics
      </h1>

      {/* 🔹 KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow border">
          <p className="text-gray-500 text-sm">Total Courses</p>
          <h2 className="text-xl font-bold">{kpi.totalCourses}</h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow border">
          <p className="text-gray-500 text-sm">Top Course</p>
          <h2 className="text-sm font-semibold">{kpi.topCourse}</h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow border">
          <p className="text-gray-500 text-sm">Top Revenue</p>
          <h2 className="text-xl font-bold text-green-600">
            ₹{kpi.topRevenue.toLocaleString()}
          </h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow border">
          <p className="text-gray-500 text-sm">Avg Revenue</p>
          <h2 className="text-xl font-bold text-blue-600">
            ₹{Math.round(kpi.avgRevenue).toLocaleString()}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 🔹 Chart */}
        <div className="bg-white p-6 rounded-2xl shadow border">
          <h2 className="text-lg font-semibold mb-4">
            Revenue by Course
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={courses.slice(0, 6)}>
              <XAxis dataKey="name" hide />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="revenue"
                fill="#6366f1"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 🔹 Top Courses List */}
        <div className="bg-white p-6 rounded-2xl shadow border">
          <h2 className="text-lg font-semibold mb-4">
            Top Courses
          </h2>

          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {courses.map((c) => (
              <div
                key={c.name}
                className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-xl"
              >
                <span className="text-sm font-medium text-gray-800">
                  {c.name}
                </span>

                <span className="font-semibold text-indigo-600">
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