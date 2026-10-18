import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo">
              <span className="logo-badge">JS</span>
              <span className="logo-text">
                <strong>JINDAL</strong>
                <small>STORE</small>
              </span>
            </div>
            <p>Handcrafted stone and silver pieces for Indian homes — made by artisans, backed by Jindal Udyog.</p>
          </div>
          <div>
            <h4>Shop</h4>
            <Link to="/shop?cat=stone">Stone Collection</Link>
            <Link to="/shop?cat=silver">Silver Collection</Link>
            <Link to="/shop">All Products</Link>
          </div>
          <div>
            <h4>Help</h4>
            <Link to="/shipping">Shipping Info</Link>
            <Link to="/exchange">Exchange Policy</Link>
            <Link to="/contact">Contact Us</Link>
          </div>
          <div>
            <h4>Company</h4>
            <Link to="/about">Our Story</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Jindal Store · A Jindal Udyog enterprise</span>
          <span>100% Prepaid · Secure payments via Razorpay</span>
        </div>
      </div>
    </footer>
  );
}
