export default function ProductCard({ product }: { product: any }) {
  return (
    <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-4 hover:border-[#00ff88]/30 transition-all group">
      <div className="aspect-square bg-white/5 rounded-lg mb-4 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <span className="absolute bottom-2 left-2 text-[10px] font-black text-[#00ff88] italic uppercase">
          SKU: {product.sku}
        </span>
      </div>
      <h4 className="text-white font-black italic uppercase text-sm mb-1">{product.name}</h4>
      <div className="flex justify-between items-center">
        <p className="text-[#00ff88] font-mono text-xs">{product.price} EGP</p>
        <p className="text-gray-500 text-[10px] uppercase font-bold">Stock: {product.inventory?.[0]?.quantity || 0}</p>
      </div>
    </div>
  )
}
