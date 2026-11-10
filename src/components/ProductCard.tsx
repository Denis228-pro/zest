import type { MouseEvent } from 'react';
import { useStore } from '../context/StoreContext';
import { useFly } from '../App';
import { useToast } from '../context/ToastContext';
import { CanVisual } from './CanVisual';
import { Badge } from './ui';
import { Icon } from './icons';
import { effPrice, fmtMoney, hexToRgba } from '../utils/format';
import { taptic } from '../bridge/vkApi';
export function ProductCard({ product, onOpen }: { product: import('../data/products').Product; onOpen: () => void }) {
  const { state, dispatch, isClub } = useStore();
  const fly = useFly();
  const toast = useToast();
  const locked = !!product.limited && !isClub;
  const price = effPrice(product, isClub);
  const inCart = state.cart.find(l => l.productId === product.id)?.qty ?? 0;

  const add = (e: MouseEvent<HTMLElement>) => {
    if (locked) return;
    fly(e.clientX, e.clientY, product.can.body);
    taptic('light');
    dispatch({ type: 'ADD_TO_CART', productId: product.id, qty: 1 });
  };

  return (
    <div className="p-card" onClick={onOpen}>
      <div
        className="p-card__img"
        style={{ background: `radial-gradient(circle at 50% 38%, ${hexToRgba(product.can.body, 0.22)}, transparent 72%)` }}
      >
        <CanVisual product={product} size={86} />
        <div className="p-card__badges">
          {product.badge ? <Badge type={product.badge} /> : null}
        </div>
        <button
          className={`p-card__fav ${state.favorites.includes(product.id) ? 'fav-on' : ''}`}
          onClick={e => {
            e.stopPropagation();
            dispatch({ type: 'TOGGLE_FAV', productId: product.id });
            taptic('light');
          }}
          aria-label="В любимое"
        >
          <Icon name="heart" size={16} filled={state.favorites.includes(product.id)} />
        </button>
        {locked ? (
          <div className="p-card__lock">
            <Icon name="lock" size={18} />
            <span>Club</span>
          </div>
        ) : null}
      </div>
      <div className="p-card__name">{product.name}</div>
      <div className="p-card__meta">
        {product.volume} л · {product.flavors[0]}
      </div>
      <div className="p-card__row">
        <div className="price">
          <span className="price__now">{fmtMoney(price)}</span>
        </div>
        {locked ? null : inCart > 0 ? (
          <div className="stepper stepper--sm" onClick={e => e.stopPropagation()}>
            <button
              className="stepper__btn"
              onClick={() => dispatch({ type: 'SET_QTY', productId: product.id, qty: inCart - 1 })}
            >
              <Icon name="minus" size={15} />
            </button>
            <span className="stepper__n">{inCart}</span>
            <button className="stepper__btn" onClick={add}>
              <Icon name="plus" size={15} />
            </button>
          </div>
        ) : (
          <button
            className="add-btn"
            onClick={e => {
              e.stopPropagation();
              add(e);
            }}
          >
            <Icon name="plus" size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
