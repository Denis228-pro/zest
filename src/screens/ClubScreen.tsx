import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useRouter } from '../context/RouterContext';
import { useToast } from '../context/ToastContext';
import { fmtDate, fmtMoney, plural } from '../utils/format';
import { pay, taptic } from '../bridge/vkApi';
import { SectionTitle, Sheet } from '../components/ui';
import { Icon } from '../components/icons';
import type { IconName } from '../components/icons';
import { Logo } from '../components/Logo';
import { ProductCard } from '../components/ProductCard';
import { WheelOfFortune } from '../components/WheelOfFortune';

const BENEFITS: { icon: IconName; t: string; d: string }[] = [
  { icon: 'pin', t: 'Бесплатная доставка', d: 'На любой заказ и любой чек — всегда 0 ₽' },
  { icon: 'sparkle', t: 'Кэшбэк 10% бонусами', d: 'Бонусами можно оплатить до половины заказа' },
  { icon: 'bolt', t: 'Лимитированные вкусы', d: 'Закрытые дропы раньше всех и только для клуба' },
  { icon: 'clock', t: 'Закрытые распродажи', d: 'Доступ за 24 часа до старта для остальных' },
  { icon: 'gift', t: 'Сюрприз на день рождения', d: 'Подарочный набор и 500 бонусных рублей' },
  { icon: 'fire', t: '×2 бонусы по акциям', d: 'Все промо-акции с двойным кэшбэком' },
  { icon: 'sparkle', t: 'Колесо фортуны', d: 'Бесплатное вращение каждую неделю — до +150 бонусов' },
];

