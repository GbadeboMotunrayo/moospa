// ─────────────────────────────────────────────────────────────────────────────
// House of Moo community — moderator bot.
//
// Runs the adult stories/social group. Three jobs:
//
//   1. The door.   New members are muted on arrival and must confirm they are
//                  18+ and accept the rules before they can post. This doubles
//                  as a bot-check: join-spam never taps the button.
//   2. The floor.  Every message is checked against server/telegram/rules.js.
//                  Violations are deleted and struck; three strikes mutes for
//                  24 hours, and a fourth bans.
//   3. The list.   Members can opt in to share their phone and email in DM in
//                  exchange for member perks. Strictly opt-in — see below.
//
// This is a SEPARATE bot from the storefront bot on purpose. If the group is
// ever mass-reported and this bot goes down with it, checkout keeps working.
//
// ── On contact collection ────────────────────────────────────────────────────
// Telegram never exposes a user's email, and exposes a phone number only when
// the user taps a "Share contact" button themselves. So consent isn't a policy
// we chose to add — it's the only mechanism the platform offers. Everything
// captured here is volunteered in a private chat, in exchange for something
// (a discount code), with a stated purpose and a working /forgetme.
// That is also what makes the resulting list usable: it's a marketing list she
// owns, rather than scraped numbers that get her reported again.
// ─────────────────────────────────────────────────────────────────────────────

const supabase = require('../config/db');
const {
  sendMessage, sendMessageQuiet, deleteMessage,
  restrictMember, banMember, answerCallback, call, esc,
} = require('./api');
const { evaluate, RULES_TEXT } = require('./rules');

const TOKEN     = process.env.TELEGRAM_MOD_BOT_TOKEN;
const GROUP_ID  = process.env.TELEGRAM_GROUP_ID || '';
const OWNER_IDS = String(process.env.TELEGRAM_OWNER_IDS || '')
  .split(',').map(s => s.trim()).filter(Boolean);
const PERK_CODE = process.env.TELEGRAM_PERK_CODE || 'MOOVIP';

const MUTE_STRIKES = 3;
const BAN_STRIKES  = 4;
const MUTE_HOURS   = 24;

const MUTED    = { can_send_messages: false, can_send_media_messages: false, can_send_other_messages: false, can_add_web_page_previews: false };
const UNMUTED  = { can_send_messages: true,  can_send_media_messages: true,  can_send_other_messages: true,  can_add_web_page_previews: true };

const isOwner = (id) => OWNER_IDS.includes(String(id));

// ── Admin exemption ──────────────────────────────────────────────────────────
// Group admins are never moderated. Without this, the moment she promotes a
// co-moderator that person starts collecting strikes for doing their job —
// posting the rules, quoting a removed message, sharing a contact detail.
//
// Cached for five minutes: the alternative is a getChatAdministrators call on
// every single message, which is both slow and a fast route to a 429.
const adminCache = new Map(); // chatId -> { ids:Set, expires:number }
const ADMIN_TTL = 5 * 60 * 1000;

async function isAdmin(chatId, userId) {
  if (isOwner(userId)) return true;

  const key    = String(chatId);
  const cached = adminCache.get(key);

  if (!cached || cached.expires < Date.now()) {
    try {
      const admins = await call(TOKEN, 'getChatAdministrators', { chat_id: chatId });
      adminCache.set(key, {
        ids: new Set(admins.map(a => String(a.user.id))),
        expires: Date.now() + ADMIN_TTL,
      });
    } catch (err) {
      console.error('[mod-bot] could not fetch admins:', err.message);
      // Fail open on the lookup but closed on the exemption: if we can't tell
      // who the admins are, moderate normally rather than stop moderating.
      return false;
    }
  }
  return adminCache.get(key).ids.has(String(userId));
}

// ── Member records ───────────────────────────────────────────────────────────

/**
 * Fetch-or-create the member row. This is the bot "knowing" each user:
 * strikes, verification state and activity all hang off it.
 */
async function getMember(user, chatId) {
  const telegram_id = String(user.id);

  const { data: existing } = await supabase
    .from('tg_members').select('*').eq('telegram_id', telegram_id).maybeSingle();

  if (existing) {
    // Display names change; keep the record current so the owner can find people.
    const patch = {};
    if (existing.username !== (user.username || null)) patch.username = user.username || null;
    if (existing.first_name !== (user.first_name || null)) patch.first_name = user.first_name || null;
    patch.last_seen = new Date().toISOString();
    supabase.from('tg_members').update(patch).eq('telegram_id', telegram_id)
      .then(({ error }) => error && console.error('[mod-bot] member update:', error.message));
    return existing;
  }

  const row = {
    telegram_id,
    chat_id:    chatId ? String(chatId) : null,
    username:   user.username   || null,
    first_name: user.first_name || null,
    warnings:   0,
    verified_at: null,
    joined_at:  new Date().toISOString(),
    last_seen:  new Date().toISOString(),
  };
  const { data, error } = await supabase.from('tg_members').insert(row).select().single();
  if (error) {
    console.error('[mod-bot] member insert:', error.message);
    return row; // degrade gracefully — moderation still works without persistence
  }
  return data;
}

