import { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useRouter } from '../context/RouterContext';
import { useToast } from '../context/ToastContext';
import { fmtDate, fmtMoney, fmtTime, plural } from '../utils/format';
import { StackScreen } from '../components/StackScreen';
import { OrderTimeline } from '../components/OrderTimeline';
import { Button, Empty, SectionTitle, Stars } from '../components/ui';
import { Icon } from '../components/icons';
import { CanVisual } from '../components/CanVisual';
import { config } from '../config';
import { crmEnabled, cancelOrderCRM, postReviewCRM } from '../api/crm';

export function OrderScreen({ id }: { id: string }) {
  const { state, dispatch, isClub, productById } = useStore();
  const router = useRouter();
  const toast = useToast();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(t);
  }, []);

  const order = state.orders.find(o => o.id === Number(id));

  if (!order) {
    return (
      <StackScreen title="Заказ">
        <Empty icon="search" title="Заказ не найден" text="Возможно, данные были сброшены" />
      </StackScreen>
    );
  }

  const [stars, setStars] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const repeat = () => {
    const lines = order.items.filter(l => productById(l.productId));
    dispatch({ type: 'ADD_LINES', lines });
    toast('Товары добавлены в корзину');
    router.setTab('cart');
  };

  const rate = (v: number) => {
    dispatch({ type: 'RATE_ORDER', orderId: order.id });
    toast(`Спасибо! +50 бонусов за отзыв (${v}/5)`);
    if (crmEnabled()) {
      postReviewCRM({
        orderId: order.id,
        rating: v,
        text: reviewText.trim(),
        name: state.customName.trim() || state.user?.name || '',
      }).catch(() => {});
    }
  };

  const sendReview = () => {
    if (stars === 0) {
      toast('Поставьте звёзды от 1 до 5');
      return;
    }
    rate(stars);
  };

  const cancelOrder = () => {
    dispatch({ type: 'CANCEL_ORDER', id: order.id });
    if (crmEnabled()) cancelOrderCRM(order.id).catch(() => {});
    toast('Заказ отменён, бонусы возвращены');
  };

  const count = order.items.reduce((s, l) => s + l.qty, 0);
  const deliveredT = order.statusAt.delivered;
  const totalMs = deliveredT ? deliveredT - order.createdAt : 60000;
  const etaPct = Math.min(100, Math.max(0, Math.round(((now - order.createdAt) / totalMs) * 100)));

  return (
    <StackScreen title={`Заказ #${order.id}`}>
      {order.status !== 'delivered' && deliveredT ? (
        <div className="free-dlv" style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="clock" size={14} /> Курьер прибудет примерно через 40 минут
          </div>
          <div className="prog">
            <span style={{ width: `${etaPct}%` }} />
          </div>
        </div>
      ) : null}

      <OrderTimeline order={order} />

      {order.status === 'accepted' ? (
        <div style={{ marginTop: 10 }}>
          <Button variant="ghost" block onClick={cancelOrder}>
            Отменить заказ
          </Button>
        </div>
      ) : null}

      {order.status === 'transit' ? (
        <div style={{ marginTop: 10 }}>
          <Button variant="ghost" block onClick={() => toast('Чат с курьером откроется в сообществе VK')}>
            Связаться с курьером
          </Button>
        </div>
      ) : null}

      {order.status === 'delivered' && !order.rated ? (
        <div className="card" style={{ marginTop: 12, textAlign: 'center' }}>
          <div style={{ fontWeight: 800 }}>Оцените заказ — +50 бонусов</div>
          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center' }}>
            <Stars value={stars} size={30} onChange={setStars} />
          </div>
          <textarea
            className="input"
            style={{ marginTop: 12, minHeight: 70, paddingTop: 10, paddingBottom: 10, textAlign: 'left', width: '100%', resize: 'none' }}
            placeholder="Пара слов о заказе (необязательно)"
            value={reviewText}
            onChange={e => setReviewText(e.target.value)}
          />
          <Button block small onClick={sendReview}>
            Отправить отзыв
          </Button>
        </div>
      ) : null}
      {order.rated ? (
        <div className="ok" style={{ marginTop: 12, fontWeight: 700, fontSize: 13.5, textAlign: 'center' }}>
          Отзыв учтён, бонусы начислены
        </div>
      ) : null}

      <div className="card" style={{ marginTop: 12 }}>
        <div className="sum-row">
          <span>Дата</span>
          <span>
            {fmtDate(order.createdAt)}, {fmtTime(order.createdAt)}
          </span>
        </div>
        <div className="sum-row">
          <span>Адрес</span>
          <span style={{ textAlign: 'right', maxWidth: '60%' }}>{order.address}</span>
        </div>
        <div className="sum-row">
          <span>Слот</span>
          <span>{order.slot}</span>
        </div>
        <div className="sum-row">
          <span>Оплата</span>
          <span>{order.payment ?? 'VK Pay (онлайн)'}</span>
        </div>
        <div className="sum-row">
          <span>Доставка</span>
          <span>
            {order.delivery === 0 ? (isClub ? 'бесплатно · Club' : 'бесплатно') : fmtMoney(order.delivery)}
          </span>
        </div>
        {order.discount > 0 ? (
          <div className="sum-row">
            <span>Скидка</span>
            <span>−{fmtMoney(order.discount)}</span>
          </div>
        ) : null}
        {order.bonusUsed > 0 ? (
          <div className="sum-row">
            <span>Бонусы</span>
            <span>−{fmtMoney(order.bonusUsed)}</span>
          </div>
        ) : null}
        {order.bonusEarned > 0 ? (
          <div className="sum-row">
            <span>Кэшбэк бонусами</span>
            <span className="ok">+{fmtMoney(order.bonusEarned)}</span>
          </div>
        ) : null}
        <div className="sum-row sum-row--total">
          <span>Итого</span>
          <span>{fmtMoney(order.total)}</span>
        </div>
      </div>

      <div className="section">
        <SectionTitle>
          Состав заказа · {count} {plural(count, 'товар', 'товара', 'товаров')}
        </SectionTitle>
        {order.items.map(l => {
          const p = productById(l.productId);
          if (!p) return null;
          return (
            <div key={l.productId} className="cart-line">
              <div className="cart-line__img">
                <CanVisual product={p} size={38} />
              </div>
              <div className="cart-line__mid">
                <div className="cart-line__name">{p.name}</div>
                <div className="cart-line__meta">{l.qty} шт</div>
              </div>
              <div className="cart-line__price">{fmtMoney((l.unit ?? p.price) * l.qty)}</div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 14 }}>
        <Button block onClick={repeat}>
          <Icon name="repeat" size={16} /> Повторить заказ
        </Button>
      </div>
    </StackScreen>
  );
}
