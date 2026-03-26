import { useState, useEffect, useRef } from "react";
import { supabase } from "./lib/supabase/client";
import { subscriptionService } from "./services/subscriptionService";

// الألوان والأسعار (ثوابت التصميم)
const PLAN_COLORS = { starter: "#38bdf8", pro: "#a78bfa", enterprise: "#fb923c" };
const PLAN_PRICES = { starter: "299 EGP", pro: "599 EGP", enterprise: "1,299 EGP" };

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. جلب البيانات عند التحميل
  useEffect(() => {
    async function loadData() {
      const data = await subscriptionService.getPendingRequests();
      setRequests(data);
      setLoading(false);
    }
    loadData();

    // 2. تفعيل الـ Realtime (الاهتزاز الحقيقي)
    const channel = supabase
      .channel('realtime_subs')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'subscription_requests' 
      }, (payload) => {
        // إضافة الطلب الجديد فوراً للقائمة
        setRequests(prev => [payload.new, ...prev]);
        // هنا ممكن تشغل صوت التنبيه اللي عملناه
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleApprove = async (id, tenantId, plan) => {
    try {
      await subscriptionService.approveRequest(id, tenantId, plan);
      setRequests(r => r.filter(x => x.id !== id));
      alert("✅ تم تفعيل حساب التاجر بنجاح!");
    } catch (err) {
      alert("❌ خطأ في التفعيل: " + err.message);
    }
  };

  if (loading) return <div style={{color: 'white', padding: 20}}>Loading Titan OS...</div>;

  return (
    <div style={{ background: "#080c14", minHeight: "100vh", color: "white", padding: "20px" }}>
      <h1>Titan Admin - Realtime Mode</h1>
      <div style={{ display: "grid", gap: "15px", marginTop: "20px" }}>
        {requests.map(req => (
          <div key={req.id} style={{ background: "rgba(255,255,255,0.05)", padding: "15px", borderRadius: "10px", border: "1px solid #7c3aed44" }}>
            <div style={{ fontWeight: 'bold' }}>{req.tenants?.store_name || "New Store"}</div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Plan: {req.plan} | Method: {req.payment_method}</div>
            <button 
              onClick={() => handleApprove(req.id, req.tenant_id, req.plan)}
              style={{ marginTop: "10px", background: "#4ade80", color: "black", border: "none", padding: "5px 15px", borderRadius: "5px", cursor: "pointer" }}
            >
              Approve & Activate
            </button>
          </div>
        ))}
        {requests.length === 0 && <p>لا يوجد طلبات معلقة حالياً.</p>}
      </div>
    </div>
  );
}
