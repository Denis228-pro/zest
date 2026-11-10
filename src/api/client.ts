import type { Product } from '../data/products';
import type { Promo } from '../data/promos';
import type { BannerData, BannerActionType } from '../data/banners';

const CACHE_KEY = 'zest_remote_cache_v1';
const CACHE_TTL = 86400000;
const TIMEOUT = 8000;

async function getJSON(url: string): Promise<any> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

function str(v: unknown, d = ''): string {
  return typeof v === 'string' && v.trim() ? v.trim() : d;
}

function num(v: unknown, d = 0): number {
  const n = Number(String(v ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : d;
}

function bool(v: unknown): boolean {
  return v === true || v === '1' || v === 'TRUE' || v === 'true' || v === 'да' || v === 'да '.trim();
}

const CATEGORIES = ['energy', 'water', 'lemonade', 'tonic'];

function normProduct(r: any): Product | null {
  const id = str(r.id);
  if (!id) return null;
  const flavors = str(r.flavors)
    .split('|')
    .map(s => s.trim())
    .filter(Boolean);
  return {
    id,
    name: str(r.name, 'Товар'),
    brand: str(r.brand),
    category: (CATEGORIES.includes(str(r.category)) ? str(r.category) : 'energy') as Product['category'],
    volume: num(r.volume, 0.5),
    price: num(r.price),
    flavors: flavors.length ? flavors : ['без вкуса'],
    caffeine: num(r.caffeine),
    kcal: num(r.kcal),
    protein: num(r.protein),
    fat: num(r.fat),
    carbs: num(r.carbs),
    composition: str(r.composition, 'Уточняйте состав у поддержки.'),
    description: str(r.description),
    badge: r.badge === 'NEW' || r.badge === 'HIT' ? r.badge : undefined,
    limited: bool(r.limited),
    rating: num(r.rating, 4.6),
    can: {
      body: str(r.canBody, '#FF6A00'),
      label: str(r.canLabel, '#FFFFFF'),
      accent: str(r.canAccent, '#F05A00'),
      big: str(r.canBig) || undefined,
      small: str(r.canSmall) || undefined,
    },
  };
}

function normPromo(r: any): Promo | null {
  const code = str(r.code).toUpperCase();
  if (!code) return null;
  return {
    code,
    type: r.type === 'fixed' ? 'fixed' : 'percent',
    value: num(r.value),
    minSubtotal: num(r.minSubtotal) || undefined,
    clubOnly: bool(r.clubOnly),
    firstOrderOnly: bool(r.firstOrderOnly),
    needsUnlock: bool(r.needsUnlock),
    description: str(r.description, str(r.code)),
  };
}

function normBanner(r: any, i: number): BannerData | null {
  const id = str(r.id, 'b' + i);
  const title = str(r.title);
  if (!title) return null;
  const rawType = str(r.actionType, str(r.action_type, 'none'));
  const actionType: BannerActionType = (['product', 'catalog', 'club', 'none'].includes(rawType)
    ? rawType
    : 'none') as BannerActionType;
  const badge = r.actionBadge === 'NEW' || r.actionBadge === 'HIT' ? r.actionBadge : undefined;
  return {
    id,
    kicker: str(r.kicker),
    title,
    text: str(r.text),
    cta: str(r.cta, 'Открыть'),
    cls: str(r.cls, 'banner--red'),
    action: { type: actionType, id: str(r.actionId) || undefined, category: str(r.actionCategory) || undefined, badge },
  };
}

export interface RemoteCatalog {
  products: Product[];
  promos: Promo[];
  banners: BannerData[];
}

function normalize(raw: any): RemoteCatalog {
  const productList = Array.isArray(raw) ? raw : Array.isArray(raw?.products) ? raw.products : [];
  const promoList = Array.isArray(raw?.promos) ? raw.promos : [];
  const bannerList = Array.isArray(raw?.banners) ? raw.banners : [];
  return {
    products: productList.map(normProduct).filter((p: Product | null): p is Product => !!p),
    promos: promoList.map(normPromo).filter((p: Promo | null): p is Promo => !!p),
    banners: bannerList.map(normBanner).filter((b: BannerData | null): b is BannerData => !!b),
  };
}

export async function fetchCatalog(base: string): Promise<RemoteCatalog> {
  try {
    const cat = normalize(await getJSON(base));
    if (!cat.products.length) throw new Error('empty catalog');
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), cat }));
    } catch {}
    return cat;
  } catch (e) {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.t < CACHE_TTL && parsed.cat?.products?.length) return parsed.cat;
      }
    } catch {}
    throw e;
  }
}

export async function submitOrder(base: string, order: Record<string, unknown>): Promise<void> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    await fetch(base, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'order', order }),
      signal: ctrl.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}
