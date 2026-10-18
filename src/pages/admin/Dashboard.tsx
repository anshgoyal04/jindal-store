import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getOrders, getUsers, getProducts } from "../../data/db";
import type { Order } from "../../data/db";
import type { Product } from "../../data/products";
import { formatINR } from "../../data/products";

export function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    getOrders().then(setOrders);
    getUsers().then((u) => setUserCount(u.length));
    getProducts().then(setProducts);
  }, []);

  const revenue = orders.filter((o) => o.status !== "Cancelled").reduce((s, o) => s + o.total, 0);
  const lowStock = products.filter((p) => p.stock <= 10);
  const recent = orders.slice(0, 5);

  const stats = [
    { label: "Total revenue", value: formatINR(revenue), icon: "💰" },
    { label: "Orders", value: String(orders.length), icon: "🧾" },
    { label: "Customers", value: String(userCount), icon: "👥" },
    { label: "Products", value: String(products.length), icon: "📦" },
  ];

  return (
    <div>
      <h1 className="admin-title">Dashboard</h1>
      <div className="stat-grid">
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="admin-grid2">
        <div className="admin-card">
          <div className="admin-card-head"><h3>Recent orders</h3><Link to="/admin/orders">View all →</Link></div>
          {recent.length === 0 ? <p className="muted">No orders yet.</p> :
            recent.map((o) => (
              <div className="admin-row" key={o.id}>
                <strong>{o.id}</strong>
                <span className="muted">{o.items.reduce((s, i) => s + i.qty, 0)} items</span>
                <span className={`status-pill s-${o.status.replace(/\s/g, "")}`}>{o.status}</span>
                <strong>{formatINR(o.total)}</strong>
              </div>
            ))}
        </div>
        <div className="admin-card">
          <div className="admin-card-head"><h3>Low stock ⚠️</h3><Link to="/admin/products">Manage →</Link></div>
          {lowStock.length === 0 ? <p className="muted">All stocked up. 🎉</p> :
            lowStock.map((p) => (
              <div className="admin-row" key={p.id}>
                <img src={p.images[0]} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover" }} />
                <span style={{ flex: 1 }}>{p.name}</span>
                <strong style={{ color: p.stock === 0 ? "var(--red)" : "var(--gold-dark)" }}>{p.stock} left</strong>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
