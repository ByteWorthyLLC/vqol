import { describe, expect, it } from 'vitest';
import {
  DEFAULT_LAUNCH_KIT_SETTINGS,
  buildLaunchUrl,
  launchArtifacts,
  launchBrief,
  launchReadinessScore,
  normalizeBaseUrl,
} from './launchKit';

describe('launchKit', () => {
  it('normalizes base URLs for hash routes', () => {
    expect(normalizeBaseUrl('https://example.com/vqol#/studio')).toBe(
      'https://example.com/vqol/'
    );
    expect(normalizeBaseUrl('https://example.com/vqol/index.html?x=1#/proof')).toBe(
      'https://example.com/vqol/'
    );
  });

  it('builds tracked static hash route links', () => {
    expect(buildLaunchUrl(DEFAULT_LAUNCH_KIT_SETTINGS, 'demo', 'demo')).toBe(
      'https://byteworthyllc.github.io/vqol/?utm_source=vqol-launch-kit&utm_medium=demo&utm_campaign=curiosity-launch#/results?demo=1'
    );
  });

  it('generates share artifacts tied to working product routes', () => {
    const artifacts = launchArtifacts(DEFAULT_LAUNCH_KIT_SETTINGS);
    expect(artifacts.map((artifact) => artifact.id)).toEqual([
      'show-hn',
      'clinical-pilot',
      'contributor-challenge',
      'ai-citation',
      'remix-loop',
    ]);
    expect(artifacts[0].body).toContain('#/proof');
    expect(artifacts[1].body).toContain('#/studio');
    expect(artifacts[4].body).toContain('#/forge');
  });

  it('scores and exports a concise launch brief', () => {
    expect(launchReadinessScore(DEFAULT_LAUNCH_KIT_SETTINGS)).toBeGreaterThanOrEqual(90);
    const brief = launchBrief(DEFAULT_LAUNCH_KIT_SETTINGS);
    expect(brief).toContain('Viral Functionality Kit');
    expect(brief).toContain('AI citation block');
    expect(brief).toContain('no analytics');
  });
});
