const formatTextColors: Record<string, string> = {
  HEIC: 'text-violet-600 dark:text-violet-400',
  JPG: 'text-amber-600 dark:text-amber-400',
  PNG: 'text-sky-600 dark:text-sky-400',
  WebP: 'text-emerald-600 dark:text-emerald-400',
  PDF: 'text-rose-600 dark:text-rose-400',
  IMG: 'text-slate-600 dark:text-slate-400',
};

export function formatBadgeClass(format: string): string {
  return formatTextColors[format] ?? 'text-ink';
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
