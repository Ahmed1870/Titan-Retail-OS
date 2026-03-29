"use client";
'use client';
import { useState } from 'react';
import { processOrderAction } from '../actions/processOrder';
import { useCart } from '@/modules/store/cart/hooks/useCart';

export default function CheckoutForm({ tenantId, primaryColor }: any) {
  const { items, total, clearCart } = useCart(tenantId);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return alert('Your cart is empty');
    
    setLoading(true);
    const res = await processOrderAction({
      tenantId,
      customerName: formData.name,
      customerPhone: formData.phone,
      address: formData.address,
      items,
      total
    });

    if (res.success) {
      clearCart();
      window.location.href = `/store/success?id=${res.orderId}`;
    } else {
      alert('Error: ' + res.error);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-[#0f171a] p-6 rounded-3xl border border-slate-800">
      <h2 className="text-xl font-black text-white mb-6">Delivery Details</h2>
      
      <input 
        required
        placeholder="Full Name"
        className="w-full bg-[#020617] border border-slate-800 p-4 rounded-xl text-white focus:border-emerald-500 outline-none transition-all"
        onChange={e => setFormData({...formData, name: e.target.value})}
      />
      
      <input 
        required
        type="tel"
        placeholder="Phone Number"
        className="w-full bg-[#020617] border border-slate-800 p-4 rounded-xl text-white focus:border-emerald-500 outline-none transition-all"
        onChange={e => setFormData({...formData, phone: e.target.value})}
      />
      
      <textarea 
        required
        placeholder="Detailed Address"
        className="w-full bg-[#020617] border border-slate-800 p-4 rounded-xl text-white focus:border-emerald-500 outline-none transition-all h-32"
        onChange={e => setFormData({...formData, address: e.target.value})}
      />

      <div className="pt-4 border-t border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <span className="text-slate-400 font-bold">Total Amount</span>
          <span className="text-2xl font-black text-white">{total} EGP</span>
        </div>
        
        <button 
          disabled={loading}
          style={{ backgroundColor: primaryColor }}
          className="w-full py-4 rounded-2xl text-white font-black text-lg shadow-xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? 'Processing Order...' : 'Confirm Order'}
        </button>
      </div>
    </form>
  );
}
