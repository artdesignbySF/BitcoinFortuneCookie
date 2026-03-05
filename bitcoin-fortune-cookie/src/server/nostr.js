const { finalizeEvent, nip19 } = require('nostr-tools');
const { Relay } = require('nostr-tools/relay');
const keys = require('./config/keys');

// Decode the nsec to raw bytes
const { data: secretKey } = nip19.decode(keys.nostr.nsec);

// Public relays to publish to
const RELAYS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.nostr.band',
  'wss://nostr.mom',
];

const publishFortuneCookie = async ({ recipient, sender, fortune, isCustom }) => {
  // Build the note text
  const message = recipient
    ? `🥠 @${recipient} — ${sender} sent you a${isCustom ? ' custom' : ''} Bitcoin fortune cookie!\n\n"${fortune}"\n\nSend one back at bitcoinfortunecookie.com`
    : `🥠 A Bitcoin fortune cookie was opened!\n\n"${fortune}"\n\nGet yours at bitcoinfortunecookie.com`;

  const event = finalizeEvent({
    kind: 1,
    created_at: Math.floor(Date.now() / 1000),
    tags: [],
    content: message,
  }, secretKey);

  // Publish to all relays
  const results = await Promise.allSettled(
    RELAYS.map(async (url) => {
      try {
        const relay = await Relay.connect(url);
        await relay.publish(event);
        relay.close();
        console.log(`Published to ${url}`);
      } catch (err) {
        console.log(`Failed to publish to ${url}:`, err.message);
      }
    })
  );

  return event.id;
};

module.exports = { publishFortuneCookie };