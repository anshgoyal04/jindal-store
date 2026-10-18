import { supabase, isCloud } from "./supabase";
import * as local from "./local";
import type { Product } from "./products";
import type { DemoUser, Address, Order, OrderStatus } from "./local";

export type { DemoUser, Address, Order, OrderStatus };
export type { OrderItem } from "./local";
export { uid, ADMIN_EMAIL, ADMIN_PASS } from "./local";

/* When VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set, every function
   below talks to Supabase. Otherwise it falls back to the localStorage
   demo store, so the app works out of the box with zero setup. */

function authErr(msg: string): string {
  if (/invalid login credentials/i.test(msg)) return "Invalid email or password.";
  if (/already registered|already exists/i.test(msg)) return "This email is already registered. Please log in.";
  if (/password/i.test(msg) && /short|weak|6/i.test(msg)) return "Password must be at least 6 characters.";
  return msg;
}

async function getProfile(userId: string) {
  const { data } = await supabase().from("profiles").select("*").eq("id", userId).single();
  return data;
}

function toDemoUser(authUser: any, profile: any): DemoUser {
  return {
    id: authUser.id,
    name: profile?.name || authUser.user_metadata?.name || "",
    email: profile?.email || authUser.email || "",
    phone: profile?.phone || authUser.user_metadata?.phone || "",
    pass: "",
    createdAt: profile?.created_at || authUser.created_at,
  };
}

function toOrder(row: any): Order {
  return {
    id: row.id,
    userId: row.user_id ?? null,
    items: row.items,
    address: row.address,
    subtotal: row.subtotal,
    shipping: row.shipping,
    total: row.total,
    status: row.status,
    paymentId: row.payment_id,
    createdAt: row.created_at,
    timeline: row.timeline || [],
  };
}

/* ---------------- Products ---------------- */
export async function getProducts(): Promise<Product[]> {
  if (!isCloud()) return local.getProducts();
  const { data, error } = await supabase().from("products").select("*").order("name");
  if (error) throw error;
  return (data || []) as Product[];
}

export async function saveProduct(p: Product): Promise<void> {
  if (!isCloud()) return local.saveProduct(p);
  const { error } = await supabase().from("products").upsert(p);
  if (error) throw error;
}

