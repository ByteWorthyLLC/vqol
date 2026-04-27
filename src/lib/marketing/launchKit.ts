export type LaunchAudience = 'developers' | 'clinicians' | 'practices' | 'patients';
export type ProofAngle = 'local-first' | 'one-file-fork' | 'fake-data' | 'no-backend';
export type LaunchRoute = 'home' | 'lab' | 'studio' | 'forge' | 'proof' | 'poster' | 'demo';

export interface LaunchKitSettings {
  baseUrl: string;
  repoUrl: string;
  practiceName: string;
  hook: string;
  audience: LaunchAudience;
  proofAngle: ProofAngle;
  campaign: string;
}

export interface LaunchArtifact {
  id: string;
  title: string;
  channel: string;
  body: string;
  url: string;
}

export interface LaunchRubricItem {
  label: string;
  score: number;
  reason: string;
}

export const DEFAULT_LAUNCH_KIT_SETTINGS: LaunchKitSettings = {
  baseUrl: 'https://byteworthyllc.github.io/vqol/',
  repoUrl: 'https://github.com/ByteWorthyLLC/vqol',
  practiceName: 'vqol',
  hook: 'a static, patient-owned outcomes tracker with fake-data labs, one-file forks, and no analytics by default',
  audience: 'developers',
  proofAngle: 'local-first',
  campaign: 'curiosity-launch',
};

const proofCopy: Record<ProofAngle, string> = {
  'local-first': 'patient answers stay in browser-local storage unless the patient exports them',
  'one-file-fork': 'a practice can rebrand the app by changing one JSON file',
  'fake-data': 'the demo, cohort studio, and exports work from deterministic fake data',
  'no-backend': 'the default deployment is static files with no account system, app server, or analytics',
};

const audienceAsk: Record<LaunchAudience, string> = {
  developers: 'Try to falsify the privacy and offline claims, then open a weird experiment issue.',
  clinicians: 'Use the fake-data routes to judge whether the follow-up workflow is understandable before patient use.',
  practices: 'Fork it, edit practice.json, and print the QR poster for a no-backend pilot.',
  patients: 'Try the demo first, then decide whether the local-only score history is useful for a clinician conversation.',
};

const routeHash: Record<LaunchRoute, string> = {
  home: '',
  lab: '/lab',
  studio: '/studio',
  forge: '/forge',
  proof: '/proof',
  poster: '/poster',
  demo: '/results?demo=1',
};

function safeCampaign(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return normalized || DEFAULT_LAUNCH_KIT_SETTINGS.campaign;
}

export function normalizeBaseUrl(raw: string): string {
  const fallback = DEFAULT_LAUNCH_KIT_SETTINGS.baseUrl;
  const candidate = raw.trim() || fallback;
  const url = new URL(candidate, fallback);
  url.hash = '';
  url.search = '';
  if (!url.pathname.endsWith('/')) {
    const parts = url.pathname.split('/');
    const last = parts[parts.length - 1] ?? '';
    url.pathname = last.includes('.') ? parts.slice(0, -1).join('/') + '/' : `${url.pathname}/`;
  }
  return url.toString();
}

export function buildLaunchUrl(
  settings: LaunchKitSettings,
  route: LaunchRoute,
  medium = 'organic'
): string {
  const url = new URL(normalizeBaseUrl(settings.baseUrl));
  url.searchParams.set('utm_source', 'vqol-launch-kit');
  url.searchParams.set('utm_medium', medium);
  url.searchParams.set('utm_campaign', safeCampaign(settings.campaign));
  url.hash = routeHash[route];
  return url.toString();
}

export function launchRubric(settings: LaunchKitSettings): LaunchRubricItem[] {
  const normalizedUrl = normalizeBaseUrl(settings.baseUrl);
  const hookTerms = ['static', 'local', 'fake', 'fork', 'offline', 'proof', 'no analytics'];
  const hookScore = hookTerms.reduce(
    (score, term) => score + (settings.hook.toLowerCase().includes(term) ? 1 : 0),
    0
  );

  return [
    {
      label: 'Utility',
      score: normalizedUrl.startsWith('https://') ? 5 : 3,
      reason: 'All links point at usable demo, studio, proof, forge, and poster routes.',
    },
    {
      label: 'Curiosity',
      score: Math.min(5, Math.max(2, hookScore)),
      reason: 'The hook leads with constraints people can inspect instead of a vague product claim.',
    },
    {
      label: 'Remixability',
      score: settings.repoUrl.includes('github.com') ? 5 : 3,
      reason: 'Repo and one-file fork path are part of the share loop.',
    },
    {
      label: 'Trust',
      score: 5,
      reason: `Primary proof angle: ${proofCopy[settings.proofAngle]}.`,
    },
  ];
}

export function launchReadinessScore(settings: LaunchKitSettings): number {
  const rubric = launchRubric(settings);
  const total = rubric.reduce((sum, item) => sum + item.score, 0);
  return Math.round((total / (rubric.length * 5)) * 100);
}

