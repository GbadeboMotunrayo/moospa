# Telegram setup — House of Moo

The site no longer uses WhatsApp. Checkout now hands orders to a Telegram bot,
and the community group is run by a second bot.

Everything below is free. Telegram charges nothing for bots.

---

## Why two bots

| Bot | Job | Where it lives |
|---|---|---|
| **Shop bot** | Receives orders from checkout, quotes payment details, forwards customer messages | Linked from houseofmoo.shop |
| **Moderator bot** | Runs the community group: 18+ door, rules enforcement, member perks | Inside the group only |

They are deliberately separate. If the group is ever mass-reported and its bot
is banned, **checkout keeps working**. One bot doing both jobs would rebuild the
exact single point of failure that took the WhatsApp number down.

---

## Step 1 — Create the two bots (5 minutes, done once)

You can do this from **your own** Telegram account. A bot has no phone number of
its own, so the client never has to touch BotFather.

> **Ownership can't be transferred later.** BotFather has no handover feature.
> Whoever creates the bots keeps control of them permanently. Decide now.

1. Open Telegram, search **@BotFather**, press Start.
2. Send `/newbot`.
   - Name: `House of Moo`
   - Username: something ending in `bot`, e.g. `HouseOfMooBot`
   - BotFather replies with a **token** like `8123456789:AAF...`. This is a
     password — anyone holding it controls the bot. Never commit it.
3. Send `/newbot` again for the moderator bot.
   - Name: `House of Moo Community`
   - Username: e.g. `MooCommunityBot`
4. Recommended, for the mod bot only — send `/setprivacy`, pick the mod bot,
   choose **Disable**. Without this the bot only sees messages that mention it,
   and it cannot moderate what it cannot see.

## Step 2 — Get the owner's Telegram user ID

The bots DM her when an order arrives or someone is banned. That needs her
numeric ID, not her @username.

1. She opens Telegram and searches **@userinfobot**, presses Start.
2. It replies with a number like `612345678`. That's the value for
   `TELEGRAM_OWNER_IDS`.

You can add several, comma-separated, if more than one person should get alerts.

## Step 3 — Run the database migration

Open the Supabase dashboard → **SQL Editor** → **New query**, paste the whole of
`server/db/telegram.sql`, press **Run**.

It's safe to re-run. It creates `tg_members`, `tg_warnings`, `tg_leads` and adds
one column to `orders`.

## Step 4 — Fill in the environment variables

On the host, edit `.env` (see `.env.example` for the full list):

```
PUBLIC_URL=https://houseofmoo.shop
TELEGRAM_WEBHOOK_SECRET=<generate below>
TELEGRAM_SHOP_BOT_TOKEN=<from BotFather>
TELEGRAM_SHOP_BOT_USERNAME=HouseOfMooBot
TELEGRAM_MOD_BOT_TOKEN=<from BotFather>
TELEGRAM_OWNER_IDS=612345678
TELEGRAM_PERK_CODE=MOOVIP

PAYMENT_BANK_NAME=
PAYMENT_ACCOUNT_NO=
PAYMENT_ACCOUNT_NAME=House of Moo
```

Generate the webhook secret:

```bash
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
```

**Leave the bank fields blank if the details aren't final.** The bot will ask the
customer to hold for details rather than quote an account number that might be
wrong.

## Step 5 — Point the storefront at the right bot username

If the bot username is anything other than `HouseOfMooBot`, rebuild the site
with the real one, otherwise every link on the storefront 404s:

```bash
REACT_APP_TELEGRAM_BOT=YourRealBotName npm run build
```

Then re-sync and re-zip:

```bash
rm -rf server/build && cp -r build server/build
```

## Step 6 — Deploy, then register the webhooks

Upload `houseofmoo-backend.zip` to the host and restart the app. Then, **once
the site is live**:

```bash
node server/scripts/setup-telegram.js
```

Check it took:

```bash
node server/scripts/setup-telegram.js --status
```

You want `url` filled in and no `last error`. To undo:
`node server/scripts/setup-telegram.js --delete`.

## Step 7 — Set up the community group

1. In Telegram: **New Group**, name it, add the moderator bot.
2. Promote the bot to **admin** with these permissions:
   - Delete messages
   - Ban users
   - Restrict members

   Without all three it cannot enforce anything.
3. Post a message in the group, then check the server logs for the chat id
   (a negative number starting `-100`). Put it in `TELEGRAM_GROUP_ID` and
   restart. This stops the bot responding in any other group it's added to.

---

## What the moderator bot does

**At the door** — every new member is muted on arrival and must tap
"I am 18+ and I accept the rules" before they can post. This also blocks
join-spam, which never taps the button.

**On the floor** — every message is checked against `server/telegram/rules.js`:

| Rule | What happens |
|---|---|
| Sexual content involving minors | Deleted, **banned immediately**, owner alerted |
| Commercial sex solicitation (rates, bookings, paid meet-ups) | Deleted, **banned immediately** |
| Slurs / hate speech | Deleted + strike |
| Crypto / forex / investment scams | Deleted + strike |
| Invite links to other groups | Deleted + strike |
| Phone number or email posted publicly | Deleted + strike |

Three strikes = muted 24 hours. Four = banned. Group admins are never moderated.

The two instant-ban rules exist for a business reason as much as an ethical one:
groups that let those run get mass-reported and shut down by Telegram — the same
way the WhatsApp number was lost. Enforcement is what keeps the group alive.

To tune the wording or add terms, edit `server/telegram/rules.js` — the rules are
kept separate from the enforcement logic on purpose.

## How the marketing list works

Members opt in via `/perks` in a **private chat** with the bot. They get a
discount code; she gets their phone and email in the `tg_leads` table.

This is opt-in because Telegram gives no other option: it never exposes emails,
and hands over a phone number only when the user taps "Share contact" themselves.
So there is no scraping route to choose instead — and the upside is that the
resulting list is one she actually owns and can market to without generating the
spam reports that started this whole migration.

Owner commands, in a DM to the moderator bot:

- `/stats` — members, verified, banned, warnings, list size
- `/list` — the 50 most recent sign-ups with phone and email
- `/rules` — the current rules text

Members can send `/forgetme` to have their details deleted.

---

## Test checklist before telling customers

- [ ] `https://houseofmoo.shop/api/telegram/status` shows both bots `true`
- [ ] Place a real test order → the shop bot posts the full summary back
- [ ] The owner's Telegram receives the order alert
- [ ] Join the group with a second account → muted until the button is tapped
- [ ] Post `join my group https://t.me/+test` → deleted, strike issued
- [ ] `/perks` in a DM → share contact → row appears in `tg_leads`
- [ ] `/forgetme` → row disappears

## Rolling back

The storefront falls back to a plain chat link if anything is misconfigured, so
customers are never fully stranded. To stop the bots entirely without touching
the site: `node server/scripts/setup-telegram.js --delete`.
