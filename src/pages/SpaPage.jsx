import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SPA_SERVICES, TIME_SLOTS } from '../data/spaServices';
import { bookingsAPI } from '../services/api';

export default function SpaPage() {
  const { t, navigate } = useApp();
  const [filterCat, setFilterCat] = useState('All');
  const [booking, setBooking] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', date: '', time: '', notes: '' });
  const [submitted, setSubmitted] = useState(false);

  const cats = ['All', ...new Set(SPA_SERVICES.map(s => s.category))];
  const filtered = filterCat === 'All' ? SPA_SERVICES : SPA_SERVICES.filter(s => s.category === filterCat);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.date || !form.time) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await bookingsAPI.create({
        customer_name: form.name,
        customer_email: form.email || null,
        customer_phone: form.phone,
        service_id: booking.id,
        service_name: booking.name,
        service_price: booking.price,
        booking_date: form.date,
        booking_time: form.time,
        notes: form.notes || null,
      });
      setSubmitted(true);
      setTimeout(() => { setBooking(null); setSubmitted(false); setForm({ name: '', email: '', phone: '', date: '', time: '', notes: '' }); }, 3000);
    } catch (err) {
      setSubmitError(err.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <div style={{ position: 'relative', minHeight: 640, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        <img
          src="/assets/images/pages/spa/katherine-hanlon-WAm_HaI4W2E-unsplash.jpg"
          alt="House of Moo Spa & Wellness"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(8,2,6,0.92) 0%, rgba(8,2,6,0.65) 50%, rgba(8,2,6,0.2) 100%)' }} />
        <div style={{ position: 'absolute', bottom: -100, left: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(233,30,140,0.16) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="fade-in-up" style={{ position: 'relative', zIndex: 1, padding: '80px 80px', maxWidth: 660 }}>
          <div style={{ display: 'inline-block', background: 'rgba(233,30,140,0.15)', border: '1px solid rgba(233,30,140,0.4)', borderRadius: 30, padding: '6px 20px', marginBottom: 24, backdropFilter: 'blur(12px)' }}>
            <span style={{ color: '#e91e8c', fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' }}>Luxury Spa · Abulegba, Lagos</span>
          </div>

          <h1 style={{ fontSize: 'clamp(42px,5.5vw,68px)', fontFamily: 'var(--font-display)', fontWeight: 900, color: '#f5f1e8', marginBottom: 20, lineHeight: 1.1, textShadow: '0 2px 24px rgba(20,0,12,0.6)' }}>
            Escape.<br />
            <span className="gradient-text" style={{ filter: 'drop-shadow(0 2px 18px rgba(20,0,12,0.5))' }}>Relax. Renew.</span>
          </h1>

          <p style={{ fontSize: 17, color: 'rgba(245,241,232,0.78)', maxWidth: 480, marginBottom: 36, lineHeight: 1.85 }}>
            Step into a world of complete relaxation. Premium treatments for your body, face, and soul, in the heart of Abulegba, Lagos.
          </p>

          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
            {['Mon–Sat: 9am–7pm', 'Sun: 10am–5pm', 'Abulegba, Lagos'].map(info => (
              <div key={info} style={{ fontSize: 13, color: 'rgba(245,241,232,0.7)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#e91e8c', flexShrink: 0 }} />{info}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ background: t.surface, borderBottom: `1px solid ${t.border}`, padding: '0 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 1 }}>
          {cats.map(c => (
            <button key={c} onClick={() => setFilterCat(c)}
              style={{ padding: '16px 24px', background: 'none', border: 'none', borderBottom: filterCat === c ? `3px solid ${t.accent}` : '3px solid transparent', color: filterCat === c ? t.accent : t.muted, fontSize: 14, fontWeight: filterCat === c ? '700' : '400', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'color 0.2s' }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Services grid */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px,1fr))', gap: 28 }}>
          {filtered.map(s => (
            <div key={s.id} style={{ background: t.card, borderRadius: 10, overflow: 'hidden', border: `1px solid ${t.border}`, transition: 'transform 0.3s, box-shadow 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 16px 48px rgba(233,30,140,0.15)`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ position: 'relative' }}>
                <img src={s.image} alt={s.name} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
                {s.popular && <div style={{ position: 'absolute', top: 12, left: 12, background: t.accent, color: 'white', fontSize: 10, fontWeight: '700', padding: '4px 10px', borderRadius: 20 }}>Popular</div>}
                <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.7)', color: '#f5f1e8', fontSize: 11, fontWeight: '700', padding: '4px 10px', borderRadius: 20 }}>{s.duration}</div>
              </div>
              <div style={{ padding: '20px 22px' }}>
                <div style={{ fontSize: 11, color: t.accent, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{s.category}</div>
                <h3 style={{ fontSize: 20, fontFamily: 'var(--font-display)', fontWeight: 'bold', color: t.text, marginBottom: 8 }}>{s.name}</h3>
                <p style={{ color: t.muted, fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>{s.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 24, fontWeight: 'bold', color: t.accent }}>N{s.price.toLocaleString()}</span>
                  <button onClick={() => setBooking(s)}
                    style={{ padding: '10px 24px', background: t.accent, color: 'white', border: 'none', borderRadius: 6, fontWeight: '700', cursor: 'pointer', fontSize: 14 }}>
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gallery strip */}
      <div style={{ background: t.surface, padding: '60px 40px', borderTop: `1px solid ${t.border}`, borderBottom: `1px solid ${t.border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h2 style={{ fontSize: 36, fontFamily: 'var(--font-display)', fontWeight: 900, color: t.text, marginBottom: 10 }}>Our Space</h2>
            <p style={{ color: t.muted, fontSize: 15 }}>A sanctuary designed for your wellbeing</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
            {[
              { src: '/assets/images/pages/spa/IMG_2170.JPG', alt: 'House of Moo treatment room' },
              { src: '/assets/images/pages/spa/IMG_2194.PNG', alt: 'House of Moo reception lounge' },
              { src: '/assets/images/pages/spa/IMG_2162.JPG', alt: 'House of Moo sauna treatment room' },
              { src: '/assets/images/pages/spa/IMG_2180.JPG', alt: 'House of Moo waiting area' },
            ].map((img, i) => (
              <div key={i} style={{ borderRadius: 12, overflow: 'hidden', aspectRatio: '4/3' }}>
                <img src={img.src} alt={img.alt} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                  onMouseEnter={e => e.target.style.transform = 'scale(1.07)'}
                  onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {booking && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14, padding: 36, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 24, fontFamily: 'var(--font-display)', fontWeight: 'bold', color: t.text }}>Book Service</h2>
                <p style={{ color: t.accent, fontWeight: '700', marginTop: 4 }}>{booking.name} · N{booking.price.toLocaleString()}</p>
              </div>
              <button onClick={() => setBooking(null)} style={{ background: 'none', border: 'none', color: t.muted, fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ width: 60, height: 60, background: '#e8f5e9', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
                </div>
                <h3 style={{ color: t.text, fontSize: 20, fontWeight: '700', marginBottom: 8 }}>Booking Received!</h3>
                <p style={{ color: t.muted, fontSize: 14 }}>We will confirm your appointment via WhatsApp or email shortly.</p>
              </div>
            ) : (
              <>
                {[['Full Name', 'name', 'text'], ['Email Address', 'email', 'email'], ['Phone Number', 'phone', 'tel']].map(([label, key, type]) => (
                  <div key={key} style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 11, fontWeight: '700', color: t.muted, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</label>
                    <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      style={{ width: '100%', padding: '11px 14px', background: t.input, border: `1px solid ${t.border}`, borderRadius: 6, color: t.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                ))}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: '700', color: t.muted, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Preferred Date</label>
                    <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} min={new Date().toISOString().split('T')[0]}
                      style={{ width: '100%', padding: '11px 14px', background: t.input, border: `1px solid ${t.border}`, borderRadius: 6, color: t.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: '700', color: t.muted, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Time Slot</label>
                    <select value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                      style={{ width: '100%', padding: '11px 14px', background: t.input, border: `1px solid ${t.border}`, borderRadius: 6, color: t.text, fontSize: 14, outline: 'none' }}>
                      <option value="">Select time</option>
                      {TIME_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: 11, fontWeight: '700', color: t.muted, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Special Requests</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any preferences or health conditions we should know about..."
                    style={{ width: '100%', padding: '11px 14px', background: t.input, border: `1px solid ${t.border}`, borderRadius: 6, color: t.text, fontSize: 14, outline: 'none', minHeight: 80, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
                {submitError && <div style={{ color: '#ef5350', fontSize: 12, marginBottom: 12, padding: '8px 12px', background: 'rgba(239,83,80,0.1)', borderRadius: 6 }}>{submitError}</div>}
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => setBooking(null)} style={{ flex: 1, padding: '13px', background: 'transparent', border: `1px solid ${t.border}`, borderRadius: 6, color: t.muted, cursor: 'pointer', fontSize: 14 }}>Cancel</button>
                  <button onClick={handleSubmit} disabled={submitting} style={{ flex: 2, padding: '13px', background: submitting ? '#888' : t.accent, border: 'none', borderRadius: 6, color: 'white', fontWeight: '700', cursor: submitting ? 'not-allowed' : 'pointer', fontSize: 14 }}>{submitting ? 'Sending...' : 'Confirm Booking'}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
