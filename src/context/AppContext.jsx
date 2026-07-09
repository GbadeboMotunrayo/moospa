import { createContext, useContext, useState } from 'react';
import { trackPageView, trackAddToCart } from '../utils/analytics';

const AppContext = createContext(null);

export const DARK = {
  bg: '#0d0d0d', surface: '#1a1a1a', surface2: '#222', border: '#2a2a2a',
  text: '#f5f1e8', muted: '#888', accent: '#e91e8c', accentHover: '#c2166f',
  card: '#1a1a1a', input: '#111', badge: '#2a2a2a', badgeText: '#aaa',
};
export const LIGHT = {
  bg: '#ffffff', surface: '#fce4f3', surface2: '#f9f0f6', border: '#f0d8ea',
  text: '#1a1a1a', muted: '#666', accent: '#e91e8c', accentHover: '#c2166f',
  card: '#ffffff', input: '#fff', badge: '#fce4f3', badgeText: '#888',
};

export function AppProvider({ children }) {
  const [theme, setTheme] = useState('dark');
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [order, setOrder] = useState(null);
  const [ageVerified, setAgeVerified] = useState(false);

  const t = theme === 'dark' ? DARK : LIGHT;

  const navigate = (page, data) => {
    if (data) setSelectedProduct(data);
    setCurrentPage(page);
    window.scrollTo(0, 0);
    trackPageView(`/${page}`, `House of Moo - ${page}`);
  };

  const addToCart = (product, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { ...product, qty }];
    });
    trackAddToCart(product, qty);
  };

  const removeFromCart = id => setCart(prev => prev.filter(i => i.id !== id));
  const updateQty = (id, qty) => {
    if (qty < 1) return removeFromCart(id);
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  };
  const clearCart = () => setCart([]);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartSubtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <AppContext.Provider value={{ theme, setTheme, t, currentPage, navigate, selectedProduct, cart, addToCart, removeFromCart, updateQty, clearCart, cartCount, cartSubtotal, order, setOrder, ageVerified, setAgeVerified }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
