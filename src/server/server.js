const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const fs = require("fs");
const keys = require("./config/keys");
const https = require("https");

// setting up express
var app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


require("./payment-routes")(app);

const dbSetup = async () => {
  await mongoose.connect(keys.mongodb.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

dbSetup();

app.use(express.static(path.join(__dirname, "../", "../", "build")));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "../", "../", "build", "index.html"));
});

// Try to start HTTPS if cert files exist, otherwise just run HTTP
try {
  const options = {
    key: fs.readFileSync(
      "/etc/letsencrypt/live/bitcoinfortunecookie.com/privkey.pem",
      "utf8"
    ),
    cert: fs.readFileSync(
      "/etc/letsencrypt/live/bitcoinfortunecookie.com/fullchain.pem",
      "utf8"
    ),
  };
  https.createServer(options, app).listen(443);
  console.log("Yip Yip! Listening on port 443 (HTTPS)");
} catch (err) {
  console.log("SSL cert files not found, running HTTP only on port 3001");
}

app.listen(3001);
console.log("Yip Yip! Listening on port 3001");
