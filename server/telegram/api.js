// ─────────────────────────────────────────────────────────────────────────────
// Minimal Telegram Bot API client.
//
// Deliberately dependency-free — it's a POST to a URL, and every bot library
// that would do this for us also drags in a polling loop, an event emitter and
// a version-compatibility surface we'd have to maintain. Node 18+ ships global
// fetch, and @supabase/supabase-js already requires Node 18+, so this is safe
// on any host that can already run the API.
// ─────────────────────────────────────────────────────────────────────────────

const API_ROOT = 'https://api.telegram.org';

/**
 * Call a Bot API method.
 *
 * Telegram signals failure with HTTP 200 + `{ok: false}` as often as with a
 * non-2xx status, so both are treated as errors here.
 */
async function call(token, method, payload = {}) {
  if (!token) throw new Error(`Telegram: no bot token configured for ${method}`);

  let res;
  try {
    res = await fetch(`${API_ROOT}/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });
  } catch (err) {
    throw new Error(`Telegram ${method} network error: ${err.message}`);
  }

  let body;
  try {
    body = await res.json();
  } catch {
    throw new Error(`Telegram ${method} returned non-JSON (HTTP ${res.status})`);
  }

  if (!body.ok) {
    throw new Error(`Telegram ${method} failed: ${body.description || `HTTP ${res.status}`}`);
  }
  return body.result;
}

/**
 * Fire-and-forget variant.
 *
 * Telegram retries a webhook whose HTTP response is slow or non-2xx, which
 * would make the bot repeat itself. So webhook handlers must always answer
 * quickly and must never throw on a side-effect send — a failed owner
 * notification should not cause the customer's message to be re-delivered.
 */
function callQuiet(token, method, payload = {}) {
  return call(token, method, payload).catch(err => {
    console.error('[telegram]', err.message);
    return null;
  });
}

// ── Message helpers ──────────────────────────────────────────────────────────

const sendMessage = (token, chat_id, text, extra = {}) =>
  call(token, 'sendMessage', { chat_id, text, parse_mode: 'HTML', ...extra });

const sendMessageQuiet = (token, chat_id, text, extra = {}) =>
  callQuiet(token, 'sendMessage', { chat_id, text, parse_mode: 'HTML', ...extra });

const deleteMessage = (token, chat_id, message_id) =>
  callQuiet(token, 'deleteMessage', { chat_id, message_id });

const restrictMember = (token, chat_id, user_id, permissions, until_date) =>
  callQuiet(token, 'restrictChatMember', { chat_id, user_id, permissions, until_date });

const banMember = (token, chat_id, user_id) =>
  callQuiet(token, 'banChatMember', { chat_id, user_id });

const answerCallback = (token, callback_query_id, text, show_alert = false) =>
  callQuiet(token, 'answerCallbackQuery', { callback_query_id, text, show_alert });

/**
 * HTML-escape untrusted text before it goes into a parse_mode:'HTML' message.
 *
 * This matters more than it looks: display names, group messages and order
 * fields are all attacker-controlled. An unescaped "<" makes Telegram reject
 * the whole send with a parse error, which would silently drop the bot's
 * reply — a customer name containing "<" would otherwise break checkout.
 */
const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

module.exports = {
  call, callQuiet, sendMessage, sendMessageQuiet, deleteMessage,
  restrictMember, banMember, answerCallback, esc,
};
