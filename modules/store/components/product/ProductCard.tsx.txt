"use client";
'use client';
import { useCart } from '@/modules/store/cart/hooks/useCart';

export default function ProductCard({ product, tenantId, primaryColor }: any) {
  const { addToCart } = useCart(tenantId);

  return (
    <div className="group bg-[#0f171a] border border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all duration-300">
      <div className="aspect-square relative overflow-hidden bg-slate-900">
        <img 
          src={product.images?.[0] || '/placeholder.png'} 
          alt={product.name}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      
      <div className="p-4">
        <h3 className="text-white font-bold text-lg truncate">{product.name}</h3>
        <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest">{product.category}</p>
        
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-black text-white">
            {product.price} <span className="text-[10px] font-normal text-slate-500">EGP</span>
          </span>
          
          <button 
            onClick={() => addToCart(product)}
            style={{ backgroundColor: primaryColor }}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg hover:brightness-110 transition-all active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
