import { useState, useEffect } from "react";

// ─── PLAN CONFIG ──────────────────────────────────────────────
const PLANS = [
  {
    id: "starter", name: "Starter", price: 299, currency: "EGP/mo",
    features: ["Up to 100 products", "Basic analytics", "Email support", "1 courier account"],
    accent: "#38bdf8", icon: "🚀",
  },
  {
    id: "pro", name: "Pro", price: 599, currency: "EGP/mo",
    features: ["Unlimited products", "Advanced analytics", "Priority support", "5 courier accounts", "AI Ad Generator", "Referral system"],
    accent: "#a78bfa", icon: "⚡", popular: true,
  },
  {
    id: "enterprise", name: "Enterprise", price: 1299, currency: "EGP/mo",
    features: ["Everything in Pro", "Custom domain", "Dedicated support", "Unlimited couriers", "Custom integrations", "SLA guarantee"],
    accent: "#fb923c", icon: "🏆",
  },
];

const PAYMENT_METHODS = [
  { id: "vodafone_cash", label: "Vodafone Cash", icon: "📱" },
  { id: "instapay", label: "InstaPay", icon: "🏦" },
  { id: "bank_transfer", label: "Bank Transfer", icon: "💳" },
];

// ─── MERCHANT DASHBOARD ───────────────────────────────────────
export default function MerchantDashboard() {
  const [view, setView] = useState("dashboard"); // dashboard | subscribe | pending
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [step, setStep] = useState(1); // 1=select plan, 2=payment modal, 3=pending
  const [form, setForm] = useState({ full_name: "", phone_number: "", payment_method: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [activated, setActivated] = useState(false);
  const [activatedPlan, setActivatedPlan] = useState(null);

  // Simulate realtime activation
  useEffect(() => {
    if (step === 3) {
      const t = setTimeout(() => {
        setActivated(true);
        setActivatedPlan(selectedPlan);
        setStep(1);
        setView("dashboard");
      }, 8000);
      return () => clearTimeout(t);
    }
  }, [step]);

  const validate = () => {
    const errs = {};
    if (!form.full_name.trim()) errs.full_name = "Full name required";
    if (!form.phone_number.match(/^01[0-9]{9}$/)) errs.phone_number = "Valid Egyptian phone required";
    if (!form.payment_method) errs.payment_method = "Select a payment method";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));
    setSubmitting(false);
    setStep(3);
    const waText = encodeURIComponent(
      `Hello Admin, I am Demo Store, I want to activate the ${selectedPlan} plan using ${form.payment_method.replace(/_/g, " ")}. My ID is: TNT_DEMO01`
    );
    window.open(`https://wa.me/201019672878?text=${waText}`, "_blank");
  };

  if (view === "subscribe" || step > 1) {
    return <SubscribeFlow
      step={step} setStep={setStep}
      selectedPlan={selectedPlan} setSelectedPlan={setSelectedPlan}
      form={form} setForm={setForm}
      errors={errors} submitting={submitting}
      onSubmit={handleSubmit}
      onBack={() => { setView("dashboard"); setStep(1); }}
    />;
  }

  return (
    <MerchantHome
      activated={activated}
      activatedPlan={activatedPlan}
      onSubscribe={() => setView("subscribe")}
    />
  );
}

