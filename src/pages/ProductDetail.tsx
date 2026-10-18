import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { formatINR } from "../data/products";
import type { Product } from "../data/products";
import { getProducts } from "../data/db";
import { ProductCard } from "../components/ProductCard";
import { useCart } from "../context/CartContext";

export function ProductDetail() {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => { getProducts().then(setProducts); }, []);
  const { id } = useParams();
  const nav = useNavigate();
  const { add, setOpen } = useCart();
  const p = products.find((x) => x.id === id);
  const [qty, setQty] = useState(1);
  const [pin, setPin] = useState("");
  const [pinOk, setPinOk] = useState<boolean | null>(null);

  if (!p) return <div className="container" style={{ padding: 96 }}>Product not found. <Link to="/shop">Back to shop</Link></div>;

  const off = Math.round(((p.mrp - p.price) / p.mrp) * 100);
  const related = products.filter((x) => x.id !== p.id && x.category === p.category).slice(0, 4);

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 96 }}>
      <div className="crumbs">
        <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / <span>{p.name}</span>
      </div>
      <div className="pd-layout">
        <div className="pd-gallery">
          <img src={p.images[0]} alt={p.name} className="pd-main" />
        </div>
        <div className="pd-info">
          <div className="p-cat">{p.subcategory}</div>
          <h1 className="h2" style={{ margin: "8px 0 12px" }}>{p.name}</h1>
          <div className="p-rating" style={{ fontSize: 14 }}>
            <span className="stars">{"★".repeat(5)}</span>
            {p.rating} · {p.reviews} reviews · SKU {p.sku}
          </div>
          <div className="pd-price">
            <span className="now">{formatINR(p.price)}</span>
            <span className="was">{formatINR(p.mrp)}</span>
            <span className="off">{off}% off</span>
          </div>
          <p className="pd-short">{p.short}</p>

          <div className="pin-check">
            <div className="label">Check delivery</div>
            <div className="pin-row">
              <input
                className="input"
                placeholder="Enter pincode"
                value={pin}
                maxLength={6}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              />
              <button className="btn btn-dark btn-sm" onClick={() => setPinOk(pin.length === 6)}>
                Check
              </button>
            </div>
            {pinOk === true && <p className="pin-ok">✓ Delivery available to {pin} · arrives in 3–5 days · shipping calculated at checkout</p>}
            {pinOk === false && <p className="pin-bad">Please enter a valid 6-digit pincode</p>}
          </div>

          <div className="pd-actions">
            <div className="qty">
              <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(Math.min(p.stock, qty + 1))}>+</button>
            </div>
            <button className="btn btn-dark" style={{ flex: 1 }} onClick={() => { add(p.id, qty); setOpen(true); }}>Add to cart</button>
            <button className="btn btn-brand" style={{ flex: 1 }} onClick={() => { add(p.id, qty); nav("/checkout"); }}>Buy now</button>
          </div>
          <p className="pd-meta">✓ In stock ({p.stock} left) · 🔒 Secure prepaid checkout · 🔄 7-day easy exchange</p>

          <div className="pd-specs">
            <h3>Details</h3>
            <p>{p.description}</p>
            <table>
              <tbody>
                {p.specs.map((s) => (
                  <tr key={s.label}><td>{s.label}</td><td>{s.value}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="section" style={{ paddingBottom: 0 }}>
        <div className="section-head">
          <h2 className="h2">You may also like</h2>
          <Link to="/shop" className="link-more">View all →</Link>
        </div>
        <div className="prod-grid">
          {related.map((r) => (
            <ProductCard key={r.id} p={r} />
          ))}
        </div>
      </div>
    </div>
  );
}
