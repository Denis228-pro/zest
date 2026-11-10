import { useState } from 'react';
import type { MouseEvent } from 'react';
import { useStore } from '../context/StoreContext';
import { useRouter } from '../context/RouterContext';
import { useToast } from '../context/ToastContext';
import { useFly } from '../App';
import { effPrice, fmtMoney } from '../utils/format';
import { CanVisual } from '../components/CanVisual';
import { Badge, Button, Stars } from '../components/ui';
import { Icon } from '../components/icons';
import { taptic } from '../bridge/vkApi';

const Q1 = [
  { t: 'Турбо-бодрость', tag: 'energy' },
  { t: 'Свежесть без кофеина', tag: 'soft' },
  { t: 'Кофейный импульс', tag: 'coffee' },
];
const Q2 = [
  { t: 'Цитрус', tag: 'цитрус' },
  { t: 'Ягоды', tag: 'ягоды' },
  { t: 'Тропик', tag: 'тропик' },
  { t: 'Мята', tag: 'мята' },
  { t: 'Кофе', tag: 'кофе' },
];
const Q3 = [
  { t: 'Можно и с сахаром', tag: 'any' },
  { t: 'Минимум сахара', tag: 'low' },
];

export function QuizScreen() {
  const { state, dispatch, isClub, productById } = useStore();
  const router = useRouter();
  const toast = useToast();
  const fly = useFly();
  const [step, setStep] = useState(0);
  const [catTag, setCatTag] = useState('');
  const [tasteTag, setTasteTag] = useState('');
  const [sugarTag, setSugarTag] = useState('');

  const done = step >= 3;
  const product = (() => {
    if (!done) return undefined;
    const cats = catTag === 'energy' ? ['energy'] : catTag === 'coffee' ? ['tonic'] : ['water', 'lemonade', 'tonic'];
    const flavors = tasteTag === 'кофе' ? ['кофе'] : [tasteTag];
    const pool = state.products
      .filter(p => cats.includes(p.category))
      .filter(p => (sugarTag === 'low' ? p.kcal <= 10 : true));
    const scored = pool
      .map(p => ({ p, score: (p.flavors.some(f => flavors.includes(f)) ? 2 : 0) + p.rating / 10 }))
      .sort((a, b) => b.score - a.score);
    return scored[0]?.p ?? pool.sort((a, b) => b.rating - a.rating)[0] ?? state.products[0];
  })();

  const pick = (apply: () => void) => {
    taptic('light');
    apply();
    setStep(s => s + 1);
  };

  const addResult = (e: MouseEvent<HTMLElement>) => {
    if (!product) return;
    fly(e.clientX, e.clientY, product.can.body);
    taptic('light');
    dispatch({ type: 'ADD_TO_CART', productId: product.id, qty: 1 });
    toast(`${product.name} — в корзине!`);
  };

  const restart = () => {
    setStep(0);
    setCatTag('');
    setTasteTag('');
    setSugarTag('');
  };

  return (
    <div className="screen screen--stack quiz">
      <div className="onb__kicker">ПОДБЕРИ ЗАРЯД</div>
      <h1 className="pd__name" style={{ marginTop: 6 }}>
        {done ? 'Твой заряд найден' : '20 секунд — и мы найдём банку под тебя'}
      </h1>

      {!done ? (
        <>
          <div className="quiz-progress">
            {[0, 1, 2].map(i => (
              <span key={i} className={`dot ${i <= step ? 'dot--on' : ''}`} />
            ))}
          </div>
          {step === 0 ? (
            <>
              <div className="qz-q">Какой заряд нужен прямо сейчас?</div>
              {Q1.map(o => (
                <button key={o.tag} className="qz-opt" onClick={() => pick(() => setCatTag(o.tag))}>
                  <Icon name="bolt" size={18} />
                  {o.t}
                </button>
              ))}
            </>
          ) : null}
          {step === 1 ? (
            <>
              <div className="qz-q">Какой вкус ближе?</div>
              {Q2.map(o => (
                <button key={o.tag} className="qz-opt" onClick={() => pick(() => setTasteTag(o.tag))}>
                  <Icon name="sparkle" size={18} />
                  {o.t}
                </button>
              ))}
            </>
          ) : null}
          {step === 2 ? (
            <>
              <div className="qz-q">А сахар как?</div>
              {Q3.map(o => (
                <button key={o.tag} className="qz-opt" onClick={() => pick(() => setSugarTag(o.tag))}>
                  <Icon name={o.tag === 'low' ? 'drop' : 'fire'} size={18} />
                  {o.t}
                </button>
              ))}
            </>
          ) : null}
        </>
      ) : product ? (
        <>
          <div
            className="pd__visual"
            style={{
              background: `radial-gradient(circle at 50% 30%, ${product.can.body}55, transparent 70%)`,
              marginTop: 14,
              height: 210,
            }}
          >
            <CanVisual product={product} size={118} />
            <span className="pd__badges">
              <Badge type="HIT" />
            </span>
          </div>
          <div className="pd__name" style={{ marginTop: 14, fontSize: 18 }}>
            {product.name}
          </div>
          <div className="pd__meta">
            <Stars value={Math.round(product.rating)} />
            <span>{product.rating.toFixed(1)}</span>
            <span>·</span>
            <span>{product.caffeine > 0 ? `кофеин ${product.caffeine} мг/100 мл` : 'без кофеина'}</span>
          </div>
          <div className="pd__price">
            <span className="pd__price-now" style={{ fontSize: 20 }}>
              {fmtMoney(effPrice(product, isClub))}
            </span>
          </div>
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Button block onClick={addResult}>
              В корзину
            </Button>
            <Button variant="ghost" block onClick={restart}>
              Подобрать ещё раз
            </Button>
          </div>
        </>
      ) : null}

      {done ? (
        <div style={{ marginTop: 10 }}>
          <Button variant="ghost" block small onClick={() => router.back()}>
            Закрыть
          </Button>
        </div>
      ) : null}
    </div>
  );
}
