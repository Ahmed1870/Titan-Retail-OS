'use client';
import { useState } from 'react';
import { updateSettingsAction } from '@/modules/merchant/actions/settings';

export default function SettingsForm({ initialSettings }: { initialSettings: any }) {
  const [settings, setSettings] = useState(initialSettings || {});
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const result = await updateSettingsAction(settings);
    setLoading(false);
    if (result.success) alert('Settings Synced with Titan OS!');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
        <h3 className="text-white font-bold mb-4">Store Identity</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="text-xs text-slate-500 uppercase font-bold">Primary Color</label>
            <input 
              type="color" 
              value={settings.primaryColor || '#10b981'} 
              onChange={(e) => setSettings({...settings, primaryColor: e.target.value})}
              className="block w-full h-10 mt-1 bg-transparent rounded-lg cursor-pointer"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 uppercase font-bold">Delivery Fee (EGP)</label>
            <input 
              type="number" 
              value={settings.deliveryFee || 0} 
              onChange={(e) => setSettings({...settings, deliveryFee: Number(e.target.value)})}
              className="w-full bg-[#080c14] border border-slate-700 rounded-lg p-2 text-white mt-1"
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
        <h3 className="text-white font-bold mb-4">Social Links</h3>
        <input 
          placeholder="WhatsApp Number"
          value={settings.whatsapp || ''}
          onChange={(e) => setSettings({...settings, whatsapp: e.target.value})}
          className="w-full bg-[#080c14] border border-slate-700 rounded-lg p-2 text-white mb-3"
        />
        <input 
          placeholder="Facebook Page URL"
          value={settings.facebook || ''}
          onChange={(e) => setSettings({...settings, facebook: e.target.value})}
          className="w-full bg-[#080c14] border border-slate-700 rounded-lg p-2 text-white"
        />
      </div>

      <button 
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-900/20"
      >
        {loading ? 'Propagating Changes...' : 'Save Configuration'}
      </button>
    </div>
  );
}
