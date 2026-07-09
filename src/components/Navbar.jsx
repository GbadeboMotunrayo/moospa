import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

const ANNOUNCEMENTS = [
  '✦ Discreet Packaging Guaranteed',
  '✦ 100% Authentic Products',
  '✦ Fast Nationwide Delivery within 48hrs',
  '✦ WhatsApp Us: +234 905 619 4414',
  '✦ Free Consultation with Every Order',
  '✦ Trusted by 10,000+ Women Across Nigeria',
];

export default function Navbar() {
  const { t, theme, setTheme, navigate, currentPage, cartCount } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 860);
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { label: 'Home', page: 'home' },
    { label: 'Shop', page: 'shop' },
    { label: 'Skincare', page: 'skincare' },
    { label: 'Spa', page: 'spa' },
    { label: 'About', page: 'about' },
    { label: 'Contact', page: 'contact' },
  ];

  const isDark = theme === 'dark';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 860);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const goTo = (page) => {
    setMenuOpen(false);
    navigate(page);
  };

  const marqueeText = (ANNOUNCEMENTS.join('          ') + '          ').repeat(2);

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 1000 }}>

      {/* ── Marquee announcement bar ── */}
      <div className="announcement-bar" style={{ padding: '8px 0', overflow: 'hidden' }}>
        <div className="marquee-track" style={{ fontSize: 11, fontWeight: 600, color: 'white', letterSpacing: '0.8px', textTransform: 'uppercase', whiteSpace: 'nowrap', gap: 0 }}>
          <span style={{ paddingRight: 60 }}>{marqueeText}</span>
          <span style={{ paddingRight: 60 }}>{marqueeText}</span>
        </div>
      </div>

      {/* ── Main nav ── */}
      <div
        className={isDark ? 'glass' : 'glass-light'}
        style={{
          borderBottom: `1px solid ${scrolled
            ? (isDark ? 'rgba(233,30,140,0.25)' : 'rgba(233,30,140,0.25)')
            : (isDark ? 'rgba(233,30,140,0.1)' : 'rgba(233,30,140,0.15)')}`,
          padding: isMobile ? '0 16px' : '0 48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: scrolled ? 60 : 70,
          transition: 'height 0.3s ease, box-shadow 0.3s ease, border-color 0.3s',
          boxShadow: scrolled
            ? '0 8px 48px rgba(0,0,0,0.6), 0 0 80px rgba(233,30,140,0.08)'
            : '0 2px 20px rgba(0,0,0,0.3)',
        }}
      >
        {/* ── Logo ── */}
        <button onClick={() => goTo('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1, flexShrink: 0, minWidth: 0 }}>
          <span className="gradient-text" style={{ fontSize: isMobile ? 15 : 20, fontWeight: 900, letterSpacing: isMobile ? 2 : 4, fontFamily: 'var(--font-display)', lineHeight: 1, whiteSpace: 'nowrap' }}>
            HOUSE OF MOO
          </span>
          {!isMobile && (
            <span style={{ fontSize: 9, letterSpacing: 3, color: isDark ? 'rgba(233,30,140,0.6)' : 'rgba(194,22,111,0.7)', fontWeight: 500, textTransform: 'uppercase' }}>
              Skincare · Wellness · Spa
            </span>
          )}
        </button>

        {/* ── Nav links (desktop only) ── */}
        {!isMobile && (
          <nav style={{ display: 'flex', gap: 2 }}>
            {links.map(link => {
              const active = currentPage === link.page;
              return (
                <button key={link.page} onClick={() => navigate(link.page)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    color: active ? '#e91e8c' : isDark ? 'rgba(245,241,232,0.65)' : 'rgba(26,10,18,0.6)',
                    fontSize: 13,
                    fontWeight: active ? 700 : 400,
                    fontFamily: 'var(--font-body)',
                    letterSpacing: '0.3px',
                    position: 'relative',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#e91e8c'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = isDark ? 'rgba(245,241,232,0.65)' : 'rgba(26,10,18,0.6)'; }}
                >
                  {link.label}
                  {active && (
                    <span style={{ position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)', width: 18, height: 2, background: 'linear-gradient(90deg,#e91e8c,#ff6eb4)', borderRadius: 2, boxShadow: '0 0 8px rgba(233,30,140,0.8)' }} />
                  )}
                </button>
              );
            })}
          </nav>
        )}

        {/* ── Right controls ── */}
        <div style={{ display: 'flex', gap: isMobile ? 6 : 10, alignItems: 'center', flexShrink: 0 }}>
          {/* Theme toggle */}
          <button onClick={() => setTheme(isDark ? 'light' : 'dark')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px', color: isDark ? 'rgba(245,241,232,0.4)' : 'rgba(26,10,18,0.4)', fontSize: 18, lineHeight: 1, transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#e91e8c'}
            onMouseLeave={e => e.currentTarget.style.color = isDark ? 'rgba(245,241,232,0.4)' : 'rgba(26,10,18,0.4)'}
            title={isDark ? 'Light Mode' : 'Dark Mode'}
          >
            {isDark ? '☀' : '☾'}
          </button>

          {/* Cart */}
          <button onClick={() => navigate('cart')} style={{ position: 'relative', background: 'linear-gradient(135deg, #e91e8c, #c2166f)', border: 'none', borderRadius: 24, padding: isMobile ? '8px 12px' : '9px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, color: 'white', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-body)', boxShadow: cartCount > 0 ? '0 4px 24px rgba(233,30,140,0.55)' : '0 2px 12px rgba(233,30,140,0.25)', transition: 'transform 0.2s, box-shadow 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(233,30,140,0.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = cartCount > 0 ? '0 4px 24px rgba(233,30,140,0.55)' : '0 2px 12px rgba(233,30,140,0.25)'; }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            {!isMobile && 'Bag'}
            {cartCount > 0 && (
              <span className="pulse" style={{ background: 'white', color: '#e91e8c', borderRadius: '50%', width: 20, height: 20, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cartCount}</span>
            )}
          </button>

          {/* Hamburger (mobile only) */}
          {isMobile && (
            <button onClick={() => setMenuOpen(o => !o)} aria-label="Menu"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 4px', display: 'flex', flexDirection: 'column', gap: 4, justifyContent: 'center' }}>
              <span style={{ width: 20, height: 2, background: isDark ? '#f5f1e8' : '#1a0a12', borderRadius: 2, transition: 'transform 0.2s', transform: menuOpen ? 'translateY(6px) rotate(45deg)' : 'none' }} />
              <span style={{ width: 20, height: 2, background: isDark ? '#f5f1e8' : '#1a0a12', borderRadius: 2, opacity: menuOpen ? 0 : 1, transition: 'opacity 0.2s' }} />
              <span style={{ width: 20, height: 2, background: isDark ? '#f5f1e8' : '#1a0a12', borderRadius: 2, transition: 'transform 0.2s', transform: menuOpen ? 'translateY(-6px) rotate(-45deg)' : 'none' }} />
            </button>
          )}
        </div>
      </div>

      {/* ── Mobile dropdown menu ── */}
      {isMobile && menuOpen && (
        <nav className={isDark ? 'glass' : 'glass-light'} style={{ display: 'flex', flexDirection: 'column', padding: '8px 16px 16px', borderBottom: `1px solid ${isDark ? 'rgba(233,30,140,0.15)' : 'rgba(233,30,140,0.2)'}` }}>
          {links.map(link => {
            const active = currentPage === link.page;
            return (
              <button key={link.page} onClick={() => goTo(link.page)}
                style={{
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  padding: '12px 4px',
                  cursor: 'pointer',
                  color: active ? '#e91e8c' : isDark ? 'rgba(245,241,232,0.75)' : 'rgba(26,10,18,0.7)',
                  fontSize: 15,
                  fontWeight: active ? 700 : 400,
                  fontFamily: 'var(--font-body)',
                  borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                }}
              >
                {link.label}
              </button>
            );
          })}
        </nav>
      )}

      {/* ── Neon line ── */}
      <div className="neon-divider" />
    </div>
  );
}
