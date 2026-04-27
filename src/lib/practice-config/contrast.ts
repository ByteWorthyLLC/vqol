// WCAG 2.1 contrast-ratio computation. Pure math. no external dependencies.

function hexToRgb(hex: string): readonly [number, number, number] {
  const m = /^#([0-9a-fA-F]{6})$/.exec(hex);
  if (!m) throw new Error(`Invalid hex color: ${hex}`);
  const num = parseInt(m[1] as string, 16);
  return [(num >> 16) & 0xff, (num >> 8) & 0xff, num & 0xff];
}

function relativeLuminance(rgb: readonly [number, number, number]): number {
  const channel = (c: number): number => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return (
    0.2126 * channel(rgb[0]) +
    0.7152 * channel(rgb[1]) +
    0.0722 * channel(rgb[2])
  );
}

export function contrastRatio(hexA: string, hexB: string): number {
  const la = relativeLuminance(hexToRgb(hexA));
  const lb = relativeLuminance(hexToRgb(hexB));
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

export interface ContrastReport {
  pair: string;
  ratio: number;
  threshold: number;
  meetsAa: boolean;
}

interface BrandingColors {
  primaryColor: string;
  primaryTextColor: string;
  backgroundColor: string;
  foregroundColor: string;
}

export function auditBranding(branding: BrandingColors): ContrastReport[] {
  const bodyRatio = contrastRatio(branding.foregroundColor, branding.backgroundColor);
  const buttonRatio = contrastRatio(branding.primaryTextColor, branding.primaryColor);
  const accentRatio = contrastRatio(branding.primaryColor, branding.backgroundColor);
  return [
    {
      pair: 'foregroundColor on backgroundColor (body text)',
      ratio: bodyRatio,
      threshold: 4.5,
      meetsAa: bodyRatio >= 4.5,
    },
    {
      pair: 'primaryTextColor on primaryColor (button text)',
      ratio: buttonRatio,
      threshold: 4.5,
      meetsAa: buttonRatio >= 4.5,
    },
    {
      pair: 'primaryColor on backgroundColor (UI accent)',
      ratio: accentRatio,
      threshold: 3.0,
      meetsAa: accentRatio >= 3.0,
    },
  ];
}
