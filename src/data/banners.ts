export type BannerActionType = 'product' | 'catalog' | 'club' | 'none';

export interface BannerAction {
  type: BannerActionType;
  id?: string;
  category?: string;
  badge?: 'NEW' | 'HIT';
}

export interface BannerData {
  id: string;
  kicker: string;
  title: string;
  text: string;
  cta: string;
  cls: string;
  action: BannerAction;
}

export const DEFAULT_BANNERS: BannerData[] = [
  {
    id: 'b1',
    kicker: 'Акция недели',
    title: '2 ПО ЦЕНЕ 1',
    text: 'На все лимонады ZeSt до воскресенья',
    cta: 'Забрать',
    cls: 'banner--red',
    action: { type: 'catalog', category: 'lemonade' },
  },
  {
    id: 'b2',
    kicker: 'ZeSt Club',
    title: 'ДОСТАВКА 0 ₽',
    text: 'Кэшбэк 10% бонусами и закрытые дропы вкусов',
    cta: 'Подключить',
    cls: 'banner--dark',
    action: { type: 'club' },
  },
  {
    id: 'b3',
    kicker: 'Новинка',
    title: 'ADRENALINE RUSH',
    text: 'Вкус «Актив» уже в наличии. Успей до конца недели',
    cta: 'Попробовать',
    cls: 'banner--acid',
    action: { type: 'product', id: 'adrenaline-act' },
  },
];
