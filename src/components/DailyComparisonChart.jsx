import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function DailyComparisonChart({ dailyData, currentMonthName, prevMonthName }) {
  return (
    <div className="w-full h-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Daily Revenue Trend
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Comparing {currentMonthName} vs {prevMonthName} (Month-over-Month)
          </p>
        </div>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={dailyData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorCurrentRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorLastRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />

            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
              dy={15}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '16px', 
                border: '1px solid rgba(255,255,255,0.4)', 
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', 
                background: 'rgba(255, 255, 255, 0.8)', 
                backdropFilter: 'blur(12px)',
                padding: '12px 16px'
              }}
              itemStyle={{ color: '#1e293b', fontWeight: 600 }}
              labelStyle={{ color: '#64748b', marginBottom: '4px', fontSize: '13px' }}
              formatter={(value, name) => [
                `₹${value.toLocaleString()}`, 
                name === 'currentRevenue' ? currentMonthName : prevMonthName
              ]}
              labelFormatter={(label) => `Day ${label}`}
            />

            <Area
              type="monotone"
              dataKey="lastRevenue"
              name="lastRevenue"
              stroke="#f59e0b"
              strokeWidth={3}
              strokeDasharray="5 5"
              fill="url(#colorLastRev)"
              activeDot={{ r: 5, strokeWidth: 3, stroke: '#fff', fill: '#f59e0b' }}
            />

            <Area
              type="monotone"
              dataKey="currentRevenue"
              name="currentRevenue"
              stroke="#8b5cf6"
              strokeWidth={4}
              fill="url(#colorCurrentRev)"
              activeDot={{ r: 6, strokeWidth: 4, stroke: '#fff', fill: '#8b5cf6', className: "shadow-lg" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
