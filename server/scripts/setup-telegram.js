#!/usr/bin/env node
// ────────────────────────────────────────────────────────────────────────────
// One-time Telegram wiring.
//
//   node server/scripts/setup-telegram.js            # register both webhooks
//   node server/scripts/setup-telegram.js --status   # show current state
//   node server/scripts/setup-telegram.js --delete   # unregister (rollback)
//
// Run it again any time the public URL changes. Registering a webhook is
// idempotent — it replaces whatever was there before.
// ────────────────────────────────────────────────────────────────────────────

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const PUBLIC_URL = (process.env.PUBLIC_URL || process.env.FRONTEND_URL || '').replace(/\/+$/, '');
const SECRET     = process.env.TELEGRAM_WEBHOOK_SECRET || '';

const BOTS = [
  { name: 'shop', token: process.env.TELEGRAM_SHOP_BOT_TOKEN, path: '/api/telegram/shop' },
  { name: 'mod',  token: process.env.TELEGRAM_MOD_BOT_TOKEN,  path: '/api/telegram/mod'  },
];

async function api(token, method, payload) {
  const res  = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload || {}),
  });
  const body = await res.json();
  if (!body.ok) throw new Error(body.description || `HTTP ${res.status}`);
  return body.result;
}

async function main() {
  const mode = process.argv[2] || '--set';

  if (mode === '--set' && !PUBLIC_URL.startsWith('https://')) {
    console.error('✗ PUBLIC_URL must be set to your https:// site URL in server/.env');
    console.error('  e.g. PUBLIC_URL=https://houseofmoo.shop');
    process.exit(1);
  }
  if (mode === '--set' && SECRET.length < 16) {
    console.error('✗ TELEGRAM_WEBHOOK_SECRET must be set and at least 16 characters.');
    console.error('  Generate one:  node -e "console.log(require(\'crypto\').randomBytes(24).toString(\'hex\'))"');
    process.exit(1);
  }

  for (const bot of BOTS) {
    if (!bot.token) {
      console.log(`— ${bot.name}: no token set, skipping`);
      continue;
    }

    try {
      const me = await api(bot.token, 'getMe');

      if (mode === '--status') {
        const info = await api(bot.token, 'getWebhookInfo');
        console.log(`\n@${me.username} (${bot.name})`);
        console.log(`  url:            ${info.url || '(none)'}`);
        console.log(`  pending:        ${info.pending_update_count}`);
        if (info.last_error_message) {
          console.log(`  last error:     ${info.last_error_message}`);
        }
        continue;
      }

      if (mode === '--delete') {
        await api(bot.token, 'deleteWebhook', { drop_pending_updates: false });
        console.log(`✓ @${me.username} (${bot.name}) — webhook removed`);
        continue;
      }

      const url = `${PUBLIC_URL}${bot.path}`;
      await api(bot.token, 'setWebhook', {
        url,
        secret_token: SECRET,
        // The mod bot needs button taps as well as messages. Joins arrive as
        // `message.new_chat_members`, so `chat_member` is deliberately NOT
        // subscribed — having both would deliver every join twice and the
        // welcome/mute would fire two times per member.
        allowed_updates: bot.name === 'mod'
          ? ['message', 'callback_query']
          : ['message'],
        drop_pending_updates: true,
      });
      console.log(`✓ @${me.username} (${bot.name}) → ${url}`);
    } catch (err) {
      console.error(`✗ ${bot.name}: ${err.message}`);
      process.exitCode = 1;
    }
  }

  if (mode === '--set') {
    console.log('\nDone. Check it with:  node server/scripts/setup-telegram.js --status');
  }
}

main().catch(err => { console.error(err); process.exit(1); });
