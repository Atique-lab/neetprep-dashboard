import { useState, useMemo, useEffect } from "react";
import { useDashboardData } from "../hooks/useDashboardData";
import { exportToCSV } from "../utils/exportToCSV";
import { AlertCircle, Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Phone, Mail, Download } from "lucide-react";

export default function Students() {
  const { filteredData, loading, error } = useDashboardData();

  const parseNumber = (val) => {
    if (!val) return 0;
    if (typeof val === "number") return val;
    return Number(val.replace(/,/g, "")) || 0;
  };

  const students = useMemo(() => {
    if (!filteredData || filteredData.length <= 1) return [];

    return filteredData.slice(1).map((row) => ({
      date: row[1] || "-",
      name: row[2] || "Unknown",
      phone: row[3] || "-",
      email: row[4] || "-",
      amount: parseNumber(row[11]),
      centre: row[6] || "-",
      course: row[7] || "-",
      intExt: row[12] || "-",
    })).filter(row => row.name !== "Unknown");
  }, [filteredData]);

  // Interactivity States
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const searchedData = useMemo(() => {
    if (!searchQuery) return students;
    const lowerQuery = searchQuery.toLowerCase();
    return students.filter(s => 
      s.name.toLowerCase().includes(lowerQuery) ||
      s.email.toLowerCase().includes(lowerQuery) ||
      s.phone.includes(lowerQuery) ||
      s.centre.toLowerCase().includes(lowerQuery) ||
      s.course.toLowerCase().includes(lowerQuery)
    );
  }, [students, searchQuery]);

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
        <div className="bg-gray-100 rounded-2xl h-[600px] w-full"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Students Directory
      </h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Header & Search */}
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Enrollment List</h2>
            <p className="text-sm text-gray-500">Total Students: {students.length}</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search by name, email, phone, or centre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow bg-gray-50 focus:bg-white"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            <button
              onClick={() => exportToCSV(sortedData, "students_data")}
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
                <th className="p-4 font-medium cursor-pointer hover:bg-gray-100 transition whitespace-nowrap" onClick={() => requestSort('date')}>
                  Date {renderSortIcon('date')}
                </th>
                <th className="p-4 font-medium cursor-pointer hover:bg-gray-100 transition whitespace-nowrap" onClick={() => requestSort('name')}>
                  Student Info {renderSortIcon('name')}
                </th>
                <th className="p-4 font-medium cursor-pointer hover:bg-gray-100 transition" onClick={() => requestSort('course')}>
                  Course {renderSortIcon('course')}
                </th>
                <th className="p-4 font-medium cursor-pointer hover:bg-gray-100 transition" onClick={() => requestSort('centre')}>
                  Centre {renderSortIcon('centre')}
                </th>
                <th className="p-4 font-medium text-center cursor-pointer hover:bg-gray-100 transition" onClick={() => requestSort('intExt')}>
                  Type {renderSortIcon('intExt')}
                </th>
                <th className="p-4 font-medium text-right cursor-pointer hover:bg-gray-100 transition whitespace-nowrap" onClick={() => requestSort('amount')}>
                  Amount Received {renderSortIcon('amount')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedData.length > 0 ? paginatedData.map((s, index) => (
                <tr key={index} className="hover:bg-gray-50 transition">
                  <td className="p-4 text-gray-600 text-sm whitespace-nowrap">{s.date}</td>
                  
                  <td className="p-4">
                    <div className="font-semibold text-gray-800">{s.name}</div>
                    <div className="flex items-center gap-3 mt-1">
                      {s.phone && s.phone !== "-" && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Phone size={12} /> {s.phone}
                        </span>
                      )}
                      {s.email && s.email !== "-" && (
                        <span className="text-xs text-gray-500 flex items-center gap-1 truncate max-w-[150px]" title={s.email}>
                          <Mail size={12} /> {s.email}
                        </span>
                      )}
                    </div>
                  </td>
                  
                  <td className="p-4 text-gray-600 text-sm max-w-[200px] truncate" title={s.course}>
                    {s.course}
                  </td>
                  
                  <td className="p-4 text-gray-800 font-medium text-sm max-w-[200px] truncate" title={s.centre}>
                    {s.centre}
                  </td>
                  
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      s.intExt.toLowerCase() === 'internal' ? 'bg-blue-100 text-blue-800' : 
                      s.intExt.toLowerCase() === 'external' ? 'bg-orange-100 text-orange-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {s.intExt}
                    </span>
                  </td>
                  
                  <td className="p-4 text-right font-semibold text-green-600">
                    ₹{s.amount.toLocaleString()}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    No students found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
          <div>
            Showing <span className="font-medium text-gray-900">{sortedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="font-medium text-gray-900">{Math.min(currentPage * itemsPerPage, sortedData.length)}</span> of <span className="font-medium text-gray-900">{sortedData.length}</span> students
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="flex items-center px-2 text-gray-500">Page {currentPage} of {totalPages}</span>
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