import React, { useEffect, useState } from "react";
import "./App.css";
import logo from "../assets/logo.png";
import Waiting from "./components/Waiting.js";
import Buying from "./components/Buying.js";
import Sending from "./components/Sending";
import closedCookie from "../assets/closed-cookie.png";

function App() {
  const [mode, setMode] = useState("waiting");

  const reset = () => {
    setMode("waiting");
  };

  return (
    <div>
      <div className="container">
        <img src={closedCookie} alt="" style={{ display: "none" }} />
        <img className="logo pointer" onClick={reset} src={logo} alt="Logo" />
        {mode === "waiting" ? <Waiting setMode={setMode} /> : null}
        {mode === "buying" ? <Buying setMode={setMode} /> : null}
        {mode === "sending" ? <Sending setMode={setMode} /> : null}
        {mode === "termsofservice" ? (
          <div className="terms-of-service">
            <h1>Terms of Service</h1>
            <p>
              This site will never use cookies and trackers to monitor your
              behavior. Any information that is not needed for the running of
              this site and the retrieval of earned sats will be discarded.
            </p>
            <p>
              We hold the right to remove any custom fortune we deem
              inappropriate.
            </p>
            <p>
              The creators of Bitcoin Fortune Cookie are not responsible for any
              failing of the site, Twitter bot, Lightning Network, Bitcoin
              Network or any other error resulting in a failure to see or send a
              Fortune, be it a normal or custom made one, and are also not
              responsible for any failure that leads to lost funds. This site
              and the service it offers are in development and might change at
              any time without warning. Consider bitcoinfortunecookie.com to be
              in eternal beta until otherwise notified.
            </p>
            <p>
              By using the Bitcoin Fortune Cookie website you agree to not send
              any custom Fortunes that go against the Twitter terms of service
              or that will get the Bitcoin Fortune Cookie Twitter Bot banned.
            </p>
            <p>
              By using the Bitcoin Fortune Cookie website, you agree that you
              are not Craig S. Wright who falsely claimed to be Satoshi
              Nakamoto. Craig, if you are reading this, you are not allowed to
              know your fortune.
            </p>
            <p>
              You also agree to not ask us to support or shill your shitcoin.
              Only Bitcoin matters.
            </p>
          </div>
        ) : null}
      </div>
      <div className="footer">
        <a
          className="twitter-icon-link"
          href="https://twitter.com/intent/user?screen_name=Bitcoin_Cookie"
        >
          <img className="twitter-icon" src="/twitter-icon.png" alt="" />
        </a>
        <a href="https://twitter.com/Bitcoin_Cookie">Contact</a>
        <a href="https://twitter.com/Bitcoin_Cookie">Report a Bug</a>
        <a href="#" onClick={() => setMode("termsofservice")}>
          Terms of Service
        </a>
      </div>
    </div>
  );
}

export default App;
