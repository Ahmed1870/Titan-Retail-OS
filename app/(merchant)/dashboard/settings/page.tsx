'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function SettingsPage() {
  const [storeName, setStoreName] = useState('');
  
  const updateStore = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('tenants').update({ store_name: storeName }).eq('owner_id', user?.id);
    alert('Updated!');
  };

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-bold mb-6">إعدادات المتجر</h1>
      <input 
        className="bg-white/5 border border-white/10 p-3 rounded-lg w-full max-w-md"
        placeholder="Store Display Name"
        onChange={(e) => setStoreName(e.target.value)}
      />
      <button onClick={updateStore} className="block mt-4 bg-white text-black px-8 py-2 rounded-lg font-bold">Save</button>
    </div>
  );
}
