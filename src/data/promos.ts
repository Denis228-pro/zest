export interface Promo {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minSubtotal?: number;
  clubOnly?: boolean;
  firstOrderOnly?: boolean;
  needsUnlock?: boolean;
  description: string;
}

export const PROMOS: Promo[] = [];

export const DELIVERY_PRICE = 99;
export const FREE_FROM = 700;

export const SLOTS = [
  'Как можно быстрее · 40–60 мин',
  'Сегодня 18:00–20:00',
  'Сегодня 20:00–22:00',
  'Завтра 10:00–13:00',
];
