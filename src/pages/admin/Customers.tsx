import { useState, useEffect } from "react";
import { getUsers, getUserOrders } from "../../data/db";
import type { DemoUser, Order } from "../../data/db";
import { formatINR } from "../../data/products";

export function Customers() {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<DemoUser[]>([]);
  const [ordersByUser, setOrdersByUser] = useState<Record<string, Order[]>>({});
  useEffect(() => {
    getUsers().then((u) => {
      setUsers(u);
      u.forEach((x) => getUserOrders(x.id).then((o) => setOrdersByUser((prev) => ({ ...prev, [x.id]: o }))));
    });
  }, []);
  const filtered = users.filter((u) =>
    (u.name + u.email + u.phone).toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div>
      <h1 className="admin-title">Customers ({users.length})</h1>
      <input className="input" style={{ maxWidth: 360, marginBottom: 20 }} placeholder="Search name, email, phone…" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Customer</th><th>Contact</th><th>Orders</th><th>Spent</th><th>Since</th></tr></thead>
          <tbody>
            {filtered.map((u) => {
              const orders = ordersByUser[u.id] || [];
              const spent = orders.filter((o) => o.status !== "Cancelled").reduce((s, o) => s + o.total, 0);
              return (
                <tr key={u.id}>
                  <td><strong>{u.name}</strong></td>
                  <td>{u.email}<br /><small className="muted">{u.phone}</small></td>
                  <td>{orders.length}</td>
                  <td><strong>{formatINR(spent)}</strong></td>
                  <td className="muted">{new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="muted" style={{ padding: 24, textAlign: "center" }}>No customers yet.</p>}
      </div>
    </div>
  );
}
