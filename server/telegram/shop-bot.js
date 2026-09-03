// ─────────────────────────────────────────────────────────────────────────────
// House of Moo — storefront bot.
//
// Replaces the wa.me checkout hand-off. Telegram cannot pre-fill a message, so
// instead of stuffing the order into a URL, the storefront passes only the
// order reference through the bot's /start payload:
//
//     https://t.me/<bot>?start=MOO-1730000000-AB12C
//
// The customer taps it, taps "Start", and the bot posts the order summary
// itself — pulled from Supabase, so it's the real order rather than whatever
// the browser claimed. Then it pings the owner.
//
// This is strictly better than the old flow: order text can't be edited in
// transit, the owner gets a structured notification instead of a wall of
// pasted text, and it runs on a bot account that can't be spam-banned for
// receiving too many orders — which is what killed the last WhatsApp number.
// ─────────────────────────────────────────────────────────────────────────────

const supabase = require('../config/db');
const { sendMessage, sendMessageQuiet, esc } = require('./api');

const TOKEN     = process.env.TELEGRAM_SHOP_BOT_TOKEN;
const OWNER_IDS = String(process.env.TELEGRAM_OWNER_IDS || '')
  .split(',').map(s => s.trim()).filter(Boolean);

const naira = (n) => 'N' + Number(n || 0).toLocaleString('en-NG');

/** Bank details the bot quotes to customers. Set these in .env. */
const BANK = {
  name:    process.env.PAYMENT_BANK_NAME    || '',
  account: process.env.PAYMENT_ACCOUNT_NO   || '',
  holder:  process.env.PAYMENT_ACCOUNT_NAME || 'House of Moo',
};

const hasBankDetails = () => Boolean(BANK.name && BANK.account);

// ── Order lookup ─────────────────────────────────────────────────────────────

async function fetchOrder(reference) {
  const { data: order, error } = await supabase
    .from('orders').select('*').eq('reference', reference).maybeSingle();
  if (error || !order) return null;

  const { data: items } = await supabase
    .from('order_items').select('*').eq('order_id', order.id);

  return { ...order, items: items || [] };
}

function renderOrder(order) {
  const lines = (order.items || [])
    .map((i, n) => `${n + 1}. ${esc(i.product_name)}${i.quantity > 1 ? ` ×${i.quantity}` : ''} — ${naira(i.price_at_purchase * i.quantity)}`)
    .join('\n');

  return [
    `<b>Order ${esc(order.reference)}</b>`,
    '',
    lines || '<i>No items recorded</i>',
    '',
    `Subtotal: ${naira(order.subtotal)}`,
    `Delivery${order.delivery_city ? ` (${esc(order.delivery_city)})` : ''}: ${naira(order.shipping_fee)}`,
    `<b>Total: ${naira(order.total)}</b>`,
  ].join('\n');
}

function paymentInstructions() {
  if (!hasBankDetails()) {
    // Better to say nothing than to invent an account number.
    return 'Reply here and we\'ll send you the payment details right away.';
  }
  return [
    'To pay by bank transfer:',
    `<b>${esc(BANK.name)}</b>`,
    `<code>${esc(BANK.account)}</code>`,
    `${esc(BANK.holder)}`,
    '',
    'Send your receipt here once paid and we\'ll confirm and dispatch.',
  ].join('\n');
}

// ── Handlers ─────────────────────────────────────────────────────────────────

