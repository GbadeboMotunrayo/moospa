import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ordersAPI, dispatchAPI } from '../services/api';
import { trackPurchase } from '../utils/analytics';
import TelegramIcon from '../components/TelegramIcon';
import WhatsAppIcon from '../components/WhatsAppIcon';
import { whatsappMessageLink, WHATSAPP_GREEN, telegramOrderLink, telegramLink, TELEGRAM_BLUE } from '../config/contact';

// Local fallback if the API can't be reached — mirrors server/routes/dispatch.js defaults
const FALLBACK_ZONES = [
  ['Agege', 2000], ['Ajeromi-Ifelodun', 4500], ['Alimosho', 2500], ['Amuwo-Odofin', 5000],
  ['Apapa', 5000], ['Badagry', 7000], ['Epe', 8000], ['Eti-Osa', 6000],
  ['Ibeju-Lekki', 8000], ['Ifako-Ijaiye', 2000], ['Ikeja', 3000], ['Ikorodu', 5500],
  ['Kosofe', 4000], ['Lagos Island', 5000], ['Lagos Mainland', 4500], ['Mushin', 3500],
  ['Ojo', 4500], ['Oshodi-Isolo', 3500], ['Shomolu', 4000], ['Surulere', 4000],
].map(([lga, price], i) => ({ id: -(i + 1), lga, price, category: 'Lagos' }));

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
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', city: '', state: 'Lagos' });
  const [errors, setErrors] = useState({});
  const [paying, setPaying] = useState(false);

  // Delivery zones (Lagos LGAs with dispatch prices)
  const [zones, setZones] = useState([]);
  const [locating, setLocating] = useState(false);
  const [detectedLga, setDetectedLga] = useState('');

  const selectedZone = zones.find(z => z.lga === form.city);
  const SHIPPING = selectedZone ? Number(selectedZone.price) : 0;
  const total = cartSubtotal + SHIPPING;

  useEffect(() => {
    dispatchAPI.getZones()
      .then(d => { const list = d.zones || FALLBACK_ZONES; setZones(list); detectLocation(list); })
      .catch(() => { setZones(FALLBACK_ZONES); detectLocation(FALLBACK_ZONES); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ask for the user's location, reverse-geocode it, and pre-select their LGA for confirmation
  const detectLocation = (zoneList) => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async pos => {
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
        const d = await r.json();
        const a = d.address || {};
        const norm = s => String(s).toLowerCase().replace(/[^a-z]/g, '');
        // state last: LGA-level fields should win before falling back to the state name
        const candidates = [a.county, a.city_district, a.suburb, a.borough, a.town, a.city, a.state].filter(Boolean);
        let match = null;
        for (const c of candidates) {
          match = zoneList.find(z => norm(z.lga).includes(norm(c)) || norm(c).includes(norm(z.lga)));
          if (match) break;
        }
        if (match) {
          const isOutside = (match.category || 'Lagos') !== 'Lagos';
          setForm(f => f.city ? f : { ...f, city: match.lga, state: isOutside ? match.lga : 'Lagos' });
          setDetectedLga(match.lga);
        }
      } catch (err) { /* detection is best-effort; user picks manually */ }
      setLocating(false);
    }, () => setLocating(false), { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 });
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.email.includes('@')) e.email = 'Valid email required';
    if (form.phone.length < 10) e.phone = 'Valid phone required';
    if (!form.address.trim()) e.address = 'Required';
    if (!form.city.trim()) e.city = 'Select your delivery area';
    if (!form.state.trim()) e.state = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const [payError, setPayError] = useState('');

  // Shared by both chat channels: saves the order (if possible), builds the
  // human-readable summary, and hands back everything the caller needs to
  // open its own chat link and move on to the confirmation screen.
  const submitOrder = async () => {
    // Whether the order actually reached Supabase decides which Telegram link
    // we can use (WhatsApp can pre-fill text regardless, so this only matters
    // for the Telegram fallback below). The bot identifies an order purely by
    // its reference, so if the save failed there is nothing for it to look up.
    let reference = 'MOO-' + Date.now();
    let saved = false;
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
      saved = true;
    } catch (err) {
      console.error('Order save failed — falling back to a plain chat message:', err);
    }

    // Kept for the fallback path and for the confirmation screen's copy button:
    // if the bot can't fetch the order, the customer still has the full details
    // in front of them and can paste them into the chat by hand. Losing the
    // order entirely is the one outcome worth engineering around.
    const itemLines = cart.map((i, idx) => `${idx + 1}. ${i.name}${i.qty > 1 ? ` x${i.qty}` : ''} @ N${i.price.toLocaleString()}`).join('\n');
    const summary = `Hi, my name is ${form.name}, and I want to purchase the following products:\n${itemLines}\n\nSubtotal: N${cartSubtotal.toLocaleString()}\nDelivery (${form.city}): N${SHIPPING.toLocaleString()}\nTotal: N${total.toLocaleString()}\nOrder Ref: ${reference}\nDelivery to: ${form.address}, ${form.city}, ${form.state}\n\nHow do I make payment?`;

    return { reference, saved, summary };
  };

  const finishCheckout = ({ reference, saved, summary }, channel) => {
    const completedOrder = { ref: reference, form, cart: [...cart], total, date: new Date().toLocaleDateString(), saved, summary, channel };
    setOrder(completedOrder);
    trackPurchase(completedOrder);
    clearCart();
    navigate('confirmation');
    setPaying(false);
  };

  const handleWhatsAppCheckout = async () => {
    if (!validate()) return;
    setPaying(true);
    setPayError('');
    const result = await submitOrder();
    // WhatsApp pre-fills the message via `?text=`, so the customer's whole
    // order is already typed in — no bot lookup needed, unlike Telegram.
    window.open(whatsappMessageLink(result.summary), '_blank', 'noopener');
    finishCheckout(result, 'whatsapp');
  };

  const handleTelegramCheckout = async () => {
    if (!validate()) return;
    setPaying(true);
    setPayError('');
    const result = await submitOrder();
    // Telegram can't pre-fill a message, so the reference rides in through the
    // bot's /start payload and the bot posts the summary itself.
    window.open(result.saved ? telegramOrderLink(result.reference) : telegramLink(), '_blank', 'noopener');
    finishCheckout(result, 'telegram');
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
              <div style={{ marginBottom: 16, gridColumn: 'span 1' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: '700', color: t.muted, marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }}>Delivery Area</label>
                <select value={form.city}
                  onChange={e => {
                    const z = zones.find(x => x.lga === e.target.value);
                    const isOutside = z && (z.category || 'Lagos') !== 'Lagos';
                    setForm(f => ({ ...f, city: e.target.value, state: z ? (isOutside ? z.lga : 'Lagos') : f.state }));
                  }}
                  style={{ width: '100%', padding: '12px 14px', background: t.input, border: `1px solid ${errors.city ? '#ef5350' : t.border}`, borderRadius: 6, color: t.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}>
                  <option value="">{locating ? 'Detecting your area...' : 'Select your area'}</option>
                  <optgroup label="Lagos — select your LGA">
                    {zones.filter(z => (z.category || 'Lagos') === 'Lagos').map(z => (
                      <option key={z.id} value={z.lga}>{z.lga} — N{Number(z.price).toLocaleString()}</option>
                    ))}
                  </optgroup>
                  {zones.some(z => (z.category || 'Lagos') !== 'Lagos') && (
                    <optgroup label="Outside Lagos — select your state (courier delivery)">
                      {zones.filter(z => (z.category || 'Lagos') !== 'Lagos').map(z => (
                        <option key={z.id} value={z.lga}>{z.lga} — N{Number(z.price).toLocaleString()}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
                {errors.city && <div style={{ color: '#ef5350', fontSize: 11, marginTop: 4 }}>{errors.city}</div>}
                {detectedLga && <div style={{ color: '#4caf50', fontSize: 11, marginTop: 4 }}>📍 We detected your area as {detectedLga} — please confirm it's correct.</div>}
                {!detectedLga && !locating && (
                  <button type="button" onClick={() => detectLocation(zones)}
                    style={{ marginTop: 6, padding: 0, background: 'none', border: 'none', color: t.accent, fontSize: 11, cursor: 'pointer', textDecoration: 'underline' }}>
                    Use my location
                  </button>
                )}
              </div>
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

            <div style={{ background: `${WHATSAPP_GREEN}12`, border: `2px solid ${WHATSAPP_GREEN}`, borderRadius: 8, padding: 16, display: 'flex', alignItems: 'center', gap: 14, marginTop: 12 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${WHATSAPP_GREEN}`, background: WHATSAPP_GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }}></div>
              </div>
              <div>
                <div style={{ fontWeight: '700', color: t.text, fontSize: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
                  <WhatsAppIcon size={16} color={WHATSAPP_GREEN} /> Continue on WhatsApp
                </div>
                <div style={{ fontSize: 12, color: t.muted }}>Confirm your order and pay directly with us</div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <span style={{ fontSize: 10, fontWeight: '700', color: WHATSAPP_GREEN, background: `${WHATSAPP_GREEN}18`, padding: '4px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: 0.5 }}>Recommended</span>
              </div>
            </div>

            <div style={{ background: t.badge, border: `1px solid ${t.border}`, borderRadius: 8, padding: 16, display: 'flex', alignItems: 'center', gap: 14, marginTop: 12 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${TELEGRAM_BLUE}` }} />
              <div>
                <div style={{ fontWeight: '700', color: t.text, fontSize: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
                  <TelegramIcon size={16} color={TELEGRAM_BLUE} /> Continue on Telegram
                </div>
                <div style={{ fontSize: 12, color: t.muted }}>Also available — a good alternative if you'd like to try it</div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: t.muted, marginTop: 12 }}>Online card payment is coming soon. For now, place your order below and finish payment (bank transfer) with us on WhatsApp — your order details are already typed in, you won't need to type anything. Prefer Telegram? Use the link under the button instead.</p>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ color: t.muted, fontSize: 14 }}>Subtotal</span>
                <span style={{ color: t.text, fontWeight: '600', fontSize: 14 }}>N{cartSubtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ color: t.muted, fontSize: 14 }}>Delivery{selectedZone ? ` (${selectedZone.lga})` : ''}</span>
                <span style={{ color: t.text, fontWeight: '600', fontSize: 14 }}>
                  {selectedZone ? `N${SHIPPING.toLocaleString()}` : 'Select area'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: `1px solid ${t.border}` }}>
                <span style={{ fontWeight: '700', color: t.text, fontSize: 16 }}>Total</span>
                <span style={{ fontWeight: '700', color: t.accent, fontSize: 22 }}>N{total.toLocaleString()}</span>
              </div>
            </div>
            {payError && <div style={{ color: '#ef5350', fontSize: 12, marginBottom: 10, padding: '8px 12px', background: 'rgba(239,83,80,0.08)', borderRadius: 6 }}>{payError}</div>}
            <button onClick={handleWhatsAppCheckout} disabled={paying || cart.length === 0}
              style={{ width: '100%', marginTop: 20, padding: '16px', background: paying ? '#666' : WHATSAPP_GREEN, color: 'white', border: 'none', borderRadius: 8, fontWeight: '700', fontSize: 16, cursor: paying ? 'not-allowed' : 'pointer', transition: 'background 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <WhatsAppIcon size={18} color="white" />
              {paying ? 'Placing order...' : 'Continue on WhatsApp'}
            </button>
            <div style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: t.muted }}>We'll open WhatsApp with your order already typed in — just hit send.</div>
            <button onClick={handleTelegramCheckout} disabled={paying || cart.length === 0}
              style={{ width: '100%', marginTop: 10, padding: '12px', background: 'transparent', color: TELEGRAM_BLUE, border: `1px solid ${TELEGRAM_BLUE}`, borderRadius: 8, fontWeight: '700', fontSize: 13, cursor: paying ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <TelegramIcon size={14} color={TELEGRAM_BLUE} />
              Or continue on Telegram instead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
