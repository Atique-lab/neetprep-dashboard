import { useState, useMemo, useEffect } from "react";
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
import { AlertCircle, Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Download } from "lucide-react";

export default function Courses() {
  const { filteredData, loading, error } = useDashboardData();

  const parseNumber = (val) => {
    if (!val) return 0;
    if (typeof val === "number") return val;
    return Number(val.replace(/,/g, "")) || 0;
  };

  const { courses, kpi } = useMemo(() => {
    if (!filteredData || filteredData.length <= 1) return { courses: [], kpi: {} };

    const processed = filteredData.slice(1).map((row) => ({
      course: row[7] || "Unknown",
      revenue: parseNumber(row[20]), // Neetprep Share
      totalAmount: parseNumber(row[11]), // Total amount received
    })).filter(row => row.course !== "Unknown");

    const courseMap = {};

    processed.forEach((d) => {
      const name = d.course.trim();
      if (!name) return;

      if (!courseMap[name]) {
        courseMap[name] = {
          name,
          revenue: 0,
          totalAmount: 0,
          students: 0,
        };
      }

      courseMap[name].revenue += d.revenue;
      courseMap[name].totalAmount += d.totalAmount;
      courseMap[name].students += 1;
    });

    const courseData = Object.values(courseMap).map(c => ({
      ...c,
      avgPerStudent: c.students > 0 ? c.revenue / c.students : 0
    })).sort((a, b) => b.revenue - a.revenue);

    const totalCourses = courseData.length;
    const topCourse = courseData[0]?.name || "-";
    const topRevenue = courseData[0]?.revenue || 0;
    const totalRevenue = courseData.reduce((sum, c) => sum + c.revenue, 0);
    const avgRevenue = totalCourses > 0 ? totalRevenue / totalCourses : 0;

    return { courses: courseData, kpi: { totalCourses, topCourse, topRevenue, avgRevenue } };
  }, [filteredData]);

  // Interactivity States
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "revenue", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const searchedData = useMemo(() => {
    if (!searchQuery) return courses;
    return courses.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [courses, searchQuery]);

  const sortedData = useMemo(() => {
    const sortableItems = [...searchedData];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (typeof aValue === 'string') {
           aValue = aValue.toLowerCase();
           bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [searchedData, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage]);

  const requestSort = (key) => {
    let direction = "desc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortConfig]);

  const renderSortIcon = (key) => {
    if (sortConfig?.key !== key) return null;
    return sortConfig.direction === "asc" ? <ChevronUp size={14} className="inline ml-1" /> : <ChevronDown size={14} className="inline ml-1" />;
  };

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
        <div className="mt-6 bg-gray-100 rounded-2xl h-[400px] w-full"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Course Analytics
      </h1>

      {/* 🔹 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
          <p className="text-gray-500 text-sm mb-1">Total Courses</p>
          <h2 className="text-2xl font-bold text-gray-800">{kpi.totalCourses}</h2>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
          <p className="text-gray-500 text-sm mb-1">Top Course</p>
          <h2 className="text-sm font-semibold text-purple-600 truncate" title={kpi.top}>{kpi.top}</h2>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
          <p className="text-gray-500 text-sm mb-1">Top Neetprep Revenue</p>
          <h2 className="text-2xl font-bold text-green-600">₹{kpi.topRevenue.toLocaleString()}</h2>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
          <p className="text-gray-500 text-sm mb-1">Avg Revenue per Course</p>
          <h2 className="text-2xl font-bold text-blue-600">₹{Math.round(kpi.avgRevenue).toLocaleString()}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6">
        {/* 🔹 Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Top Courses by Neetprep Share</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={courses.slice(0, 5)} layout="vertical" margin={{ left: 0, right: 20 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={150} tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, "Revenue"]} cursor={{fill: '#f3f4f6'}} />
              <Bar dataKey="revenue" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 🔹 Detailed Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Header & Search */}
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-800">Detailed Course Breakdown</h2>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow bg-gray-50 focus:bg-white"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            <button
              onClick={() => exportToCSV(sortedData, "courses_data")}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition whitespace-nowrap"
            >
              <Download size={16} /> <span className="hidden md:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider select-none">
                <th className="p-4 font-medium cursor-pointer hover:bg-gray-100 transition" onClick={() => requestSort('name')}>
                  Course Name {renderSortIcon('name')}
                </th>
                <th className="p-4 font-medium text-right cursor-pointer hover:bg-gray-100 transition" onClick={() => requestSort('students')}>
                  Students {renderSortIcon('students')}
                </th>
                <th className="p-4 font-medium text-right cursor-pointer hover:bg-gray-100 transition" onClick={() => requestSort('totalAmount')}>
                  Total Gross Revenue {renderSortIcon('totalAmount')}
                </th>
                <th className="p-4 font-medium text-right text-indigo-600 cursor-pointer hover:bg-gray-100 transition" onClick={() => requestSort('revenue')}>
                  Neetprep Share {renderSortIcon('revenue')}
                </th>
                <th className="p-4 font-medium text-right text-green-600 cursor-pointer hover:bg-gray-100 transition" onClick={() => requestSort('avgPerStudent')}>
                  Avg Neetprep / Student {renderSortIcon('avgPerStudent')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedData.length > 0 ? paginatedData.map((c) => (
                <tr key={c.name} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-medium text-gray-800">{c.name}</td>
                  <td className="p-4 text-right">{c.students}</td>
                  <td className="p-4 text-right font-medium text-gray-600">
                    ₹{c.totalAmount.toLocaleString()}
                  </td>
                  <td className="p-4 text-right font-semibold text-indigo-600">
                    ₹{c.revenue.toLocaleString()}
                  </td>
                  <td className="p-4 text-right font-medium text-green-600">
                    ₹{Math.round(c.avgPerStudent).toLocaleString()}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No courses found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
          <div>
            Showing <span className="font-medium text-gray-900">{sortedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="font-medium text-gray-900">{Math.min(currentPage * itemsPerPage, sortedData.length)}</span> of <span className="font-medium text-gray-900">{sortedData.length}</span> results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}