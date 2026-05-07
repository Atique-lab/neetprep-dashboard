import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Command, X, Home, Users, Briefcase, 
  Settings, CreditCard, School, ChevronRight,
  TrendingUp, ClipboardList, LogOut, Download, ShieldCheck
} from 'lucide-react';
import { useGlobalData } from '../context/DashboardContext';
import { useAuth } from '../context/AuthContext';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { rawData } = useGlobalData();
  const { user, userList, logout } = useAuth();

  // Extract unique centres from rawData
  const centresList = useMemo(() => {
    if (!rawData || rawData.length <= 1) return [];
    const names = new Set();
    rawData.slice(1).forEach(row => {
      if (row[2]) names.add(row[2].trim());
    });
    return Array.from(names).map(name => ({ id: name, name }));
  }, [rawData]);

  // Static Pages
  const pages = [
    { name: 'Dashboard Overview', path: '/', icon: <Home size={18} />, category: 'Pages' },
    { name: 'Revenue Analytics', path: '/revenue', icon: <TrendingUp size={18} />, category: 'Pages' },
    { name: 'Centres Management', path: '/centres', icon: <School size={18} />, category: 'Pages' },
    { name: 'Managers & Team', path: '/managers', icon: <Briefcase size={18} />, category: 'Pages' },
    { name: 'Payments Records', path: '/payments', icon: <CreditCard size={18} />, category: 'Pages' },
    { name: 'Student Database', path: '/students', icon: <Users size={18} />, category: 'Pages' },
    { name: "Audit & Reconciliation", path: "/audit", icon: <ShieldCheck size={18} />, category: 'Pages' },
    { name: 'User Space & Tasks', path: '/user-space', icon: <ClipboardList size={18} />, category: 'Pages' },
  ];

  // Shortcut Listener (Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false);
    setQuery("");
  };

  const filteredResults = useMemo(() => {
    if (!query) return [];
    
    const q = query.toLowerCase();
    const results = [];

    // Filter Pages
    pages.forEach(p => {
      if (p.name.toLowerCase().includes(q)) results.push({ ...p, type: 'page' });
    });

    // Filter Centres
    centresList.forEach(c => {
      if (c.name.toLowerCase().includes(q)) {
        results.push({ 
          name: c.name, 
          path: `/centres/${c.id}`, 
          icon: <School size={18} className="text-blue-500" />, 
          category: 'Centres',
          type: 'centre'
        });
      }
    });

    // Filter Managers
    userList.forEach(u => {
      if (u.name.toLowerCase().includes(q)) {
        results.push({ 
          name: u.name, 
          path: `/managers/${u.name}`, 
          icon: <Users size={18} className="text-purple-500" />, 
          category: 'Team Members',
          type: 'manager'
        });
      }
    });

    // Quick Actions
    if ("logout".includes(q)) {
      results.push({
        name: 'Logout',
        action: () => { logout(); setIsOpen(false); },
        icon: <LogOut size={18} className="text-rose-500" />,
        category: 'Actions',
        type: 'action'
      });
    }

    return results.slice(0, 8); // Limit results
  }, [query, centresList, userList]);

  return (
    <>
      {/* Search Trigger Button in Header/Layout - Optional but good for UX */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Palette */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl shadow-slate-900/20 border border-slate-200 overflow-hidden"
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                <Search size={22} className="text-slate-400" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search pages, centres, managers, or actions..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-lg font-medium text-slate-800 placeholder-slate-400"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white border border-slate-200 shadow-sm">
                  <span className="text-[10px] font-black text-slate-400">ESC</span>
                </div>
              </div>

              {/* Results Area */}
              <div className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
                {!query ? (
                  <div className="p-4 space-y-6">
                    <div>
                      <h3 className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Quick Navigation</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                        {pages.map((p) => (
                          <button
                            key={p.path}
                            onClick={() => handleNavigate(p.path)}
                            className="flex items-center gap-3 p-3 rounded-2xl hover:bg-purple-50 transition-colors text-left group"
                          >
                            <div className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-500 group-hover:text-purple-600 group-hover:border-purple-100 transition-all shadow-sm">
                              {p.icon}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-700">{p.name}</p>
                              <p className="text-[10px] text-slate-400 font-medium">Jump to {p.name.split(' ')[0]}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-slate-50 pt-4">
                       <h3 className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Shortcuts</h3>
                       <div className="flex gap-4 px-3">
                          <div className="flex items-center gap-2">
                             <kbd className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-[10px] font-bold text-slate-500">Ctrl</kbd>
                             <span className="text-slate-300">+</span>
                             <kbd className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-[10px] font-bold text-slate-500">K</kbd>
                             <span className="text-[10px] font-bold text-slate-400 ml-1">to toggle</span>
                          </div>
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredResults.length > 0 ? (
                      filteredResults.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => item.action ? item.action() : handleNavigate(item.path)}
                          className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all text-left group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-500 group-hover:scale-110 transition-transform shadow-sm">
                              {item.icon}
                            </div>
                            <div>
                              <p className="text-base font-bold text-slate-800">{item.name}</p>
                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{item.category}</p>
                            </div>
                          </div>
                          <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                        </button>
                      ))
                    ) : (
                      <div className="py-12 text-center text-slate-400">
                        <Search size={40} className="mx-auto mb-4 opacity-10" />
                        <p className="text-sm font-medium">No results found for "{query}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                 <p className="text-[10px] font-bold text-slate-400">Search powered by Antigravity Engine</p>
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                       <span className="text-[10px] font-bold text-slate-500">System Online</span>
                    </div>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
