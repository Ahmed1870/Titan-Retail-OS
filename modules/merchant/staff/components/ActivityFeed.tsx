'use client'

export default function ActivityFeed({ logs }: { logs: any[] }) {
  return (
    <div className="bg-[#0f171a] border border-slate-800 rounded-3xl overflow-hidden">
      <div className="p-6 border-b border-slate-800">
        <h3 className="text-white font-black text-sm uppercase tracking-widest">System Activity Log</h3>
      </div>
      <div className="divide-y divide-slate-800">
        {logs.map((log) => (
          <div key={log.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-emerald-500">
                {log.action_type[0]}
              </div>
              <div>
                <p className="text-xs text-white font-bold">
                  {log.action_type.replace('_', ' ')}
                </p>
                <p className="text-[10px] text-slate-500">
                  By: {log.users?.full_name || 'System'}
                </p>
              </div>
            </div>
            <time className="text-[9px] font-mono text-slate-600 uppercase">
              {new Date(log.created_at).toLocaleString()}
            </time>
          </div>
        ))}
      </div>
    </div>
  );
}
