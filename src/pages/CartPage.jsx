import { useApp } from '../context/AppContext';

export default function CartPage() {
  const { t, cart, removeFromCart, updateQty, cartSubtotal, navigate } = useApp();
  const SHIPPING = 2000;
  const total = cartSubtotal + (cart.length > 0 ? SHIPPING : 0);

  if (cart.length === 0) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 40px' }}>
        <div style={{ fontSize: 64, marginBottom: 24 }}>🛍️</div>
        <h2 style={{ fontSize: 28, fontFamily: 'var(--font-display)', fontWeight: 'bold', color: t.text, marginBottom: 12 }}>Your cart is empty</h2>
        <p style={{ color: t.muted, marginBottom: 32 }}>Start shopping to fill it with something beautiful.</p>
        <button onClick={() => navigate('shop')} style={{ background: t.accent, color: 'white', padding: '14px 40px', border: 'none', borderRadius: 6, fontWeight: '700', fontSize: 15, cursor: 'pointer' }}>Browse Products</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 40px' }}>
      <h1 style={{ fontSize: 40, fontFamily: 'var(--font-display)', fontWeight: 'bold', color: t.text, marginBottom: 8 }}>Your Cart</h1>
      <p style={{ color: t.muted, marginBottom: 40 }}>{cart.reduce((s, i) => s + i.qty, 0)} items in your cart</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 40 }}>
        {/* Items */}
        <div>
          {cart.map(item => (
            <div key={item.id} style={{ display: 'flex', gap: 20, padding: '24px 0', borderBottom: `1px solid ${t.border}` }}>
              <img src={item.mainImage} alt={item.name} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8, border: `1px solid ${t.border}` }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: '700', color: t.text, marginBottom: 4 }}>{item.name}</div>
                <div style={{ fontSize: 13, color: t.muted, marginBottom: 12, textTransform: 'capitalize' }}>{item.category}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${t.border}`, borderRadius: 6, overflow: 'hidden' }}>
                    <button onClick={() => updateQty(item.id, item.qty - 1)} style={{ width: 36, height: 36, background: t.surface, border: 'none', color: t.text, fontSize: 18, cursor: 'pointer' }}>-</button>
                    <span style={{ width: 40, textAlign: 'center', color: t.text, fontWeight: '700' }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)} style={{ width: 36, height: 36, background: t.surface, border: 'none', color: t.text, fontSize: 18, cursor: 'pointer' }}>+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: '#ef5350', cursor: 'pointer', fontSize: 13, fontWeight: '600' }}>Remove</button>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 18, fontWeight: 'bold', color: t.accent }}>N{(item.price * item.qty).toLocaleString()}</div>
                <div style={{ fontSize: 12, color: t.muted, marginTop: 4 }}>N{item.price.toLocaleString()} each</div>
              </div>
            </div>
          ))}
          <div style={{ paddingTop: 20 }}>
            <button onClick={() => navigate('shop')} style={{ background: 'none', border: `1px solid ${t.border}`, color: t.muted, padding: '10px 20px', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}>Continue Shopping</button>
          </div>
        </div>

        {/* Summary */}
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 28, height: 'fit-content' }}>
          <h2 style={{ fontSize: 20, fontWeight: '700', color: t.text, marginBottom: 24 }}>Order Summary</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ color: t.muted }}>Subtotal</span>
            <span style={{ color: t.text, fontWeight: '600' }}>N{cartSubtotal.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ color: t.muted }}>Delivery</span>
            <span style={{ color: t.text, fontWeight: '600' }}>N{SHIPPING.toLocaleString()}</span>
          </div>
          <div style={{ borderTop: `1px solid ${t.border}`, margin: '16px 0', paddingTop: 16, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: '700', color: t.text, fontSize: 17 }}>Total</span>
            <span style={{ fontWeight: '700', color: t.accent, fontSize: 22 }}>N{total.toLocaleString()}</span>
          </div>
          <button onClick={() => navigate('checkout')} style={{ width: '100%', padding: '16px', background: t.accent, color: 'white', border: 'none', borderRadius: 8, fontWeight: '700', fontSize: 16, cursor: 'pointer', marginTop: 8 }}>Proceed to Checkout</button>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
            {['Visa', 'Mastercard', 'Verve', 'GTB'].map(c => (
              <div key={c} style={{ padding: '3px 8px', background: t.badge, border: `1px solid ${t.border}`, borderRadius: 4, fontSize: 10, color: t.badgeText, fontWeight: '700' }}>{c}</div>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: 11, color: t.muted, marginTop: 12 }}>Finish payment with us on WhatsApp. Discreet billing name.</p>
        </div>
      </div>
    </div>
  );
}
