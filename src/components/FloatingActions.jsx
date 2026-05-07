import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ClipboardList, Send, X, MessageSquare, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FloatingActions() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const actions = [
    { 
      label: 'New Task', 
      icon: <ClipboardList size={20} />, 
      onClick: () => { navigate('/user-space', { state: { tab: 'tasks' } }); setIsOpen(false); },
      color: 'bg-purple-600'
    },
    { 
      label: 'Assign Task', 
      icon: <Send size={20} />, 
      onClick: () => { navigate('/user-space', { state: { tab: 'tasks', autoOpenAssign: true } }); setIsOpen(false); },
      color: 'bg-indigo-600'
    },
  ];

  return (
    <div className="fixed bottom-8 right-8 z-[999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex flex-col-reverse items-end gap-3 mb-4"
          >
            {actions.map((action, idx) => (
              <motion.button
                key={idx}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                onClick={action.onClick}
                className="flex items-center gap-3 group"
              >
                <span className="px-3 py-1.5 bg-white shadow-xl rounded-xl text-xs font-black text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity border border-slate-100">
                  {action.label}
                </span>
                <div className={`w-12 h-12 ${action.color} text-white rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all`}>
                  {action.icon}
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-purple-500/20 transition-all active:scale-90 ${
          isOpen ? 'bg-slate-800 rotate-45' : 'bg-gradient-to-tr from-purple-600 to-indigo-600'
        }`}
      >
        <Plus size={28} className={`transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
      </button>
    </div>
  );
}
