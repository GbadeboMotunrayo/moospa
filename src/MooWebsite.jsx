import { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import SkincarePage from './pages/SkincarePage';
import SexToysPage from './pages/SexToysPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ConfirmationPage from './pages/ConfirmationPage';
import SpaPage from './pages/SpaPage';
import AboutPage from './pages/AboutPage';
import FAQPage from './pages/FAQPage';
import ContactPage from './pages/ContactPage';

const PAGE_META = {
  home: { title: 'House of Moo - Luxury Skincare, Intimate Wellness & Spa', desc: 'Premium whitening and glow skincare, intimate wellness products, and luxury spa treatments, delivered discreetly across Nigeria.' },
  shop: { title: 'Shop All Products | House of Moo', desc: 'Browse our full range of skincare, body care and adult wellness products. Filter by category, price and rating.' },
  skincare: { title: 'Skincare Collection | House of Moo', desc: 'Whitening creams, body scrubs, soaps, toning oils and more from House of Moo skincare.' },
  sextoys: { title: 'Adult Wellness | House of Moo', desc: 'Discreetly delivered intimate wellness products. 18+ only.' },
  product: { title: 'Product Details | House of Moo', desc: 'View product details, pricing and reviews at House of Moo.' },
  cart: { title: 'Your Cart | House of Moo', desc: 'Review the items in your House of Moo shopping cart.' },
  checkout: { title: 'Checkout | House of Moo', desc: 'Complete your order securely with House of Moo.' },
  confirmation: { title: 'Order Confirmed | House of Moo', desc: 'Your House of Moo order has been confirmed.' },
  spa: { title: 'Spa & Bookings | House of Moo', desc: 'Book a luxury spa session with House of Moo.' },
  about: { title: 'About Us | House of Moo', desc: 'Learn about House of Moo, our story and our commitment to quality.' },
  faq: { title: 'FAQs | House of Moo', desc: 'Answers to common questions about orders, delivery and products.' },
  contact: { title: 'Contact Us | House of Moo', desc: 'Get in touch with House of Moo for support, orders and enquiries.' },
};

function Site() {
  const { currentPage, t, selectedProduct } = useApp();
  const noFooterPages = ['cart', 'checkout', 'confirmation'];

  useEffect(() => {
    const meta = PAGE_META[currentPage] || PAGE_META.home;
    let title = meta.title;
    let desc = meta.desc;
    if (currentPage === 'product' && selectedProduct) {
      title = `${selectedProduct.name} | House of Moo`;
      desc = selectedProduct.shortDesc || meta.desc;
    }
    document.title = title;
    let descTag = document.querySelector('meta[name="description"]');
    if (!descTag) {
      descTag = document.createElement('meta');
      descTag.setAttribute('name', 'description');
      document.head.appendChild(descTag);
    }
    descTag.setAttribute('content', desc);
  }, [currentPage, selectedProduct]);

  const pages = {
    home: <HomePage />, shop: <ShopPage />, skincare: <SkincarePage />,
    sextoys: <SexToysPage />, product: <ProductPage />, cart: <CartPage />,
    checkout: <CheckoutPage />, confirmation: <ConfirmationPage />,
    spa: <SpaPage />, about: <AboutPage />, faq: <FAQPage />, contact: <ContactPage />,
  };

  return (
    <div style={{ background: t.bg, color: t.text, minHeight: '100vh', fontFamily: "'Segoe UI', Arial, sans-serif", transition: 'background 0.3s, color 0.3s' }}>
      <Navbar />
      <div>{pages[currentPage] || <HomePage />}</div>
      {!noFooterPages.includes(currentPage) && <Footer />}
      {/* WhatsApp floating button */}
      <a href="https://wa.me/2348106393774" target="_blank" rel="noreferrer"
        style={{ position: 'fixed', bottom: 24, right: 24, width: 56, height: 56, background: '#25d366', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, boxShadow: '0 4px 20px rgba(37,211,102,0.4)', textDecoration: 'none', fontSize: 28 }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>
    </div>
  );
}

export default function MooWebsite() {
  return <AppProvider><Site /></AppProvider>;
}
