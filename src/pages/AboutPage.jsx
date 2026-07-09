import { useApp } from '../context/AppContext';

export default function AboutPage() {
  const { t, navigate } = useApp();
  return (
    <div>
      {/* Hero Section */}
      <div style={{ position: 'relative', minHeight: 560, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        <img
          src="/assets/images/pages/about/banner.PNG"
          alt="About House of Moo"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'right center' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(10,2,8,0.92) 0%, rgba(10,2,8,0.72) 45%, rgba(10,2,8,0.2) 75%, rgba(10,2,8,0.05) 100%)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(233,30,140,0.16) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="fade-in-up" style={{ position: 'relative', zIndex: 1, padding: '80px 80px', maxWidth: 620 }}>
          <div style={{ fontSize: 12, marginBottom: 20, color: 'rgba(245,241,232,0.5)' }}>
            <span style={{ cursor: 'pointer', color: '#e91e8c', fontWeight: 600 }} onClick={() => navigate('home')}>Home</span>
            <span style={{ margin: '0 8px' }}>/</span>
            <span>About Us</span>
          </div>
          <div style={{ display: 'inline-block', background: 'rgba(233,30,140,0.15)', border: '1px solid rgba(233,30,140,0.4)', borderRadius: 30, padding: '6px 20px', marginBottom: 22, backdropFilter: 'blur(12px)' }}>
            <span style={{ color: '#e91e8c', fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' }}>Premium Skincare & Spa · Lagos</span>
          </div>
          <h1 style={{ fontSize: 'clamp(38px,5vw,64px)', fontFamily: 'var(--font-display)', fontWeight: 900, color: '#f5f1e8', marginBottom: 20, lineHeight: 1.12, textShadow: '0 2px 24px rgba(20,0,12,0.6)' }}>
            About<br />
            <span className="gradient-text">House of Moo</span>
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(245,241,232,0.78)', lineHeight: 1.85, maxWidth: 440 }}>
            A premium Nigerian brand built on trust, quality, and the belief that every woman deserves to feel her best.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '80px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, marginBottom: 80, alignItems: 'center' }}>
          <div>
            <div style={{ color: t.accent, fontSize: 12, letterSpacing: 4, fontWeight: '700', textTransform: 'uppercase', marginBottom: 16 }}>Our Story</div>
            <h2 style={{ fontSize: 36, fontFamily: 'var(--font-display)', fontWeight: 'bold', color: t.text, marginBottom: 20, lineHeight: 1.3 }}>Born from a Passion for Authentic Wellness</h2>
            <p style={{ color: t.muted, fontSize: 15, lineHeight: 1.9, marginBottom: 16 }}>House of Moo was founded with one simple mission: to give Nigerian women access to premium, authentic wellness and skincare products in a safe, private, and empowering environment.</p>
            <p style={{ color: t.muted, fontSize: 15, lineHeight: 1.9 }}>We believe that self-care is not a luxury. It is a necessity. Every product we carry is carefully sourced, tested for quality, and delivered with absolute discretion. Your privacy is our promise.</p>
          </div>
          <img src="https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&h=500&fit=crop" alt="About" style={{ width: '100%', height: 420, objectFit: 'cover', borderRadius: 10, border: `1px solid ${t.border}` }} />
        </div>

        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: '48px', marginBottom: 80, textAlign: 'center' }}>
          <div style={{ color: t.accent, fontSize: 12, letterSpacing: 4, fontWeight: '700', textTransform: 'uppercase', marginBottom: 16 }}>Our Values</div>
          <h2 style={{ fontSize: 32, fontFamily: 'var(--font-display)', fontWeight: 'bold', color: t.text, marginBottom: 40 }}>What We Stand For</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32 }}>
            {[
              { title: 'Authenticity', desc: 'Every product is 100% genuine. We source directly from trusted manufacturers and never compromise on quality.' },
              { title: 'Privacy', desc: 'Your business is yours alone. We use discreet packaging, plain billing names, and never share your data.' },
              { title: 'Empowerment', desc: 'We believe in a woman\'s right to explore her wellness, sexuality, and beauty without judgment.' },
            ].map(v => (
              <div key={v.title}>
                <div style={{ width: 48, height: 48, background: `${t.accent}18`, borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: t.accent }}></div>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: '700', color: t.text, marginBottom: 10 }}>{v.title}</h3>
                <p style={{ color: t.muted, fontSize: 14, lineHeight: 1.8 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24, marginBottom: 80 }}>
          {[['5+', 'Years in Business'], ['2,000+', 'Happy Customers'], ['100+', 'Products'], ['4.9', 'Average Rating']].map(([num, label]) => (
            <div key={label} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: '28px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, fontWeight: 'bold', color: t.accent, fontFamily: 'var(--font-display)', marginBottom: 8 }}>{num}</div>
              <div style={{ color: t.muted, fontSize: 14 }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, fontFamily: 'var(--font-display)', fontWeight: 'bold', color: t.text, marginBottom: 16 }}>Ready to Begin Your Journey?</h2>
          <p style={{ color: t.muted, marginBottom: 32, fontSize: 15 }}>Explore our collection or book a spa session today.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={() => navigate('shop')} style={{ background: t.accent, color: 'white', padding: '14px 36px', border: 'none', borderRadius: 6, fontWeight: '700', cursor: 'pointer', fontSize: 14 }}>Shop Products</button>
            <button onClick={() => navigate('spa')} style={{ background: 'transparent', color: t.accent, padding: '14px 36px', border: `2px solid ${t.accent}`, borderRadius: 6, fontWeight: '700', cursor: 'pointer', fontSize: 14 }}>Book Spa</button>
          </div>
        </div>
      </div>
    </div>
  );
}
