import { useEffect, useMemo, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useRouter } from '../context/RouterContext';
import type { Product } from '../data/products';
import { Chip, Empty, SectionTitle, Sheet } from '../components/ui';
import { Icon } from '../components/icons';
import { ProductCard } from '../components/ProductCard';

const CAT_CHIPS: { id: string; name: string }[] = [
  { id: 'all', name: 'Все' },
  { id: 'energy', name: 'Энергетики' },
  { id: 'water', name: 'Вода' },
  { id: 'lemonade', name: 'Лимонады' },
  { id: 'tonic', name: 'Тоники' },
];

const TASTES = ['цитрус', 'ягоды', 'тропик', 'груша', 'мята', 'кофе', 'без вкуса'];
const VOLUMES = [0.25, 0.45, 0.5, 1];
const BRANDS = ['Adrenaline', 'Gorilla', 'KADO'];
const CAF: { id: 'any' | 'none' | 'low' | 'mid' | 'high'; name: string }[] = [
  { id: 'any', name: 'Любой' },
  { id: 'none', name: 'Без кофеина' },
  { id: 'low', name: 'До 30 мг' },
  { id: 'mid', name: '30–39 мг' },
  { id: 'high', name: '40+ мг' },
];
const SORTS: { id: 'pop' | 'price_asc' | 'price_desc'; name: string }[] = [
  { id: 'pop', name: 'Популярные' },
  { id: 'price_asc', name: 'Сначала дешевле' },
  { id: 'price_desc', name: 'Сначала дороже' },
];

