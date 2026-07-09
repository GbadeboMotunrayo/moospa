import { useEffect, useState } from 'react';
import { productsAPI } from '../services/api';

// Fetches live stock quantities from the backend, keyed by product id,
// so the storefront can show "Restocking Soon" when stock runs out.
export function useStock() {
  const [stock, setStock] = useState({});

  useEffect(() => {
    productsAPI.getAll().then(d => {
      const map = {};
      (d.products || []).forEach(p => { map[p.id] = p.stock_quantity ?? 0; });
      setStock(map);
    }).catch(() => {});
  }, []);

  return stock;
}

export function isRestockingSoon(stock, id) {
  return stock[id] !== undefined && stock[id] <= 0;
}
