import "./App.css";
import ImgBg1 from "./assets/img-bg-1.webp";
import ArrowIcon from "./assets/arrow.svg?react";
import SwapArrowIcon from "./assets/swaparrows.svg?react";
import React, { useRef, useEffect, useState } from "react";

function App() {
  const ref = useRef();
  const [visible, setVisible] = useState(false);
  const footerRef = useRef();
  const [footerVisible, setFooterVisible] = useState(false);

  // Form state
  const [amount, setAmount] = useState(100);
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
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const footerObserver = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setFooterVisible(true);
      },
      { threshold: 0.1 }
    );
    if (footerRef.current) footerObserver.observe(footerRef.current);
    return () => footerObserver.disconnect();
  }, []);

  function validate() {
    setError("");
    const num = amount.toString().replace(",", ".");
    if (isNaN(num) || !(num > 0)) {
      setError("Insert a valid amount of money");
      setResult(null);
      return false;
    }
    if (!/^[A-Za-z]{3}$/.test(fromCurr) || !/^[A-Za-z]{3}$/.test(toCurr)) {
      setError("Codurile valutare trebuie să fie 3 litere (ex: USD, EUR).");
      setResult(null);
      return false;
    }
    return true;
  }

  async function handleConvert() {
    if (!validate()) return;
    setLoading(true);
    setResult(null);
    setError("");

    const from = fromCurr.toUpperCase();
    const to = toCurr.toUpperCase();
    const amt = amount.toString().replace(",", ".");

    const url = `https://api.frankfurter.dev/v1/latest?base=${encodeURIComponent(
      from
    )}&amount=${amt}&symbols=${encodeURIComponent(to)}`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Eroare server: ${res.status}`);
      }
      const data = await res.json();

      if (!data || !data.rates || typeof data.rates[to] === "undefined") {
        throw new Error("Răspuns neașteptat de la API.");
      }
      const converted = data.rates[to];
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

  const [animate, setAnimate] = useState(false);

  function handleSwap() {
    setFromCurr(toCurr);
    setToCurr(fromCurr);
    setAnimate(true);
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
                onAnimationEnd={() => setAnimate(false)}
                className={`swap-btn ${animate ? "animate" : ""}`}
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

        <div className="section3">
          <div className="carousel-track">
            <img
              src="https://images.g2crowd.com/uploads/product/image/84fd5bd582809f20ff5682d2746ffa82/shopify.png"
              alt=""
            />
            <img
              src="https://s3-eu-west-1.amazonaws.com/clearbooks-marketing/media-centre/MediaCentre/clear-books/CMYK/logo/clear-books-logo-cmyk.png"
              alt=""
            />
            <img
              src="https://www.vistaprint.com/news/wp-content/uploads/sites/14/2021/11/Vista_Color.png"
              alt=""
            />
            <img
              src="https://s3-us-west-1.amazonaws.com/partnerpage.prod/media/directories/images/a1d29c93-cf90-4c74-813c-1844a22a30e6/a28d4e39-fdf6-4bf9-8dc9-7f0937a042fa.png"
              alt=""
            />

            {/* copying the images to create an infinite loop effect */}

            <img
              src="https://images.g2crowd.com/uploads/product/image/84fd5bd582809f20ff5682d2746ffa82/shopify.png"
              alt=""
            />
            <img
              src="https://s3-eu-west-1.amazonaws.com/clearbooks-marketing/media-centre/MediaCentre/clear-books/CMYK/logo/clear-books-logo-cmyk.png"
              alt=""
            />
            <img
              src="https://www.vistaprint.com/news/wp-content/uploads/sites/14/2021/11/Vista_Color.png"
              alt=""
            />
            <img
              src="https://s3-us-west-1.amazonaws.com/partnerpage.prod/media/directories/images/a1d29c93-cf90-4c74-813c-1844a22a30e6/a28d4e39-fdf6-4bf9-8dc9-7f0937a042fa.png"
              alt=""
            />

            {/* copying the images to create an infinite loop effect */}

            <img
              src="https://images.g2crowd.com/uploads/product/image/84fd5bd582809f20ff5682d2746ffa82/shopify.png"
              alt=""
            />
            <img
              src="https://s3-eu-west-1.amazonaws.com/clearbooks-marketing/media-centre/MediaCentre/clear-books/CMYK/logo/clear-books-logo-cmyk.png"
              alt=""
            />
            <img
              src="https://www.vistaprint.com/news/wp-content/uploads/sites/14/2021/11/Vista_Color.png"
              alt=""
            />
          </div>
        </div>

        <div className="section4">
          <div className="footer">
            <h2>Currency information</h2>
            <h3>Learn more about the most popular currency pairs</h3>
          </div>
          <div className="container">
            <div className="item">
              <div className="title">
                <h4>USD - US Dollar</h4>
              </div>
              <div className="content">
                <p>
                  Our currency rankings show that the most popular US Dollar
                  exchange rate is the USD to USD rate. The currency code for US
                  Dollars is USD. The currency symbol is $.
                </p>
                <button>
                  US Dollar &nbsp; <span className="arrow"> → </span>{" "}
                </button>
              </div>
            </div>
            <div className="item">
              <div className="title">
                <h4>EUR - Euro</h4>
              </div>
              <div className="content">
                <p>
                  Our currency rankings show that the most popular Euro exchange
                  rate is the EUR to USD rate. The currency code for Euros is
                  EUR. The currency symbol is €
                </p>
                <button>
                  Euro &nbsp; <span className="arrow"> → </span>{" "}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className={`${footerVisible ? "footer" : ""}`} ref={footerRef}>
          <div className="col">
            <h2>Transfer Money</h2>
            <span>Send Money Online</span>
            <span>Send Money to India</span>
            <span>Send Money to Pakistan</span>
            <span>Send Money to Mexico</span>
            <span>Send Money to Japan</span>
            <span>Send Money to the UK</span>
            <span>Send Money to Canada</span>
            <span>Send Money to Australia</span>
            <span>Send Money to New Zealand</span>
            <span>Send Money to Mobile Wallet</span>
            <span>Large Money Transfer</span>
            <span>Transfer speed</span>
            <span>Transfer fees</span>
            <span>Security</span>
            <span>Report fraud</span>
            <span>Trustpilot Reviews</span>
          </div>
          <div className="col">
            <h2>XE Business</h2>
            <span>Xe Business</span>
            <span>Check Send Rates</span>
            <span>International Business Payments</span>
            <span>Spot Transfers</span>
            <span>Same Currency Transfer</span>
            <span>Risk Management</span>
            <span>Forward Contracts</span>
            <span>Limit Orders</span>
            <span>Enterprise Resource Planning</span>
            <span>Currency Data API</span>
            <span>Payments API</span>
            <span>Mass Payments</span>
            <span>Payment Methods</span>
            <span>Business Payroll</span>
            <span>User Roles</span>
            <span>Affiliate Partner Program</span>
          </div>
          <div className="col">
            <h2>Apps</h2>
            <span>Money Transfer & Currency Apps</span>
            <span>Android Money Transfer App</span>
            <span>iOS Money Transfer App</span>
            <h2 className="mt-6">Tools & Resources</h2>
            <span>Blog</span>
            <span>Currency Converter</span>
            <span>Currency Charts</span>
            <span>Historical Currency Rates</span>
            <span>Currency Encyclopedia</span>
            <span>Currency Rate Alerts</span>
            <span>Currency Newsletters</span>
            <span>IBAN Calculator</span>
            <span>Invoice generator</span>
            <span>Mortgage Calculator</span>
            <span>SWIFT/BIC code lookup</span>
          </div>
          <div className="col">
            <h2>Company Info</h2>
            <span>About Us</span>
            <span>Partnerships</span>
            <span>Careers</span>
            <span>Help Center</span>
            <span>Dedicated support</span>
            <span>Site Map</span>
            <span>Legal</span>
            <span>Privacy</span>
            <span>Cookie Policy</span>
            <span>Consent Manager</span>
            <span>Money Transfer Information</span>
            <span>File a Complaint</span>
            <span>Accessibility</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
