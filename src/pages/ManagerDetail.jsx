import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useDashboardData } from "../hooks/useDashboardData";
import { AlertCircle, ArrowLeft, Users, Building, Wallet } from "lucide-react";

export default function ManagerDetail() {
  const { id } = useParams();
  const decodedName = decodeURIComponent(id);
  const { filteredData, loading, error } = useDashboardData();

  const parseNumber = (val) => {
    if (!val) return 0;
    if (typeof val === "number") return val;
    return Number(val.replace(/,/g, "")) || 0;
  };

  const managerData = useMemo(() => {
    if (!filteredData || filteredData.length <= 1) return null;

    const rows = filteredData.slice(1).filter(row => row[21]?.trim() === decodedName);
    
    if (rows.length === 0) return { notFound: true };

    let totalRevenue = 0;
    const centresSet = new Set();
    const studentsList = [];

    rows.forEach(row => {
      const rev = parseNumber(row[20]);
      totalRevenue += rev;
      
      const centreName = row[6] || "Unknown";
      centresSet.add(centreName);
      
      studentsList.push({
        date: row[1] || "-",
        name: row[2] || "Unknown",
        course: row[7] || "-",
        centre: centreName,
        amount: rev,
      });
    });

    return {
      name: decodedName,
      totalRevenue,
      studentsCount: studentsList.length,
      centresCount: centresSet.size,
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

  if (loading || !managerData) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-24 w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  if (managerData.notFound) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-2xl font-semibold text-gray-800">Manager Not Found</h2>
        <p className="text-gray-500 mt-2">Could not find any data for "{decodedName}".</p>
        <Link to="/managers" className="text-purple-600 mt-4 inline-block hover:underline">
          &larr; Back to Managers
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link to="/managers" className="text-gray-500 hover:text-gray-800 flex items-center gap-2 mb-6 w-fit transition">
        <ArrowLeft size={16} /> Back to Managers
      </Link>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{managerData.name}</h1>
      <p className="text-gray-500 mb-8">Manager Performance Overview</p>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-xl"><Wallet size={24} /></div>
          <div>
            <p className="text-gray-500 text-sm mb-1">Generated Revenue</p>
            <h2 className="text-2xl font-bold text-gray-900">₹{managerData.totalRevenue.toLocaleString()}</h2>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl"><Users size={24} /></div>
          <div>
            <p className="text-gray-500 text-sm mb-1">Total Students</p>
            <h2 className="text-2xl font-bold text-gray-900">{managerData.studentsCount}</h2>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-orange-50 text-orange-600 rounded-xl"><Building size={24} /></div>
          <div>
            <p className="text-gray-500 text-sm mb-1">Centres Managed</p>
            <h2 className="text-2xl font-bold text-gray-900">{managerData.centresCount}</h2>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Students Managed by {managerData.name}</h2>
        </div>
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm">
              <tr className="text-gray-500 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Student Name</th>
                <th className="p-4 font-medium">Course</th>
                <th className="p-4 font-medium">Centre</th>
                <th className="p-4 font-medium text-right text-purple-600">Neetprep Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {managerData.students.map((s, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition">
                  <td className="p-4 text-gray-500 text-sm whitespace-nowrap">{s.date}</td>
                  <td className="p-4 font-medium text-gray-800">{s.name}</td>
                  <td className="p-4 text-gray-600 text-sm">{s.course}</td>
                  <td className="p-4 text-gray-600 text-sm">
                    <Link to={`/centres/${encodeURIComponent(s.centre)}`} className="text-blue-600 hover:underline">
                      {s.centre}
                    </Link>
                  </td>
                  <td className="p-4 text-right font-semibold text-purple-600">
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
