import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export type TabId = 'home' | 'catalog' | 'club' | 'cart' | 'profile';

export interface Route {
  name: string;
  params?: Record<string, any>;
}

interface RouterValue {
  stack: Route[];
  tab: TabId;
  go: (name: string, params?: Record<string, any>) => void;
  back: () => void;
  replace: (name: string, params?: Record<string, any>) => void;
  reset: (name?: string) => void;
  setTab: (tab: TabId) => void;
}

const RouterContext = createContext<RouterValue | null>(null);

export function RouterProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<Route[]>([{ name: 'tabs' }]);
  const [tab, setTabState] = useState<TabId>('home');

  const value = useMemo<RouterValue>(
    () => ({
      stack,
      tab,
      go: (name, params) => setStack(s => [...s, { name, params }]),
      back: () => setStack(s => (s.length > 1 ? s.slice(0, -1) : s)),
      replace: (name, params) => setStack(s => [...s.slice(0, -1), { name, params }]),
      reset: (name = 'tabs') => setStack([{ name }]),
      setTab: t => {
        setTabState(t);
        setStack([{ name: 'tabs' }]);
      },
    }),
    [stack, tab],
  );

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter(): RouterValue {
  const v = useContext(RouterContext);
  if (!v) throw new Error('RouterProvider missing');
  return v;
}
