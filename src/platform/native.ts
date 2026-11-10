import { Capacitor } from '@capacitor/core';

export const isNative = (): boolean => Capacitor.isNativePlatform();

export async function nativeTaptic(kind: 'light' | 'medium' | 'success'): Promise<void> {
  const { Haptics, ImpactStyle, NotificationType } = await import('@capacitor/haptics');
  if (kind === 'success') {
    await Haptics.notification({ type: NotificationType.Success });
  } else {
    await Haptics.impact({ style: kind === 'medium' ? ImpactStyle.Medium : ImpactStyle.Light });
  }
}

export async function nativeGeodata(): Promise<{ lat: number; long: number }> {
  const { Geolocation } = await import('@capacitor/geolocation');
  const pos = await Geolocation.getCurrentPosition({ timeout: 8000 });
  return { lat: pos.coords.latitude, long: pos.coords.longitude };
}

export async function nativeStorageGet(key: string): Promise<string | null> {
  const { Preferences } = await import('@capacitor/preferences');
  const res = await Preferences.get({ key });
  return res.value ?? null;
}

export async function nativeStorageSet(key: string, value: string): Promise<void> {
  const { Preferences } = await import('@capacitor/preferences');
  await Preferences.set({ key, value });
}
