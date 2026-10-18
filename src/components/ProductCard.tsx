import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../data/products";
import { formatINR } from "../data/products";
import { getWishlist, toggleWishlist } from "../data/db";

const badgeLabel: Record<string, string> = {
  new: "New",
  sale: "Sale",
  bestseller: "Bestseller",
  handmade: "Handmade",
};

export function ProductCard({ p }: { p: Product }) {
  const off = Math.round(((p.mrp - p.price) / p.mrp) * 100);
  const [wished, setWished] = useState(false);
  useEffect(() => { getWishlist().then((l) => setWished(l.includes(p.id))); }, [p.id]);
  return (
    <Link to={`/product/${p.id}`} className="p-card">
      <div className="p-media">
        <img src={p.images[0]} alt={p.name} loading="lazy" />
        <div className="p-badges">
          {p.badge && <span className={`badge badge-${p.badge}`}>{badgeLabel[p.badge]}</span>}
        </div>
        <button
          className={`p-wish ${wished ? "active" : ""}`}
          aria-label="Toggle wishlist"
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(p.id).then((l) => setWished(l.includes(p.id)));
          }}
        >
          {wished ? "♥" : "♡"}
        </button>
      </div>
      <div className="p-body">
        <div className="p-cat">{p.subcategory}</div>
        <div className="p-name">{p.name}</div>
        <div className="p-rating">
          <span className="stars">{"★".repeat(5)}</span>
          {p.rating} ({p.reviews})
        </div>
        <div className="p-price">
          <span className="now">{formatINR(p.price)}</span>
          <span className="was">{formatINR(p.mrp)}</span>
          <span className="off">{off}% off</span>
        </div>
      </div>
    </Link>
  );
}
