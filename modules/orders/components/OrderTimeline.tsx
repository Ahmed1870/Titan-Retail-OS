"use client";
export default function OrderTimeline({ logs }: { logs: any[] }) {
  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6">
      <h3 className="text-white font-bold mb-6 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        Lifecycle Tracker
      </h3>
      <div className="relative border-l border-slate-800 ml-3 space-y-6">
        {logs.map((log, index) => (
          <div key={log.id} className="mb-8 pl-6 relative">
            <span className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-slate-800 border-2 border-[#0f172a]" />
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
              <div>
                <span className="text-xs font-black uppercase text-emerald-500 tracking-wider">
                  {log.new_status}
                </span>
                <p className="text-sm text-slate-300 mt-1">
                  Updated by <span className="font-bold text-white">{log.users?.full_name || 'System Auto-Pilot'}</span>
                </p>
                <p className="text-xs text-slate-500 mt-1 italic">{log.notes}</p>
              </div>
              <time className="text-[10px] text-slate-500 font-mono mt-2 sm:mt-0">
                {new Date(log.created_at).toLocaleString()}
              </time>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
