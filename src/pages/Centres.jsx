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
import { AlertCircle, Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Download, Users } from "lucide-react";
import { exportToCSV } from "../utils/exportToCSV";
import { Link } from "react-router-dom";

export default function Centres() {
  const { filteredData, extraData, loading, error } = useDashboardData();
  const { newCentreShare, lastSession } = extraData || {};

  const [showAllCentres, setShowAllCentres] = useState(false);

  const parseNumber = (val) => {
    if (!val) return 0;
    if (typeof val === "number") return val;
    return Number(val.replace(/,/g, "")) || 0;
  };

  const lastYearStudentsMap = useMemo(() => {
    const map = {};
    if (lastSession && lastSession.length > 1) {
        lastSession.slice(1).forEach(row => {
            let name = row[6]?.trim(); // Center name in Last Session is at index 6
            if (name) name = name.replace(/\s+/g, ' ').trim();
            const count = parseInt(row[4], 10) || 0; // Email is at index 4, but we want unique students. Wait, here we just want total count of records per centre in last session! So just increment it.
            if (name) map[name] = (map[name] || 0) + 1;
        });
    }
    return map;
  }, [lastSession]);

  const newShareMap = useMemo(() => {
    const map = {};
    if (newCentreShare && newCentreShare.length > 1) {
        newCentreShare.slice(1).forEach(row => {
            let name = row[0]?.trim();
            if (name) name = name.replace(/\s+/g, ' ').trim();
            // Assuming we use External Share for the "Share %" display by default
            const shareStr = row[1] || "0";
            const share = parseFloat(shareStr.replace('%', '')) / 100 || 0;
            if (name) map[name] = share;
        });
    }
    return map;
  }, [newCentreShare]);

  const { centres, kpi } = useMemo(() => {
    if (!filteredData || filteredData.length <= 1) return { centres: [], kpi: {} };

    const processed = filteredData.slice(1).map((row) => ({
      centre: row[6] || "Unknown",
      revenue: parseNumber(row[11]),
      internalExternal: row[12],
      centreShare: parseNumber(row[17]),
      neetprepShare: parseNumber(row[20]),
    })).filter(row => row.centre !== "Unknown");

    const centreMap = {};

    processed.forEach((d) => {
      let name = d.centre.trim();
      if (name) name = name.replace(/\s+/g, ' ').trim();
      if (!name) return;

      if (!centreMap[name]) {
        centreMap[name] = {
          name,
          revenue: 0,
          students: 0,
          internal: 0,
          external: 0,
          neetprepShare: 0,
          centreShare: 0,
        };
      }

      centreMap[name].revenue += d.revenue;
      centreMap[name].students += 1;
      centreMap[name].neetprepShare += d.neetprepShare;
      centreMap[name].centreShare += d.centreShare;

      if (d.internalExternal?.toLowerCase()?.includes("internal")) {
        centreMap[name].internal += 1;
      } else if (d.internalExternal?.toLowerCase()?.includes("external")) {
        centreMap[name].external += 1;
      }
    });

    let allCentresKeys = Object.keys(centreMap);
    if (showAllCentres) {
        allCentresKeys = Array.from(new Set([...allCentresKeys, ...Object.keys(newShareMap)]));
    }

    const centreData = allCentresKeys.map(name => {
      const data = centreMap[name] || {
          name, revenue: 0, students: 0, internal: 0, external: 0, neetprepShare: 0, centreShare: 0
      };
      data.sharePercent = newShareMap[name] || 0;
      data.lastYearStudents = lastYearStudentsMap[name] || 0;
      data.studentGrowth = data.lastYearStudents > 0 ? ((data.students - data.lastYearStudents) / data.lastYearStudents) * 100 : 0;
      return data;
    }).sort((a, b) => b.revenue - a.revenue);

    const activeCentres = centreData.filter(c => c.revenue > 0);
    // User requested KPI Total to be the total number of centres in New Centres Share
    const total = Object.keys(newShareMap).length || activeCentres.length;
    const top = activeCentres[0]?.name || "-";
    const topRevenue = activeCentres[0]?.revenue || 0;
    const totalRevenue = activeCentres.reduce((sum, c) => sum + c.revenue, 0);
    const avg = total > 0 ? totalRevenue / total : 0;

    return { centres: centreData, kpi: { total, top, topRevenue, avg } };
  }, [filteredData, showAllCentres, lastYearStudentsMap, newShareMap]);

  // Interactivity States
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "revenue", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const searchedData = useMemo(() => {
    if (!searchQuery) return centres;
    return centres.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [centres, searchQuery]);

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
  }, [searchQuery, sortConfig, showAllCentres]);

  const renderSortIcon = (key) => {
    if (sortConfig?.key !== key) return null;
    return sortConfig.direction === "asc" ? <ChevronUp size={14} className="inline ml-1" /> : <ChevronDown size={14} className="inline ml-1" />;
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-red-500 glass rounded-3xl m-2">
        <AlertCircle size={64} className="mb-4 opacity-80" />
        <h2 className="text-2xl font-semibold mb-2">Failed to load data</h2>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-200/50 rounded-lg w-1/4 mb-6"></div>
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass rounded-[2rem] h-32 w-full"></div>
          ))}
        </div>
        <div className="glass rounded-[2rem] h-[400px] w-full"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
          Centres Analytics
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Monitor your centre performances, shares, and growth.
        </p>
      </div>

      {/* 🔹 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="glass p-6 rounded-[2rem] hover:-translate-y-1 transition-transform duration-300">
          <p className="text-slate-500 text-sm font-medium mb-1">Total Centres</p>
          <h2 className="text-3xl font-bold text-slate-800">{kpi.total}</h2>
        </div>
        <div className="glass p-6 rounded-[2rem] hover:-translate-y-1 transition-transform duration-300">
          <p className="text-slate-500 text-sm font-medium mb-1">Top Centre</p>
          <h2 className="text-sm font-semibold text-purple-600 truncate" title={kpi.top}>{kpi.top}</h2>
        </div>
        <div className="glass p-6 rounded-[2rem] hover:-translate-y-1 transition-transform duration-300">
          <p className="text-slate-500 text-sm font-medium mb-1">Top Revenue</p>
          <h2 className="text-3xl font-bold text-green-600">₹{kpi.topRevenue.toLocaleString()}</h2>
        </div>
        <div className="glass p-6 rounded-[2rem] hover:-translate-y-1 transition-transform duration-300">
          <p className="text-slate-500 text-sm font-medium mb-1">Avg Revenue</p>
          <h2 className="text-3xl font-bold text-blue-600">₹{Math.round(kpi.avg).toLocaleString()}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6">
        {/* 🔹 Chart */}
        <div className="glass p-6 md:p-8 rounded-[2rem]">
          <h2 className="text-lg font-bold mb-4 text-slate-800">Top 5 Centres Revenue</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={centres.filter(c => c.revenue > 0).slice(0, 5)} layout="vertical" margin={{ left: 0, right: 20 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={150} tick={{fontSize: 12, fill: '#64748b', fontWeight: 500}} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.4)', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)'}}
                itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                formatter={(value) => [`₹${value.toLocaleString()}`, "Revenue"]} cursor={{fill: 'rgba(139, 92, 246, 0.05)'}} 
              />
              <Bar dataKey="revenue" fill="#8b5cf6" radius={[0, 6, 6, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 🔹 Detailed Table with Interactivity */}
      <div className="glass rounded-[2rem] overflow-hidden border-none shadow-sm">
        
        {/* Header & Search */}
        <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-xl font-bold text-slate-800">
            Detailed Performance
          </h2>
          <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowAllCentres(!showAllCentres)}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition font-medium ${showAllCentres ? 'bg-purple-100 text-purple-700' : 'bg-white/50 hover:bg-white text-slate-600'}`}
            >
              <Users size={16} /> 
              <span className="whitespace-nowrap">{showAllCentres ? 'Showing All Centres' : 'Show All Centres'}</span>
            </button>
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Search centres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-shadow bg-white/60 placeholder:text-slate-400"
              />
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            </div>
            <button
              onClick={() => exportToCSV(sortedData, "centres_data")}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition shadow-md whitespace-nowrap"
            >
              <Download size={16} /> <span className="hidden md:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto px-4 md:px-8 pb-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 text-xs uppercase tracking-wider select-none border-b border-white/20">
                <th className="p-4 font-semibold cursor-pointer hover:text-purple-600 transition" onClick={() => requestSort('name')}>
                  Centre Name {renderSortIcon('name')}
                </th>
                <th className="p-4 font-semibold text-right cursor-pointer hover:text-purple-600 transition" onClick={() => requestSort('external')}>
                  Ext Students {renderSortIcon('external')}
                </th>
                <th className="p-4 font-semibold text-right cursor-pointer hover:text-purple-600 transition" onClick={() => requestSort('internal')}>
                  Int Students {renderSortIcon('internal')}
                </th>
                <th className="p-4 font-semibold text-right cursor-pointer hover:text-purple-600 transition" onClick={() => requestSort('revenue')}>
                  Total Revenue {renderSortIcon('revenue')}
                </th>
                <th className="p-4 font-semibold text-right text-purple-600 cursor-pointer hover:text-purple-800 transition" onClick={() => requestSort('neetprepShare')}>
                  Neetprep Share {renderSortIcon('neetprepShare')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20">
              {paginatedData.length > 0 ? paginatedData.map((c) => (
                <tr key={c.name} className="hover:bg-white/40 transition">
                  <td className="p-4 font-medium text-slate-800">
                    <Link to={`/centres/${encodeURIComponent(c.name)}`} className="text-blue-600 hover:text-blue-800 font-semibold hover:underline">
                      {c.name}
                    </Link>
                  </td>
                  <td className="p-4 text-right text-slate-600">{c.external || 0}</td>
                  <td className="p-4 text-right text-slate-600">{c.internal || 0}</td>
                  <td className="p-4 text-right font-semibold text-slate-800">
                    ₹{c.revenue.toLocaleString()}
                  </td>
                  <td className="p-4 text-right font-bold text-purple-600">
                    ₹{c.neetprepShare.toLocaleString()}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">
                    No centres found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 md:p-8 pt-4 flex items-center justify-between text-sm text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-700">{sortedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="font-semibold text-slate-700">{Math.min(currentPage * itemsPerPage, sortedData.length)}</span> of <span className="font-semibold text-slate-700">{sortedData.length}</span> results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 glass rounded-xl hover:bg-white/60 disabled:opacity-50 disabled:hover:bg-transparent transition"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 glass rounded-xl hover:bg-white/60 disabled:opacity-50 disabled:hover:bg-transparent transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}