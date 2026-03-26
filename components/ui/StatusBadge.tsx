export default function StatusBadge({ status }: { status: string }) {
  const colors: any = { active: 'text-[#00ff88] border-[#00ff88]/30', pending: 'text-yellow-500 border-yellow-500/30', cancelled: 'text-red-500 border-red-500/30' }
  return (
    <span className={`px-3 py-1 border text-[10px] font-black italic uppercase rounded-full ${colors[status] || 'text-gray-500 border-gray-500/30'}`}>
      {status}
    </span>
  )
}
