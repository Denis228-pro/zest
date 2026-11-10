import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { STATUS_META } from '../context/StoreContext';
import { useRouter } from '../context/RouterContext';
import { useToast } from '../context/ToastContext';
import { fmtDate, fmtMoney, fmtTime, plural } from '../utils/format';
import { allowNotifications, invite as vkInvite, showStory } from '../bridge/vkApi';
import { useInstall } from '../hooks/useInstall';
import { Badge, Button, Empty, SectionTitle, Switch } from '../components/ui';
import { Icon } from '../components/icons';
import type { IconName } from '../components/icons';

const ACHIEVEMENTS: { id: string; name: string; desc: string; icon: IconName }[] = [
  { id: 'first', name: 'Первый глоток', desc: '1 заказ', icon: 'bolt' },
  { id: 'ten', name: 'Разряд', desc: '10 заказов', icon: 'fire' },
  { id: 'club', name: 'Клубный игрок', desc: 'ZeSt Club', icon: 'trophy' },
  { id: 'ref', name: 'Вожак стаи', desc: 'Друг в клубе', icon: 'sparkle' },
];

export function ProfileScreen() {
  const { state, dispatch, isClub } = useStore();
  const router = useRouter();
  const toast = useToast();
  const [notif, setNotif] = useState(false);
  const install = useInstall();

  const user = state.user;
  const displayName = state.customName.trim() || user?.name || 'Гость ZeSt';
  const initial = displayName[0].toUpperCase();
  const [nameDraft, setNameDraft] = useState(state.customName);
  const done = state.orders.length;
  const achievements = ACHIEVEMENTS.map(a => {
    const progress =
      a.id === 'first'
        ? `${Math.min(done, 1)}/1`
        : a.id === 'ten'
          ? `${Math.min(done, 10)}/10`
          : a.id === 'club'
            ? `${isClub ? 1 : 0}/1`
            : `${state.invited ? 1 : 0}/1`;
    return { ...a, progress, on: a.id === 'first' ? done >= 1 : a.id === 'ten' ? done >= 10 : a.id === 'club' ? isClub : state.invited };
  });
  const activeOrder = state.orders.find(o => o.status !== 'delivered');
  const referralCode = `ZEST-${(user?.id ?? 4719) % 10000}`;

  const onInvite = async () => {
    await vkInvite();
    dispatch({ type: 'MARK_INVITE' });
    toast('Приглашение отправлено: +300 бонусов вам, 200 — другу');
  };

  const onStory = async () => {
    const ok = await showStory();
    if (ok) {
      dispatch({ type: 'MARK_STORY' });
      toast('История опубликована: +100 бонусов и промокод STORY50');
    } else {
      toast('Не удалось открыть шторку историй');
    }
  };

  const onNotif = async (v: boolean) => {
    setNotif(v);
    if (v) {
      const ok = await allowNotifications();
      toast(ok ? 'Уведомления включены: статусы заказа и скидки' : 'VK не дал разрешение на уведомления');
    }
  };

  return (
    <div className="screen">
      <div className="prof-head">
        <span className="avatar">{user?.photo && !state.customName ? <img src={user.photo} alt="" /> : initial}</span>
        <div className="grow">
          <div className="prof-head__name">{displayName}</div>
          <div className="prof-head__sub">
            {isClub ? <Badge type="CLUB" /> : null}
            <span className="row" style={{ gap: 4 }}>
              <Icon name="fire" size={13} /> {state.streak}{' '}
              {plural(state.streak, 'заказ', 'заказа', 'заказов')} подряд
            </span>
          </div>
        </div>
      </div>

      <div className="bonus-card">
        <div className="bonus-card__l">Баланс бонусов</div>
        <div className="bonus-card__v">{fmtMoney(state.bonusBalance)}</div>
        <div className="earn-row">
          <span>Отзыв о заказе</span>
          <b>+50</b>
        </div>
        <div className="earn-row">
          <span>История с ZeSt</span>
          <b>+100</b>
        </div>
        <div className="earn-row">
          <span>Друг по коду {referralCode}</span>
          <b>+300</b>
        </div>
      </div>

      {state.bonusLog.length > 0 ? (
        <div className="section">
          <SectionTitle>История бонусов</SectionTitle>
          <div className="card" style={{ padding: '8px 16px' }}>
            {state.bonusLog
              .slice(-6)
              .reverse()
              .map(e => (
                <div key={`${e.t}-${e.reason}`} className="blog-row">
                  <span className="grow">
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{e.reason}</div>
                    <div className="muted" style={{ fontSize: 11 }}>
                      {fmtDate(e.t)}, {fmtTime(e.t)}
                    </div>
                  </span>
                  <span className={e.amount >= 0 ? 'ok' : ''} style={{ fontWeight: 800 }}>
                    {e.amount >= 0 ? '+' : '−'}
                    {fmtMoney(Math.abs(e.amount))}
                  </span>
                </div>
              ))}
          </div>
        </div>
      ) : null}

      {activeOrder ? (
        <div className="section">
          <SectionTitle>Активный заказ</SectionTitle>
          <button
            className="order-card"
            style={{ width: '100%', textAlign: 'left' }}
            onClick={() => router.go('order', { id: String(activeOrder.id) })}
          >
            <div className="order-card__top">
              <span className="order-card__id">
                #{activeOrder.id} · {fmtMoney(activeOrder.total)}
              </span>
              <span className={`status-pill status-pill--${activeOrder.status}`}>{STATUS_META[activeOrder.status].title}</span>
            </div>
            <div className="order-card__meta">{STATUS_META[activeOrder.status].desc} · нажмите, чтобы отследить</div>
          </button>
        </div>
      ) : null}

      <div className="section">
        <SectionTitle>История заказов</SectionTitle>
        {state.orders.length === 0 ? (
          <Empty
            icon="cart"
            title="Заказов ещё нет"
            text="Время собрать первый заряд"
            action={<Button onClick={() => router.setTab('catalog')}>В каталог</Button>}
          />
        ) : (
          state.orders.map(o => (
            <div key={o.id} className="order-card">
              <div className="order-card__top">
                <span className="order-card__id">
                  #{o.id} · {fmtMoney(o.total)}
                </span>
                <span className={`status-pill status-pill--${o.status}`}>{STATUS_META[o.status].title}</span>
              </div>
              <div className="order-card__meta">
                {fmtDate(o.createdAt)} · {o.items.reduce((s, l) => s + l.qty, 0)} шт · {o.slot}
              </div>
              <div className="order-card__row">
                <Button
                  small
                  variant="ghost"
                  onClick={() => {
                    dispatch({ type: 'ADD_LINES', lines: o.items });
                    toast('Добавили в корзину');
                    router.setTab('cart');
                  }}
                >
                  Повторить
                </Button>
                {o.status === 'delivered' && !o.rated ? (
                  <Button small onClick={() => router.go('order', { id: String(o.id) })}>
                    Оценить · +50
                  </Button>
                ) : (
                  <Button small variant="ghost" onClick={() => router.go('order', { id: String(o.id) })}>
                    Детали
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="section">
        <SectionTitle>Достижения</SectionTitle>
        <div className="ach-row">
          {achievements.map(a => (
            <div key={a.id} className={`ach ${a.on ? '' : 'ach--off'}`}>
              <span className="ach__ico">
                <Icon name={a.icon} size={20} />
              </span>
              <div className="ach__t">{a.name}</div>
              <div className="ach__d">
                {a.desc} · {a.progress}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <SectionTitle>Энергия вдолгую</SectionTitle>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Button block onClick={onInvite}>
            <Icon name="sparkle" size={16} /> Пригласить друга · +300
          </Button>
          <Button variant="ghost" block onClick={onStory}>
            <Icon name="share" size={16} /> Опубликовать историю · +100
          </Button>
        </div>
      </div>

      <div className="section">
        <SectionTitle>Настройки</SectionTitle>
        <div className="card" style={{ padding: '2px 14px' }}>
          <div className="settings-row" style={{ flexWrap: 'wrap', rowGap: 8 }}>
            <Icon name="user" size={18} />
            <input
              className="input"
              style={{ flex: 1, height: 38, padding: '0 10px', fontSize: 13.5 }}
              placeholder="Ваше имя"
              value={nameDraft}
              onChange={e => setNameDraft(e.target.value)}
            />
            <Button
              small
              onClick={() => {
                dispatch({ type: 'SET_NAME', name: nameDraft });
                toast('Имя сохранено');
              }}
            >
              ОК
            </Button>
          </div>
          {install.canInstall ? (
            <button
              className="settings-row"
              onClick={async () => {
                const okInstall = await install.promptInstall();
                toast(okInstall ? 'ZeSt установлен на телефон' : 'Установка отложена');
              }}
            >
              <Icon name="arrow" size={18} />
              <span className="grow">Установить приложение на телефон</span>
              <Icon name="arrow" size={16} />
            </button>
          ) : null}
          {install.isIOS && !install.isStandalone ? (
            <div className="settings-row" onClick={() => toast('Safari → Поделиться → На экран Домой')} style={{ cursor: 'pointer' }}>
              <Icon name="phone" size={18} />
              <span className="grow">Добавить на экран iPhone</span>
              <Icon name="arrow" size={16} />
            </div>
          ) : null}
          {install.isStandalone ? (
            <div className="settings-row">
              <Icon name="check" size={18} />
              <span className="grow ok" style={{ fontWeight: 700 }}>
                Приложение установлено
              </span>
            </div>
          ) : null}
          <div className="settings-row">
            <Icon name="bell" size={18} />
            <span className="grow">Push-уведомления</span>
            <Switch checked={notif} onChange={onNotif} />
          </div>
          <div className="settings-row">
            <Icon name={state.theme === 'dark' ? 'moon' : 'sun'} size={18} />
            <span className="grow">Тёмная тема</span>
            <Switch
              checked={state.theme === 'dark'}
              onChange={v => dispatch({ type: 'SET_THEME', theme: v ? 'dark' : 'light' })}
            />
          </div>
          <button className="settings-row" onClick={() => toast('Напишите нам в сообществе ZeSt — отвечаем за 5 минут')}>
            <Icon name="user" size={18} />
            <span className="grow">Поддержка</span>
            <Icon name="arrow" size={16} />
          </button>
          <button
            className="settings-row"
            onClick={() => {
              dispatch({ type: 'RESET' });
              toast('Данные сброшены');
            }}
          >
            <Icon name="trash" size={18} />
            <span className="grow">Сбросить данные приложения</span>
          </button>
        </div>
        <div className="muted" style={{ fontSize: 11, marginTop: 10, textAlign: 'center' }}>
          ZeSt Mini App · демо-режим · оплата и подписка эмулируются без бэкенда
        </div>
      </div>
    </div>
  );
}
