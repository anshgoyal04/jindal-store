import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { formatINR } from "../data/products";
import type { Product } from "../data/products";
import { getProducts } from "../data/db";
import { ProductCard } from "../components/ProductCard";

export function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => { getProducts().then(setProducts); }, []);
  const [params] = useSearchParams();
  const [cat, setCat] = useState(params.get("cat") || "all");
  const [sort, setSort] = useState("featured");
  const [maxPrice, setMaxPrice] = useState(10000);
  const q = (params.get("q") || "").toLowerCase();

  const filtered = useMemo(() => {
    let list = products.filter(
      (p) =>
        (cat === "all" || p.category === cat) &&
        p.price <= maxPrice &&
        (!q || (p.name + p.short + p.subcategory).toLowerCase().includes(q))
    );
    if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [cat, sort, maxPrice, q, products]);

  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 96 }}>
      <div className="eyebrow">The catalogue</div>
      <h1 className="h2" style={{ marginBottom: 8 }}>
        {q ? `Results for "${params.get("q")}"` : "Shop all pieces"}
      </h1>
      <p className="lede" style={{ marginBottom: 36 }}>{filtered.length} handcrafted pieces</p>

      <div className="shop-layout">
        <aside className="filters">
          <div className="filter-block">
            <h4>Collection</h4>
            {[
              ["all", "All"],
              ["stone", "Stone"],
              ["silver", "Silver"],
            ].map(([v, label]) => (
              <label key={v} className="check">
                <input type="radio" name="cat" checked={cat === v} onChange={() => setCat(v)} />
                {label}
              </label>
            ))}
          </div>
          <div className="filter-block">
            <h4>Max price: {formatINR(maxPrice)}</h4>
            <input
              type="range"
              min={500}
              max={10000}
              step={100}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="range"
            />
          </div>
          <div className="filter-block">
            <h4>Sort by</h4>
            <select className="select" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="featured">Featured</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
              <option value="rating">Top rated</option>
            </select>
          </div>
        </aside>
        <div className="prod-grid shop-grid">
          {filtered.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </div>
      {filtered.length === 0 && (
        <p style={{ textAlign: "center", padding: 60, color: "var(--text-soft)" }}>
          No pieces match your filters — try widening the price range.
        </p>
      )}
    </div>
  );
}
