"use client";
export default function TableSkeleton() {
  return (
    <div className="w-full space-y-4 animate-pulse">
      <div className="h-10 bg-slate-800/50 rounded-xl w-full" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex space-x-4">
          <div className="h-12 bg-slate-900/50 rounded-lg w-full" />
        </div>
      ))}
    </div>
  );
}
