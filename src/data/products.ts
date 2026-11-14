import type { IconName } from '../components/icons';

export type CategoryId = 'energy' | 'water' | 'lemonade' | 'tonic';

export interface CanTheme {
  body: string;
  label: string;
  accent: string;
  big?: string;
  small?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: CategoryId;
  volume: number;
  price: number;
  flavors: string[];
  caffeine: number;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  composition: string;
  description: string;
  badge?: 'NEW' | 'HIT';
  limited?: boolean;
  rating: number;
  can: CanTheme;
}

export const PRODUCTS: Product[] = [];

export const CATEGORY_META: { id: CategoryId; name: string; icon: IconName }[] = [
  { id: 'energy', name: 'Энергетики', icon: 'bolt' },
  { id: 'water', name: 'Вода', icon: 'drop' },
  { id: 'lemonade', name: 'Лимонады', icon: 'citrus' },
  { id: 'tonic', name: 'Тоники', icon: 'coffee' },
];
