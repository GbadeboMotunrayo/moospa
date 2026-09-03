# House of Moo — Telegram Bots: Architecture & Build Plan

*Drafted 12 August 2026*

---

## 1. Why this exists

The business ran on WhatsApp. One number was hacked. Its replacement
(2348106393774) was banned — a spike in order volume from a personal number
reads to WhatsApp's classifiers as spam, and there is no appeal that works.

Telegram is the migration target for one structural reason: **bots are built to
receive volume.** A bot account cannot be banned for being popular the way a
personal number can. Everything below follows from that.

Three bots, three separate BotFather tokens, one Express process:

| Bot | Job | Blast radius if it dies |
| --- | --- | --- |
| **Shop bot** | Checkout hand-off, payment, order chat | Revenue stops |
| **Mod bot** | Group door, rule enforcement, member list | Group unmoderated |
| **Stories bot** | Adult fiction library + AI generation | Engagement stops |

They are separate on purpose. The stories bot carries the highest reporting
risk of the three (it distributes adult content on request). If it is ever
restricted, **checkout must keep working.** That isolation is the single most
important architectural decision here, and it is why we do not consolidate into
one bot despite the UX cost of three separate chats.

---

## 2. Current state

### Already built (uncommitted, in `server/telegram/`)

- **`shop-bot.js`** — Bot #3, substantially complete. Storefront writes the
  order to Supabase, opens `t.me/<bot>?start=MOO-1234-ABCDE`; the bot resolves
  the reference server-side and posts the real order — so the summary can't be
  edited in transit. Quotes bank transfer details, notifies owners, records
  `telegram_chat_id` against the order. Degrades to "paste your order" if
  Supabase was unreachable at checkout.
- **`mod-bot.js` + `rules.js`** — Bot #1's *moderation* half. Mute-on-arrival
  18+ gate with a self-serve verify button, seven rules across three tiers
  (`remove` / `warn` / `notice`), a 3-strikes→mute-24h→ban ladder, an opt-in
  perks flow capturing phone + email, `/forgetme`, and owner `/stats` `/list`.
- **`api.js`** — dependency-free Bot API client with HTML escaping and a
  fire-and-forget variant, so a failed owner notification never causes Telegram
  to redeliver the customer's message.
- **`routes/telegram.js`** — webhook endpoints with secret-token verification,
  mounted *before* the rate limiter (200/15min would throttle a busy group, and
  a throttled webhook is a message Telegram retries in a loop).
- **`db/telegram.sql`** — `tg_members`, `tg_warnings`, `tg_leads`, RLS on.
- **`scripts/setup-telegram.js`** — idempotent webhook registration.
- **Frontend** — `src/config/contact.js` is the single source of truth for every
  chat link; WhatsApp is off behind `WHATSAPP_ENABLED = false`.

### Missing

1. **Stories bot** — does not exist. No file, no table.
2. **The selling half of the mod bot** — it builds a list but cannot sell to it.
3. **Deployment** — no Telegram keys in `.env`, `telegram.sql` never run,
   webhooks unregistered, none of it committed.

---

## 3. Two platform constraints that shape the design

### 3.1 A bot cannot DM someone first

Telegram will not deliver a bot message to a user who has never opened a chat
with **that specific bot**. This is not a setting; it is the platform.

Consequences:

- "Sell to them personally" can only reach members who have DM'd a bot.
- Each bot has its **own** reachability. A member who DM'd the stories bot is
  *not* reachable by the mod bot.
- Therefore the pitch engine must **route across bots** — see §5.

This also means the stories bot is quietly the most valuable sales channel we
have, because it is the one members have the strongest reason to open a DM
with. Every stories reader becomes a reachable customer.

### 3.2 iOS hides adult content by default

Apple's App Store rules forbid Telegram from exposing a "disable filtering"
toggle inside the iOS app. iPhone members will hit a sensitive-content wall.
The fix exists — change the setting once on Telegram **Web**, and it syncs to
all devices including the phone — but they have to be told.

**Mitigation:** the stories bot's first-run message includes a short, plain
walkthrough of the web toggle. Without it, a meaningful share of an iPhone-heavy
Lagos audience simply sees nothing and assumes the bot is broken.

