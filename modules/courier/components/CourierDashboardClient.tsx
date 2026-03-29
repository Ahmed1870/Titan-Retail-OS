"use client";
'use client';
import { useState, useTransition } from 'react';
import { updateDeliveryStatusAction } from '../actions/deliveries';

const STATUS_COLORS: Record<string,string> = { pending:'#fbbf24', picked_up:'#38bdf8', in_transit:'#a78bfa', delivered:'#4ade80', failed:'#f87171' };
const NEXT: Record<string,string> = { pending:'picked_up', picked_up:'in_transit', in_transit:'delivered' };
const LABEL: Record<string,string> = { picked_up:'Mark Picked Up', in_transit:'Mark In Transit', delivered:'Mark Delivered' };

export default function CourierDashboardClient({ user, initialDeliveries }: any) {
  const [deliveries, setDeliveries] = useState(initialDeliveries);
  const [isPending, startTransition] = useTransition();
  const [updatingId, setUpdatingId] = useState<string|null>(null);

  const handleUpdate = async (id: string, status: string) => {
    setUpdatingId(id);
    startTransition(async () => {
      try {
        await updateDeliveryStatusAction(id, status as any);
        setDeliveries((prev: any[]) => prev.map(d => d.id === id ? { ...d, status } : d));
      } catch (err) {
        alert('Update failed');
      } finally {
        setUpdatingId(null);
      }
    });
  };

  return (
    <div style={{minHeight:'100vh',background:'#080c14',color:'#e2e8f0',fontFamily:'Inter, sans-serif'}}>
      {/* Header */}
      <div style={{height:60,borderBottom:'1px solid rgba(255,255,255,0.06)',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 28px'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:30,height:30,borderRadius:8,background:'linear-gradient(135deg,#7c3aed,#4f46e5)',display:'flex',alignItems:'center',justifyContent:'center'}}>🛵</div>
          <span style={{color:'#94a3b8',fontSize:13}}>Courier · {user.full_name}</span>
        </div>
        <a href="/api/auth/logout" style={{color:'#475569',fontSize:13,textDecoration:'none'}}>Sign out</a>
      </div>

      <div style={{padding:28}}>
        <h1 style={{fontSize:22,fontWeight:700,marginBottom:24}}>My Deliveries</h1>
        <div style={{display:'flex',flexDirection:'column',gap:12,maxWidth:680}}>
          {deliveries.map((d: any) => {
            const sc = STATUS_COLORS[d.status]||'#64748b';
            const nextStatus = NEXT[d.status];
            return (
              <div key={d.id} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:14,padding:20}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
                  <div style={{fontWeight:600}}>{d.orders?.shipping_address?.name || 'Customer'}</div>
                  <span style={{color:sc,fontSize:11,fontWeight:700}}>● {d.status.toUpperCase()}</span>
                </div>
                {nextStatus && (
                  <button 
                    disabled={updatingId === d.id}
                    onClick={() => handleUpdate(d.id, nextStatus)}
                    style={{width:'100%',padding:12,borderRadius:10,background:'rgba(124,58,237,0.2)',color:'#a78bfa',border:'1px solid rgba(124,58,237,0.3)',cursor:'pointer',fontWeight:600}}
                  >
                    {updatingId === d.id ? 'Updating...' : LABEL[nextStatus]}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
