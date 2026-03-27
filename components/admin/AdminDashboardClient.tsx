'use client';
import { useState } from 'react';
import { useRealtimeSubscriptions } from '@/hooks/useRealtimeSubscriptions';
import { useNotifications } from '@/hooks/useNotifications';

const PLAN_COLORS: Record<string,string> = { starter:'#38bdf8', pro:'#a78bfa', enterprise:'#fb923c' };
const PLAN_PRICES: Record<string,string> = { starter:'299 EGP', pro:'599 EGP', enterprise:'1,299 EGP' };

function ago(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  return m < 60 ? `${m}m ago` : `${Math.floor(m/60)}h ago`;
}

export default function AdminDashboardClient({ userId }: { userId: string }) {
  const [tab, setTab] = useState('overview');
  const [toasts, setToasts] = useState<Array<{id:number,msg:string,type:string}>>([]);
  const [autoActivation, setAutoActivation] = useState(false);
  const { requests, newRequestId } = useRealtimeSubscriptions();
  const { unreadCount } = useNotifications(userId);

  const addToast = (msg: string, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };

  const handleApprove = async (id: string) => {
    const res = await fetch(`/api/admin/subscriptions/${id}/approve`, { method: 'POST' });
    if (res.ok) addToast('✅ Subscription approved!', 'success');
    else addToast('❌ Approval failed', 'error');
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    const res = await fetch(`/api/admin/subscriptions/${id}/reject`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ reason }) });
    if (res.ok) addToast('Request rejected', 'error');
  };

  const NAV = [
    { id:'overview', label:'Overview', icon:'◎' },
    { id:'requests', label:'Requests', icon:'⚡', badge: requests.length },
    { id:'tenants', label:'Tenants', icon:'🏢' },
    { id:'settings', label:'Settings', icon:'⚙' },
  ];

  const S: React.CSSProperties = { minHeight:'100vh', background:'#080c14', fontFamily:'Inter, system-ui, sans-serif', color:'#e2e8f0', display:'flex' };

  return (
    <div style={S}>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}} @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}} @keyframes slideIn{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}} *{box-sizing:border-box;margin:0;padding:0}`}</style>

      {/* Toasts */}
      <div style={{position:'fixed',top:20,right:20,zIndex:9999,display:'flex',flexDirection:'column',gap:8}}>
        {toasts.map(t=>(
          <div key={t.id} style={{background:t.type==='success'?'rgba(74,222,128,0.15)':t.type==='error'?'rgba(248,113,113,0.15)':'rgba(167,139,250,0.15)',border:`1px solid ${t.type==='success'?'rgba(74,222,128,0.3)':t.type==='error'?'rgba(248,113,113,0.3)':'rgba(167,139,250,0.3)'}`,color:'#f1f5f9',padding:'12px 18px',borderRadius:12,fontSize:13,animation:'slideIn 0.3s ease',maxWidth:340}}>{t.msg}</div>
        ))}
      </div>

      {/* Sidebar */}
      <div style={{width:220,background:'rgba(255,255,255,0.02)',borderRight:'1px solid rgba(255,255,255,0.06)',display:'flex',flexDirection:'column',padding:'24px 0',flexShrink:0}}>
        <div style={{padding:'0 20px 28px',display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,#7c3aed,#4f46e5)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>⬡</div>
          <div><div style={{color:'#f1f5f9',fontWeight:700,fontSize:15}}>Titan</div><div style={{color:'#475569',fontSize:10,textTransform:'uppercase',letterSpacing:'0.1em'}}>Admin</div></div>
        </div>
        <nav style={{flex:1,padding:'0 12px',display:'flex',flexDirection:'column',gap:2}}>
          {NAV.map(n=>(
            <button key={n.id} onClick={()=>setTab(n.id)} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:10,border:'none',cursor:'pointer',background:tab===n.id?'rgba(124,58,237,0.2)':'transparent',color:tab===n.id?'#a78bfa':'#64748b',fontWeight:tab===n.id?600:400,fontSize:14,width:'100%',textAlign:'left',borderLeft:tab===n.id?'2px solid #7c3aed':'2px solid transparent',transition:'all 0.15s'}}>
              <span style={{fontSize:16}}>{n.icon}</span>
              <span style={{flex:1}}>{n.label}</span>
              {(n as any).badge>0&&<span style={{background:'#7c3aed',color:'white',fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:20,animation:'pulse 2s infinite'}}>{(n as any).badge}</span>}
            </button>
          ))}
        </nav>
        <div style={{padding:'0 12px'}}>
          <div style={{background:'rgba(255,255,255,0.04)',borderRadius:10,padding:'10px 12px',display:'flex',gap:8,alignItems:'center'}}>
            <span style={{fontSize:20}}>👤</span>
            <div><div style={{color:'#cbd5e1',fontSize:12,fontWeight:600}}>Admin</div>{unreadCount>0&&<div style={{color:'#a78bfa',fontSize:10}}>🔔 {unreadCount} unread</div>}</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{flex:1,overflow:'auto',padding:32}}>
        <div style={{marginBottom:28}}>
          <h1 style={{color:'#f1f5f9',fontSize:24,fontWeight:700}}>{tab==='overview'?'Command Center':tab==='requests'?'Subscription Requests':tab==='tenants'?'Tenants':'Settings'}</h1>
          <p style={{color:'#475569',fontSize:13,marginTop:4}}>{new Date().toLocaleDateString('en-EG',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
        </div>

        {tab==='overview'&&(
          <div style={{animation:'fadeUp 0.4s ease'}}>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:28}}>
              {[{label:'Revenue (30d)',value:'184K EGP',accent:'#a78bfa',icon:'💰'},{label:'Orders',value:'2,847',accent:'#38bdf8',icon:'📦'},{label:'Active Tenants',value:'142',accent:'#4ade80',icon:'🏢'},{label:'Pending',value:String(requests.length),accent:'#fb923c',icon:'⚡'}].map(s=>(
                <div key={s.label} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16,padding:'20px 22px'}}>
                  <div style={{fontSize:22,marginBottom:8}}>{s.icon}</div>
                  <div style={{color:'#94a3b8',fontSize:11,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:4}}>{s.label}</div>
                  <div style={{color:'#f1f5f9',fontSize:26,fontWeight:700}}>{s.value}</div>
                </div>
              ))}
            </div>
            <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16,padding:24}}>
              <div style={{color:'#94a3b8',fontSize:12,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:16}}>Plan Mix</div>
              {[{plan:'enterprise',pct:10,count:14},{plan:'pro',pct:55,count:78},{plan:'starter',pct:35,count:50}].map(p=>(
                <div key={p.plan} style={{marginBottom:16}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><span style={{color:PLAN_COLORS[p.plan],fontSize:13,fontWeight:600,textTransform:'capitalize'}}>{p.plan}</span><span style={{color:'#64748b',fontSize:12}}>{p.count}</span></div>
                  <div style={{height:6,background:'rgba(255,255,255,0.06)',borderRadius:10}}><div style={{height:'100%',width:`${p.pct}%`,background:PLAN_COLORS[p.plan],borderRadius:10}}/></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==='requests'&&(
          <div style={{animation:'fadeUp 0.4s ease'}}>
            {requests.length===0?(
              <div style={{textAlign:'center',padding:'80px 0',color:'#475569'}}><div style={{fontSize:48,marginBottom:16}}>✅</div><div style={{fontSize:18,color:'#64748b'}}>No pending requests</div></div>
            ):(
              <div style={{display:'flex',flexDirection:'column',gap:12,maxWidth:680}}>
                {requests.map(r=>{
                  const isNew=r.id===newRequestId;
                  const pc=PLAN_COLORS[r.plan]||'#94a3b8';
                  return (
                    <div key={r.id} style={{background:isNew?'rgba(167,139,250,0.08)':'rgba(255,255,255,0.04)',border:`1px solid ${isNew?'rgba(167,139,250,0.4)':'rgba(255,255,255,0.08)'}`,borderRadius:14,padding:'16px 20px',display:'flex',flexDirection:'column',gap:12,animation:isNew?'shake 0.5s ease':'none'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <div style={{display:'flex',gap:12,alignItems:'center'}}>
                          <div style={{width:40,height:40,borderRadius:10,background:`${pc}22`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>🏪</div>
                          <div><div style={{color:'#f1f5f9',fontWeight:600,fontSize:14}}>{(r as any).tenants?.store_name}</div><div style={{color:'#64748b',fontSize:12}}>{r.full_name} · {r.phone_number}</div></div>
                        </div>
                        <div style={{textAlign:'right'}}>
                          <span style={{background:`${pc}22`,color:pc,fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:20,textTransform:'uppercase'}}>{r.plan}</span>
                          <div style={{color:'#475569',fontSize:11,marginTop:4}}>{ago(r.created_at)}</div>
                        </div>
                      </div>
                      <div style={{display:'flex',gap:8,fontSize:12}}>
                        <span style={{background:'rgba(255,255,255,0.06)',color:'#94a3b8',padding:'4px 10px',borderRadius:20}}>💳 {r.payment_method.replace(/_/g,' ')}</span>
                        <span style={{background:'rgba(255,255,255,0.06)',color:'#94a3b8',padding:'4px 10px',borderRadius:20}}>💰 {PLAN_PRICES[r.plan]}</span>
                      </div>
                      <div style={{display:'flex',gap:8}}>
                        <button onClick={()=>handleApprove(r.id)} style={{flex:1,padding:'9px 0',borderRadius:10,border:'none',cursor:'pointer',background:'rgba(74,222,128,0.15)',color:'#4ade80',fontWeight:600,fontSize:13}}>✓ Approve</button>
                        <button onClick={()=>handleReject(r.id)} style={{flex:1,padding:'9px 0',borderRadius:10,border:'none',cursor:'pointer',background:'rgba(248,113,113,0.1)',color:'#f87171',fontWeight:600,fontSize:13}}>✕ Reject</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab==='settings'&&(
          <div style={{animation:'fadeUp 0.4s ease',maxWidth:560}}>
            {[{key:'auto',label:'Auto-Pilot Mode',desc:'Auto-approve subscriptions via webhook',val:autoActivation,set:setAutoActivation,accent:'#fb923c'},{key:'ai',label:'AI Ad Generator',desc:'Enable AI-powered ads for merchants',val:true,set:()=>{},accent:'#a78bfa'}].map(s=>(
              <div key={s.key} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:14,padding:'20px 22px',marginBottom:12,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div><div style={{color:'#e2e8f0',fontWeight:600,fontSize:14}}>{s.label}</div><div style={{color:'#475569',fontSize:12,marginTop:4}}>{s.desc}</div></div>
                <div onClick={()=>s.set(!s.val)} style={{width:44,height:24,borderRadius:12,cursor:'pointer',background:s.val?s.accent:'rgba(255,255,255,0.1)',position:'relative',transition:'background 0.3s',flexShrink:0}}>
                  <div style={{position:'absolute',top:3,left:s.val?23:3,width:18,height:18,borderRadius:'50%',background:'white',transition:'left 0.3s'}}/>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