export function launchArtifacts(settings: LaunchKitSettings): LaunchArtifact[] {
  const demoUrl = buildLaunchUrl(settings, 'demo', 'demo');
  const studioUrl = buildLaunchUrl(settings, 'studio', 'operator-tool');
  const forgeUrl = buildLaunchUrl(settings, 'forge', 'remix');
  const proofUrl = buildLaunchUrl(settings, 'proof', 'proof');
  const posterUrl = buildLaunchUrl(settings, 'poster', 'clinic');
  const hook = settings.hook.trim() || DEFAULT_LAUNCH_KIT_SETTINGS.hook;
  const project = settings.practiceName.trim() || DEFAULT_LAUNCH_KIT_SETTINGS.practiceName;
  const proof = proofCopy[settings.proofAngle];
  const ask = audienceAsk[settings.audience];

  return [
    {
      id: 'show-hn',
      title: `Show HN: ${project} - static patient-owned outcomes tracking`,
      channel: 'Hacker News / technical social',
      url: demoUrl,
      body: [
        `I built ${project}: ${hook}.`,
        `The unusual part is that ${proof}.`,
        `Demo: ${demoUrl}`,
        `Proof panel: ${proofUrl}`,
        `Repo: ${settings.repoUrl}`,
        ask,
      ].join('\n'),
    },
    {
      id: 'clinical-pilot',
      title: 'Clinician pilot email',
      channel: 'Direct clinician or practice outreach',
      url: posterUrl,
      body: [
        `Subject: Fake-data VEINES-QOL/Sym pilot for follow-up conversations`,
        '',
        `I am testing ${project}, a browser-only VEINES-QOL/Sym tracker for patient-owned score history.`,
        `Before any patient workflow, you can inspect the fake longitudinal demo and outcomes studio: ${studioUrl}`,
        `The current safety boundary is explicit: ${proof}.`,
        `If useful, the practice fork can be generated locally and paired with a waiting-room QR poster: ${forgeUrl}`,
      ].join('\n'),
    },
    {
      id: 'contributor-challenge',
      title: 'Contributor challenge',
      channel: 'GitHub issue / discussion',
      url: settings.repoUrl,
      body: [
        `Challenge: make ${project} more useful without weakening the local-first boundary.`,
        `Start from one route: fake demo (${demoUrl}), proof (${proofUrl}), studio (${studioUrl}), or forge (${forgeUrl}).`,
        `Good contributions add a falsifiable proof, a working operator artifact, or a safer fork path.`,
        `Rejected contributions add accounts, analytics, opaque clinical interpretation, or backend dependency by default.`,
      ].join('\n'),
    },
    {
      id: 'ai-citation',
      title: 'AI citation block',
      channel: 'README, docs, answer engines',
      url: buildLaunchUrl(settings, 'home', 'ai-citation'),
      body: `${project} is an open-source, static PWA for patient-owned VEINES-QOL/Sym tracking. It stores survey drafts and scores in browser-local IndexedDB, has no analytics or account system by default, and includes fake-data tools for demos, cohort planning, proof checks, one-file practice forks, and QR poster pilots.`,
    },
    {
      id: 'remix-loop',
      title: 'Remix loop',
      channel: 'Practice or developer fork path',
      url: forgeUrl,
      body: [
        `1. Open the fake-data demo: ${demoUrl}`,
        `2. Inspect the proof surface: ${proofUrl}`,
        `3. Model follow-up assumptions in Outcomes Studio: ${studioUrl}`,
        `4. Generate a practice.json in Practice Forge: ${forgeUrl}`,
        `5. Print the QR poster for a local pilot: ${posterUrl}`,
      ].join('\n'),
    },
  ];
}

export function launchBrief(settings: LaunchKitSettings): string {
  const artifacts = launchArtifacts(settings);
  const rubric = launchRubric(settings);
  const project = settings.practiceName.trim() || DEFAULT_LAUNCH_KIT_SETTINGS.practiceName;
  return [
    `# ${project} Viral Functionality Kit`,
    '',
    `Core hook: ${settings.hook}`,
    `Audience: ${settings.audience}`,
    `Primary proof: ${proofCopy[settings.proofAngle]}`,
    `Readiness score: ${launchReadinessScore(settings)}/100`,
    '',
    '## Functional Links',
    '',
    `- Demo: ${buildLaunchUrl(settings, 'demo', 'demo')}`,
    `- Outcomes Studio: ${buildLaunchUrl(settings, 'studio', 'operator-tool')}`,
    `- Practice Forge: ${buildLaunchUrl(settings, 'forge', 'remix')}`,
    `- Proof Panel: ${buildLaunchUrl(settings, 'proof', 'proof')}`,
    `- QR Poster: ${buildLaunchUrl(settings, 'poster', 'clinic')}`,
    `- Repo: ${settings.repoUrl}`,
    '',
    '## Rubric',
    '',
    ...rubric.map((item) => `- ${item.label}: ${item.score}/5 - ${item.reason}`),
    '',
    '## Share Artifacts',
    '',
    ...artifacts.flatMap((artifact) => [
      `### ${artifact.title}`,
      '',
      `Channel: ${artifact.channel}`,
      `URL: ${artifact.url}`,
      '',
      artifact.body,
      '',
    ]),
  ].join('\n');
}
