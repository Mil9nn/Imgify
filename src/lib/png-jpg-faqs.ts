export interface Faq {
  q: string;
  a: string;
}

/** High-intent “how to” questions users search for PNG → JPG. */
export const pngToJpgHowToFaqs: Faq[] = [
  {
    q: 'How to convert PNG to JPG?',
    a: 'Upload your PNG to Imgify’s free PNG to JPG converter, confirm JPG is selected as the output format, adjust quality if needed, click Convert, and download your JPEG. The whole process runs in your browser — no software install. You can convert one file or batch-convert many PNGs at once.',
  },
  {
    q: 'Where to convert PNG to JPG efficiently?',
    a: 'Imgify is built for efficient PNG to JPG conversion: batch upload, adjustable quality, instant preview with file-size comparison, and ZIP download. Because files never leave your device, it is fast and private.',
  },
  {
    q: 'How to convert PNG to JPG on Windows?',
    a: 'On Windows 10 or 11, open Chrome, Edge, or Firefox, visit this PNG to JPG converter, upload your PNGs, and download JPEGs. No install, registry changes, or Microsoft Store apps needed.',
  },
  {
    q: 'How to convert PNG to JPG on Mac?',
    a: 'On Mac, use Safari, Chrome, or Firefox to open Imgify, upload PNG files, convert to JPG, and download. Works on macOS without Preview exports or third-party Mac apps.',
  },
  {
    q: 'How to change PNG to JPG on iPhone?',
    a: 'On iPhone, open Safari, go to this PNG to JPG page, tap the upload area to pick photos from your library, convert, then download or save the JPEG to Files or Photos.',
  },
  {
    q: 'Can I convert PNG to JPG without installing software?',
    a: 'Yes. Imgify converts PNG to JPG entirely in your web browser — no downloads, plugins, or desktop software. It works on Windows, Mac, Linux, iPhone, and Android.',
  },
];

/** High-intent “how to” questions users search for JPG → PNG. */
export const jpgToPngHowToFaqs: Faq[] = [
  {
    q: 'How to convert JPG to PNG?',
    a: 'Upload your JPG or JPEG to Imgify, keep PNG as the output format, click Convert, and download your PNG. Conversion runs locally in your browser with no server upload. You can convert one image or many at once.',
  },
  {
    q: 'Where to convert JPG to PNG efficiently?',
    a: 'Imgify offers efficient JPG to PNG conversion with bulk upload, file-size comparison after conversion, and ZIP download. Everything runs client-side for speed and privacy.',
  },
  {
    q: 'How to convert JPG to PNG on Windows?',
    a: 'On Windows, open this page in Chrome or Edge, upload JPG files, convert to PNG, and download. No Paint, Photoshop, or other Windows software required.',
  },
  {
    q: 'How to convert JPG to PNG on Mac?',
    a: 'On Mac, use Safari or Chrome to visit Imgify, upload JPEG images, convert to PNG, and download. Works on any Mac without installing converter apps.',
  },
  {
    q: 'How to change JPG to PNG on iPhone?',
    a: 'On iPhone, open this converter in Safari, select JPG photos from your library, convert to PNG, and download or save to Files.',
  },
  {
    q: 'Can I convert JPG to PNG without installing software?',
    a: 'Yes. This JPG to PNG converter works in any modern browser with no install. Upload JPEG files, convert, and download PNGs instantly on desktop or mobile.',
  },
];

