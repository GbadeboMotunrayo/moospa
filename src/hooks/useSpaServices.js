import { useEffect, useState } from 'react';
import { spaServicesAPI } from '../services/api';
import { SPA_SERVICES as STATIC_FALLBACK } from '../data/spaServices';

function mapService(s) {
  return {
    id: s.id,
    name: s.name,
    category: s.category,
    duration: s.duration,
    price: Number(s.price),
    description: s.description || '',
    image: s.image || '',
    popular: !!s.popular,
  };
}

// Module-level cache so navigating between pages within a session doesn't
// re-fetch and doesn't flash back to the static fallback list.
let cache = null;

// Live spa price list, sourced from the admin-managed backend instead of
// the bundled src/data/spaServices.js — so owner edits (name, price,
// duration) show up on the storefront without a rebuild/redeploy.
// Falls back to the static list only if the backend is unreachable.
export function useSpaServices() {
  const [services, setServices] = useState(cache || STATIC_FALLBACK);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    let cancelled = false;
    spaServicesAPI.getAll().then(d => {
      if (cancelled) return;
      const list = (d.services || []).map(mapService);
      if (list.length) { cache = list; setServices(cache); }
    }).catch(() => {
      // Backend unreachable — keep showing the static fallback data.
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { services, loading };
}