export function CatalogScreen() {
  const { state, dispatch, isClub, products } = useStore();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('all');
  const [badge, setBadge] = useState<'NEW' | 'HIT' | null>(null);
  const [sort, setSort] = useState<'pop' | 'price_asc' | 'price_desc'>('pop');
  const [tastes, setTastes] = useState<string[]>([]);
  const [volumes, setVolumes] = useState<number[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [caf, setCaf] = useState<'any' | 'none' | 'low' | 'mid' | 'high'>('any');
  const [favOnly, setFavOnly] = useState(false);
  const [onlyLimited, setOnlyLimited] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const preset = state.catalogPreset;
  useEffect(() => {
    if (!preset) return;
    if (preset.category) setCat(preset.category);
    if (preset.badge) setBadge(preset.badge);
    if (preset.limited) setOnlyLimited(true);
    dispatch({ type: 'SET_PRESET', preset: null });
  }, [preset, dispatch]);

  function toggle<T>(arr: T[], v: T): T[] {
    return arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];
  }

  const activeCount =
    tastes.length + volumes.length + brands.length + (caf !== 'any' ? 1 : 0) + (favOnly ? 1 : 0) + (onlyLimited ? 1 : 0);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const res = products
      .filter(p => cat === 'all' || p.category === cat)
      .filter(p => !badge || p.badge === badge)
      .filter(p => !favOnly || state.favorites.includes(p.id))
      .filter(p => !onlyLimited || p.limited)
      .filter(p => !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
      .filter(p => tastes.length === 0 || p.flavors.some(f => tastes.includes(f)))
      .filter(p => volumes.length === 0 || volumes.includes(p.volume))
      .filter(p => brands.length === 0 || brands.includes(p.brand))
      .filter(p => {
        if (caf === 'any') return true;
        if (caf === 'none') return p.caffeine === 0;
        if (caf === 'low') return p.caffeine > 0 && p.caffeine < 30;
        if (caf === 'mid') return p.caffeine >= 30 && p.caffeine <= 39;
        return p.caffeine >= 40;
      });
    if (sort === 'price_asc') res.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') res.sort((a, b) => b.price - a.price);
    else res.sort((a, b) => b.rating - a.rating);
    return res;
  }, [products, state.favorites, query, cat, badge, sort, tastes, volumes, brands, caf, favOnly, onlyLimited]);

  const open = (p: Product) => {
    if (p.limited && !isClub) router.setTab('club');
    else router.go('product', { id: p.id });
  };

  return (
    <div className="screen">
      <div className="search-row">
        <Icon name="search" size={17} />
        <input className="input" placeholder="Найти вкус..." value={query} onChange={e => setQuery(e.target.value)} />
      </div>

      <div className="chips-row" style={{ marginTop: 10 }}>
        {CAT_CHIPS.map(c => (
          <Chip
            key={c.id}
            active={cat === c.id}
            small
            onClick={() => {
              setCat(c.id);
              setBadge(null);
            }}
          >
            {c.name}
          </Chip>
        ))}
      </div>

      <div className="chips-row" style={{ marginTop: 8 }}>
        <button className={`chip chip--sm ${activeCount > 0 ? 'chip--on' : ''}`} onClick={() => setFiltersOpen(true)}>
          <Icon name="filter" size={14} /> Фильтры{activeCount > 0 ? ` · ${activeCount}` : ''}
        </button>
        <button className={`chip chip--sm ${favOnly ? 'chip--on' : ''}`} onClick={() => setFavOnly(v => !v)}>
          <Icon name="heart" size={14} filled={favOnly} /> Любимое
        </button>
        {SORTS.map(s => (
          <Chip key={s.id} active={sort === s.id} small onClick={() => setSort(s.id)}>
            {s.name}
          </Chip>
        ))}
        {onlyLimited ? (
          <button className="chip chip--sm chip--on" onClick={() => setOnlyLimited(false)}>
            Дропы <Icon name="close" size={12} />
          </button>
        ) : null}
        {badge ? (
          <button className="chip chip--sm chip--on" onClick={() => setBadge(null)}>
            {badge === 'NEW' ? 'Новинки' : 'Хиты'} <Icon name="close" size={12} />
          </button>
        ) : null}
      </div>

      <div className="section">
        <SectionTitle>Найдено: {list.length}</SectionTitle>
        {list.length === 0 ? (
          <Empty icon="search" title="Ничего не нашли" text="Попробуйте изменить фильтры или поискать другой вкус" />
        ) : (
          <div className="p-grid">
            {list.map(p => (
              <ProductCard key={p.id} product={p} onOpen={() => open(p)} />
            ))}
          </div>
        )}
      </div>

      <Sheet open={filtersOpen} title="Фильтры" onClose={() => setFiltersOpen(false)}>
        <div className="f-group">
          <div className="f-group__t">Вкус</div>
          <div className="f-chips">
            {TASTES.map(t => (
              <Chip key={t} small active={tastes.includes(t)} onClick={() => setTastes(a => toggle(a, t))}>
                {t}
              </Chip>
            ))}
          </div>
        </div>
        <div className="f-group">
          <div className="f-group__t">Объём</div>
          <div className="f-chips">
            {VOLUMES.map(v => (
              <Chip key={v} small active={volumes.includes(v)} onClick={() => setVolumes(a => toggle(a, v))}>
                {v} л
              </Chip>
            ))}
          </div>
        </div>
        <div className="f-group">
          <div className="f-group__t">Бренд</div>
          <div className="f-chips">
            {BRANDS.map(b => (
              <Chip key={b} small active={brands.includes(b)} onClick={() => setBrands(a => toggle(a, b))}>
                {b}
              </Chip>
            ))}
          </div>
        </div>
        <div className="f-group">
          <div className="f-group__t">Кофеин на 100 мл</div>
          <div className="f-chips">
            {CAF.map(c => (
              <Chip key={c.id} small active={caf === c.id} onClick={() => setCaf(c.id)}>
                {c.name}
              </Chip>
            ))}
          </div>
        </div>
        <div className="sheet__btns">
          <button
            className="btn btn--ghost"
            onClick={() => {
              setTastes([]);
              setVolumes([]);
              setBrands([]);
              setCaf('any');
            }}
          >
            Сбросить
          </button>
          <button className="btn" onClick={() => setFiltersOpen(false)}>
            Показать {list.length}
          </button>
        </div>
      </Sheet>
    </div>
  );
}
