import { useEffect, useState } from 'react';

let deferredPrompt: any = null;
const listeners = new Set<() => void>();
let captured = false;

function capture() {
  if (captured || typeof window === 'undefined') return;
  captured = true;
  window.addEventListener('beforeinstallprompt', (e: any) => {
    e.preventDefault();
    deferredPrompt = e;
    listeners.forEach(l => l());
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    listeners.forEach(l => l());
  });
}

capture();

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    false
  );
}

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function useInstall() {
  const [, force] = useState(0);

  useEffect(() => {
    const l = () => force(x => x + 1);
    listeners.add(l);
    const mq = window.matchMedia?.('(display-mode: standalone)');
    const mqHandler = () => force(x => x + 1);
    mq?.addEventListener?.('change', mqHandler);
    return () => {
      listeners.delete(l);
      mq?.removeEventListener?.('change', mqHandler);
    };
  }, []);

  return {
    canInstall: !!deferredPrompt && !isStandalone(),
    isStandalone: isStandalone(),
    isIOS: isIOS(),
    promptInstall: async (): Promise<boolean> => {
      if (!deferredPrompt) return false;
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      deferredPrompt = null;
      listeners.forEach(l => l());
      return choice?.outcome === 'accepted';
    },
  };
}
