import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Footer() {
  const { t, navigate } = useApp();
  const [email, setEmail] = useState('');
  const [subDone, setSubDone] = useState(false);
  const isDark = t.bg === '#0d0d0d';

  const handleSub = e => {
    e.preventDefault();
    if (email.includes('@')) { setSubDone(true); setEmail(''); }
  };

  const socials = [
    { label: 'Instagram', href: 'https://www.instagram.com/houseofmoo_skincare/', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg> },
    { label: 'WhatsApp', href: 'https://wa.me/2348106393774', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> },
    { label: 'TikTok', href: '#', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.84 1.54V6.78a4.85 4.85 0 01-1.07-.09z"/></svg> },
    { label: 'Facebook', href: '#', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.27h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z"/></svg> },
  ];

  return (
    <footer style={{ background: isDark ? '#0a0a0a' : '#faf0f6', borderTop: `1px solid ${t.border}` }}>

      {/* ── Newsletter band ── */}
      <div style={{ background: 'linear-gradient(135deg, #1a0a12 0%, #2a0818 50%, #1a0a12 100%)', padding: '56px 40px', textAlign: 'center', borderBottom: '1px solid rgba(233,30,140,0.15)' }}>
        <div style={{ maxWidth: 540, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: 'rgba(233,30,140,0.15)', border: '1px solid rgba(233,30,140,0.3)', borderRadius: 30, padding: '5px 18px', marginBottom: 20 }}>
            <span style={{ color: '#e91e8c', fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' }}>Join the Inner Circle</span>
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, color: '#f5f1e8', marginBottom: 10, lineHeight: 1.3 }}>
            Get Exclusive Offers & <span className="gradient-text">Skincare Tips</span>
          </h3>
          <p style={{ color: 'rgba(245,241,232,0.55)', fontSize: 14, marginBottom: 28 }}>Be the first to know about new arrivals, members-only deals and wellness advice.</p>
          {subDone ? (
            <div style={{ color: '#e91e8c', fontWeight: 700, fontSize: 15 }}>✓ You're in! Welcome to the House of Moo family.</div>
          ) : (
            <form onSubmit={handleSub} style={{ display: 'flex', gap: 0, maxWidth: 420, margin: '0 auto', borderRadius: 50, overflow: 'hidden', border: '1px solid rgba(233,30,140,0.4)', boxShadow: '0 0 40px rgba(233,30,140,0.15)' }}>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" type="email" style={{ flex: 1, padding: '14px 20px', background: 'rgba(255,255,255,0.05)', border: 'none', outline: 'none', color: '#f5f1e8', fontSize: 14, fontFamily: 'var(--font-body)' }} />
              <button type="submit" style={{ padding: '14px 24px', background: 'linear-gradient(135deg,#e91e8c,#c2166f)', border: 'none', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>Subscribe</button>
            </form>
          )}
        </div>
      </div>

      {/* ── Main footer ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 40px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>

          {/* Brand col */}
          <div>
            <div style={{ fontFamily: 'var(--font-display)', color: '#e91e8c', fontSize: 20, fontWeight: 900, letterSpacing: 3, marginBottom: 6 }}>HOUSE OF MOO</div>
            <div style={{ fontSize: 10, letterSpacing: 3, color: isDark ? 'rgba(233,30,140,0.5)' : 'rgba(194,22,111,0.6)', fontWeight: 500, textTransform: 'uppercase', marginBottom: 18 }}>Skincare · Wellness · Spa</div>
            <p style={{ color: t.muted, fontSize: 14, lineHeight: 1.9, maxWidth: 270, marginBottom: 16 }}>Premium skincare, intimate wellness, and luxury spa for the modern Nigerian woman. Discreet. Authentic. Empowering.</p>
            <p style={{ color: isDark ? 'rgba(245,241,232,0.3)' : 'rgba(26,10,18,0.35)', fontSize: 12, lineHeight: 1.8 }}>
              1 Olaniyi Street, New Okooba<br />Abulegba, Lagos
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              {socials.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer" title={s.label}
                  style={{ width: 38, height: 38, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(233,30,140,0.07)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(233,30,140,0.15)'}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.muted, textDecoration: 'none', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(233,30,140,0.15)'; e.currentTarget.style.color = '#e91e8c'; e.currentTarget.style.borderColor = 'rgba(233,30,140,0.4)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(233,30,140,0.07)'; e.currentTarget.style.color = t.muted; e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(233,30,140,0.15)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >{s.icon}</a>
              ))}
            </div>
          </div>

          {[
            { title: 'Shop', links: [{ l: 'All Products', p: 'shop' }, { l: 'Skincare', p: 'skincare' }, { l: 'Adult Wellness', p: 'sextoys' }, { l: 'Spa Services', p: 'spa' }] },
            { title: 'Company', links: [{ l: 'About Us', p: 'about' }, { l: 'Contact', p: 'contact' }, { l: 'FAQ', p: 'faq' }] },
            { title: 'Support', links: [{ l: 'Track Order', p: 'contact' }, { l: 'Returns & Refunds', p: 'faq' }, { l: 'Spa Booking', p: 'spa' }, { l: 'WhatsApp Us', p: 'contact' }] },
          ].map(col => (
            <div key={col.title}>
              <div style={{ color: t.text, fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 }}>{col.title}</div>
              {col.links.map(link => (
                <button key={link.l} onClick={() => navigate(link.p)}
                  style={{ background: 'none', border: 'none', display: 'block', color: t.muted, fontSize: 14, cursor: 'pointer', marginBottom: 12, padding: 0, fontFamily: 'var(--font-body)', textAlign: 'left', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#e91e8c'}
                  onMouseLeave={e => e.currentTarget.style.color = t.muted}
                >{link.l}</button>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: isDark ? 'rgba(245,241,232,0.25)' : 'rgba(26,10,18,0.3)', fontSize: 12 }}>© 2026 House of Moo. All rights reserved.</span>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Privacy Policy', 'Terms of Service'].map(l => (
              <button key={l} onClick={() => navigate('faq')} style={{ background: 'none', border: 'none', color: isDark ? 'rgba(245,241,232,0.25)' : 'rgba(26,10,18,0.3)', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-body)', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#e91e8c'}
                onMouseLeave={e => e.currentTarget.style.color = isDark ? 'rgba(245,241,232,0.25)' : 'rgba(26,10,18,0.3)'}
              >{l}</button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
