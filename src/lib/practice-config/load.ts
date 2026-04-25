import { validatePracticeConfig, formatErrors } from './validate';
import type { PracticeConfig } from './types';

const PRACTICE_CONFIG_URL = './practice.json';

export class PracticeConfigError extends Error {
  override readonly name = 'PracticeConfigError';
}

export async function loadPracticeConfig(): Promise<PracticeConfig> {
  let raw: unknown;
  try {
    const res = await fetch(PRACTICE_CONFIG_URL, { cache: 'no-cache' });
    if (!res.ok) {
      throw new PracticeConfigError(
        `Could not load ${PRACTICE_CONFIG_URL} (HTTP ${res.status})`
      );
    }
    raw = await res.json();
  } catch (err) {
    if (err instanceof PracticeConfigError) throw err;
    throw new PracticeConfigError(
      `Failed to fetch ${PRACTICE_CONFIG_URL}: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  const result = validatePracticeConfig(raw);
  if (!result.ok) {
    throw new PracticeConfigError(
      `practice.json failed validation:\n${formatErrors(result.errors)}`
    );
  }
  return result.config;
}

export function applyBrandingToDocument(config: PracticeConfig): void {
  const root = document.documentElement;
  const b = config.branding;
  root.style.setProperty('--bg', b.backgroundColor);
  root.style.setProperty('--fg', b.foregroundColor);
  root.style.setProperty('--accent', b.primaryColor);
  root.style.setProperty('--accent-fg', b.primaryTextColor);
  document.title = `${config.practiceName} — VEINES-QOL/Sym tracker`;
}
