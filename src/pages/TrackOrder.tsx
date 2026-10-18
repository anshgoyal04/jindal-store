import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrder } from "../data/db";
import type { OrderStatus } from "../data/db";
import { formatINR } from "../data/products";

const STEPS: OrderStatus[] = ["Placed", "Packed", "Shipped", "Out for delivery", "Delivered"];

export function TrackOrder() {
  const { id } = useParams();
  const [query, setQuery] = useState(id || "");
  const [searched, setSearched] = useState(!!id);
  const [order, setOrder] = useState<Awaited<ReturnType<typeof getOrder>>>(undefined);
  useEffect(() => {
    if (searched) getOrder(query.trim().toUpperCase()).then(setOrder);
  }, [searched, query]);

  const doSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
  };

  const stepIdx = order ? (order.status === "Cancelled" ? -1 : STEPS.indexOf(order.status)) : -1;

  return (
    <div className="container" style={{ padding: "48px 0 96px", maxWidth: 760 }}>
      <div className="eyebrow">Track your order</div>
      <h1 className="h2" style={{ marginBottom: 24 }}>Where's my package?</h1>

      <form onSubmit={doSearch} className="track-form">
        <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Enter order ID (e.g. JS48291375)" />
        <button className="btn btn-dark">Track</button>
      </form>

      {searched && !order && (
        <div className="co-card" style={{ marginTop: 24, textAlign: "center" }}>
          <p>No order found with ID <strong>{query}</strong>. Check the ID from your confirmation.</p>
        </div>
      )}

      {order && (
        <div style={{ marginTop: 24 }}>
          <div className="co-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div><strong style={{ fontSize: 18 }}>{order.id}</strong>
                <div style={{ color: "var(--text-soft)", fontSize: 14, marginTop: 4 }}>
                  Placed {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} · {formatINR(order.total)}
                </div></div>
              <span className={`status-pill s-${order.status.replace(/\s/g, "")}`}>{order.status}</span>
            </div>

            {order.status === "Cancelled" ? (
              <p style={{ marginTop: 20, color: "var(--red)" }}>This order was cancelled. Contact us for help with a refund.</p>
            ) : (
              <div className="timeline">
                {STEPS.map((s, i) => {
                  const t = order.timeline.find((x) => x.status === s);
                  return (
                    <div className={`tl-step ${i <= stepIdx ? "done" : ""}`} key={s}>
                      <div className="tl-dot">{i < stepIdx ? "✓" : i === stepIdx ? "●" : "○"}</div>
                      <div className="tl-info">
                        <strong>{s}</strong>
                        {t && <span>{new Date(t.at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}, {new Date(t.at).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <h4 style={{ margin: "28px 0 12px" }}>Items</h4>
            {order.items.map((i) => (
              <div className="sum-line" key={i.productId}>
                <img src={i.image} alt={i.name} />
                <div><div className="sl-name">{i.name}</div><div className="sl-qty">Qty {i.qty}</div></div>
                <strong>{formatINR(i.price * i.qty)}</strong>
              </div>
            ))}
            <div className="deliver-to" style={{ marginTop: 20 }}>
              <strong>Delivering to:</strong><br />
              {order.address.name}, {order.address.address}, {order.address.city}, {order.address.state} — {order.address.pincode}
            </div>
          </div>
          <p style={{ textAlign: "center", marginTop: 20 }}>
            <Link to="/contact" className="link-btn">Need help with this order?</Link>
          </p>
        </div>
      )}
    </div>
  );
}
