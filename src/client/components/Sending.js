import React, { useState, useEffect } from "react";
import closedCookie from "../../assets/closed-cookie.png";
import { TailSpin } from "react-loader-spinner";
var QRCode = require("qrcode.react");
let checkForPaymentInterval = null;

export default function Sending(props) {
  const { setMode } = props;
  const [readyToSend, setReadyToSend] = useState(false);
  const [sent, setSent] = useState(false);
  const [recipient, setRecipeint] = useState("");
  const [sender, setSender] = useState("");
  const [invoice, setInvoice] = useState("");
  const [customFortune, setCustomFortune] = useState("");
  const [displayCustomMessageInput, setDisplayCustomMessageInput] = useState(
    false
  );
  const [cookieId, setCookieId] = useState("");
  const [paymentNotFound, setPaymentNotFound] = useState(false);

  const [src, setSrc] = useState("/sending-cookie.gif?a=" + Math.random());

  useEffect(() => {
    return () => {
      // Stoping the browser from checking for payments
      clearInterval(checkForPaymentInterval);
    };
  }, []);
  const checkForPayment = (id) => {
    setPaymentNotFound(false);
    var counter = 0;
    checkForPaymentInterval = setInterval(async () => {
      counter = counter + 1;
      if (counter === 300) {
        setPaymentNotFound(true);
        clearInterval(checkForPaymentInterval);
      }
      const res = await fetch("/check-for-payment/" + id);
      if (res.status !== 402) {
        setInvoice("");
        setSent(true);
        clearInterval(checkForPaymentInterval);
      }
    }, 1000);
  };

  const requestCookieDelivery = async (e) => {
    e.preventDefault();
    if (!validTwitteUser(recipient)) {
      alert(`that's not a twitter handle`);
      return;
    }
    setReadyToSend(true);
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: recipient,
        sender: sender,
        customFortune: customFortune,
      }),
    };
    fetch("/request-cookie-delivery", requestOptions)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert("Impolite fortune detected.");
          setReadyToSend(false);
          return false;
        }
        setInvoice(data.invoice);
        setCookieId(data._id);
        setTimeout(() => {
          checkForPayment(data._id);
        }, 1000);
      });
  };

  const validTwitteUser = (sn) => {
    return /^@(?=.*\w)[\w]{1,15}$/.test(sn);
  };

  const handleChange = (e) => {
    if (e.target.name === "recipient") {
      setRecipeint(e.target.value);
    }
    if (e.target.name === "sender") {
      setSender(e.target.value);
    }
    if (e.target.name === "custom-fortune") {
      setCustomFortune(e.target.value);
    }
    if (e.target.name === "custom") {
      setDisplayCustomMessageInput(e.target.checked);
    }
  };

  // quick pay for testing
  // const pay = () => {
  //   fetch(`/pay/${invoice}`);
  // };

  return (
    <div>
      {/* preloading the cookie animation so it's ready to play when the user pays.*/}
      <img src={src} alt="" style={{ display: "none" }} />

      {!sent ? (
        <img className="cookie-image" src={closedCookie} alt="" />
      ) : (
        <div className="pointer" onClick={() => setMode("waiting")}>
          <img className="cookie-image" src={src} alt="" />
          <audio src="/sending.mp3" autoPlay></audio>
          <p>A cookie was sent to {recipient}</p>
        </div>
      )}

      {!readyToSend ? (
        <form className="form-container" action="">
          <p className="sending-text">
            Send this <br /> cookie to:
          </p>
          <input
            placeholder="@Twitter_Handle"
            className="sending-text-input"
            name="recipient"
            value={recipient}
            onChange={handleChange}
            type="text"
            maxLength="20"
          />
          <p className="sending-text">
            This cookie <br /> was sent by:
          </p>
          <input
            placeholder="Feel free to leave this blank"
            className="sending-text-input"
            name="sender"
            value={sender}
            onChange={handleChange}
            type="text"
            maxLength="20"
          />
          <label className="custom-cookie-checkbox-container" htmlFor="check">
            Write a custom fortune (+1000 sats):
            <input
              id="check"
              type="checkbox"
              name="custom"
              checked={displayCustomMessageInput}
              onChange={handleChange}
            />
          </label>
          {displayCustomMessageInput ? (
            <span className="custom-fortune-input-container">
              <textarea
                placeholder="a kind and polite fortune."
                className="custom-fortune-input"
                name="custom-fortune"
                value={customFortune}
                onChange={handleChange}
                maxLength="75"
                type="textbox"
              />
              <p>{customFortune.length}/75</p>
            </span>
          ) : null}

          <button
            className="button submit-button send-submit-button"
            onClick={requestCookieDelivery}
          >
            Submit
          </button>
        </form>
      ) : (
        <div>
          {invoice ? (
            <div>
              <p>
                Pay {customFortune ? 1100 : 100} sats to send this cookie to{" "}
                {recipient}
              </p>
              <QRCode
                className="qr-code"
                value={invoice}
                size={200}
                style={{ background: "white", padding: "10px" }}
              />
              {paymentNotFound ? (
                <p
                  className="payment-check-button pointer"
                  onClick={() => checkForPayment(cookieId)}
                >
                  Payment not found. Click here to Check again.
                </p>
              ) : (
                <p className="last-thing">
                  <a href={`lightning:${invoice}`}>Open lightning wallet</a>
                </p>
              )}
              {/* quick pay for testing */}
              {/* <button
                style={{ position: "absolute", top: 0, left: 0 }}
                onClick={pay}
              >
                pay
              </button> */}
            </div>
          ) : (
            <span>
              {!sent ? (
                <TailSpin color="#00BFFF" height={200} width={200} />
              ) : null}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
