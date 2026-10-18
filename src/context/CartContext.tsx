import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { products } from "../data/products";
import type { Product } from "../data/products";

export interface CartItem {
  productId: string;
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (productId: string, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  detailed: { product: Product; qty: number }[];
}

const CartContext = createContext<CartContextValue | null>(null);
const KEY = "js-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch {
      return [];
    }
  });
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const detailed = useMemo(
    () =>
      items
        .map((i) => ({ product: products.find((p) => p.id === i.productId)!, qty: i.qty }))
        .filter((d) => d.product),
    [items]
  );

  const value: CartContextValue = {
    items,
    count: items.reduce((s, i) => s + i.qty, 0),
    subtotal: detailed.reduce((s, d) => s + d.product.price * d.qty, 0),
    add: (productId, qty = 1) =>
      setItems((prev) => {
        const ex = prev.find((i) => i.productId === productId);
        if (ex) return prev.map((i) => (i.productId === productId ? { ...i, qty: i.qty + qty } : i));
        return [...prev, { productId, qty }];
      }),
    remove: (productId) => setItems((prev) => prev.filter((i) => i.productId !== productId)),
    setQty: (productId, qty) =>
      setItems((prev) =>
        qty <= 0 ? prev.filter((i) => i.productId !== productId) : prev.map((i) => (i.productId === productId ? { ...i, qty } : i))
      ),
    clear: () => setItems([]),
    isOpen,
    setOpen,
    detailed,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
