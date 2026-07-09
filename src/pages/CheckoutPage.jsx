import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ordersAPI } from '../services/api';
import { trackPurchase } from '../utils/analytics';

function Field({ label, name, type = 'text', half, form, errors, setForm, t }) {
  return (
    <div style={{ marginBottom: 16, gridColumn: half ? 'span 1' : 'span 2' }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: '700', color: t.muted, marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }}>{label}</label>
      <input type={type} value={form[name]} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
        style={{ width: '100%', padding: '12px 14px', background: t.input, border: `1px solid ${errors[name] ? '#ef5350' : t.border}`, borderRadius: 6, color: t.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
      {errors[name] && <div style={{ color: '#ef5350', fontSize: 11, marginTop: 4 }}>{errors[name]}</div>}
    </div>
  );
}

export default function CheckoutPage() {
  const { t, cart, cartSubtotal, clearCart, navigate, setOrder } = useApp();
  const SHIPPING = 2000;
  const total = cartSubtotal + SHIPPING;
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', city: '', state: '' });
  const [errors, setErrors] = useState({});
  const [paying, setPaying] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.email.includes('@')) e.email = 'Valid email required';
    if (form.phone.length < 10) e.phone = 'Valid phone required';
    if (!form.address.trim()) e.address = 'Required';
    if (!form.city.trim()) e.city = 'Required';
    if (!form.state.trim()) e.state = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const [payError, setPayError] = useState('');

  const WHATSAPP_NUMBER = '2349056194414';

  const handleWhatsAppCheckout = async () => {
    if (!validate()) return;
    setPaying(true);
    setPayError('');

    let reference = 'MOO-' + Date.now();
    try {
      const result = await ordersAPI.create({
        customer_name:    form.name,
        customer_email:   form.email,
        customer_phone:   form.phone,
        delivery_address: form.address,
        delivery_city:    form.city,
        delivery_state:   form.state,
        items: cart.map(i => ({ id: i.id, name: i.name, qty: i.qty, price: i.price })),
        subtotal: cartSubtotal,
        shipping_fee: SHIPPING,
        total,
      });
      reference = result.reference;
    } catch (err) {
      console.error('Order save failed, continuing to WhatsApp anyway:', err);
    }

    const itemLines = cart.map((i, idx) => `${idx + 1}. ${i.name}${i.qty > 1 ? ` x${i.qty}` : ''} @ N${i.price.toLocaleString()}`).join('\n');
    const message = `Hi, my name is ${form.name}, and I want to purchase the following products:\n${itemLines}\n\nDelivery fee: N${SHIPPING.toLocaleString()}\nTotal: N${total.toLocaleString()}\nOrder Ref: ${reference}\nDelivery to: ${form.address}, ${form.city}, ${form.state}\n\nHow do I make payment?`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');

    const completedOrder = { ref: reference, form, cart: [...cart], total, date: new Date().toLocaleDateString() };
    setOrder(completedOrder);
    trackPurchase(completedOrder);
    clearCart();
    navigate('confirmation');
    setPaying(false);
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 40px' }}>
      <h1 style={{ fontSize: 36, fontFamily: 'var(--font-display)', fontWeight: 'bold', color: t.text, marginBottom: 40 }}>Checkout</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 48 }}>
        <div>
          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: 28, marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: '700', color: t.text, marginBottom: 20 }}>Delivery Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <Field label="Full Name" name="name" form={form} errors={errors} setForm={setForm} t={t} />
              <Field label="Email Address" name="email" type="email" half form={form} errors={errors} setForm={setForm} t={t} />
              <Field label="Phone Number" name="phone" type="tel" half form={form} errors={errors} setForm={setForm} t={t} />
              <Field label="Delivery Address" name="address" form={form} errors={errors} setForm={setForm} t={t} />
              <Field label="City" name="city" half form={form} errors={errors} setForm={setForm} t={t} />
              <Field label="State" name="state" half form={form} errors={errors} setForm={setForm} t={t} />
            </div>
          </div>

          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: 28 }}>
            <h2 style={{ fontSize: 18, fontWeight: '700', color: t.text, marginBottom: 16 }}>Payment Method</h2>
            <div style={{ background: t.badge, border: `1px solid ${t.border}`, borderRadius: 8, padding: 16, display: 'flex', alignItems: 'center', gap: 14, opacity: 0.6 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${t.muted}` }} />
              <div>
                <div style={{ fontWeight: '700', color: t.text, fontSize: 14 }}>Pay with Paystack</div>
                <div style={{ fontSize: 12, color: t.muted }}>Card, Bank Transfer, USSD, Mobile Money</div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <span style={{ fontSize: 10, fontWeight: '700', color: t.muted, background: t.surface, border: `1px solid ${t.border}`, padding: '4px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: 0.5 }}>Coming Soon</span>
              </div>
            </div>

            <div style={{ background: `#25d36612`, border: `2px solid #25d366`, borderRadius: 8, padding: 16, display: 'flex', alignItems: 'center', gap: 14, marginTop: 12 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #25d366', background: '#25d366', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }}></div>
              </div>
              <div>
                <div style={{ fontWeight: '700', color: t.text, fontSize: 14 }}>Continue on WhatsApp</div>
                <div style={{ fontSize: 12, color: t.muted }}>Confirm your order and pay directly with us</div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: t.muted, marginTop: 12 }}>Online card payment is coming soon. For now, place your order below and finish payment (bank transfer) with us on WhatsApp.</p>
          </div>
        </div>

        {/* Order summary */}
        <div>
          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: 24, position: 'sticky', top: 100 }}>
            <h2 style={{ fontSize: 18, fontWeight: '700', color: t.text, marginBottom: 20 }}>Order Summary</h2>
            <div style={{ maxHeight: 220, overflowY: 'auto', marginBottom: 16 }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <img src={item.mainImage} alt={item.name} style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 6, border: `1px solid ${t.border}` }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: '600', color: t.text }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: t.muted }}>Qty: {item.qty}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: '700', color: t.accent }}>N{(item.price * item.qty).toLocaleString()}</div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 16 }}>
              {[['Subtotal', cartSubtotal], ['Delivery', SHIPPING]].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ color: t.muted, fontSize: 14 }}>{l}</span>
                  <span style={{ color: t.text, fontWeight: '600', fontSize: 14 }}>N{v.toLocaleString()}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: `1px solid ${t.border}` }}>
                <span style={{ fontWeight: '700', color: t.text, fontSize: 16 }}>Total</span>
                <span style={{ fontWeight: '700', color: t.accent, fontSize: 22 }}>N{total.toLocaleString()}</span>
              </div>
            </div>
            {payError && <div style={{ color: '#ef5350', fontSize: 12, marginBottom: 10, padding: '8px 12px', background: 'rgba(239,83,80,0.08)', borderRadius: 6 }}>{payError}</div>}
            <button onClick={handleWhatsAppCheckout} disabled={paying || cart.length === 0}
              style={{ width: '100%', marginTop: 20, padding: '16px', background: paying ? '#666' : '#25d366', color: 'white', border: 'none', borderRadius: 8, fontWeight: '700', fontSize: 16, cursor: paying ? 'not-allowed' : 'pointer', transition: 'background 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm5.8 14.13c-.24.68-1.4 1.3-1.93 1.38-.49.08-1.11.11-1.79-.11-.41-.13-.94-.3-1.62-.6-2.85-1.23-4.71-4.1-4.85-4.29-.14-.19-1.16-1.54-1.16-2.94s.73-2.09.99-2.38c.26-.28.56-.35.75-.35.19 0 .38 0 .54.01.17.01.41-.06.64.49.24.57.81 1.98.88 2.12.07.14.12.31.02.5-.09.19-.14.31-.28.47-.14.17-.29.37-.42.5-.14.14-.28.29-.12.57.16.28.71 1.17 1.52 1.9 1.05.94 1.93 1.23 2.21 1.37.28.14.44.12.61-.07.16-.19.7-.81.89-1.09.19-.28.38-.23.63-.14.26.09 1.63.77 1.91.91.28.14.47.21.53.33.07.12.07.68-.17 1.36z"/></svg>
              {paying ? 'Placing order...' : 'Continue on WhatsApp'}
            </button>
            <div style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: t.muted }}>We'll open WhatsApp with your order details so you can arrange payment with us directly.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
