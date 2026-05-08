import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import CommandPalette from "./CommandPalette";
import FloatingActions from "./FloatingActions";
import { Outlet } from "react-router-dom";
import { X, Menu } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans relative">
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-64 z-[101] lg:hidden"
            >
              <div className="h-full relative shadow-2xl">
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="absolute top-6 right-[-48px] p-2 bg-white dark:bg-zinc-900 rounded-lg shadow-xl text-zinc-600 z-50 lg:hidden"
                >
                  <X size={20} />
                </button>
                <Sidebar />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sidebar - Desktop */}
      <div className="hidden lg:block w-64 fixed top-0 bottom-0 left-0 z-[50]">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:pl-64 min-h-screen">
        <main className="flex-1 w-full max-w-[1400px] mx-auto p-4 md:p-8 lg:p-12">
          <Header onToggleMenu={() => setIsMobileMenuOpen(true)} />
          <div className="mt-8 pb-12">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}