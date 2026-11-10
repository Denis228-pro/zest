import { useId } from 'react';
import type { Product } from '../data/products';

export function CanVisual({ product, size = 100, className }: { product: Product; size?: number; className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const h = Math.round(size * 1.58);
  const subColor = product.can.label === '#FFFFFF' ? '#141419' : '#FFFFFF';
  return (
    <svg width={size} height={h} viewBox="0 0 120 190" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`can-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000000" stopOpacity="0.28" />
          <stop offset="0.12" stopColor={product.can.body} />
          <stop offset="0.5" stopColor={product.can.body} />
          <stop offset="0.88" stopColor={product.can.body} />
          <stop offset="1" stopColor="#000000" stopOpacity="0.32" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="183" rx="33" ry="5" fill="#000000" opacity="0.12" />
      <rect x="27" y="17" width="66" height="164" rx="11" fill={`url(#can-${uid})`} />
      <rect x="33" y="26" width="7" height="146" rx="3.5" fill="#FFFFFF" opacity="0.25" />
      <ellipse cx="60" cy="17.5" rx="33" ry="7" fill="#E9E9EE" />
      <ellipse cx="60" cy="17.5" rx="25" ry="4.6" fill="#C7C7CF" />
      <rect x="47" y="14.5" width="13" height="4" rx="2" fill="#A6A6AF" />
      <rect x="27" y="64" width="66" height="62" fill={product.can.label} />
      <text x="60" y="99" textAnchor="middle" fontFamily="'Unbounded', sans-serif" fontWeight="900" fontSize="30" fill={product.can.accent}>
        {product.can.big ?? 'Z'}
      </text>
      <text x="60" y="117" textAnchor="middle" fontFamily="'Unbounded', sans-serif" fontWeight="700" fontSize="10" letterSpacing="1.5" fill={subColor}>
        {product.can.small ?? 'ZeSt'}
      </text>
      <text x="60" y="150" textAnchor="middle" fontFamily="'Golos Text', sans-serif" fontWeight="700" fontSize="9" letterSpacing="1.5" fill="#FFFFFF" opacity="0.92">
        {product.flavors[0].toUpperCase()}
      </text>
      <text x="60" y="170" textAnchor="middle" fontFamily="'Golos Text', sans-serif" fontWeight="600" fontSize="9" fill="#FFFFFF" opacity="0.7">
        {String(product.volume).replace('.', ',')} Л
      </text>
    </svg>
  );
}