const notifyOwners = (html) => {
  for (const id of OWNER_IDS) sendMessageQuiet(TOKEN, id, html);
};

// ── 1. The door ──────────────────────────────────────────────────────────────

async function handleNewMembers(msg) {
  const chatId = msg.chat.id;

  for (const user of msg.new_chat_members || []) {
    if (user.is_bot) continue;

    await getMember(user, chatId);

    // Mute first, ask questions after. An unverified member cannot post.
    await restrictMember(TOKEN, chatId, user.id, MUTED);

    await sendMessageQuiet(TOKEN, chatId,
      `Welcome ${esc(user.first_name || 'friend')}. 🌹\n\n${RULES_TEXT}\n\n` +
      `<b>You can't post yet.</b> Tap below to confirm you're 18 or older and accept the rules.`,
      {
        reply_markup: {
          inline_keyboard: [[
            { text: '✅ I am 18+ and I accept the rules', callback_data: `verify:${user.id}` },
          ]],
        },
      });
  }
}

async function handleVerifyCallback(cb) {
  const targetId = cb.data.split(':')[1];
  const tapperId = String(cb.from.id);

  // Only the new member can verify themselves — otherwise anyone already in
  // the group could wave strangers through.
  if (targetId !== tapperId) {
    return answerCallback(TOKEN, cb.id, 'This button is not for you.', true);
  }

  const chatId = cb.message.chat.id;

  await restrictMember(TOKEN, chatId, tapperId, UNMUTED);
  await supabase.from('tg_members')
    .update({ verified_at: new Date().toISOString() })
    .eq('telegram_id', tapperId);

  await answerCallback(TOKEN, cb.id, 'Verified — you can post now. Welcome!');
  await deleteMessage(TOKEN, chatId, cb.message.message_id);

  await sendMessageQuiet(TOKEN, chatId,
    `${esc(cb.from.first_name || 'A new member')} is in. 🎀 Say hello.`);

  // The perks offer lands in DM, not in the group — and only if they've ever
  // opened a chat with the bot. Telegram blocks unsolicited DMs otherwise,
  // which is exactly the right default.
  sendMessageQuiet(TOKEN, tapperId,
    `Welcome to House of Moo. 🌹\n\n` +
    `Members get early access to new stories and a standing discount on the shop.\n\n` +
    `Tap /perks if you'd like yours.`);
}

// ── 2. The floor ─────────────────────────────────────────────────────────────

async function handleGroupMessage(msg) {
  const chatId = msg.chat.id;
  const user   = msg.from;
  const text   = msg.text || msg.caption || '';

  if (!user || user.is_bot) return;
  if (await isAdmin(chatId, user.id)) return; // owner and group admins are exempt

  const member = await getMember(user, chatId);
  const rule   = evaluate(text);
  if (!rule) return;

  await deleteMessage(TOKEN, chatId, msg.message_id);

  const excerpt = text.slice(0, 300);
  supabase.from('tg_warnings').insert({
    telegram_id: String(user.id),
    chat_id:     String(chatId),
    rule:        rule.id,
    severity:    rule.tier,
    message_excerpt: excerpt,
  }).then(({ error }) => error && console.error('[mod-bot] warning insert:', error.message));

  // ── Instant removal tier ──
  if (rule.tier === 'remove') {
    await banMember(TOKEN, chatId, user.id);
    await supabase.from('tg_members')
      .update({ banned_at: new Date().toISOString(), ban_reason: rule.id })
      .eq('telegram_id', String(user.id));

    sendMessageQuiet(TOKEN, user.id, rule.notice);

    notifyOwners(
      `🚫 <b>Removed and banned</b>\n\n` +
      `${esc(user.first_name)}${user.username ? ` (@${esc(user.username)})` : ''} — <code>${user.id}</code>\n` +
      `Rule: <b>${esc(rule.label)}</b>\n\n<i>${esc(excerpt)}</i>`);
    return;
  }

  // ── Warning ladder ──
  const strikes = (member.warnings || 0) + 1;
  await supabase.from('tg_members')
    .update({ warnings: strikes }).eq('telegram_id', String(user.id));

  if (strikes >= BAN_STRIKES) {
    await banMember(TOKEN, chatId, user.id);
    await supabase.from('tg_members')
      .update({ banned_at: new Date().toISOString(), ban_reason: 'strikes' })
      .eq('telegram_id', String(user.id));
    sendMessageQuiet(TOKEN, user.id, 'You have been removed from House of Moo after repeated rule breaks.');
    notifyOwners(`🚫 <b>Banned on strikes</b>\n\n${esc(user.first_name)} — <code>${user.id}</code>\nLast rule: ${esc(rule.label)}`);
    return;
  }

  if (strikes >= MUTE_STRIKES) {
    const until = Math.floor(Date.now() / 1000) + MUTE_HOURS * 3600;
    await restrictMember(TOKEN, chatId, user.id, MUTED, until);
    await supabase.from('tg_members')
      .update({ muted_until: new Date(until * 1000).toISOString() })
      .eq('telegram_id', String(user.id));

    await sendMessageQuiet(TOKEN, chatId,
      `${esc(user.first_name)} is muted for ${MUTE_HOURS} hours — strike ${strikes}. Reason: ${esc(rule.label)}.`);
    sendMessageQuiet(TOKEN, user.id, `${rule.notice}\n\nThat's strike ${strikes}, so you're muted for ${MUTE_HOURS} hours.`);
    notifyOwners(`🔇 <b>Muted ${MUTE_HOURS}h</b>\n\n${esc(user.first_name)} — <code>${user.id}</code>\nStrike ${strikes}: ${esc(rule.label)}`);
    return;
  }

  // First or second strike — public, brief, then the detail in DM.
  await sendMessageQuiet(TOKEN, chatId,
    `${esc(user.first_name)}, that broke a rule (${esc(rule.label)}). Strike ${strikes} of ${MUTE_STRIKES}.`);
  sendMessageQuiet(TOKEN, user.id, `${rule.notice}\n\nThat's strike ${strikes} of ${MUTE_STRIKES}.`);
}

