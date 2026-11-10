import { useStore } from '../context/StoreContext';
import { fmtDate, fmtTime } from '../utils/format';
import { StackScreen } from '../components/StackScreen';
import { Button, Empty } from '../components/ui';
import { Icon } from '../components/icons';

export function NotificationsScreen() {
  const { state, dispatch } = useStore();
  const items = state.notifications;
  const unread = items.filter(n => !n.read).length;

  return (
    <StackScreen title="Уведомления">
      {items.length === 0 ? (
        <Empty icon="bell" title="Пока тихо" text="Здесь появятся статусы заказов, дропы и персональные скидки" />
      ) : (
        <>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
            <span className="muted" style={{ fontSize: 12.5, fontWeight: 600 }}>
              {unread > 0 ? `Новых: ${unread}` : 'Всё прочитано'}
            </span>
            {unread > 0 ? (
              <Button small variant="ghost" onClick={() => dispatch({ type: 'READ_ALL' })}>
                Прочитать все
              </Button>
            ) : null}
          </div>
          {items.map(n => (
            <div key={n.id} className="notif-row">
              <span className={`notif-dot ${n.read ? 'notif-dot--read' : ''}`} />
              <span className="grow">
                <div className="notif-title">{n.title}</div>
                <div className="notif-text">{n.text}</div>
                <div className="notif-time">
                  {fmtDate(n.t)}, {fmtTime(n.t)}
                </div>
              </span>
            </div>
          ))}
          <div className="muted" style={{ fontSize: 11, marginTop: 12, textAlign: 'center' }}>
            Разрешите push-уведомления VK в профиле, чтобы не пропускать дропы
          </div>
          <div style={{ height: 8 }} />
          <div className="notif-hint">
            <Icon name="bell" size={16} />
            Хотите мгновенные статусы и скидки — включите push в профиле
          </div>
        </>
      )}
    </StackScreen>
  );
}
