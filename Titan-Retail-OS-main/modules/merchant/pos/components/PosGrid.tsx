"use client";
'use client';
import { useState } from 'react';

export default function PosGrid({ products, onAddToCard }: any) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-2">
      {products.map((product: any) => (
        <button 
          key={product.id}
          onClick={() => onAddToCard(product)}
          className="bg-[#0f171a] border border-slate-800 p-4 rounded-2xl active:scale-95 transition-all text-left group hover:border-emerald-500/50"
        >
          <p className="text-[10px] text-slate-500 font-bold uppercase truncate">{product.category}</p>
          <h3 className="text-white font-black text-sm truncate mb-2">{product.name}</h3>
          <div className="flex justify-between items-center">
            <span className="text-emerald-400 font-black">{product.price} <small className="text-[8px]">EGP</small></span>
            <span className="text-[9px] bg-slate-900 px-2 py-0.5 rounded text-slate-400">Stock: {product.stock}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
