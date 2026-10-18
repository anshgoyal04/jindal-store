import { useState } from "react";
import { Link } from "react-router-dom";

function Page({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <div className="container" style={{ padding: "48px 0 96px", maxWidth: 800 }}>
      <div className="eyebrow">{eyebrow}</div>
      <h1 className="h2" style={{ marginBottom: 28 }}>{title}</h1>
      <div className="prose">{children}</div>
    </div>
  );
}

export function About() {
  return (
    <Page eyebrow="Our story" title="From artisan hands to your home">
      <p><strong>Jindal Store</strong> is the retail face of <strong>Jindal Udyog</strong> — a family enterprise built on a simple belief: the most beautiful things in a home are the ones made by human hands.</p>
      <p>We work directly with artisan families across Rajasthan and Uttar Pradesh — stone carvers who learned their craft from their fathers, and silversmiths who shape metal the way their grandfathers did. No middlemen, no mass production. Every piece is chosen by hand, checked piece by piece, and shipped with care.</p>
      <h3>What we sell</h3>
      <p>Two crafts, one obsession with detail: <strong>hand-carved stone decor</strong> — elephants, diyas, vases, jaali panels — and <strong>BIS-hallmarked silver essentials</strong> — diyas, thalis, kadas, frames. Small batches, honest prices.</p>
      <h3>Our promise</h3>
      <ul>
        <li>✓ Genuine materials — certified silver, natural stone</li>
        <li>✓ Fair prices on both sides — artisans earn fairly, you pay honestly</li>
        <li>✓ 7-day easy exchange — no questions, no stress</li>
        <li>✓ Secure prepaid payments — no COD hassles</li>
      </ul>
      <p>This is a real business, built slowly and properly. Thank you for being part of its beginning.</p>
      <p><Link to="/shop" className="btn btn-dark" style={{ marginTop: 12 }}>Shop the collection</Link></p>
    </Page>
  );
}

export function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", msg: "" });
  return (
    <Page eyebrow="Get in touch" title="Contact us">
      <p>Questions about an order, a product, or bulk gifting? Write to us — we reply within one working day.</p>
      <div className="contact-grid">
        <div className="contact-card"><strong>📧 Email</strong><p>care@jindalstore.in</p></div>
        <div className="contact-card"><strong>📱 Phone / WhatsApp</strong><p>+91 98290 00000<br /><span>Mon–Sat, 10am–7pm IST</span></p></div>
        <div className="contact-card"><strong>📍 Studio</strong><p>Jaipur, Rajasthan, India</p></div>
      </div>
      {sent ? (
        <div className="co-card" style={{ marginTop: 28, textAlign: "center" }}>
          <div style={{ fontSize: 48 }}>✉️</div>
          <h3 style={{ margin: "12px 0 8px" }}>Message received!</h3>
          <p>We'll get back to you within one working day.</p>
        </div>
      ) : (
        <form className="co-card" style={{ marginTop: 28 }} onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
          <div className="form-grid">
            <div><label className="label">Name</label><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><label className="label">Email</label><input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div style={{ gridColumn: "1 / -1" }}><label className="label">Message</label>
              <textarea className="input" rows={5} required value={form.msg} onChange={(e) => setForm({ ...form, msg: e.target.value })} style={{ resize: "vertical" }} /></div>
          </div>
          <button className="btn btn-dark" style={{ marginTop: 20 }}>Send message</button>
        </form>
      )}
    </Page>
  );
}

export function Shipping() {
  return (
    <Page eyebrow="Help" title="Shipping info">
      <h3>Delivery timeline</h3>
      <p>Orders are packed within <strong>24 hours</strong> and delivered in <strong>3–7 working days</strong> across India via our courier partners.</p>
      <h3>Shipping charges</h3>
      <ul>
        <li>Orders above <strong>₹999</strong> — <strong>FREE shipping</strong></li>
        <li>Orders below ₹999 — flat <strong>₹79</strong></li>
      </ul>
      <h3>Checking delivery</h3>
      <p>Enter your pincode on any product page to check serviceability before you buy. We currently deliver across India.</p>
      <h3>Tracking</h3>
      <p>Once shipped, you'll receive tracking details by SMS and email. You can also track anytime from <Link to="/track">the tracking page</Link> using your order ID.</p>
    </Page>
  );
}

export function Exchange() {
  return (
    <Page eyebrow="Help" title="7-day easy exchange">
      <p>Changed your mind? No stress. Every order is covered by our <strong>7-day easy exchange</strong> promise.</p>
      <h3>How it works</h3>
      <ul>
        <li>Raise an exchange request within <strong>7 days of delivery</strong></li>
        <li>Keep the piece <strong>unused, in original packaging</strong></li>
        <li>We arrange a doorstep pickup — <strong>free</strong></li>
        <li>Choose a replacement of equal or higher value (pay the difference if higher)</li>
      </ul>
      <h3>What's not covered</h3>
      <p>Pieces damaged by misuse, or silver items with engraving/personalisation, can't be exchanged. Damaged-in-transit pieces are always replaced free — just share an unboxing photo within 48 hours.</p>
      <p>To start an exchange, <Link to="/contact">contact us</Link> with your order ID.</p>
    </Page>
  );
}

export function Privacy() {
  return (
    <Page eyebrow="Legal" title="Privacy policy">
      <p>We collect only what we need to run your order: name, contact details, delivery address, and order history. Payment details are processed securely by Razorpay — we never see or store your card/UPI credentials.</p>
      <h3>What we don't do</h3>
      <ul>
        <li>We never sell your data</li>
        <li>We never share it except with delivery/payment partners to fulfil your order</li>
        <li>Marketing messages only go out if you opt in</li>
      </ul>
      <h3>Your rights</h3>
      <p>Write to care@jindalstore.in to view, correct, or delete your data at any time.</p>
    </Page>
  );
}

export function Terms() {
  return (
    <Page eyebrow="Legal" title="Terms of service">
      <h3>Orders & pricing</h3>
      <p>All prices are in INR and inclusive of GST. We reserve the right to cancel orders in case of pricing errors or stock issues, with a full refund.</p>
      <h3>Payments</h3>
      <p>We accept prepaid payments only (UPI, cards, netbanking, wallets) via Razorpay. Cash on delivery is not available.</p>
      <h3>Products</h3>
      <p>Handcrafted pieces may vary slightly in colour, veining, and finish — that's the signature of handmade, not a defect. Silver items are BIS-hallmarked as described.</p>
      <h3>Exchanges</h3>
      <p>Covered under our 7-day easy exchange policy. Refunds, where applicable, go to the original payment method within 5–7 working days.</p>
    </Page>
  );
}
