import { createContext, useContext, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { RouterProvider, useRouter } from './context/RouterContext';
import type { TabId } from './context/RouterContext';
import { ToastProvider } from './context/ToastContext';
import { vkInit } from './bridge/vkApi';
import { Logo } from './components/Logo';
import { TabBar } from './components/TabBar';
import { StackScreen } from './components/StackScreen';
import { Empty } from './components/ui';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { HomeScreen } from './screens/HomeScreen';
import { CatalogScreen } from './screens/CatalogScreen';
import { ClubScreen } from './screens/ClubScreen';
import { CartScreen } from './screens/CartScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { ProductScreen } from './screens/ProductScreen';
import { CheckoutScreen } from './screens/CheckoutScreen';
import { SuccessScreen } from './screens/SuccessScreen';
import { OrderScreen } from './screens/OrderScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { PromoHubScreen } from './screens/PromoHubScreen';
import { QuizScreen } from './screens/QuizScreen';
import { AuthScreen } from './screens/AuthScreen';
import { AdminScreen } from './screens/AdminScreen';

const FlyContext = createContext<(x: number, y: number, color: string) => void>(() => {});

export function useFly() {
  return useContext(FlyContext);
}

function FlyProvider({ children }: { children: ReactNode }) {
  const timer = useRef<number | null>(null);

  const fly = (x: number, y: number, color: string) => {
    const target = document.querySelector<HTMLElement>('.cart-target');
    if (!target) return;
    const r = target.getBoundingClientRect();
    const el = document.createElement('div');
    el.className = 'fly-ghost';
    el.style.background = color;
    el.style.transform = `translate(${x - 13}px, ${y - 19}px)`;
    document.body.appendChild(el);
    requestAnimationFrame(() => {
      el.style.transform = `translate(${r.left + r.width / 2 - 8}px, ${r.top + r.height / 2 - 11}px) scale(0.25)`;
      el.style.opacity = '0.2';
    });
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      el.remove();
      const t = document.querySelector<HTMLElement>('.cart-target');
      if (t) {
        t.classList.remove('bump');
        void t.offsetWidth;
        t.classList.add('bump');
        window.setTimeout(() => t.classList.remove('bump'), 340);
      }
    }, 500);
  };

  return <FlyContext.Provider value={fly}>{children}</FlyContext.Provider>;
}

function TabScreen({ tab }: { tab: TabId }) {
  return (
    <>
      {tab === 'home' && <HomeScreen />}
      {tab === 'catalog' && <CatalogScreen />}
      {tab === 'club' && <ClubScreen />}
      {tab === 'cart' && <CartScreen />}
      {tab === 'profile' && <ProfileScreen />}
      <TabBar />
    </>
  );
}

function Shell() {
  const { state } = useStore();
  const { stack, tab, replace, reset } = useRouter();

  useEffect(() => {
    vkInit();
  }, []);

  const top = stack[stack.length - 1];

  useEffect(() => {
    if (!state.initialized) return;
    if (!state.onboarded && top.name !== 'onboarding') replace('onboarding');
    if (state.onboarded && top.name === 'onboarding') reset();
  }, [state.initialized, state.onboarded, top.name, replace, reset]);

  if (!state.initialized) {
    return (
      <div className="app">
        <div className="splash">
          <Logo size={72} />
          <div className="splash__t">ZeSt</div>
        </div>
      </div>
    );
  }

  let content: ReactNode;
  if (top.name === 'onboarding') content = <OnboardingScreen />;
  else if (top.name === 'tabs') content = <TabScreen tab={tab} />;
  else if (top.name === 'product') content = <ProductScreen id={String(top.params?.id ?? '')} />;
  else if (top.name === 'checkout') content = <CheckoutScreen params={top.params} />;
  else if (top.name === 'success') content = <SuccessScreen id={Number(top.params?.id ?? 0)} />;
  else if (top.name === 'order') content = <OrderScreen id={String(top.params?.id ?? '')} />;
  else if (top.name === 'promos') content = <PromoHubScreen />;
  else if (top.name === 'quiz') content = <QuizScreen />;
  else if (top.name === 'notifications') content = <NotificationsScreen />;
  else if (top.name === 'auth') content = <AuthScreen />;
  else if (top.name === 'admin') content = <AdminScreen />;
  else
    content = (
      <StackScreen title="Ошибка">
        <Empty icon="search" title="Экран не найден" text="Что-то пошло не так" />
      </StackScreen>
    );

  return <div className="app">{content}</div>;
}

export default function App() {
  return (
    <ToastProvider>
      <StoreProvider>
        <RouterProvider>
          <FlyProvider>
            <Shell />
          </FlyProvider>
        </RouterProvider>
      </StoreProvider>
    </ToastProvider>
  );
}
