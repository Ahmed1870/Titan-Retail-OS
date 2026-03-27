'use client';
import { useState, useEffect } from 'react';
import { useMerchantActivation } from '@/hooks/useMerchantActivation';
import { useNotifications } from '@/hooks/useNotifications';

const PLANS = [
  { id:'starter', name:'Starter', price:299, features:['100 products','Basic analytics','Email support'], accent:'#38bdf8', icon:'🚀' },
  { id:'pro', name:'Pro', price:599, features:['Unlimited products','Advanced analytics','Priority support','AI Ads','Referrals'], accent:'#a78bfa', icon:'⚡', popular:true },
  { id:'enterprise', name:'Enterprise', price:1299, features:['Everything in Pro','Custom domain','Dedicated support','Unlimited couriers'], accent:'#fb923c', icon:'🏆' },
];
const PM = [{ id:'vodafone_cash', label:'Vodafone Cash', icon:'📱' },{ id:'instapay', label:'InstaPay', icon:'🏦' },{ id:'bank_transfer', label:'Bank Transfer', icon:'💳' }];

export default function MerchantDashboardClient({ user, tenant }: { user: any; tenant: any }) {
  const [view, setView] = useState<'dashboard'|'subscribe'|'pending'>('dashboard');
  const [step, setStep] = useState(1);
  const [selPlan, setSelPlan] = useState('');
  const [form, setForm] = useState({ full_name: user.full_name || '', phone_number: user.phone || '', payment_method: '' });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string,string>>({});
  const { activated, plan: activatedPlan } = useMerchantActivation(tenant?.id);
  const { notifications, unreadCount } = useNotifications(user.id);
  const [tab, setTab] = useState('overview');

  const isActive = tenant?.plan_status === 'active' || activated;
  const planColor = PLANS.find(p=>p.id===(activatedPlan||tenant?.current_plan))?.accent||'#a78bfa';

  const validate = () => {
    const e: Record<string,string> = {};
    if (!form.full_name.trim()) e.full_name = 'Full name required';
    if (!/^01[0-9]{9}$/.test(form.phone_number)) e.phone_number = 'Valid Egyptian phone required';
    if (!form.payment_method) e.payment_method = 'Select payment method';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    const res = await fetch('/api/merchant/subscriptions/request', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ plan:selPlan, payment_method:form.payment_method, full_name:form.full_name, phone_number:form.phone_number }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) { setErrors({ form: data.error }); return; }
    if (data.whatsappLink) window.open(data.whatsappLink, '_blank');
    setView('pending');
  };

  const inp: React.CSSProperties = { background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'12px 14px', color:'#e2e8f0', fontSize:14, outline:'none', width:'100%' };

  return (
    <div style={{minHeight:'100vh',background:'#080c14',fontFamily:'Inter, system-ui, sans-serif',color:'#e2e8f0'}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0} @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

      {/* Header */}
      <div style={{height:60,borderBottom:'1px solid rgba(255,255,255,0.06)',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 28px'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:30,height:30,borderRadius:8,background:'linear-gradient(135deg,#7c3aed,#4f46e5)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>⬡</div>
          <span style={{color:'#94a3b8',fontSize:13}}>{tenant?.store_name || 'My Store'}</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          {unreadCount>0&&<span style={{background:'rgba(167,139,250,0.15)',color:'#a78bfa',fontSize:12,padding:'4px 12px',borderRadius:20}}>🔔 {unreadCount}</span>}
          {isActive ? (
            <span style={{background:`${planColor}18`,color:planColor,fontSize:11,fontWeight:700,padding:'4px 12px',borderRadius:20,border:`1px solid ${planColor}30`}}>✓ {activatedPlan||tenant?.current_plan} Active</span>
          ) : (
            <button onClick={()=>setView('subscribe')} style={{background:'linear-gradient(135deg,#7c3aed,#4f46e5)',color:'white',border:'none',padding:'8px 18px',borderRadius:10,cursor:'pointer',fontWeight:600,fontSize:13}}>Activate Plan →</button>
          )}
          <a href="/api/auth/logout" style={{color:'#475569',fontSize:13,textDecoration:'none'}}>Sign out</a>
        </div>
      </div>

      {/* SUBSCRIBE FLOW */}
      {view==='subscribe' && step===1 && (
        <div style={{padding:'48px 28px',animation:'fadeUp 0.4s ease'}}>
          <div style={{textAlign:'center',marginBottom:40}}>
            <h1 style={{color:'#f1f5f9',fontSize:28,fontWeight:700}}>Choose Your Plan</h1>
            <p style={{color:'#64748b',marginTop:8}}>30-day billing · Cancel anytime</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20,maxWidth:900,margin:'0 auto'}}>
            {PLANS.map(plan=>(
              <div key={plan.id} onClick={()=>{setSelPlan(plan.id);setStep(2);}} style={{background:'rgba(255,255,255,0.03)',border:`1px solid ${plan.popular?plan.accent+'40':'rgba(255,255,255,0.08)'}`,borderRadius:18,padding:'28px 24px',cursor:'pointer',position:'relative',transition:'all 0.2s'}}>
                {plan.popular&&<div style={{position:'absolute',top:-1,left:'50%',transform:'translateX(-50%)',background:plan.accent,color:'white',fontSize:10,fontWeight:700,padding:'3px 14px',borderRadius:'0 0 10px 10px'}}>MOST POPULAR</div>}
                <div style={{fontSize:28,marginBottom:12,marginTop:plan.popular?12:0}}>{plan.icon}</div>
                <div style={{color:plan.accent,fontWeight:700,fontSize:18,marginBottom:4}}>{plan.name}</div>
                <div style={{display:'flex',alignItems:'baseline',gap:4,marginBottom:18}}><span style={{color:'#f1f5f9',fontSize:28,fontWeight:700}}>{plan.price}</span><span style={{color:'#475569',fontSize:13}}>EGP/mo</span></div>
                {plan.features.map(f=><div key={f} style={{display:'flex',gap:8,marginBottom:8}}><span style={{color:plan.accent,fontSize:12}}>✓</span><span style={{color:'#94a3b8',fontSize:13}}>{f}</span></div>)}
                <button style={{width:'100%',marginTop:20,padding:'11px 0',borderRadius:12,border:'none',cursor:'pointer',background:`${plan.accent}20`,color:plan.accent,fontWeight:700,fontSize:14}}>Select {plan.name}</button>
              </div>
            ))}
          </div>
          <div style={{textAlign:'center',marginTop:24}}><button onClick={()=>setView('dashboard')} style={{color:'#475569',fontSize:13,background:'none',border:'none',cursor:'pointer'}}>← Back to dashboard</button></div>
        </div>
      )}

      {view==='subscribe' && step===2 && (() => {
        const plan = PLANS.find(p=>p.id===selPlan)!;
        return (
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'48px 24px',animation:'fadeUp 0.4s ease'}}>
            <div style={{width:'100%',maxWidth:460,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:20,padding:'36px 32px'}}>
              <div style={{background:`${plan.accent}10`,border:`1px solid ${plan.accent}30`,borderRadius:14,padding:'16px 18px',marginBottom:28,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div><div style={{color:plan.accent,fontWeight:700}}>{plan.icon} {plan.name} Plan</div><div style={{color:'#64748b',fontSize:12,marginTop:2}}>30 days</div></div>
                <div style={{color:'#f1f5f9',fontWeight:700,fontSize:20}}>{plan.price} EGP</div>
              </div>
              <h2 style={{color:'#f1f5f9',fontSize:18,fontWeight:700,marginBottom:20}}>Payment Details</h2>
              {errors.form&&<div style={{background:'rgba(248,113,113,0.1)',border:'1px solid rgba(248,113,113,0.3)',color:'#f87171',padding:'10px 14px',borderRadius:10,fontSize:13,marginBottom:16}}>{errors.form}</div>}
              <div style={{marginBottom:16}}>
                <label style={{color:'#94a3b8',fontSize:12,display:'block',marginBottom:8}}>FULL NAME</label>
                <input value={form.full_name} onChange={e=>setForm(f=>({...f,full_name:e.target.value}))} placeholder="As on your ID" style={{...inp,borderColor:errors.full_name?'#f87171':'rgba(255,255,255,0.1)'}} />
                {errors.full_name&&<div style={{color:'#f87171',fontSize:11,marginTop:4}}>{errors.full_name}</div>}
              </div>
              <div style={{marginBottom:16}}>
                <label style={{color:'#94a3b8',fontSize:12,display:'block',marginBottom:8}}>PHONE</label>
                <input value={form.phone_number} onChange={e=>setForm(f=>({...f,phone_number:e.target.value}))} placeholder="01XXXXXXXXX" style={{...inp,borderColor:errors.phone_number?'#f87171':'rgba(255,255,255,0.1)'}} />
                {errors.phone_number&&<div style={{color:'#f87171',fontSize:11,marginTop:4}}>{errors.phone_number}</div>}
              </div>
              <div style={{marginBottom:24}}>
                <label style={{color:'#94a3b8',fontSize:12,display:'block',marginBottom:8}}>PAYMENT METHOD</label>
                {PM.map(m=>(
                  <div key={m.id} onClick={()=>setForm(f=>({...f,payment_method:m.id}))} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',borderRadius:10,cursor:'pointer',border:`1px solid ${form.payment_method===m.id?plan.accent+'60':'rgba(255,255,255,0.08)'}`,background:form.payment_method===m.id?`${plan.accent}10`:'rgba(255,255,255,0.03)',marginBottom:8,transition:'all 0.2s'}}>
                    <span style={{fontSize:18}}>{m.icon}</span>
                    <span style={{color:form.payment_method===m.id?'#f1f5f9':'#94a3b8',fontSize:14,fontWeight:form.payment_method===m.id?600:400,flex:1}}>{m.label}</span>
                    {form.payment_method===m.id&&<span style={{color:plan.accent}}>✓</span>}
                  </div>
                ))}
                {errors.payment_method&&<div style={{color:'#f87171',fontSize:11,marginTop:4}}>{errors.payment_method}</div>}
              </div>
              <button onClick={handleSubmit} disabled={submitting} style={{width:'100%',padding:'14px 0',borderRadius:12,border:'none',cursor:submitting?'not-allowed':'pointer',background:`linear-gradient(135deg,${plan.accent},${plan.accent}bb)`,color:'white',fontWeight:700,fontSize:15,opacity:submitting?0.7:1}}>
                {submitting?'Processing...':'Confirm & Open WhatsApp →'}
              </button>
              <p style={{color:'#374151',fontSize:11,textAlign:'center',marginTop:12}}>You'll be redirected to WhatsApp to complete payment</p>
              <div style={{textAlign:'center',marginTop:12}}><button onClick={()=>setStep(1)} style={{color:'#475569',fontSize:13,background:'none',border:'none',cursor:'pointer'}}>← Back</button></div>
            </div>
          </div>
        );
      })()}

      {view==='pending' && (
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'calc(100vh - 60px)',padding:24}}>
          <div style={{textAlign:'center',maxWidth:400,animation:'fadeUp 0.4s ease'}}>
            <div style={{fontSize:64,marginBottom:24}}>⏳</div>
            <h2 style={{color:'#f1f5f9',fontSize:24,fontWeight:700,marginBottom:12}}>Request Sent!</h2>
            <p style={{color:'#64748b',fontSize:14,lineHeight:1.7,marginBottom:28}}>Your subscription request is pending admin approval.<br/>You'll be notified here the moment it's activated — no refresh needed.</p>
            <div style={{background:'rgba(124,58,237,0.1)',border:'1px solid rgba(124,58,237,0.2)',borderRadius:14,padding:'16px 20px'}}>
              <div style={{color:'#94a3b8',fontSize:12,marginBottom:8}}>Watching for activation via realtime...</div>
              <div style={{display:'flex',gap:6,justifyContent:'center'}}>
                {[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:'50%',background:'#7c3aed',animation:`pulse 1.2s ${i*0.4}s infinite`}}/>)}
              </div>
            </div>
            <button onClick={()=>{setView('dashboard');setStep(1);}} style={{marginTop:20,color:'#475569',fontSize:13,background:'none',border:'none',cursor:'pointer'}}>← Back to dashboard</button>
          </div>
        </div>
      )}

      {/* DASHBOARD */}
      {view==='dashboard' && (
        <div style={{padding:32,animation:'fadeUp 0.4s ease'}}>
          {!isActive&&(
            <div style={{background:'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(79,70,229,0.08))',border:'1px solid rgba(124,58,237,0.3)',borderRadius:16,padding:'20px 24px',marginBottom:28,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div><div style={{color:'#a78bfa',fontWeight:700,fontSize:16}}>Your store isn't active yet</div><div style={{color:'#64748b',fontSize:13,marginTop:4}}>Choose a plan to unlock all features</div></div>
              <button onClick={()=>setView('subscribe')} style={{background:'rgba(124,58,237,0.3)',color:'#c4b5fd',border:'1px solid rgba(124,58,237,0.5)',padding:'10px 20px',borderRadius:10,cursor:'pointer',fontWeight:600,fontSize:13,whiteSpace:'nowrap'}}>Subscribe Now →</button>
            </div>
          )}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:28}}>
            {[{label:'Revenue',value:isActive?'12,480 EGP':'—',icon:'💰'},{label:'Orders Today',value:isActive?'24':'—',icon:'📦'},{label:'Products',value:isActive?'87':'0',icon:'🏷'},{label:'Low Stock',value:isActive?'3':'—',icon:'⚠️'}].map(s=>(
              <div key={s.label} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:14,padding:'18px 20px'}}>
                <div style={{fontSize:20,marginBottom:8}}>{s.icon}</div>
                <div style={{color:'#475569',fontSize:11,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:4}}>{s.label}</div>
                <div style={{color:isActive?'#f1f5f9':'#334155',fontSize:22,fontWeight:700}}>{s.value}</div>
              </div>
            ))}
          </div>
          {!isActive&&(
            <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:16,padding:'60px 0',textAlign:'center'}}>
              <div style={{fontSize:40,marginBottom:12}}>🔒</div>
              <div style={{color:'#64748b',fontSize:16,fontWeight:600}}>Features locked</div>
              <div style={{color:'#374151',fontSize:13,marginTop:6}}>Activate a plan to access orders, inventory, reports & more</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
