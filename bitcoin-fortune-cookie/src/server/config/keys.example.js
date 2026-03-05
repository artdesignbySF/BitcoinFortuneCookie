// Example configuration file
// Copy this file to keys.js and fill in your actual values

module.exports = {
  // Lightning Network configuration
  lnd: {
    // LND node connection details
    // Example: { socket: 'localhost:10009', cert: '...', macaroon: '...' }
  },

  // MongoDB configuration
  mongodb: {
    // MongoDB connection URI
    // Example: 'mongodb://username:password@localhost:27017/bitcoin-fortune-cookie'
    uri: "mongodb://localhost:27017/bitcoin-fortune-cookie",
  },

  // Twitter API configuration
  twitter: {
    consumer_key: "YOUR_CONSUMER_KEY_HERE",
    consumer_secret: "YOUR_CONSUMER_SECRET_HERE",
    access_token_key: "YOUR_ACCESS_TOKEN_KEY_HERE",
    access_token_secret: "YOUR_ACCESS_TOKEN_SECRET_HERE",
  },
};
