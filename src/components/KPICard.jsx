import { motion } from "framer-motion";

export default function KPICard({ title, value, icon, color }) {
  const colorMap = {
    orange: "from-orange-400 to-pink-500",
    purple: "from-purple-400 to-indigo-500",
    green: "from-green-400 to-teal-500",
    blue: "from-blue-400 to-cyan-500",
    pink: "from-pink-400 to-rose-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
      className="relative rounded-2xl bg-[#0F172A] p-6 border border-white/10 overflow-hidden aspect-square flex items-center justify-center"
    >
      {/* Glow Border */}
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${colorMap[color]} opacity-20 blur-xl`}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center gap-4">

        {/* Icon */}
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-r ${colorMap[color]} flex items-center justify-center text-white text-xl`}
        >
          {icon}
        </div>

        {/* Value */}
        <h2 className="text-2xl font-bold text-white">
          {value}
        </h2>

        {/* Title */}
        <p className="text-gray-400 text-sm">
          {title}
        </p>
      </div>
    </motion.div>
  );
}