const { finalizeEvent, nip19 } = require('nostr-tools');
const { Relay } = require('nostr-tools/relay');
const keys = require('./config/keys');

// Public relays to publish to
const RELAYS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.nostr.band',
  'wss://nostr.mom',
];

// Decode the nsec lazily so a missing/placeholder key doesn't crash startup.
let secretKey = null;
const getSecretKey = () => {
  if (secretKey) return secretKey;
  const nsec = keys.nostr && keys.nostr.nsec;
  if (!nsec || !nsec.startsWith('nsec1') || nsec.includes('replace')) {
    return null;
  }
  try {
    const decoded = nip19.decode(nsec);
    secretKey = decoded.data;
    return secretKey;
  } catch (err) {
    console.log('Nostr: failed to decode nsec —', err.message);
    return null;
  }
};

const publishFortuneCookie = async ({ recipient, sender, fortune, isCustom }) => {
  const sk = getSecretKey();
  if (!sk) {
    console.log('Nostr: no usable nsec configured, skipping publish');
    return null;
  }

  const message = recipient
    ? `🥠 ${recipient} — ${sender} sent you a${isCustom ? ' custom' : ''} Bitcoin fortune cookie!\n\n"${fortune}"\n\nSend one back at bitcoinfortunecookie.com`
    : `🥠 A Bitcoin fortune cookie was opened!\n\n"${fortune}"\n\nGet yours at bitcoinfortunecookie.com`;

  let event;
  try {
    event = finalizeEvent({
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
      content: message,
    }, sk);
  } catch (err) {
    console.log('Nostr: failed to sign event —', err.message);
    return null;
  }

  // Publish to all relays in parallel; never let a relay failure throw.
  await Promise.allSettled(
    RELAYS.map(async (url) => {
      try {
        const relay = await Relay.connect(url);
        await relay.publish(event);
        relay.close();
        console.log(`Nostr: published to ${url}`);
      } catch (err) {
        console.log(`Nostr: failed to publish to ${url} —`, err.message);
      }
    })
  );

  return event.id;
};

module.exports = { publishFortuneCookie };
