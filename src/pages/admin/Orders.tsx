import { useState, useEffect } from "react";
import { getOrders, updateOrderStatus } from "../../data/db";
import type { Order, OrderStatus } from "../../data/db";
import { formatINR } from "../../data/products";

const STATUSES: OrderStatus[] = ["Placed", "Packed", "Shipped", "Out for delivery", "Delivered", "Cancelled"];

export function Orders() {
  const [list, setList] = useState<Order[]>([]);
  useEffect(() => { getOrders().then(setList); }, []);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [open, setOpen] = useState<Order | null>(null);

  const refresh = async () => {
    const all = await getOrders();
    setList(all);
    if (open) {
      const updated = all.find((o) => o.id === open.id);
      if (updated) setOpen(updated);
    }
  };

  const filtered = list.filter((o) => {
    const matchQ = (o.id + o.address.name + o.address.phone + o.address.city).toLowerCase().includes(q.toLowerCase());
    const matchS = statusFilter === "all" || o.status === statusFilter;
    return matchQ && matchS;
  });

  const setStatus = async (id: string, s: OrderStatus) => {
    await updateOrderStatus(id, s);
    refresh();
  };

  return (
    <div>
      <h1 className="admin-title">Orders ({list.length})</h1>
      <div className="admin-filters">
        <input className="input" style={{ maxWidth: 300 }} placeholder="Search ID, name, phone, city…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input" style={{ maxWidth: 200 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id}>
                <td><strong>{o.id}</strong><br /><small className="muted">{new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</small></td>
                <td>{o.address.name}<br /><small className="muted">{o.address.city}</small></td>
                <td>{o.items.reduce((s, i) => s + i.qty, 0)}</td>
                <td><strong>{formatINR(o.total)}</strong></td>
                <td>
                  <select className={`status-select s-${o.status.replace(/\s/g, "")}`} value={o.status}
                    onChange={(e) => setStatus(o.id, e.target.value as OrderStatus)}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td><button className="link-btn" onClick={() => setOpen(o)}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="muted" style={{ padding: 24, textAlign: "center" }}>No orders match.</p>}
      </div>

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(null)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3>{open.id}</h3>
              <span className={`status-pill s-${open.status.replace(/\s/g, "")}`}>{open.status}</span>
            </div>
            <div className="deliver-to" style={{ margin: "16px 0" }}>
              <strong>{open.address.name}</strong> · 📱 {open.address.phone}<br />
              {open.address.address}, {open.address.city}, {open.address.state} — {open.address.pincode}
            </div>
            {open.items.map((i) => (
              <div className="sum-line" key={i.productId}>
                <img src={i.image} alt={i.name} />
                <div><div className="sl-name">{i.name}</div><div className="sl-qty">Qty {i.qty}</div></div>
                <strong>{formatINR(i.price * i.qty)}</strong>
              </div>
            ))}
            <div className="tot-row" style={{ marginTop: 12 }}><span>Subtotal</span><span>{formatINR(open.subtotal)}</span></div>
            <div className="tot-row"><span>Shipping</span><span>{open.shipping === 0 ? "FREE" : formatINR(open.shipping)}</span></div>
            <div className="tot-row grand"><span>Total</span><strong>{formatINR(open.total)}</strong></div>
            <div style={{ marginTop: 16 }}>
              <label className="label">Update status</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                {STATUSES.map((s) => (
                  <button key={s} className={`status-btn ${open.status === s ? "active" : ""}`}
                    onClick={() => setStatus(open.id, s)}>{s}</button>
                ))}
              </div>
            </div>
            <button className="btn btn-outline" style={{ marginTop: 20, width: "100%" }} onClick={() => setOpen(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
