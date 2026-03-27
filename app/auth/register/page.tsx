'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', password: '', full_name: '', store_name: '', phone: '', referral_code: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  const inp: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 14px', color: '#e2e8f0', fontSize: 14, outline: 'none', width: '100%' };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
    router.push('/merchant');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080c14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 16px' }}>⬡</div>
          <h1 style={{ color: '#f1f5f9', fontSize: 24, fontWeight: 700 }}>Create Your Store</h1>
          <p style={{ color: '#475569', fontSize: 14, marginTop: 6 }}>Free to start — no credit card needed</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', padding: '10px 14px', borderRadius: 10, fontSize: 13 }}>{error}</div>}
          {[{k:'full_name',p:'Full Name',t:'text'},{k:'store_name',p:'Store Name',t:'text'},{k:'email',p:'Email',t:'email'},{k:'password',p:'Password (min 8 chars)',t:'password'},{k:'phone',p:'Phone (optional)',t:'tel'},{k:'referral_code',p:'Referral Code (optional)',t:'text'}].map(({k,p,t})=>(
            <input key={k} type={t} placeholder={p} value={(form as any)[k]} onChange={set(k)} required={!['phone','referral_code'].includes(k)} style={inp} />
          ))}
          <button type="submit" disabled={loading} style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: 'white', border: 'none', borderRadius: 10, padding: '13px 0', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: 4 }}>
            {loading ? 'Creating...' : 'Create Store →'}
          </button>
          <p style={{ textAlign: 'center', color: '#475569', fontSize: 13 }}>Already have an account? <a href="/auth/login" style={{ color: '#7c3aed', textDecoration: 'none' }}>Sign in</a></p>
        </form>
      </div>
    </div>
  );
}
