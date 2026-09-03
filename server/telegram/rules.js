// ─────────────────────────────────────────────────────────────────────────────
// House of Moo community — the ruleset.
//
// Kept separate from the moderation engine so the rules can be tuned without
// touching the logic that enforces them. Order matters: the first rule that
// matches wins, so `remove` rules are listed before `warn` rules.
//
// Three tiers:
//   remove  — delete, ban immediately, alert the owner. No warning ladder.
//             Reserved for content that puts the group and its owner at legal
//             risk. There is no second chance for these.
//   warn    — delete and add a strike. Three strikes mutes, then bans.
//   notice  — leave the message up, quietly nudge the poster in DM.
//
// A note on why the strict rules exist at all: an adult group that lets
// commercial solicitation or anything involving minors run gets mass-reported
// and killed by Telegram — the same way the business WhatsApp number was
// killed. Enforcement here is what keeps the group alive.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sexualised references to minors. Immediate ban, no warning, owner alerted.
 * This is the one category where a false positive is an acceptable price.
 */
const MINOR_TERMS = /\b(jail\s?bait|jailbait|lolita|underage|under\s?age|preteen|pre-?teen|minor girl|minor boy|school\s?girl|school\s?boy|teen(?:age)?\s?(?:girl|boy)\s?(?:nude|naked|sex)|cp\b|child\s?p)/i;

/**
 * An age below 18 stated near sexual language. Catches "15yo looking for fun"
 * that the term list above would miss.
 */
const UNDERAGE_AGE = /\b(?:1[0-7]|[1-9])\s*(?:yo\b|y\/o\b|yrs?\b|years?\s*old)/i;
const SEXUAL_CONTEXT = /\b(sex|nude|naked|horny|hookup|hook\s?up|fuck|dick|pussy|boobs|ass|daddy|mommy|sugar|dm me|link up)/i;

/** Contact details posted publicly — someone else's, or their own into a scam. */
const PHONE_IN_PUBLIC = /(?:\+?234|0)[\s-]?[789]\d{2}[\s-]?\d{3}[\s-]?\d{4}\b/;
const EMAIL_IN_PUBLIC = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;

/** Commercial sex solicitation — rates, bookings, pay-per-meet. */
const SOLICITATION = /\b(?:my\s+rate|rates?\s+(?:are|is|start)|per\s+(?:night|hour|shot|round)|short\s?time|full\s?night|pay\s+(?:me|before)|sponsor\s+me|book\s+me|hookup\s+for\s+(?:cash|money|pay)|runs?\s+girl|ashawo|escort|\bincall\b|\boutcall\b|price\s?list)/i;

/** Crypto / investment / forex scams — the usual Telegram group parasites. */
const SCAM = /\b(?:forex|binary\s?option|crypto\s?(?:invest|signal|trade)|bitcoin\s?(?:invest|double)|usdt\s?(?:invest|flip)|money\s?doubl|invest(?:ment)?\s+(?:plan|scheme)|guaranteed\s+(?:profit|returns?)|\broi\b\s*\d|earn\s+\d+[kx]\s+(?:daily|weekly)|whatsapp\s+group\s+link)/i;

/** Invite links to other groups/channels — poaching. */
const FOREIGN_INVITE = /(?:t\.me\/(?:joinchat\/|\+)|chat\.whatsapp\.com\/|discord\.gg\/)/i;

/** Slurs. Not an exhaustive list; the report path covers the rest. */
const SLURS = /\b(?:faggot|f4ggot|n[i1]gg[e3]r|tranny|retard(?:ed)?)\b/i;

const RULES = [
  {
    id: 'minors',
    tier: 'remove',
    label: 'Sexual content involving minors',
    test: (text) =>
      MINOR_TERMS.test(text) || (UNDERAGE_AGE.test(text) && SEXUAL_CONTEXT.test(text)),
    notice:
      'You have been removed and permanently banned. Any sexual reference to a minor ' +
      'is reported and is never permitted here.',
  },
  {
    id: 'solicitation',
    tier: 'remove',
    label: 'Commercial sex solicitation',
    test: (text) => SOLICITATION.test(text),
    notice:
      'Your message was removed. This group is for stories and conversation between ' +
      'consenting adults — advertising paid services is not allowed and puts the whole ' +
      'group at risk of being shut down.',
  },
  {
    id: 'slurs',
    tier: 'warn',
    label: 'Slurs / hate speech',
    test: (text) => SLURS.test(text),
    notice: 'Your message was removed for hate speech. Keep it respectful.',
  },
  {
    id: 'scam',
    tier: 'warn',
    label: 'Investment / crypto scam',
    test: (text) => SCAM.test(text),
    notice: 'Your message was removed. No investment, forex or crypto promotion here.',
  },
  {
    id: 'poaching',
    tier: 'warn',
    label: 'Link to another group',
    test: (text) => FOREIGN_INVITE.test(text),
    notice: 'Your message was removed. Please don\'t post invite links to other groups.',
  },
  {
    id: 'contact-in-public',
    tier: 'warn',
    label: 'Phone number or email posted publicly',
    test: (text) => PHONE_IN_PUBLIC.test(text) || EMAIL_IN_PUBLIC.test(text),
    notice:
      'Your message was removed because it contained a phone number or email address. ' +
      'Posting contact details in an open group gets them scraped and resold — ' +
      'share them in a private chat instead. Yours or anyone else\'s.',
  },
];

/**
 * Returns the first matching rule, or null.
 * Messages from admins are checked by the caller, not here.
 */
function evaluate(text) {
  if (!text) return null;
  for (const rule of RULES) {
    try {
      if (rule.test(text)) return rule;
    } catch (err) {
      console.error(`[rules] rule "${rule.id}" threw:`, err.message);
    }
  }
  return null;
}

/** Plain-language rules, posted to every new member at the door. */
const RULES_TEXT = [
  '<b>House of Moo — house rules</b>',
  '',
  '1. <b>18+ only.</b> This group contains adult content. If you are under 18, leave now.',
  '2. <b>Consenting adults only.</b> Any sexual reference to a minor is an instant, permanent ban and is reported.',
  '3. <b>No selling sex.</b> No rates, no bookings, no paid meet-ups. This is what gets groups shut down.',
  '4. <b>No phone numbers or emails in the group.</b> Share them privately. Open groups get scraped.',
  '5. <b>No scams</b> — no forex, crypto, investment schemes or "double your money".',
  '6. <b>No invite links</b> to other groups or channels.',
  '7. <b>No hate speech</b> or slurs.',
  '8. <b>Respect a no.</b> Nobody owes you a reply, a picture, or a meeting.',
  '',
  '<i>Three strikes mutes you for 24 hours. Rules 2 and 3 are removal on the first offence.</i>',
].join('\n');

module.exports = { evaluate, RULES, RULES_TEXT };
