import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config';
import type { Product } from '../data/products';
import type { Promo } from '../data/promos';
import type { BannerData } from '../data/banners';
import type { Order, OrderStatus } from '../context/StoreContext';

let client: SupabaseClient | null = null;

export function sb(): SupabaseClient | null {
  if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) return null;
  if (!client) client = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
  return client;
}

export const supabaseEnabled = (): boolean => !!sb();

export async function authSendOtp(email: string): Promise<void> {
  const s = sb();
  if (!s) throw new Error('supabase disabled');
  const { error } = await s.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
  if (error) throw error;
}

export async function authVerifyOtp(email: string, token: string): Promise<{ id: string; email: string }> {
  const s = sb();
  if (!s) throw new Error('supabase disabled');
  const { data, error } = await s.auth.verifyOtp({ email, token, type: 'email' });
  if (error) throw error;
  return { id: data.user!.id, email: data.user!.email ?? email };
}

export async function authRestore(): Promise<{ id: string; email: string } | null> {
  const s = sb();
  if (!s) return null;
  const { data } = await s.auth.getSession();
  const u = data.session?.user;
  return u ? { id: u.id, email: u.email ?? '' } : null;
}

export async function authSignOut(): Promise<void> {
  const s = sb();
  if (!s) return;
  await s.auth.signOut();
}

export function onAuthChange(cb: (user: { id: string; email: string } | null) => void): void {
  const s = sb();
  if (!s) return;
  s.auth.onAuthStateChange((_event, session) => {
    cb(session?.user ? { id: session.user.id, email: session.user.email ?? '' } : null);
  });
}

export interface SbProfile {
  name: string;
  phone: string;
  bonusBalance: number;
  isAdmin: boolean;
}

export async function fetchProfile(userId: string): Promise<SbProfile | null> {
  const s = sb();
  if (!s) return null;
  const { data, error } = await s
    .from('profiles')
    .select('name, phone, bonus_balance, is_admin')
    .eq('id', userId)
    .single();
  if (error || !data) return null;
  return {
    name: data.name ?? '',
    phone: data.phone ?? '',
    bonusBalance: data.bonus_balance ?? 0,
    isAdmin: !!data.is_admin,
  };
}

export async function updateProfile(userId: string, patch: { name?: string; phone?: string }): Promise<void> {
  const s = sb();
  if (!s) throw new Error('supabase disabled');
  const { error } = await s.from('profiles').update(patch).eq('id', userId);
  if (error) throw error;
}

export async function fetchSubscription(userId: string) {
  const s = sb();
  if (!s) return null;
  const { data } = await s.from('subscriptions').select('plan, until, paused').eq('user_id', userId).single();
  if (!data) return null;
  return { plan: data.plan as 'month' | 'year', until: new Date(data.until).getTime(), paused: !!data.paused };
}

export async function clubSubscribe(plan: 'month' | 'year'): Promise<number> {
  const s = sb();
  if (!s) throw new Error('supabase disabled');
  const { data, error } = await s.rpc('club_subscribe', { p_plan: plan });
  if (error) throw error;
  return new Date(data).getTime();
}

function normProduct(r: any): Product {
  return {
    id: r.id,
    name: r.name,
    brand: r.brand ?? '',
    category: ['energy', 'water', 'lemonade', 'tonic'].includes(r.category) ? r.category : 'energy',
    volume: Number(r.volume) || 0.5,
    price: Number(r.price) || 0,
    flavors: Array.isArray(r.flavors) && r.flavors.length ? r.flavors : ['без вкуса'],
    caffeine: Number(r.caffeine) || 0,
    kcal: Number(r.kcal) || 0,
    protein: Number(r.protein) || 0,
    fat: Number(r.fat) || 0,
    carbs: Number(r.carbs) || 0,
    composition: r.composition ?? '',
    description: r.description ?? '',
    badge: r.badge === 'NEW' || r.badge === 'HIT' ? r.badge : undefined,
    limited: !!r.limited,
    rating: Number(r.rating) || 4.6,
    can: {
      body: r.can_body ?? '#FF6A00',
      label: r.can_label ?? '#FFFFFF',
      accent: r.can_accent ?? '#F05A00',
      big: r.can_big || undefined,
      small: r.can_small || undefined,
    },
  };
}

export async function fetchCatalogSB(): Promise<{ products: Product[]; promos: Promo[]; banners: BannerData[] }> {
  const s = sb();
  if (!s) throw new Error('supabase disabled');
  const [products, promos, banners] = await Promise.all([
    s.from('products').select('*').eq('active', true).order('sort'),
    s.from('promos').select('*').eq('active', true),
    s.from('banners').select('*').eq('active', true).order('id'),
  ]);
  return {
    products: (products.data ?? []).map(normProduct),
    promos: (promos.data ?? []).map((r: any) => ({
      code: String(r.code).toUpperCase(),
      type: r.type === 'fixed' ? ('fixed' as const) : ('percent' as const),
      value: Number(r.value) || 0,
      description: r.description ?? String(r.code),
      minSubtotal: r.min_subtotal ?? undefined,
      clubOnly: !!r.club_only,
      firstOrderOnly: !!r.first_order_only,
      needsUnlock: !!r.needs_unlock,
    })),
    banners: (banners.data ?? []).map((r: any) => ({
      id: r.id,
      kicker: r.kicker ?? '',
      title: r.title ?? '',
      text: r.text ?? '',
      cta: r.cta ?? 'Открыть',
      cls: r.cls ?? 'banner--red',
      action: {
        type: (['product', 'catalog', 'club', 'none'].includes(r.action_type) ? r.action_type : 'none') as any,
        id: r.action_id || undefined,
        category: r.action_category || undefined,
        badge: r.action_badge === 'NEW' || r.action_badge === 'HIT' ? r.action_badge : undefined,
      },
    })),
  };
}

