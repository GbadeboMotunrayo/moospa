import { useState } from 'react';
import { useApp } from '../context/AppContext';
import TelegramIcon from '../components/TelegramIcon';
import WhatsAppIcon from '../components/WhatsAppIcon';
import { whatsappMessageLink, WHATSAPP_GREEN, telegramOrderLink, telegramLink, TELEGRAM_BLUE } from '../config/contact';

export default function ConfirmationPage() {
  const { t, order, navigate } = useApp();
  const [copied, setCopied] = useState(false);

  if (!order) { navigate('home'); return null; }

  // `saved` is false when the order never reached the database. The bot looks
  // orders up by reference, so in that case it has nothing to find — the
  // customer gets a copy button and pastes the details in manually instead.
  const saved = order.saved !== false;
  const viaWhatsApp = order.channel !== 'telegram'; // default to WhatsApp copy for older/unlabelled orders

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(order.summary || `Order ${order.ref} — N${order.total.toLocaleString()}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      // Clipboard is blocked outside secure contexts; the text is on screen anyway.
      setCopied(false);
    }
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '80px 40px', textAlign: 'center' }}>
      <div style={{ width: 80, height: 80, background: '#e8f5e9', borderRadius: '50%', margin: '0 auto 28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
      </div>
      <h1 style={{ fontSize: 36, fontFamily: 'var(--font-display)', fontWeight: 'bold', color: t.text, marginBottom: 12 }}>Order Received!</h1>
      <p style={{ color: t.muted, fontSize: 16, marginBottom: 8 }}>
        {viaWhatsApp
          ? <>Thank you, {order.form.name}. We've opened WhatsApp with your order already typed in — just hit send and we'll confirm payment with you.</>
          : saved
            ? <>Thank you, {order.form.name}. We've opened Telegram — your order is already there, just send it and we'll confirm payment with you.</>
            : <>Thank you, {order.form.name}. We've opened Telegram so you can finish payment with us directly.</>}
      </p>
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
          <span style={{ fontWeight: '700', color: t.text }}>Total (to pay via {viaWhatsApp ? 'WhatsApp' : 'Telegram'})</span>
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

      {!saved && (
        <div style={{ background: 'rgba(255,167,38,0.08)', border: '1px solid rgba(255,167,38,0.5)', borderRadius: 10, padding: 20, textAlign: 'left', marginBottom: 24 }}>
          <div style={{ fontWeight: '700', color: '#ffa726', fontSize: 14, marginBottom: 8 }}>One extra step</div>
          <p style={{ color: t.muted, fontSize: 13, lineHeight: 1.7, marginBottom: 14 }}>
            We couldn't reach our order system just now, so please paste your order into the {viaWhatsApp ? 'WhatsApp' : 'Telegram'} chat we opened. Tap below to copy it — nothing is lost.
          </p>
          <button onClick={copySummary}
            style={{ background: copied ? '#2e7d32' : t.accent, color: 'white', padding: '10px 22px', border: 'none', borderRadius: 6, fontWeight: '700', fontSize: 13, cursor: 'pointer' }}>
            {copied ? `Copied — now paste it in ${viaWhatsApp ? 'WhatsApp' : 'Telegram'}` : 'Copy my order details'}
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <a href={viaWhatsApp ? whatsappMessageLink(order.summary || `Order ${order.ref} — N${order.total.toLocaleString()}`) : (saved ? telegramOrderLink(order.ref) : telegramLink())} target="_blank" rel="noreferrer"
          style={{ background: viaWhatsApp ? WHATSAPP_GREEN : TELEGRAM_BLUE, color: 'white', padding: '12px 28px', borderRadius: 6, fontWeight: '700', fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          {viaWhatsApp ? <WhatsAppIcon size={16} color="white" /> : <TelegramIcon size={16} color="white" />}
          Continue on {viaWhatsApp ? 'WhatsApp' : 'Telegram'}
        </a>
        <a href={viaWhatsApp ? (saved ? telegramOrderLink(order.ref) : telegramLink()) : whatsappMessageLink(order.summary || `Order ${order.ref} — N${order.total.toLocaleString()}`)} target="_blank" rel="noreferrer"
          style={{ background: 'transparent', color: viaWhatsApp ? TELEGRAM_BLUE : WHATSAPP_GREEN, border: `1px solid ${viaWhatsApp ? TELEGRAM_BLUE : WHATSAPP_GREEN}`, padding: '12px 28px', borderRadius: 6, fontWeight: '700', fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          {viaWhatsApp ? <TelegramIcon size={16} color={TELEGRAM_BLUE} /> : <WhatsAppIcon size={16} color={WHATSAPP_GREEN} />}
          Or use {viaWhatsApp ? 'Telegram' : 'WhatsApp'}
        </a>
        <button onClick={() => navigate('shop')} style={{ background: t.accent, color: 'white', padding: '12px 28px', border: 'none', borderRadius: 6, fontWeight: '700', fontSize: 14, cursor: 'pointer' }}>Continue Shopping</button>
      </div>

      <p style={{ color: t.muted, fontSize: 12, marginTop: 24 }}>If {viaWhatsApp ? 'WhatsApp' : 'Telegram'} didn't open automatically, tap "Continue on {viaWhatsApp ? 'WhatsApp' : 'Telegram'}" above and reference order {order.ref}.</p>
    </div>
  );
}