export function ClubScreen() {
  const { state, dispatch, isClub, products } = useStore();
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [manage, setManage] = useState(false);

  const limited = products.filter(p => p.limited);

  const subscribe = async (plan: 'month' | 'year') => {
    setBusy(true);
    taptic('medium');
    const ok = await pay(plan === 'month' ? 199 : 1590, 'Подписка ZeSt Club');
    setBusy(false);
    if (!ok) {
      toast('Не получилось оплатить. Попробуйте снова');
      return;
    }
    dispatch({ type: 'SUBSCRIBE', plan });
    taptic('success');
    toast('Добро пожаловать в ZeSt Club!');
  };

  if (!isClub || !state.club) {
    return (
      <div className="screen">
        <div className="club-hero">
          <span className="club-hero__badge">
            <Icon name="bolt" size={13} /> подписка ZeSt
          </span>
          <div className="club-hero__t">
            ZeSt <em>CLUB</em>
          </div>
          <div className="club-hero__d">
            Энергия без границ: доставка 0 ₽, кэшбэк 10% бонусами и вкусы, которых нет у остальных.
          </div>
        </div>

        <div className="section">
          <SectionTitle>Что даёт клуб</SectionTitle>
          {BENEFITS.map(b => (
            <div key={b.t} className="benefit">
              <span className="benefit__ico">
                <Icon name={b.icon} size={20} />
              </span>
              <span>
                <div className="benefit__t">{b.t}</div>
                <div className="benefit__d">{b.d}</div>
              </span>
            </div>
          ))}
        </div>

        <div className="section">
          <SectionTitle>Тарифы</SectionTitle>
          <div className="tariffs">
            <button className="tariff" onClick={() => subscribe('month')}>
              <div className="tariff__plan">Месяц</div>
              <div className="tariff__price">199 ₽</div>
              <div className="tariff__per">в месяц · отменяй когда хочешь</div>
            </button>
            <button className="tariff tariff--best" onClick={() => subscribe('year')}>
              <span className="badge badge--hit tariff__save">−33%</span>
              <div className="tariff__plan">Год</div>
              <div className="tariff__price">1590 ₽</div>
              <div className="tariff__per">159 ₽ в месяц</div>
            </button>
          </div>
          <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>
            Оплата через VK Pay. Автопродление — отмена в один тап, без звонков.
          </div>
        </div>

        <div className="card" style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="row" style={{ gap: 2 }}>
            <Icon name="star" size={18} filled />
            <span style={{ fontWeight: 800 }}>4.9</span>
          </div>
          <div className="muted" style={{ fontSize: 12.5 }}>
            уже 2 400+ участников клуба экономят с ZeSt Club
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <button className="btn btn--club btn--block" onClick={() => subscribe('month')}>
            Вступить в клуб · 199 ₽/мес
          </button>
          <div style={{ marginTop: 10 }}>
            <button className="btn btn--dark btn--block" onClick={() => subscribe('year')}>
              Год за 1590 ₽ — выгоднее на 33%
            </button>
          </div>
        </div>

        {busy ? (
          <div className="pay-overlay">
            <div className="spinner" />
            <div>Подключаем ZeSt Club...</div>
          </div>
        ) : null}
      </div>
    );
  }

  const club = state.club;
  return (
    <div className="screen">
      <div className="member-card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18 }}>ZeSt CLUB</div>
            <div style={{ opacity: 0.85, fontSize: 12.5, marginTop: 2 }}>
              {club.paused ? 'На паузе' : `Активна до ${fmtDate(club.until)}`} · {club.plan === 'month' ? 'месяц' : 'год'}
            </div>
            <div style={{ opacity: 0.65, fontSize: 11.5, marginTop: 2 }}>
              Карта клуба: № {1000 + ((state.user?.id ?? 4719) % 9000)}
            </div>
          </div>
          <Logo size={40} />
        </div>
        {!club.paused ? (
          <div style={{ marginTop: 10, fontSize: 12.5, opacity: 0.85 }}>
            Следующее списание {club.plan === 'month' ? '199' : '1590'} ₽ — {fmtDate(club.until)}
          </div>
        ) : null}
      </div>

      <div className="section">
        <div className="count-grid">
          <div className="count-tile">
            <b>{fmtMoney(club.savedMoney)}</b>
            <span>сэкономлено</span>
          </div>
          <div className="count-tile">
            <b>{fmtMoney(state.bonusBalance)}</b>
            <span>бонусов</span>
          </div>
          <div className="count-tile">
            <b>{limited.length}</b>
            <span>закрытых дропа</span>
          </div>
        </div>
      </div>

      <div className="section">
        <SectionTitle>Колесо фортуны</SectionTitle>
        <div className="card">
          <WheelOfFortune />
        </div>
      </div>

      <div className="section">
        <SectionTitle>Закрытая витрина · лимитированные вкусы</SectionTitle>
        <div className="p-grid">
          {limited.map(p => (
            <ProductCard key={p.id} product={p} onOpen={() => router.go('product', { id: p.id })} />
          ))}
        </div>
      </div>

      <div className="section">
        <SectionTitle>Управление подпиской</SectionTitle>
        <div className="card" style={{ padding: '4px 14px' }}>
          <button
            className="settings-row"
            onClick={() => {
              dispatch({ type: 'PAUSE_CLUB', paused: !club.paused });
              toast(club.paused ? 'Подписка возобновлена' : 'Подписка на паузе — списаний нет');
            }}
          >
            <Icon name="clock" size={18} />
            <span className="grow">{club.paused ? 'Возобновить подписку' : 'Поставить на паузу'}</span>
            <Icon name="arrow" size={16} />
          </button>
          <button className="settings-row" onClick={() => setManage(true)}>
            <Icon name="close" size={18} />
            <span className="grow">Отменить подписку</span>
            <Icon name="arrow" size={16} />
          </button>
        </div>
        <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>
          Кэшбэк и бесплатные доставки работают, пока подписка активна.{' '}
          {plural(limited.length, 'Дроп', 'Дропа', 'Дропов')} уже ждут в витрине.
        </div>
      </div>

      <Sheet open={manage} title="Отменить подписку?" onClose={() => setManage(false)}>
        <div className="muted" style={{ fontSize: 13.5, lineHeight: 1.5 }}>
          Вы потеряете бесплатную доставку, кэшбэк 10% и доступ к закрытым дропам. Подписка останется активной до{' '}
          {fmtDate(club.until)}.
        </div>
        <div className="sheet__btns">
          <button className="btn btn--ghost" onClick={() => setManage(false)}>
            Остаться
          </button>
          <button
            className="btn"
            onClick={() => {
              dispatch({ type: 'CANCEL_CLUB' });
              setManage(false);
              toast('Подписка отменена. Возвращайтесь!');
            }}
          >
            Отменить
          </button>
        </div>
      </Sheet>
    </div>
  );
}