// ── 3. The list (opt-in, private chat only) ──────────────────────────────────

async function handlePerks(chatId, user) {
  await getMember(user, null);

  await sendMessage(TOKEN, chatId,
    `<b>Member perks</b> 🎀\n\n` +
    `Share your phone number and email and you'll get:\n` +
    `• <b>${esc(PERK_CODE)}</b> — a standing discount at houseofmoo.shop\n` +
    `• First look at new stories and new stock\n` +
    `• Members-only offers we don't post publicly\n\n` +
    `We'll use your details to send you offers from House of Moo, and nothing else — ` +
    `we don't sell or pass them on. Send /forgetme any time and we delete them.\n\n` +
    `Tap the button to share your number:`,
    {
      reply_markup: {
        keyboard: [[{ text: '📱 Share my number', request_contact: true }]],
        resize_keyboard: true, one_time_keyboard: true,
      },
    });
}

async function handleContactShared(chatId, msg) {
  const contact = msg.contact;

  // Telegram lets a user forward someone else's contact card. Only accept a
  // number the sender owns — otherwise the list fills with third parties who
  // never agreed to anything.
  if (String(contact.user_id) !== String(msg.from.id)) {
    return sendMessage(TOKEN, chatId,
      'Please share your own number using the button, not someone else\'s contact.');
  }

  await upsertLead(msg.from, { phone: contact.phone_number });

  await sendMessage(TOKEN, chatId,
    `Got it, thank you. 🌹\n\nNow send me your email address and your ` +
    `<b>${esc(PERK_CODE)}</b> discount is active.`,
    { reply_markup: { remove_keyboard: true } });
}

async function handlePossibleEmail(chatId, user, text) {
  const match = text.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
  if (!match) return false;

  const { data: lead } = await supabase
    .from('tg_leads').select('id').eq('telegram_id', String(user.id)).maybeSingle();

  // Only treat a bare email as a perks sign-up if they already started the
  // flow. Otherwise someone just happened to mention an address.
  if (!lead) return false;

  await upsertLead(user, { email: match[0] });

  await sendMessage(TOKEN, chatId,
    `You're all set. 🎀\n\nYour code is <b>${esc(PERK_CODE)}</b> — use it at ` +
    `https://houseofmoo.shop\n\nSend /forgetme any time to have your details deleted.`);

  notifyOwners(
    `⭐️ <b>New member on the list</b>\n\n` +
    `${esc(user.first_name)}${user.username ? ` (@${esc(user.username)})` : ''}\n` +
    `<code>${user.id}</code>`);
  return true;
}

async function upsertLead(user, patch) {
  const telegram_id = String(user.id);
  const { data: existing } = await supabase
    .from('tg_leads').select('id').eq('telegram_id', telegram_id).maybeSingle();

  const row = {
    telegram_id,
    username:   user.username   || null,
    first_name: user.first_name || null,
    consent_at: new Date().toISOString(),
    source:     'telegram-perks',
    ...patch,
  };

  const q = existing
    ? supabase.from('tg_leads').update(row).eq('telegram_id', telegram_id)
    : supabase.from('tg_leads').insert(row);

  const { error } = await q;
  if (error) console.error('[mod-bot] lead upsert:', error.message);
}

