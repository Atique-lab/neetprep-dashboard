import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, IndianRupee, Users, School, BookOpen, CreditCard, GraduationCap } from "lucide-react";

export default function Sidebar() {
  const location = useLocation();

  const menu = [
    { name: "Dashboard", path: "/", icon: <LayoutDashboard size={20} /> },
    { name: "Revenue", path: "/revenue", icon: <IndianRupee size={20} /> },
    { name: "Managers", path: "/managers", icon: <Users size={20} /> },
    { name: "Centres", path: "/centres", icon: <School size={20} /> },
    { name: "Courses", path: "/courses", icon: <BookOpen size={20} /> },
    { name: "Payments", path: "/payments", icon: <CreditCard size={20} /> },
    { name: "Students", path: "/students", icon: <GraduationCap size={20} /> },
  ];

  return (
    <div className="h-full w-full glass rounded-3xl flex flex-col relative overflow-hidden">
      
      {/* Decorative Blur */}
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      
      {/* Logo */}
      <div className="px-8 py-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/30">
            N
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">
            Neetprep
          </h1>
        </div>
      </div>

      {/* Menu */}
      <div className="flex-1 px-4 py-2 space-y-2 relative z-10 overflow-y-auto">
        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 mt-2">Menu</p>
        {menu.map((item) => {
          const active = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium
                transition-all duration-300 relative overflow-hidden
                ${
                  active
                    ? "text-white shadow-md"
                    : "text-gray-600 hover:bg-white/60 hover:text-gray-900 hover:shadow-sm"
                }
              `}
            >
              {active && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-600 opacity-100 transition-opacity duration-300"></div>
              )}
              
              <div className={`relative z-10 ${active ? "text-white" : "text-gray-500 group-hover:text-purple-600 transition-colors"}`}>
                {item.icon}
              </div>
              <span className="relative z-10 tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}