function rowToOrder(r: any): Order {
  const statusAt: Partial<Record<OrderStatus, number>> = {};
  const hist: { status: string; t: string }[] = Array.isArray(r.history) ? r.history : [];
  hist.forEach(h => {
    if (h?.status && h?.t) statusAt[h.status as OrderStatus] = new Date(h.t).getTime();
  });
  if (!statusAt.accepted) statusAt.accepted = new Date(r.created_at).getTime();
  if (r.delivered_at) statusAt.delivered = new Date(r.delivered_at).getTime();
  return {
    id: Number(r.id),
    items: (r.items ?? []).map((it: any) => ({
      productId: it.product_id,
      qty: Number(it.qty) || 1,
      unit: Number(it.unit_price) || 0,
    })),
    subtotal: r.subtotal ?? 0,
    delivery: r.delivery ?? 0,
    discount: r.discount ?? 0,
    bonusUsed: r.bonus_used ?? 0,
    bonusEarned: r.bonus_earned ?? 0,
    total: r.total ?? 0,
    status: r.status as OrderStatus,
    rated: !!r.rated,
    createdAt: new Date(r.created_at).getTime(),
    address: r.address ?? '',
    slot: r.slot ?? '',
    statusAt,
  };
}

export async function fetchOrders(userId: string): Promise<Order[]> {
  const s = sb();
  if (!s) return [];
  const { data, error } = await s
    .from('orders')
    .select('*, items:order_items(product_id, name, qty, unit_price)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error || !data) return [];
  return data.map(rowToOrder);
}

export interface AdminOrder extends Omit<Order, 'items'> {
  customer: string;
  phone: string;
  items: { productId: string; name: string; qty: number; unit: number }[];
}

export async function fetchAdminOrders(): Promise<AdminOrder[]> {
  const s = sb();
  if (!s) return [];
  const { data, error } = await s
    .from('orders')
    .select('*, items:order_items(product_id, name, qty, unit_price), profile:profiles(name)')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error || !data) return [];
  return data.map(r => ({
    ...rowToOrder(r),
    items: (r.items ?? []).map((it: any) => ({
      productId: it.product_id,
      name: it.name ?? '',
      qty: Number(it.qty) || 1,
      unit: Number(it.unit_price) || 0,
    })),
    customer: r.profile?.name ?? '',
    phone: r.phone ?? '',
  }));
}

export async function updateOrderStatus(orderId: number, status: OrderStatus): Promise<void> {
  const s = sb();
  if (!s) throw new Error('supabase disabled');
  const { error } = await s.from('orders').update({ status }).eq('id', orderId);
  if (error) throw error;
}

export async function placeOrderSB(payload: Record<string, unknown>): Promise<number> {
  const s = sb();
  if (!s) throw new Error('supabase disabled');
  const { data, error } = await s.rpc('place_order', { payload });
  if (error) throw error;
  return Number(data);
}

export async function rateOrderSB(orderId: number): Promise<number> {
  const s = sb();
  if (!s) throw new Error('supabase disabled');
  const { data, error } = await s.rpc('rate_order', { p_order_id: orderId });
  if (error) throw error;
  return Number(data) || 0;
}

export interface BonusTx {
  t: number;
  amount: number;
  reason: string;
}

export async function fetchBonusTx(userId: string): Promise<BonusTx[]> {
  const s = sb();
  if (!s) return [];
  const { data } = await s
    .from('bonus_transactions')
    .select('amount, reason, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(12);
  return (data ?? []).map(r => ({ t: new Date(r.created_at).getTime(), amount: r.amount, reason: r.reason }));
}

export function subscribeOrderUpdates(
  userId: string,
  cb: (order: Order) => void,
): () => void {
  const s = sb();
  if (!s) return () => {};
  const channel = s
    .channel('orders-' + userId.slice(0, 8))
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${userId}` },
      (payload: any) => {
        const row = payload.new ?? payload.old;
        if (row && payload.event !== 'DELETE') {
          cb(rowToOrder({ ...row, items: [] }));
        }
      },
    )
    .subscribe();
  return () => {
    s.removeChannel(channel);
  };
}

export async function refillOrderItems(order: Order): Promise<Order> {
  const s = sb();
  if (!s) return order;
  const { data } = await s
    .from('order_items')
    .select('product_id, qty, unit_price')
    .eq('order_id', order.id);
  return { ...order, items: (data ?? []).map(it => ({ productId: it.product_id, qty: Number(it.qty) || 1, unit: Number(it.unit_price) || 0 })) };
}
