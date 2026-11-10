import bridge from '@vkontakte/vk-bridge';
import { isNative, nativeGeodata, nativeStorageGet, nativeStorageSet, nativeTaptic } from '../platform/native';

export interface VKUser {
  id: number;
  name: string;
  photo: string;
}

const send = bridge.send.bind(bridge) as (method: string, params?: Record<string, unknown>) => Promise<any>;

const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

export const isVKEnv = (): boolean => {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.has('vk_app_id');
};

export async function vkInit(): Promise<void> {
  if (!isVKEnv()) return;
  try {
    await send('VKWebAppInit');
  } catch {}
}

export async function getUser(): Promise<VKUser | null> {
  if (!isVKEnv()) return null;
  try {
    const u = await send('VKWebAppGetUserInfo');
    return { id: u.id, name: `${u.first_name} ${u.last_name}`, photo: u.photo_200 ?? '' };
  } catch {
    return null;
  }
}

export async function getGeodata(): Promise<{ lat: number; long: number } | null> {
  if (isNative()) {
    try {
      return await nativeGeodata();
    } catch {
      return null;
    }
  }
  if (!isVKEnv()) {
    await delay(600);
    return { lat: 55.7558, long: 37.6173 };
  }
  try {
    const g = await send('VKWebAppGetGeodata');
    return { lat: g.lat, long: g.long };
  } catch {
    return null;
  }
}

export async function getPhone(): Promise<string | null> {
  if (!isVKEnv()) {
    await delay(500);
    return '+7 (999) 123-45-67';
  }
  try {
    const r = await send('VKWebAppGetPhoneNumber');
    return r.phone_number ?? null;
  } catch {
    return null;
  }
}

export async function pay(amount: number, description: string): Promise<boolean> {
  if (!isVKEnv()) {
    await delay(1200);
    return true;
  }
  try {
    const appId = Number(new URLSearchParams(window.location.search).get('vk_app_id')) || 0;
    await send('VKWebAppOpenPayForm', {
      app_id: appId,
      action: 'pay-with-vkpay',
      params: { amount, description, currency: 'RUB' },
    });
    return true;
  } catch {
    return false;
  }
}

export async function taptic(kind: 'light' | 'medium' | 'success' = 'light'): Promise<void> {
  if (isNative()) {
    try {
      await nativeTaptic(kind);
    } catch {}
    return;
  }
  if (!isVKEnv()) return;
  try {
    if (kind === 'success') {
      await send('VKWebAppTapticNotificationOccurred', { type: 'success' });
    } else {
      await send('VKWebAppTapticImpactOccurred', { style: kind });
    }
  } catch {}
}

export async function share(): Promise<void> {
  if (!isVKEnv()) {
    await delay(400);
    return;
  }
  try {
    await send('VKWebAppShare', { link: window.location.href });
  } catch {}
}

export async function invite(): Promise<void> {
  if (!isVKEnv()) {
    await delay(500);
    return;
  }
  try {
    await send('VKWebAppShowInviteBox', {});
  } catch {}
}

export async function showStory(): Promise<boolean> {
  if (!isVKEnv()) {
    await delay(700);
    return true;
  }
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
    grad.addColorStop(0, '#7C2AE8');
    grad.addColorStop(1, '#3A0E70');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.font = '900 340px Unbounded, sans-serif';
    ctx.fillText('Z', 540, 800);
    ctx.font = '900 96px Unbounded, sans-serif';
    ctx.fillText('ZeSt CLUB', 540, 1080);
    ctx.font = '600 48px "Golos Text", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillText('Энергия в один тап', 540, 1220);
    const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/jpeg', 0.9));
    if (!blob) return false;
    const url = URL.createObjectURL(blob);
    await send('VKWebAppShowStoryBox', { background_type: 'image', url, action_type: 'open_app' });
    return true;
  } catch {
    return false;
  }
}

export async function allowNotifications(): Promise<boolean> {
  if (!isVKEnv()) {
    await delay(300);
    return true;
  }
  try {
    await send('VKWebAppAllowNotifications');
    return true;
  } catch {
    return false;
  }
}

export async function storageGet(key: string): Promise<string | null> {
  if (isNative()) {
    try {
      const v = await nativeStorageGet(key);
      if (v) return v;
    } catch {}
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  if (isVKEnv()) {
    try {
      const res = await send('VKWebAppStorageGet', { key });
      const v = res?.keys?.[key];
      if (v) return v as string;
    } catch {}
  }
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export async function storageSet(key: string, value: string): Promise<void> {
  try {
    localStorage.setItem(key, value);
  } catch {}
  if (isNative()) {
    try {
      await nativeStorageSet(key, value);
    } catch {}
    return;
  }
  if (isVKEnv() && value.length <= 1900) {
    try {
      await send('VKWebAppStorageSet', { key, value });
    } catch {}
  }
}

export function subscribeTheme(cb: (scheme: string) => void): () => void {
  const handler = (e: any) => {
    const scheme = e?.detail?.data?.scheme;
    if (typeof scheme === 'string') cb(scheme);
  };
  try {
    bridge.subscribe(handler);
  } catch {}
  return () => {
    try {
      bridge.unsubscribe(handler);
    } catch {}
  };
}
