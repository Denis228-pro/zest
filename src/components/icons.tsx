import type { ReactElement } from 'react';

export type IconName =
  | 'home'
  | 'grid'
  | 'bolt'
  | 'cart'
  | 'user'
  | 'search'
  | 'filter'
  | 'back'
  | 'share'
  | 'star'
  | 'plus'
  | 'minus'
  | 'trash'
  | 'pin'
  | 'clock'
  | 'card'
  | 'gift'
  | 'lock'
  | 'fire'
  | 'trophy'
  | 'check'
  | 'close'
  | 'moon'
  | 'sun'
  | 'drop'
  | 'citrus'
  | 'coffee'
  | 'repeat'
  | 'sparkle'
  | 'arrow'
  | 'bell'
  | 'phone'
  | 'geo'
  | 'heart'
  | 'percent';

const PATHS: Record<IconName, ReactElement> = {
  home: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9.5V21h13V9.5" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </>
  ),
  bolt: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />,
  cart: (
    <>
      <path d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6" />
      <circle cx="10" cy="20" r="1.4" />
      <circle cx="17" cy="20" r="1.4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  filter: (
    <>
      <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
      <circle cx="15" cy="7" r="2" />
      <circle cx="9" cy="17" r="2" />
    </>
  ),
  back: <path d="M15 5l-7 7 7 7" />,
  share: (
    <>
      <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
      <path d="M12 3v12M8 7l4-4 4 4" />
    </>
  ),
  star: <path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.4L12 17.3l-5.8 3 1.1-6.4L2.6 9.3l6.5-.9L12 2.5z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  trash: <path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6" />,
  pin: (
    <>
      <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  card: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="3" />
      <path d="M2 10h20" />
    </>
  ),
  gift: (
    <>
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M5 12v8h14v-8M12 8v12" />
      <path d="M12 8c-4 0-5-2-5-3.5C7 3 8.5 2 10 2c2 0 2 3 2 6 0-3 0-6 2-6 1.5 0 3 1 3 2.5C17 6 16 8 12 8z" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ),
  fire: <path d="M12 22c-4.4 0-7.5-2.8-7.5-6.7 0-3.6 2.6-5.5 4-9.3 2.2 1.6 2.6 3.9 2.4 5.5 1.3-.4 2.3-1.6 2.6-3.5 2.7 1.7 4 4.2 4 7.3 0 3.9-3.1 6.7-7.5 6.7z" />,
  trophy: (
    <>
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4z" />
      <path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9 20h6M12 14v6" />
    </>
  ),
  check: <path d="M4 12.5 10 18 20 6" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  moon: <path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  drop: <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />,
  citrus: (
    <>
      <circle cx="12" cy="13" r="6.5" />
      <path d="M12 6.5c.5-2.5 2.5-3.5 5-3" />
    </>
  ),
  coffee: (
    <>
      <path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8z" />
      <path d="M17 9h2a2.5 2.5 0 0 1 0 5h-2M7 4v2M11 3v3" />
    </>
  ),
  repeat: <path d="M17 2.5l3.5 3.5L17 9.5M20.5 6H8a4.5 4.5 0 0 0-4.5 4.5V12M7 21.5 3.5 18 7 14.5M3.5 18H16a4.5 4.5 0 0 0 4.5-4.5V12" />,
  sparkle: <path d="M12 3l1.9 5.6 5.6 1.9-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9L12 3z" />,
  arrow: <path d="M4 12h15M13 6l6 6-6 6" />,
  bell: <path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6M10.3 19a2 2 0 0 0 3.4 0" />,
  phone: <path d="M5 4h3l2 5-2 1a12 12 0 0 0 6 6l1-2 5 2v3a2 2 0 0 1-2 2A17 17 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  geo: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </>
  ),
  heart: (
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  ),
  percent: (
    <>
      <path d="M5 19 19 5" />
      <circle cx="7.5" cy="7.5" r="2.4" />
      <circle cx="16.5" cy="16.5" r="2.4" />
    </>
  ),
};

export function Icon({ name, size = 22, filled }: { name: IconName; size?: number; filled?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
