export interface ErrorNavLink {
  href: string;
  title: string;
  desc: string;
}

export const errorNavLinks: ErrorNavLink[] = [
  {
    href: '/',
    title: 'All tools',
    desc: 'Browse every free image tool on Pickraft.',
  },
  {
    href: '/tools/heic-to-jpg',
    title: 'HEIC to JPG',
    desc: 'Convert iPhone photos to JPEG online.',
  },
  {
    href: '/tools/image-compressor',
    title: 'Image Compressor',
    desc: 'Shrink PNG, JPG, and WebP with quality control.',
  },
  {
    href: '/tools/jpg-to-png',
    title: 'JPG to PNG',
    desc: 'Convert JPEG images to PNG format.',
  },
  {
    href: '/tools/img-to-pdf',
    title: 'Image to PDF',
    desc: 'Combine images into one PDF document.',
  },
  {
    href: '/tools/jpg-to-webp',
    title: 'JPG to WebP',
    desc: 'Compress JPEGs to smaller WebP files.',
  },
];
