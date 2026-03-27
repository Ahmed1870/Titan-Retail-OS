'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
    router.push('/');
  };

  const inp: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 14px', color: '#e2e8f0', fontSize: 14, outline: 'none', width: '100%' };

  return (
    <div style={{ minHeight: '100vh', background: '#080c14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 400, padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 16px' }}>⬡</div>
          <h1 style={{ color: '#f1f5f9', fontSize: 26, fontWeight: 700 }}>Titan Retail OS</h1>
          <p style={{ color: '#475569', fontSize: 14, marginTop: 6 }}>Sign in to your account</p>
        </div>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', padding: '10px 14px', borderRadius: 10, fontSize: 13 }}>{error}</div>}
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={inp} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={inp} />
          <button type="submit" disabled={loading} style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: 'white', border: 'none', borderRadius: 10, padding: '13px 0', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <a href="/auth/register" style={{ color: '#7c3aed', textDecoration: 'none' }}>Create account</a>
            <a href="/auth/reset-password" style={{ color: '#475569', textDecoration: 'none' }}>Forgot password?</a>
          </div>
        </form>
      </div>
    </div>
  );
}
