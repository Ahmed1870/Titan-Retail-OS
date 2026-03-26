import { useState, useEffect, useRef } from "react";

// ─── MOCK DATA ────────────────────────────────────────────────
const MOCK_PENDING = [
  { id: "req_001", tenant_id: "TNT_8821", full_name: "Omar Khaled", plan: "pro", payment_method: "vodafone_cash", phone_number: "01012345678", created_at: new Date(Date.now() - 4 * 60000).toISOString(), tenants: { store_name: "Cairo Electronics", logo_url: null } },
  { id: "req_002", tenant_id: "TNT_4432", full_name: "Sara Ibrahim", plan: "enterprise", payment_method: "instapay", phone_number: "01198765432", created_at: new Date(Date.now() - 12 * 60000).toISOString(), tenants: { store_name: "Nile Boutique", logo_url: null } },
  { id: "req_003", tenant_id: "TNT_9901", full_name: "Ahmed Hassan", plan: "starter", payment_method: "bank_transfer", phone_number: "01234567890", created_at: new Date(Date.now() - 38 * 60000).toISOString(), tenants: { store_name: "Delta Gadgets", logo_url: null } },
];

const MOCK_STATS = { revenue_30d: 184250, orders_total: 2847, active_tenants: 142, pending_requests: 3, growth_pct: 18.4 };
const MOCK_REVENUE = [
  { date: "Mar 1", value: 4200 }, { date: "Mar 5", value: 6800 }, { date: "Mar 8", value: 5100 },
  { date: "Mar 12", value: 9400 }, { date: "Mar 15", value: 7200 }, { date: "Mar 18", value: 11000 },
  { date: "Mar 21", value: 8700 }, { date: "Mar 24", value: 13400 }, { date: "Mar 26", value: 10200 },
];
const MOCK_TENANTS = [
  { id: "TNT_8821", store_name: "Cairo Electronics", plan_status: "active", current_plan: "pro", created_at: "2025-11-14", owner_email: "omar@cairo.eg" },
  { id: "TNT_4432", store_name: "Nile Boutique", plan_status: "pending", current_plan: "enterprise", created_at: "2026-01-02", owner_email: "sara@nile.eg" },
  { id: "TNT_9901", store_name: "Delta Gadgets", plan_status: "inactive", current_plan: "starter", created_at: "2026-02-28", owner_email: "ahmed@delta.eg" },
  { id: "TNT_1177", store_name: "Alex Fashion", plan_status: "active", current_plan: "pro", created_at: "2025-09-05", owner_email: "mona@alex.eg" },
  { id: "TNT_5534", store_name: "Suez Imports", plan_status: "suspended", current_plan: "starter", created_at: "2025-12-18", owner_email: "khaled@suez.eg" },
];

const PLAN_COLORS = { starter: "#38bdf8", pro: "#a78bfa", enterprise: "#fb923c" };
const PLAN_PRICES = { starter: "299 EGP", pro: "599 EGP", enterprise: "1,299 EGP" };
const STATUS_COLORS = { active: "#4ade80", pending: "#fbbf24", inactive: "#6b7280", suspended: "#f87171", cancelled: "#f87171" };

function ago(iso) {
  const mins = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

function StatCard({ label, value, sub, accent, icon }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 8, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle at top right, ${accent}22, transparent 70%)`, borderRadius: "0 16px 0 0" }} />
      <div style={{ fontSize: 24, lineHeight: 1 }}>{icon}</div>
      <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
      <div style={{ color: "#f1f5f9", fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>{value}</div>
      {sub && <div style={{ color: accent, fontSize: 12 }}>{sub}</div>}
    </div>
  );
}

function SparkLine({ data }) {
  const max = Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));
  const W = 320, H = 80, pad = 8;
  const pts = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (W - pad * 2);
    const y = pad + (1 - (d.value - min) / (max - min || 1)) * (H - pad * 2);
    return [x, y];
  });
  const path = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
  const area = `${path} L${pts[pts.length - 1][0]},${H} L${pts[0][0]},${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 80 }}>
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sg)" />
      <path d={path} fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="#a78bfa" />
      ))}
    </svg>
  );
}

