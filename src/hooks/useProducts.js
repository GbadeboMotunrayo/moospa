import { useEffect, useState } from 'react';
import { productsAPI } from '../services/api';
import { PRODUCTS as STATIC_FALLBACK } from '../data/products';

const PLACEHOLDER_IMAGE = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="#eee"/></svg>'
);

function mapProduct(p) {
  const images = p.images && p.images.length ? p.images : [PLACEHOLDER_IMAGE];
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    price: Number(p.price),
    originalPrice: p.original_price != null ? Number(p.original_price) : null,
    mainImage: images[0],
    images,
    shortDesc: p.short_desc || '',
    fullDesc: p.description || '',
    ingredients: p.ingredients || '',
    specs: p.specs || null,
    badge: p.badge || null,
    rating: p.rating != null ? Number(p.rating) : 0,
    reviewCount: p.review_count ?? 0,
    inStock: p.inStock,
    stock_quantity: p.stock_quantity ?? 0,
    featured: !!p.featured,
  };
}

// Module-level cache so navigating between pages within a session doesn't
// re-fetch and doesn't flash back to the static fallback list.
let cache = null;

// Live product catalog, sourced from the admin-managed backend instead of
// the bundled src/data/products.js — so staff edits (name, price, stock,
// photos) show up on the storefront without a rebuild/redeploy.
// Falls back to the static list only if the backend is unreachable.
export function useProducts() {
  const [products, setProducts] = useState(cache || STATIC_FALLBACK);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    let cancelled = false;
    productsAPI.getAll().then(d => {
      if (cancelled) return;
      cache = (d.products || []).map(mapProduct);
      setProducts(cache);
    }).catch(() => {
      // Backend unreachable — keep showing the static fallback data.
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { products, loading };
}

export function isRestockingSoon(p) {
  return (p.stock_quantity ?? 0) <= 0;
}
