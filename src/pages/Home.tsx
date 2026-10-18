import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../data/db";
import type { Product } from "../data/products";
import { ProductCard } from "../components/ProductCard";

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

export function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => { getProducts().then(setProducts); }, []);
  useReveal();
  const bestsellers = products.filter((p) => p.badge === "bestseller" || p.rating >= 4.8).slice(0, 4);
  const fresh = products.filter((p) => p.badge === "new").concat(products.slice(0, 2)).slice(0, 4);

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-blob" />
        <div className="container hero-inner">
          <div className="hero-copy">
            <div className="eyebrow reveal">Handcrafted in India · by Jindal Udyog</div>
            <h1 className="h1 reveal reveal-d1">
              Stone & silver pieces with a <em style={{ color: "var(--gold)" }}>soul</em>
            </h1>
            <p className="lede reveal reveal-d2">
              Hand-carved stone decor and hallmarked silver essentials — made by artisan
              families, curated for modern Indian homes.
            </p>
            <div className="hero-ctas reveal reveal-d3">
              <Link to="/shop" className="btn btn-dark">Shop the collection →</Link>
              <Link to="/about" className="btn btn-outline">Our story</Link>
            </div>
            <div className="hero-stats reveal reveal-d3">
              <div><strong>500+</strong><span>Happy homes</span></div>
              <div><strong>100%</strong><span>Handcrafted</span></div>
              <div><strong>4.8★</strong><span>Average rating</span></div>
            </div>
          </div>
          <div className="hero-visual reveal reveal-d1">
            <img className="hero-img-main" src="/images/products/marble-lotus-tealight.jpg" alt="Marble lotus tea-light holder" />
            <img className="hero-img-small s1" src="/images/products/silver-lotus-capsule.jpg" alt="Silver lotus capsule pendant" />
            <img className="hero-img-small s2" src="/images/products/silver-capsule-pendants.jpg" alt="Silver keepsake pendants" />
          </div>
        </div>
      </section>

      {/* COLLECTIONS */}
      <section className="section">
        <div className="container">
          <div className="section-head reveal">
            <div>
              <div className="eyebrow">Shop by craft</div>
              <h2 className="h2">Two collections, one obsession with detail</h2>
            </div>
          </div>
          <div className="coll-grid">
            <Link to="/shop?cat=stone" className="coll-card reveal">
              <img src="/images/products/marble-coaster-blue.jpg" alt="Stone collection" />
              <div className="coll-body">
                <h3>Stone Collection</h3>
                <p>Carved by hand, built to outlive trends</p>
                <span className="btn btn-sm">Explore stone →</span>
              </div>
            </Link>
            <Link to="/shop?cat=silver" className="coll-card reveal reveal-d1">
              <img src="/images/products/silver-journal-charms.jpg" alt="Silver collection" />
              <div className="coll-body">
                <h3>Silver Collection</h3>
                <p>Hallmarked pieces for rituals and gifting</p>
                <span className="btn btn-sm">Explore silver →</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* BESTSELLERS */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head reveal">
            <div>
              <div className="eyebrow">Customer favourites</div>
              <h2 className="h2">Bestsellers</h2>
            </div>
            <Link to="/shop" className="link-more">View all →</Link>
          </div>
          <div className="prod-grid">
            {bestsellers.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="story-band reveal">
            <div className="story-inner">
              <div>
                <div className="eyebrow">Why Jindal Store</div>
                <h2 className="h2" style={{ color: "#fff" }}>Every piece has a maker, not a machine</h2>
                <p>
                  We work directly with artisan families across Rajasthan and Uttar Pradesh —
                  no middlemen, fair prices on both sides. When you buy from Jindal Store,
                  you know whose hands shaped your piece.
                </p>
                <div className="story-points">
                  <div><span className="tick">✓</span><span><strong>Direct from artisans.</strong> <span style={{ opacity: 0.7 }}>Fair trade, always.</span></span></div>
                  <div><span className="tick">✓</span><span><strong>BIS-hallmarked silver.</strong> <span style={{ opacity: 0.7 }}>Purity you can verify.</span></span></div>
                  <div><span className="tick">✓</span><span><strong>7-day easy exchange.</strong> <span style={{ opacity: 0.7 }}>No questions, no stress.</span></span></div>
                </div>
              </div>
              <img className="story-img" src="/images/products/marble-jewellery-box-hex.jpg" alt="Marble jewellery box" />
            </div>
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head reveal">
            <div>
              <div className="eyebrow">Fresh off the workbench</div>
              <h2 className="h2">New arrivals</h2>
            </div>
            <Link to="/shop" className="link-more">View all →</Link>
          </div>
          <div className="prod-grid">
            {fresh.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="trust-row">
            {[
              ["🚚", "Free shipping", "On all orders above ₹999, across India"],
              ["🔒", "100% secure", "Prepaid payments via Razorpay"],
              ["🔄", "7-day exchange", "Easy exchanges, no questions asked"],
              ["✦", "Certified pure", "BIS-hallmarked silver, genuine stone"],
            ].map(([icon, title, sub], i) => (
              <div className={`trust-card reveal reveal-d${i}`} key={title}>
                <div className="t-icon">{icon}</div>
                <h4>{title}</h4>
                <p>{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head reveal">
            <div>
              <div className="eyebrow">Word on the street</div>
              <h2 className="h2">Loved in real homes</h2>
            </div>
          </div>
          <div className="testi-grid">
            {[
              ["The marble elephants are even more beautiful in person. My living room finally feels complete.", "Priya S.", "Jaipur"],
              ["Ordered the silver thali for Diwali — packaging was premium and delivery was quick.", "Rohan M.", "Delhi"],
              ["Genuine stone, fair price, beautiful finish. You can tell it's handmade.", "Anita K.", "Mumbai"],
            ].map(([text, name, city], i) => (
              <div className={`testi reveal reveal-d${i}`} key={name}>
                <div className="stars">★★★★★</div>
                <p>"{text}"</p>
                <div className="who">
                  <span className="avatar">{name[0]}</span>
                  <div><strong>{name}</strong><span>{city} · Verified buyer</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
