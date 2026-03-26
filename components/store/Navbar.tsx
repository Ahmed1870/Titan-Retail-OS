import { useCart } from '@/hooks/useCart'

export default function StoreNavbar({ storeName }: { storeName: string }) {
  const { items } = useCart()
  return (
    <nav className="p-6 flex justify-between items-center bg-black/50 backdrop-blur-xl sticky top-0 z-50 border-b border-white/5">
      <h1 className="text-white font-black italic uppercase tracking-tighter text-xl">{storeName}</h1>
      <div className="flex gap-6 items-center">
        <button className="text-[10px] font-black italic text-[#00ff88] uppercase border border-[#00ff88]/20 px-4 py-2 rounded-full">
          Cart ({items.length})
        </button>
      </div>
    </nav>
  )
}
