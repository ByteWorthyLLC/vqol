export type NotificationStatus =
  | 'unsupported'
  | 'default'
  | 'granted'
  | 'denied';

export function notificationStatus(): NotificationStatus {
  if (typeof Notification === 'undefined') return 'unsupported';
  return Notification.permission as NotificationStatus;
}

export async function requestNotificationPermission(): Promise<NotificationStatus> {
  if (typeof Notification === 'undefined') return 'unsupported';
  const result = await Notification.requestPermission();
  return result as NotificationStatus;
}

export interface FireOpts {
  title: string;
  body: string;
  tag?: string;
}

export async function fireNotification(opts: FireOpts): Promise<boolean> {
  const status = notificationStatus();
  if (status !== 'granted') return false;
  try {
    // Prefer ServiceWorkerRegistration if available (better mobile support)
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.showNotification(opts.title, {
          body: opts.body,
          tag: opts.tag,
        });
        return true;
      }
    }
    // Fallback: direct Notification constructor
    const n = new Notification(opts.title, {
      body: opts.body,
      tag: opts.tag,
    });
    void n;
    return true;
  } catch {
    return false;
  }
}

export function isIosSafariStandalonePending(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isIos = /iPhone|iPad|iPod/.test(ua);
  if (!isIos) return false;
  const isStandalone =
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      // Legacy iOS
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window.navigator as any).standalone === true);
  return !isStandalone;
}
