import { useState, useMemo, useEffect } from "react";
import { useDashboardData } from "../hooks/useDashboardData";
import { exportToCSV } from "../utils/exportToCSV";
import { AlertCircle, Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Phone, Mail, Download, Users, UserCheck, UserPlus } from "lucide-react";
import KPICard from "../components/KPICard";

export default function Students() {
  const { filteredData, loading, error } = useDashboardData();

  const parseNumber = (val) => {
    if (!val) return 0;
    if (typeof val === "number") return val;
    return Number(val.replace(/,/g, "")) || 0;
  };

  const students = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];

    return filteredData.map((d) => ({
      date: d.payment_date || "-",
      name: d.student_name || "Unknown",
      phone: d.phone || "-",
      email: d.email || "-",
      amount: d.revenue || 0,
      centre: d.centre_name || "-",
      course: d.course || "-",
      intExt: d.type || "-",
    })).filter(row => row.name !== "Unknown");
  }, [filteredData]);

  const kpis = useMemo(() => {
    const total = students.length;
    const internal = students.filter(s => s.intExt.toLowerCase().includes("internal")).length;
    const external = students.filter(s => s.intExt.toLowerCase().includes("external")).length;
    return { total, internal, external };
  }, [students]);

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

  const renderSortIcon = (key) => {
    if (sortConfig?.key !== key) return <ChevronUp size={14} className="opacity-20" />;
    return sortConfig.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 text-red-500 glass rounded-3xl">
      <AlertCircle size={48} className="mb-4" />
      <h2 className="text-xl font-semibold">Failed to load students</h2>
      <p>{error}</p>
    </div>
  );

  if (loading) return (
    <div className="animate-pulse space-y-6">
      <div className="h-10 bg-slate-200/50 rounded-xl w-1/4" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => <div key={i} className="glass rounded-3xl h-32" />)}
      </div>
      <div className="glass rounded-3xl h-96 w-full" />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Students Directory</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and view all enrolled student records.</p>
        </div>
        <button
          onClick={() => exportToCSV(students, "neetprep_students_list.csv")}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-purple-200 hover:shadow-purple-300 active:scale-95"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard 
          title="Total Students" 
          value={kpis.total} 
          color="blue" 
          icon={<Users size={20} />} 
        />
        <KPICard 
          title="Internal Students" 
          value={kpis.internal} 
          color="indigo" 
          icon={<UserCheck size={20} />} 
        />
        <KPICard 
          title="External Students" 
          value={kpis.external} 
          color="purple" 
          icon={<UserPlus size={20} />} 
        />
      </div>

      <div className="glass rounded-[2rem] overflow-hidden">
        {/* Table Header / Search */}
        <div className="p-6 border-b border-white/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search by name, email, phone, centre..."
              className="w-full pl-12 pr-4 py-3 bg-white/50 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all text-sm font-medium"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white/30 px-4 py-2 rounded-full border border-white/40">
            {searchedData.length} records found
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-xs uppercase tracking-wider select-none border-b border-white/20">
                <th className="p-4 font-semibold cursor-pointer hover:text-purple-600 transition" onClick={() => requestSort('date')}>
                  Date {renderSortIcon('date')}
                </th>
                <th className="p-4 font-semibold cursor-pointer hover:text-purple-600 transition" onClick={() => requestSort('name')}>
                  Name {renderSortIcon('name')}
                </th>
                <th className="p-4 font-semibold">Contact</th>
                <th className="p-4 font-semibold cursor-pointer hover:text-purple-600 transition" onClick={() => requestSort('centre')}>
                  Centre {renderSortIcon('centre')}
                </th>
                <th className="p-4 font-semibold cursor-pointer hover:text-purple-600 transition" onClick={() => requestSort('intExt')}>
                  Type {renderSortIcon('intExt')}
                </th>
                <th className="p-4 font-semibold text-right cursor-pointer hover:text-purple-600 transition" onClick={() => requestSort('amount')}>
                  Paid {renderSortIcon('amount')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {paginatedData.length > 0 ? paginatedData.map((s, idx) => (
                <tr key={idx} className="hover:bg-white/40 transition">
                  <td className="p-4 text-sm text-slate-500 whitespace-nowrap">{s.date}</td>
                  <td className="p-4">
                    <div className="font-bold text-slate-800">{s.name}</div>
                    <div className="text-[10px] text-slate-400 font-medium uppercase truncate max-w-[150px]">{s.course}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-xs text-slate-600 mb-1">
                      <Phone size={12} className="text-purple-400" /> {s.phone}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Mail size={12} className="text-purple-400" /> {s.email}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-bold px-2.5 py-1 bg-white/60 text-slate-600 rounded-lg border border-white/60">
                      {s.centre}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                      s.intExt.toLowerCase().includes("internal") 
                        ? "bg-indigo-100 text-indigo-700" 
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {s.intExt}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="font-black text-slate-800">₹{s.amount.toLocaleString()}</div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <Search size={48} className="opacity-20" />
                      <p className="font-semibold italic">No students match your search criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 bg-white/30 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Showing {paginatedData.length} of {searchedData.length} students
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-2 glass rounded-xl text-slate-600 disabled:opacity-20 hover:text-purple-600 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = currentPage - 2 + i;
                  if (pageNum + (4 - i) > totalPages) pageNum = totalPages - 4 + i;
                }
                if (pageNum <= 0) return null;
                if (pageNum > totalPages) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                      currentPage === pageNum
                        ? "bg-purple-600 text-white shadow-md shadow-purple-200"
                        : "glass text-slate-500 hover:text-purple-600"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-2 glass rounded-xl text-slate-600 disabled:opacity-20 hover:text-purple-600 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}