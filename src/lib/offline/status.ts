export interface OfflineInspectionEnv {
  navigatorLike?: Pick<Navigator, 'onLine' | 'serviceWorker'>;
  cachesLike?: Pick<CacheStorage, 'keys'>;
}

export interface OfflineStatus {
  online: boolean;
  serviceWorkerSupported: boolean;
  serviceWorkerControlled: boolean;
  cacheNames: string[];
}

export async function inspectOfflineStatus(
  env: OfflineInspectionEnv = {}
): Promise<OfflineStatus> {
  const nav = env.navigatorLike ?? globalThis.navigator;
  const cacheStorage = env.cachesLike ?? globalThis.caches;
  const serviceWorker = nav?.serviceWorker;
  const cacheNames =
    cacheStorage && typeof cacheStorage.keys === 'function'
      ? await cacheStorage.keys()
      : [];

  return {
    online: nav?.onLine ?? true,
    serviceWorkerSupported: Boolean(serviceWorker),
    serviceWorkerControlled: Boolean(serviceWorker?.controller),
    cacheNames,
  };
}

export function offlineReadinessScore(status: OfflineStatus): number {
  let score = 0;
  if (status.serviceWorkerSupported) score += 40;
  if (status.cacheNames.length > 0) score += 40;
  if (status.serviceWorkerControlled) score += 20;
  return score;
}
