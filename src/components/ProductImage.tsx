import { useState } from 'react';
import type { Product } from '../data/products';
import { CanVisual } from './CanVisual';

export function ProductImage({
  product,
  className,
  canSize = 86,
}: {
  product: Product;
  className?: string;
  canSize?: number;
}) {
  const [broken, setBroken] = useState(false);

  if (product.photo && !broken) {
    return (
      <img
        src={product.photo}
        alt={product.name}
        className={className}
        loading="lazy"
        onError={() => setBroken(true)}
      />
    );
  }
  return <CanVisual product={product} size={canSize} className={className} />;
}
