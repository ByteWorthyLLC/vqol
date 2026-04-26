import type { PracticeConfig } from '../practice-config/types';

export interface ForkAuditItem {
  id: string;
  label: string;
  pass: boolean;
  detail: string;
}

export function auditForkConfig(config: PracticeConfig): ForkAuditItem[] {
  return [
    {
      id: 'practice-id',
      label: 'Practice slug',
      pass: Boolean(config.practiceId),
      detail: config.practiceId ?? 'Add practiceId to practice.json for stable aggregate and calendar IDs.',
    },
    {
      id: 'contact',
      label: 'Patient contact path',
      pass: Boolean(
        config.primaryContact.phone ||
          config.primaryContact.email ||
          config.primaryContact.websiteUrl
      ),
      detail: [
        config.primaryContact.phone,
        config.primaryContact.email,
        config.primaryContact.websiteUrl,
      ].filter(Boolean).join(' | ') || 'Add phone, email, or websiteUrl.',
    },
    {
      id: 'aggregate-default',
      label: 'Aggregate opt-in',
      pass:
        !config.features.aggregateSubmit ||
        Boolean(config.features.aggregateEndpoint?.startsWith('https://')),
      detail: config.features.aggregateSubmit
        ? `Posts de-identified score events to ${config.features.aggregateEndpoint}`
        : 'Off by default. No network score submission.',
    },
    {
      id: 'languages',
      label: 'Language surface',
      pass: config.locale.available.length >= 1,
      detail: `${config.locale.available.length} locale(s): ${config.locale.available.join(', ')}`,
    },
    {
      id: 'instrument-mode',
      label: 'Instrument mode',
      pass:
        config.instrument.mode !== 'permissioned-veines' ||
        config.instrument.licenseStatus === 'permission-granted',
      detail: `${config.instrument.mode} / ${config.instrument.licenseStatus}`,
    },
  ];
}

export function forkReadinessScore(items: readonly ForkAuditItem[]): number {
  if (items.length === 0) return 0;
  return Math.round((items.filter((item) => item.pass).length / items.length) * 100);
}
