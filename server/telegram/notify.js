// ─────────────────────────────────────────────────────────────────────────────
// Shared "push a Telegram message to the owner(s)/staff" helper.
//
// Reuses the same shop bot token and owner-id list that shop-bot.js already
// uses for in-chat order notifications, so no new bot or credentials are
// needed. TELEGRAM_OWNER_IDS is a comma-separated list — add a staff member's
// Telegram chat id to it and they get every alert too, alongside the owner.
// ─────────────────────────────────────────────────────────────────────────────

const { sendMessageQuiet, esc } = require('./api');

const TOKEN     = process.env.TELEGRAM_SHOP_BOT_TOKEN;
const OWNER_IDS = String(process.env.TELEGRAM_OWNER_IDS || '')
  .split(',').map(s => s.trim()).filter(Boolean);

/** Send an HTML-formatted message to every configured owner/staff chat id. */
function notifyOwners(html) {
  if (!TOKEN) {
    console.warn('[notify] TELEGRAM_SHOP_BOT_TOKEN is not set — nobody was notified.');
    return;
  }
  if (!OWNER_IDS.length) {
    console.warn('[notify] TELEGRAM_OWNER_IDS is not set — nobody was notified.');
    return;
  }
  for (const id of OWNER_IDS) sendMessageQuiet(TOKEN, id, html);
}

const naira = (n) => 'N' + Number(n || 0).toLocaleString('en-NG');

/** Build + send the "new spa booking" alert. */
function notifyNewBooking(booking) {
  const {
    customer_name, customer_phone, customer_email,
    service_name, service_price, booking_date, booking_time, notes,
  } = booking;

  const lines = [
    '💆 <b>New spa booking</b>',
    '',
    `<b>${esc(service_name)}</b>${service_price ? ` — ${naira(service_price)}` : ''}`,
    `📅 ${esc(booking_date)} at ${esc(booking_time)}`,
    '',
    `<b>Customer</b>`,
    `${esc(customer_name)}`,
    `${esc(customer_phone)}`,
  ];
  if (customer_email) lines.push(esc(customer_email));
  if (notes) lines.push('', `<b>Notes</b>`, esc(notes));

  notifyOwners(lines.join('\n'));
}

module.exports = { notifyOwners, notifyNewBooking };
