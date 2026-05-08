import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import CommandPalette from "./CommandPalette";
import FloatingActions from "./FloatingActions";
import { Outlet } from "react-router-dom";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen text-slate-800 dark:text-slate-100 font-sans relative">
      <CommandPalette />
      <FloatingActions />

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] lg:hidden"
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 p-4 z-[101] lg:hidden"
            >
              <div className="h-full relative">
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="absolute top-8 right-6 p-2 text-slate-400 hover:text-slate-600 z-50 lg:hidden"
                >
                  <X size={20} />
                </button>
                <Sidebar />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sidebar Wrapper - Desktop */}
      <div className="p-4 hidden lg:block w-72">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 p-4 lg:p-6 lg:pl-0 overflow-y-auto">
          <Header onToggleMenu={() => setIsMobileMenuOpen(true)} />
          <div className="pb-10">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}