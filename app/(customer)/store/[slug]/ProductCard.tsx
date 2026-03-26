'use client';
export default function ProductCard({ product, onAdd }: any) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 transition-transform hover:scale-[1.02]">
      <div className="aspect-square bg-gray-50 rounded-xl mb-4 flex items-center justify-center text-gray-300">
        No Image
      </div>
      <h3 className="font-bold text-gray-800 h-12 overflow-hidden">{product.name}</h3>
      <div className="flex justify-between items-center mt-4">
        <p className="text-purple-600 font-black">{product.price} EGP</p>
        <button 
          onClick={() => onAdd(product)}
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold active:scale-95 transition"
        >
          + Add
        </button>
      </div>
    </div>
  );
}
