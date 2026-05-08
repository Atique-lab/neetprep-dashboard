import { motion } from "framer-motion";
import { 
  ShieldAlert, AlertCircle, CheckCircle2, 
  ChevronRight, ArrowRight, Filter, Search,
  MapPin, Calendar, ExternalLink
} from "lucide-react";
import { useDashboardData } from "../hooks/useDashboardData";
import { useNavigate } from "react-router-dom";

export default function Audit() {
  const { reconciliation, loading } = useDashboardData();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-200/50 rounded-lg w-1/4 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <div key={i} className="glass rounded-[2rem] h-32 w-full"></div>)}
        </div>
        <div className="glass rounded-[2rem] h-[60vh] w-full"></div>
      </div>
    );
  }

  const highSeverity = (reconciliation || []).filter(r => r.severity === 'high');
  const mediumSeverity = (reconciliation || []).filter(r => r.severity === 'medium');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Financial Audit & Reconciliation</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Automated detection of data discrepancies and financial anomalies.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-[2rem] border-t-4 border-t-rose-500">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-rose-50 rounded-2xl text-rose-600">
              <ShieldAlert size={24} />
            </div>
            <span className="text-2xl font-black text-rose-600">{highSeverity.length}</span>
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100">Critical Issues</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Requires immediate correction</p>
        </div>

        <div className="glass p-6 rounded-[2rem] border-t-4 border-t-amber-500">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
              <AlertCircle size={24} />
            </div>
            <span className="text-2xl font-black text-amber-600">{mediumSeverity.length}</span>
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100">Warnings</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Possible data entry errors</p>
        </div>

        <div className="glass p-6 rounded-[2rem] border-t-4 border-t-emerald-500">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
              <CheckCircle2 size={24} />
            </div>
            <span className="text-2xl font-black text-emerald-600">
              {reconciliation.length === 0 ? '100%' : 'N/A'}
            </span>
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100">Data Integrity</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Overall system health status</p>
        </div>
      </div>

      {/* Main Issue List */}
      <div className="glass rounded-[2.5rem] overflow-hidden border border-white/50">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-900/30">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Anomaly Detection Feed</h2>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-500 uppercase">
              {reconciliation.length} Total Found
            </span>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {reconciliation.length > 0 ? (
            reconciliation.map((issue) => (
              <div key={issue.id} className="p-6 hover:bg-slate-50/50 transition-colors group">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Severity Indicator */}
                  <div className="shrink-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
                      issue.severity === 'high' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {issue.severity === 'high' ? <ShieldAlert size={22} /> : <AlertCircle size={22} />}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        issue.severity === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {issue.type}
                      </span>
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold">
                        <Calendar size={12} /> {issue.date}
                      </div>
                    </div>
                    
                    <h4 className="text-lg font-bold text-slate-800 leading-tight">
                      {issue.detail}
                    </h4>

                    <div className="flex items-center gap-4 pt-1">
                      <button 
                        onClick={() => {
                          const centreName = issue.detail.match(/at\s(.*?)\shas/)?.[1];
                          if (centreName) navigate(`/centres/${centreName}`);
                        }}
                        className="flex items-center gap-1.5 text-xs font-black text-purple-600 hover:text-purple-700 uppercase tracking-widest bg-purple-50 px-3 py-2 rounded-xl transition-all"
                      >
                        <MapPin size={12} /> Locate Record
                        <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-24 text-center">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/10">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">All Clear!</h3>
              <p className="text-slate-400 dark:text-slate-500 max-w-sm mx-auto mt-2 font-medium">
                Our reconciliation engine found 0 discrepancies in the current dataset. Your records are healthy.
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