Sources:
[techygeekshome](https://techygeekshome.info/disable-telegram-sensitive-filtering/),
[fansgurus](https://fansgurus.com/blog/how-to-remove-telegram-limitations)

---

## 4. Bot #2 — Stories

**Monetization: none.** Stories are free. They exist to keep the group warm and
to open DM channels that the shop can sell through. This removes the entire
Telegram Stars / digital-goods payment surface from scope — a large simplification.

### 4.1 Three content sources, one pipeline

All three requested sources feed the same `tg_stories` table and differ only in
how a row gets to `status = 'published'`.

```
                    ┌──────────────────┐
  She writes  ─────▶│                  │
                    │   tg_stories     │──▶ published ──▶ served to members
  AI drafts   ─────▶│  (draft →        │
  (/draft)          │   pending →      │
                    │   published)     │
  Member asks ─────▶│                  │
  (/imagine)        └──────────────────┘
                             │
                     safety gate on
                     prompt AND output
```

**a. Curated library.** She adds stories through the admin panel (not through
chat — composing a 2,000-word story in a Telegram message box is miserable).
Immediately published.

**b. AI on demand (`/imagine <prompt>`).** Member describes what they want, bot
generates and serves it straight away. Rate-limited per member per day. Every
generation is *also* written to `tg_stories` as `pending` — the good ones get
approved into the permanent library, so the collection grows from real demand
rather than guesswork.

**c. AI drafts for approval (`/draft <theme>`).** Admin-only. Generates into the
approval queue for her to edit and publish. This is how the library gets bulk
without her writing every word.

### 4.2 The safety gate — non-negotiable

An LLM writing adult fiction to an arbitrary user prompt is the largest legal
and platform risk in this entire project. One generated story referencing a
minor ends the business, permanently, and no amount of "the AI did it" helps.

Every AI path runs a hard gate:

1. **Prompt check** — run the member's prompt through `rules.js` `evaluate()`.
   A `remove`-tier match (the `minors` rule especially) is refused, logged to
   `tg_warnings`, and the owner is alerted. Repeat offenders are banned from the
   stories bot and flagged to the mod bot.
2. **Output check** — run the generated text through the same evaluator before
   a single character reaches the member. A match discards the output silently
   and logs it for tuning.
3. **System prompt** — hard constraints on the generation call: adults only,
   explicitly named ages 18+, no real public figures, no non-consent framing.
4. **Never serve unreviewed AI output twice.** On-demand output is ephemeral to
   the requester and `pending` in the library until she approves it.

Reusing `rules.js` is deliberate — one ruleset, tuned in one place, enforced on
group messages and AI output alike.

### 4.3 Serving

- Telegram caps a message at 4,096 characters. Long stories are chunked and
  paginated with a `Continue ▸` inline button, which also gives us a read-depth
  signal for free.
- `/story` random · `/story <category>` · `/series` for multi-part · `/latest`
- **Daily drop** — one story pushed each evening to opted-in readers. This is
  the retention mechanism and the reason DM channels stay open.
- Independent 18+ gate. Shares `tg_members.verified_at` with the mod bot, so a
  member who verified at the group door doesn't verify twice.

### 4.4 New tables

```sql
tg_stories    (id, title, body, category, tags[], source, status,
               requested_by, approved_by, read_count, created_at, published_at)
tg_story_reads(id, telegram_id, story_id, depth, read_at)
tg_ai_log     (id, telegram_id, prompt, verdict, rule_hit, created_at)
```

---

## 5. The selling engine — all three modes, admin-gated

Lives in `telegram/pitch.js`, shared by all three bots. Every mode is
individually switchable from `tg_settings` so she can turn any of it off
without a redeploy.

### 5.1 Reachability routing

New table `tg_contacts (telegram_id, bot, first_dm_at, last_dm_at, opted_out)`
— one row per (member, bot) pair, written whenever anyone DMs any bot.

`reach(telegram_id)` returns which bot token can actually deliver. She issues a
pitch from wherever she is; the engine picks the channel that works. Without
this, half her pitches silently fail and she has no idea which.

### 5.2 Mode A — one-to-one pitch

```
/pitch @username massage-oil
/pitch 123456789 "the rose set, ₦18,500, two left"
```

Bot resolves the product from Supabase, composes a card (photo, name, price,
one line of copy), and attaches a deep link:

```
t.me/HouseOfMooBot?start=p_<productId>_<pitchId>
```

This requires a **small extension to the shop bot**: `handleStart` currently
only understands order references. It needs to also recognise a `p_` payload,
show the product, and start a one-tap order. That extension is worth building
regardless — it turns every product link anywhere into a checkout.

### 5.3 Mode B — broadcast

```
/broadcast massage-oil
/broadcast text "Restocked tonight. MOOVIP still works."
```

Fans out to everyone reachable and not opted out. Requirements:

- **Queue table, not a loop.** `tg_broadcasts` + `tg_broadcast_targets`, drained
  by a worker at ~20 messages/second. A naive `for` loop hits Telegram's rate
  limit, gets 429s, and dies halfway through with no record of who received it.
- **Resumable** — the shared host idles the process out; the queue must survive
  a restart.
- **Preview and confirm** before send. She sees the exact message and the
  recipient count, and taps to confirm.
- **`/nooffers`** opt-out, separate from `/forgetme`. Someone who wants stories
  but not sales pitches should be able to say so and stay.

### 5.4 Mode C — autonomous nudge

Off by default. `/autosell on`.

Intent detection on DM free text — regex first, not an LLM call. Phrases like
*how much*, *do you have*, *where can I buy*, *is it available*, plus product
name matching against the catalog. On a hit, the bot replies with the product
card instead of just forwarding the message to her.

Guard rails: one nudge per member per 48h, never during quiet hours, and always
falls back to forwarding to her if confidence is low. The failure mode to avoid
is a bot that pesters — that costs more in unsubscribes than it earns.

### 5.5 Attribution

Every pitch writes to `tg_pitches (id, telegram_id, product_id, mode, bot,
sent_at, clicked_at, order_reference)`. The deep-link payload carries
`pitchId`, so when the shop bot resolves an order it can close the loop.

This is what makes the feature evaluable rather than a matter of opinion. If
one-to-one pitches convert at 20% and broadcasts at 0.4%, that is worth knowing
before deciding where her time goes.

### 5.6 Two rules that apply to all outbound

- **Quiet hours** — nothing sends 23:00–07:00 WAT. Queued, not dropped.
- **Every outbound message carries an opt-out line.** Cheaper than a report.

---

## 6. Admin surface

Bot commands are the wrong tool for most of this. The existing React admin
panel (`src/MooProductManager.jsx`) gets a **Telegram tab**:

- Story library — write, edit, publish; approval queue for AI drafts and the
  best `/imagine` output
- Members and leads — searchable, exportable, with strike history
- Broadcast composer — preview, recipient count, schedule, send
- Pitch history with conversion
- Settings toggles — autosell, daily drop, quiet hours

Bot commands stay for the things that genuinely suit chat: `/pitch` while she's
already reading a conversation, `/stats`, `/rules`.

---

## 7. Sequencing

**Phase 0 — Ship what already exists. Nothing else matters first.**
Create the three bots in @BotFather, fill the Telegram block in `server/.env`,
run `db/telegram.sql` in the Supabase SQL editor, register webhooks, test
end-to-end, **commit** (it's all currently untracked). Checkout on Telegram is
replacing a dead WhatsApp line — every day it isn't live is lost revenue, and
it is already written.

**Phase 1 — Shared foundation.**
`tg_contacts` + reachability routing, `tg_settings`, `catalog.js`, and the shop
bot's `p_` deep-link handler.

**Phase 2 — Stories bot v1.**
Library, serving, pagination, 18+ gate, iOS explainer, daily drop. No AI yet —
prove the reading loop works before adding a generation bill.

**Phase 3 — AI generation.**
Safety gate first, then `/draft`, then `/imagine`. In that order, deliberately:
the gate must exist before anything can generate.

**Phase 4 — Selling engine.**
`/pitch`, then the broadcast queue, then autosell.

**Phase 5 — Admin panel Telegram tab.**

---

## 8. Open questions

1. **Which model for generation, and what's the monthly ceiling?** `/imagine`
   is uncapped demand against a metered API. Needs a hard spend cap and a
   per-member daily limit from day one.
2. **Is the group the same audience as the shop?** If group members mostly want
   free stories and never buy, the pitch engine's ROI is thin and Phase 4
   should be deferred behind Phase 5.
3. **Who is `TELEGRAM_OWNER_IDS`?** Just her, or staff too? Staff access changes
   what `/list` should expose — it prints customer phone numbers.
4. **Story voice.** Her own writing, or a house style? Worth capturing two or
   three samples before the AI prompt is written, so generated work doesn't
   read like a different author.
