export default function KPICard({ title, value, growth, glow }) {
  const glowColors = {
    purple: "shadow-purple-300",
    blue: "shadow-blue-300",
    green: "shadow-green-300",
    orange: "shadow-orange-300",
    pink: "shadow-pink-300",
  };

  const isPositive = growth >= 0;

  return (
    <div className={`
      bg-white/70 backdrop-blur-md 
      rounded-2xl p-5 
      shadow-lg ${glowColors[glow] || ""}
      hover:scale-105 hover:shadow-2xl 
      transition-all duration-300
    `}>
      
      <p className="text-gray-500 text-sm">{title}</p>

      <h2 className="text-2xl font-bold mt-1">{value}</h2>

      {growth !== undefined && (
        <p className={`text-sm mt-1 font-medium ${
          isPositive ? "text-green-500" : "text-red-500"
        }`}>
          {isPositive ? "+" : ""}
          {growth.toFixed(1)}% {isPositive ? "↑" : "↓"}
        </p>
      )}
    </div>
  );
}