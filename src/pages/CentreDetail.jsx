import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useDashboardData } from "../hooks/useDashboardData";
import { AlertCircle, ArrowLeft, Users, Wallet, CreditCard } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function CentreDetail() {
  const { id } = useParams();
  const decodedName = decodeURIComponent(id);
  const { filteredData, loading, error } = useDashboardData();

  const parseNumber = (val) => {
    if (!val) return 0;
    if (typeof val === "number") return val;
    return Number(val.replace(/,/g, "")) || 0;
  };

  const centreData = useMemo(() => {
    if (!filteredData || filteredData.length <= 1) return null;

    const rows = filteredData.slice(1).filter(row => row[6]?.trim() === decodedName);
    
    if (rows.length === 0) return { notFound: true };

    let totalGross = 0;
    let neetprepShare = 0;
    let centreShare = 0;
    let internal = 0;
    let external = 0;
    const studentsList = [];
    const dailyDataMap = {};

    rows.forEach(row => {
      const gross = parseNumber(row[11]);
      const nShare = parseNumber(row[20]);
      const cShare = parseNumber(row[17]);
      const intExt = row[12] || "";
      const dateStr = row[1];

      totalGross += gross;
      neetprepShare += nShare;
      centreShare += cShare;
      
      if (intExt.toLowerCase().includes("internal")) internal++;
      else if (intExt.toLowerCase().includes("external")) external++;

      studentsList.push({
        date: dateStr || "-",
        name: row[2] || "Unknown",
        course: row[7] || "-",
        amount: gross,
        manager: row[21] || "Unassigned"
      });

      if (dateStr && gross > 0) {
        if (!dailyDataMap[dateStr]) dailyDataMap[dateStr] = { date: dateStr, revenue: 0, count: 0 };
        dailyDataMap[dateStr].revenue += gross;
        dailyDataMap[dateStr].count += 1;
      }
    });

    const dailyRevenue = Object.values(dailyDataMap).sort((a,b) => {
      const dA = new Date(`${a.date} 2026`);
      const dB = new Date(`${b.date} 2026`);
      return dA - dB;
    });

    return {
      name: decodedName,
      totalGross,
      neetprepShare,
      centreShare,
      internal,
      external,
      dailyRevenue,
      studentsCount: studentsList.length,
      students: studentsList.sort((a, b) => b.amount - a.amount)
    };
  }, [filteredData, decodedName]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-red-500 glass rounded-3xl m-2">
        <AlertCircle size={64} className="mb-4 opacity-80" />
        <h2 className="text-2xl font-semibold mb-2">Failed to load data</h2>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (loading || !centreData) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-200/50 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass rounded-[2rem] h-32 w-full"></div>
          ))}
        </div>
        <div className="glass rounded-[2rem] h-64 w-full"></div>
      </div>
    );
  }

  if (centreData.notFound) {
    return (
      <div className="text-center mt-20 glass p-10 rounded-3xl max-w-md mx-auto">
        <h2 className="text-2xl font-semibold text-slate-800">Centre Not Found</h2>
        <p className="text-slate-500 mt-2">Could not find any data for "{decodedName}".</p>
        <Link to="/centres" className="text-purple-600 font-medium mt-6 inline-block hover:underline">
          &larr; Back to Centres
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      <Link to="/centres" className="text-slate-500 hover:text-purple-600 flex items-center gap-2 mb-6 w-fit transition font-medium">
        <ArrowLeft size={16} /> Back to Centres
      </Link>
      
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">{centreData.name}</h1>
        <p className="text-slate-500">Detailed Centre Breakdown & Revenue</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="glass p-6 rounded-[2rem] hover:-translate-y-1 transition-transform duration-300">
          <p className="text-slate-500 text-sm font-medium mb-2 flex items-center gap-2"><CreditCard size={14} /> Gross Revenue</p>
          <h2 className="text-3xl font-bold text-slate-800">₹{centreData.totalGross.toLocaleString()}</h2>
        </div>
        <div className="glass p-6 rounded-[2rem] hover:-translate-y-1 transition-transform duration-300">
          <p className="text-purple-500 text-sm font-medium mb-2 flex items-center gap-2"><Wallet size={14} /> Neetprep Share</p>
          <h2 className="text-3xl font-bold text-purple-600">₹{centreData.neetprepShare.toLocaleString()}</h2>
        </div>
        <div className="glass p-6 rounded-[2rem] hover:-translate-y-1 transition-transform duration-300">
          <p className="text-blue-500 text-sm font-medium mb-2 flex items-center gap-2"><Wallet size={14} /> Centre Share</p>
          <h2 className="text-3xl font-bold text-blue-600">₹{centreData.centreShare.toLocaleString()}</h2>
        </div>
        <div className="glass p-6 rounded-[2rem] hover:-translate-y-1 transition-transform duration-300">
          <p className="text-orange-500 text-sm font-medium mb-2 flex items-center gap-2"><Users size={14} /> Total Students</p>
          <h2 className="text-3xl font-bold text-orange-600">{centreData.studentsCount} <span className="text-xs font-normal text-slate-400">({centreData.internal} Int / {centreData.external} Ext)</span></h2>
        </div>
      </div>

      {/* Revenue Chart */}
      {centreData.dailyRevenue.length > 0 && (
        <div className="glass p-6 md:p-8 rounded-[2rem] mb-8">
          <h2 className="text-xl font-bold mb-6 text-slate-800">Revenue Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={centreData.dailyRevenue} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} axisLine={false} tickLine={false} />
              <YAxis tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} axisLine={false} tickLine={false} />
              <Tooltip 
                 contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.4)', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)'}}
                 itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                 formatter={(value) => [`₹${value.toLocaleString()}`, "Revenue"]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Students List */}
      <div className="glass rounded-[2rem] overflow-hidden border-none shadow-sm">
        <div className="p-6 md:p-8 border-b border-white/20">
          <h2 className="text-xl font-bold text-slate-800">Students at {centreData.name}</h2>
        </div>
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto px-4 md:px-8 pb-4">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50/80 backdrop-blur-md z-10 shadow-sm rounded-xl">
              <tr className="text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Student Name</th>
                <th className="p-4 font-semibold">Course</th>
                <th className="p-4 font-semibold">Assigned Manager</th>
                <th className="p-4 font-semibold text-right text-slate-800">Gross Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20">
              {centreData.students.map((s, idx) => (
                <tr key={idx} className="hover:bg-white/40 transition">
                  <td className="p-4 text-slate-500 text-sm whitespace-nowrap">{s.date}</td>
                  <td className="p-4 font-medium text-slate-800">{s.name}</td>
                  <td className="p-4 text-slate-600 text-sm max-w-xs truncate" title={s.course}>{s.course}</td>
                  <td className="p-4 text-slate-600 text-sm">
                    {s.manager !== "Unassigned" ? (
                      <Link to={`/managers/${encodeURIComponent(s.manager)}`} className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
                        {s.manager}
                      </Link>
                    ) : (
                      <span className="text-slate-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="p-4 text-right font-bold text-slate-800">
                    ₹{s.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
