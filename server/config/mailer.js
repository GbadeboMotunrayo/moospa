const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
});

const FROM = process.env.EMAIL_FROM || 'House of Moo <noreply@houseofmoo.shop>';

// Kept in step with src/config/contact.js. The old value here was a
// placeholder (+234 800 000 0000) that shipped to real customers.
const TELEGRAM_BOT = process.env.TELEGRAM_SHOP_BOT_USERNAME || 'HouseOfMooBot';

async function sendBookingConfirmation({ customer_name, customer_email, service_name, booking_date, booking_time }) {
  if (!process.env.EMAIL_USER) return;
  await transporter.sendMail({
    from: FROM, to: customer_email,
    subject: `Booking Confirmed - ${service_name} | House of Moo`,
    html: `<div style="font-family:Arial;max-width:560px;margin:0 auto;background:#0d0d0d;color:#f5f1e8;padding:40px;border-radius:12px;">
      <h1 style="color:#e91e8c;">House of Moo</h1>
      <h2>Spa Booking Received</h2>
      <p>Hi ${customer_name}, your booking is pending confirmation. We will contact you shortly.</p>
      <div style="background:#1a1a1a;border:1px solid #333;border-radius:8px;padding:20px;margin:24px 0;">
        <p><span style="color:#888;font-size:12px;">SERVICE</span><br><strong>${service_name}</strong></p>
        <p><span style="color:#888;font-size:12px;">DATE</span><br><strong>${booking_date}</strong></p>
        <p><span style="color:#888;font-size:12px;">TIME</span><br><strong>${booking_time}</strong></p>
      </div>
      <p style="color:#888;font-size:13px;">Questions? Message us on Telegram: <a href="https://t.me/${TELEGRAM_BOT}" style="color:#229ED9;">@${TELEGRAM_BOT}</a></p>
    </div>`,
  });
}

async function sendOrderConfirmation({ customer_name, customer_email, reference, items, total }) {
  if (!process.env.EMAIL_USER) return;
  const rows = items.map(i => `<tr><td style="padding:8px 0;border-bottom:1px solid #333;">${i.name}</td><td style="text-align:center;padding:8px 0;border-bottom:1px solid #333;">${i.qty}</td><td style="text-align:right;padding:8px 0;border-bottom:1px solid #333;color:#e91e8c;">N${(i.price*i.qty).toLocaleString()}</td></tr>`).join('');
  await transporter.sendMail({
    from: FROM, to: customer_email,
    subject: `Order Confirmed ${reference} | House of Moo`,
    html: `<div style="font-family:Arial;max-width:560px;margin:0 auto;background:#0d0d0d;color:#f5f1e8;padding:40px;border-radius:12px;">
      <h1 style="color:#e91e8c;">House of Moo</h1>
      <h2>Order Confirmed!</h2>
      <p>Hi ${customer_name}, thank you for your order.</p>
      <p style="color:#888;font-size:13px;">Ref: <strong style="color:#e91e8c;">${reference}</strong></p>
      <table style="width:100%;margin:24px 0;border-collapse:collapse;">
        <thead><tr style="color:#888;font-size:12px;"><th style="text-align:left;">Item</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Price</th></tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr><td colspan="2" style="padding-top:12px;font-weight:bold;">Total</td><td style="padding-top:12px;font-weight:bold;color:#e91e8c;text-align:right;">N${Number(total).toLocaleString()}</td></tr></tfoot>
      </table>
      <p style="color:#888;font-size:13px;">Delivered in plain, discreet packaging within 24-48 hours.</p>
      <p style="color:#888;font-size:13px;">To arrange payment or track this order, message us on Telegram: <a href="https://t.me/${TELEGRAM_BOT}?start=${encodeURIComponent(reference)}" style="color:#229ED9;">@${TELEGRAM_BOT}</a></p>
    </div>`,
  });
}

module.exports = { sendBookingConfirmation, sendOrderConfirmation };
