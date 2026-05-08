import { motion } from "framer-motion";

export default function KPICard({ title, value, subtitle, icon, color }) {
  const colorMap = {
    orange: "text-orange-600 bg-orange-50 border-orange-100 dark:bg-orange-500/10 dark:border-orange-500/20",
    purple: "text-indigo-600 bg-indigo-50 border-indigo-100 dark:bg-indigo-500/10 dark:border-indigo-500/20",
    green: "text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20",
    blue: "text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20",
    pink: "text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm hover:shadow-md transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg border ${colorMap[color] || colorMap.purple}`}>
          {icon}
        </div>
        {subtitle && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${subtitle.toString().includes('-') ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
            {subtitle}
          </span>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">
          {title}
        </p>
        <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight leading-none truncate" title={value}>
          {value}
        </h3>
      </div>
    </motion.div>
  );
}