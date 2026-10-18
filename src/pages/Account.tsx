import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getUserOrders, getAddresses, saveAddress, deleteAddress,
  getWishlist, toggleWishlist, uid, getProducts,
} from "../data/db";
import type { Address, Order } from "../data/db";
import { formatINR } from "../data/products";
import type { Product } from "../data/products";

type Tab = "orders" | "addresses" | "wishlist" | "profile";

export function Account() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>("orders");

  if (!user) {
    return (
      <div className="container" style={{ padding: "120px 0", textAlign: "center" }}>
        <h1 className="h2">Please log in</h1>
        <p className="lede" style={{ margin: "16px auto 28px" }}>Your orders and addresses live here.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Link to="/login" className="btn btn-dark">Log in</Link>
          <Link to="/signup" className="btn btn-outline">Sign up</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "48px 0 96px" }}>
      <div className="eyebrow">My account</div>
      <h1 className="h2" style={{ marginBottom: 6 }}>Namaste, {user.name.split(" ")[0]}</h1>
      <p className="lede" style={{ marginBottom: 32 }}>{user.email} · {user.phone}</p>

      <div className="acct-tabs">
        {(["orders", "addresses", "wishlist", "profile"] as Tab[]).map((t) => (
          <button key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
        <button className="logout-btn" onClick={() => { logout(); nav("/"); }}>Log out</button>
      </div>

      {tab === "orders" && <OrdersTab userId={user.id} />}
      {tab === "addresses" && <AddressesTab userId={user.id} />}
      {tab === "wishlist" && <WishlistTab />}
      {tab === "profile" && <ProfileTab />}
    </div>
  );
}

function OrdersTab({ userId }: { userId: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => { getUserOrders(userId).then(setOrders); }, [userId]);
  if (!orders.length)
    return <EmptyState title="No orders yet" text="Your orders will appear here once you shop." link="/shop" linkText="Start shopping" />;
  return (
    <div className="order-list">
      {orders.map((o) => (
        <Link to={`/track/${o.id}`} key={o.id} className="order-card">
          <div className="oc-imgs">{o.items.slice(0, 3).map((i) => <img key={i.productId} src={i.image} alt="" />)}</div>
          <div className="oc-info">
            <strong>{o.id}</strong>
            <span>{new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {o.items.reduce((s, i) => s + i.qty, 0)} items</span>
          </div>
          <span className={`status-pill s-${o.status.replace(/\s/g, "")}`}>{o.status}</span>
          <strong>{formatINR(o.total)}</strong>
        </Link>
      ))}
    </div>
  );
}

function AddressesTab({ userId }: { userId: string }) {
  const [list, setList] = useState<Address[]>([]);
  const [form, setForm] = useState<Address | null>(null);

  const refresh = () => getAddresses(userId).then(setList);
  useEffect(() => { refresh(); }, [userId]);
  const startNew = () =>
    setForm({ id: uid("A"), label: "Home", name: "", phone: "", pincode: "", address: "", city: "", state: "", isDefault: list.length === 0 });

  const save = async () => {
    if (!form || form.name.trim().length < 3 || !/^[6-9]\d{9}$/.test(form.phone) || !/^\d{6}$/.test(form.pincode) || form.address.trim().length < 10) return;
    await saveAddress(userId, form);
    setForm(null);
    refresh();
  };

  return (
    <div>
      <div className="addr-grid">
        {list.map((a) => (
          <div className="addr-card" key={a.id}>
            <div className="addr-label">{a.label}{a.isDefault && <span className="def">Default</span>}</div>
            <p><strong>{a.name}</strong><br />{a.address}, {a.city}, {a.state} — {a.pincode}<br />📱 {a.phone}</p>
            <div className="addr-actions">
              <button className="link-btn" onClick={() => setForm(a)}>Edit</button>
              <button className="link-btn danger" onClick={() => { deleteAddress(userId, a.id).then(refresh); }}>Delete</button>
            </div>
          </div>
        ))}
        <button className="addr-add" onClick={startNew}>+ Add new address</button>
      </div>

      {form && (
        <div className="modal-overlay" onClick={() => setForm(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{list.some((x) => x.id === form.id) ? "Edit" : "Add"} address</h3>
            <div className="form-grid" style={{ marginTop: 16 }}>
              <div><label className="label">Label</label>
                <select className="input" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })}>
                  <option>Home</option><option>Work</option><option>Other</option>
                </select></div>
              <div><label className="label">Full name</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><label className="label">Mobile</label>
                <input className="input" maxLength={10} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })} /></div>
              <div><label className="label">Pincode</label>
                <input className="input" maxLength={6} value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, "") })} /></div>
              <div style={{ gridColumn: "1 / -1" }}><label className="label">Address</label>
                <input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
              <div><label className="label">City</label>
                <input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
              <div><label className="label">State</label>
                <input className="input" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></div>
            </div>
            <label className="check"><input type="checkbox" checked={!!form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} /> Set as default</label>
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button className="btn btn-dark" style={{ flex: 1 }} onClick={save}>Save address</button>
              <button className="btn btn-outline" onClick={() => setForm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WishlistTab() {
  const [ids, setIds] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    getWishlist().then(setIds);
    getProducts().then(setProducts);
  }, []);
  const shown = products.filter((p) => ids.includes(p.id));
  if (!shown.length)
    return <EmptyState title="Wishlist is empty" text="Tap the heart on any product to save it here." link="/shop" linkText="Discover products" />;
  return (
    <div className="wish-grid">
      {shown.map((p) => (
        <div className="wish-card" key={p.id}>
          <Link to={`/product/${p.id}`}><img src={p.images[0]} alt={p.name} /></Link>
          <div className="wish-info">
            <Link to={`/product/${p.id}`} className="wish-name">{p.name}</Link>
            <strong>{formatINR(p.price)}</strong>
          </div>
          <button className="link-btn danger" onClick={() => toggleWishlist(p.id).then(setIds)}>Remove</button>
        </div>
      ))}
    </div>
  );
}

function ProfileTab() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="co-card" style={{ maxWidth: 560 }}>
      <div className="profile-row"><span>Name</span><strong>{user.name}</strong></div>
      <div className="profile-row"><span>Email</span><strong>{user.email}</strong></div>
      <div className="profile-row"><span>Mobile</span><strong>{user.phone}</strong></div>
      <div className="profile-row"><span>Member since</span><strong>{new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</strong></div>
    </div>
  );
}

export function EmptyState({ title, text, link, linkText }: { title: string; text: string; link: string; linkText: string }) {
  return (
    <div className="empty-tab">
      <h3>{title}</h3>
      <p>{text}</p>
      <Link to={link} className="btn btn-dark btn-sm">{linkText}</Link>
    </div>
  );
}
