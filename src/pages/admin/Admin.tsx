import { useState } from "react";
import { useNavigate, Link, Outlet, NavLink } from "react-router-dom";
import { adminLogin, ADMIN_EMAIL } from "../../data/db";
import { useAuth } from "../../context/AuthContext";

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();
  const { refresh } = useAuth();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await adminLogin(email.trim(), pass)) {
      refresh();
      nav("/admin");
    } else setErr("Invalid admin credentials.");
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="eyebrow">Restricted area</div>
        <h1 className="h2" style={{ marginBottom: 8 }}>Admin login</h1>
        <p className="auth-sub">Demo credentials: {ADMIN_EMAIL} / admin123</p>
        <form onSubmit={submit} className="auth-form">
          <div><label className="label">Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div><label className="label">Password</label>
            <input className="input" type="password" value={pass} onChange={(e) => setPass(e.target.value)} required /></div>
          {err && <p className="err">{err}</p>}
          <button className="btn btn-dark" style={{ width: "100%" }}>Enter dashboard</button>
        </form>
        <p className="auth-switch"><Link to="/">← Back to store</Link></p>
      </div>
    </div>
  );
}

export function AdminLayout() {
  const nav = useNavigate();
  const { logout, admin, ready } = useAuth();

  if (!ready) {
    return <div className="container" style={{ padding: "120px 0", textAlign: "center" }}><p className="lede">Loading…</p></div>;
  }

  if (!admin) {
    return (
      <div className="container" style={{ padding: "120px 0", textAlign: "center" }}>
        <h1 className="h2">Admins only</h1>
        <p className="lede" style={{ margin: "16px auto 28px" }}>Please log in with an admin account.</p>
        <Link to="/admin/login" className="btn btn-dark">Admin login</Link>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <Link to="/admin" className="admin-brand">
          <span className="logo-badge" style={{ width: 36, height: 36, fontSize: 14 }}>JS</span>
          <span><strong>Jindal Store</strong><br /><small>Admin</small></span>
        </Link>
        <nav className="admin-nav">
          <NavLink to="/admin" end>📊 Dashboard</NavLink>
          <NavLink to="/admin/products">📦 Products</NavLink>
          <NavLink to="/admin/orders">🧾 Orders</NavLink>
          <NavLink to="/admin/customers">👥 Customers</NavLink>
        </nav>
        <div className="admin-side-foot">
          <Link to="/" className="admin-link">← View store</Link>
          <button className="admin-link" onClick={() => { logout(); nav("/admin/login"); }}>Log out</button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
