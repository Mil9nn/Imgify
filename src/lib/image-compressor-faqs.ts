export interface Faq {
  q: string;
  a: string;
}

export const imageCompressorPageFaqs: Faq[] = [
  {
    q: 'How do I compress an image online for free?',
    a: 'Upload your PNG, JPG, or WebP file to Pickraft’s image compressor, choose lossy or lossless mode, adjust the quality slider if needed, click Compress, and download the smaller file. Everything runs in your browser — no signup or software install.',
  },
  {
    q: 'What is the difference between lossy and lossless compression?',
    a: 'Lossy compression reduces file size by lowering image quality — ideal for photos and web images where a small quality drop saves significant space. Lossless compression preserves full quality; PNG stays lossless, while JPEG and WebP are re-encoded at maximum quality with minimal size change.',
  },
  {
    q: 'How much can I compress an image?',
    a: 'Savings depend on the original file, format, and quality setting. JPEG and WebP photos often shrink 40–80% in lossy mode at 60–75% quality. PNG files compress best when converted to WebP in lossy mode. Use the quality slider to balance size and visual fidelity.',
  },
  {
    q: 'Is this image compressor free?',
    a: 'Yes. Pickraft’s image compressor is completely free with unlimited use, no watermarks, and no account required.',
  },
  {
    q: 'Are my images uploaded to a server?',
    a: 'No. Compression happens locally in your browser. Your files are never sent to Pickraft’s servers, stored, or accessed by us.',
  },
  {
    q: 'What image formats does the compressor support?',
    a: 'You can compress PNG, JPG, JPEG, and WebP images. In lossy mode, PNG files are automatically converted to WebP for better compression unless you choose a different output format.',
  },
  {
    q: 'Can I compress multiple images at once?',
    a: 'Yes. Upload multiple images, compress them all with one click, and download individually or as a ZIP archive.',
  },
  {
    q: 'What quality setting should I use?',
    a: 'For web use, 70–80% quality usually looks identical to the original while cutting file size significantly. For print or archival work, use lossless mode or set quality to 90–100%.',
  },
  {
    q: 'Will compressing an image reduce its resolution?',
    a: 'No. Pickraft compresses by re-encoding at your chosen quality — pixel dimensions stay the same. Only file size and encoding quality change.',
  },
  {
    q: 'Can I compress images on iPhone or Android?',
    a: 'Yes. Open this page in Safari or Chrome on your phone, tap to upload photos from your gallery, compress, and download. No app install needed.',
  },
];
