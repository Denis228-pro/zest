import { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { STATUS_FLOW, STATUS_META } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import { fetchAdminOrders, updateOrderStatus } from '../api/supabase';
import type { AdminOrder } from '../api/supabase';
import type { OrderStatus } from '../context/StoreContext';
import { fmtDate, fmtMoney, fmtTime } from '../utils/format';
import { StackScreen } from '../components/StackScreen';
import { Button, Empty, SectionTitle } from '../components/ui';
import { Icon } from '../components/icons';

export function AdminScreen() {
  const { state } = useStore();
  const toast = useToast();
  const isAdmin = !!state.profile?.isAdmin;
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setBusy(true);
    try {
      setOrders(await fetchAdminOrders());
    } catch {
      toast('Не удалось загрузить заказы');
    }
    setBusy(false);
  };

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <StackScreen title="CRM">
        <Empty icon="lock" title="Доступ только для администратора" text="Роль выдаётся в Supabase: profiles → is_admin" />
      </StackScreen>
    );
  }

  const today = new Date().toDateString();
  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);
  const todayRevenue = todayOrders.reduce((s, o) => s + o.total, 0);

  const setStatus = async (o: AdminOrder, status: OrderStatus) => {
    setBusy(true);
    try {
      await updateOrderStatus(o.id, status);
      setOrders(list => list.map(x => (x.id === o.id ? { ...x, status } : x)));
      toast(`Заказ #${o.id} → ${STATUS_META[status].title}`);
    } catch {
      toast('Не удалось обновить статус');
    }
    setBusy(false);
  };

  return (
    <div className="screen screen--stack">
      <div className="stack-header">
        <div className="stack-header__title">CRM · Заказы</div>
        <button className="btn btn--sm btn--ghost" onClick={load} disabled={busy}>
          <Icon name="repeat" size={14} /> Обновить
        </button>
      </div>

      <div className="count-grid" style={{ marginTop: 8 }}>
        <div className="count-tile">
          <b>{todayOrders.length}</b>
          <span>заказов сегодня</span>
        </div>
        <div className="count-tile">
          <b>{fmtMoney(todayRevenue)}</b>
          <span>выручка сегодня</span>
        </div>
        <div className="count-tile">
          <b>{orders.length}</b>
          <span>всего в системе</span>
        </div>
      </div>

      <div className="section">
        <SectionTitle>Последние заказы</SectionTitle>
        {orders.length === 0 ? (
          <Empty icon="cart" title="Заказов пока нет" text="Как только клиент оформит заказ — он появится здесь" />
        ) : (
          orders.map(o => {
            const idx = STATUS_FLOW.indexOf(o.status);
            const next = idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
            const itemsText = o.items.map(i => `${i.name || i.productId} ×${i.qty}`).join(', ');
            return (
              <div key={o.id} className="order-card">
                <div className="order-card__top">
                  <span className="order-card__id">
                    #{o.id} · {fmtMoney(o.total)}
                  </span>
                  <span className={`status-pill status-pill--${o.status}`}>{STATUS_META[o.status].title}</span>
                </div>
                <div className="order-card__meta">
                  {fmtDate(o.createdAt)}, {fmtTime(o.createdAt)} · {o.customer || '—'} · {o.phone || 'нет телефона'}
                </div>
                <div className="order-card__meta">{itemsText || '—'}</div>
                <div className="order-card__meta">
                  {o.address} · {o.slot}
                </div>
                {next ? (
                  <div className="order-card__row">
                    <Button small block disabled={busy} onClick={() => setStatus(o, next)}>
                      {STATUS_META[next].title} →
                    </Button>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      <div className="muted" style={{ fontSize: 11.5, marginTop: 12, textAlign: 'center', lineHeight: 1.5 }}>
        Полный CRM: Supabase Dashboard → Table Editor → orders / products / promos.
        Изменение статуса на «Доставлен» автоматически начисляет кэшбэк клиенту и приходит ему уведомлением.
      </div>
    </div>
  );
}
