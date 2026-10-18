import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatINR } from "../data/products";

const FREE_SHIP_THRESHOLD = 999;
const SHIP_CHARGE = 79;

export function CartDrawer() {
  const { isOpen, setOpen, detailed, setQty, remove, subtotal } = useCart();
  const nav = useNavigate();
  const shipping = subtotal >= FREE_SHIP_THRESHOLD || subtotal === 0 ? 0 : SHIP_CHARGE;

  return (
    <>
      <div className={`drawer-overlay ${isOpen ? "show" : ""}`} onClick={() => setOpen(false)} />
      <aside className={`cart-drawer ${isOpen ? "open" : ""}`}>
        <div className="drawer-head">
          <h3>Your cart ({detailed.reduce((s, d) => s + d.qty, 0)})</h3>
          <button className="drawer-close" onClick={() => setOpen(false)} aria-label="Close cart">✕</button>
        </div>
        <div className="drawer-body">
          {detailed.length === 0 ? (
            <div className="cart-empty">
              <div style={{ fontSize: 48 }}>🛒</div>
              <p>Your cart is empty.<br />Beautiful things await.</p>
              <button className="btn btn-dark btn-sm" onClick={() => { setOpen(false); nav("/shop"); }}>
                Start shopping
              </button>
            </div>
          ) : (
            detailed.map(({ product: p, qty }) => (
              <div className="cart-line" key={p.id}>
                <img src={p.images[0]} alt={p.name} />
                <div className="cl-info">
                  <Link to={`/product/${p.id}`} onClick={() => setOpen(false)} className="cl-name">{p.name}</Link>
                  <div className="cl-price">{formatINR(p.price)}</div>
                  <div className="qty qty-sm">
                    <button onClick={() => setQty(p.id, qty - 1)}>−</button>
                    <span>{qty}</span>
                    <button onClick={() => setQty(p.id, qty + 1)}>+</button>
                  </div>
                </div>
                <button className="cl-remove" onClick={() => remove(p.id)} aria-label="Remove">✕</button>
              </div>
            ))
          )}
        </div>
        {detailed.length > 0 && (
          <div className="drawer-foot">
            {shipping > 0 ? (
              <p className="ship-note">Add {formatINR(FREE_SHIP_THRESHOLD - subtotal)} more for <strong>FREE shipping</strong></p>
            ) : (
              <p className="ship-note ok">🎉 You've unlocked FREE shipping!</p>
            )}
            <div className="tot-row"><span>Subtotal</span><strong>{formatINR(subtotal)}</strong></div>
            <div className="tot-row"><span>Shipping</span><strong>{shipping === 0 ? "FREE" : formatINR(shipping)}</strong></div>
            <button className="btn btn-dark" style={{ width: "100%", marginTop: 12 }}
              onClick={() => { setOpen(false); nav("/checkout"); }}>
              Proceed to checkout →
            </button>
            <p className="secure-note">🔒 Secure prepaid checkout · No COD</p>
          </div>
        )}
      </aside>
    </>
  );
}