// ─── MERCHANT HOME ────────────────────────────────────────────
function MerchantHome({ activated, activatedPlan, onSubscribe }) {
  const [tab, setTab] = useState("overview");
  const planColor = activatedPlan ? (PLANS.find(p => p.id === activatedPlan)?.accent || "#a78bfa") : null;

  return (
    <div style={{ minHeight: "100vh", background: "#080c14", fontFamily: "'Inter', system-ui, sans-serif", color: "#e2e8f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes glow { 0%,100% { box-shadow: 0 0 20px rgba(74,222,128,0.3); } 50% { box-shadow: 0 0 40px rgba(74,222,128,0.6); } }
      `}</style>

      {/* Top bar */}
      <div style={{ height: 60, borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg, #7c3aed, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>⬡</div>
          <span style={{ color: "#94a3b8", fontSize: 13 }}>Titan Retail OS</span>
          <span style={{ color: "#2d3748", fontSize: 13 }}>/ Demo Store</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {activated ? (
            <span style={{ background: `${planColor}18`, color: planColor, fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, border: `1px solid ${planColor}30`, textTransform: "capitalize", animation: "glow 3s infinite" }}>
              ✓ {activatedPlan} Active
            </span>
          ) : (
            <button onClick={onSubscribe} style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", color: "white", border: "none", padding: "8px 18px", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
              Activate Plan →
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: "32px 28px", animation: "fadeUp 0.4s ease" }}>
        {/* Welcome banner */}
        {!activated && (
          <div style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(79,70,229,0.08))", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 16, padding: "20px 24px", marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ color: "#a78bfa", fontWeight: 700, fontSize: 16 }}>Your store isn't active yet</div>
              <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>Choose a subscription plan to unlock all features and start selling</div>
            </div>
            <button onClick={onSubscribe} style={{ background: "rgba(124,58,237,0.3)", color: "#c4b5fd", border: "1px solid rgba(124,58,237,0.5)", padding: "10px 20px", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 13, whiteSpace: "nowrap" }}>
              Subscribe Now →
            </button>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Total Revenue", value: activated ? "12,480 EGP" : "—", icon: "💰", color: "#a78bfa" },
            { label: "Orders Today", value: activated ? "24" : "—", icon: "📦", color: "#38bdf8" },
            { label: "Products", value: activated ? "87" : "0", icon: "🏷", color: "#4ade80" },
            { label: "Low Stock Alerts", value: activated ? "3" : "—", icon: "⚠️", color: "#fb923c" },
          ].map(s => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "18px 20px" }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ color: "#475569", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{s.label}</div>
              <div style={{ color: activated ? "#f1f5f9" : "#334155", fontSize: 22, fontWeight: 700 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Feature lock overlay */}
        {!activated && (
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "48px 0", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
            <div style={{ color: "#64748b", fontSize: 16, fontWeight: 600 }}>Features locked</div>
            <div style={{ color: "#374151", fontSize: 13, marginTop: 6 }}>Activate a plan to unlock orders, inventory, reports & more</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SUBSCRIBE FLOW ───────────────────────────────────────────
function SubscribeFlow({ step, setStep, selectedPlan, setSelectedPlan, form, setForm, errors, submitting, onSubmit, onBack }) {
  return (
    <div style={{ minHeight: "100vh", background: "#080c14", fontFamily: "'Inter', system-ui, sans-serif", color: "#e2e8f0", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeIn { from { opacity:0; transform:scale(0.97); } to { opacity:1; transform:scale(1); } }
        @keyframes shimmer { from { background-position: -200px 0; } to { background-position: 200px 0; } }
        .plan-card:hover { border-color: var(--accent) !important; background: rgba(255,255,255,0.06) !important; }
        input:focus { outline: none; border-color: rgba(124,58,237,0.5) !important; }
      `}</style>

      {/* Header */}
      <div style={{ height: 60, borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", padding: "0 28px", gap: 16 }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>← Back</button>
        <span style={{ color: "#475569", fontSize: 13 }}>Choose Your Plan</span>
        {/* Steps */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          {["Select Plan", "Payment", "Confirm"].map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700,
                background: step > i + 1 ? "#4ade80" : step === i + 1 ? "#7c3aed" : "rgba(255,255,255,0.08)",
                color: step >= i + 1 ? "white" : "#475569",
              }}>{step > i + 1 ? "✓" : i + 1}</div>
              <span style={{ color: step === i + 1 ? "#e2e8f0" : "#475569", fontSize: 12 }}>{s}</span>
              {i < 2 && <span style={{ color: "#2d3748" }}>→</span>}
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "48px 24px" }}>

        {/* STEP 1: Plan Selection */}
        {step === 1 && (
          <div style={{ width: "100%", maxWidth: 900, animation: "fadeIn 0.4s ease" }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.03em", color: "#f1f5f9" }}>Choose Your Plan</h1>
              <p style={{ color: "#64748b", marginTop: 8 }}>All plans include 30-day billing. Cancel anytime.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
              {PLANS.map(plan => (
                <div key={plan.id} className="plan-card" onClick={() => { setSelectedPlan(plan.id); setStep(2); }}
                  style={{
                    background: selectedPlan === plan.id ? `${plan.accent}10` : "rgba(255,255,255,0.03)",
                    border: `1px solid ${plan.popular ? plan.accent + "40" : "rgba(255,255,255,0.08)"}`,
                    "--accent": plan.accent,
                    borderRadius: 18, padding: "28px 24px", cursor: "pointer",
                    transition: "all 0.2s", position: "relative",
                  }}>
                  {plan.popular && (
                    <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)", background: plan.accent, color: "white", fontSize: 10, fontWeight: 700, padding: "3px 14px", borderRadius: "0 0 10px 10px", letterSpacing: "0.08em" }}>
                      MOST POPULAR
                    </div>
                  )}
                  <div style={{ fontSize: 28, marginBottom: 12, marginTop: plan.popular ? 12 : 0 }}>{plan.icon}</div>
                  <div style={{ color: plan.accent, fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{plan.name}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 20 }}>
                    <span style={{ color: "#f1f5f9", fontSize: 30, fontWeight: 700 }}>{plan.price}</span>
                    <span style={{ color: "#475569", fontSize: 13 }}>{plan.currency}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {plan.features.map(f => (
                      <div key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <span style={{ color: plan.accent, fontSize: 12, marginTop: 1 }}>✓</span>
                        <span style={{ color: "#94a3b8", fontSize: 13 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <button style={{ width: "100%", marginTop: 24, padding: "12px 0", borderRadius: 12, border: "none", cursor: "pointer", background: `${plan.accent}20`, color: plan.accent, fontWeight: 700, fontSize: 14, transition: "all 0.2s" }}>
                    Select {plan.name} →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Payment Modal */}
        {step === 2 && selectedPlan && (() => {
          const plan = PLANS.find(p => p.id === selectedPlan);
          return (
            <div style={{ width: "100%", maxWidth: 480, animation: "fadeIn 0.4s ease" }}>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "36px 32px" }}>
                {/* Plan summary */}
                <div style={{ background: `${plan.accent}10`, border: `1px solid ${plan.accent}30`, borderRadius: 14, padding: "16px 18px", marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ color: plan.accent, fontWeight: 700 }}>{plan.icon} {plan.name} Plan</div>
                    <div style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>30 days · Activate today</div>
                  </div>
                  <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 20 }}>{plan.price} EGP</div>
                </div>

                <h2 style={{ color: "#f1f5f9", fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Payment Details</h2>

                {/* Full Name */}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Full Name</label>
                  <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                    placeholder="As on your ID"
                    style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${errors.full_name ? "#f87171" : "rgba(255,255,255,0.1)"}`, borderRadius: 10, padding: "12px 14px", color: "#e2e8f0", fontSize: 14 }} />
                  {errors.full_name && <div style={{ color: "#f87171", fontSize: 11, marginTop: 4 }}>{errors.full_name}</div>}
                </div>

                {/* Phone */}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Phone Number</label>
                  <input value={form.phone_number} onChange={e => setForm(f => ({ ...f, phone_number: e.target.value }))}
                    placeholder="01XXXXXXXXX"
                    style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${errors.phone_number ? "#f87171" : "rgba(255,255,255,0.1)"}`, borderRadius: 10, padding: "12px 14px", color: "#e2e8f0", fontSize: 14 }} />
                  {errors.phone_number && <div style={{ color: "#f87171", fontSize: 11, marginTop: 4 }}>{errors.phone_number}</div>}
                </div>

                {/* Payment Method */}
                <div style={{ marginBottom: 28 }}>
                  <label style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Payment Method</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {PAYMENT_METHODS.map(m => (
                      <div key={m.id} onClick={() => setForm(f => ({ ...f, payment_method: m.id }))}
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, cursor: "pointer", border: `1px solid ${form.payment_method === m.id ? plan.accent + "60" : "rgba(255,255,255,0.08)"}`, background: form.payment_method === m.id ? `${plan.accent}10` : "rgba(255,255,255,0.03)", transition: "all 0.2s" }}>
                        <span style={{ fontSize: 18 }}>{m.icon}</span>
                        <span style={{ color: form.payment_method === m.id ? "#f1f5f9" : "#94a3b8", fontSize: 14, fontWeight: form.payment_method === m.id ? 600 : 400 }}>{m.label}</span>
                        {form.payment_method === m.id && <span style={{ marginLeft: "auto", color: plan.accent }}>✓</span>}
                      </div>
                    ))}
                  </div>
                  {errors.payment_method && <div style={{ color: "#f87171", fontSize: 11, marginTop: 4 }}>{errors.payment_method}</div>}
                </div>

                <button onClick={onSubmit} disabled={submitting}
                  style={{ width: "100%", padding: "14px 0", borderRadius: 12, border: "none", cursor: submitting ? "not-allowed" : "pointer", background: submitting ? `${plan.accent}40` : `linear-gradient(135deg, ${plan.accent}, ${plan.accent}bb)`, color: "white", fontWeight: 700, fontSize: 15, transition: "all 0.2s" }}>
                  {submitting ? "Processing..." : `Confirm & Open WhatsApp →`}
                </button>

                <p style={{ color: "#374151", fontSize: 11, textAlign: "center", marginTop: 12 }}>
                  After clicking, you'll be redirected to WhatsApp to complete payment notification
                </p>
              </div>
            </div>
          );
        })()}

        {/* STEP 3: Pending / Waiting for Approval */}
        {step === 3 && (
          <div style={{ textAlign: "center", maxWidth: 400, animation: "fadeIn 0.4s ease" }}>
            <div style={{ fontSize: 64, marginBottom: 24 }}>⏳</div>
            <h2 style={{ color: "#f1f5f9", fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Payment Sent!</h2>
            <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
              Your subscription request is pending admin approval.<br />
              You'll receive a notification here once your plan is activated — no refresh needed.
            </p>
            <div style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 14, padding: "16px 20px", marginBottom: 24 }}>
              <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 4 }}>Watching for activation...</div>
              <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 8 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#7c3aed", animation: `pulse 1.2s ${i * 0.4}s infinite` }} />
                ))}
              </div>
            </div>
            <p style={{ color: "#374151", fontSize: 12 }}>
              Demo: Auto-activating in ~8 seconds
            </p>
          </div>
        )}
      </div>

      <style>{`@keyframes pulse { 0%,100% { opacity:0.3; } 50% { opacity:1; } }`}</style>
    </div>
  );
}
