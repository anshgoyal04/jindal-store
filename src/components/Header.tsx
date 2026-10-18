import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { getWishlist } from "../data/db";

export function Header() {
  const [q, setQ] = useState("");
  const nav = useNavigate();
  const { count, setOpen } = useCart();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [wishCount, setWishCount] = useState(0);

  useEffect(() => {
    getWishlist().then((l) => setWishCount(l.length));
    const update = () => getWishlist().then((l) => setWishCount(l.length));
    window.addEventListener("wishlist-changed", update);
    return () => window.removeEventListener("wishlist-changed", update);
  }, []);

  return (
    <>
      <div className="marquee">
        <div className="marquee-track">
          <span>
            <span>✦ Free shipping over ₹999</span>
            <span>✦ 7-day easy exchange</span>
            <span>✦ BIS-hallmarked silver</span>
            <span>✦ Handcrafted in India</span>
          </span>
          <span>
            <span>✦ Free shipping over ₹999</span>
            <span>✦ 7-day easy exchange</span>
            <span>✦ BIS-hallmarked silver</span>
            <span>✦ Handcrafted in India</span>
          </span>
        </div>
      </div>
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="logo">
            <span className="logo-badge">JS</span>
            <span className="logo-text">
              <strong>JINDAL</strong>
              <small>STORE</small>
            </span>
          </Link>
          <nav className="main-nav">
            <Link to="/">Home</Link>
            <Link to="/shop">Shop All</Link>
            <Link to="/shop?cat=stone">Stone Collection</Link>
            <Link to="/shop?cat=silver">Silver Collection</Link>
            <Link to="/about">Our Story</Link>
          </nav>
          <div className="header-actions">
            <button className="icon-btn hamburger" aria-label="Menu" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
            <form
              className="search"
              onSubmit={(e) => {
                e.preventDefault();
                nav(`/shop?q=${encodeURIComponent(q)}`);
              }}
            >
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search diyas, vases, kadas…"
                aria-label="Search products"
              />
              <button type="submit" aria-label="Search">⌕</button>
            </form>
            <Link to="/account" className="icon-btn acct-btn" aria-label="Account" title={user ? user.name : "Account"}>
              {user ? <span className="acct-initial">{user.name[0].toUpperCase()}</span> : "👤"}
            </Link>
            <Link to="/wishlist" className="icon-btn wish-btn" aria-label="Wishlist">
              ♡ {wishCount > 0 && <span className="cart-count">{wishCount}</span>}
            </Link>
            <button className="icon-btn cart-btn" aria-label="Cart" onClick={() => setOpen(true)} style={{ background: "none", border: "1px solid transparent" }}>
              🛒 <span className="cart-count">{count}</span>
            </button>
          </div>
        </div>
      </header>
      {menuOpen && (
        <nav className="mobile-menu">
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/shop" onClick={() => setMenuOpen(false)}>Shop All</Link>
          <Link to="/shop?cat=stone" onClick={() => setMenuOpen(false)}>Stone Collection</Link>
          <Link to="/shop?cat=silver" onClick={() => setMenuOpen(false)}>Silver Collection</Link>
          <Link to="/about" onClick={() => setMenuOpen(false)}>Our Story</Link>
          <Link to="/track" onClick={() => setMenuOpen(false)}>Track Order</Link>
          <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
        </nav>
      )}
    </>
  );
}