/**
 * Deletion on request. Not optional garnish — a list you can't be removed from
 * is the kind that generates spam reports, which is how this whole migration
 * started. It also keeps her the right side of the NDPA.
 */
async function handleForgetMe(chatId, user) {
  const { error } = await supabase
    .from('tg_leads').delete().eq('telegram_id', String(user.id));
  if (error) {
    console.error('[mod-bot] forgetme:', error.message);
    return sendMessage(TOKEN, chatId, 'Something went wrong — please message us and we\'ll remove your details by hand.');
  }
  return sendMessage(TOKEN, chatId,
    'Done — your phone number and email have been deleted. You\'re still welcome in the group.');
}

// ── Owner tools ──────────────────────────────────────────────────────────────

async function handleOwnerCommand(chatId, text) {
  if (text.startsWith('/stats')) {
    const countOf = async (table, build = (q) => q) => {
      const { count } = await build(supabase.from(table).select('*', { count: 'exact', head: true }));
      return count || 0;
    };
    const [members, verified, banned, leads, warnings] = await Promise.all([
      countOf('tg_members'),
      countOf('tg_members', q => q.not('verified_at', 'is', null)),
      countOf('tg_members', q => q.not('banned_at', 'is', null)),
      countOf('tg_leads'),
      countOf('tg_warnings'),
    ]);
    return sendMessage(TOKEN, chatId,
      `<b>Group stats</b>\n\n` +
      `Members known: <b>${members}</b>\nVerified 18+: <b>${verified}</b>\n` +
      `Banned: <b>${banned}</b>\nWarnings issued: <b>${warnings}</b>\n\n` +
      `<b>On the marketing list: ${leads}</b>`);
  }

  if (text.startsWith('/list')) {
    const { data } = await supabase
      .from('tg_leads').select('first_name, username, phone, email, consent_at')
      .order('consent_at', { ascending: false }).limit(50);

    if (!data || !data.length) return sendMessage(TOKEN, chatId, 'Nobody on the list yet.');

    const lines = data.map(l =>
      `• ${esc(l.first_name || '—')}${l.username ? ` (@${esc(l.username)})` : ''}\n  ${esc(l.phone || 'no phone')} · ${esc(l.email || 'no email')}`
    ).join('\n');
    return sendMessage(TOKEN, chatId, `<b>Latest ${data.length} sign-ups</b>\n\n${lines}`);
  }

  if (text.startsWith('/rules')) {
    return sendMessage(TOKEN, chatId, RULES_TEXT);
  }
  return null;
}

// ── Entry point ──────────────────────────────────────────────────────────────

async function handleUpdate(update) {
  if (update.callback_query) {
    const cb = update.callback_query;
    if (cb.data && cb.data.startsWith('verify:')) return handleVerifyCallback(cb);
    return;
  }

  const msg = update.message;
  if (!msg) return;

  // Someone joined the group.
  if (msg.new_chat_members) return handleNewMembers(msg);

  const isPrivate = msg.chat.type === 'private';
  const chatId    = msg.chat.id;
  const text      = (msg.text || '').trim();

  if (isPrivate) {
    if (msg.contact) return handleContactShared(chatId, msg);

    if (text.startsWith('/start')) {
      return sendMessage(TOKEN, chatId,
        `Hi ${esc(msg.from.first_name || 'there')}. 🌹\n\n` +
        `I look after the House of Moo community.\n\n` +
        `/rules — the house rules\n/perks — member discount and early access\n/forgetme — delete my details`);
    }
    if (text.startsWith('/perks'))    return handlePerks(chatId, msg.from);
    if (text.startsWith('/forgetme')) return handleForgetMe(chatId, msg.from);
    if (text.startsWith('/rules'))    return sendMessage(TOKEN, chatId, RULES_TEXT);

    if (isOwner(msg.from.id)) {
      const handled = await handleOwnerCommand(chatId, text);
      if (handled) return;
    }

    if (await handlePossibleEmail(chatId, msg.from, text)) return;

    return sendMessage(TOKEN, chatId,
      'I only handle the community here. Try /rules, /perks or /forgetme.\n\n' +
      'For orders and products, message our shop bot instead.');
  }

  // Group traffic.
  if (GROUP_ID && String(chatId) !== String(GROUP_ID)) return; // ignore other groups
  if (text.startsWith('/rules')) return sendMessage(TOKEN, chatId, RULES_TEXT);

  return handleGroupMessage(msg);
}

module.exports = { handleUpdate, isConfigured: () => Boolean(TOKEN) };
