'use client';
import { motion } from 'framer-motion';
import { BarChart3, Users, Package, TrendingUp, Bell, Settings } from 'lucide-react';

export default function MerchantDashboardClient({ data }: { data: any }) {
  // الحماية القصوى لمنع الـ TypeError
  const stats = data?.stats || [
    { label: "إجمالي المبيعات", value: "0.00 ج.م", icon: TrendingUp, color: "text-emerald-500" },
    { label: "الطلبات النشطة", value: "0", icon: Package, color: "text-violet-500" },
    { label: "العملاء الجدد", value: "0", icon: Users, color: "text-blue-500" }
  ];

  return (
    <div className="min-h-screen bg-[#020408] text-white p-4 md:p-8" dir="rtl">
      {/* Header */}
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-black tracking-tight">لوحة القيادة</h1>
          <p className="text-gray-500 text-sm mt-1">أهلاً بك في مركز تحكم تايتان</p>
        </div>
        <div className="flex gap-4">
          <button className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all"><Bell size={20} /></button>
          <button className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all"><Settings size={20} /></button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {stats.map((stat: any, i: number) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="p-8 rounded-[35px] bg-gradient-to-b from-white/[0.05] to-transparent border border-white/[0.08] hover:border-violet-500/30 transition-all group">
            <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 ${stat.color} group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} />
            </div>
            <p className="text-gray-500 text-sm font-bold mb-2 uppercase tracking-wider">{stat.label}</p>
            <p className="text-3xl font-black text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area (Inventory/Orders Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] min-h-[300px]">
          <h3 className="text-xl font-black mb-6 flex items-center gap-3"><Package className="text-violet-500" /> حركة المخزون اللحظية</h3>
          <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-white/5 rounded-[30px]">
             <p className="text-gray-600 text-sm">لا توجد بيانات حركة حالياً</p>
          </div>
        </div>
        <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] min-h-[300px]">
          <h3 className="text-xl font-black mb-6 flex items-center gap-3"><BarChart3 className="text-violet-500" /> تحليل المبيعات</h3>
          <div className="w-full h-48 bg-gradient-to-r from-violet-500/5 to-transparent rounded-[30px] border border-white/5" />
        </div>
      </div>
    </div>
  );
}
