import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Users, Building, Wallet, History, Search, 
  Settings, LogOut, ChevronLeft, ChevronRight, PieChart, ShieldCheck
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  { path: "/", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
  { path: "/revenue", icon: <PieChart size={18} />, label: "Revenue" },
  { path: "/managers", icon: <Users size={18} />, label: "Managers" },
  { path: "/centres", icon: <Building size={18} />, label: "Centres" },
  { path: "/payments", icon: <Wallet size={18} />, label: "Payments" },
  { path: "/students", icon: <History size={18} />, label: "Students" },
  { path: "/audit", icon: <ShieldCheck size={18} />, label: "Audit" },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const userStr = sessionStorage.getItem('auth_user');
  const user = userStr ? JSON.parse(userStr) : { name: "Atique", role: "admin" };

  return (
    <div className={`h-screen flex flex-col bg-zinc-950 text-zinc-400 border-r border-zinc-800/50 transition-all duration-300 ${isOpen ? "w-64" : "w-16"}`}>
      {/* Brand */}
      <div className="h-16 flex items-center px-4 border-b border-zinc-900">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-black text-xl">
          N
        </div>
        {isOpen && <span className="ml-3 font-display font-black text-lg text-zinc-50 tracking-tighter uppercase">NEETprep</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        <div className="mb-4">
          {isOpen && <p className="px-3 text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Core Platform</p>}
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${isActive ? "bg-indigo-600/10 text-indigo-400 font-bold" : "hover:bg-zinc-900 hover:text-zinc-50"}`}
              >
                <span className={`${isActive ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-50"}`}>
                  {item.icon}
                </span>
                {isOpen && <span className="text-sm">{item.label}</span>}
                {isActive && isOpen && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer / User */}
      <div className="p-3 border-t border-zinc-900 bg-zinc-950/50">
        <div className={`flex items-center ${isOpen ? "gap-3" : "justify-center"}`}>
          <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-black text-zinc-400 uppercase">
            {user.name.slice(0, 2)}
          </div>
          {isOpen && (
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-zinc-50 truncate leading-none">{user.name}</p>
              <p className="text-[10px] text-zinc-600 mt-1 uppercase font-bold">{user.role}</p>
            </div>
          )}
        </div>
        
        {isOpen && (
          <button 
            onClick={() => { sessionStorage.clear(); window.location.reload(); }}
            className="mt-4 w-full flex items-center gap-3 px-3 py-2 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors text-sm font-bold"
          >
            <LogOut size={16} /> Logout
          </button>
        )}
      </div>
    </div>
  );
}