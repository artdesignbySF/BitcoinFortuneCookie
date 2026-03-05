const keys = require("./config/keys");
const Cookies = require("./models/user-model");
const { publishFortuneCookie } = require('./nostr');
const https = require('https');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
fs = require("fs");
let fortunes = "";
let lnd = null;
let sub = null;

var Filter = require("bad-words"),
  filter = new Filter();

// Process-level error handler for unhandled rejections
process.on('unhandledRejection', (reason) => {
  console.log('Unhandled rejection caught:', reason);
});

// LND REST API helper
const lndRequest = async (path, method = 'GET', body = null) => {
  try {
    const macaroon = fs.readFileSync(keys.lnd.macaroonPath).toString('hex');
    const response = await fetch(`https://localhost:8080${path}`, {
      method,
      headers: {
        'Grpc-Metadata-macaroon': macaroon,
      },
      body: body ? JSON.stringify(body) : null,
      agent: new https.Agent({ rejectUnauthorized: false }),
    });
    if (!response.ok) {
      throw new Error(`LND API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  } catch (err) {
    console.log('LND request failed:', err.message);
    throw err;
  }
};

// Test LND connection
(async () => {
  try {
    await lndRequest('/v1/getinfo');
    console.log("LND connection initialized successfully");
    lnd = true;
  } catch (err) {
    console.log("Warning: LND connection failed. Lightning Network features will be unavailable.", err.message);
    lnd = null;
  }
})();

fs.readFile(`./src/server/fortunes.txt`, "utf8", (err, data) => {
  if (err) throw err;
  fortunes = data.split("\n");

  //remove any fortunes that are too long.
  fortunes = fortunes.filter((fortune) => {
    return fortune.length < 75;
  });
});

module.exports = function (app) {
  //request a cookie returns an invoice

  app.get("/cookies-sold", (req, res) => {
    Cookies.countDocuments({ paid: true })
      .then(c => res.send({ numberOfCookies: c }))
      .catch(() => res.send({ numberOfCookies: 200 }));
  });


  //testing
  // app.get("/pay/:invoice", async (req, res) => {
  //   const doc = await Cookies.findOne({
  //     invoice: req.params.invoice,
  //   });
  //   doc.paid = true;
  //   doc.save();
  //   res.status(200).send();
  // });

  app.get("/request-cookie/", async (req, res) => {
    try {
      if (!lnd) {
        return res.status(503).send({ error: "Lightning Network unavailable" });
      }

      const invoice = await lndRequest('/v1/invoices', 'POST', {
        value: "100",
        memo: "Buy a cookie",
      });
      const cookie = new Cookies({
        date: new Date(),
        fortune: fortunes[Math.floor(Math.random() * fortunes.length)],
        invoice: invoice.payment_request,
        paid: false,
      });
      await cookie.save();
      cookie.fortune = undefined;
      res.send({ cookie });
    } catch (err) {
      console.log("Error creating invoice:", err.message);
      res.status(503).send({ error: "Lightning Network unavailable" });
    }
  });

  app.post("/request-cookie-delivery/", async (req, res) => {
    try {
      let isCookieCustom = false;
      let price = 100;
      if (filter.isProfane(req.body.customFortune)) {
        console.log("naughty");
        res.send({ error: "profane" });
        return false;
      }
      if (req.body.customFortune) {
        price = 1100;
        isCookieCustom = true;
      }

      if (!lnd) {
        return res.status(503).send({ error: "Lightning Network unavailable" });
      }

      const invoice = await lndRequest('/v1/invoices', 'POST', {
        value: price.toString(),
        memo: "Buy a cookie",
      });
      // checking for swear words in the sender field. This library is very easy to trick and should probably be replaced
      if (filter.isProfane(req.body.sender)) {
        req.body.sender = "Someone";
      }
      // making sure that the sender is captialized
      req.body.sender =
        req.body.sender.charAt(0).toUpperCase() + req.body.sender.slice(1);

      const cookie = new Cookies({
        recipient: req.body.recipient,
        date: new Date(),
        fortune:
          req.body.customFortune ||
          fortunes[Math.floor(Math.random() * fortunes.length)],
        invoice: invoice.payment_request,
        paid: false,
        sender: req.body.sender || "Someone",
        custom: isCookieCustom,
      });
      cookie.save();
      res.send(cookie);
    } catch (err) {
      console.log("Error creating invoice:", err.message);
      res.status(503).send({ error: "Lightning Network unavailable" });
    }
  });

  // check if a payment has been made
  app.get("/check-for-payment/:id", async (req, res) => {
    let cookie = await Cookies.findById(req.params.id);
    if (cookie.paid === true) {
      if (cookie.recipient) {
        res.send({ message: `a cookie was sent to ${cookie.recipient}` });
        return;
      }
      res.send({ fortune: cookie.fortune });
      return;
    }
    res.status(402).send();
  });

  // const test = async () => {
  //   doc = {
  //     fortune:
  //       "Bitcoin has made your central banks and manipulation of the money obsolete",
  //     _id: 1654655555,
  //     custom: false,
  //   };
  //   const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
  //   const fontCanvas = await Jimp.create(1200, 675);
  //   const destImage = await Jimp.read("./src/assets/opened-cookie.png");
  //   fontCanvas
  //     .print(
  //       font,
  //       80,
  //       155,
  //       {
  //         text: doc.fortune,
  //         alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
  //         alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
  //       },
  //       500
  //     )
  //     .rotate(-19);
  //   destImage
  //     .blit(fontCanvas, 0, 0)
  //     .writeAsync(`${doc._id}.png`)
  //     .then(async () => {
  //       setTimeout(async () => {}, 5000);
  //     });
  //   console.log(
  //     `Hey ${doc.recipient}, \n${doc.sender} sent you a ${
  //       doc.custom ? "custom" : null
  //     } fortune cookie.\n\nSend a cookie back at BitcoinFortuneCookie.com`
  //   );
  // };
  // test();
};
