import { motion } from "framer-motion";

export default function KPICard({ title, value, subtitle, icon, color }) {
  const colorMap = {
    orange: "from-orange-400 to-pink-500",
    purple: "from-purple-500 to-indigo-600",
    green: "from-emerald-400 to-teal-500",
    blue: "from-blue-400 to-cyan-500",
    pink: "from-pink-400 to-rose-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="relative rounded-[2rem] glass p-6 overflow-hidden flex flex-col justify-between group"
    >
      {/* Soft Ambient Glow */}
      <div
        className={`absolute -right-6 -top-6 w-32 h-32 rounded-full bg-gradient-to-br ${colorMap[color]} opacity-20 blur-3xl group-hover:opacity-40 transition-opacity duration-500`}
      />

      {/* Header */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div
          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center text-white text-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
        >
          {icon}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 overflow-hidden">
        <div className="flex items-end gap-2 mb-1">
          <h2 
            className="text-2xl 2xl:text-3xl font-bold text-slate-800 tracking-tight truncate"
            title={typeof value === 'string' || typeof value === 'number' ? value : ''}
          >
            {value}
          </h2>
          {subtitle && (
            <span className={`text-sm font-semibold mb-1 ${subtitle.toString().includes('-') ? 'text-rose-500' : 'text-emerald-500'}`}>
              {subtitle}
            </span>
          )}
        </div>
        <p className="text-slate-500 text-sm font-medium truncate">
          {title}
        </p>
      </div>
    </motion.div>
  );
}