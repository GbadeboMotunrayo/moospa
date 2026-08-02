import { useApp } from '../context/AppContext';

export default function ConfirmationPage() {
  const { t, order, navigate } = useApp();

  if (!order) { navigate('home'); return null; }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '80px 40px', textAlign: 'center' }}>
      <div style={{ width: 80, height: 80, background: '#e8f5e9', borderRadius: '50%', margin: '0 auto 28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
      </div>
      <h1 style={{ fontSize: 36, fontFamily: 'var(--font-display)', fontWeight: 'bold', color: t.text, marginBottom: 12 }}>Order Received!</h1>
      <p style={{ color: t.muted, fontSize: 16, marginBottom: 8 }}>Thank you, {order.form.name}. We've opened WhatsApp so you can finish payment with us directly.</p>
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, padding: '12px 24px', display: 'inline-block', marginBottom: 36 }}>
        <span style={{ fontSize: 13, color: t.muted }}>Order Reference: </span>
        <span style={{ fontSize: 15, fontWeight: '700', color: t.accent }}>{order.ref}</span>
      </div>

      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: 28, textAlign: 'left', marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: '700', color: t.text, marginBottom: 20 }}>Order Details</h2>
        {order.cart.map(item => (
          <div key={item.id} style={{ display: 'flex', gap: 14, marginBottom: 14, paddingBottom: 14, borderBottom: `1px solid ${t.border}` }}>
            <img src={item.mainImage} alt={item.name} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 6 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600', color: t.text, fontSize: 14 }}>{item.name}</div>
              <div style={{ color: t.muted, fontSize: 12 }}>Qty: {item.qty}</div>
            </div>
            <div style={{ fontWeight: '700', color: t.accent }}>N{(item.price * item.qty).toLocaleString()}</div>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontWeight: '700', color: t.text }}>Total (to pay via WhatsApp)</span>
          <span style={{ fontWeight: '700', color: t.accent, fontSize: 20 }}>N{order.total.toLocaleString()}</span>
        </div>
      </div>

      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: 24, textAlign: 'left', marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: '700', color: t.text, marginBottom: 12 }}>Delivery Information</h2>
        <div style={{ color: t.muted, fontSize: 14, lineHeight: 1.9 }}>
          <div>{order.form.name}</div>
          <div>{order.form.address}, {order.form.city}, {order.form.state}</div>
          <div>{order.form.phone} · {order.form.email}</div>
          <div style={{ marginTop: 8, color: t.accent, fontWeight: '600' }}>Estimated delivery: 24-48 hours</div>
          <div style={{ fontSize: 12, color: t.muted, marginTop: 4 }}>Your order will arrive in plain, discreet packaging with no identifying labels.</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <a href={`https://wa.me/2348106393774?text=Hi, I placed order ${order.ref}`} target="_blank" rel="noreferrer"
          style={{ background: '#25d366', color: 'white', padding: '12px 28px', borderRadius: 6, fontWeight: '700', fontSize: 14, textDecoration: 'none' }}>
          Track via WhatsApp
        </a>
        <button onClick={() => navigate('shop')} style={{ background: t.accent, color: 'white', padding: '12px 28px', border: 'none', borderRadius: 6, fontWeight: '700', fontSize: 14, cursor: 'pointer' }}>Continue Shopping</button>
      </div>

      <p style={{ color: t.muted, fontSize: 12, marginTop: 24 }}>If WhatsApp didn't open automatically, tap "Track via WhatsApp" above and reference order {order.ref}.</p>
    </div>
  );
}
