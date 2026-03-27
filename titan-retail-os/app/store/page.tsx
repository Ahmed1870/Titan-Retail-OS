export default function StorePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#080c14', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🛍️</div>
        <h1 style={{ color: '#f1f5f9', fontSize: 24, fontWeight: 700 }}>Titan Marketplace</h1>
        <p style={{ marginTop: 8 }}>Visit a store: /store/[slug]</p>
      </div>
    </div>
  );
}
