import { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import type { Dispatch, ReactNode } from 'react';
import type { Product } from '../data/products';
import { DELIVERY_PRICE, FREE_FROM } from '../data/promos';
import type { Promo } from '../data/promos';
import type { BannerData } from '../data/banners';
import { effPrice } from '../utils/format';
import { config } from '../config';
import { fetchCatalog } from '../api/client';
import { getUser, storageGet, storageSet, subscribeTheme, taptic } from '../bridge/vkApi';
import { useToast } from './ToastContext';

export type OrderStatus = 'accepted' | 'assembling' | 'transit' | 'delivered';

export const STATUS_FLOW: OrderStatus[] = ['accepted', 'assembling', 'transit', 'delivered'];

export const STATUS_META: Record<OrderStatus, { title: string; desc: string }> = {
  accepted: { title: 'Принят', desc: 'Заказ попал в обработку' },
  assembling: { title: 'Собираем', desc: 'Склад собирает ваш заказ' },
  transit: { title: 'Курьер в пути', desc: 'Курьер мчится к вам' },
  delivered: { title: 'Доставлен', desc: 'Приятного заряда' },
};

export interface CartLine {
  productId: string;
  qty: number;
  unit?: number;
}

export interface Address {
  id: string;
  label: string;
  value: string;
}

export interface Order {
  id: number;
  items: CartLine[];
  subtotal: number;
  delivery: number;
  discount: number;
  bonusUsed: number;
  total: number;
  bonusEarned: number;
  status: OrderStatus;
  rated: boolean;
  createdAt: number;
  address: string;
  slot: string;
  payment?: string;
  statusAt: Partial<Record<OrderStatus, number>>;
}

export interface ClubState {
  active: boolean;
  plan: 'month' | 'year';
  until: number;
  paused: boolean;
  savedMoney: number;
}

export interface CatalogPreset {
  category?: string;
  badge?: 'NEW' | 'HIT';
  limited?: boolean;
}

export interface BonusEntry {
  t: number;
  amount: number;
  reason: string;
}

export interface NotifItem {
  id: string;
  title: string;
  text: string;
  t: number;
  read: boolean;
}

export interface AppState {
  initialized: boolean;
  onboarded: boolean;
  user: { id: number; name: string; photo: string } | null;
  customName: string;
  theme: 'light' | 'dark';
  city: string;
  products: Product[];
  promos: Promo[];
  banners: BannerData[];
  cart: CartLine[];
  bonusBalance: number;
  bonusLog: BonusEntry[];
  lastSpin: number;
  notifications: NotifItem[];
  club: ClubState | null;
  orders: Order[];
  addresses: Address[];
  addressId: string;
  favorites: string[];
  streak: number;
  unlockedPromos: string[];
  invited: boolean;
  storyDone: boolean;
  catalogPreset: CatalogPreset | null;
}

export interface OrderDraft {
  lines: CartLine[];
  subtotal: number;
  delivery: number;
  discount: number;
  bonusUsed: number;
  total: number;
  address: string;
  slot: string;
  payment?: string;
}

export type Action =
  | { type: 'HYDRATE'; data: Partial<AppState> }
  | { type: 'SET_USER'; user: AppState['user'] }
  | { type: 'SET_NAME'; name: string }
  | { type: 'SET_THEME'; theme: 'light' | 'dark' }
  | { type: 'SET_CITY'; city: string }
  | { type: 'ONBOARDED' }
  | { type: 'ADD_TO_CART'; productId: string; qty: number }
  | { type: 'ADD_LINES'; lines: CartLine[] }
  | { type: 'SET_QTY'; productId: string; qty: number }
  | { type: 'REMOVE_LINE'; productId: string }
  | { type: 'SET_ADDRESS'; addressId: string }
  | { type: 'ADD_ADDRESS'; address: Address }
  | { type: 'PLACE_ORDER'; draft: OrderDraft }
  | { type: 'TICK'; now: number }
  | { type: 'RATE_ORDER'; orderId: number }
  | { type: 'SUBSCRIBE'; plan: 'month' | 'year' }
  | { type: 'PAUSE_CLUB'; paused: boolean }
  | { type: 'CANCEL_CLUB' }
  | { type: 'MARK_INVITE' }
  | { type: 'MARK_STORY' }
  | { type: 'UNLOCK_PROMO'; code: string }
  | { type: 'SET_PRESET'; preset: CatalogPreset | null }
  | { type: 'TOGGLE_FAV'; productId: string }
  | { type: 'SET_CATALOG'; products: Product[]; promos: Promo[]; banners: BannerData[] }
  | { type: 'SPIN_WHEEL'; prize: number }
  | { type: 'PUSH_NOTIF'; title: string; text: string }
  | { type: 'READ_ALL' }
  | { type: 'RESET' };

const STORAGE_KEY = 'zest_state_v1';

const initialState: AppState = {
  initialized: false,
  onboarded: false,
  user: null,
  customName: '',
  theme: 'light',
  city: 'Москва',
  products: [],
  promos: [],
  banners: [],
  cart: [],
  bonusBalance: 300,
  bonusLog: [],
  lastSpin: 0,
  notifications: [],
  club: null,
  orders: [],
  addresses: [
    { id: 'home', label: 'Дом', value: 'ул. Энергетическая, 7, кв. 42' },
    { id: 'work', label: 'Работа', value: 'БЦ «Вольт», Пресненская наб., 12, офис 301' },
  ],
  addressId: 'home',
  favorites: [],
  streak: 0,
  unlockedPromos: [],
  invited: false,
  storyDone: false,
  catalogPreset: null,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.data, initialized: true, catalogPreset: null };
    case 'SET_USER':
      return { ...state, user: action.user };
    case 'SET_NAME':
      return { ...state, customName: action.name.trim().slice(0, 40) };
    case 'SET_THEME':
      return { ...state, theme: action.theme };
    case 'SET_CITY':
      return { ...state, city: action.city };
    case 'ONBOARDED':
      return { ...state, onboarded: true };
    case 'ADD_TO_CART': {
      const existing = state.cart.find(l => l.productId === action.productId);
      const cart = existing
        ? state.cart.map(l => (l.productId === action.productId ? { ...l, qty: l.qty + action.qty } : l))
        : [...state.cart, { productId: action.productId, qty: action.qty }];
      return { ...state, cart };
    }
    case 'ADD_LINES': {
      const cart = [...state.cart];
      action.lines.forEach(line => {
        const i = cart.findIndex(l => l.productId === line.productId);
        if (i >= 0) cart[i] = { ...cart[i], qty: cart[i].qty + line.qty };
        else cart.push({ ...line });
      });
      return { ...state, cart };
    }
    case 'SET_QTY': {
      if (action.qty <= 0) {
        return { ...state, cart: state.cart.filter(l => l.productId !== action.productId) };
      }
      return {
        ...state,
        cart: state.cart.map(l => (l.productId === action.productId ? { ...l, qty: action.qty } : l)),
      };
    }
    case 'REMOVE_LINE':
      return { ...state, cart: state.cart.filter(l => l.productId !== action.productId) };
    case 'SET_ADDRESS':
      return { ...state, addressId: action.addressId };
    case 'ADD_ADDRESS':
      return { ...state, addresses: [...state.addresses, action.address], addressId: action.address.id };
    case 'PLACE_ORDER': {
      const now = Date.now();
      const id = state.orders.reduce((m, o) => Math.max(m, o.id), 1000) + 1;
      const clubNow = state.club;
      const isClub = !!clubNow && clubNow.active && !clubNow.paused;
      const bonusEarned = Math.round(action.draft.total * (isClub ? 0.1 : 0.05));
      const order: Order = {
        id,
        items: action.draft.lines,
        subtotal: action.draft.subtotal,
        delivery: action.draft.delivery,
        discount: action.draft.discount,
        bonusUsed: action.draft.bonusUsed,
        total: action.draft.total,
        bonusEarned,
        status: 'accepted',
        rated: false,
        createdAt: now,
        address: action.draft.address,
        slot: action.draft.slot,
        payment: action.draft.payment,
        statusAt: {
          accepted: now,
          assembling: now + 8000,
          transit: now + 20000,
          delivered: now + 40000,
        },
      };
      const bonusLog =
        action.draft.bonusUsed > 0
          ? ([...state.bonusLog, { t: now, amount: -action.draft.bonusUsed, reason: `Оплата бонусами: заказ #${id}` }] as BonusEntry[])
          : state.bonusLog;
      return {
        ...state,
        orders: [order, ...state.orders],
        cart: [],
        bonusBalance: Math.max(0, state.bonusBalance - action.draft.bonusUsed),
        bonusLog: bonusLog.slice(-100),
      };
    }
    case 'TICK': {
      let changed = false;
      let balance = state.bonusBalance;
      let streak = state.streak;
      let savedMoney = state.club?.savedMoney ?? 0;
      let bonusLog = state.bonusLog;
      const orders = state.orders.map(o => {
        if (o.status === 'delivered') return o;
        const next = STATUS_FLOW[STATUS_FLOW.indexOf(o.status) + 1];
        const at = next ? o.statusAt[next] : undefined;
        if (next && at !== undefined && action.now >= at) {
          changed = true;
          if (next === 'delivered') {
            balance += o.bonusEarned;
            streak += 1;
            savedMoney += o.delivery + o.bonusEarned;
            bonusLog = [...bonusLog, { t: action.now, amount: o.bonusEarned, reason: `Кэшбэк: заказ #${o.id}` }];
          }
          return { ...o, status: next };
        }
        return o;
      });
      if (!changed) return state;
      const club = state.club ? { ...state.club, savedMoney } : null;
      return { ...state, orders, bonusBalance: balance, streak, club, bonusLog: bonusLog.slice(-100) };
    }
    case 'RATE_ORDER': {
      const target = state.orders.find(o => o.id === action.orderId);
      const gained = target && !target.rated ? 50 : 0;
      const orders = state.orders.map(o => (o.id === action.orderId && !o.rated ? { ...o, rated: true } : o));
      const bonusLog = gained
        ? ([...state.bonusLog, { t: Date.now(), amount: 50, reason: `Отзыв: заказ #${action.orderId}` }] as BonusEntry[])
        : state.bonusLog;
      return { ...state, orders, bonusBalance: state.bonusBalance + gained, bonusLog: bonusLog.slice(-100) };
    }
    case 'SUBSCRIBE': {
      const days = action.plan === 'month' ? 30 : 365;
      return {
        ...state,
        club: {
          active: true,
          plan: action.plan,
          until: Date.now() + days * 86400000,
          paused: false,
          savedMoney: state.club?.savedMoney ?? 0,
        },
      };
    }
    case 'PAUSE_CLUB':
      return state.club ? { ...state, club: { ...state.club, paused: action.paused } } : state;
    case 'CANCEL_CLUB':
      return { ...state, club: null };
    case 'MARK_INVITE':
      return state.invited
        ? state
        : {
            ...state,
            invited: true,
            bonusBalance: state.bonusBalance + 300,
            bonusLog: [...state.bonusLog, { t: Date.now(), amount: 300, reason: 'Приглашение друга' } as BonusEntry].slice(-100),
          };
    case 'MARK_STORY':
      return state.storyDone
        ? state
        : {
            ...state,
            storyDone: true,
            bonusBalance: state.bonusBalance + 100,
            bonusLog: [...state.bonusLog, { t: Date.now(), amount: 100, reason: 'История с ZeSt' } as BonusEntry].slice(-100),
            unlockedPromos: state.unlockedPromos.includes('STORY50')
              ? state.unlockedPromos
              : [...state.unlockedPromos, 'STORY50'],
          };
    case 'SPIN_WHEEL':
      return {
        ...state,
        lastSpin: Date.now(),
        bonusBalance: state.bonusBalance + action.prize,
        bonusLog: [...state.bonusLog, { t: Date.now(), amount: action.prize, reason: 'Колесо фортуны' } as BonusEntry].slice(-100),
      };
    case 'PUSH_NOTIF': {
      const item: NotifItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title: action.title,
        text: action.text,
        t: Date.now(),
        read: false,
      };
      return { ...state, notifications: [item, ...state.notifications].slice(0, 30) };
    }
    case 'READ_ALL':
      return { ...state, notifications: state.notifications.map(n => ({ ...n, read: true })) };
    case 'UNLOCK_PROMO':
      return state.unlockedPromos.includes(action.code)
        ? state
        : { ...state, unlockedPromos: [...state.unlockedPromos, action.code] };
    case 'SET_PRESET':
      return { ...state, catalogPreset: action.preset };
    case 'SET_CATALOG':
      return {
        ...state,
        products: action.products,
        promos: action.promos.length ? action.promos : state.promos,
        banners: action.banners.length ? action.banners : state.banners,
      };
    case 'TOGGLE_FAV':
      return {
        ...state,
        favorites: state.favorites.includes(action.productId)
          ? state.favorites.filter(f => f !== action.productId)
          : [...state.favorites, action.productId],
      };
    case 'RESET':
      return { ...initialState, initialized: true, onboarded: true, user: state.user, theme: state.theme };
    default:
      return state;
  }
}

