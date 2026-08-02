import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useProducts, isRestockingSoon } from '../hooks/useProducts';

function Stars({ rating, size = 16 }) {
  return <span style={{ color: '#e91e8c', fontSize: size }}>{'★'.repeat(Math.round(rating))}{'☆'.repeat(5-Math.round(rating))}</span>;
}

export default function ProductPage() {
  const { t, selectedProduct: p, navigate, addToCart, cart } = useApp();
  const { products: PRODUCTS } = useProducts();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);

  if (!p) { navigate('shop'); return null; }

  const related = PRODUCTS.filter(x => x.category === p.category && x.id !== p.id).slice(0, 4);

  const handleAdd = () => {
    addToCart(p, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 40px' }}>
      {/* Breadcrumb */}
      <div style={{ color: t.muted, fontSize: 13, marginBottom: 32 }}>
        <span style={{ cursor: 'pointer', color: t.accent }} onClick={() => navigate('home')}>Home</span> /
        <span style={{ cursor: 'pointer', color: t.accent, margin: '0 6px' }} onClick={() => navigate(p.category === 'skincare' ? 'skincare' : 'sextoys')}>{p.category === 'skincare' ? 'Skincare' : 'Adult Wellness'}</span> /
        {p.name}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, marginBottom: 80 }}>
        {/* Images */}
        <div>
          <div style={{ borderRadius: 8, overflow: 'hidden', marginBottom: 12, border: `1px solid ${t.border}` }}>
            <img src={p.images[activeImg]} alt={p.name} style={{ width: '100%', height: 480, objectFit: 'cover' }} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {p.images.map((img, i) => (
              <div key={i} onClick={() => setActiveImg(i)} style={{ width: 72, height: 72, borderRadius: 6, overflow: 'hidden', border: `2px solid ${activeImg === i ? t.accent : t.border}`, cursor: 'pointer' }}>
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          {isRestockingSoon(p) ? (
            <div style={{ display: 'inline-block', background: '#e65100', color: 'white', fontSize: 11, fontWeight: '700', padding: '4px 12px', borderRadius: 20, marginBottom: 16, letterSpacing: 1 }}>Restocking Soon</div>
          ) : p.badge && (
            <div style={{ display: 'inline-block', background: t.accent, color: 'white', fontSize: 11, fontWeight: '700', padding: '4px 12px', borderRadius: 20, marginBottom: 16, letterSpacing: 1 }}>{p.badge}</div>
          )}
          <h1 style={{ fontSize: 36, fontFamily: 'var(--font-display)', fontWeight: 'bold', color: t.text, marginBottom: 12, lineHeight: 1.2 }}>{p.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Stars rating={p.rating} />
            <span style={{ color: t.muted, fontSize: 14 }}>{p.rating} ({p.reviewCount} reviews)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <span style={{ fontSize: 36, fontWeight: 'bold', color: t.accent }}>N{p.price.toLocaleString()}</span>
            {p.originalPrice && <span style={{ fontSize: 18, color: t.muted, textDecoration: 'line-through' }}>N{p.originalPrice.toLocaleString()}</span>}
            {p.originalPrice && <span style={{ background: '#e8f5e9', color: '#2e7d32', fontSize: 12, fontWeight: '700', padding: '4px 10px', borderRadius: 20 }}>Save N{(p.originalPrice - p.price).toLocaleString()}</span>}
          </div>
          <p style={{ color: t.text, fontSize: 15, lineHeight: 1.8, marginBottom: 24 }}>{p.shortDesc}</p>

          {/* Qty + Add */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${t.border}`, borderRadius: 6, overflow: 'hidden' }}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 40, height: 48, background: t.surface, border: 'none', color: t.text, fontSize: 20, cursor: 'pointer' }}>-</button>
              <span style={{ width: 48, textAlign: 'center', color: t.text, fontWeight: '700', fontSize: 16 }}>{qty}</span>
              <button onClick={() => setQty(q => q + 1)} style={{ width: 40, height: 48, background: t.surface, border: 'none', color: t.text, fontSize: 20, cursor: 'pointer' }}>+</button>
            </div>
            <button onClick={handleAdd} style={{ flex: 1, padding: '12px 24px', background: added ? '#2e7d32' : t.accent, color: 'white', border: 'none', borderRadius: 6, fontWeight: '700', fontSize: 15, cursor: 'pointer', transition: 'background 0.3s' }}>
              {added ? 'Added!' : 'Add to Cart'}
            </button>
          </div>

          <button onClick={() => { addToCart(p, qty); navigate('checkout'); }} style={{ width: '100%', padding: '14px', background: t.text, color: t.bg, border: 'none', borderRadius: 6, fontWeight: '700', fontSize: 15, cursor: 'pointer', marginBottom: 20 }}>Buy Now</button>

          {/* Trust */}
          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, padding: '16px 20px' }}>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {['Discreet packaging', 'Secure checkout', '48hr delivery', 'Authentic product'].map(b => (
                <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: t.muted }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: t.accent }}></div> {b}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Description tabs */}
      <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 48, marginBottom: 64 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: '700', color: t.text, marginBottom: 16 }}>Description</h3>
            <p style={{ color: t.muted, fontSize: 14, lineHeight: 1.9 }}>{p.fullDesc}</p>
          </div>
          <div>
            {p.ingredients && <>
              <h3 style={{ fontSize: 20, fontWeight: '700', color: t.text, marginBottom: 16 }}>Ingredients</h3>
              <p style={{ color: t.muted, fontSize: 14, lineHeight: 1.9 }}>{p.ingredients}</p>
            </>}
            {p.specs && <>
              <h3 style={{ fontSize: 20, fontWeight: '700', color: t.text, marginBottom: 16 }}>Specifications</h3>
              <p style={{ color: t.muted, fontSize: 14, lineHeight: 1.9 }}>{p.specs}</p>
            </>}
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div>
          <h2 style={{ fontSize: 28, fontFamily: 'var(--font-display)', fontWeight: 'bold', color: t.text, marginBottom: 24 }}>You May Also Like</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
            {related.map(r => (
              <div key={r.id} onClick={() => navigate('product', r)} style={{ background: t.card, borderRadius: 8, overflow: 'hidden', border: `1px solid ${t.border}`, cursor: 'pointer', transition: 'transform 0.3s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <img src={r.mainImage} alt={r.name} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
                <div style={{ padding: '12px' }}>
                  <div style={{ fontSize: 13, fontWeight: '700', color: t.text, marginBottom: 4 }}>{r.name}</div>
                  <div style={{ fontSize: 15, fontWeight: 'bold', color: t.accent }}>N{r.price.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
