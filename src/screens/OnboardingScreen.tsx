import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { CanVisual } from '../components/CanVisual';
import { Button } from '../components/ui';

const SLIDES = [
  {
    kicker: 'ZeSt',
    title: 'ЭНЕРГИЯ В ОДИН ТАП',
    text: 'Энергетики, вода и лимонады с доставкой за 40 минут. Без очередей и лишних шагов.',
    productId: 'adrenaline-citrus',
  },
  {
    kicker: 'ZeSt Club',
    title: 'КЛУБ БЕЗ ГРАНИЦ',
    text: 'Бесплатная доставка, кэшбэк 10% бонусами и доступ к лимитированным дропам вкусов.',
    productId: 'kado-dream',
  },
  {
    kicker: 'VK Pay',
    title: 'ОПЛАТА В ОДНО КАСАНИЕ',
    text: 'Вход через VK ID и оплата через VK Pay. Ни одной формы — просто выбирай и пей.',
    productId: 'gorilla-classic',
  },
];

export function OnboardingScreen() {
  const { state, dispatch } = useStore();
  const [i, setI] = useState(0);
  const slide = SLIDES[i];
  const product = state.products.find(p => p.id === slide.productId) ?? state.products[0];
  const next = () => {
    if (i < SLIDES.length - 1) setI(i + 1);
    else dispatch({ type: 'ONBOARDED' });
  };
  return (
    <div className="onb">
      <button className="onb__skip" onClick={() => dispatch({ type: 'ONBOARDED' })}>
        Пропустить
      </button>
      <div className="onb__visual">
        <span className="onb__ring" />
        <CanVisual product={product} size={150} className="onb__can" />
      </div>
      <div className="onb__kicker">{slide.kicker}</div>
      <h1 className="onb__t">{slide.title}</h1>
      <p className="onb__d">{slide.text}</p>
      <div className="onb__dots">
        {SLIDES.map((s, j) => (
          <span key={s.kicker} className={`dot ${j === i ? 'dot--on' : ''}`} />
        ))}
      </div>
      <div className="onb__btns">
        <Button block onClick={next}>
          {i < SLIDES.length - 1 ? 'Далее' : 'Поехали'}
        </Button>
      </div>
    </div>
  );
}
