import { motion } from "framer-motion";

export function Skeleton({ className }) {
  return (
    <div className={`animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded-lg ${className}`} />
  );
}

export function KPISkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl h-28" />
      ))}
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 bg-zinc-100 dark:bg-zinc-900 rounded-lg w-full" />
      {[...Array(10)].map((_, i) => (
        <div key={i} className="h-12 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg w-full" />
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="h-[350px] w-full bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl flex items-end p-4 gap-2">
      {[...Array(12)].map((_, i) => (
        <div 
          key={i} 
          className="bg-zinc-200 dark:bg-zinc-800 rounded-t-lg w-full" 
          style={{ height: `${Math.random() * 60 + 20}%` }} 
        />
      ))}
    </div>
  );
}
