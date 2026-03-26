'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: tenant } = await supabase.from('tenants').select('id').eq('owner_id', user?.id).single();
    const { data } = await supabase.from('products').select('*').eq('tenant_id', tenant?.id);
    setProducts(data || []);
  }

  async function addProduct() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: tenant } = await supabase.from('tenants').select('id').eq('owner_id', user?.id).single();
    
    await supabase.from('products').insert({
      tenant_id: tenant?.id,
      name,
      price: parseFloat(price),
      sku: 'SKU-' + Math.random().toString(36).toUpperCase().substring(7)
    });
    
    setName(''); setPrice('');
    fetchProducts();
  }

  return (
    <div className="p-8 text-white bg-[#080c14] min-h-screen">
      <h1 className="text-2xl font-bold mb-6">إدارة المنتجات</h1>
      <div className="flex gap-4 mb-10">
        <input placeholder="اسم المنتج" value={name} onChange={e=>setName(e.target.value)} className="bg-white/5 border p-2 rounded" />
        <input placeholder="السعر" value={price} onChange={e=>setPrice(e.target.value)} className="bg-white/5 border p-2 rounded" />
        <button onClick={addProduct} className="bg-purple-600 px-6 py-2 rounded">إضافة</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map(p => (
          <div key={p.id} className="bg-white/5 p-4 rounded border border-white/10">
            <p className="font-bold">{p.name}</p>
            <p className="text-purple-400">{p.price} EGP</p>
          </div>
        ))}
      </div>
    </div>
  );
}
