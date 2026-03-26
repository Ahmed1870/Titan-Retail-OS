export default function DataTable({ headers, data }: { headers: string[], data: any[] }) {
  return (
    <div className="w-full overflow-x-auto border border-white/5 bg-[#050505] rounded-xl">
      <table className="w-full text-left text-xs font-mono">
        <thead className="bg-white/5 text-gray-500 uppercase italic">
          <tr>{headers.map(h => <th key={h} className="p-4 border-b border-white/5">{h}</th>)}</tr>
        </thead>
        <tbody className="text-white">
          {data.map((row, i) => (
            <tr key={i} className="border-b border-white/5 hover:bg-[#00ff88]/5 transition-colors">
              {Object.values(row).map((val: any, j) => <td key={j} className="p-4">{val}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
