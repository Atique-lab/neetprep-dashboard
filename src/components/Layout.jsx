import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden">
  <Sidebar />

  <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
    <Header />
    <Outlet />
  </div>
</div>
  );
}