interface StoreValue {
  state: AppState;
  dispatch: Dispatch<Action>;
  isClub: boolean;
  products: Product[];
  promos: Promo[];
  banners: BannerData[];
  unreadNotifications: number;
  productById: (id: string) => Product | undefined;
  cartCount: number;
  cartSubtotal: number;
  deliveryCost: (subtotal: number) => number;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const toast = useToast();
  const hydratedRef = useRef(false);
  const prevStatuses = useRef<Record<number, OrderStatus>>({});

  useEffect(() => {
    (async () => {
      let data: Partial<AppState> | null = null;
      try {
        const raw = await storageGet(STORAGE_KEY);
        if (raw) data = JSON.parse(raw);
      } catch {
        data = null;
      }
      dispatch({ type: 'HYDRATE', data: data ?? {} });
      hydratedRef.current = true;
    })();
  }, []);

  useEffect(() => {
    getUser().then(user => {
      if (user) dispatch({ type: 'SET_USER', user });
    });
  }, []);

  useEffect(
    () =>
      subscribeTheme(scheme => {
        dispatch({ type: 'SET_THEME', theme: scheme.toLowerCase().includes('dark') ? 'dark' : 'light' });
      }),
    [],
  );

  useEffect(() => {
    document.documentElement.dataset.theme = state.theme;
  }, [state.theme]);

