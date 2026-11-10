import { useMemo } from 'react';

export function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 44 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        dur: 1 + Math.random() * 0.9,
        size: 6 + Math.random() * 8,
        color: ['#FF6A00', '#FFA53D', '#FFC728', '#FFFFFF'][i % 4],
        round: i % 5 === 0,
      })),
    [],
  );
  return (
    <div className="confetti">
      {pieces.map(p => (
        <span
          key={p.id}
          className="confetti__p"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            width: p.size,
            height: p.round ? p.size : Math.round(p.size * 0.5),
            background: p.color,
            borderRadius: p.round ? '50%' : 2,
          }}
        />
      ))}
    </div>
  );
}
