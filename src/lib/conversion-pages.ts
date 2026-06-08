import type { OutputFormat } from './image-utils';
import {
  jpgToPngEducationalFaqs,
  jpgToPngHowToFaqs,
  pngToJpgEducationalFaqs,
  pngToJpgHowToFaqs,
} from './png-jpg-faqs';

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
    title: 'JPG to PNG Converter — Free Online JPEG to PNG | Imgify',
    description:
      'Convert JPG to PNG online free. Fast JPG to PNG converter — change JPEG to PNG in your browser with no upload. Bulk convert JPG to PNG instantly.',
    h1: 'JPG to PNG Converter',
    tagline: 'Convert JPG to PNG online free — no signup, no upload, instant download',
    intro: `Need to convert JPG to PNG? Imgify's free JPG to PNG converter lets you change JPEG to PNG directly in your browser — no software to install and no files uploaded to any server. Whether you want to convert a single photo or batch-process hundreds of JPG images, this online JPG to PNG converter handles it in seconds. Simply drag your JPEG files onto the tool, click Convert, and download your PNG files individually or as a ZIP archive. Note that converting JPG to PNG does not remove backgrounds or add transparency, since JPEG files have no alpha channel. This free JPG to PNG converter works on Windows, Mac, iPhone, and Android with any modern browser.`,
    toolName: 'JPG to PNG Converter',
    uploadHint: 'Drop JPG or JPEG files here',
    faqs: [
      ...jpgToPngHowToFaqs,
      ...jpgToPngEducationalFaqs,
      {
        q: 'How to change JPG to PNG for free?',
        a: 'Imgify is a completely free JPG to PNG converter with no limits, watermarks, or signup required. Open this page, upload your JPEG images, convert, and download — it is free forever.',
      },
      {
        q: 'Is this JPG to PNG converter online free?',
        a: 'Yes. This is a free online JPG to PNG converter. There are no hidden fees, subscriptions, or trial limits. Convert as many JPG files to PNG as you need.',
      },
      {
        q: 'Can I convert JPG to PNG with a transparent background?',
        a: 'Converting JPG to PNG changes the file format but does not add transparency. JPEG images do not contain transparent pixels, so the PNG output will have the same solid background as the original.',
      },
      {
        q: 'How to convert JPG to PNG and remove the background?',
        a: 'Plain JPG to PNG conversion does not remove backgrounds. You would need a dedicated background removal tool to create a transparent PNG from a JPEG.',
      },
      {
        q: 'Why is my PNG file larger than the original JPG?',
        a: 'JPEG uses lossy compression, while PNG is lossless — every pixel is stored without compression artifacts. Converting JPG to PNG often increases file size 3–6×. This is normal and expected. If you need a smaller file, use JPG to WebP instead.',
      },
    ],
  },
  {
    slug: 'jpg-to-webp',
    defaultFormat: 'webp',
    title: 'JPG to WebP Converter — Free Online JPEG to WebP | Imgify',
    description:
      'Convert JPG to WebP online free. Compress JPEG images to WebP for faster websites. Free JPG to WebP converter — no upload required.',
    h1: 'JPG to WebP Converter',
    tagline: 'Convert JPG to WebP online free — smaller files, faster loading',
    intro: `Convert JPG to WebP with Imgify's free online JPG to WebP converter. WebP images are typically 25–35% smaller than JPEG at the same visual quality, making this the ideal tool for web developers, bloggers, and anyone optimizing images for faster page loads. Upload your JPEG files, adjust the quality slider, and download WebP images in seconds. This JPG to WebP converter runs entirely in your browser — your photos are never uploaded to a server. Batch convert multiple JPG files to WebP and download them all as a ZIP archive. No account, no watermarks, no limits.`,
    toolName: 'JPG to WebP Converter',
    uploadHint: 'Drop JPG or JPEG files here',
    faqs: [
      {
        q: 'How do I convert JPG to WebP?',
        a: 'Upload your JPG file, ensure WebP is selected as the output format, adjust quality if needed, click Convert All, and download your WebP image.',
      },
      {
        q: 'Is JPG to WebP conversion free?',
        a: 'Yes, Imgify\'s JPG to WebP converter is completely free with unlimited conversions and no signup.',
      },
      {
        q: 'Why convert JPG to WebP?',
        a: 'WebP offers better compression than JPEG, producing smaller files with similar quality. This improves website speed and reduces bandwidth usage.',
      },
      {
        q: 'Can I convert multiple JPG files to WebP at once?',
        a: 'Yes. Upload multiple JPEG files and download all converted WebP images as a ZIP archive.',
      },
      {
        q: 'Does converting JPG to WebP reduce quality?',
        a: 'You control quality with the slider (10–100). At 80–85 quality, most users see no visible difference while file size drops significantly.',
      },
    ],
  },
  {
    slug: 'png-to-webp',
    defaultFormat: 'webp',
    title: 'PNG to WebP Converter — Free Online | Imgify',
    description:
      'Convert PNG to WebP online free. Shrink PNG file sizes for the web without losing quality. Free PNG to WebP converter in your browser.',
    h1: 'PNG to WebP Converter',
    tagline: 'Convert PNG to WebP online free — reduce file size for faster sites',
    intro: `Convert PNG to WebP with this free online PNG to WebP converter. PNG files are often large due to lossless compression, while WebP can dramatically reduce file size — especially for photos and complex graphics. Upload your PNG images, choose your quality setting, and download optimized WebP files instantly. Everything runs client-side in your browser with no server upload. Perfect for web developers optimizing hero images, product photos, and blog graphics. Bulk convert PNG to WebP and download all results as a ZIP.`,
    toolName: 'PNG to WebP Converter',
    uploadHint: 'Drop PNG files here',
    faqs: [
      {
        q: 'How do I convert PNG to WebP?',
        a: 'Upload your PNG file, select WebP as output, adjust quality, convert, and download. WebP is pre-selected on this page.',
      },
      {
        q: 'Is PNG to WebP conversion free?',
        a: 'Yes, completely free with no limits or watermarks.',
      },
      {
        q: 'Will PNG to WebP keep transparency?',
        a: 'WebP supports transparency. However, this converter renders through Canvas which preserves visual appearance. For PNGs with alpha channels, transparency is maintained in the WebP output in most browsers.',
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
    title: 'PNG to JPG Converter — Free Online | Convert PNG to JPEG | Imgify',
    description:
      'Convert PNG to JPG online free. Change PNG to JPEG for smaller file sizes. Free PNG to JPG converter — no upload, works in your browser.',
    h1: 'PNG to JPG Converter',
    tagline: 'Convert PNG to JPG online free — smaller files in one click',
    intro: `Convert PNG to JPG with Imgify's free PNG to JPG converter. JPEG files are significantly smaller than PNG for photographic images, making JPG the better choice for email attachments, social media, and websites where transparency is not needed. Upload your PNG files, adjust the quality slider, and download JPEG images instantly. This online PNG to JPG converter processes everything locally — your images stay private on your device. Note that converting PNG to JPG removes transparency (the background becomes white). Bulk convert multiple PNG files and download as ZIP.`,
    toolName: 'PNG to JPG Converter',
    uploadHint: 'Drop PNG files here',
    faqs: [
      ...pngToJpgHowToFaqs,
      ...pngToJpgEducationalFaqs,
      {
        q: 'Does PNG to JPG remove transparency?',
        a: 'Yes. JPG does not support transparency. Transparent areas in your PNG will be filled with a white background when converted to JPEG.',
      },
      {
        q: 'Why convert PNG to JPG?',
        a: 'JPG files are much smaller than PNG for photos and complex images, making them easier to share via email, messaging apps, and social media.',
      },
      {
        q: 'Is this PNG to JPG converter free?',
        a: 'Yes, completely free with unlimited conversions and no signup required.',
      },
    ],
  },
  {
    slug: 'webp-to-png',
    defaultFormat: 'png',
    title: 'WebP to PNG Converter — Free Online | Imgify',
    description:
      'Convert WebP to PNG online free. Change WebP images to PNG for compatibility. Free WebP to PNG converter in your browser.',
    h1: 'WebP to PNG Converter',
    tagline: 'Convert WebP to PNG online free — universal compatibility',
    intro: `Convert WebP to PNG with this free online WebP to PNG converter. While WebP is great for the web, some apps, printers, and older software only accept PNG. Upload your WebP images and convert them to universally compatible PNG files in seconds. No software installation, no server upload — everything runs in your browser. Bulk convert WebP to PNG and download all files as a ZIP archive. PNG output is lossless, preserving maximum image quality from your WebP source.`,
    toolName: 'WebP to PNG Converter',
    uploadHint: 'Drop WebP files here',
    faqs: [
      {
        q: 'How do I convert WebP to PNG?',
        a: 'Upload your WebP file, PNG is pre-selected. Click Convert All and download your PNG image.',
      },
      {
        q: 'Why convert WebP to PNG?',
        a: 'PNG has broader compatibility with design tools, document editors, and print workflows that may not support WebP.',
      },
      {
        q: 'Is WebP to PNG conversion free?',
        a: 'Yes, Imgify\'s WebP to PNG converter is free with no limits.',
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
    title: 'WebP to JPG Converter — Free Online | Imgify',
    description:
      'Convert WebP to JPG online free. Change WebP to JPEG for email and social sharing. Free WebP to JPG converter — no upload.',
    h1: 'WebP to JPG Converter',
    tagline: 'Convert WebP to JPG online free — easy sharing, smaller files',
    intro: `Convert WebP to JPG with Imgify's free WebP to JPG converter. Downloaded a WebP image but need a JPEG? This tool converts WebP to JPG instantly in your browser. JPEG is the most widely supported format for sharing via email, messaging apps, and social media. Upload your WebP files, adjust quality, and download JPG images. All processing is client-side — nothing is uploaded to a server. Bulk convert and download as ZIP.`,
    toolName: 'WebP to JPG Converter',
    uploadHint: 'Drop WebP files here',
    faqs: [
      {
        q: 'How do I convert WebP to JPG?',
        a: 'Upload your WebP image, JPG is pre-selected as output. Convert and download your JPEG file.',
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
  {
    slug: 'jpg-to-avif',
    defaultFormat: 'avif',
    title: 'JPG to AVIF Converter — Free Online | Imgify',
    description:
      'Convert JPG to AVIF online free. Next-gen image compression from JPEG. Free JPG to AVIF converter in your browser.',
    h1: 'JPG to AVIF Converter',
    tagline: 'Convert JPG to AVIF online free — next-generation compression',
    intro: `Convert JPG to AVIF with Imgify's free JPG to AVIF converter. AVIF offers even better compression than WebP, producing the smallest file sizes for web use. Upload your JPEG images and convert to AVIF format directly in your browser. Note that AVIF export requires a compatible browser (Chrome, Firefox, Edge). If AVIF is unavailable, try our JPG to WebP converter instead. All processing is local — your photos never leave your device.`,
    toolName: 'JPG to AVIF Converter',
    uploadHint: 'Drop JPG or JPEG files here',
    faqs: [
      {
        q: 'How do I convert JPG to AVIF?',
        a: 'Upload your JPG file, AVIF is pre-selected. Click Convert All and download. Requires a browser that supports AVIF encoding.',
      },
      {
        q: 'Is JPG to AVIF better than JPG to WebP?',
        a: 'AVIF typically achieves 20–30% better compression than WebP at similar quality, but has less universal browser support for display.',
      },
      {
        q: 'Is this JPG to AVIF converter free?',
        a: 'Yes, completely free with no limits.',
      },
      {
        q: 'Why does AVIF conversion fail in Safari?',
        a: 'Safari does not support AVIF encoding via Canvas. Use Chrome or Firefox, or convert to WebP instead.',
      },
      {
        q: 'Can I batch convert JPG to AVIF?',
        a: 'Yes. Upload multiple JPEG files and download all AVIF results as a ZIP.',
      },
    ],
  },
  {
    slug: 'png-to-avif',
    defaultFormat: 'avif',
    title: 'PNG to AVIF Converter — Free Online | Imgify',
    description:
      'Convert PNG to AVIF online free. Shrink PNG files with AVIF compression. Free PNG to AVIF converter in your browser.',
    h1: 'PNG to AVIF Converter',
    tagline: 'Convert PNG to AVIF online free — maximum compression',
    intro: `Convert PNG to AVIF with this free PNG to AVIF converter. AVIF dramatically reduces PNG file sizes while maintaining excellent visual quality — ideal for web performance. Upload your PNG images and convert to AVIF in your browser. AVIF encoding requires Chrome, Firefox, or Edge. For broader compatibility, try PNG to WebP instead. No server upload, no signup — convert PNG to AVIF free and instantly.`,
    toolName: 'PNG to AVIF Converter',
    uploadHint: 'Drop PNG files here',
    faqs: [
      {
        q: 'How do I convert PNG to AVIF?',
        a: 'Upload your PNG, AVIF is pre-selected. Convert and download. Requires a browser with AVIF encoding support.',
      },
      {
        q: 'How much smaller is AVIF than PNG?',
        a: 'AVIF files are often 50–70% smaller than PNG for the same visual quality, depending on image content.',
      },
      {
        q: 'Is PNG to AVIF conversion free?',
        a: 'Yes, free with unlimited conversions.',
      },
      {
        q: 'Does PNG to AVIF keep transparency?',
        a: 'AVIF supports transparency. Results depend on browser encoding support.',
      },
      {
        q: 'Can I batch convert PNG to AVIF?',
        a: 'Yes. Upload multiple PNG files and download as ZIP.',
      },
    ],
  },
];

export const conversionLinks = conversionPages.map((page) => ({
  href: `/tools/${page.slug}`,
  label: page.h1.replace(' Converter', ''),
}));

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
