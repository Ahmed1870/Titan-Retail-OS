import { supabase } from '@/lib/supabase/client';
import ProductCard from './ProductCard';

export default async function PublicStore({ params }: { params: { slug: string } }) {
  const { data: tenant } = await supabase.from('tenants').select('*').eq('slug', params.slug).single();
  const { data: products } = await supabase.from('products').select('*').eq('tenant_id', tenant?.id);

  if (!tenant) return <div className="p-20 text-center">Store not found</div>;

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <nav className="p-6 bg-white border-b flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-2xl font-black text-purple-600">{tenant.store_name}</h1>
        <div className="bg-black text-white px-4 py-2 rounded-full text-sm">Cart: 0</div>
      </nav>
      <main className="p-8 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {products?.map(p => (
          <div key={p.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="aspect-square bg-gray-100 rounded-xl mb-4"></div>
            <h3 className="font-bold text-gray-800">{p.name}</h3>
            <p className="text-purple-600 font-black mt-1">{p.price} EGP</p>
            <button className="w-full mt-4 bg-gray-900 text-white py-2 rounded-lg text-sm">Add to Cart</button>
          </div>
        ))}
      </main>
    </div>
  );
}
