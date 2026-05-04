import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function MonthWiseComparisonChart({ monthWiseComparison }) {
  if (!monthWiseComparison || monthWiseComparison.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        No comparison data available
      </div>
    );
  }

  return (
    <div className="w-full h-[400px]">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Month-Wise Improvement</h2>
        <p className="text-sm text-slate-500 mt-1">Comparing Current Session Revenue vs Last Session Revenue</p>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart
          data={monthWiseComparison}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
          <XAxis 
            dataKey="month" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.4)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(12px)',
              padding: '12px 16px'
            }}
            formatter={(value) => [`₹${value.toLocaleString()}`, "Revenue"]}
            labelStyle={{ color: '#1e293b', fontWeight: 600, marginBottom: '8px' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Line 
            type="monotone" 
            dataKey="currentRevenue" 
            name="Current Session (2026)" 
            stroke="#8b5cf6" 
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          <Line 
            type="monotone" 
            dataKey="lastSessionRevenue" 
            name="Last Session (2025)" 
            stroke="#94a3b8" 
            strokeWidth={3}
            strokeDasharray="5 5"
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
