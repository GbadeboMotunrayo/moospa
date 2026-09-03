// ─────────────────────────────────────────────────────────────────────────────
// House of Moo — contact channels, single source of truth.
//
// Every phone number, chat link and channel label on the storefront comes from
// this file. Nothing else in src/ should hardcode a number or a wa.me/t.me URL.
//
// Why this file exists: the WhatsApp number used to be copy-pasted into 9
// different components. When the number had to change, each one was a separate
// chance to miss a spot — and a missed spot means an order goes to a dead line.
// Change it here, it changes everywhere.
//
// The values below can be overridden at build time without touching code:
//   REACT_APP_WHATSAPP_NUMBER=2348001234567  npm run build
// ─────────────────────────────────────────────────────────────────────────────

/**
 * WhatsApp is back ON (re-enabled September 2026) after two prior numbers were
 * hacked/banned in a row — see git history around the Telegram migration for
 * that story. This time there are two numbers on file, main + backup, so a
 * single compromised line doesn't take checkout down again.
 *
 * International format, digits only, no leading "+" or "00" (what wa.me needs).
 * Nigerian local numbers (0XXXXXXXXXXX) become 234XXXXXXXXXX.
 */
export const WHATSAPP_ENABLED = true;
export const WHATSAPP_NUMBER = process.env.REACT_APP_WHATSAPP_NUMBER || '2349160816695';         // primary — 0916 081 6695
export const WHATSAPP_NUMBER_BACKUP = process.env.REACT_APP_WHATSAPP_NUMBER_BACKUP || '2348074458863'; // backup — 0807 445 8863

/** Masked display forms, so the raw numbers aren't scraped off the page. */
export const WHATSAPP_DISPLAY = '0916 081 ....';
export const WHATSAPP_DISPLAY_BACKUP = '0807 445 ....';

/** WhatsApp's brand green, used on the now-primary chat CTAs. */
export const WHATSAPP_GREEN = '#25d366';
export const WHATSAPP_GREEN_DARK = '#1ea952';

/**
 * The storefront bot's @username, WITHOUT the leading @.
 *
 * Created via @BotFather. Kept live as a second option alongside WhatsApp —
 * most customers already know the brand from WhatsApp, but Telegram stays on
 * every checkout/contact surface so customers get familiar with it over time.
 */
export const TELEGRAM_BOT = process.env.REACT_APP_TELEGRAM_BOT || 'HouseOfMooBot';

/**
 * Her personal/business Telegram @username, WITHOUT the leading @.
 * Used for "talk to a human" links, where a bot isn't the right answer.
 * Falls back to the bot if she hasn't set one up.
 */
export const TELEGRAM_HANDLE = process.env.REACT_APP_TELEGRAM_HANDLE || TELEGRAM_BOT;

/** Telegram's brand blue. Used on the secondary "also on Telegram" CTAs. */
export const TELEGRAM_BLUE = '#229ED9';
export const TELEGRAM_BLUE_DARK = '#1c88ba';

/** Voice line. Still answers; not a chat channel. */
export const PHONE_PRIMARY = '07070182790';
export const PHONE_PRIMARY_INTL = '+2347070182790';

/** Masked display forms, so the raw numbers aren't scraped off the page. */
export const PHONE_DISPLAY = '07070........';

export const EMAIL = 'Houseofmooskincare@gmail.com';

export const ADDRESS = '1 Olaniyi Street, New Okooba, Abulegba, Lagos';

// ── Link builders ────────────────────────────────────────────────────────────

/** Plain WhatsApp chat link, no pre-filled text. */
export const whatsappLink = () => `https://wa.me/${WHATSAPP_NUMBER}`;

/** Same, on the backup line — offered if the primary number ever has trouble. */
export const whatsappBackupLink = () => `https://wa.me/${WHATSAPP_NUMBER_BACKUP}`;

/**
 * WhatsApp chat link with a pre-filled message (order summary, enquiry, etc).
 * Unlike Telegram, wa.me supports `?text=` directly, so the customer's whole
 * order/message is already typed in when the chat opens — they just hit send.
 */
export const whatsappMessageLink = (text, backup = false) =>
  `https://wa.me/${backup ? WHATSAPP_NUMBER_BACKUP : WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

/** Plain chat link to the shop bot. */
export const telegramLink = () => `https://t.me/${TELEGRAM_BOT}`;

/** Chat link to a human. */
export const telegramHumanLink = () => `https://t.me/${TELEGRAM_HANDLE}`;

/**
 * Deep link that hands a specific order to the bot.
 *
 * Telegram has no equivalent of wa.me's `?text=` — you cannot pre-fill a
 * message. What you CAN do is pass a payload through /start, which is what
 * this does: the bot receives `/start MOO-1234-ABCDE`, looks the order up in
 * Supabase, and posts the summary itself. The customer types nothing.
 *
 * Telegram caps the start payload at 64 characters and allows only
 * [A-Za-z0-9_-], so the reference is sanitised here rather than trusted.
 */
export const telegramOrderLink = (reference) => {
  const payload = String(reference).replace(/[^A-Za-z0-9_-]/g, '').slice(0, 64);
  return `https://t.me/${TELEGRAM_BOT}?start=${payload}`;
};

/** Voice-call link. */
export const phoneLink = () => `tel:${PHONE_PRIMARY_INTL}`;
