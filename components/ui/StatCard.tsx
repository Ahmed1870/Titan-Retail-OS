export default function StatCard({ title, value, unit }: { title: string, value: any, unit?: string }) {
  return (
    <div className="bg-[#0a0a0a] border border-[#00ff88]/20 p-6 rounded-lg backdrop-blur-md relative overflow-hidden group hover:border-[#00ff88]/50 transition-all">
      <div className="absolute top-0 left-0 w-1 h-full bg-[#00ff88]/50 shadow-[0_0_10px_#00ff88]" />
      <p className="text-[10px] font-mono text-[#00ff88]/60 uppercase tracking-widest mb-1 italic">// {title}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-black text-white italic tracking-tighter">{value}</h3>
        {unit && <span className="text-[10px] text-gray-500 font-bold uppercase">{unit}</span>}
      </div>
    </div>
  )
}
