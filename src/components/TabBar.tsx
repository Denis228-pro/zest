import { useRouter } from '../context/RouterContext';
import { useStore } from '../context/StoreContext';
import { Icon } from './icons';
import type { IconName } from './icons';
import type { TabId } from '../context/RouterContext';

const TABS: { id: TabId; icon: IconName; label: string }[] = [
  { id: 'home', icon: 'home', label: 'Главная' },
  { id: 'catalog', icon: 'grid', label: 'Каталог' },
  { id: 'club', icon: 'bolt', label: 'Club' },
  { id: 'cart', icon: 'cart', label: 'Корзина' },
  { id: 'profile', icon: 'user', label: 'Профиль' },
];

export function TabBar() {
  const { tab, setTab } = useRouter();
  const { cartCount } = useStore();
  return (
    <nav className="tabbar">
      {TABS.map(t => (
        <button
          key={t.id}
          className={`tabbar__item ${tab === t.id ? 'tabbar__item--on' : ''}`}
          onClick={() => setTab(t.id)}
        >
          <span className={`tabbar__ico ${t.id === 'cart' ? 'cart-target' : ''}`}>
            <Icon name={t.icon} />
            {t.id === 'cart' && cartCount > 0 ? <span className="cart-badge">{cartCount}</span> : null}
          </span>
          <span className="tabbar__label">{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
