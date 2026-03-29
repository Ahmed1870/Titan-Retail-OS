"use client";
import { getStoreDataAction } from '@/modules/store/actions';
import { notFound } from 'next/navigation';

export default async function StorePage({ params }: { params: { slug: string } }) {
  const { data, error } = await getStoreDataAction(params.slug);

  if (error === 'STORE_NOT_FOUND' || !data) {
    notFound();
  }

  if (error === 'STORE_INACTIVE') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080c14] text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold">This store is currently offline</h1>
          <p className="text-slate-400">Please check back later.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0f1a] text-slate-200 p-4 font-sans">
      <header className="max-w-4xl mx-auto mb-10 text-center">
        <h1 className="text-4xl font-black text-white mb-2">{data.tenant.store_name}</h1>
        <div className="h-1 w-20 bg-emerald-500 mx-auto rounded-full"></div>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.products.map((product) => (
          <div key={product.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg transition-transform hover:scale-[1.02]">
            <div className="aspect-square bg-slate-800 flex items-center justify-center text-slate-500">
              {product.images?.[0] ? <img src={product.images[0]} alt={product.name} /> : "No Image"}
            </div>
            <div className="p-4">
              <h3 className="font-bold text-white truncate">{product.name}</h3>
              <p className="text-emerald-400 font-mono font-bold mt-1">{product.price} EGP</p>
              <div className="mt-3 flex justify-between items-center text-xs">
                <span className={product.stock > 0 ? "text-slate-400" : "text-red-500 font-bold"}>
                  {product.stock > 0 ? `In Stock: ${product.stock}` : "Out of Stock"}
                </span>
                <button 
                  disabled={product.stock <= 0}
                  className="bg-emerald-600 disabled:bg-slate-700 text-white px-3 py-1 rounded-md font-medium"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
