import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';

type Push = (msg: string) => void;

const ToastContext = createContext<Push>(() => {});

let seq = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<{ id: number; msg: string }[]>([]);
  const push = useCallback<Push>(msg => {
    const id = ++seq;
    setItems(prev => [...prev, { id, msg }]);
    window.setTimeout(() => setItems(prev => prev.filter(t => t.id !== id)), 2800);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="toast-wrap">
        {items.map(t => (
          <div key={t.id} className="toast">
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): Push {
  return useContext(ToastContext);
}
