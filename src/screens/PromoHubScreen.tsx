import { useEffect, useMemo, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useRouter } from '../context/RouterContext';
import { useToast } from '../context/ToastContext';
import { fmtMoney } from '../utils/format';
import { StackScreen } from '../components/StackScreen';
import { Badge, Button, SectionTitle } from '../components/ui';
import { Icon } from '../components/icons';

export function PromoHubScreen() {
  const { state, isClub, promos, dispatch } = useStore();
  const router = useRouter();
  const toast = useToast();
  const [nowTick, setNowTick] = useState(Date.now());

  useEffect(() => {
    const t = window.setInterval(() => setNowTick(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const weekEnd = useMemo(() => {
    const d = new Date();
    const add = (7 - d.getDay()) % 7 || 7;
    const end = new Date(d);
    end.setDate(d.getDate() + add);
    end.setHours(23, 59, 59, 999);
    return end.getTime();
  }, []);
  const rem = Math.max(0, weekEnd - nowTick);
  const countdown = `${Math.floor(rem / 86400000)} д ${String(Math.floor((rem % 86400000) / 3600000)).padStart(2, '0')}:${String(
    Math.floor((rem % 3600000) / 60000),
  ).padStart(2, '0')}:${String(Math.floor((rem % 60000) / 1000)).padStart(2, '0')}`;

  const copy = (code: string) => {
    try {
      navigator.clipboard?.writeText(code);
    } catch {}
    toast(`Код ${code} скопирован — вставьте его в корзине`);
    router.setTab('cart');
  };

  return (
    <StackScreen title="Акции и коды">
      <div className="promo-hero">
        <div className="promo-hero__t">АКЦИИ НЕДЕЛИ</div>
        <div className="promo-hero__d">
          {state.products.some(p => p.limited) ? (
            <>
              Дроп недели закрывается через <b className="promo-hero__timer">{countdown}</b>
            </>
          ) : (
            'Собираем следующий дроп — следите за новостями'
          )}
        </div>
      </div>

      {!isClub ? (
        <button className="promo-card promo-card--club" onClick={() => router.setTab('club')}>
          <span className="grow">
            <div className="promo-code" style={{ color: '#C9B4FF' }}>
              ZeSt CLUB
            </div>
            <div className="promo-desc">Доставка 0 ₽, кэшбэк 10% и коды раньше всех — от 199 ₽/мес</div>
          </span>
          <Icon name="arrow" size={18} />
        </button>
      ) : null}

      <div className="section">
        <SectionTitle>Промокоды</SectionTitle>
        {promos.map(p => {
          const lockedClub = !!p.clubOnly && !isClub;
          const lockedUnlock = !!p.needsUnlock && !state.unlockedPromos.includes(p.code);
          const lockedFirst = !!p.firstOrderOnly && state.orders.length > 0;
          const locked = lockedClub || lockedUnlock || lockedFirst;
          return (
            <div key={p.code} className="promo-card">
              <div className="promo-row" style={{ marginTop: 0 }}>
                <span className="promo-code">{p.code}</span>
                <span className="promo-value">{p.type === 'percent' ? `−${p.value}%` : `−${fmtMoney(p.value)}`}</span>
              </div>
              <div className="promo-desc">{p.description}</div>
              {lockedClub ? (
                <div className="promo-lock">
                  <Icon name="lock" size={13} /> Только для подписчиков ZeSt Club
                </div>
              ) : null}
              {lockedUnlock ? (
                <div className="promo-lock">
                  <Icon name="lock" size={13} /> Откройте: поделитесь товаром в истории
                </div>
              ) : null}
              {lockedFirst ? (
                <div className="promo-lock">
                  <Icon name="lock" size={13} /> Только для первого заказа
                </div>
              ) : null}
              {p.minSubtotal ? (
                <div className="promo-lock">
                  <Icon name="card" size={13} /> Работает от {fmtMoney(p.minSubtotal)}
                </div>
              ) : null}
              <div className="promo-row">
                {locked ? (
                  <span className="muted" style={{ fontSize: 12.5, fontWeight: 600 }}>
                    {lockedClub ? (
                      <Button small variant="dark" onClick={() => router.setTab('club')}>
                        В ZeSt Club
                      </Button>
                    ) : lockedUnlock ? (
                      <Button small variant="ghost" onClick={() => router.go('product', { id: state.products[0]?.id ?? '' })}>
                        Поделиться товаром
                      </Button>
                    ) : (
                      'Недоступно сейчас'
                    )}
                  </span>
                ) : (
                  <Button small onClick={() => copy(p.code)}>
                    <Icon name="card" size={15} /> Скопировать код
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="section">
        <SectionTitle>Постоянные предложения</SectionTitle>
        <div className="promo-card">
          <div className="promo-row" style={{ marginTop: 0 }}>
            <span className="promo-code" style={{ fontSize: 16 }}>
              2 ПО ЦЕНЕ 1
            </span>
            <Badge type="HIT" />
          </div>
          <div className="promo-desc">На все лимонады до воскресенья — успейте захлопнуть</div>
          <div className="promo-row">
            <Button
              small
              variant="ghost"
              onClick={() => {
                dispatch({ type: 'SET_PRESET', preset: { category: 'lemonade' } });
                router.setTab('catalog');
              }}
            >
              К лимонадам
            </Button>
          </div>
        </div>
        <div className="promo-card">
          <div className="promo-row" style={{ marginTop: 0 }}>
            <span className="promo-code" style={{ fontSize: 16 }}>
              ДОСТАВКА 0 ₽ от 700 ₽
            </span>
            <Badge type="CLUB" />
          </div>
          <div className="promo-desc">Всегда бесплатно для участников ZeSt Club — на любой чек</div>
          <div className="promo-row">
            <Button small variant="ghost" onClick={() => router.setTab('club')}>
              Про Club
            </Button>
          </div>
        </div>
      </div>
    </StackScreen>
  );
}
