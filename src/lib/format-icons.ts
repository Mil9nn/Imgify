export const FORMAT_ICONS: Record<string, string> = {
  JPG: '/jpg.png',
  PNG: '/png.png',
  WebP: '/webp.png',
};

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
