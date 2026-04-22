import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useDashboardData } from "../hooks/useDashboardData";
import { AlertCircle, ArrowLeft, Users, Wallet, CreditCard } from "lucide-react";

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

    rows.forEach(row => {
      const gross = parseNumber(row[11]);
      const nShare = parseNumber(row[20]);
      const cShare = parseNumber(row[17]);
      const intExt = row[12] || "";

      totalGross += gross;
      neetprepShare += nShare;
      centreShare += cShare;
      
      if (intExt.toLowerCase().includes("internal")) internal++;
      else if (intExt.toLowerCase().includes("external")) external++;

      studentsList.push({
        date: row[1] || "-",
        name: row[2] || "Unknown",
        course: row[7] || "-",
        amount: gross,
        manager: row[21] || "Unassigned"
      });
    });

    return {
      name: decodedName,
      totalGross,
      neetprepShare,
      centreShare,
      internal,
      external,
      studentsCount: studentsList.length,
      students: studentsList.sort((a, b) => b.amount - a.amount)
    };
  }, [filteredData, decodedName]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <AlertCircle size={48} className="mb-4" />
        <h2 className="text-xl font-semibold">Failed to load data</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (loading || !centreData) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-24 w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  if (centreData.notFound) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-2xl font-semibold text-gray-800">Centre Not Found</h2>
        <p className="text-gray-500 mt-2">Could not find any data for "{decodedName}".</p>
        <Link to="/centres" className="text-purple-600 mt-4 inline-block hover:underline">
          &larr; Back to Centres
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link to="/centres" className="text-gray-500 hover:text-gray-800 flex items-center gap-2 mb-6 w-fit transition">
        <ArrowLeft size={16} /> Back to Centres
      </Link>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{centreData.name}</h1>
      <p className="text-gray-500 mb-8">Detailed Centre Breakdown</p>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-gray-500 text-sm mb-1 flex items-center gap-2"><CreditCard size={14} /> Gross Revenue</p>
          <h2 className="text-2xl font-bold text-gray-900">₹{centreData.totalGross.toLocaleString()}</h2>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-purple-500 text-sm mb-1 flex items-center gap-2"><Wallet size={14} /> Neetprep Share</p>
          <h2 className="text-2xl font-bold text-purple-600">₹{centreData.neetprepShare.toLocaleString()}</h2>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-blue-500 text-sm mb-1 flex items-center gap-2"><Wallet size={14} /> Centre Share</p>
          <h2 className="text-2xl font-bold text-blue-600">₹{centreData.centreShare.toLocaleString()}</h2>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-orange-500 text-sm mb-1 flex items-center gap-2"><Users size={14} /> Total Students</p>
          <h2 className="text-2xl font-bold text-orange-600">{centreData.studentsCount} <span className="text-xs font-normal text-gray-400">({centreData.internal} Int / {centreData.external} Ext)</span></h2>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Students at {centreData.name}</h2>
        </div>
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm">
              <tr className="text-gray-500 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Student Name</th>
                <th className="p-4 font-medium">Course</th>
                <th className="p-4 font-medium">Assigned Manager</th>
                <th className="p-4 font-medium text-right text-gray-900">Gross Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {centreData.students.map((s, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition">
                  <td className="p-4 text-gray-500 text-sm whitespace-nowrap">{s.date}</td>
                  <td className="p-4 font-medium text-gray-800">{s.name}</td>
                  <td className="p-4 text-gray-600 text-sm">{s.course}</td>
                  <td className="p-4 text-gray-600 text-sm">
                    {s.manager !== "Unassigned" ? (
                      <Link to={`/managers/${encodeURIComponent(s.manager)}`} className="text-blue-600 hover:underline">
                        {s.manager}
                      </Link>
                    ) : (
                      <span className="text-gray-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="p-4 text-right font-semibold text-gray-900">
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