/** Format comparison & trust FAQs — PNG → JPG page. */
export const pngToJpgEducationalFaqs: Faq[] = [
  {
    q: 'Does converting PNG to JPG reduce image quality?',
    a: 'JPEG uses lossy compression, so some fine detail can be lost — especially at lower quality settings. Use the quality slider (80–90 recommended) to balance file size and visual quality. Flat graphics and screenshots may show more artifacts than photos.',
  },
  {
    q: 'What is the difference between PNG and JPG?',
    a: 'PNG is lossless and supports transparency; JPG is lossy and does not. PNG is better for graphics, logos, and images needing transparent backgrounds. JPG is better for photos and sharing when smaller file size matters.',
  },
  {
    q: 'Does PNG support transparency?',
    a: 'Yes. PNG supports full alpha transparency, which is why logos and cut-out graphics are often saved as PNG. When you convert PNG to JPG, that transparency is replaced with a solid (usually white) background.',
  },
  {
    q: 'Does JPG support transparent backgrounds?',
    a: 'No. JPEG does not support transparency. Any transparent pixels in a PNG become a solid color (typically white) when converted to JPG.',
  },
  {
    q: 'Which format is better: PNG or JPG?',
    a: 'It depends on your use case. Choose PNG for transparency, sharp text, and lossless quality. Choose JPG for photographs, email attachments, and web pages where smaller file size is more important than transparency.',
  },
  {
    q: 'Is PNG larger than JPG?',
    a: 'Usually yes, especially for photos. PNG stores more data losslessly, while JPG compresses aggressively. Converting PNG to JPG often reduces file size significantly.',
  },
  {
    q: 'Can I convert multiple PNG files to JPG at once?',
    a: 'Yes. Upload several PNG files together or drag them in bulk, convert all at once, then download each JPEG separately or use Download All as ZIP.',
  },
  {
    q: 'Is image conversion secure and private?',
    a: 'With Imgify, yes. Conversion runs in your browser using the Canvas API — your images are not uploaded to our servers. This keeps personal and professional photos private.',
  },
  {
    q: 'Will image dimensions change after conversion?',
    a: 'No. Converting PNG to JPG changes the file format and compression, not the pixel width and height. Your image dimensions stay exactly the same.',
  },
];

/** Format comparison & trust FAQs — JPG → PNG page. */
export const jpgToPngEducationalFaqs: Faq[] = [
  {
    q: 'Does converting JPG to PNG reduce image quality?',
    a: 'Converting JPG to PNG does not remove detail that is already in the JPEG, but it also cannot recover quality lost from the original JPEG compression. PNG is lossless going forward, so you will not lose further quality after conversion — though the file may become much larger.',
  },
  {
    q: 'What is the difference between PNG and JPG?',
    a: 'PNG is lossless and supports transparency; JPG uses lossy compression and does not support transparent backgrounds. JPG files are smaller for photos; PNG files are better when you need crisp edges or alpha channels.',
  },
  {
    q: 'Does PNG support transparency?',
    a: 'Yes. PNG supports transparency, but converting JPG to PNG does not add it — JPEG files have no transparent pixels, so the PNG output keeps the same solid background as the source.',
  },
  {
    q: 'Does JPG support transparent backgrounds?',
    a: 'No. JPG never supports transparency. Converting JPG to PNG changes the file format but does not add a transparent background.',
  },
  {
    q: 'Which format is better: PNG or JPG?',
    a: 'Use JPG for photos and sharing where file size matters. Use PNG when you need lossless quality, sharp text, or transparency. Converting JPG to PNG is useful for compatibility, not for shrinking files.',
  },
  {
    q: 'Is PNG larger than JPG?',
    a: 'Yes, in most cases. Converting JPG to PNG often makes files 3–6× larger because PNG stores every pixel without JPEG’s lossy compression. For smaller output, try JPG to WebP instead.',
  },
  {
    q: 'Can I convert multiple JPG files to PNG at once?',
    a: 'Yes. Select or drag multiple JPEG files, convert them all in one batch, and download individually or as a ZIP archive.',
  },
  {
    q: 'Is image conversion secure and private?',
    a: 'Yes. Imgify processes images locally in your browser. Your JPG files are never sent to a server, so conversion stays private and secure.',
  },
  {
    q: 'Will image dimensions change after conversion?',
    a: 'No. JPG to PNG conversion keeps the same width and height in pixels. Only the file format and encoding change.',
  },
];
