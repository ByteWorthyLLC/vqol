import { describe, expect, it } from 'vitest';
import { inspectOfflineStatus, offlineReadinessScore } from './status';

describe('offline status', () => {
  it('detects service worker and caches from injected env', async () => {
    const status = await inspectOfflineStatus({
      navigatorLike: {
        onLine: false,
        serviceWorker: { controller: {} } as ServiceWorkerContainer,
      },
      cachesLike: {
        keys: async () => ['workbox-precache'],
      },
    });

    expect(status).toEqual({
      online: false,
      serviceWorkerSupported: true,
      serviceWorkerControlled: true,
      cacheNames: ['workbox-precache'],
    });
    expect(offlineReadinessScore(status)).toBe(100);
  });

  it('scores unsupported browsers at zero', async () => {
    const status = await inspectOfflineStatus({
      navigatorLike: { onLine: true } as Navigator,
      cachesLike: { keys: async () => [] },
    });
    expect(offlineReadinessScore(status)).toBe(0);
  });
});