export async function deleteProduct(id: string): Promise<void> {
  if (!isCloud()) return local.deleteProduct(id);
  const { error } = await supabase().from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function adjustStock(id: string, delta: number): Promise<void> {
  if (!isCloud()) return local.adjustStock(id, delta);
  // In cloud mode the `orders_apply_stock` DB trigger decrements stock
  // automatically on order insert (customers can't write products via RLS),
  // so there is nothing to do here.
}

/* ---------------- Users & session ---------------- */
export async function getUsers(): Promise<DemoUser[]> {
  if (!isCloud()) return local.getUsers();
  const { data, error } = await supabase().from("profiles").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((p: any) => ({
    id: p.id, name: p.name || "", email: p.email || "", phone: p.phone || "",
    pass: "", createdAt: p.created_at,
  }));
}

export async function registerUser(u: Omit<DemoUser, "id" | "createdAt">): Promise<DemoUser | { error: string }> {
  if (!isCloud()) return local.registerUser(u);
  const { data, error } = await supabase().auth.signUp({
    email: u.email,
    password: u.pass,
    options: { data: { name: u.name, phone: u.phone } },
  });
  if (error) return { error: authErr(error.message) };
  if (!data.user) return { error: "Could not create account. Please try again." };
  const profile = await getProfile(data.user.id);
  return toDemoUser(data.user, profile);
}

export async function loginUser(email: string, pass: string): Promise<DemoUser | { error: string }> {
  if (!isCloud()) return local.loginUser(email, pass);
  const { data, error } = await supabase().auth.signInWithPassword({ email, password: pass });
  if (error) return { error: authErr(error.message) };
  const profile = await getProfile(data.user.id);
  return toDemoUser(data.user, profile);
}

export async function currentUser(): Promise<DemoUser | null> {
  if (!isCloud()) return local.currentUser();
  const { data: { session } } = await supabase().auth.getSession();
  if (!session?.user) return null;
  const profile = await getProfile(session.user.id);
  return toDemoUser(session.user, profile);
}

export async function logout(): Promise<void> {
  if (!isCloud()) return local.logout();
  await supabase().auth.signOut();
}

export async function isAdmin(): Promise<boolean> {
  if (!isCloud()) return local.isAdmin();
  const { data: { session } } = await supabase().auth.getSession();
  if (!session?.user) return false;
  const profile = await getProfile(session.user.id);
  return !!profile?.is_admin;
}

export async function adminLogin(email: string, pass: string): Promise<boolean> {
  if (!isCloud()) return local.adminLogin(email, pass);
  const { data, error } = await supabase().auth.signInWithPassword({ email, password: pass });
  if (error || !data.user) return false;
  const profile = await getProfile(data.user.id);
  if (!profile?.is_admin) {
    await supabase().auth.signOut();
    return false;
  }
  return true;
}

/* ---------------- Addresses ---------------- */
export async function getAddresses(userId: string): Promise<Address[]> {
  if (!isCloud()) return local.getAddresses(userId);
  const { data, error } = await supabase().from("addresses").select("*").eq("user_id", userId).order("created_at");
  if (error) throw error;
  return (data || []).map((r: any) => ({
    id: r.id, label: r.label, name: r.name, phone: r.phone, pincode: r.pincode,
    address: r.address, city: r.city, state: r.state, isDefault: r.is_default,
  }));
}

export async function saveAddress(userId: string, a: Address): Promise<void> {
  if (!isCloud()) return local.saveAddress(userId, a);
  const sb = supabase();
  if (a.isDefault) {
    await sb.from("addresses").update({ is_default: false }).eq("user_id", userId);
  }
  // Cloud addresses.id is uuid; the local demo uses "A..." text ids —
  // mint a real uuid for new addresses so the upsert doesn't 400.
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(a.id || "");
  const row = {
    id: isUuid ? a.id : crypto.randomUUID(), user_id: userId, label: a.label, name: a.name, phone: a.phone,
    pincode: a.pincode, address: a.address, city: a.city, state: a.state,
    is_default: !!a.isDefault,
  };
  const { error } = await sb.from("addresses").upsert(row);
  if (error) throw error;
}

export async function deleteAddress(userId: string, id: string): Promise<void> {
  if (!isCloud()) return local.deleteAddress(userId, id);
  const { error } = await supabase().from("addresses").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
}

/* ---------------- Orders ---------------- */
export async function getOrders(): Promise<Order[]> {
  if (!isCloud()) return local.getOrders();
  const { data, error } = await supabase().from("orders").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(toOrder);
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  if (!isCloud()) return local.getUserOrders(userId);
  const { data, error } = await supabase().from("orders").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(toOrder);
}

export async function getOrder(id: string): Promise<Order | undefined> {
  if (!isCloud()) return local.getOrder(id);
  const { data, error } = await supabase().from("orders").select("*").eq("id", id.toUpperCase()).single();
  if (error) return undefined;
  return data ? toOrder(data) : undefined;
}

export async function createOrder(o: Omit<Order, "id" | "createdAt" | "timeline" | "status">): Promise<Order> {
  if (!isCloud()) return local.createOrder(o);
  const order: Order = {
    ...o,
    id: "JS" + Date.now().toString().slice(-8),
    status: "Placed",
    createdAt: new Date().toISOString(),
    timeline: [{ status: "Placed", at: new Date().toISOString() }],
  };
  const { error } = await supabase().from("orders").insert({
    id: order.id,
    user_id: order.userId,
    items: order.items,
    address: order.address,
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    status: order.status,
    payment_id: order.paymentId,
    timeline: order.timeline,
  });
  if (error) throw error;
  for (const i of o.items) await adjustStock(i.productId, -i.qty);
  return order;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  if (!isCloud()) return local.updateOrderStatus(id, status);
  const sb = supabase();
  const { data } = await sb.from("orders").select("timeline").eq("id", id).single();
  const timeline = [...(data?.timeline || []), { status, at: new Date().toISOString() }];
  const { error } = await sb.from("orders").update({ status, timeline }).eq("id", id);
  if (error) throw error;
}

/* ---------------- Wishlist ---------------- */
export async function getWishlist(): Promise<string[]> {
  if (!isCloud()) return local.getWishlist();
  const { data: { session } } = await supabase().auth.getSession();
  if (!session?.user) return [];
  const { data, error } = await supabase().from("wishlist").select("product_id").eq("user_id", session.user.id);
  if (error) throw error;
  return (data || []).map((r: any) => r.product_id);
}

export async function toggleWishlist(id: string): Promise<string[]> {
  if (!isCloud()) return local.toggleWishlist(id);
  const sb = supabase();
  const { data: { session } } = await sb.auth.getSession();
  if (!session?.user) return [];
  const userId = session.user.id;
  const { data: existing } = await sb.from("wishlist").select("product_id").eq("user_id", userId).eq("product_id", id).single();
  if (existing) {
    await sb.from("wishlist").delete().eq("user_id", userId).eq("product_id", id);
  } else {
    await sb.from("wishlist").insert({ user_id: userId, product_id: id });
  }
  window.dispatchEvent(new Event("wishlist-changed"));
  return getWishlist();
}
