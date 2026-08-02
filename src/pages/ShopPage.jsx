import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useProducts, isRestockingSoon } from '../hooks/useProducts';

function Stars({ rating }) {
  return <span style={{ color: '#e91e8c', fontSize: 13 }}>{'★'.repeat(Math.round(rating))}{'☆'.repeat(5-Math.round(rating))}</span>;
}

const SUBCATEGORIES = [
  { v: 'scrubs', l: 'Body Scrubs & Polish' },
  { v: 'soaps', l: 'Soaps' },
  { v: 'face-care', l: 'Face Care' },
  { v: 'sets-bundles', l: 'Sets & Bundles' },
  { v: 'toning-oils', l: 'Toning Oils' },
  { v: 'whitening-creams', l: 'Whitening Creams & Lotions' },
  { v: 'body-wash', l: 'Body Wash & Bath' },
  { v: 'adult-wellness', l: 'Adult Wellness' },
  { v: 'specialty', l: 'Specialty' },
];

function getSubcategory(p) {
  if (p.category === 'sextoys') return 'adult-wellness';
  const n = p.name.toLowerCase();
  if (n.includes('scrub') || n.includes('polish') || n.includes('exfoliat')) return 'scrubs';
  if (n.includes('soap')) return 'soaps';
  if (n.includes('toner') || n.includes('cleanser') || n.includes('face wash')) return 'face-care';
  if (n.includes('collection') || n.includes('set') || n.includes('bundle')) return 'sets-bundles';
  if (n.includes('oil')) return 'toning-oils';
  if (n.includes('cream') || n.includes('lotion') || n.includes('milk')) return 'whitening-creams';
  if (n.includes('wash') || n.includes('shower') || n.includes('gel') || n.includes('bath')) return 'body-wash';
  return 'specialty';
}

const PER_PAGE = 9;

