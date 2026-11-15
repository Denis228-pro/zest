import { config } from '../config';
import type { Product } from '../data/products';
import type { Promo } from '../data/promos';
import type { BannerActionType, BannerData } from '../data/banners';
import type { Order, OrderStatus } from '../context/StoreContext';

const base = () => config.CRM_URL.replace(/\/+$/, '');
export const crmEnabled = (): boolean => !!config.CRM_URL;

const STATUS_OK: OrderStatus[] = ['accepted', 'assembling', 'transit', 'delivered', 'cancelled'];

async function jget<T>(path: string): Promise<T | null> {
  const bust = path.includes('?') ? '&' : '?';
  const res = await fetch(`${base()}/${path}.json${bust}t=${Date.now()}`);
  if (!res.ok) throw new Error('CRM HTTP ' + res.status);
  return (await res.json()) as T;
}

async function jwrite<T>(path: string, method: 'PUT' | 'PATCH' | 'POST' | 'DELETE', body?: unknown): Promise<T | null> {
  const res = await fetch(`${base()}/${path}.json`, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new Error('CRM HTTP ' + res.status);
  return (await res.json()) as T;
}

function str(v: unknown, d = ''): string {
  return typeof v === 'string' && v.trim() ? v.trim() : d;
}

function num(v: unknown, d = 0): number {
  const n = Number(String(v ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : d;
}

function asEntries(obj: unknown): [string, any][] {
  return obj && typeof obj === 'object' ? Object.entries(obj) : [];
}

export interface CatalogStatus {
  key: string;
  id: string;
  status: OrderStatus;
}

export interface CrmCatalog {
  products: Product[];
  promos: Promo[];
  banners: BannerData[];
  statuses: CatalogStatus[];
}

function normProduct(id: string, v: any): Product | null {
  const name = str(v?.name);
  if (!name) return null;
  return {
    id,
    name,
    brand: str(v?.brand),
    category: (['energy', 'water', 'lemonade', 'tonic'].includes(str(v?.category)) ? str(v?.category) : 'energy') as Product['category'],
    volume: num(v?.volume, 0.5),
    price: num(v?.price),
    flavors: str(v?.flavors)
      .split('|')
      .map(s => s.trim())
      .filter(Boolean),
    caffeine: num(v?.caffeine),
    kcal: num(v?.kcal),
    protein: num(v?.protein),
    fat: num(v?.fat),
    carbs: num(v?.carbs),
    composition: str(v?.composition),
    description: str(v?.description),
    badge: v?.badge === 'NEW' || v?.badge === 'HIT' ? v.badge : undefined,
    limited: !!v?.limited,
    rating: num(v?.rating, 4.6),
    active: v?.active !== false,
    sort: num(v?.sort),
    photo: str(v?.photo) || undefined,
    can: {
      body: str(v?.canBody, '#FF6A00'),
      label: str(v?.canLabel, '#FFFFFF'),
      accent: str(v?.canAccent, '#F05A00'),
      big: str(v?.canBig) || undefined,
      small: str(v?.canSmall) || undefined,
    },
  };
}

function normPromo(code: string, v: any): Promo | null {
  if (!code) return null;
  return {
    code: code.toUpperCase(),
    type: v?.type === 'fixed' ? 'fixed' : 'percent',
    value: num(v?.value),
    description: str(v?.description, code),
    minSubtotal: num(v?.minSubtotal) || undefined,
    clubOnly: !!v?.clubOnly,
    firstOrderOnly: !!v?.firstOrderOnly,
    needsUnlock: !!v?.needsUnlock,
    active: v?.active !== false,
  };
}

function normBanner(id: string, v: any): BannerData | null {
  const title = str(v?.title);
  if (!title) return null;
  const rawType = str(v?.actionType, 'none');
  return {
    id,
    kicker: str(v?.kicker),
    title,
    text: str(v?.text),
    cta: str(v?.cta, 'Открыть'),
    cls: str(v?.cls, 'banner--red'),
    active: v?.active !== false,
    action: {
      type: (['product', 'catalog', 'club', 'none'].includes(rawType) ? rawType : 'none') as BannerActionType,
      id: str(v?.actionId) || undefined,
      category: str(v?.actionCategory) || undefined,
      badge: v?.actionBadge === 'NEW' || v?.actionBadge === 'HIT' ? v.actionBadge : undefined,
    },
  };
}

export async function fetchCrmCatalog(): Promise<CrmCatalog> {
  const [p, pr, b, o] = await Promise.all([
    jget<Record<string, any>>('catalog/products'),
    jget<Record<string, any>>('catalog/promos'),
    jget<Record<string, any>>('catalog/banners'),
    jget<Record<string, any>>('orders'),
  ]);
  const products = asEntries(p)
    .map(([id, v]) => normProduct(id, v))
    .filter((x): x is Product => !!x && x.active !== false)
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
  const promoArr = asEntries(pr)
    .map(([code, v]) => normPromo(code, v))
    .filter((x): x is Promo => !!x && x.active !== false);
  const bannerArr = asEntries(b)
    .map(([id, v]) => normBanner(id, v))
    .filter((x): x is BannerData => !!x && x.active !== false);
  const statuses = asEntries(o).map(([key, v]) => ({
    key,
    id: String(v?.id ?? ''),
    status: (STATUS_OK.includes(v?.status) ? v.status : 'accepted') as OrderStatus,
  }));
  return { products, promos, banners, statuses };
}

export async function placeOrderCRM(order: Order): Promise<void> {
  await jwrite(`orders/${order.id}`, 'PUT', order);
}

export async function cancelOrderCRM(orderId: number): Promise<void> {
  await jwrite(`orders/${orderId}`, 'PATCH', { status: 'cancelled', cancelledAt: Date.now() });
}

export async function postReviewCRM(payload: Record<string, unknown>): Promise<void> {
  await jwrite('reviews', 'POST', payload);
}

export async function saveProductCRM(p: Product): Promise<void> {
  await jwrite(`catalog/products/${p.id}`, 'PUT', p);
}

export async function deleteProductCRM(id: string): Promise<void> {
  await jwrite(`catalog/products/${id}.json`, 'DELETE');
}
