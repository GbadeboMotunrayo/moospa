import { useApp } from '../context/AppContext';
import { REVIEWS } from '../data/products';
import { useProducts } from '../hooks/useProducts';
import GlowCard from '../components/GlowCard';
import GlowButton from '../components/GlowButton';
import TelegramIcon from '../components/TelegramIcon';
import WhatsAppIcon from '../components/WhatsAppIcon';
import { whatsappLink, telegramLink } from '../config/contact';

function Stars({ rating }) {
  return <span className="stars" style={{ fontSize: 15 }}>{'★'.repeat(Math.round(rating))}{'☆'.repeat(5-Math.round(rating))}</span>;
}

export default function HomePage() {
  const { t, theme, navigate, addToCart } = useApp();
  const { products } = useProducts();
  const featured = products.filter(p => p.featured).slice(0, 4);
  const isDark = theme === 'dark';

  return (
    <div>

      {/* ── Hero ── */}
      <div style={{ position: 'relative', minHeight: 640, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>

        {/* Full-bleed brand photo — switches with theme */}
        <img
          src={isDark
            ? '/assets/images/pages/home/hero-dark.PNG'
            : '/assets/images/pages/home/hero-light.PNG'}
          alt="House of Moo"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', transition: 'opacity 0.6s ease' }}
        />

        {/* Gradient overlay — dark left-to-right fade so text is readable */}
        <div style={{ position: 'absolute', inset: 0, background: isDark
          ? 'linear-gradient(90deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.4) 55%, rgba(0,0,0,0.05) 100%)'
          : 'linear-gradient(90deg, rgba(255,240,250,0.92) 0%, rgba(252,228,243,0.7) 55%, rgba(252,228,243,0.1) 100%)' }} />

        {/* Pink glow bloom bottom-left */}
        <div style={{ position: 'absolute', bottom: -100, left: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(233,30,140,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Content */}
        <div className="fade-in-up" style={{ position: 'relative', zIndex: 1, padding: '80px 80px', maxWidth: 640 }}>
          <div style={{ display: 'inline-block', background: 'rgba(233,30,140,0.15)', border: '1px solid rgba(233,30,140,0.4)', borderRadius: 30, padding: '6px 20px', marginBottom: 24, backdropFilter: 'blur(12px)' }}>
            <span style={{ color: '#e91e8c', fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' }}>Premium Skincare & Spa · Lagos, Nigeria</span>
          </div>

          <h1 style={{ fontSize: 'clamp(40px,5.5vw,72px)', fontWeight: 900, color: isDark ? '#f5f1e8' : '#1a0a12', marginBottom: 20, fontFamily: 'var(--font-display)', lineHeight: 1.12, textShadow: '0 2px 24px rgba(20,0,12,0.55)' }}>
            Unlock Your<br />
            <span className="gradient-text" style={{ filter: 'drop-shadow(0 2px 18px rgba(20,0,12,0.5))' }}>Inner Goddess</span>
          </h1>

          <p style={{ fontSize: 17, color: isDark ? 'rgba(245,241,232,0.75)' : 'rgba(26,10,18,0.65)', marginBottom: 40, lineHeight: 1.8, maxWidth: 440 }}>
            Premium skincare, intimate wellness, and luxury spa. Delivered discreetly to your door across Nigeria.
          </p>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <GlowButton size="lg" onClick={() => navigate('shop')}>Shop the Collection</GlowButton>
            <GlowButton size="lg" variant="whatsapp" href={whatsappLink()}>
              <WhatsAppIcon size={17} color="white" />
              Chat on WhatsApp
            </GlowButton>
            <GlowButton size="lg" variant="telegram" href={telegramLink()}>
              <TelegramIcon size={17} color="white" />
              Chat on Telegram
            </GlowButton>
          </div>
        </div>
      </div>

      {/* ── Trust badges ── */}
      <div style={{ background: isDark ? 'rgba(10,5,8,0.9)' : 'rgba(252,240,248,0.9)', borderTop: `1px solid ${isDark ? 'rgba(233,30,140,0.1)' : 'rgba(233,30,140,0.12)'}`, borderBottom: `1px solid ${isDark ? 'rgba(233,30,140,0.1)' : 'rgba(233,30,140,0.12)'}`, padding: '28px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}>
          {[
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e91e8c" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>, title: 'Discreet & Private', sub: 'Plain packaging, always' },
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e91e8c" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>, title: 'Secure Payments', sub: 'Powered by Paystack' },
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e91e8c" strokeWidth="2"><path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3"/><rect x="9" y="11" width="14" height="10" rx="1"/><circle cx="12" cy="16" r="1" fill="#e91e8c"/></svg>, title: 'Fast Delivery', sub: 'Nationwide within 48hrs' },
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e91e8c" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>, title: '24/7 Support', sub: 'WhatsApp anytime' },
          ].map(b => (
            <div key={b.title} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(233,30,140,0.1)', border: '1px solid rgba(233,30,140,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {b.icon}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: t.text, fontFamily: 'var(--font-body)' }}>{b.title}</div>
                <div style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>{b.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Shop by Category ── */}
      <div style={{ padding: '88px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 className="fade-in-up" style={{ fontSize: 44, fontFamily: 'var(--font-display)', fontWeight: 900, color: t.text, marginBottom: 10 }}>Shop by Category</h2>
          <p style={{ color: t.muted, fontSize: 16 }}>Discover what speaks to you</p>
        </div>
        <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 28 }}>
          {[
            { label: 'Skincare', sub: 'Serums, creams & body care', page: 'skincare', img: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=400&fit=crop', color: 'rgba(233,30,140,0.15)' },
            { label: 'Adult Wellness', sub: 'Discreet. Private. Empowering.', page: 'sextoys', img: 'https://images.unsplash.com/photo-1576091160550-112173f7f869?w=600&h=400&fit=crop', color: 'rgba(180,0,120,0.12)' },
            { label: 'Spa Services', sub: 'Book your luxury experience', page: 'spa', img: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&h=400&fit=crop', color: 'rgba(233,30,140,0.1)' },
          ].map(cat => (
            <GlowCard key={cat.label} onClick={() => navigate(cat.page)}>
              <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '22px 22px 0 0' }}>
                <img src={cat.img} alt={cat.label} style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease' }}
                  onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
                  onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                />
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${isDark ? 'rgba(15,5,12,0.6)' : 'rgba(233,30,140,0.15)'} 0%, transparent 60%)` }} />
              </div>
              <div style={{ padding: '22px 26px 26px' }}>
                <div style={{ fontSize: 21, fontWeight: 800, fontFamily: 'var(--font-display)', color: t.text, marginBottom: 6 }}>{cat.label}</div>
                <div style={{ fontSize: 13, color: t.muted, marginBottom: 16 }}>{cat.sub}</div>
                <span style={{ color: '#e91e8c', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  Explore
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e91e8c" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </span>
              </div>
            </GlowCard>
          ))}
        </div>
      </div>

      {/* ── Best Sellers ── */}
      <div style={{ background: isDark ? 'rgba(233,30,140,0.03)' : 'rgba(233,30,140,0.03)', borderTop: `1px solid rgba(233,30,140,0.08)`, borderBottom: `1px solid rgba(233,30,140,0.08)`, padding: '88px 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 44, fontFamily: 'var(--font-display)', fontWeight: 900, color: t.text, marginBottom: 10 }}>Best Sellers</h2>
            <p style={{ color: t.muted, fontSize: 16 }}>Our most loved products</p>
          </div>
          <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 26 }}>
            {featured.map(p => (
              <GlowCard key={p.id} onClick={() => navigate('product', p)}>
                <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '22px 22px 0 0' }}>
                  <img src={p.mainImage} alt={p.name} style={{ width: '100%', height: 240, objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease' }}
                    onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
                    onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                  />
                  {p.badge && (
                    <div className="badge" style={{ position: 'absolute', top: 12, left: 12, background: 'linear-gradient(135deg, #e91e8c, #c2166f)', color: 'white', fontSize: 10, fontWeight: 800, padding: '5px 12px', borderRadius: 20, letterSpacing: 1, boxShadow: '0 4px 12px rgba(233,30,140,0.5)' }}>
                      {p.badge}
                    </div>
                  )}
                </div>
                <div style={{ padding: '16px 18px 20px' }}>
                  <div style={{ fontSize: 11, color: '#e91e8c', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6, fontWeight: 700 }}>{p.category}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 8, lineHeight: 1.3 }}>{p.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                    <Stars rating={p.rating} />
                    <span style={{ fontSize: 11, color: t.muted }}>({p.reviewCount})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <span style={{ fontSize: 19, fontWeight: 800, color: '#e91e8c', textShadow: isDark ? '0 0 20px rgba(233,30,140,0.4)' : 'none' }}>N{p.price.toLocaleString()}</span>
                    {p.originalPrice && <span style={{ fontSize: 12, color: t.muted, textDecoration: 'line-through' }}>N{p.originalPrice.toLocaleString()}</span>}
                  </div>
                  <GlowButton size="sm" style={{ width: '100%', borderRadius: 12 }} onClick={e => { e.stopPropagation(); addToCart(p); }}>Add to Cart</GlowButton>
                </div>
              </GlowCard>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <GlowButton variant="outline" size="lg" onClick={() => navigate('shop')}>View All Products</GlowButton>
          </div>
        </div>
      </div>

      {/* ── Spa Banner ── */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '110px 40px', textAlign: 'center' }}>
        <img
          src="/assets/images/pages/spa/IMG_2170.JPG"
          alt="Luxury Spa"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,2,6,0.82)' }} />
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(233,30,140,0.18) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-block', background: 'rgba(233,30,140,0.15)', border: '1px solid rgba(233,30,140,0.3)', borderRadius: 30, padding: '6px 20px', marginBottom: 24 }}>
            <span style={{ color: '#e91e8c', fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' }}>Luxury Spa Experience · Lagos</span>
          </div>
          <h2 style={{ fontSize: 52, fontFamily: 'var(--font-display)', fontWeight: 900, color: '#f5f1e8', marginBottom: 18, lineHeight: 1.2 }}>
            Escape.<br />
            <span className="gradient-text">Relax. Renew.</span>
          </h2>
          <p style={{ color: 'rgba(245,241,232,0.72)', fontSize: 17, marginBottom: 40, maxWidth: 480, margin: '0 auto 40px' }}>
            Rejuvenate your body and soul with our signature luxury spa treatments in Abulegba, Lagos.
          </p>
          <GlowButton size="xl" onClick={() => navigate('spa')}>Book Your Spa Session</GlowButton>
        </div>
      </div>

      {/* ── Testimonials ── */}
      <div style={{ padding: '100px 40px', background: isDark ? 'rgba(8,3,6,0.8)' : 'rgba(252,240,248,0.5)', borderTop: `1px solid ${isDark ? 'rgba(233,30,140,0.08)' : 'rgba(233,30,140,0.1)'}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-block', background: 'rgba(233,30,140,0.1)', border: '1px solid rgba(233,30,140,0.25)', borderRadius: 30, padding: '5px 18px', marginBottom: 18 }}>
              <span style={{ color: '#e91e8c', fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' }}>Client Love</span>
            </div>
            <h2 style={{ fontSize: 'clamp(32px,4vw,48px)', fontFamily: 'var(--font-display)', fontWeight: 700, color: t.text, marginBottom: 10, lineHeight: 1.2 }}>
              Real Women. <span className="gradient-text">Real Results.</span>
            </h2>
            <p style={{ color: t.muted, fontSize: 16 }}>Trusted by 10,000+ women across Nigeria</p>
          </div>
          <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 28 }}>
            {REVIEWS.map(r => (
              <div key={r.id} style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'white', border: `1px solid ${isDark ? 'rgba(233,30,140,0.1)' : 'rgba(233,30,140,0.12)'}`, borderRadius: 20, padding: '36px 32px', position: 'relative', transition: 'transform 0.3s, box-shadow 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.2), 0 0 30px rgba(233,30,140,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ position: 'absolute', top: 20, right: 28, fontSize: 72, lineHeight: 1, color: 'rgba(233,30,140,0.1)', fontFamily: 'var(--font-display)', userSelect: 'none' }}>"</div>
                <Stars rating={r.rating} />
                <p style={{ color: isDark ? 'rgba(245,241,232,0.8)' : 'rgba(26,10,18,0.75)', fontSize: 15, lineHeight: 1.85, margin: '18px 0 28px', fontStyle: 'italic', fontFamily: 'var(--font-display)', fontWeight: 400 }}>"{r.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(233,30,140,0.08)'}`, paddingTop: 20 }}>
                  <div style={{ width: 46, height: 46, background: 'linear-gradient(135deg, #e91e8c, #c2166f)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 19, boxShadow: '0 4px 16px rgba(233,30,140,0.4)', flexShrink: 0, fontFamily: 'var(--font-display)' }}>{r.name[0]}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: t.text, fontFamily: 'var(--font-body)' }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>{r.location} · {r.date}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
