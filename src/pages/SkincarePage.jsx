import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useProducts, isRestockingSoon } from '../hooks/useProducts';

function Stars({ rating }) {
  return <span style={{ color: '#e91e8c', fontSize: 13 }}>{'★'.repeat(Math.round(rating))}{'☆'.repeat(5-Math.round(rating))}</span>;
}

export default function SkincarePage() {
  const { t, navigate, addToCart } = useApp();
  const { products: PRODUCTS } = useProducts();
  const [sort, setSort] = useState('default');
  const products = PRODUCTS.filter(p => p.category === 'skincare');
  let sorted = [...products];
  if (sort === 'price-asc') sorted.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') sorted.sort((a, b) => b.price - a.price);
  if (sort === 'rating') sorted.sort((a, b) => b.rating - a.rating);

  return (
    <div>
      {/* Hero Section */}
      <div style={{ position: 'relative', minHeight: 560, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        <img
          src="/assets/images/pages/skincare/E68F6FC4-35E0-49E1-BF63-3A6351BACF98.PNG"
          alt="House of Moo Skincare"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(10,2,8,0.88) 0%, rgba(10,2,8,0.65) 45%, rgba(10,2,8,0.15) 100%)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(233,30,140,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="fade-in-up" style={{ position: 'relative', zIndex: 1, padding: '80px 80px', maxWidth: 620 }}>
          <div style={{ fontSize: 12, marginBottom: 20, color: 'rgba(245,241,232,0.55)' }}>
            <span style={{ cursor: 'pointer', color: '#e91e8c', fontWeight: 600 }} onClick={() => navigate('home')}>Home</span>
            <span style={{ margin: '0 8px' }}>/</span>
            <span>Skincare</span>
          </div>
          <div style={{ display: 'inline-block', background: 'rgba(233,30,140,0.15)', border: '1px solid rgba(233,30,140,0.4)', borderRadius: 30, padding: '6px 20px', marginBottom: 22, backdropFilter: 'blur(12px)' }}>
            <span style={{ color: '#e91e8c', fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' }}>Premium Skincare · House of Moo</span>
          </div>
          <h1 style={{ fontSize: 'clamp(38px,5vw,64px)', fontFamily: 'var(--font-display)', fontWeight: 900, color: '#f5f1e8', marginBottom: 18, lineHeight: 1.12, textShadow: '0 2px 24px rgba(20,0,12,0.6)' }}>
            Glow From<br />
            <span className="gradient-text" style={{ filter: 'drop-shadow(0 2px 18px rgba(20,0,12,0.5))' }}>Within</span>
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(245,241,232,0.78)', lineHeight: 1.8, maxWidth: 440, marginBottom: 36 }}>
            Premium brightening, hydrating, and nourishing formulations crafted for Nigerian skin. Real results, real glow.
          </p>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {['15 Products', 'Nationwide Delivery', 'Skin-Safe Formulas'].map(b => (
              <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(245,241,232,0.7)', fontSize: 13 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#e91e8c', flexShrink: 0 }} />{b}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <span style={{ color: t.muted, fontSize: 14 }}>{sorted.length} products</span>
          <select value={sort} onChange={e => setSort(e.target.value)} style={{ padding: '8px 16px', background: t.input, border: `1px solid ${t.border}`, borderRadius: 6, color: t.text, fontSize: 13, outline: 'none' }}>
            <option value="default">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Best Rated</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: 28 }}>
          {sorted.map(p => (
            <div key={p.id} style={{ background: t.card, borderRadius: 8, overflow: 'hidden', border: `1px solid ${t.border}`, transition: 'transform 0.3s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => navigate('product', p)}>
                <img src={p.mainImage} alt={p.name} style={{ width: '100%', height: 260, objectFit: 'cover' }} />
                {isRestockingSoon(p) ? (
                  <div style={{ position: 'absolute', top: 12, left: 12, background: '#e65100', color: 'white', fontSize: 10, fontWeight: '700', padding: '4px 10px', borderRadius: 20 }}>Restocking Soon</div>
                ) : p.badge && (
                  <div style={{ position: 'absolute', top: 12, left: 12, background: t.accent, color: 'white', fontSize: 10, fontWeight: '700', padding: '4px 10px', borderRadius: 20 }}>{p.badge}</div>
                )}
              </div>
              <div style={{ padding: '18px' }}>
                <div style={{ fontSize: 15, fontWeight: '700', color: t.text, marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 13, color: t.muted, marginBottom: 10 }}>{p.shortDesc}</div>
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
