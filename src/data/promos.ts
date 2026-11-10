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

export const PROMOS: Promo[] = [
  { code: 'ZEST10', type: 'percent', value: 10, description: '−10% на весь заказ' },
  { code: 'CLUB15', type: 'percent', value: 15, clubOnly: true, description: '−15% для подписчиков ZeSt Club' },
  { code: 'FIRST300', type: 'fixed', value: 100, minSubtotal: 500, firstOrderOnly: true, description: '−100 ₽ на первый заказ от 500 ₽' },
  { code: 'STORY50', type: 'fixed', value: 50, needsUnlock: true, description: '−50 ₽ за репост в VK Историях' },
];

export const DELIVERY_PRICE = 99;
export const FREE_FROM = 700;

export const SLOTS = [
  'Как можно быстрее · 40–60 мин',
  'Сегодня 18:00–20:00',
  'Сегодня 20:00–22:00',
  'Завтра 10:00–13:00',
];
