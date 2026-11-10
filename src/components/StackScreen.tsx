import type { ReactNode } from 'react';
import { useRouter } from '../context/RouterContext';
import { Icon } from './icons';

export function StackScreen({ title, children }: { title: string; children: ReactNode }) {
  const { back } = useRouter();
  return (
    <div className="screen screen--stack">
      <div className="stack-header">
        <button className="icon-btn" onClick={back} aria-label="Назад">
          <Icon name="back" size={20} />
        </button>
        <div className="stack-header__title">{title}</div>
      </div>
      {children}
    </div>
  );
}
