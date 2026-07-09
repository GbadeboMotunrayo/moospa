import { useApp } from '../context/AppContext';
import { PRODUCTS } from '../data/products';

function Stars({ rating }) {
  return <span style={{ color: '#e91e8c', fontSize: 13 }}>{'★'.repeat(Math.round(rating))}{'☆'.repeat(5-Math.round(rating))}</span>;
}

export default function SexToysPage() {
  const { t, navigate, addToCart, ageVerified, setAgeVerified } = useApp();
  const products = PRODUCTS.filter(p => p.category === 'sextoys');

  if (!ageVerified) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', background: t.bg }}>
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: '48px', maxWidth: 480, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, background: `${t.accent}22`, borderRadius: '50%', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e91e8c" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <h2 style={{ fontSize: 28, fontFamily: 'var(--font-display)', fontWeight: 'bold', color: t.text, marginBottom: 12 }}>Age Verification</h2>
          <p style={{ color: t.muted, fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>This section contains products intended for adults only. You must be 18 years or older to enter. All orders are delivered in <strong style={{ color: t.text }}>plain, discreet packaging</strong>.</p>
          <div style={{ background: t.surface2, border: `1px solid ${t.border}`, borderRadius: 8, padding: 16, marginBottom: 28, fontSize: 13, color: t.muted }}>
            By entering, you confirm you are 18+ and consent to viewing adult content.
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => navigate('home')} style={{ flex: 1, padding: '12px', background: 'transparent', border: `1px solid ${t.border}`, borderRadius: 6, color: t.muted, cursor: 'pointer', fontSize: 14 }}>I am under 18</button>
            <button onClick={() => setAgeVerified(true)} style={{ flex: 2, padding: '12px', background: t.accent, border: 'none', borderRadius: 6, color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: '700' }}>I am 18 or older - Enter</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ background: `linear-gradient(135deg, #1a0a12, #0d0d0d)`, padding: '60px 40px', textAlign: 'center' }}>
        <div style={{ color: '#888', fontSize: 13, marginBottom: 12 }}>
          <span style={{ cursor: 'pointer', color: '#e91e8c' }} onClick={() => navigate('home')}>Home</span> / Adult Wellness
        </div>
        <h1 style={{ fontSize: 48, fontFamily: 'var(--font-display)', fontWeight: 'bold', color: '#f5f1e8', marginBottom: 12 }}>Adult Wellness</h1>
        <p style={{ color: '#aaa', fontSize: 15 }}>All items delivered in plain, unmarked packaging. No identifying labels.</p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#1a1a1a', border: '1px solid #333', borderRadius: 20, padding: '6px 16px', marginTop: 16, fontSize: 12, color: '#888' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4caf50' }}></div>
          Discreet Packaging Guaranteed
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 28 }}>
          {products.map(p => (
            <div key={p.id} style={{ background: t.card, borderRadius: 8, overflow: 'hidden', border: `1px solid ${t.border}`, transition: 'transform 0.3s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => navigate('product', p)}>
                <img src={p.mainImage} alt={p.name} style={{ width: '100%', height: 260, objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 12, left: 12, background: '#1a1a1a', color: '#888', fontSize: 10, fontWeight: '700', padding: '4px 10px', borderRadius: 20, border: '1px solid #333' }}>Discreet Delivery</div>
              </div>
              <div style={{ padding: '18px' }}>
                <div style={{ fontSize: 15, fontWeight: '700', color: t.text, marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 13, color: t.muted, marginBottom: 10, lineHeight: 1.5 }}>{p.shortDesc}</div>
                {p.specs && <div style={{ fontSize: 11, color: t.muted, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 4, padding: '6px 10px', marginBottom: 10 }}>{p.specs}</div>}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 12 }}>
                  <Stars rating={p.rating} />
                  <span style={{ fontSize: 11, color: t.muted }}>({p.reviewCount})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 18, fontWeight: 'bold', color: t.accent }}>N{p.price.toLocaleString()}</span>
                  {p.originalPrice && <span style={{ fontSize: 12, color: t.muted, textDecoration: 'line-through' }}>N{p.originalPrice.toLocaleString()}</span>}
                </div>
                <button onClick={() => addToCart(p)} style={{ width: '100%', padding: '10px', background: t.accent, color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: '700', fontSize: 13 }}>Add to Cart</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
