import { useState } from 'react';

const PRODUCTS = [
  { id: 1, name: 'Glow Booster Cream', category: 'Skincare', price: 15000, image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=500&fit=crop', description: 'Luxurious skincare cream for radiant glow' },
  { id: 2, name: 'Yoni Tightening Gel', category: 'Skincare', price: 12000, image: 'https://images.unsplash.com/photo-1512207736139-c78cdd0eff85?w=500&h=500&fit=crop', description: 'Premium intimate wellness gel' },
  { id: 3, name: 'Rabbit Vibrator', category: 'Wellness', price: 28000, image: 'https://images.unsplash.com/photo-1576091160550-112173f7f869?w=500&h=500&fit=crop', description: 'Luxury intimate pleasure device' },
  { id: 4, name: 'Waist Beads', category: 'Accessories', price: 6000, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop', description: 'Elegant body jewelry accessory' },
  { id: 5, name: 'Luxury Massage Oil', category: 'Skincare', price: 10000, image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=500&h=500&fit=crop', description: 'Sensual massage oil for relaxation' },
  { id: 6, name: 'Body Scrub', category: 'Skincare', price: 8500, image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=500&fit=crop', description: 'Exfoliating body scrub treatment' },
];

const CATEGORIES = ['All', 'Skincare', 'Wellness', 'Accessories'];

export default function NDOWebsite() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = PRODUCTS.filter(p => {
    const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const navStyles = {
    container: { background: '#1a1a1a', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333' },
    logo: { color: '#e91e8c', fontSize: '24px', fontWeight: 'bold', letterSpacing: '2px', fontFamily: 'Georgia, serif' },
    nav: { display: 'flex', gap: '32px', flex: 1, marginLeft: '60px' },
    navLink: { color: '#888', textDecoration: 'none', fontSize: '14px', fontWeight: '500', cursor: 'pointer', transition: 'color 0.3s' },
    cartIcon: { color: '#e91e8c', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', position: 'relative' },
    cartBadge: { position: 'absolute', top: '-8px', right: '-8px', background: '#e91e8c', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' },
  };

  const heroStyles = {
    container: { background: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 100%)', minHeight: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingTop: '60px' },
    content: { maxWidth: '700px', padding: '40px' },
    title: { fontSize: '64px', fontWeight: 'bold', color: '#f5f1e8', marginBottom: '16px', fontFamily: 'Georgia, serif', letterSpacing: '1px' },
    subtitle: { fontSize: '20px', color: '#e91e8c', marginBottom: '32px', fontWeight: '300', fontFamily: 'Georgia, serif' },
    description: { fontSize: '16px', color: '#aaa', marginBottom: '32px', lineHeight: '1.6' },
    button: { background: '#e91e8c', color: 'white', padding: '16px 48px', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px', transition: 'background 0.3s', letterSpacing: '1px' },
  };

  const productsStyles = {
    container: { background: '#0d0d0d', padding: '60px 40px', minHeight: '100vh' },
    title: { fontSize: '48px', color: '#f5f1e8', marginBottom: '16px', textAlign: 'center', fontFamily: 'Georgia, serif', fontWeight: 'bold' },
    subtitle: { fontSize: '14px', color: '#888', textAlign: 'center', marginBottom: '48px', letterSpacing: '1px' },
    filterSection: { maxWidth: '1200px', margin: '0 auto 40px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' },
    searchInput: { flex: 1, minWidth: '300px', padding: '12px 16px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '4px', color: '#f5f1e8', fontSize: '14px', outline: 'none' },
    filterButton: { padding: '8px 20px', border: '1px solid #e91e8c', background: 'transparent', color: '#e91e8c', cursor: 'pointer', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold', transition: 'all 0.3s' },
    filterButtonActive: { background: '#e91e8c', color: 'white' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px', maxWidth: '1200px', margin: '0 auto' },
    card: { background: '#1a1a1a', borderRadius: '4px', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.3s, box-shadow 0.3s', border: '1px solid #333' },
    cardImage: { width: '100%', height: '250px', objectFit: 'cover', background: '#0d0d0d' },
    cardContent: { padding: '20px' },
    cardName: { fontSize: '16px', fontWeight: 'bold', color: '#f5f1e8', marginBottom: '8px', fontFamily: 'Georgia, serif' },
    cardCategory: { fontSize: '12px', color: '#888', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' },
    cardPrice: { fontSize: '18px', fontWeight: 'bold', color: '#e91e8c', marginBottom: '12px' },
    cardButton: { width: '100%', padding: '10px', background: '#e91e8c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.3s' },
  };

  const footerStyles = {
    container: { background: '#0d0d0d', border: '1px solid #333', padding: '40px', color: '#888', fontSize: '14px', marginTop: '60px' },
    content: { maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px' },
    heading: { color: '#f5f1e8', fontSize: '14px', fontWeight: 'bold', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' },
    link: { display: 'block', marginBottom: '8px', color: '#888', textDecoration: 'none', cursor: 'pointer', transition: 'color 0.3s' },
    bottom: { maxWidth: '1200px', margin: '40px auto 0', paddingTop: '24px', borderTop: '1px solid #333', textAlign: 'center', color: '#555', fontSize: '12px' },
  };

  const cartStyles = {
    modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'flex-end' },
    panel: { background: '#1a1a1a', width: '100%', maxWidth: '400px', marginLeft: 'auto', padding: '30px', maxHeight: '90vh', overflowY: 'auto', borderLeft: '1px solid #333' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #333', paddingBottom: '16px' },
    title: { color: '#f5f1e8', fontSize: '20px', fontWeight: 'bold', fontFamily: 'Georgia, serif' },
    close: { background: 'none', border: 'none', color: '#888', fontSize: '24px', cursor: 'pointer' },
    items: { marginBottom: '24px' },
    item: { display: 'flex', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid #333', marginBottom: '16px' },
    itemImage: { width: '60px', height: '60px', background: '#0d0d0d', borderRadius: '4px' },
    itemDetails: { flex: 1 },
    itemName: { color: '#f5f1e8', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' },
    itemPrice: { color: '#e91e8c', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' },
    itemQty: { color: '#888', fontSize: '12px' },
    removeBtn: { background: 'none', border: 'none', color: '#c62828', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
    summary: { background: '#0d0d0d', padding: '16px', borderRadius: '4px', marginBottom: '24px' },
    row: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#888', fontSize: '14px' },
    total: { display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #333', color: '#f5f1e8', fontWeight: 'bold', fontSize: '16px' },
    checkoutBtn: { width: '100%', padding: '14px', background: '#e91e8c', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '12px' },
    continuBtn: { width: '100%', padding: '12px', background: '#333', color: '#f5f1e8', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
    empty: { textAlign: 'center', color: '#888', padding: '40px 0' },
  };

  const productDetailStyles = {
    modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    content: { background: '#1a1a1a', borderRadius: '4px', maxWidth: '600px', width: '90%', padding: '40px', border: '1px solid #333' },
    close: { position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#888', fontSize: '28px', cursor: 'pointer' },
    image: { width: '100%', height: '300px', objectFit: 'cover', borderRadius: '4px', marginBottom: '24px', background: '#0d0d0d' },
    name: { fontSize: '32px', fontWeight: 'bold', color: '#f5f1e8', marginBottom: '8px', fontFamily: 'Georgia, serif' },
    category: { fontSize: '12px', color: '#e91e8c', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' },
    price: { fontSize: '28px', fontWeight: 'bold', color: '#e91e8c', marginBottom: '16px' },
    description: { color: '#aaa', fontSize: '16px', lineHeight: '1.6', marginBottom: '24px' },
    button: { width: '100%', padding: '16px', background: '#e91e8c', color: 'white', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px', marginBottom: '12px', transition: 'background 0.3s' },
    backButton: { width: '100%', padding: '12px', background: '#333', color: '#f5f1e8', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  };

  // HOME PAGE
  if (currentPage === 'home') {
    return (
      <div style={{ background: '#0d0d0d', color: '#f5f1e8', fontFamily: 'Segoe UI, Arial, sans-serif', minHeight: '100vh' }}>
        <div style={navStyles.container}>
          <div style={navStyles.logo}>HOUSE OF NDO</div>
          <div style={navStyles.nav}>
            <div onClick={() => setCurrentPage('home')} style={{ ...navStyles.navLink, color: '#e91e8c' }}>Home</div>
            <div onClick={() => { setCurrentPage('shop'); setSelectedCategory('All'); }} style={navStyles.navLink}>Shop</div>
            <div style={navStyles.navLink}>About</div>
            <div style={navStyles.navLink}>Contact</div>
          </div>
          <div style={navStyles.cartIcon} onClick={() => setShowCart(!showCart)}>
            Cart
            {cartCount > 0 && <div style={navStyles.cartBadge}>{cartCount}</div>}
          </div>
        </div>

        {showCart && (
          <div style={cartStyles.modal} onClick={() => setShowCart(false)}>
            <div style={cartStyles.panel} onClick={(e) => e.stopPropagation()}>
              <div style={cartStyles.header}>
                <div style={cartStyles.title}>Shopping Cart</div>
                <button style={cartStyles.close} onClick={() => setShowCart(false)}>X</button>
              </div>

              {cart.length === 0 ? (
                <div style={cartStyles.empty}>Your cart is empty</div>
              ) : (
                <>
                  <div style={cartStyles.items}>
                    {cart.map(item => (
                      <div key={item.id} style={cartStyles.item}>
                        <div style={cartStyles.itemImage}></div>
                        <div style={cartStyles.itemDetails}>
                          <div style={cartStyles.itemName}>{item.name}</div>
                          <div style={cartStyles.itemPrice}>N{item.price.toLocaleString()}</div>
                          <div style={cartStyles.itemQty}>Qty: {item.qty}</div>
                          <button style={cartStyles.removeBtn} onClick={() => removeFromCart(item.id)}>Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={cartStyles.summary}>
                    <div style={cartStyles.row}>
                      <span>Subtotal</span>
                      <span>N{cartTotal.toLocaleString()}</span>
                    </div>
                    <div style={cartStyles.row}>
                      <span>Shipping</span>
                      <span>N2,000</span>
                    </div>
                    <div style={cartStyles.total}>
                      <span>Total</span>
                      <span>N{(cartTotal + 2000).toLocaleString()}</span>
                    </div>
                  </div>

                  <button style={cartStyles.checkoutBtn}>Proceed to Checkout</button>
                  <button style={cartStyles.continuBtn} onClick={() => setShowCart(false)}>Continue Shopping</button>
                </>
              )}
            </div>
          </div>
        )}

        <div style={heroStyles.container}>
          <div style={heroStyles.content}>
            <div style={heroStyles.title}>Unlock Your Inner Goddess</div>
            <div style={heroStyles.subtitle}>Luxury Intimate Wellness, Redefined</div>
            <div style={heroStyles.description}>
              Discover premium self-care products crafted for confident women who celebrate their sensuality and power. Each product is thoughtfully designed to elevate your wellness journey.
            </div>
            <button
              style={heroStyles.button}
              onMouseOver={(e) => e.target.style.background = '#c71873'}
              onMouseOut={(e) => e.target.style.background = '#e91e8c'}
              onClick={() => setCurrentPage('shop')}
            >
              Explore Collection
            </button>
          </div>
        </div>

        <div style={productsStyles.container}>
          <div style={productsStyles.title}>Featured Collection</div>
          <div style={productsStyles.subtitle}>Handpicked Luxury Essentials</div>

          <div style={productsStyles.grid}>
            {PRODUCTS.slice(0, 6).map(product => (
              <div
                key={product.id}
                style={productsStyles.card}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(233, 30, 140, 0.2)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                onClick={() => setSelectedProduct(product)}
              >
                <img src={product.image} alt={product.name} style={productsStyles.cardImage} />
                <div style={productsStyles.cardContent}>
                  <div style={productsStyles.cardName}>{product.name}</div>
                  <div style={productsStyles.cardCategory}>{product.category}</div>
                  <div style={productsStyles.cardPrice}>N{product.price.toLocaleString()}</div>
                  <button
                    style={productsStyles.cardButton}
                    onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                    onMouseOver={(e) => e.target.style.background = '#c71873'}
                    onMouseOut={(e) => e.target.style.background = '#e91e8c'}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={footerStyles.container}>
          <div style={footerStyles.content}>
            <div>
              <div style={footerStyles.heading}>Shop</div>
              <div style={footerStyles.link}>Skincare</div>
              <div style={footerStyles.link}>Wellness</div>
              <div style={footerStyles.link}>Accessories</div>
            </div>
            <div>
              <div style={footerStyles.heading}>About</div>
              <div style={footerStyles.link}>Our Story</div>
              <div style={footerStyles.link}>Sustainability</div>
              <div style={footerStyles.link}>Blog</div>
            </div>
            <div>
              <div style={footerStyles.heading}>Support</div>
              <div style={footerStyles.link}>Contact Us</div>
              <div style={footerStyles.link}>FAQ</div>
              <div style={footerStyles.link}>Returns</div>
            </div>
            <div>
              <div style={footerStyles.heading}>Legal</div>
              <div style={footerStyles.link}>Privacy Policy</div>
              <div style={footerStyles.link}>Terms of Service</div>
              <div style={footerStyles.link}>Shipping Policy</div>
            </div>
          </div>
          <div style={footerStyles.bottom}>
            2024 House of NDO. All rights reserved. Celebrating sensuality. Empowering confidence.
          </div>
        </div>

        {selectedProduct && (
          <div style={productDetailStyles.modal} onClick={() => setSelectedProduct(null)}>
            <div style={productDetailStyles.content} onClick={(e) => e.stopPropagation()}>
              <button style={productDetailStyles.close} onClick={() => setSelectedProduct(null)}>X</button>
              <img src={selectedProduct.image} alt={selectedProduct.name} style={productDetailStyles.image} />
              <div style={productDetailStyles.category}>{selectedProduct.category}</div>
              <div style={productDetailStyles.name}>{selectedProduct.name}</div>
              <div style={productDetailStyles.price}>N{selectedProduct.price.toLocaleString()}</div>
              <div style={productDetailStyles.description}>{selectedProduct.description}</div>
              <button
                style={productDetailStyles.button}
                onMouseOver={(e) => e.target.style.background = '#c71873'}
                onMouseOut={(e) => e.target.style.background = '#e91e8c'}
                onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
              >
                Add to Cart
              </button>
              <button style={productDetailStyles.backButton} onClick={() => setSelectedProduct(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // SHOP PAGE
  return (
    <div style={{ background: '#0d0d0d', color: '#f5f1e8', fontFamily: 'Segoe UI, Arial, sans-serif', minHeight: '100vh' }}>
      <div style={navStyles.container}>
        <div style={navStyles.logo}>HOUSE OF NDO</div>
        <div style={navStyles.nav}>
          <div onClick={() => setCurrentPage('home')} style={navStyles.navLink}>Home</div>
          <div onClick={() => setCurrentPage('shop')} style={{ ...navStyles.navLink, color: '#e91e8c' }}>Shop</div>
          <div style={navStyles.navLink}>About</div>
          <div style={navStyles.navLink}>Contact</div>
        </div>
        <div style={navStyles.cartIcon} onClick={() => setShowCart(!showCart)}>
          Cart
          {cartCount > 0 && <div style={navStyles.cartBadge}>{cartCount}</div>}
        </div>
      </div>

      {showCart && (
        <div style={cartStyles.modal} onClick={() => setShowCart(false)}>
          <div style={cartStyles.panel} onClick={(e) => e.stopPropagation()}>
            <div style={cartStyles.header}>
              <div style={cartStyles.title}>Shopping Cart</div>
              <button style={cartStyles.close} onClick={() => setShowCart(false)}>X</button>
            </div>

            {cart.length === 0 ? (
              <div style={cartStyles.empty}>Your cart is empty</div>
            ) : (
              <>
                <div style={cartStyles.items}>
                  {cart.map(item => (
                    <div key={item.id} style={cartStyles.item}>
                      <div style={cartStyles.itemImage}></div>
                      <div style={cartStyles.itemDetails}>
                        <div style={cartStyles.itemName}>{item.name}</div>
                        <div style={cartStyles.itemPrice}>N{item.price.toLocaleString()}</div>
                        <div style={cartStyles.itemQty}>Qty: {item.qty}</div>
                        <button style={cartStyles.removeBtn} onClick={() => removeFromCart(item.id)}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={cartStyles.summary}>
                  <div style={cartStyles.row}>
                    <span>Subtotal</span>
                    <span>N{cartTotal.toLocaleString()}</span>
                  </div>
                  <div style={cartStyles.row}>
                    <span>Shipping</span>
                    <span>N2,000</span>
                  </div>
                  <div style={cartStyles.total}>
                    <span>Total</span>
                    <span>N{(cartTotal + 2000).toLocaleString()}</span>
                  </div>
                </div>

                <button style={cartStyles.checkoutBtn}>Proceed to Checkout</button>
                <button style={cartStyles.continuBtn} onClick={() => setShowCart(false)}>Continue Shopping</button>
              </>
            )}
          </div>
        </div>
      )}

      <div style={productsStyles.container}>
        <div style={productsStyles.title}>Our Collection</div>
        <div style={productsStyles.subtitle}>Premium Intimate Wellness Products</div>

        <div style={productsStyles.filterSection}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={productsStyles.searchInput}
          />
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                ...productsStyles.filterButton,
                ...(selectedCategory === cat ? productsStyles.filterButtonActive : {})
              }}
              onMouseOver={(e) => {
                if (selectedCategory !== cat) {
                  e.target.style.background = '#e91e8c33';
                }
              }}
              onMouseOut={(e) => {
                if (selectedCategory !== cat) {
                  e.target.style.background = 'transparent';
                }
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={productsStyles.grid}>
          {filteredProducts.map(product => (
            <div
              key={product.id}
              style={productsStyles.card}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(233, 30, 140, 0.2)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              onClick={() => setSelectedProduct(product)}
            >
              <img src={product.image} alt={product.name} style={productsStyles.cardImage} />
              <div style={productsStyles.cardContent}>
                <div style={productsStyles.cardName}>{product.name}</div>
                <div style={productsStyles.cardCategory}>{product.category}</div>
                <div style={productsStyles.cardPrice}>N{product.price.toLocaleString()}</div>
                <button
                  style={productsStyles.cardButton}
                  onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                  onMouseOver={(e) => e.target.style.background = '#c71873'}
                  onMouseOut={(e) => e.target.style.background = '#e91e8c'}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
            <div style={{ fontSize: '18px', marginBottom: '12px' }}>No products found</div>
            <div style={{ fontSize: '14px' }}>Try adjusting your search or category filters</div>
          </div>
        )}
      </div>

      <div style={footerStyles.container}>
        <div style={footerStyles.content}>
          <div>
            <div style={footerStyles.heading}>Shop</div>
            <div style={footerStyles.link}>Skincare</div>
            <div style={footerStyles.link}>Wellness</div>
            <div style={footerStyles.link}>Accessories</div>
          </div>
          <div>
            <div style={footerStyles.heading}>About</div>
            <div style={footerStyles.link}>Our Story</div>
            <div style={footerStyles.link}>Sustainability</div>
            <div style={footerStyles.link}>Blog</div>
          </div>
          <div>
            <div style={footerStyles.heading}>Support</div>
            <div style={footerStyles.link}>Contact Us</div>
            <div style={footerStyles.link}>FAQ</div>
            <div style={footerStyles.link}>Returns</div>
          </div>
          <div>
            <div style={footerStyles.heading}>Legal</div>
            <div style={footerStyles.link}>Privacy Policy</div>
            <div style={footerStyles.link}>Terms of Service</div>
            <div style={footerStyles.link}>Shipping Policy</div>
          </div>
        </div>
        <div style={footerStyles.bottom}>
          2024 House of NDO. All rights reserved. Celebrating sensuality. Empowering confidence.
        </div>
      </div>

      {selectedProduct && (
        <div style={productDetailStyles.modal} onClick={() => setSelectedProduct(null)}>
          <div style={productDetailStyles.content} onClick={(e) => e.stopPropagation()}>
            <button style={productDetailStyles.close} onClick={() => setSelectedProduct(null)}>X</button>
            <img src={selectedProduct.image} alt={selectedProduct.name} style={productDetailStyles.image} />
            <div style={productDetailStyles.category}>{selectedProduct.category}</div>
            <div style={productDetailStyles.name}>{selectedProduct.name}</div>
            <div style={productDetailStyles.price}>N{selectedProduct.price.toLocaleString()}</div>
            <div style={productDetailStyles.description}>{selectedProduct.description}</div>
            <button
              style={productDetailStyles.button}
              onMouseOver={(e) => e.target.style.background = '#c71873'}
              onMouseOut={(e) => e.target.style.background = '#e91e8c'}
              onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
            >
              Add to Cart
            </button>
            <button style={productDetailStyles.backButton} onClick={() => setSelectedProduct(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
