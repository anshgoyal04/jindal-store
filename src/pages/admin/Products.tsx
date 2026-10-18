import { useState, useEffect } from "react";
import { getProducts, saveProduct, deleteProduct, uid } from "../../data/db";
import { formatINR } from "../../data/products";
import type { Product } from "../../data/products";

const empty: Product = {
  id: "", name: "", category: "stone", subcategory: "Showpieces",
  price: 0, mrp: 0, rating: 5, reviews: 0,
  images: ["/images/products/marble-coaster-blue.jpg"], short: "", description: "",
  specs: [], stock: 10, sku: "",
};

const CATS = ["stone", "silver"] as const;

export function Products() {
  const [list, setList] = useState<Product[]>([]);
  useEffect(() => { getProducts().then(setList); }, []);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);

  const refresh = () => getProducts().then(setList);
  const filtered = list.filter((p) =>
    (p.name + p.sku + p.category).toLowerCase().includes(q.toLowerCase())
  );

  const startNew = () => {
    const id = uid("P").toLowerCase();
    setEditing({ ...empty, id, sku: "JS-" + id.slice(1).toUpperCase() });
  };

  const save = async () => {
    if (!editing || editing.name.trim().length < 3 || editing.price <= 0) return;
    await saveProduct({ ...editing, mrp: Math.max(editing.mrp, editing.price) });
    setEditing(null);
    refresh();
  };

  return (
    <div>
      <div className="admin-head">
        <h1 className="admin-title">Products ({list.length})</h1>
        <button className="btn btn-dark btn-sm" onClick={startNew}>+ Add product</button>
      </div>
      <input className="input" style={{ maxWidth: 360, marginBottom: 20 }} placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} />

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr></thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td><div className="at-prod"><img src={p.images[0]} alt="" /><span>{p.name}<small>{p.sku}</small></span></div></td>
                <td><span className="cat-pill">{p.category}</span></td>
                <td>{formatINR(p.price)}</td>
                <td><strong style={{ color: p.stock <= 10 ? "var(--red)" : "inherit" }}>{p.stock}</strong></td>
                <td className="at-actions">
                  <button className="link-btn" onClick={() => setEditing(p)}>Edit</button>
                  <button className="link-btn danger" onClick={() => { if (confirm(`Delete "${p.name}"?`)) { deleteProduct(p.id); refresh(); } }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <h3>{list.some((x) => x.id === editing.id) ? "Edit" : "Add"} product</h3>
            <div className="form-grid" style={{ marginTop: 16 }}>
              <div style={{ gridColumn: "1 / -1" }}><label className="label">Name</label>
                <input className="input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div><label className="label">Price (₹)</label>
                <input className="input" type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: +e.target.value })} /></div>
              <div><label className="label">MRP (₹)</label>
                <input className="input" type="number" value={editing.mrp} onChange={(e) => setEditing({ ...editing, mrp: +e.target.value })} /></div>
              <div><label className="label">Category</label>
                <select className="input" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value as Product["category"] })}>
                  {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select></div>
              <div><label className="label">Subcategory</label>
                <input className="input" value={editing.subcategory} onChange={(e) => setEditing({ ...editing, subcategory: e.target.value })} placeholder="Showpieces" /></div>
              <div><label className="label">Stock</label>
                <input className="input" type="number" value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: +e.target.value })} /></div>
              <div><label className="label">Image path</label>
                <input className="input" value={editing.images[0]} onChange={(e) => setEditing({ ...editing, images: [e.target.value] })} placeholder="/images/products/marble-coaster-blue.jpg" /></div>
              <div><label className="label">Badge</label>
                <select className="input" value={editing.badge || ""} onChange={(e) => setEditing({ ...editing, badge: (e.target.value || undefined) as Product["badge"] })}>
                  <option value="">None</option>
                  <option value="new">New</option>
                  <option value="sale">Sale</option>
                  <option value="bestseller">Bestseller</option>
                  <option value="handmade">Handmade</option>
                </select></div>
              <div style={{ gridColumn: "1 / -1" }}><label className="label">Short description</label>
                <input className="input" value={editing.short} onChange={(e) => setEditing({ ...editing, short: e.target.value })} /></div>
              <div style={{ gridColumn: "1 / -1" }}><label className="label">Full description</label>
                <textarea className="input" rows={3} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} style={{ resize: "vertical" }} /></div>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button className="btn btn-dark" style={{ flex: 1 }} onClick={save}>Save product</button>
              <button className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
