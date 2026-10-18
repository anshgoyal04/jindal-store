import { products as seedProducts } from "./products";
import type { Product } from "./products";

/* ------------------------------------------------------------------
   Demo data layer (localStorage). Every feature works end-to-end.
   Swap with Supabase: replace these functions with Supabase queries —
   the rest of the app (pages/components) stays the same.
------------------------------------------------------------------- */

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  pass: string; // demo only — never do this in production
  createdAt: string;
}

export interface Address {
  id: string;
  label: string;
  name: string;
  phone: string;
  pincode: string;
  address: string;
  city: string;
  state: string;
  isDefault?: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  qty: number;
}

export type OrderStatus = "Placed" | "Packed" | "Shipped" | "Out for delivery" | "Delivered" | "Cancelled";

export interface Order {
  id: string;
  userId: string | null;
  items: OrderItem[];
  address: Address;
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  paymentId: string;
  createdAt: string;
  timeline: { status: OrderStatus; at: string }[];
}

const K = {
  products: "js-db-products",
  users: "js-db-users",
  session: "js-db-session",
  addresses: "js-db-addresses",
  orders: "js-db-orders",
  wishlist: "js-db-wishlist",
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, val: unknown) {
  localStorage.setItem(key, JSON.stringify(val));
}
const uid = (p: string) => p + Math.random().toString(36).slice(2, 9).toUpperCase();

/* ---------------- Products ---------------- */
export function getProducts(): Product[] {
  const stored = read<Product[] | null>(K.products, null);
  if (!stored) {
    write(K.products, seedProducts);
    return seedProducts;
  }
  return stored;
}
export function saveProduct(p: Product) {
  const all = getProducts();
  const i = all.findIndex((x) => x.id === p.id);
  if (i >= 0) all[i] = p;
  else all.push(p);
  write(K.products, all);
}
export function deleteProduct(id: string) {
  write(K.products, getProducts().filter((x) => x.id !== id));
}
export function adjustStock(id: string, delta: number) {
  const all = getProducts();
  const p = all.find((x) => x.id === id);
  if (p) {
    p.stock = Math.max(0, p.stock + delta);
    write(K.products, all);
  }
}

/* ---------------- Users & session ---------------- */
export function getUsers(): DemoUser[] {
  return read<DemoUser[]>(K.users, []);
}
export function registerUser(u: Omit<DemoUser, "id" | "createdAt">): DemoUser | { error: string } {
  const users = getUsers();
  if (users.some((x) => x.email.toLowerCase() === u.email.toLowerCase()))
    return { error: "This email is already registered. Please log in." };
  const user: DemoUser = { ...u, id: uid("U"), createdAt: new Date().toISOString() };
  users.push(user);
  write(K.users, users);
  write(K.session, user.id);
  return user;
}
export function loginUser(email: string, pass: string): DemoUser | { error: string } {
  const user = getUsers().find((x) => x.email.toLowerCase() === email.toLowerCase());
  if (!user || user.pass !== pass) return { error: "Invalid email or password." };
  write(K.session, user.id);
  return user;
}
export function currentUser(): DemoUser | null {
  const id = read<string | null>(K.session, null);
  if (!id) return null;
  return getUsers().find((u) => u.id === id) || null;
}
export function logout() {
  localStorage.removeItem(K.session);
}

/* ---------------- Admin (demo) ---------------- */
export const ADMIN_EMAIL = "admin@jindalstore.in";
export const ADMIN_PASS = "admin123";
export function adminLogin(email: string, pass: string): boolean {
  if (email.toLowerCase() === ADMIN_EMAIL && pass === ADMIN_PASS) {
    write(K.session, "ADMIN");
    return true;
  }
  return false;
}
export function isAdmin(): boolean {
  return read<string | null>(K.session, null) === "ADMIN";
}

/* ---------------- Addresses ---------------- */
export function getAddresses(userId: string): Address[] {
  return read<Record<string, Address[]>>(K.addresses, {})[userId] || [];
}
export function saveAddress(userId: string, a: Address) {
  const all = read<Record<string, Address[]>>(K.addresses, {});
  const list = all[userId] || [];
  const i = list.findIndex((x) => x.id === a.id);
  if (a.isDefault) list.forEach((x) => (x.isDefault = false));
  if (i >= 0) list[i] = a;
  else list.push(a);
  all[userId] = list;
  write(K.addresses, all);
}
export function deleteAddress(userId: string, id: string) {
  const all = read<Record<string, Address[]>>(K.addresses, {});
  all[userId] = (all[userId] || []).filter((x) => x.id !== id);
  write(K.addresses, all);
}

/* ---------------- Orders ---------------- */
export function getOrders(): Order[] {
  return read<Order[]>(K.orders, []);
}
export function getUserOrders(userId: string): Order[] {
  return getOrders().filter((o) => o.userId === userId);
}
export function getOrder(id: string): Order | undefined {
  return getOrders().find((o) => o.id === id);
}
export function createOrder(o: Omit<Order, "id" | "createdAt" | "timeline" | "status">): Order {
  const order: Order = {
    ...o,
    id: "JS" + Date.now().toString().slice(-8),
    status: "Placed",
    createdAt: new Date().toISOString(),
    timeline: [{ status: "Placed", at: new Date().toISOString() }],
  };
  const all = getOrders();
  all.unshift(order);
  write(K.orders, all);
  // reduce stock
  o.items.forEach((i) => adjustStock(i.productId, -i.qty));
  return order;
}
export function updateOrderStatus(id: string, status: OrderStatus) {
  const all = getOrders();
  const o = all.find((x) => x.id === id);
  if (o) {
    o.status = status;
    o.timeline.push({ status, at: new Date().toISOString() });
    write(K.orders, all);
  }
}

/* ---------------- Wishlist ---------------- */
export function getWishlist(): string[] {
  return read<string[]>(K.wishlist, []);
}
export function toggleWishlist(id: string): string[] {
  const list = getWishlist();
  const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  write(K.wishlist, next);
  window.dispatchEvent(new Event("wishlist-changed"));
  return next;
}

export { uid };
