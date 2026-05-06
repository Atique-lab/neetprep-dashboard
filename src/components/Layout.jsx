import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="flex min-h-screen text-slate-800 font-sans">

      {/* Sidebar Wrapper - Floating design */}
      <div className="p-4 hidden lg:block w-72">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 p-4 lg:p-6 lg:pl-0 overflow-y-auto">
          <Header />
          <div className="pb-10">
            <Outlet />
          </div>
        </div>
      </div>

    </div>
  );
}