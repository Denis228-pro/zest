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
