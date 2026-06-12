import type { OutputFormat } from './image-utils';
import { jpgToPngPageFaqs, pngToJpgPageFaqs } from './png-jpg-faqs';

export interface ConversionFaq {
  q: string;
  a: string;
}

export interface ConversionPageConfig {
  slug: string;
  defaultFormat: OutputFormat;
  title: string;
  description: string;
  h1: string;
  tagline: string;
  intro: string;
  toolName: string;
  faqs: ConversionFaq[];
  uploadHint?: string;
}

const defaultSteps = (from: string, to: string) => [
  {
    title: `Upload your ${from} files`,
    description: `Drag and drop one or more ${from} images, or click to browse your files.`,
  },
  {
    title: `Convert to ${to}`,
    description: `The output format is preset to ${to}. Adjust quality if needed, then click Convert All.`,
  },
  {
    title: 'Download your images',
    description: 'Preview results with file size comparison, then download individually or as a ZIP.',
  },
];

export function getConversionSteps(from: string, to: string) {
  return defaultSteps(from, to);
}

export const conversionPages: ConversionPageConfig[] = [
  {
    slug: 'jpg-to-png',
    defaultFormat: 'png',
    title: 'JPG to PNG Converter — Free Online JPEG to PNG | Pickraft',
    description:
      'Convert JPG to PNG online free. Fast JPG to PNG converter — change JPEG to PNG instantly. Bulk convert JPG to PNG in seconds.',
    h1: 'JPG to PNG Converter',
    tagline: 'Convert JPG to PNG online free — no signup, instant download',
    intro: `Need to convert JPG to PNG? Pickraft's free JPG to PNG converter lets you change JPEG to PNG online — no software to install. Whether you want to convert a single photo or batch-process hundreds of JPG images, this online JPG to PNG converter handles it in seconds. Simply drag your JPEG files onto the tool, click Convert, and download your PNG files individually or as a ZIP archive. Note that converting JPG to PNG does not remove backgrounds or add transparency, since JPEG files have no alpha channel. This free JPG to PNG converter works on Windows, Mac, iPhone, and Android.`,
    toolName: 'JPG to PNG Converter',
    uploadHint: 'Drop JPG or JPEG files here',
    faqs: jpgToPngPageFaqs,
  },
  {
    slug: 'jpg-to-webp',
    defaultFormat: 'webp',
    title: 'JPG to WebP Converter — Free Online JPEG to WebP | Pickraft',
    description:
      'Convert JPG to WebP online free. Compress JPEG images to WebP for faster websites. Free JPG to WebP converter.',
    h1: 'JPG to WebP Converter',
    tagline: 'Convert JPG to WebP online free — smaller files, faster loading',
    intro: `Convert JPG to WebP with Pickraft's free online JPG to WebP converter. WebP images are typically 25–35% smaller than JPEG at the same visual quality, making this the ideal tool for web developers, bloggers, and anyone optimizing images for faster page loads. Upload your JPEG files, adjust the quality slider, and download WebP images in seconds. Batch convert multiple JPG files to WebP and download them all as a ZIP archive. No account, no watermarks, no limits.`,
    toolName: 'JPG to WebP Converter',
    uploadHint: 'Drop JPG or JPEG files here',
    faqs: [
      {
        q: 'How do I convert JPG to WebP?',
        a: 'Upload your JPG file, ensure WebP is selected as the output format, adjust quality if needed, click Convert All, and download your WebP image.',
      },
      {
        q: 'How to convert JPG to WebP on Windows?',
        a: 'On Windows, open Chrome or Edge, visit this JPG to WebP converter, upload your JPEG files, and download WebP images. No software install needed — conversion runs in your browser.',
      },
      {
        q: 'Is JPG to WebP conversion free?',
        a: 'Yes, Pickraft\'s JPG to WebP converter is completely free with unlimited conversions and no signup.',
      },
      {
        q: 'Why convert JPG to WebP?',
        a: 'WebP offers better compression than JPEG, producing smaller files with similar quality. This improves website speed and reduces bandwidth usage.',
      },
      {
        q: 'Does converting JPG to WebP reduce quality?',
        a: 'You control quality with the slider (10–100). At 80–85 quality, most users see no visible difference while file size drops significantly.',
      },
      {
        q: 'Can I convert multiple JPG files to WebP at once?',
        a: 'Yes. Upload multiple JPEG files and download all converted WebP images as a ZIP archive.',
      },
    ],
  },
  {
    slug: 'png-to-webp',
    defaultFormat: 'webp',
    title: 'PNG to WebP Converter — Free Online | Pickraft',
    description:
      'Convert PNG to WebP online free. Shrink PNG file sizes for the web without losing quality. Free PNG to WebP converter.',
    h1: 'PNG to WebP Converter',
    tagline: 'Convert PNG to WebP online free — reduce file size for faster sites',
    intro: `Convert PNG to WebP with this free online PNG to WebP converter. PNG files are often large due to lossless compression, while WebP can dramatically reduce file size — especially for photos and complex graphics. Upload your PNG images, choose your quality setting, and download optimized WebP files instantly. Perfect for web developers optimizing hero images, product photos, and blog graphics. Bulk convert PNG to WebP and download all results as a ZIP.`,
    toolName: 'PNG to WebP Converter',
    uploadHint: 'Drop PNG files here',
    faqs: [
      {
        q: 'How do I convert PNG to WebP?',
        a: 'Upload your PNG file, select WebP as output, adjust quality, convert, and download. WebP is pre-selected on this page.',
      },
      {
        q: 'How to convert PNG to WebP on iPhone?',
        a: 'On iPhone, open Safari, visit this PNG to WebP converter, tap upload to pick PNG images from your library, convert, and download WebP files to Files or Photos.',
      },
      {
        q: 'Is PNG to WebP conversion free?',
        a: 'Yes, completely free with no limits or watermarks.',
      },
      {
        q: 'Will PNG to WebP keep transparency?',
        a: 'WebP supports transparency. For PNGs with alpha channels, transparency is typically maintained in the WebP output.',
      },
      {
        q: 'How much smaller is WebP than PNG?',
        a: 'WebP files are often 25–50% smaller than PNG for photographic content. Exact savings depend on image content and quality settings.',
      },
      {
        q: 'Can I batch convert PNG to WebP?',
        a: 'Yes. Upload multiple PNG files and download all WebP results as a ZIP archive.',
      },
    ],
  },
  {
    slug: 'png-to-jpg',
    defaultFormat: 'jpg',
    title: 'PNG to JPG Converter — Free Online | Convert PNG to JPEG | Pickraft',
    description:
      'Convert PNG to JPG online free. Change PNG to JPEG for smaller file sizes. Free PNG to JPG converter.',
    h1: 'PNG to JPG Converter',
    tagline: 'Convert PNG to JPG online free — smaller files in one click',
    intro: `Convert PNG to JPG with Pickraft's free PNG to JPG converter. JPEG files are significantly smaller than PNG for photographic images, making JPG the better choice for email attachments, social media, and websites where transparency is not needed. Upload your PNG files, adjust the quality slider, and download JPEG images instantly. Note that converting PNG to JPG removes transparency (the background becomes white). Bulk convert multiple PNG files and download as ZIP.`,
    toolName: 'PNG to JPG Converter',
    uploadHint: 'Drop PNG files here',
    faqs: pngToJpgPageFaqs,
  },
  {
    slug: 'webp-to-png',
    defaultFormat: 'png',
    title: 'WebP to PNG Converter — Free Online | Pickraft',
    description:
      'Convert WebP to PNG online free. Change WebP images to PNG for compatibility. Free WebP to PNG converter.',
    h1: 'WebP to PNG Converter',
    tagline: 'Convert WebP to PNG online free — universal compatibility',
    intro: `Convert WebP to PNG with this free online WebP to PNG converter. While WebP is great for the web, some apps, printers, and older software only accept PNG. Upload your WebP images and convert them to universally compatible PNG files in seconds. No software installation required. Bulk convert WebP to PNG and download all files as a ZIP archive. PNG output is lossless, preserving maximum image quality from your WebP source.`,
    toolName: 'WebP to PNG Converter',
    uploadHint: 'Drop WebP files here',
    faqs: [
      {
        q: 'How do I convert WebP to PNG?',
        a: 'Upload your WebP file, PNG is pre-selected. Click Convert All and download your PNG image.',
      },
      {
        q: 'How to convert WebP to PNG on Windows?',
        a: 'On Windows, open Chrome or Edge, visit this WebP to PNG converter, upload your WebP files, and download PNG images. No software install required.',
      },
      {
        q: 'Why convert WebP to PNG?',
        a: 'PNG has broader compatibility with design tools, document editors, and print workflows that may not support WebP.',
      },
      {
        q: 'Is WebP to PNG conversion free?',
        a: 'Yes, Pickraft\'s WebP to PNG converter is free with no limits.',
      },
      {
        q: 'Does WebP to PNG lose quality?',
        a: 'PNG is lossless, so quality is preserved during conversion. File size may increase compared to WebP.',
      },
      {
        q: 'Can I batch convert WebP to PNG?',
        a: 'Yes. Upload multiple WebP files and download all PNG results as a ZIP.',
      },
    ],
  },
  {
    slug: 'webp-to-jpg',
    defaultFormat: 'jpg',
    title: 'WebP to JPG Converter — Free Online | Pickraft',
    description:
      'Convert WebP to JPG online free. Change WebP to JPEG for email and social sharing. Free WebP to JPG converter.',
    h1: 'WebP to JPG Converter',
    tagline: 'Convert WebP to JPG online free — easy sharing, smaller files',
    intro: `Convert WebP to JPG with Pickraft's free WebP to JPG converter. Downloaded a WebP image but need a JPEG? This tool converts WebP to JPG instantly. JPEG is the most widely supported format for sharing via email, messaging apps, and social media. Upload your WebP files, adjust quality, and download JPG images. Bulk convert and download as ZIP.`,
    toolName: 'WebP to JPG Converter',
    uploadHint: 'Drop WebP files here',
    faqs: [
      {
        q: 'How do I convert WebP to JPG?',
        a: 'Upload your WebP image, JPG is pre-selected as output. Convert and download your JPEG file.',
      },
      {
        q: 'How to convert WebP to JPG on iPhone?',
        a: 'On iPhone, open Safari, visit this WebP to JPG converter, tap upload to pick WebP images, convert, and download JPEG files to Files or Photos.',
      },
      {
        q: 'Is WebP to JPG conversion free?',
        a: 'Yes, completely free with unlimited use.',
      },
      {
        q: 'Why convert WebP to JPG?',
        a: 'Some platforms and apps do not accept WebP. JPG is universally supported for uploads and sharing.',
      },
      {
        q: 'Does WebP to JPG remove transparency?',
        a: 'Yes. Transparent WebP areas become white in the JPG output since JPEG does not support transparency.',
      },
      {
        q: 'Can I convert multiple WebP files to JPG?',
        a: 'Yes. Bulk upload WebP files and download all JPG results as a ZIP.',
      },
    ],
  },
];

export function getConversionBySlug(slug: string): ConversionPageConfig | undefined {
  return conversionPages.find((p) => p.slug === slug);
}

export function getRelatedConversions(
  currentSlug: string,
  limit = 4,
): { href: string; title: string; desc: string }[] {
  return conversionPages
    .filter((p) => p.slug !== currentSlug)
    .slice(0, limit)
    .map((p) => ({
      href: `/tools/${p.slug}`,
      title: p.h1,
      desc: p.tagline,
    }));
}
