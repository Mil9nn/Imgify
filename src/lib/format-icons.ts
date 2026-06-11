const formatBadgeStyles: Record<string, string> = {
  HEIC: 'border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-800/60 dark:bg-violet-950/40 dark:text-violet-200',
  JPG: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-200',
  PNG: 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-800/60 dark:bg-sky-950/40 dark:text-sky-200',
  WebP: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-200',
  PDF: 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-200',
  IMG: 'border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-700/60 dark:bg-slate-900/40 dark:text-slate-200',
};

export function formatBadgeClass(format: string): string {
  return formatBadgeStyles[format] ?? 'border-hairline bg-canvas-soft text-ink';
}

export function formatSlugPart(part: string): string {
  if (part === 'jpg') return 'JPG';
  if (part === 'png') return 'PNG';
  if (part === 'webp') return 'WebP';
  if (part === 'heic') return 'HEIC';
  if (part === 'img') return 'IMG';
  if (part === 'pdf') return 'PDF';
  return part.toUpperCase();
}

export function formatsFromConversionSlug(slug: string): { from: string; to: string } | null {
  const [fromPart, toPart] = slug.split('-to-');
  if (!fromPart || !toPart) return null;
  return { from: formatSlugPart(fromPart), to: formatSlugPart(toPart) };
}
