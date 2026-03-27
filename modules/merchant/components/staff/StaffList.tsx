'use client';
import { useState } from 'react';

export default function StaffList({ initialStaff }: { initialStaff: any[] }) {
  return (
    <div className="overflow-hidden bg-[#0f172a] border border-slate-800 rounded-2xl">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-900/50">
          <tr>
            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Employee</th>
            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Role</th>
            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Access</th>
            <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {initialStaff.map((staff) => (
            <tr key={staff.id} className="hover:bg-slate-800/30 transition-colors">
              <td className="p-4">
                <p className="text-sm font-bold text-white">{staff.users?.full_name}</p>
                <p className="text-xs text-slate-500">{staff.users?.email}</p>
              </td>
              <td className="p-4">
                <span className="px-2 py-1 text-[10px] font-black uppercase rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {staff.role}
                </span>
              </td>
              <td className="p-4">
                <div className="flex gap-1">
                  {Object.entries(staff.permissions).map(([key, val]: any) => (
                    val && <span key={key} title={key} className="w-2 h-2 rounded-full bg-emerald-500" />
                  ))}
                </div>
              </td>
              <td className="p-4 text-right">
                <button className="text-rose-500 hover:text-rose-400 text-xs font-bold">Revoke</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {initialStaff.length === 0 && (
        <div className="p-8 text-center text-slate-600 italic text-sm">
          No staff members deployed yet.
        </div>
      )}
    </div>
  );
}
