'use client';

export default function ThermalInvoice({ order, storeName }: { order: any, storeName: string }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* زر الطباعة يظهر فقط في الشاشة وليس في الورق */}
      <button 
        onClick={handlePrint}
        className="print:hidden mb-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2 px-4 rounded-lg"
      >
        🖨️ Print Receipt
      </button>

      {/* تصميم الفاتورة - أبيض وأسود للطباعة الحرارية */}
      <div className="bg-white text-black p-4 w-[80mm] mx-auto font-mono text-xs" id="printable-receipt">
        <div className="text-center border-b-2 border-dashed border-black pb-3 mb-3">
          <h2 className="font-black text-xl uppercase">{storeName}</h2>
          <p className="text-[10px] mt-1">Order #{order.id.substring(0, 8)}</p>
          <p className="text-[10px]">{new Date(order.created_at).toLocaleDateString()}</p>
        </div>

        <div className="space-y-2 border-b-2 border-dashed border-black pb-3 mb-3">
          <div className="flex justify-between font-bold">
            <span>Item</span>
            <span>Total</span>
          </div>
          {/* محاكاة الأصناف - في الواقع سنجلبها من order_items */}
          <div className="flex justify-between">
            <span>1x Product Name</span>
            <span>{order.total}</span>
          </div>
        </div>

        <div className="text-right font-black text-sm mb-4">
          Total: {order.total} EGP
        </div>

        <div className="text-center text-[10px]">
          <p className="font-bold">Customer: {order.customer_name || 'Walk-in'}</p>
          <p>{order.customer_phone}</p>
          <p className="mt-4 italic">Powered by Titan OS</p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #printable-receipt, #printable-receipt * { visibility: visible; }
          #printable-receipt { position: absolute; left: 0; top: 0; }
        }
      `}</style>
    </div>
  );
}
