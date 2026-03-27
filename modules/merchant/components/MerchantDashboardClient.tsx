'use client';
import { useState, useTransition } from 'react';
import { useMerchantActivation } from '../hooks/useMerchantActivation';
import { useNotifications } from '@/hooks/useNotifications';
// استدعاء الترسانة الموحدة
import { createSubscriptionRequestAction } from '../actions/subscriptions';
import { updateOrderStatusAction } from '../actions/orders';
import { adjustStockAction } from '../actions/inventory';

const PLANS = [
  { id:'starter', name:'Starter', price:299, features:['100 products','Basic analytics'], accent:'#38bdf8', icon:'🚀' },
  { id:'pro', name:'Pro', price:599, features:['Unlimited products','AI Ads'], accent:'#a78bfa', icon:'⚡', popular:true },
  { id:'enterprise', name:'Enterprise', price:1299, features:['Everything in Pro','Custom domain'], accent:'#fb923c', icon:'🏆' },
];

export default function MerchantDashboardClient({ user, tenant, initialStats }: any) {
  const [view, setView] = useState<'dashboard'|'subscribe'|'pending'>(tenant?.plan_status === 'pending' ? 'pending' : 'dashboard');
  const [step, setStep] = useState(1);
  const [selPlan, setSelPlan] = useState('');
  const [form, setForm] = useState({ full_name: user.full_name || '', phone_number: user.phone || '', payment_method: '' });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  
  const { activated, plan: activatedPlan } = useMerchantActivation(tenant?.id);
  const { unreadCount } = useNotifications(user.id);

  const isActive = tenant?.plan_status === 'active' || activated;

  const handleSubmit = async () => {
    if (!form.payment_method || !form.full_name) {
      setError('Please fill all fields');
      return;
    }

    startTransition(async () => {
      try {
        const result = await createSubscriptionRequestAction({
          plan: selPlan,
          ...form
        });
        
        if (result.whatsappLink) {
          window.open(result.whatsappLink, '_blank');
        }
        setView('pending');
      } catch (err: any) {
        setError(err.message || 'Subscription failed');
      }
    });
  };

  return (
    <div style={{minHeight:'100vh',background:'#080c14',color:'#e2e8f0',fontFamily:'Inter, sans-serif'}}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
      
      {/* Header */}
      <div style={{height:64, borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px'}}>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <div style={{width:32, height:32, borderRadius:8, background:'linear-gradient(135deg,#7c3aed,#4f46e5)', display:'flex', alignItems:'center', justifyContent:'center'}}>⬡</div>
          <span style={{fontWeight:600}}>{tenant?.store_name}</span>
        </div>
        <div style={{display:'flex', gap:12, alignItems:'center'}}>
           {isActive ? 
            <span style={{fontSize:12, color:'#4ade80', background:'rgba(74,222,128,0.1)', padding:'4px 12px', borderRadius:20}}>● Active</span> :
            <span style={{fontSize:12, color:'#fb923c', background:'rgba(251,146,60,0.1)', padding:'4px 12px', borderRadius:20}}>● Inactive</span>
           }
           <a href="/api/auth/logout" style={{fontSize:13, color:'#64748b', textDecoration:'none'}}>Logout</a>
        </div>
      </div>

      <div style={{padding:24, animation:'fadeUp 0.3s ease'}}>
        {view === 'dashboard' && (
          <>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:20, marginBottom:32}}>
              {[{l:'Revenue', v:initialStats?.revenue || 0, i:'💰'}, {l:'Orders', v:initialStats?.ordersCount || 0, i:'📦'}].map(s => (
                <div key={s.l} style={{background:'rgba(255,255,255,0.03)', padding:24, borderRadius:16, border:'1px solid rgba(255,255,255,0.05)'}}>
                  <div style={{fontSize:24, marginBottom:8}}>{s.i}</div>
                  <div style={{color:'#64748b', fontSize:12, textTransform:'uppercase'}}>{s.l}</div>
                  <div style={{fontSize:24, fontWeight:700, marginTop:4}}>{s.v}</div>
                </div>
              ))}
            </div>

            {!isActive && (
              <div style={{background:'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(79,70,229,0.05))', border:'1px solid rgba(124,58,237,0.2)', padding:32, borderRadius:20, textAlign:'center'}}>
                <h2 style={{fontSize:20, fontWeight:700, marginBottom:8}}>Activate Your Store</h2>
                <p style={{color:'#94a3b8', marginBottom:24}}>Choose a plan to start receiving orders and managing products.</p>
                <button onClick={() => setView('subscribe')} style={{background:'#7c3aed', color:'white', border:'none', padding:'12px 32px', borderRadius:12, fontWeight:600, cursor:'pointer'}}>View Plans →</button>
              </div>
            )}
          </>
        )}

        {view === 'subscribe' && step === 1 && (
          <div style={{maxWidth:1000, margin:'0 auto'}}>
             <div style={{textAlign:'center', marginBottom:32}}>
                <button onClick={() => setView('dashboard')} style={{background:'none', border:'none', color:'#64748b', cursor:'pointer', marginBottom:16}}>← Back</button>
                <h2 style={{fontSize:28, fontWeight:800}}>Select a Plan</h2>
             </div>
             <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:20}}>
                {PLANS.map(p => (
                  <div key={p.id} onClick={() => {setSelPlan(p.id); setStep(2);}} style={{background:'rgba(255,255,255,0.03)', padding:24, borderRadius:20, border:'1px solid rgba(255,255,255,0.1)', cursor:'pointer'}}>
                    <div style={{fontSize:32, marginBottom:16}}>{p.icon}</div>
                    <div style={{color:p.accent, fontWeight:700, fontSize:18}}>{p.name}</div>
                    <div style={{fontSize:28, fontWeight:800, margin:'12px 0'}}>{p.price} <span style={{fontSize:14, color:'#64748b'}}>EGP/mo</span></div>
                    <button style={{width:'100%', padding:'10px', background:p.accent, color:'white', border:'none', borderRadius:10, fontWeight:600, marginTop:20}}>Select</button>
                  </div>
                ))}
             </div>
          </div>
        )}

        {view === 'subscribe' && step === 2 && (
          <div style={{maxWidth:400, margin:'0 auto', background:'rgba(255,255,255,0.03)', padding:32, borderRadius:20, border:'1px solid rgba(255,255,255,0.1)'}}>
             <h2 style={{marginBottom:24}}>Checkout</h2>
             {error && <div style={{color:'#f87171', marginBottom:16, fontSize:13}}>{error}</div>}
             <div style={{display:'flex', flexDirection:'column', gap:16}}>
                <input value={form.full_name} onChange={e=>setForm({...form, full_name:e.target.value})} placeholder="Full Name" style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', padding:12, borderRadius:10, color:'white'}} />
                <input value={form.phone_number} onChange={e=>setForm({...form, phone_number:e.target.value})} placeholder="Phone (WhatsApp)" style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', padding:12, borderRadius:10, color:'white'}} />
                <select value={form.payment_method} onChange={e=>setForm({...form, payment_method:e.target.value})} style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', padding:12, borderRadius:10, color:'white'}}>
                   <option value="">Select Payment</option>
                   <option value="vodafone_cash">Vodafone Cash</option>
                   <option value="instapay">InstaPay</option>
                </select>
                <button disabled={isPending} onClick={handleSubmit} style={{background:'#7c3aed', color:'white', border:'none', padding:14, borderRadius:12, fontWeight:700, marginTop:10}}>
                   {isPending ? 'Processing...' : 'Request Activation'}
                </button>
             </div>
          </div>
        )}

        {view === 'pending' && (
          <div style={{textAlign:'center', paddingTop:60}}>
             <div style={{fontSize:60, marginBottom:20}}>⏳</div>
             <h2 style={{fontSize:24, fontWeight:700}}>Pending Approval</h2>
             <p style={{color:'#64748b', marginTop:8}}>Your request has been sent. We'll activate your store soon.</p>
             <button onClick={() => setView('dashboard')} style={{marginTop:24, color:'#7c3aed', background:'none', border:'none', cursor:'pointer'}}>Back to Dashboard</button>
          </div>
        )}
      </div>
    </div>
  );
}
