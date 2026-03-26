'use client';
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const supabase = createClientComponentClient();

  const handleReset = async () => {
    const { error } = await supabase.auth.updateUser({ password });
    if (!error) alert('PASSWORD_INITIALIZED_SUCCESSFULLY');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md border border-[#00ff88]/20 p-8 glass-effect">
        <h2 className="text-2xl font-black text-[#00ff88] uppercase italic mb-6">Reset_Core_Key</h2>
        <input type="password" placeholder="New_Passkey" onChange={e=>setPassword(e.target.value)} className="w-full p-3 bg-white/5 border border-white/10 rounded mb-4 text-white font-mono" />
        <button onClick={handleReset} className="w-full bg-[#00ff88] text-black font-black py-3 uppercase italic">Inject_New_Password</button>
      </div>
    </div>
  );
}
