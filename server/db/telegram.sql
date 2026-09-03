-- ────────────────────────────────────────────────────────────────────────────
-- House of Moo — Telegram tables (Supabase / Postgres)
--
-- RUN THIS IN THE SUPABASE SQL EDITOR before the bots go live.
-- Dashboard → SQL Editor → New query → paste → Run.
--
-- Safe to re-run: every statement is IF NOT EXISTS.
-- ────────────────────────────────────────────────────────────────────────────

-- ── Storefront bot ──────────────────────────────────────────────────────────
-- Lets the shop bot remember which Telegram chat placed which order, so the
-- owner can reply to a customer later without hunting through the chat list.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT;


-- ── Community members ───────────────────────────────────────────────────────
-- One row per person the moderator bot has ever seen. This is the bot
-- "knowing" each user: strikes, 18+ verification and ban state live here.
CREATE TABLE IF NOT EXISTS tg_members (
  id           BIGSERIAL PRIMARY KEY,
  telegram_id  TEXT UNIQUE NOT NULL,
  chat_id      TEXT,
  username     TEXT,
  first_name   TEXT,

  -- Set when they tap "I am 18+ and I accept the rules". Null means they are
  -- still muted at the door and have never been able to post.
  verified_at  TIMESTAMPTZ,

  warnings     INTEGER NOT NULL DEFAULT 0,
  muted_until  TIMESTAMPTZ,
  banned_at    TIMESTAMPTZ,
  ban_reason   TEXT,

  joined_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tg_members_telegram ON tg_members(telegram_id);
CREATE INDEX IF NOT EXISTS idx_tg_members_banned   ON tg_members(banned_at);


-- ── Moderation log ──────────────────────────────────────────────────────────
-- Every deletion, with the rule that fired and an excerpt of what was posted.
-- Kept as an audit trail: if a member disputes a ban, or if a rule is firing
-- too eagerly, this is the evidence.
CREATE TABLE IF NOT EXISTS tg_warnings (
  id              BIGSERIAL PRIMARY KEY,
  telegram_id     TEXT NOT NULL,
  chat_id         TEXT,
  rule            TEXT NOT NULL,
  severity        TEXT NOT NULL,
  message_excerpt TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tg_warnings_user    ON tg_warnings(telegram_id);
CREATE INDEX IF NOT EXISTS idx_tg_warnings_created ON tg_warnings(created_at);


-- ── Marketing list ──────────────────────────────────────────────────────────
-- Contact details members volunteered in a private chat in exchange for perks.
--
-- consent_at is not decoration. Telegram will not hand over a phone number
-- unless the user taps "Share contact" themselves, and never exposes an email
-- at all — so every row here was deliberately given. Recording when, and
-- honouring /forgetme by deleting the row, is what keeps this list usable
-- rather than the kind of scraped list that generates spam reports.
CREATE TABLE IF NOT EXISTS tg_leads (
  id           BIGSERIAL PRIMARY KEY,
  telegram_id  TEXT UNIQUE NOT NULL,
  username     TEXT,
  first_name   TEXT,
  phone        TEXT,
  email        TEXT,
  source       TEXT DEFAULT 'telegram-perks',
  notes        TEXT,
  consent_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tg_leads_consent ON tg_leads(consent_at);


-- ── Lock the new tables down ────────────────────────────────────────────────
-- The server talks to Supabase with the service key, which bypasses RLS. These
-- policies exist so that if the anon/publishable key is ever used against these
-- tables — from the browser, say — it gets nothing. Members' phone numbers and
-- emails must never be reachable from the front end.
ALTER TABLE tg_members  ENABLE ROW LEVEL SECURITY;
ALTER TABLE tg_warnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tg_leads    ENABLE ROW LEVEL SECURITY;
-- No policies are created, so anon access is denied by default.
