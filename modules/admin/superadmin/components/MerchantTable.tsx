export default function MerchantTable({ tenants }: any) {
  return (
    <div className="bg-[#0f171a] border border-slate-800 rounded-3xl overflow-hidden">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-900/50 text-slate-500 font-black uppercase">
          <tr>
            <th className="p-4">Store Name</th>
            <th className="p-4">Owner</th>
            <th className="p-4">Plan</th>
            <th className="p-4">Status</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {tenants.map((t: any) => (
            <tr key={t.id} className="hover:bg-white/5 transition-colors">
              <td className="p-4">
                <p className="font-bold text-white">{t.name}</p>
                <p className="text-[10px] text-slate-500 tracking-widest uppercase">{t.slug}</p>
              </td>
              <td className="p-4 text-slate-300">{t.owner_id?.full_name}</td>
              <td className="p-4">
                <span className="bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded font-black uppercase text-[9px]">
                  {t.current_plan}
                </span>
              </td>
              <td className="p-4">
                <span className={`w-2 h-2 rounded-full inline-block mr-2 ${t.plan_status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                {t.plan_status}
              </td>
              <td className="p-4 text-right">
                <button className="text-slate-400 hover:text-white font-bold px-2 underline">Manage</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