  useEffect(() => {
    if (!state.initialized || !hydratedRef.current) return;
    const { initialized: _i, catalogPreset: _c, products: _p, promos: _pr, banners: _b, ...persist } = state;
    storageSet(STORAGE_KEY, JSON.stringify(persist));
  }, [state]);

  useEffect(() => {
    if (!config.API_BASE_URL) return;
    fetchCatalog(config.API_BASE_URL)
      .then(data => {
        if (data.products.length) dispatch({ type: 'SET_CATALOG', ...data });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const t = window.setInterval(() => dispatch({ type: 'TICK', now: Date.now() }), 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    state.orders.forEach(o => {
      const prev = prevStatuses.current[o.id];
      prevStatuses.current[o.id] = o.status;
      if (!prev || prev === o.status) return;
      if (o.status === 'assembling') {
        toast(`Заказ #${o.id} собран, курьер готовится выехать`);
        dispatch({ type: 'PUSH_NOTIF', title: `Заказ #${o.id} собран`, text: 'Курьер готовится выехать к вам' });
      } else if (o.status === 'transit') {
        toast('Курьер в пути, ждите через 15 минут');
        dispatch({ type: 'PUSH_NOTIF', title: `Заказ #${o.id} в пути`, text: 'Курьер мчится к вам — ждите через 15 минут' });
      } else if (o.status === 'delivered') {
        toast('Заказ доставлен! Оцените его и получите +50 бонусов');
        dispatch({
          type: 'PUSH_NOTIF',
          title: `Заказ #${o.id} доставлен`,
          text: 'Оцените заказ в профиле и получите +50 бонусов',
        });
        taptic('success');
      }
    });
  }, [state.orders, toast, dispatch]);

  const club = state.club;
  const isClub = !!club && club.active && !club.paused;
  const cartCount = state.cart.reduce((s, l) => s + l.qty, 0);
  const cartSubtotal = state.cart.reduce((s, l) => {
    const p = state.products.find(x => x.id === l.productId);
    return p ? s + effPrice(p, isClub) * l.qty : s;
  }, 0);

  const value: StoreValue = {
    state,
    dispatch,
    isClub,
    products: state.products,
    promos: state.promos,
    banners: state.banners,
    unreadNotifications: state.notifications.filter(n => !n.read).length,
    productById: id => state.products.find(p => p.id === id),
    cartCount,
    cartSubtotal,
    deliveryCost: subtotal => (isClub || subtotal >= FREE_FROM ? 0 : DELIVERY_PRICE),
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const v = useContext(StoreContext);
  if (!v) throw new Error('StoreProvider missing');
  return v;
}
