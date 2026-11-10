import type { Product } from '../data/products';

export function fmtMoney(n: number): string {
  return `${new Intl.NumberFormat('ru-RU').format(Math.round(n))} ₽`;
}

export function effPrice(p: Product, _isClub?: boolean): number {
  return p.price;
}

export function plural(n: number, one: string, few: string, many: string): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function fmtTime(t: number): string {
  return new Date(t).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

export function fmtDate(t: number): string {
  return new Date(t).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}
