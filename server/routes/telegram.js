// ─────────────────────────────────────────────────────────────────────────────
// Telegram webhook endpoints.
//
// Webhooks rather than long polling, for one specific reason: this app is
// deployed as a zip to a shared Node host, where the process is started on
// demand and idled out when quiet. A polling loop would simply stop running
// during idle periods and orders would go unanswered. An inbound webhook
// request wakes the process the same way any other HTTP request does.
//
// Mounted in index.js BEFORE the /api/ rate limiter — 200 requests per 15
// minutes is fine for a storefront and far too low for a busy group, and a
// throttled webhook is a dropped message Telegram will keep retrying.
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const shopBot = require('../telegram/shop-bot');
const modBot  = require('../telegram/mod-bot');

const router = express.Router();

const SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || '';

/**
 * The webhook URL is public, so the secret is what proves a request is really
 * from Telegram. It's registered with setWebhook and echoed back in this
 * header on every delivery.
 */
function verify(req, res, next) {
  if (!SECRET) {
    console.error('[telegram] TELEGRAM_WEBHOOK_SECRET is not set — refusing webhook traffic.');
    return res.sendStatus(403);
  }
  if (req.get('X-Telegram-Bot-Api-Secret-Token') !== SECRET) {
    return res.sendStatus(403);
  }
  return next();
}

/**
 * Acknowledge immediately, then process.
 *
 * Telegram waits for the HTTP response and re-delivers the update if it is
 * slow or non-2xx. Since handling an update involves several API round-trips
 * and a couple of Supabase queries, replying first is what stops the bot
 * double-posting under load.
 */
function receive(bot, name) {
  return (req, res) => {
    res.sendStatus(200);
    Promise.resolve()
      .then(() => bot.handleUpdate(req.body))
      .catch(err => console.error(`[telegram:${name}]`, err.stack || err.message));
  };
}

router.post('/shop', verify, receive(shopBot, 'shop'));
router.post('/mod',  verify, receive(modBot, 'mod'));

/** Which bots are wired up. Safe to expose — no secrets, no counts. */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    shop_bot: shopBot.isConfigured(),
    mod_bot:  modBot.isConfigured(),
    webhook_secret_set: Boolean(SECRET),
  });
});

module.exports = router;