export default function ShopPage() {
  const { t, navigate, addToCart } = useApp();
  const { products: PRODUCTS } = useProducts();
  const [category, setCategory] = useState('all');
  const [subcategory, setSubcategory] = useState('all');
  const [sort, setSort] = useState('default');
  const [search, setSearch] = useState('');
  const [priceMax, setPriceMax] = useState(100000);
  const [page, setPage] = useState(1);

  let products = PRODUCTS.filter(p => {
    if (category !== 'all' && p.category !== category) return false;
    if (subcategory !== 'all' && getSubcategory(p) !== subcategory) return false;
    if (p.price > priceMax) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (sort === 'price-asc') products = [...products].sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') products = [...products].sort((a, b) => b.price - a.price);
  if (sort === 'rating') products = [...products].sort((a, b) => b.rating - a.rating);

  const availableSubcats = SUBCATEGORIES.filter(s => PRODUCTS.some(p => (category === 'all' || p.category === category) && getSubcategory(p) === s.v));

  const totalPages = Math.max(1, Math.ceil(products.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pagedProducts = products.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const setCategoryAndReset = (v) => { setCategory(v); setSubcategory('all'); setPage(1); };
  const setSubcategoryAndReset = (v) => { setSubcategory(v); setPage(1); };

  return (
    <div>
      {/* Hero Section — full width, outside container */}
      <div style={{ position: 'relative', minHeight: 540, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        <img
          src="/assets/images/pages/shop/17D101FC-BB46-4FE1-B8AF-B1D26FF756B9.PNG"
          alt="House of Moo Shop"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(10,2,8,0.88) 0%, rgba(10,2,8,0.6) 50%, rgba(10,2,8,0.1) 100%)' }} />
        <div style={{ position: 'absolute', top: -80, left: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(233,30,140,0.14) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="fade-in-up" style={{ position: 'relative', zIndex: 1, padding: '80px 80px', maxWidth: 640 }}>
          <div style={{ fontSize: 12, marginBottom: 20, color: 'rgba(245,241,232,0.55)' }}>
            <span style={{ cursor: 'pointer', color: '#e91e8c', fontWeight: 600 }} onClick={() => navigate('home')}>Home</span>
            <span style={{ margin: '0 8px' }}>/</span>
            <span>Shop</span>
          </div>
          <div style={{ display: 'inline-block', background: 'rgba(233,30,140,0.15)', border: '1px solid rgba(233,30,140,0.4)', borderRadius: 30, padding: '6px 20px', marginBottom: 22, backdropFilter: 'blur(12px)' }}>
            <span style={{ color: '#e91e8c', fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' }}>House of Moo · All Products</span>
          </div>
          <h1 style={{ fontSize: 'clamp(38px,5vw,64px)', fontFamily: 'var(--font-display)', fontWeight: 900, color: '#f5f1e8', marginBottom: 18, lineHeight: 1.12, textShadow: '0 2px 24px rgba(20,0,12,0.6)' }}>
            Shop the<br />
            <span className="gradient-text" style={{ filter: 'drop-shadow(0 2px 18px rgba(20,0,12,0.5))' }}>Collection</span>
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(245,241,232,0.78)', lineHeight: 1.8, maxWidth: 420, marginBottom: 16 }}>
            Skincare, intimate wellness, and luxury spa, delivered discreetly across Nigeria.
          </p>
          <p style={{ fontSize: 14, color: 'rgba(233,30,140,0.9)', fontWeight: 600 }}>{products.length} products available</p>
        </div>
      </div>

    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 40px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 40 }}>
        {/* Sidebar */}
        <div>
          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, padding: 24, marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: '700', color: t.text, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>Category</div>
            {[{ v: 'all', l: 'All Products' }, { v: 'skincare', l: 'Skincare' }, { v: 'sextoys', l: 'Adult Wellness' }].map(c => (
              <button key={c.v} onClick={() => setCategoryAndReset(c.v)}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', marginBottom: 4, background: category === c.v ? `${t.accent}18` : 'transparent', border: `1px solid ${category === c.v ? t.accent : 'transparent'}`, borderRadius: 6, color: category === c.v ? t.accent : t.muted, fontSize: 14, cursor: 'pointer', fontWeight: category === c.v ? '700' : '400' }}>{c.l}</button>
            ))}
          </div>
          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, padding: 24, marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: '700', color: t.text, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>Subcategory</div>
            <button onClick={() => setSubcategoryAndReset('all')}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', marginBottom: 4, background: subcategory === 'all' ? `${t.accent}18` : 'transparent', border: `1px solid ${subcategory === 'all' ? t.accent : 'transparent'}`, borderRadius: 6, color: subcategory === 'all' ? t.accent : t.muted, fontSize: 14, cursor: 'pointer', fontWeight: subcategory === 'all' ? '700' : '400' }}>All</button>
            {availableSubcats.map(s => (
              <button key={s.v} onClick={() => setSubcategoryAndReset(s.v)}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', marginBottom: 4, background: subcategory === s.v ? `${t.accent}18` : 'transparent', border: `1px solid ${subcategory === s.v ? t.accent : 'transparent'}`, borderRadius: 6, color: subcategory === s.v ? t.accent : t.muted, fontSize: 14, cursor: 'pointer', fontWeight: subcategory === s.v ? '700' : '400' }}>{s.l}</button>
            ))}
          </div>
          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: '700', color: t.text, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>Max Price</div>
            <div style={{ color: t.accent, fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>N{priceMax.toLocaleString()}</div>
            <input type="range" min={5000} max={100000} step={1000} value={priceMax} onChange={e => { setPriceMax(+e.target.value); setPage(1); }} style={{ width: '100%', accentColor: t.accent }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: t.muted, marginTop: 6 }}>
              <span>N5,000</span><span>N100,000</span>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center' }}>
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search products..." style={{ flex: 1, padding: '10px 16px', background: t.input, border: `1px solid ${t.border}`, borderRadius: 6, color: t.text, fontSize: 14, outline: 'none' }} />
            <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} style={{ padding: '10px 16px', background: t.input, border: `1px solid ${t.border}`, borderRadius: 6, color: t.text, fontSize: 14, outline: 'none' }}>
              <option value="default">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Best Rated</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {pagedProducts.map(p => (
              <div key={p.id} style={{ background: t.card, borderRadius: 8, overflow: 'hidden', border: `1px solid ${t.border}`, transition: 'transform 0.3s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => navigate('product', p)}>
                  <img src={p.mainImage} alt={p.name} style={{ width: '100%', height: 220, objectFit: 'cover' }} />
                  {isRestockingSoon(p) ? (
                    <div style={{ position: 'absolute', top: 10, left: 10, background: '#e65100', color: 'white', fontSize: 10, fontWeight: '700', padding: '4px 10px', borderRadius: 20 }}>Restocking Soon</div>
                  ) : p.badge && (
                    <div style={{ position: 'absolute', top: 10, left: 10, background: t.accent, color: 'white', fontSize: 10, fontWeight: '700', padding: '4px 10px', borderRadius: 20 }}>{p.badge}</div>
                  )}
                </div>
                <div style={{ padding: '16px' }}>
                  <div style={{ fontSize: 11, color: t.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{p.category}</div>
                  <div style={{ fontSize: 15, fontWeight: '700', color: t.text, marginBottom: 6, cursor: 'pointer' }} onClick={() => navigate('product', p)}>{p.name}</div>
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

          {products.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 0', color: t.muted }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <div style={{ fontSize: 18, color: t.text, marginBottom: 8 }}>No products found</div>
              <div>Try adjusting your filters</div>
            </div>
          )}

          {products.length > 0 && totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 36 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                style={{ padding: '8px 16px', background: t.input, border: `1px solid ${t.border}`, borderRadius: 6, color: t.text, fontSize: 14, cursor: currentPage === 1 ? 'default' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1 }}>Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setPage(n)}
                  style={{ width: 36, height: 36, background: n === currentPage ? t.accent : t.input, border: `1px solid ${n === currentPage ? t.accent : t.border}`, borderRadius: 6, color: n === currentPage ? 'white' : t.text, fontSize: 14, fontWeight: n === currentPage ? '700' : '400', cursor: 'pointer' }}>{n}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                style={{ padding: '8px 16px', background: t.input, border: `1px solid ${t.border}`, borderRadius: 6, color: t.text, fontSize: 14, cursor: currentPage === totalPages ? 'default' : 'pointer', opacity: currentPage === totalPages ? 0.4 : 1 }}>Next</button>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
