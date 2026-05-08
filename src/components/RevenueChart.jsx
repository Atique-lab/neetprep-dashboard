import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer
} from 'recharts';
import { useDashboardData } from "../hooks/useDashboardData";

export default function RevenueChart() {
  const { monthlyData } = useDashboardData();

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-8 shadow-sm h-[380px] group transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Revenue Trend</h3>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Monthly session actuals</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Actuals</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Projection</span>
          </div>
        </div>
      </div>

      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlyData} margin={{ left: -20, right: 0, top: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#6366f1" 
              strokeWidth={3} 
              fill="url(#revenueGradient)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-lg font-black text-zinc-900 dark:text-zinc-50 tracking-tight">₹{val.toLocaleString()}</p>
        {payload[0].payload.projectedRevenue && (
          <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Est. Projection</p>
            <p className="font-bold text-zinc-900 dark:text-zinc-50">₹{payload[0].payload.projectedRevenue.toLocaleString()}</p>
          </div>
        )}
      </div>
    );
  }
  return null;
}