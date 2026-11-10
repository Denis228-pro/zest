import { useState } from 'react';
import type { MouseEvent } from 'react';
import { useStore } from '../context/StoreContext';
import { useRouter } from '../context/RouterContext';
import { useToast } from '../context/ToastContext';
import { useFly } from '../App';
import { effPrice, fmtMoney, hexToRgba } from '../utils/format';
import { share, taptic } from '../bridge/vkApi';
import { StackScreen } from '../components/StackScreen';
import { CanVisual } from '../components/CanVisual';
import { ProductCard } from '../components/ProductCard';
import { Badge, Button, Empty, SectionTitle, Stepper, Stars } from '../components/ui';
import { Icon } from '../components/icons';

export function ProductScreen({ id }: { id: string }) {
  const { state, dispatch, isClub, productById, products } = useStore();
  const router = useRouter();
  const toast = useToast();
  const fly = useFly();
  const product = productById(id);
  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <StackScreen title="Товар">
        <Empty icon="search" title="Товар не найден" text="Возможно, дроп уже закончился" />
      </StackScreen>
    );
  }

  const price = effPrice(product, isClub);
  const related = products
    .filter(
      p => p.id !== product.id && (p.category === product.category || p.flavors.some(f => product.flavors.includes(f))),
    )
    .slice(0, 4);

  const add = (e: MouseEvent<HTMLElement>, checkout = false) => {
    fly(e.clientX, e.clientY, product.can.body);
    taptic('light');
    dispatch({ type: 'ADD_TO_CART', productId: product.id, qty });
    if (checkout) router.go('checkout');
    else toast(`${product.name} · ${qty} шт в корзине`);
  };

  const onShare = async () => {
    await share();
    if (!state.unlockedPromos.includes('STORY50')) {
      dispatch({ type: 'UNLOCK_PROMO', code: 'STORY50' });
      toast('Промокод STORY50 открыт — примените в корзине');
    } else {
      toast('Ссылка отправлена. Спасибо за энергию!');
    }
  };

  return (
    <StackScreen title={product.name}>
      <div
        className="pd__visual"
        style={{ background: `radial-gradient(circle at 50% 30%, ${hexToRgba(product.can.body, 0.3)}, transparent 70%)` }}
      >
        <CanVisual product={product} size={150} className="pd__can" />
        <span className="pd__badges">
          {product.badge ? <Badge type={product.badge} /> : null}
          {product.limited ? <Badge type="LIMITED" /> : null}
        </span>
        <button
          className={`icon-btn pd__fav ${state.favorites.includes(product.id) ? 'fav-on' : ''}`}
          onClick={() => {
            dispatch({ type: 'TOGGLE_FAV', productId: product.id });
            taptic('light');
          }}
          aria-label="В любимое"
        >
          <Icon name="heart" size={20} filled={state.favorites.includes(product.id)} />
        </button>
      </div>
      <div className="pd__brand">
        {product.brand}
        {product.limited ? ' · закрытый дроп' : ''}
      </div>
      <h1 className="pd__name">{product.name}</h1>
      <div className="pd__meta">
        <Stars value={Math.round(product.rating)} />
        <span>{product.rating.toFixed(1)}</span>
        <span>·</span>
        <span>{product.volume} л</span>
        <span>·</span>
        <span>{product.caffeine > 0 ? `кофеин ${product.caffeine} мг/100 мл` : 'без кофеина'}</span>
      </div>
      <div className="pd__price">
        <span className="pd__price-now">{fmtMoney(price)}</span>
      </div>
      <p className="pd__desc">{product.description}</p>
      <div className="pd__block">
        <div className="pd__block-t">Состав</div>
        {product.composition}
      </div>
      <div className="pd__block">
        <div className="pd__block-t">Энергетическая ценность на 100 мл</div>
        <div className="kbu">
          <div>
            <b>{product.kcal}</b>ккал
          </div>
          <div>
            <b>{product.protein}</b>белки
          </div>
          <div>
            <b>{product.fat}</b>жиры
          </div>
          <div>
            <b>{product.carbs}</b>углеводы
          </div>
        </div>
      </div>

      <div className="section">
        <SectionTitle>С этим берут</SectionTitle>
        <div className="h-scroll">
          {related.map(p => (
            <ProductCard key={p.id} product={p} onOpen={() => router.replace('product', { id: p.id })} />
          ))}
        </div>
      </div>

      <div className="section">
        <Button variant="ghost" block onClick={onShare}>
          <Icon name="share" size={17} /> Поделиться и открыть промокод −50 ₽
        </Button>
      </div>

      <div className="dock">
        <div className="dock__row">
          <Stepper value={qty} onChange={v => setQty(Math.max(1, v))} />
          <Button onClick={e => add(e)}>В корзину · {fmtMoney(price * qty)}</Button>
        </div>
        <Button variant="dark" block onClick={e => add(e, true)}>
          Купить сразу через VK Pay
        </Button>
      </div>
    </StackScreen>
  );
}
