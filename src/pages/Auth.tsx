import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../data/db";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();
  const { refresh } = useAuth();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await loginUser(email.trim(), pass);
    if ("error" in res) setErr(res.error);
    else {
      refresh();
      nav("/account");
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="eyebrow">Welcome back</div>
        <h1 className="h2" style={{ marginBottom: 8 }}>Log in</h1>
        <p className="auth-sub">Track orders, manage addresses, checkout faster.</p>
        <form onSubmit={submit} className="auth-form">
          <div><label className="label">Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></div>
          <div><label className="label">Password</label>
            <input className="input" type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••" required /></div>
          {err && <p className="err">{err}</p>}
          <button className="btn btn-dark" style={{ width: "100%" }}>Log in</button>
        </form>
        <p className="auth-switch">New here? <Link to="/signup">Create an account</Link></p>
      </div>
    </div>
  );
}

export function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();
  const { refresh } = useAuth();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(phone)) { setErr("Enter a valid 10-digit mobile number."); return; }
    if (pass.length < 6) { setErr("Password must be at least 6 characters."); return; }
    const res = await registerUser({ name: name.trim(), email: email.trim(), phone, pass });
    if ("error" in res) setErr(res.error);
    else {
      refresh();
      nav("/account");
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="eyebrow">Join Jindal Store</div>
        <h1 className="h2" style={{ marginBottom: 8 }}>Create account</h1>
        <p className="auth-sub">One account for orders, wishlist and faster checkout.</p>
        <form onSubmit={submit} className="auth-form">
          <div><label className="label">Full name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Priya Sharma" required /></div>
          <div><label className="label">Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></div>
          <div><label className="label">Mobile</label>
            <input className="input" value={phone} maxLength={10} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} placeholder="98765 43210" required /></div>
          <div><label className="label">Password</label>
            <input className="input" type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Min. 6 characters" required /></div>
          {err && <p className="err">{err}</p>}
          <button className="btn btn-dark" style={{ width: "100%" }}>Create account</button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p>
      </div>
    </div>
  );
}
