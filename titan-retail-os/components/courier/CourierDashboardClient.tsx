'use client';
import { useState, useEffect } from 'react';

const STATUS_COLORS: Record<string,string> = { pending:'#fbbf24', picked_up:'#38bdf8', in_transit:'#a78bfa', delivered:'#4ade80', failed:'#f87171' };

export default function CourierDashboardClient({ user }: { user: any }) {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string|null>(null);

  const NEXT: Record<string,string> = { pending:'picked_up', picked_up:'in_transit', in_transit:'delivered' };
  const LABEL: Record<string,string> = { picked_up:'Mark Picked Up', in_transit:'Mark In Transit', delivered:'Mark Delivered' };

  useEffect(() => {
    fetch('/api/courier/deliveries').then(r=>r.json()).then(d=>{ setDeliveries(d); setLoading(false); });
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    await fetch(`/api/courier/deliveries/${id}/update`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ status }) });
    setDeliveries(prev => prev.map(d => d.id===id ? {...d, status} : d));
    setUpdating(null);
  };

  return (
    <div style={{minHeight:'100vh',background:'#080c14',fontFamily:'Inter, system-ui, sans-serif',color:'#e2e8f0'}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0} @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{height:60,borderBottom:'1px solid rgba(255,255,255,0.06)',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 28px'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:30,height:30,borderRadius:8,background:'linear-gradient(135deg,#7c3aed,#4f46e5)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>🛵</div>
          <span style={{color:'#94a3b8',fontSize:13}}>Courier · {user.full_name}</span>
        </div>
        <a href="/api/auth/logout" style={{color:'#475569',fontSize:13,textDecoration:'none'}}>Sign out</a>
      </div>
      <div style={{padding:28,animation:'fadeUp 0.4s ease'}}>
        <h1 style={{color:'#f1f5f9',fontSize:22,fontWeight:700,marginBottom:4}}>My Deliveries</h1>
        <p style={{color:'#475569',fontSize:13,marginBottom:24}}>{deliveries.filter(d=>d.status!=='delivered').length} active · {deliveries.filter(d=>d.status==='delivered').length} completed</p>
        {loading ? (
          <div style={{textAlign:'center',padding:'60px 0',color:'#475569'}}>Loading deliveries...</div>
        ) : deliveries.length===0 ? (
          <div style={{textAlign:'center',padding:'60px 0',color:'#475569'}}><div style={{fontSize:40,marginBottom:12}}>📦</div><div>No deliveries assigned yet</div></div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:12,maxWidth:680}}>
            {deliveries.map((d: any) => {
              const sc = STATUS_COLORS[d.status]||'#64748b';
              const nextStatus = NEXT[d.status];
              return (
                <div key={d.id} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:14,padding:'18px 20px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                    <div>
                      <div style={{color:'#f1f5f9',fontWeight:600,fontSize:14}}>{d.orders?.shipping_address?.name||'Customer'}</div>
                      <div style={{color:'#64748b',fontSize:12,marginTop:2}}>{d.dropoff_address?.street}, {d.dropoff_address?.city}</div>
                    </div>
                    <span style={{background:`${sc}18`,color:sc,fontSize:11,fontWeight:600,padding:'3px 10px',borderRadius:20,textTransform:'capitalize',whiteSpace:'nowrap'}}>● {d.status.replace(/_/g,' ')}</span>
                  </div>
                  {d.orders?.order_items?.length>0&&(
                    <div style={{color:'#64748b',fontSize:12,marginBottom:12}}>
                      {d.orders.order_items.slice(0,3).map((i:any)=>`${i.products?.name} ×${i.quantity}`).join(' · ')}
                      {d.orders.order_items.length>3&&` +${d.orders.order_items.length-3} more`}
                    </div>
                  )}
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{color:'#94a3b8',fontSize:13}}>💰 {d.courier_fee} EGP fee · Order: {d.orders?.total} EGP</span>
                    {nextStatus&&(
                      <button onClick={()=>updateStatus(d.id,nextStatus)} disabled={updating===d.id} style={{background:'rgba(124,58,237,0.2)',color:'#a78bfa',border:'1px solid rgba(124,58,237,0.3)',padding:'7px 14px',borderRadius:10,cursor:updating===d.id?'not-allowed':'pointer',fontSize:12,fontWeight:600,opacity:updating===d.id?0.7:1}}>
                        {updating===d.id?'Updating...':LABEL[nextStatus]}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
