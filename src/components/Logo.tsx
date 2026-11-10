import { useId } from 'react';

export function Logo({ size = 40 }: { size?: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="ZeSt">
      <defs>
        <radialGradient id={`zest-${uid}`} cx="0.32" cy="0.28" r="0.95">
          <stop offset="0" stopColor="#FFB13D" />
          <stop offset="0.55" stopColor="#FF7A00" />
          <stop offset="1" stopColor="#EF5300" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill={`url(#zest-${uid})`} />
      <g transform="translate(4 0) skewX(-12)">
        <path d="M14 16 H50 L30 39 H50 V48 H14 L34 25 H14 Z" fill="#FFFFFF" />
        <path d="M35 16 H39 L31 25 H27 Z" fill="#E84E00" />
        <path d="M33 39 H37 L29 48 H25 Z" fill="#E84E00" />
      </g>
    </svg>
  );
}
