import { useState } from 'react';
import { useApp } from '../context/AppContext';

const FAQS = [
  { cat: 'Delivery', q: 'How long does delivery take?', a: 'Standard delivery is 24–48 hours within Lagos. Nationwide delivery takes 2–4 business days.' },
  { cat: 'Delivery', q: 'Do you deliver nationwide?', a: 'Yes! We deliver to all 36 states in Nigeria via trusted courier partners.' },
  { cat: 'Privacy', q: 'Is my order packaging discreet?', a: 'Absolutely. All orders are shipped in plain, unmarked packaging. Your billing statement will show a discreet name, not the product name or our brand name.' },
  { cat: 'Privacy', q: 'Do you share my personal information?', a: 'Never. Your personal details are used solely for order fulfillment and are never shared with third parties.' },
  { cat: 'Payment', q: 'What payment methods do you accept?', a: 'We accept all Nigerian bank cards (Visa, Mastercard, Verve), bank transfers, USSD, and mobile money via Paystack.' },
  { cat: 'Payment', q: 'Is it safe to pay on your website?', a: 'Yes. All payments are processed by Paystack, Nigeria\'s leading payment gateway, using SSL encryption. We never store your card details.' },
  { cat: 'Payment', q: 'What is your refund policy?', a: 'We offer refunds or exchanges within 7 days for unopened, unused products. For damaged items, contact us within 24 hours of delivery.' },
  { cat: 'Products', q: 'Are your products authentic?', a: 'Yes, 100%. All products are sourced directly from verified manufacturers. We do not sell counterfeits or replicas.' },
  { cat: 'Products', q: 'Are your skincare products suitable for dark skin?', a: 'Yes! All our skincare products are specifically formulated and tested for Nigerian and African skin tones.' },
  { cat: 'Spa', q: 'How do I book a spa appointment?', a: 'Visit our Spa Services page and click "Book Now" on any service. Fill in the booking form and we will confirm via WhatsApp or email within 2 hours.' },
  { cat: 'Spa', q: 'Can I cancel or reschedule my spa appointment?', a: 'Yes. Please notify us at least 24 hours before your appointment via WhatsApp or phone. Late cancellations may incur a 20% fee.' },
  { cat: 'Spa', q: 'Where is the spa located?', a: 'Our spa is located at 1 Olaniyi Street, New Okooba, Abulegba, Lagos. The exact address is provided in your booking confirmation.' },
];

export default function FAQPage() {
  const { t, navigate } = useApp();
  const [open, setOpen] = useState(null);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');

  const cats = ['All', ...new Set(FAQS.map(f => f.cat))];
  const filtered = FAQS.filter(f => {
    const matchCat = cat === 'All' || f.cat === cat;
    const matchSearch = !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div>
      <div style={{ background: `linear-gradient(135deg, ${t.surface}, ${t.bg})`, padding: '72px 40px', textAlign: 'center', borderBottom: `1px solid ${t.border}` }}>
        <div style={{ color: t.muted, fontSize: 13, marginBottom: 12 }}><span style={{ cursor: 'pointer', color: t.accent }} onClick={() => navigate('home')}>Home</span> / FAQ</div>
        <h1 style={{ fontSize: 48, fontFamily: 'var(--font-display)', fontWeight: 'bold', color: t.text, marginBottom: 12 }}>Frequently Asked Questions</h1>
        <p style={{ color: t.muted, fontSize: 15, maxWidth: 480, margin: '0 auto 32px' }}>Find answers to common questions about our products, spa services, delivery, and privacy.</p>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search questions..." style={{ width: '100%', maxWidth: 480, padding: '13px 20px', background: t.input, border: `1px solid ${t.border}`, borderRadius: 30, color: t.text, fontSize: 14, outline: 'none', textAlign: 'center' }} />
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 40px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 40, justifyContent: 'center', flexWrap: 'wrap' }}>
          {cats.map(c => (
            <button key={c} onClick={() => setCat(c)}
              style={{ padding: '8px 20px', borderRadius: 20, border: `2px solid ${cat === c ? t.accent : t.border}`, background: cat === c ? `${t.accent}18` : 'transparent', color: cat === c ? t.accent : t.muted, fontSize: 13, fontWeight: cat === c ? '700' : '400', cursor: 'pointer' }}>
              {c}
            </button>
          ))}
        </div>

        {filtered.length === 0 && <div style={{ textAlign: 'center', color: t.muted, padding: '40px 0' }}>No results found for "{search}"</div>}

        {filtered.map((faq, i) => (
          <div key={i} style={{ border: `1px solid ${t.border}`, borderRadius: 8, marginBottom: 10, overflow: 'hidden' }}>
            <button onClick={() => setOpen(open === i ? null : i)}
              style={{ width: '100%', padding: '18px 22px', background: open === i ? `${t.accent}10` : t.surface, border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', textAlign: 'left' }}>
              <span style={{ fontSize: 15, fontWeight: '600', color: t.text, flex: 1 }}>{faq.q}</span>
              <span style={{ color: t.accent, fontSize: 22, fontWeight: '300', marginLeft: 12, flexShrink: 0 }}>{open === i ? '−' : '+'}</span>
            </button>
            {open === i && (
              <div style={{ padding: '0 22px 20px', background: t.card }}>
                <p style={{ color: t.muted, fontSize: 14, lineHeight: 1.9, margin: 0 }}>{faq.a}</p>
              </div>
            )}
          </div>
        ))}

        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: '32px', textAlign: 'center', marginTop: 48 }}>
          <h3 style={{ fontSize: 20, fontWeight: '700', color: t.text, marginBottom: 8 }}>Still have questions?</h3>
          <p style={{ color: t.muted, fontSize: 14, marginBottom: 20 }}>Our team is available 24/7 on WhatsApp to help you.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <a href="https://wa.me/2348106393774" target="_blank" rel="noreferrer" style={{ background: '#25d366', color: 'white', padding: '11px 28px', borderRadius: 6, fontWeight: '700', fontSize: 14, textDecoration: 'none' }}>Chat on WhatsApp</a>
            <button onClick={() => navigate('contact')} style={{ background: 'transparent', color: t.accent, padding: '11px 28px', border: `2px solid ${t.accent}`, borderRadius: 6, fontWeight: '700', fontSize: 14, cursor: 'pointer' }}>Contact Us</button>
          </div>
        </div>
      </div>
    </div>
  );
}
