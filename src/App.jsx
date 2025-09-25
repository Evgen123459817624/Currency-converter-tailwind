import "./App.css";
import ImgBg1 from "./assets/img-bg-1.webp";
import ArrowIcon from "./assets/arrow.svg?react";
import SwapArrowIcon from "./assets/swaparrows.svg?react";
import React, { useRef, useEffect, useState } from "react";

function App() {
  const ref = useRef();
  const [visible, setVisible] = useState(false);

  // Form state
  const [amount, setAmount] = useState("");
  const [fromCurr, setFromCurr] = useState("USD");
  const [toCurr, setToCurr] = useState("EUR");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  // simple validation: amount is positive number; currencies are 3-letter strings
  function validate() {
    setError("");
    const num = parseFloat(amount.toString().replace(",", "."));
    if (isNaN(num) || !(num > 0)) {
      setError("Introdu o sumă validă (număr > 0).");
      return false;
    }
    if (!/^[A-Za-z]{3}$/.test(fromCurr) || !/^[A-Za-z]{3}$/.test(toCurr)) {
      setError("Codurile valutare trebuie să fie 3 litere (ex: USD, EUR).");
      return false;
    }
    return true;
  }

  async function handleConvert() {
    if (!validate()) return;
    setLoading(true);
    setResult(null);
    setError("");

    // Normalize uppercase
    const from = fromCurr.toUpperCase();
    const to = toCurr.toUpperCase();
    const amt = parseFloat(amount.toString().replace(",", "."));

    // Frankfurter endpoint: https://api.frankfurter.dev/latest?amount=100&from=USD&to=EUR
    const url = `https://api.frankfurter.dev/v1/latest?base=${encodeURIComponent(
      from
    )}&amount=${amt}&symbols=${encodeURIComponent(to)}`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Eroare server: ${res.status}`);
      }
      const data = await res.json();
      // data.rates is an object: { "EUR": 92.34 } (value is converted amount)
      if (!data || !data.rates || typeof data.rates[to] === "undefined") {
        throw new Error("Răspuns neașteptat de la API.");
      }
      const converted = data.rates[to];
      // păstrăm 4 zecimale max pentru afișare
      setResult({
        amount: amt,
        from,
        to,
        converted: Math.round(converted * 10000) / 10000,
        date: data.date || null,
      });
    } catch (err) {
      console.error(err);
      setError(
        "Nu am putut obține cursul. Încearcă din nou sau verifică conexiunea."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSwap() {
    setFromCurr(toCurr);
    setToCurr(fromCurr);
    setResult(null);
    setError("");
  }

  return (
    <div className="body">
      <div id="navbar">
        <div className="logo">
          <span>evgen4web</span>
        </div>
        <ul>
          <li>
            <button>Personal</button>
          </li>
          <li>
            <button>Business</button>
          </li>
          <li>
            <button>Send Money</button>
          </li>
          <li>
            <button>
              Money transfer <ArrowIcon />
            </button>
          </li>
          <li>
            <button>Convertor</button>
          </li>
          <li>
            <button>
              Tools <ArrowIcon />
            </button>
          </li>
          <li>
            <button>
              Resources <ArrowIcon />
            </button>
          </li>
        </ul>
        <ul>
          <li>
            <button>Help</button>
          </li>
          <li>
            <button>Login</button>
          </li>
          <li>
            <button className="active">Register</button>
          </li>
        </ul>
      </div>

      <main>
        <div className="title">
          <h2>evgen4web Currency Convertor</h2>
          <p>Check live foreign currency exchange rates</p>
        </div>
        <div className="converting-section">
          <div className="row1">
            <div className="quantity-input">
              <div className="relative">
                <span>Amount</span>
                <input
                  type="text"
                  maxLength={15}
                  placeholder="100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
            <div className="selector-inputs">
              <div className="relative">
                <span>From</span>
                <input
                  type="text"
                  maxLength={5}
                  placeholder="USD"
                  value={fromCurr}
                  onChange={(e) => setFromCurr(e.target.value)}
                />
              </div>
              <button
                title="Swap currencies"
                onClick={handleSwap}
                style={{ background: "transparent", border: "none" }}
              >
                <SwapArrowIcon />
              </button>
              <div className="relative">
                <span>To</span>
                <input
                  type="text"
                  maxLength={5}
                  placeholder="EUR"
                  value={toCurr}
                  onChange={(e) => setToCurr(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="row2">
            <div className="result">
              {loading && <div>Loading…</div>}
              {error && <div className="error">{error}</div>}
              {result && (
                <div>
                  <strong>
                    {result.amount} {result.from} = {result.converted}{" "}
                    {result.to}
                  </strong>
                  {result.date && (
                    <div style={{ fontSize: "0.85rem" }}>
                      Rate date: {result.date}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="convert-button-container">
              <button
                id="convert-button"
                onClick={handleConvert}
                disabled={loading}
              >
                {loading ? "Converting…" : "Convert"}
              </button>
            </div>
          </div>
        </div>

        <div className="section2">
          <span className="info-text">
            &#9432; We use the mid-market rate for our Converter. This is for
            informational purposes only. You won’t receive this rate when
            sending money
          </span>
          <div className="bg-img1">
            <div className={`left-text${visible ? " fade-up" : ""}`} ref={ref}>
              <span>Unlock a promotional rate on your first 3 transfers</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
