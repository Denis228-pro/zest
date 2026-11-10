import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useRouter } from '../context/RouterContext';
import { useToast } from '../context/ToastContext';
import { FREE_FROM } from '../data/promos';
import { effPrice, fmtMoney, hexToRgba, plural } from '../utils/format';
import { StackScreen } from '../components/StackScreen';
import { CanVisual } from '../components/CanVisual';
import { Button, Empty, SectionTitle, Stepper, Switch } from '../components/ui';
import { Icon } from '../components/icons';

export function CartScreen() {
  const { state, dispatch, isClub, productById, deliveryCost, promos } = useStore();
  const router = useRouter();
  const toast = useToast();
  const [promoInput, setPromoInput] = useState('');
  const [promo, setPromo] = useState<{ code: string; discount: number } | null>(null);
  const [promoErr, setPromoErr] = useState('');
  const [useBonus, setUseBonus] = useState(false);

  const lines = state.cart.flatMap(l => {
    const p = productById(l.productId);
    return p ? [{ line: l, product: p }] : [];
  });

  const subtotal = lines.reduce((s, x) => s + effPrice(x.product, isClub) * x.line.qty, 0);
  const delivery = deliveryCost(subtotal);
  const afterDiscount = subtotal + delivery - (promo?.discount ?? 0);
  const maxBonus = Math.min(state.bonusBalance, Math.floor(afterDiscount / 2));
  const bonusUsed = useBonus ? maxBonus : 0;
  const total = Math.max(0, afterDiscount - bonusUsed);
  const count = lines.reduce((s, x) => s + x.line.qty, 0);

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    setPromoErr('');
    const found = promos.find(p => p.code === code);
    if (!found) {
      setPromoErr('Такого промокода нет');
      return;
    }
    if (found.needsUnlock && !state.unlockedPromos.includes(code)) {
      setPromoErr('Откройте промокод — поделитесь товаром в историях');
      return;
    }
    if (found.clubOnly && !isClub) {
      setPromoErr('Промокод только для подписчиков ZeSt Club');
      return;
    }
    if (found.firstOrderOnly && state.orders.length > 0) {
      setPromoErr('Промокод только для первого заказа');
      return;
    }
    if (found.minSubtotal && subtotal < found.minSubtotal) {
      setPromoErr(`Работает от ${fmtMoney(found.minSubtotal)}`);
      return;
    }
    const discount = found.type === 'percent' ? Math.round((subtotal * found.value) / 100) : found.value;
    setPromo({ code, discount });
    toast(`Промокод ${code} применён: ${found.description}`);
  };

  const goCheckout = () => {
    if (!lines.length) return;
    router.go('checkout', { promo: promo?.code ?? null, useBonus });
  };

  if (!lines.length) {
    return (
      <div className="screen">
        <h1 className="h1">Корзина</h1>
        <Empty
          icon="cart"
          title="Пока пусто"
          text="Соберите заряд: энергетики, вода и лимонады ждут в каталоге"
          action={<Button onClick={() => router.setTab('catalog')}>В каталог</Button>}
        />
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="section__head">
        <div className="section__title">
          Корзина · {count} {plural(count, 'товар', 'товара', 'товаров')}
        </div>
      </div>

      {lines.map(({ line, product }) => (
        <div key={product.id} className="cart-line">
          <div
            className="cart-line__img"
            style={{ background: `radial-gradient(circle, ${hexToRgba(product.can.body, 0.25)}, transparent 70%)`, borderRadius: 14 }}
          >
            <CanVisual product={product} size={40} />
          </div>
          <div className="cart-line__mid">
            <div className="cart-line__name">{product.name}</div>
            <div className="cart-line__meta">
              {product.volume} л · {fmtMoney(effPrice(product, isClub))} / шт
            </div>
            <div className="cart-line__price">{fmtMoney(effPrice(product, isClub) * line.qty)}</div>
          </div>
          <div className="cart-line__end">
            <Stepper small value={line.qty} onChange={q => dispatch({ type: 'SET_QTY', productId: product.id, qty: q })} />
            <button className="del" onClick={() => dispatch({ type: 'REMOVE_LINE', productId: product.id })}>
              <Icon name="trash" size={16} />
            </button>
          </div>
        </div>
      ))}

      {!isClub ? (
        <div className="free-dlv">
          {subtotal >= FREE_FROM
            ? 'Доставка бесплатная — вы добрали на 700 ₽'
            : `Добавьте ${fmtMoney(FREE_FROM - subtotal)} до бесплатной доставки`}
          <div className="prog">
            <span style={{ width: `${Math.min(100, Math.round((subtotal / FREE_FROM) * 100))}%` }} />
          </div>
        </div>
      ) : (
        <div className="free-dlv free-dlv--club">
          <Icon name="bolt" size={15} /> Доставка бесплатная — вы в ZeSt Club
        </div>
      )}

      <div className="card" style={{ marginTop: 14 }}>
        <div className="promo-row">
          <input className="input" placeholder="Промокод" value={promoInput} onChange={e => setPromoInput(e.target.value)} />
          <Button small onClick={applyPromo}>
            Применить
          </Button>
        </div>
        {promoErr ? <div className="field__err">{promoErr}</div> : null}
        {promo && !promoErr ? <div className="ok" style={{ marginTop: 6, fontWeight: 700, fontSize: 12.5 }}>{promo.code}: {fmtMoney(promo.discount)}</div> : null}

        <div className="chips-row" style={{ marginTop: 10 }}>
          {promos.map(p => {
            const locked = (p.needsUnlock && !state.unlockedPromos.includes(p.code)) || (p.clubOnly && !isClub);
            return (
              <button
                key={p.code}
                className="chip chip--sm"
                onClick={() => !locked && setPromoInput(p.code)}
                style={locked ? { opacity: 0.5 } : undefined}
              >
                {locked ? <Icon name="lock" size={12} /> : null} {p.code}
              </button>
            );
          })}
        </div>

        <div className="bonus-row">
          <div>
            <div style={{ fontWeight: 700, fontSize: 13.5 }}>Списать бонусы</div>
            <div className="muted" style={{ fontSize: 12 }}>
              Доступно {fmtMoney(state.bonusBalance)} · до 50% суммы
            </div>
          </div>
          <Switch checked={useBonus} onChange={setUseBonus} />
        </div>
        {useBonus ? <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>Спишем {fmtMoney(maxBonus)}</div> : null}
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="sum-row">
          <span>Товары</span>
          <span>{fmtMoney(subtotal)}</span>
        </div>
        <div className="sum-row">
          <span>Доставка</span>
          <span>{delivery === 0 ? 'бесплатно' : fmtMoney(delivery)}</span>
        </div>
        {promo ? (
          <div className="sum-row">
            <span>Промокод {promo.code}</span>
            <span>−{fmtMoney(promo.discount)}</span>
          </div>
        ) : null}
        {bonusUsed > 0 ? (
          <div className="sum-row">
            <span>Бонусы</span>
            <span>−{fmtMoney(bonusUsed)}</span>
          </div>
        ) : null}
        <div className="sum-row sum-row--total">
          <span>Итого</span>
          <span>{fmtMoney(total)}</span>
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <Button block onClick={goCheckout}>
          Оформить заказ · {fmtMoney(total)}
        </Button>
      </div>
    </div>
  );
}