async function handleStart(chatId, from, payload) {
  const name = esc(from.first_name || 'there');

  // Plain /start with no payload — someone tapped the floating button or found
  // the bot in search, rather than arriving from checkout.
  if (!payload) {
    return sendMessage(TOKEN, chatId,
      `Hi ${name}! 👋\n\nWelcome to <b>House of Moo</b>.\n\n` +
      `You can browse and order at https://houseofmoo.shop — when you check out, ` +
      `your order arrives here automatically and we'll take payment from there.\n\n` +
      `Or just tell us what you're looking for and we'll help you find it.`);
  }

  const order = await fetchOrder(payload);

  // The reference didn't resolve. Most likely the storefront couldn't reach
  // Supabase at checkout time, so the order was never written. Don't leave the
  // customer stranded — take the details manually.
  if (!order) {
    await sendMessageQuiet(TOKEN, chatId,
      `Hi ${name}! We couldn't automatically pull up order <code>${esc(payload)}</code>.\n\n` +
      `No problem — please paste your order details here (the website has a ` +
      `"Copy my order details" button on the confirmation page) and we'll take it from there.`);

    notifyOwners(
      `⚠️ <b>Unresolved order</b>\n\nReference <code>${esc(payload)}</code> was opened in the bot ` +
      `but isn't in the database.\n\nCustomer: ${name}` +
      (from.username ? ` (@${esc(from.username)})` : '') +
      `\n\nThey've been asked to paste their order manually.`);
    return;
  }

  await sendMessage(TOKEN, chatId,
    `Hi ${name}! We've got your order. 🎀\n\n${renderOrder(order)}\n\n` +
    `<b>Delivering to</b>\n${esc(order.delivery_address)}, ${esc(order.delivery_city)}, ${esc(order.delivery_state)}\n\n` +
    `${paymentInstructions()}\n\n` +
    `<i>Your order arrives in plain, discreet packaging.</i>`);

  // Record who this customer is on Telegram, so replies to them are possible
  // later and so the owner can find the chat. Best-effort: a missing column
  // must never break the customer's checkout.
  supabase.from('orders')
    .update({ telegram_chat_id: String(chatId) })
    .eq('reference', order.reference)
    .then(({ error }) => {
      if (error) console.error('[shop-bot] could not store telegram_chat_id:', error.message);
    });

  notifyOwners(
    `🛍 <b>New order</b>\n\n${renderOrder(order)}\n\n` +
    `<b>Customer</b>\n${esc(order.customer_name)}\n${esc(order.customer_phone)}\n${esc(order.customer_email)}\n\n` +
    `<b>Deliver to</b>\n${esc(order.delivery_address)}, ${esc(order.delivery_city)}, ${esc(order.delivery_state)}\n\n` +
    `Chatting with you now${from.username ? ` as @${esc(from.username)}` : ''}.`);
}

/** Forward anything else the customer says straight to the owner. */
async function handleFreeText(chatId, from, text) {
  notifyOwners(
    `💬 <b>Message from ${esc(from.first_name || 'a customer')}</b>` +
    `${from.username ? ` (@${esc(from.username)})` : ''}\n` +
    `<i>chat id ${chatId}</i>\n\n${esc(text)}`);
}

function notifyOwners(html) {
  if (!OWNER_IDS.length) {
    console.warn('[shop-bot] TELEGRAM_OWNER_IDS is not set — nobody was notified.');
    return;
  }
  for (const id of OWNER_IDS) sendMessageQuiet(TOKEN, id, html);
}

// ── Entry point ──────────────────────────────────────────────────────────────

async function handleUpdate(update) {
  const msg = update.message;
  if (!msg || !msg.text) return;

  // Only private chats. The shop bot has no business acting inside groups.
  if (msg.chat.type !== 'private') return;

  const chatId = msg.chat.id;
  const text   = msg.text.trim();

  if (text.startsWith('/start')) {
    const payload = text.slice('/start'.length).trim();
    return handleStart(chatId, msg.from, payload);
  }

  if (text === '/help') {
    return sendMessage(TOKEN, chatId,
      'Send us a message and a real person will reply.\n\n' +
      'To place an order, shop at https://houseofmoo.shop and check out — ' +
      'your order will appear here automatically.');
  }

  return handleFreeText(chatId, msg.from, text);
}

module.exports = { handleUpdate, isConfigured: () => Boolean(TOKEN) };