function RequestCard({ req, onApprove, onReject, isNew }) {
  const [shaking, setShaking] = useState(isNew);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    if (isNew) { setShaking(true); setTimeout(() => setShaking(false), 800); }
  }, [isNew]);

  const handleApprove = async () => {
    setApproving(true);
    await new Promise(r => setTimeout(r, 900));
    onApprove(req.id);
  };
  const handleReject = async () => {
    setRejecting(true);
    await new Promise(r => setTimeout(r, 600));
    onReject(req.id);
  };

  const planColor = PLAN_COLORS[req.plan] || "#94a3b8";

  return (
    <div style={{
      background: isNew ? "rgba(167,139,250,0.08)" : "rgba(255,255,255,0.04)",
      border: `1px solid ${isNew ? "rgba(167,139,250,0.4)" : "rgba(255,255,255,0.08)"}`,
      borderRadius: 14,
      padding: "16px 20px",
      display: "flex",
      flexDirection: "column",
      gap: 12,
      animation: shaking ? "shake 0.5s ease" : "none",
      transition: "all 0.3s ease",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `${planColor}22`, border: `1px solid ${planColor}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
            🏪
          </div>
          <div>
            <div style={{ color: "#f1f5f9", fontWeight: 600, fontSize: 14 }}>{req.tenants.store_name}</div>
            <div style={{ color: "#64748b", fontSize: 12 }}>{req.full_name} · {req.phone_number}</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <span style={{ background: `${planColor}22`, color: planColor, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, border: `1px solid ${planColor}44`, textTransform: "uppercase" }}>
            {req.plan}
          </span>
          <span style={{ color: "#475569", fontSize: 11 }}>{ago(req.created_at)}</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, fontSize: 12 }}>
        <span style={{ background: "rgba(255,255,255,0.06)", color: "#94a3b8", padding: "4px 10px", borderRadius: 20 }}>
          💳 {req.payment_method.replace(/_/g, " ")}
        </span>
        <span style={{ background: "rgba(255,255,255,0.06)", color: "#94a3b8", padding: "4px 10px", borderRadius: 20 }}>
          💰 {PLAN_PRICES[req.plan]}
        </span>
        <span style={{ background: "rgba(255,255,255,0.06)", color: "#94a3b8", padding: "4px 10px", borderRadius: 20, fontFamily: "monospace" }}>
          {req.tenant_id}
        </span>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={handleApprove} disabled={approving || rejecting} style={{
          flex: 1, padding: "8px 0", borderRadius: 10, border: "none", cursor: "pointer",
          background: approving ? "rgba(74,222,128,0.3)" : "rgba(74,222,128,0.15)",
          color: "#4ade80", fontWeight: 600, fontSize: 13,
          transition: "all 0.2s", opacity: (approving || rejecting) ? 0.7 : 1
        }}>
          {approving ? "✅ Approving..." : "✓ Approve"}
        </button>
        <button onClick={handleReject} disabled={approving || rejecting} style={{
          flex: 1, padding: "8px 0", borderRadius: 10, border: "none", cursor: "pointer",
          background: rejecting ? "rgba(248,113,113,0.3)" : "rgba(248,113,113,0.1)",
          color: "#f87171", fontWeight: 600, fontSize: 13,
          transition: "all 0.2s", opacity: (approving || rejecting) ? 0.7 : 1
        }}>
          {rejecting ? "❌ Rejecting..." : "✕ Reject"}
        </button>
      </div>
    </div>
  );
}

function TenantRow({ tenant }) {
  const sc = STATUS_COLORS[tenant.plan_status] || "#6b7280";
  const pc = PLAN_COLORS[tenant.current_plan] || "#94a3b8";
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 90px 120px", gap: 16, padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", alignItems: "center", transition: "background 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
      <div>
        <div style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 500 }}>{tenant.store_name}</div>
        <div style={{ color: "#475569", fontSize: 12 }}>{tenant.owner_email}</div>
      </div>
      <span style={{ background: `${pc}18`, color: pc, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, textTransform: "uppercase", justifySelf: "start" }}>
        {tenant.current_plan}
      </span>
      <span style={{ background: `${sc}18`, color: sc, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, textTransform: "capitalize", justifySelf: "start" }}>
        ● {tenant.plan_status}
      </span>
      <div style={{ color: "#475569", fontSize: 12 }}>{tenant.created_at}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  const [requests, setRequests] = useState(MOCK_PENDING);
  const [toasts, setToasts] = useState([]);
  const [newReqId, setNewReqId] = useState(null);
  const [autoActivation, setAutoActivation] = useState(false);
  const audioCtx = useRef(null);

  const addToast = (msg, type = "success") => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };

  const playAlert = () => {
    try {
      if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.current.createOscillator();
      const gain = audioCtx.current.createGain();
      osc.connect(gain); gain.connect(audioCtx.current.destination);
      osc.frequency.value = 440; gain.gain.value = 0.1;
      osc.start(); gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.current.currentTime + 0.5);
      setTimeout(() => osc.stop(), 500);
    } catch {}
  };

  // Simulate incoming realtime request
  useEffect(() => {
    const timer = setTimeout(() => {
      const newReq = {
        id: "req_NEW", tenant_id: "TNT_7712", full_name: "Layla Mostafa",
        plan: "pro", payment_method: "vodafone_cash", phone_number: "01155667788",
        created_at: new Date().toISOString(),
        tenants: { store_name: "Luxor Crafts", logo_url: null }
      };
      setRequests(r => [newReq, ...r]);
      setNewReqId("req_NEW");
      playAlert();
      addToast("🔔 New subscription request from Luxor Crafts", "info");
      setTimeout(() => setNewReqId(null), 3000);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleApprove = (id) => {
    setRequests(r => r.filter(x => x.id !== id));
    addToast("✅ Subscription approved & tenant activated", "success");
  };

  const handleReject = (id) => {
    setRequests(r => r.filter(x => x.id !== id));
    addToast("❌ Request rejected", "error");
  };

  const NAV = [
    { id: "overview", label: "Overview", icon: "◎" },
    { id: "requests", label: "Requests", icon: "⚡", badge: requests.length },
    { id: "tenants", label: "Tenants", icon: "🏢" },
    { id: "analytics", label: "Analytics", icon: "📊" },
    { id: "settings", label: "Settings", icon: "⚙" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#080c14", fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif", color: "#e2e8f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes slideIn { from { opacity:0; transform:translateY(-12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
      `}</style>

      {/* Toast Stack */}
      <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: t.type === "success" ? "rgba(74,222,128,0.15)" : t.type === "error" ? "rgba(248,113,113,0.15)" : "rgba(167,139,250,0.15)",
            border: `1px solid ${t.type === "success" ? "rgba(74,222,128,0.3)" : t.type === "error" ? "rgba(248,113,113,0.3)" : "rgba(167,139,250,0.3)"}`,
            color: "#f1f5f9", padding: "12px 18px", borderRadius: 12, fontSize: 13, fontWeight: 500,
            animation: "slideIn 0.3s ease", backdropFilter: "blur(20px)", maxWidth: 340,
          }}>{t.msg}</div>
        ))}
      </div>

      <div style={{ display: "flex", height: "100vh" }}>
        {/* Sidebar */}
        <div style={{ width: 220, background: "rgba(255,255,255,0.02)", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", padding: "24px 0" }}>
          {/* Logo */}
          <div style={{ padding: "0 20px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #7c3aed, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⬡</div>
              <div>
                <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em" }}>Titan</div>
                <div style={{ color: "#475569", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>Retail OS</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "0 12px", display: "flex", flexDirection: "column", gap: 2 }}>
            {NAV.map(n => (
              <button key={n.id} onClick={() => setTab(n.id)} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10,
                border: "none", cursor: "pointer", background: tab === n.id ? "rgba(124,58,237,0.2)" : "transparent",
                color: tab === n.id ? "#a78bfa" : "#64748b", fontWeight: tab === n.id ? 600 : 400,
                fontSize: 14, transition: "all 0.15s", width: "100%", textAlign: "left",
                borderLeft: tab === n.id ? "2px solid #7c3aed" : "2px solid transparent",
              }}>
                <span style={{ fontSize: 16 }}>{n.icon}</span>
                <span style={{ flex: 1 }}>{n.label}</span>
                {n.badge > 0 && (
                  <span style={{ background: "#7c3aed", color: "white", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 20, animation: "pulse 2s infinite" }}>
                    {n.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Admin badge */}
          <div style={{ padding: "0 12px" }}>
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 12px", display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg, #7c3aed44, #4f46e544)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>👤</div>
              <div>
                <div style={{ color: "#cbd5e1", fontSize: 12, fontWeight: 600 }}>Admin</div>
                <div style={{ color: "#475569", fontSize: 10 }}>Super Admin</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, overflow: "auto", padding: "32px" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, animation: "fadeUp 0.4s ease" }}>
            <div>
              <h1 style={{ color: "#f1f5f9", fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>
                {tab === "overview" && "Command Center"}
                {tab === "requests" && "Subscription Requests"}
                {tab === "tenants" && "Tenant Directory"}
                {tab === "analytics" && "Analytics"}
                {tab === "settings" && "System Settings"}
              </h1>
              <p style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>
                {new Date().toLocaleDateString("en-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", animation: "pulse 2s infinite" }} />
              <span style={{ color: "#4ade80", fontSize: 12, fontWeight: 500 }}>Realtime Active</span>
            </div>
          </div>

          {/* OVERVIEW TAB */}
          {tab === "overview" && (
            <div style={{ animation: "fadeUp 0.4s ease" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
                <StatCard label="Revenue (30d)" value={`${(MOCK_STATS.revenue_30d / 1000).toFixed(1)}K EGP`} sub={`+${MOCK_STATS.growth_pct}% vs last month`} accent="#a78bfa" icon="💰" />
                <StatCard label="Total Orders" value={MOCK_STATS.orders_total.toLocaleString()} sub="All time" accent="#38bdf8" icon="📦" />
                <StatCard label="Active Tenants" value={MOCK_STATS.active_tenants} sub="Merchants on platform" accent="#4ade80" icon="🏢" />
                <StatCard label="Pending Requests" value={requests.length} sub="Needs your attention" accent="#fb923c" icon="⚡" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
                {/* Chart */}
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24 }}>
                  <div style={{ color: "#94a3b8", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Revenue Trend</div>
                  <div style={{ color: "#f1f5f9", fontSize: 22, fontWeight: 700, marginBottom: 16 }}>{(MOCK_STATS.revenue_30d / 1000).toFixed(1)}K EGP</div>
                  <SparkLine data={MOCK_REVENUE} />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                    {MOCK_REVENUE.filter((_, i) => i % 3 === 0).map(d => (
                      <span key={d.date} style={{ color: "#475569", fontSize: 10 }}>{d.date}</span>
                    ))}
                  </div>
                </div>

                {/* Plan Distribution */}
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24 }}>
                  <div style={{ color: "#94a3b8", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Plan Mix</div>
                  {[{ plan: "enterprise", count: 14, pct: 10 }, { plan: "pro", count: 78, pct: 55 }, { plan: "starter", count: 50, pct: 35 }].map(p => (
                    <div key={p.plan} style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ color: PLAN_COLORS[p.plan], fontSize: 13, fontWeight: 600, textTransform: "capitalize" }}>{p.plan}</span>
                        <span style={{ color: "#64748b", fontSize: 12 }}>{p.count} merchants</span>
                      </div>
                      <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 10, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${p.pct}%`, background: PLAN_COLORS[p.plan], borderRadius: 10, transition: "width 1s ease" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* REQUESTS TAB */}
          {tab === "requests" && (
            <div style={{ animation: "fadeUp 0.4s ease" }}>
              {requests.length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px 0", color: "#475569" }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: "#64748b" }}>All clear</div>
                  <div style={{ fontSize: 14, marginTop: 4 }}>No pending subscription requests</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 680 }}>
                  <div style={{ color: "#64748b", fontSize: 13, marginBottom: 4 }}>
                    {requests.length} pending request{requests.length !== 1 ? "s" : ""} — approve to activate tenant instantly
                  </div>
                  {requests.map(r => (
                    <RequestCard key={r.id} req={r} onApprove={handleApprove} onReject={handleReject} isNew={r.id === newReqId} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TENANTS TAB */}
          {tab === "tenants" && (
            <div style={{ animation: "fadeUp 0.4s ease" }}>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 90px 120px", gap: 16, padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
                  {["Store", "Plan", "Status", "Joined"].map(h => (
                    <span key={h} style={{ color: "#475569", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</span>
                  ))}
                </div>
                {MOCK_TENANTS.map(t => <TenantRow key={t.id} tenant={t} />)}
              </div>
            </div>
          )}

          {/* ANALYTICS TAB */}
          {tab === "analytics" && (
            <div style={{ animation: "fadeUp 0.4s ease" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
                {[
                  { label: "Avg. Order Value", value: "648 EGP", icon: "📈" },
                  { label: "Conversion Rate", value: "73.2%", icon: "🎯" },
                  { label: "Platform Fee Earned", value: "9,212 EGP", icon: "🏦" },
                  { label: "Active Couriers", value: "28", icon: "🛵" },
                  { label: "Delivered Today", value: "187", icon: "✅" },
                  { label: "Support Tickets", value: "12 open", icon: "🎫" },
                ].map(c => (
                  <div key={c.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "20px 22px" }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{c.icon}</div>
                    <div style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{c.label}</div>
                    <div style={{ color: "#f1f5f9", fontSize: 22, fontWeight: 700 }}>{c.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24 }}>
                <div style={{ color: "#94a3b8", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Order Pipeline</div>
                <div style={{ display: "flex", gap: 0 }}>
                  {[
                    { status: "Pending", count: 34, color: "#fbbf24" },
                    { status: "Confirmed", count: 91, color: "#38bdf8" },
                    { status: "Assigned", count: 62, color: "#a78bfa" },
                    { status: "Delivered", count: 2660, color: "#4ade80" },
                  ].map((s, i) => (
                    <div key={s.status} style={{ flex: s.count / 2847, minWidth: 40, height: 40, background: `${s.color}30`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", borderRight: i < 3 ? "1px solid rgba(0,0,0,0.3)" : "none" }}
                      title={`${s.status}: ${s.count}`}>
                      <span style={{ color: s.color, fontSize: 10, fontWeight: 700 }}>{s.count}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
                  {[{ status: "Pending", color: "#fbbf24" }, { status: "Confirmed", color: "#38bdf8" }, { status: "Assigned", color: "#a78bfa" }, { status: "Delivered", color: "#4ade80" }].map(s => (
                    <div key={s.status} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
                      <span style={{ color: "#64748b", fontSize: 11 }}>{s.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {tab === "settings" && (
            <div style={{ animation: "fadeUp 0.4s ease", maxWidth: 560 }}>
              {[
                {
                  key: "auto_activation", label: "Auto-Pilot Mode",
                  desc: "Skip WhatsApp flow — subscriptions approved automatically via payment webhook",
                  value: autoActivation, onChange: setAutoActivation, accent: "#fb923c",
                },
                {
                  key: "ai_ads", label: "AI Ad Generator",
                  desc: "Enable AI-powered ad creation for merchants",
                  value: true, onChange: () => {}, accent: "#a78bfa",
                },
                {
                  key: "maintenance", label: "Maintenance Mode",
                  desc: "Take the platform offline for all users",
                  value: false, onChange: () => {}, accent: "#f87171",
                },
              ].map(s => (
                <div key={s.key} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "20px 22px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14 }}>{s.label}</div>
                    <div style={{ color: "#475569", fontSize: 12, marginTop: 4, maxWidth: 360 }}>{s.desc}</div>
                  </div>
                  <div onClick={() => s.onChange(!s.value)} style={{
                    width: 44, height: 24, borderRadius: 12, cursor: "pointer",
                    background: s.value ? s.accent : "rgba(255,255,255,0.1)",
                    position: "relative", transition: "background 0.3s", flexShrink: 0,
                  }}>
                    <div style={{
                      position: "absolute", top: 3, left: s.value ? 23 : 3, width: 18, height: 18,
                      borderRadius: "50%", background: "white", transition: "left 0.3s",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                    }} />
                  </div>
                </div>
              ))}

              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "20px 22px" }}>
                <div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14, marginBottom: 16 }}>WhatsApp Admin Number</div>
                <div style={{ display: "flex", gap: 10 }}>
                  <input defaultValue="+201019672878" style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", color: "#e2e8f0", fontSize: 14, outline: "none" }} />
                  <button style={{ padding: "10px 18px", background: "rgba(124,58,237,0.2)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Save</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
