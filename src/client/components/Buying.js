import React, { useState, useEffect } from "react";
import closedCookie from "../../assets/closed-cookie.png";
import { TailSpin } from "react-loader-spinner";
var QRCode = require("qrcode.react");
let checkForPaymentInterval = null;

export default function Sending(props) {
  const { setMode } = props;
  const [invoice, setInvoice] = useState("");
  const [fortune, setFortune] = useState("");
  const [showFortune, setShowForutne] = useState("none");
  const [paymentNotFound, setPaymentNotFound] = useState(false);
  const [cookieId, setCookieId] = useState("");
  // altering the source of the animated image so that it will play the animation again.
  const [src, setSrc] = useState("/opening-cookie.gif?a=" + Math.random());

  const requestCookie = async () => {
    setMode("buying");
    const res = await fetch(`/request-cookie/`);
    let data = await res.json();
    setInvoice(data.cookie.invoice);
    setCookieId(data.cookie._id);
    setTimeout(() => {
      checkForPayment(data.cookie._id);
    }, 1000);
  };

  useEffect(() => {
    requestCookie();
    return () => {
      // Stoping the browser from checking for payments after leaving the page.
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
        let data = await res.json();
        setInvoice("");
        setFortune(data.fortune);
        clearInterval(checkForPaymentInterval);
        setTimeout(() => {
          setShowForutne("block");
        }, 400);
      }
    }, 1000);
  };

  // quick pay for testing
  // const pay = () => {
  //   fetch(`/pay/${invoice}`);
  // };

  return (
    <div className="mode-container">
      {/* preloading the cookie animation so it's ready to play when the user pays.*/}
      <img src={src} alt="" style={{ display: "none" }} />
      {fortune ? (
        <div
          onClick={() => setMode("waiting")}
          className="cookie-fortune-container pointer"
        >
          <img className="cookie-image" src={src} alt="" />
          <audio src="/crack.mp3" autoPlay></audio>
          <div className="fortune-box">
            <p style={{ display: showFortune }} className="fortune">
              {fortune}
            </p>
          </div>
        </div>
      ) : (
        <img className="cookie-image" src={closedCookie} alt="" />
      )}

      {invoice ? (
        <div>
          <p>Please pay 100 sats to open the cookie</p>

          <QRCode
            className="qr-code"
            value={invoice}
            size={200}
            style={{ background: "white", padding: "10px" }}
          />

          {paymentNotFound ? (
            <p
              className="payment-check-button pointer last-thing"
              onClick={() => checkForPayment(cookieId)}
            >
              Payment not found. Click here to Check again.
            </p>
          ) : (
            <p className="last-thing">
              <a href={`lightning:${invoice}`}>Open lightning wallet</a>
            </p>
          )}
        </div>
      ) : (
        <span>
          {!fortune ? (
            <TailSpin color="#FFF" height={200} width={200} />
          ) : null}
        </span>
      )}
      {/* <button style={{ position: "absolute", top: 0, left: 0 }} onClick={pay}>
        pay
      </button> */}
    </div>
  );
}
