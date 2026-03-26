'use client';
import { useEffect, useState } from 'react';

export default function AdminAnalytics() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/analytics').then(res => res.json()).then(setData);
  }, []);

  return (
    <div className="p-10 text-white bg-[#0b0f1a] min-h-screen">
      <h1 className="text-3xl font-black mb-10">TITAN GLOBAL ANALYTICS</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-purple-600/20 p-8 rounded-3xl border border-purple-500/30">
          <p className="text-purple-400">Total Merchants</p>
          <h2 className="text-4xl font-black mt-2">{data?.total_tenants}</h2>
        </div>
        <div className="bg-green-600/20 p-8 rounded-3xl border border-green-500/30">
          <p className="text-green-400">Total Revenue (EGP)</p>
          <h2 className="text-4xl font-black mt-2">{data?.total_revenue}</h2>
        </div>
      </div>
    </div>
  );
}
