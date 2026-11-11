import { useEffect, useMemo, useState } from 'react';
import { useStore } from '../context/StoreContext';
import type { CatalogPreset } from '../context/StoreContext';
import { STATUS_META } from '../context/StoreContext';
import { CATEGORY_META } from '../data/products';
import { useRouter } from '../context/RouterContext';
import { useToast } from '../context/ToastContext';
import { fmtDate, fmtMoney, plural } from '../utils/format';
import { getGeodata, taptic } from '../bridge/vkApi';
import { Carousel } from '../components/Carousel';
import type { BannerItem } from '../components/Carousel';
import { Logo } from '../components/Logo';
import { Icon } from '../components/icons';
import type { IconName } from '../components/icons';
import { ProductCard } from '../components/ProductCard';
import { SectionTitle, Skeleton } from '../components/ui';
import type { BannerAction } from '../data/banners';

export function HomeScreen() {
  const { state, dispatch, isClub, cartCount, productById, banners, products, unreadNotifications } = useStore();
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [nowTick, setNowTick] = useState(Date.now());

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 600);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const t = window.setInterval(() => setNowTick(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const baseName = state.customName.trim() || state.user?.name || '';
  const firstName = baseName ? baseName.split(' ')[0] : 'друг';
  const hour = new Date().getHours();
  const greeting =
    hour >= 5 && hour < 11 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : hour < 23 ? 'Добрый вечер' : 'Доброй ночи';

  const openCatalog = (preset: CatalogPreset) => {
    dispatch({ type: 'SET_PRESET', preset });
    router.setTab('catalog');
  };

  const bannerAction = (a: BannerAction): (() => void) => () => {
    if (a.type === 'product' && a.id) {
      router.go('product', { id: a.id });
    } else if (a.type === 'catalog') {
      dispatch({ type: 'SET_PRESET', preset: { category: a.category, badge: a.badge } });
      router.setTab('catalog');
    } else if (a.type === 'club') {
      router.setTab('club');
    }
  };

  const repeatOrder = () => {
    const last = state.orders[0];
    if (!last) {
      toast('Заказов пока нет — соберите первый');
      return;
    }
    const lines = last.items.filter(l => productById(l.productId));
    if (!lines.length) {
      toast('Товары из прошлого заказа недоступны');
      return;
    }
    dispatch({ type: 'ADD_LINES', lines });
    taptic('light');
    toast(`Добавили ${lines.reduce((s, l) => s + l.qty, 0)} ${plural(lines.reduce((s, l) => s + l.qty, 0), 'товар', 'товара', 'товаров')} из прошлого заказа`);
    router.setTab('cart');
  };

  const detectCity = async () => {
    toast('Определяем вашу локацию');
    const geo = await getGeodata();
    if (!geo) {
      toast('Не удалось определить локацию');
      return;
    }
    dispatch({ type: 'SET_CITY', city: 'Москва' });
    toast('Зона доставки: Москва');
  };

  const activeOrder = state.orders.find(o => o.status !== 'delivered');
  const newProducts = products.filter(p => p.badge === 'NEW');
  const hits = products.filter(p => p.badge === 'HIT');
  const favProducts = products.filter(p => state.favorites.includes(p.id));
  const hasLimited = products.some(p => p.limited);
  const weekEnd = useMemo(() => {
    const d = new Date();
    const add = (7 - d.getDay()) % 7 || 7;
    const end = new Date(d);
    end.setDate(d.getDate() + add);
    end.setHours(23, 59, 59, 999);
    return end.getTime();
  }, []);
  const rem = Math.max(0, weekEnd - nowTick);
  const dropCountdown = `${Math.floor(rem / 86400000)} д ${String(Math.floor((rem % 86400000) / 3600000)).padStart(2, '0')}:${String(
    Math.floor((rem % 3600000) / 60000),
  ).padStart(2, '0')}:${String(Math.floor((rem % 60000) / 1000)).padStart(2, '0')}`;

  const bannerItems: BannerItem[] = banners.map(b => ({
    id: b.id,
    kicker: b.kicker,
    title: b.title,
    text: b.text,
    cta: b.cta,
    cls: b.cls || 'banner--red',
    onAction: bannerAction(b.action),
  }));

  if (loading) {
    return (
      <div className="screen">
        <div className="h-header">
          <Logo size={38} />
          <div className="h-header__city">
            <Skeleton h={16} w={150} r={8} />
            <Skeleton h={12} w={110} r={6} />
          </div>
          <Skeleton h={42} w={42} r={14} />
        </div>
        <Skeleton h={150} r={24} />
        <div className="section">
          <div className="chips-row">
            <Skeleton h={36} w={150} r={18} />
            <Skeleton h={36} w={100} r={18} />
            <Skeleton h={36} w={100} r={18} />
          </div>
        </div>
        <div className="section">
          <Skeleton h={20} w={140} r={8} />
          <div style={{ height: 10 }} />
          <div className="p-grid">
            <Skeleton h={230} r={20} />
            <Skeleton h={230} r={20} />
            <Skeleton h={230} r={20} />
            <Skeleton h={230} r={20} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="h-header">
        <Logo size={38} />
        <div className="h-header__city">
          <span className="h-header__hello">
            {greeting}, {firstName}
          </span>
          <button className="h-header__geo" onClick={detectCity}>
            <Icon name="geo" size={12} /> {state.city} · доставляем
          </button>
        </div>
        <button className="icon-btn" onClick={() => router.go('notifications')} aria-label="Уведомления">
          <Icon name="bell" />
          {unreadNotifications > 0 ? <span className="cart-badge">{unreadNotifications}</span> : null}
        </button>
        <button className="icon-btn cart-target" onClick={() => router.setTab('cart')}>
          <Icon name="cart" />
          {cartCount > 0 ? <span className="cart-badge">{cartCount}</span> : null}
        </button>
      </div>

      {activeOrder ? (
        <button className="order-pill" onClick={() => router.go('order', { id: String(activeOrder.id) })}>
          <Icon name="bolt" size={15} />
          Заказ #{activeOrder.id} · {STATUS_META[activeOrder.status].title}
          <Icon name="arrow" size={15} />
        </button>
      ) : null}

      <Carousel items={bannerItems} />

      {hasLimited ? (
        <button
          className="drop-strip"
          onClick={() => (isClub ? openCatalog({ limited: true }) : router.setTab('club'))}
        >
          <Icon name="bolt" size={16} />
          <span>Дроп недели закрывается через</span>
          <span className="drop-strip__timer">{dropCountdown}</span>
        </button>
      ) : null}

      <div className="section">
        <div className="chips-row">
          <button className="chip" onClick={repeatOrder}>
            <Icon name="repeat" size={14} /> Повторить заказ
          </button>
          <button className="chip" onClick={() => openCatalog({ badge: 'NEW' })}>
            Новинки
          </button>
          <button className="chip" onClick={() => openCatalog({ badge: 'HIT' })}>
            Хиты
          </button>
          <button className="chip" onClick={() => router.setTab('club')}>
            ZeSt Club
          </button>
          <button className="chip" onClick={() => router.go('promos')}>
            <Icon name="percent" size={14} /> Акции
          </button>
          <button className="chip" onClick={() => router.go('quiz')}>
            <Icon name="sparkle" size={14} /> Подобрать заряд
          </button>
        </div>
      </div>

      <button className={`club-banner ${isClub ? 'club-banner--member' : ''}`} onClick={() => router.setTab('club')}>
        <Logo size={34} />
        <span className="club-banner__txt">
          <span className="club-banner__title">{isClub ? 'Вы в ZeSt Club' : 'ZeSt Club'}</span>
          <span className="club-banner__sub">
            {isClub && state.club
              ? `Бонусы: ${fmtMoney(state.bonusBalance)} · активна до ${fmtDate(state.club.until)}`
              : 'Бесплатная доставка · кэшбэк 10% · закрытые дропы'}
          </span>
        </span>
        <span className="club-banner__cta">{isClub ? 'Открыть' : '199 ₽'}</span>
      </button>

      <div className="section">
        <SectionTitle action={<button className="section__link" onClick={() => openCatalog({})}>Все</button>}>
          Категории
        </SectionTitle>
        <div className="cat-grid">
          {CATEGORY_META.map(c => (
            <button key={c.id} className="cat-tile" onClick={() => openCatalog({ category: c.id })}>
              <span className="cat-tile__ico">
                <Icon name={c.icon} size={20} />
              </span>
              {c.name}
              <span className="cat-tile__n">{products.filter(p => p.category === c.id).length}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <SectionTitle action={<button className="section__link" onClick={() => openCatalog({ badge: 'NEW' })}>Все новинки</button>}>
          Свежий дроп
        </SectionTitle>
        <div className="h-scroll">
          {newProducts.map(p => (
            <ProductCard key={p.id} product={p} onOpen={() => router.go('product', { id: p.id })} />
          ))}
        </div>
      </div>

      {favProducts.length > 0 ? (
        <div className="section">
          <SectionTitle>Любимое</SectionTitle>
          <div className="h-scroll">
            {favProducts.map(p => (
              <ProductCard key={p.id} product={p} onOpen={() => router.go('product', { id: p.id })} />
            ))}
          </div>
        </div>
      ) : null}

      <div className="section">
        <SectionTitle action={<button className="section__link" onClick={() => openCatalog({ badge: 'HIT' })}>Смотреть все</button>}>
          Хиты продаж
        </SectionTitle>
        <div className="h-scroll">
          {hits.map(p => (
            <ProductCard key={p.id} product={p} onOpen={() => router.go('product', { id: p.id })} />
          ))}
        </div>
      </div>
    </div>
  );
}
