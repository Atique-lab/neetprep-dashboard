import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, IndianRupee, Users, School, 
  CreditCard, GraduationCap, ShieldCheck, Zap 
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const menu = [
    { name: "Dashboard", path: "/", icon: <LayoutDashboard size={18} /> },
    { name: "Revenue", path: "/revenue", icon: <IndianRupee size={18} /> },
    { name: "Managers", path: "/managers", icon: <Users size={18} /> },
    { name: "Centres", path: "/centres", icon: <School size={18} /> },
    { name: "Payments", path: "/payments", icon: <CreditCard size={18} /> },
    { name: "Students", path: "/students", icon: <GraduationCap size={18} /> },
    { name: "Audit", path: "/audit", icon: <ShieldCheck size={18} /> },
  ];

  return (
    <div className="h-full w-full bg-zinc-950 text-zinc-400 flex flex-col border-r border-zinc-800 relative overflow-hidden">
      
      {/* Brand Header */}
      <div className="px-6 py-8 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/20">
          N
        </div>
        <span className="text-lg font-black text-white tracking-tight">NEETprep</span>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-4">Core Platform</p>
        {menu.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${active 
                  ? "bg-zinc-800 text-white shadow-sm shadow-black/20" 
                  : "hover:bg-zinc-900 hover:text-zinc-200"
                }
              `}
            >
              <span className={`${active ? "text-indigo-400" : "text-zinc-500"}`}>
                {item.icon}
              </span>
              <span className="tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Profile Brief */}
      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-zinc-900/50">
           <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white uppercase">
             {user?.name?.substring(0, 2)}
           </div>
           <div className="flex-1 min-w-0">
             <p className="text-xs font-bold text-white truncate">{user?.name}</p>
             <p className="text-[10px] text-zinc-500 truncate">{user?.role}</p>
           </div>
        </div>
      </div>
    </div>
  );
}