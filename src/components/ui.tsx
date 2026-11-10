import type { MouseEvent, ReactNode } from 'react';
import { Icon } from './icons';
import type { IconName } from './icons';

export function Button({
  children,
  onClick,
  variant = 'primary',
  block,
  small,
  disabled,
}: {
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'ghost' | 'dark' | 'club';
  block?: boolean;
  small?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      className={`btn btn--${variant} ${block ? 'btn--block' : ''} ${small ? 'btn--sm' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export function Chip({
  active,
  small,
  onClick,
  children,
}: {
  active?: boolean;
  small?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button className={`chip ${active ? 'chip--on' : ''} ${small ? 'chip--sm' : ''}`} onClick={onClick}>
      {children}
    </button>
  );
}

export function Badge({ type }: { type: 'NEW' | 'HIT' | 'LIMITED' | 'CLUB' }) {
  const label = type === 'NEW' ? 'NEW' : type === 'HIT' ? 'ХИТ' : type === 'LIMITED' ? 'ЛИМИТ' : 'CLUB';
  return <span className={`badge badge--${type.toLowerCase()}`}>{label}</span>;
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="section__head">
      <div className="section__title">{children}</div>
      {action}
    </div>
  );
}

export function Sheet({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <>
      <div className="sheet-back" onClick={onClose} />
      <div className="sheet">
        <div className="sheet__grab" />
        {title ? <div className="sheet__title">{title}</div> : null}
        {children}
      </div>
    </>
  );
}

export function Stepper({ value, onChange, small }: { value: number; onChange: (v: number) => void; small?: boolean }) {
  return (
    <div className={`stepper ${small ? 'stepper--sm' : ''}`}>
      <button className="stepper__btn" onClick={() => onChange(value - 1)} aria-label="Меньше">
        <Icon name="minus" size={15} />
      </button>
      <span className="stepper__n">{value}</span>
      <button className="stepper__btn" onClick={() => onChange(value + 1)} aria-label="Больше">
        <Icon name="plus" size={15} />
      </button>
    </div>
  );
}

export function Stars({ value, size = 14, onChange }: { value: number; size?: number; onChange?: (v: number) => void }) {
  return (
    <span className="stars">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          className={`stars__s ${i <= value ? 'stars__s--on' : ''}`}
          onClick={() => onChange?.(i)}
          disabled={!onChange}
        >
          <Icon name="star" size={size} filled={i <= value} />
        </button>
      ))}
    </span>
  );
}

export function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button className={`switch ${checked ? 'switch--on' : ''}`} onClick={() => onChange(!checked)} aria-label="Переключатель">
      <span className="switch__dot" />
    </button>
  );
}

export function Empty({
  icon,
  title,
  text,
  action,
}: {
  icon: IconName;
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <span className="empty__ico">
        <Icon name={icon} size={30} />
      </span>
      <div className="empty__t">{title}</div>
      <div className="empty__d">{text}</div>
      {action}
    </div>
  );
}

export function Skeleton({ w, h, r = 16, className }: { w?: number | string; h: number | string; r?: number; className?: string }) {
  return <div className={`skel ${className ?? ''}`} style={{ width: w, height: h, borderRadius: r }} />;
}

export function Spinner() {
  return <div className="spinner" />;
}
