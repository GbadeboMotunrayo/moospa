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
import TelegramIcon from './components/TelegramIcon';
import { telegramLink, TELEGRAM_BLUE } from './config/contact';

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
      {/* Telegram floating button */}
      <a href={telegramLink()} target="_blank" rel="noreferrer" aria-label="Chat with House of Moo on Telegram"
        style={{ position: 'fixed', bottom: 24, right: 24, width: 56, height: 56, background: TELEGRAM_BLUE, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, boxShadow: `0 4px 20px ${TELEGRAM_BLUE}66`, textDecoration: 'none' }}>
        <TelegramIcon size={28} color="white" />
      </a>
    </div>
  );
}

export default function MooWebsite() {
  return <AppProvider><Site /></AppProvider>;
}
