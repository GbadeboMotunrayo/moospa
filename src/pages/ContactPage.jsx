import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function ContactPage() {
  const { t, navigate } = useApp();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = e => {
    e.preventDefault();
    if (form.name && form.email && form.message) {
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSent(false), 4000);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <div style={{ position: 'relative', minHeight: 520, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        <img
          src="/assets/images/pages/contact/banner.PNG"
          alt="Contact House of Moo"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'right center' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(10,2,8,0.93) 0%, rgba(10,2,8,0.74) 45%, rgba(10,2,8,0.22) 75%, rgba(10,2,8,0.05) 100%)' }} />
        <div style={{ position: 'absolute', top: -60, left: -60, width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(233,30,140,0.14) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="fade-in-up" style={{ position: 'relative', zIndex: 1, padding: '80px 80px', maxWidth: 600 }}>
          <div style={{ fontSize: 12, marginBottom: 20, color: 'rgba(245,241,232,0.5)' }}>
            <span style={{ cursor: 'pointer', color: '#e91e8c', fontWeight: 600 }} onClick={() => navigate('home')}>Home</span>
            <span style={{ margin: '0 8px' }}>/</span>
            <span>Contact</span>
          </div>
          <div style={{ display: 'inline-block', background: 'rgba(233,30,140,0.15)', border: '1px solid rgba(233,30,140,0.4)', borderRadius: 30, padding: '6px 20px', marginBottom: 22, backdropFilter: 'blur(12px)' }}>
            <span style={{ color: '#e91e8c', fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' }}>We'd Love to Hear from You</span>
          </div>
          <h1 style={{ fontSize: 'clamp(38px,5vw,64px)', fontFamily: 'var(--font-display)', fontWeight: 900, color: '#f5f1e8', marginBottom: 20, lineHeight: 1.12, textShadow: '0 2px 24px rgba(20,0,12,0.6)' }}>
            Get in<br />
            <span className="gradient-text">Touch</span>
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(245,241,232,0.78)', lineHeight: 1.85, maxWidth: 400 }}>
            We typically respond within 2 hours during business hours. WhatsApp is fastest.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 64 }}>
          {/* Info panel */}
          <div>
            <div style={{ marginBottom: 40 }}>
              <h2 style={{ fontSize: 24, fontFamily: 'var(--font-display)', fontWeight: 'bold', color: t.text, marginBottom: 24 }}>Contact Information</h2>
              {[
                { label: 'WhatsApp', value: '09056........', note: 'Fastest response', link: 'https://wa.me/2349056194414' },
                { label: 'Phone', value: '09056........ / 08106........', note: 'Call or WhatsApp us', link: 'https://wa.me/2349056194414' },
                { label: 'Spa Location', value: '1 Olaniyi Street, New Okooba, Abulegba, Lagos', note: 'Mon–Sat 9am–7pm' },
              ].map(c => (
                <div key={c.label} style={{ display: 'flex', gap: 16, marginBottom: 24, padding: '18px 20px', background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8 }}>
                  <div style={{ width: 44, height: 44, background: `${t.accent}18`, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: t.accent }}></div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: t.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{c.label}</div>
                    {c.link ? <a href={c.link} target="_blank" rel="noreferrer" style={{ fontSize: 15, fontWeight: '700', color: t.text, textDecoration: 'none' }}>{c.value}</a>
                      : <div style={{ fontSize: 15, fontWeight: '700', color: t.text }}>{c.value}</div>}
                    <div style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>{c.note}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, padding: '20px 24px' }}>
              <div style={{ fontSize: 13, fontWeight: '700', color: t.text, marginBottom: 12 }}>Business Hours</div>
              {[['Monday – Friday', '9:00 AM – 6:00 PM'], ['Saturday', '10:00 AM – 5:00 PM'], ['Sunday', 'Closed (WhatsApp only)']].map(([day, hours]) => (
                <div key={day} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: t.muted }}>{day}</span>
                  <span style={{ color: t.text, fontWeight: '600' }}>{hours}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: '36px' }}>
            <h2 style={{ fontSize: 22, fontWeight: '700', color: t.text, marginBottom: 24 }}>Send a Message</h2>
            {sent && (
              <div style={{ background: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: 6, padding: '12px 16px', marginBottom: 20, color: '#2e7d32', fontWeight: '600', fontSize: 14 }}>
                Message sent! We will get back to you within 2 hours.
              </div>
            )}
            <form onSubmit={handleSubmit}>
              {[['Full Name', 'name', 'text'], ['Email Address', 'email', 'email'], ['Subject', 'subject', 'text']].map(([label, key, type]) => (
                <div key={key} style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 11, fontWeight: '700', color: t.muted, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</label>
                  <input type={type} required={key !== 'subject'} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ width: '100%', padding: '12px 14px', background: t.input, border: `1px solid ${t.border}`, borderRadius: 6, color: t.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 11, fontWeight: '700', color: t.muted, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Message</label>
                <textarea required value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Tell us how we can help..." rows={5}
                  style={{ width: '100%', padding: '12px 14px', background: t.input, border: `1px solid ${t.border}`, borderRadius: 6, color: t.text, fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" style={{ flex: 1, padding: '14px', background: t.accent, color: 'white', border: 'none', borderRadius: 6, fontWeight: '700', fontSize: 15, cursor: 'pointer' }}>Send Message</button>
                <a href="https://wa.me/2349056194414" target="_blank" rel="noreferrer" style={{ flex: 1, padding: '14px', background: '#25d366', color: 'white', border: 'none', borderRadius: 6, fontWeight: '700', fontSize: 15, cursor: 'pointer', textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>WhatsApp</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
