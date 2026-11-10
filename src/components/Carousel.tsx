import { useEffect, useRef, useState } from 'react';

export interface BannerItem {
  id: string;
  kicker: string;
  title: string;
  text: string;
  cta: string;
  cls: string;
  onAction: () => void;
}

export function Carousel({ items }: { items: BannerItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const timer = useRef<number | null>(null);

  const restart = () => {
    if (timer.current) window.clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      const el = ref.current;
      if (!el) return;
      const next = (Math.round(el.scrollLeft / el.clientWidth) + 1) % items.length;
      el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
    }, 4200);
  };

  useEffect(() => {
    restart();
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, []);

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    setIdx(Math.min(items.length - 1, Math.round(el.scrollLeft / el.clientWidth)));
  };

  return (
    <div>
      <div className="carousel" ref={ref} onScroll={onScroll} onTouchStart={restart}>
        {items.map(b => (
          <div key={b.id} className={`banner ${b.cls}`}>
            <div className="banner__kicker">{b.kicker}</div>
            <div className="banner__title">{b.title}</div>
            <div className="banner__text">{b.text}</div>
            <button className="banner__cta" onClick={b.onAction}>
              {b.cta}
            </button>
          </div>
        ))}
      </div>
      <div className="dots">
        {items.map((b, i) => (
          <span key={b.id} className={`dot ${i === idx ? 'dot--on' : ''}`} />
        ))}
      </div>
    </div>
  );
}
