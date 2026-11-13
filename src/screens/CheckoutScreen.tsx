import { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useRouter } from '../context/RouterContext';
import { useToast } from '../context/ToastContext';
import { SLOTS } from '../data/promos';
import { effPrice, fmtMoney } from '../utils/format';
import { getGeodata, getPhone, pay, taptic } from '../bridge/vkApi';
import { submitOrder } from '../api/client';
import { config } from '../config';
import { StackScreen } from '../components/StackScreen';
import { Button, Chip, Sheet, Spinner, Switch } from '../components/ui';
import { Icon } from '../components/icons';
import type { IconName } from '../components/icons';

const PAY_OPTIONS: { id: string; icon: IconName; title: string; sub: string }[] = [
  { id: 'vkpay', icon: 'card', title: 'VK Pay — сейчас онлайн', sub: 'Быстро и безопасно, карта уже в VK' },
  { id: 'card', icon: 'card', title: 'Картой при получении', sub: 'Курьер привезёт терминал' },
  { id: 'cash', icon: 'cash', title: 'Наличными при получении', sub: 'Подготовьте сумму без сдачи' },
];

export function CheckoutScreen({ params }: { params?: Record<string, any> }) {
  const { state, dispatch, isClub, productById, deliveryCost, promos } = useStore();
  const router = useRouter();
  const toast = useToast();

  const lines = state.cart.flatMap(l => {
    const p = productById(l.productId);
    return p ? [{ line: l, product: p }] : [];
  });
  const subtotal = lines.reduce((s, x) => s + effPrice(x.product, isClub) * x.line.qty, 0);
  const delivery = deliveryCost(subtotal);

  const promoCode: string | null = params?.promo ?? null;
  const promo = promoCode ? promos.find(p => p.code === promoCode) : undefined;
  const discount = promo ? (promo.type === 'percent' ? Math.round((subtotal * promo.value) / 100) : promo.value) : 0;

  const [useBonus, setUseBonus] = useState<boolean>(!!params?.useBonus);
  const afterDiscount = subtotal + delivery - discount;
  const maxBonus = Math.min(state.bonusBalance, Math.floor(afterDiscount / 2));
  const bonusUsed = useBonus ? maxBonus : 0;
  const total = Math.max(0, afterDiscount - bonusUsed);

  const [addressId, setAddressId] = useState(state.addressId);
  const [comment, setComment] = useState('');
  const [slot, setSlot] = useState(SLOTS[0]);
  const [phone, setPhone] = useState('');
  const [addSheet, setAddSheet] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [payment, setPayment] = useState('vkpay');

  useEffect(() => {
    getPhone().then(ph => {
      if (ph) setPhone(ph);
    });
  }, []);

  if (!lines.length) {
    return (
      <StackScreen title="Оформление">
        <div className="muted" style={{ padding: 24, textAlign: 'center' }}>
          Корзина пуста
        </div>
      </StackScreen>
    );
  }

  const address = state.addresses.find(a => a.id === addressId) ?? state.addresses[0];

  const detectAddress = async () => {
    const geo = await getGeodata();
    if (!geo) {
      toast('Не удалось получить геопозицию');
      return;
    }
    setNewValue(`Москва, точка ${geo.lat.toFixed(4)}, ${geo.long.toFixed(4)}`);
    if (!newLabel.trim()) setNewLabel('Геопозиция');
    toast('Определили по VK Геолокации — уточните подъезд');
  };

  const saveAddress = () => {
    if (!newValue.trim()) {
      toast('Укажите адрес');
      return;
    }
    dispatch({
      type: 'ADD_ADDRESS',
      address: { id: `a${Date.now()}`, label: newLabel.trim() || 'Адрес', value: newValue.trim() },
    });
    setAddSheet(false);
    setNewLabel('');
    setNewValue('');
    toast('Адрес сохранён');
  };

  const orderId = state.orders.reduce((m, o) => Math.max(m, o.id), 1000) + 1;

  const submit = async () => {
    if (busy) return;
    const paymentLabel =
      payment === 'vkpay'
        ? 'VK Pay (онлайн)'
        : payment === 'card'
          ? 'Картой при получении'
          : 'Наличными при получении';
    const addressFull = `${address.value}${comment.trim() ? `, ${comment.trim()}` : ''}`;
    const draft = {
      lines: state.cart.map(l => {
        const p = productById(l.productId);
        return { ...l, unit: p ? effPrice(p, isClub) : undefined };
      }),
      subtotal,
      delivery,
      discount,
      bonusUsed,
      total,
      address: addressFull,
      slot,
      payment: paymentLabel,
    };
    setBusy(true);
    taptic('medium');

    if (payment === 'vkpay') {
      const ok = await pay(total, `Заказ ZeSt #${orderId}`);
      setBusy(false);
      if (!ok) {
        toast('Платёж не прошёл. Попробуйте ещё раз');
        return;
      }
    }

    dispatch({ type: 'PLACE_ORDER', draft });
    taptic('success');
    setBusy(false);
    if (config.API_BASE_URL) {
      submitOrder(config.API_BASE_URL, {
        orderId,
        customer: state.user?.name ?? state.customName ?? 'гость',
        phone,
        address: addressFull,
        slot,
        itemsText: lines.map(x => `${x.product.name} ×${x.line.qty}`).join('; '),
        total,
        payment: paymentLabel,
      }).catch(() => {});
    }
    router.replace('success', { id: orderId });
  };

  return (
    <StackScreen title="Оформление заказа">
      <div className="field">
        <span className="field__label">
          <Icon name="pin" size={13} /> Доставка по адресу
        </span>
        {state.addresses.map(a => (
          <button
            key={a.id}
            className={`addr-chip ${a.id === addressId ? 'addr-chip--on' : ''}`}
            onClick={() => setAddressId(a.id)}
          >
            <span className="addr-chip__ico">
              <Icon name="pin" size={17} />
            </span>
            <span className="grow">
              <span className="addr-chip__label">{a.label}</span>
              <div className="addr-chip__value">{a.value}</div>
            </span>
            {a.id === addressId ? <Icon name="check" size={17} /> : null}
          </button>
        ))}
        <button className="addr-chip" onClick={() => setAddSheet(true)}>
          <span className="addr-chip__ico">
            <Icon name="plus" size={17} />
          </span>
          <span className="addr-chip__label">Новый адрес</span>
        </button>
        <input
          className="input"
          style={{ marginTop: 8 }}
          placeholder="Подъезд, этаж, комментарий"
          value={comment}
          onChange={e => setComment(e.target.value)}
        />
      </div>

      <div className="field">
        <span className="field__label">
          <Icon name="phone" size={13} /> Телефон получателя
        </span>
        <div className="addr-chip">
          <span className="addr-chip__ico">
            <Icon name="phone" size={17} />
          </span>
          <span className="grow">{phone || 'Получаем из VK ID...'}</span>
          <span className="muted" style={{ fontSize: 11 }}>
            VK ID
          </span>
        </div>
      </div>

      <div className="field">
        <span className="field__label">
          <Icon name="clock" size={13} /> Время доставки
        </span>
        <div className="f-chips">
          {SLOTS.map(s => (
            <Chip key={s} small active={slot === s} onClick={() => setSlot(s)}>
              {s}
            </Chip>
          ))}
        </div>
      </div>

      <div className="field">
        <span className="field__label">
          <Icon name="card" size={13} /> Способ оплаты
        </span>
        {PAY_OPTIONS.map(o => (
          <button
            key={o.id}
            className={`pay-row ${payment === o.id ? '' : 'pay-row--off'}`}
            onClick={() => setPayment(o.id)}
          >
            <span className="pay-row__ico">
              <Icon name={o.icon} size={20} />
            </span>
            <span className="grow">
              <b>{o.title}</b>
              <div className="addr-chip__value">{o.sub}</div>
            </span>
            {payment === o.id ? (
              <span className="pay-row__check">
                <Icon name="check" size={18} />
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="sum-row">
          <span>Товары ({lines.reduce((s, x) => s + x.line.qty, 0)})</span>
          <span>{fmtMoney(subtotal)}</span>
        </div>
        <div className="sum-row">
          <span>Доставка</span>
          <span>{delivery === 0 ? 'бесплатно' : fmtMoney(delivery)}</span>
        </div>
        {discount > 0 ? (
          <div className="sum-row">
            <span>Промокод {promo?.code}</span>
            <span>−{fmtMoney(discount)}</span>
          </div>
        ) : null}
        <div className="bonus-row">
          <div>
            <div style={{ fontWeight: 700, fontSize: 13.5 }}>Списать бонусы</div>
            <div className="muted" style={{ fontSize: 12 }}>
              {fmtMoney(state.bonusBalance)} · до 50% суммы
            </div>
          </div>
          <Switch checked={useBonus} onChange={setUseBonus} />
        </div>
        {bonusUsed > 0 ? (
          <div className="sum-row">
            <span>Бонусы</span>
            <span>−{fmtMoney(bonusUsed)}</span>
          </div>
        ) : null}
        <div className="sum-row sum-row--total">
          <span>К оплате</span>
          <span>{fmtMoney(total)}</span>
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <Button block disabled={busy} onClick={submit}>
          {busy ? 'Обрабатываем...' : `Оплатить ${fmtMoney(total)} через VK Pay`}
        </Button>
        <div className="muted" style={{ textAlign: 'center', fontSize: 11.5, marginTop: 8 }}>
          Нажимая, вы соглашаетесь с условиями доставки ZeSt
        </div>
      </div>

      {busy ? (
        <div className="pay-overlay">
          <Spinner />
          <div>Обрабатываем платёж через VK Pay</div>
        </div>
      ) : null}

      <Sheet open={addSheet} title="Новый адрес" onClose={() => setAddSheet(false)}>
        <input
          className="input"
          style={{ marginTop: 4 }}
          placeholder="Название (Дом, Работа...)"
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
        />
        <input
          className="input"
          style={{ marginTop: 8 }}
          placeholder="Улица, дом, квартира"
          value={newValue}
          onChange={e => setNewValue(e.target.value)}
        />
        <div style={{ marginTop: 10 }}>
          <Button variant="ghost" block onClick={detectAddress}>
            <Icon name="geo" size={16} /> Определить по геолокации VK
          </Button>
        </div>
        <div className="sheet__btns">
          <button className="btn btn--ghost" onClick={() => setAddSheet(false)}>
            Отмена
          </button>
          <button className="btn" onClick={saveAddress}>
            Сохранить
          </button>
        </div>
      </Sheet>
    </StackScreen>
  );
}
