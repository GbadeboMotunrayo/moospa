// Lightweight wrapper around Google Analytics (gtag.js).
// Safe to call even if gtag hasn't loaded yet - all calls are no-ops in that case.

export function trackPageView(path, title) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title,
    page_location: window.location.href,
  });
}

export function trackEvent(name, params = {}) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
}

export function trackAddToCart(product, qty = 1) {
  trackEvent('add_to_cart', {
    currency: 'NGN',
    value: product.price * qty,
    items: [{ item_id: product.id, item_name: product.name, item_category: product.category, price: product.price, quantity: qty }],
  });
}

export function trackPurchase(order) {
  trackEvent('purchase', {
    transaction_id: order.ref,
    currency: 'NGN',
    value: order.total,
    shipping: 2000,
    items: order.cart.map(i => ({ item_id: i.id, item_name: i.name, item_category: i.category, price: i.price, quantity: i.qty })),
  });
}
