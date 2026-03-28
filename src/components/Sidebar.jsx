import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();

  const menu = [
    { name: "Dashboard", path: "/" },
    { name: "Revenue", path: "/revenue" },
    { name: "Managers", path: "/managers" },
    { name: "Centres", path: "/centres" },
    { name: "Courses", path: "/courses" },
    { name: "Payments", path: "/payments" },
    { name: "Students", path: "/students" },
      
  ];

  return (
    <div className="w-64 h-screen bg-white border-r flex flex-col">

      {/* Logo */}
      <div className="px-6 py-5 border-b">
        <h1 className="text-xl font-bold text-gray-800">
          Menu
        </h1>
      </div>

      {/* Menu */}
      <div className="flex-1 px-4 py-6 space-y-2">
        {menu.map((item) => {
          const active = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                block px-4 py-3 rounded-xl text-sm font-medium
                transition-all duration-200
                ${
                  active
                    ? "bg-purple-50 text-purple-600 font-semibold"
                    : "text-gray-600 hover:bg-gray-100 hover:text-black"
                }
              `}
            >
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="px-6 py-4 border-t text-xs text-gray-400">
        © 2026 Neetprep
      </div>
    </div>
  );
}