import { useMemo, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Confetti } from './Confetti';
import { Button } from './ui';
import { taptic } from '../bridge/vkApi';

const PRIZES = [50, 20, 100, 30, 80, 40, 150, 60];
const SEG = 360 / PRIZES.length;
const COOLDOWN = 7 * 86400000;

function polar(r: number, deg: number): [number, number] {
  const rad = (deg * Math.PI) / 180;
  return [100 + r * Math.cos(rad), 100 + r * Math.sin(rad)];
}

export function WheelOfFortune() {
  const { state, dispatch } = useStore();
  const [rot, setRot] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [won, setWon] = useState<number | null>(null);
  const left = state.lastSpin + COOLDOWN - Date.now();
  const canSpin = !spinning && left <= 0;
  const days = Math.max(1, Math.ceil(left / 86400000));

  const segments = useMemo(
    () =>
      PRIZES.map((prize, i) => {
        const a0 = -90 + i * SEG;
        const a1 = a0 + SEG;
        const mid = a0 + SEG / 2;
        const [x0, y0] = polar(94, a0);
        const [x1, y1] = polar(94, a1);
        const big = prize >= 100;
        return { prize, a0, x0, y0, x1, y1, mid, big };
      }),
    [],
  );

  const spin = () => {
    if (!canSpin) return;
    const idx = Math.floor(Math.random() * PRIZES.length);
    const base = Math.ceil(rot / 360) * 360;
    const target = base + 360 * 6 + (360 - (idx * SEG + SEG / 2));
    setRot(target);
    setSpinning(true);
    setWon(null);
    taptic('medium');
    window.setTimeout(() => {
      const prize = PRIZES[idx];
      dispatch({ type: 'SPIN_WHEEL', prize });
      setWon(prize);
      setSpinning(false);
      taptic('success');
    }, 4500);
  };

  return (
    <div className="wheel">
      <svg className="wheel-svg" viewBox="0 0 200 200" style={{ transform: `rotate(${rot}deg)` }}>
        {segments.map(s => (
          <g key={s.prize}>
            <path
              d={`M100 100 L ${s.x0} ${s.y0} A 94 94 0 0 1 ${s.x1} ${s.y1} Z`}
              fill={s.big ? '#FFC728' : '#7C2AE8'}
              stroke="#0D0A14"
              strokeWidth="1.5"
            />
            <text
              x="100"
              y="42"
              textAnchor="middle"
              fontFamily="'Unbounded', sans-serif"
              fontWeight="700"
              fontSize="11"
              fill={s.big ? '#141419' : '#FFFFFF'}
              transform={`rotate(${s.mid} 100 100)`}
            >
              +{s.prize}
            </text>
          </g>
        ))}
        <circle cx="100" cy="100" r="16" fill="#0D0A14" stroke="#FFD84D" strokeWidth="2" />
        <polygon points="100,16 90,1 110,1" fill="#FFD84D" />
      </svg>

      {won !== null && !spinning ? (
        <>
          <Confetti />
          <div className="ok" style={{ fontWeight: 800, fontSize: 15 }}>
            +{won} бонусов зачислено!
          </div>
        </>
      ) : null}

      {canSpin ? (
        <Button variant="club" block onClick={spin}>
          Крутить колесо
        </Button>
      ) : (
        <div className="wheel-note">
          {spinning ? 'Крутим...' : `Следующее вращение — через ${days} дн`}
        </div>
      )}
      <div className="wheel-note">Бесплатное вращение раз в неделю для участников ZeSt Club</div>
    </div>
  );
}
