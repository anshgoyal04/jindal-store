import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatINR } from "../data/products";
import { createOrder, uid, getAddresses, saveAddress } from "../data/db";
import type { Address as DbAddress } from "../data/db";

const FREE_SHIP_THRESHOLD = 999;
const SHIP_CHARGE = 79;

interface Address {
  name: string; phone: string; pincode: string;
  address: string; city: string; state: string;
}

const emptyAddr: Address = { name: "", phone: "", pincode: "", address: "", city: "", state: "" };

export function Checkout() {
  const { detailed, subtotal, clear } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState<"address" | "payment" | "done">("address");
  const [addr, setAddr] = useState<Address>(emptyAddr);
  useEffect(() => {
    if (user) {
      getAddresses(user.id).then((saved) => {
        const def = saved.find((a) => a.isDefault) || saved[0];
        if (def) setAddr({ name: def.name, phone: def.phone, pincode: def.pincode, address: def.address, city: def.city, state: def.state });
      });
    }
  }, [user]);
  const [errors, setErrors] = useState<Partial<Address>>({});
  const [paying, setPaying] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<string>("");

  const shipping = subtotal >= FREE_SHIP_THRESHOLD ? 0 : SHIP_CHARGE;
  const total = subtotal + shipping;

  if (detailed.length === 0 && step !== "done") {
    return (
      <div className="container" style={{ padding: "120px 0", textAlign: "center" }}>
        <h1 className="h2">Your cart is empty</h1>
        <p className="lede" style={{ margin: "16px auto 28px" }}>Add some beautiful pieces first.</p>
        <Link to="/shop" className="btn btn-dark">Browse shop</Link>
      </div>
    );
  }

  const set = (k: keyof Address) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setAddr({ ...addr, [k]: e.target.value });

  const validate = () => {
    const e: Partial<Address> = {};
    if (addr.name.trim().length < 3) e.name = "Enter full name";
    if (!/^[6-9]\d{9}$/.test(addr.phone)) e.phone = "Enter valid 10-digit mobile";
    if (!/^\d{6}$/.test(addr.pincode)) e.pincode = "Enter 6-digit pincode";
    if (addr.address.trim().length < 10) e.address = "Enter complete address";
    if (!addr.city.trim()) e.city = "Required";
    if (!addr.state.trim()) e.state = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const pay = () => {
    setPaying(true);
    // Razorpay integration point — swap with real checkout.js call using order_id from backend
    setTimeout(async () => {
      const existing = user ? await getAddresses(user.id) : [];
      const dbAddr: DbAddress = {
        id: uid("A"), label: "Home", name: addr.name, phone: addr.phone,
        pincode: addr.pincode, address: addr.address, city: addr.city, state: addr.state,
        isDefault: existing.length === 0,
      };
      if (user) await saveAddress(user.id, dbAddr);
      const order = await createOrder({
        userId: user ? user.id : null,
        items: detailed.map((d) => ({
          productId: d.product.id, name: d.product.name, image: d.product.images[0],
          price: d.product.price, qty: d.qty,
        })),
        address: dbAddr,
        subtotal, shipping, total,
        paymentId: "pay_" + Math.random().toString(36).slice(2, 12),
      });
      setPlacedOrder(order.id);
      setPaying(false);
      setStep("done");
      clear();
    }, 2200);
  };

  if (step === "done") {
    return (
      <div className="container" style={{ padding: "100px 0", textAlign: "center", maxWidth: 620 }}>
        <div style={{ fontSize: 72 }}>🎉</div>
        <h1 className="h2" style={{ margin: "20px 0 12px" }}>Order placed!</h1>
        <p className="lede" style={{ margin: "0 auto 8px" }}>
          Thank you, {addr.name.split(" ")[0] || "friend"}. Your order <strong>{placedOrder}</strong> is confirmed.
        </p>
        <p className="lede" style={{ margin: "0 auto 32px" }}>
          We'll ship to {addr.city} ({addr.pincode}) within 24 hours. Tracking details will arrive by SMS.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to={`/track/${placedOrder}`} className="btn btn-brand">Track order</Link>
          <Link to="/shop" className="btn btn-dark">Continue shopping</Link>
          <Link to="/" className="btn btn-outline">Back home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "48px 0 96px" }}>
      <div className="eyebrow">Secure checkout</div>
      <h1 className="h2" style={{ marginBottom: 8 }}>{step === "address" ? "Delivery address" : "Payment"}</h1>
      <div className="steps">
        <span className={step === "address" ? "active" : "done-step"}>1 · Address</span>
        <span className={step === "payment" ? "active" : ""}>2 · Payment</span>
      </div>

      <div className="co-layout">
        <div className="co-main">
          {step === "address" ? (
            <div className="co-card">
              <div className="form-grid">
                <div><label className="label">Full name</label>
                  <input className="input" value={addr.name} onChange={set("name")} placeholder="Priya Sharma" />
                  {errors.name && <span className="err">{errors.name}</span>}</div>
                <div><label className="label">Mobile</label>
                  <input className="input" value={addr.phone} maxLength={10} onChange={set("phone")} placeholder="98765 43210" />
                  {errors.phone && <span className="err">{errors.phone}</span>}</div>
                <div><label className="label">Pincode</label>
                  <input className="input" value={addr.pincode} maxLength={6} onChange={(e) => setAddr({ ...addr, pincode: e.target.value.replace(/\D/g, "") })} placeholder="302001" />
                  {errors.pincode && <span className="err">{errors.pincode}</span>}</div>
                <div><label className="label">City</label>
                  <input className="input" value={addr.city} onChange={set("city")} placeholder="Jaipur" />
                  {errors.city && <span className="err">{errors.city}</span>}</div>
                <div style={{ gridColumn: "1 / -1" }}><label className="label">Address</label>
                  <input className="input" value={addr.address} onChange={set("address")} placeholder="Flat 4B, Green Heights, MG Road" />
                  {errors.address && <span className="err">{errors.address}</span>}</div>
                <div style={{ gridColumn: "1 / -1" }}><label className="label">State</label>
                  <input className="input" value={addr.state} onChange={set("state")} placeholder="Rajasthan" />
                  {errors.state && <span className="err">{errors.state}</span>}</div>
              </div>
              <button className="btn btn-dark" style={{ marginTop: 24 }} onClick={() => validate() && setStep("payment")}>
                Continue to payment →
              </button>
            </div>
          ) : (
            <div className="co-card">
              <div className="pay-box">
                <div style={{ fontSize: 40 }}>💳</div>
                <h3>Pay securely with Razorpay</h3>
                <p>UPI · Cards · Netbanking · Wallets</p>
                <div className="pay-amount">{formatINR(total)}</div>
                <button className="btn btn-brand" style={{ width: "100%", marginTop: 8 }} disabled={paying} onClick={pay}>
                  {paying ? "Processing payment…" : `Pay ${formatINR(total)}`}
                </button>
                <p className="secure-note">🔒 256-bit encrypted · No COD available</p>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => setStep("address")}>← Back to address</button>
            </div>
          )}
        </div>

        <aside className="co-side">
          <h3>Order summary</h3>
          {detailed.map(({ product: p, qty }) => (
            <div className="sum-line" key={p.id}>
              <img src={p.images[0]} alt={p.name} />
              <div><div className="sl-name">{p.name}</div><div className="sl-qty">Qty {qty}</div></div>
              <strong>{formatINR(p.price * qty)}</strong>
            </div>
          ))}
          <div className="tot-row"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
          <div className="tot-row"><span>Shipping</span><span>{shipping === 0 ? "FREE" : formatINR(shipping)}</span></div>
          <div className="tot-row grand"><span>Total</span><strong>{formatINR(total)}</strong></div>
          {step === "payment" && (
            <div className="deliver-to">
              <strong>Deliver to:</strong><br />
              {addr.name}, {addr.address}, {addr.city}, {addr.state} — {addr.pincode}<br />📱 {addr.phone}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
