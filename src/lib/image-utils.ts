export type OutputFormat = 'webp' | 'png' | 'jpg' | 'avif';

const MIME_TYPES: Record<OutputFormat, string> = {
  webp: 'image/webp',
  png: 'image/png',
  jpg: 'image/jpeg',
  avif: 'image/avif',
};

const EXTENSIONS: Record<OutputFormat, string> = {
  webp: 'webp',
  png: 'png',
  jpg: 'jpg',
  avif: 'avif',
};

let avifSupported: boolean | null = null;

export function getMimeType(format: OutputFormat): string {
  return MIME_TYPES[format];
}

export function getExtension(format: OutputFormat): string {
  return EXTENSIONS[format];
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function getSizeComparison(
  originalSize: number,
  convertedSize: number,
): { label: string; tone: 'smaller' | 'larger' | 'same' } {
  if (convertedSize === originalSize) {
    return { label: 'same size', tone: 'same' };
  }

  const ratio = convertedSize / originalSize;

  if (ratio < 1) {
    const pct = Math.round((1 - ratio) * 100);
    return { label: `${pct}% smaller`, tone: 'smaller' };
  }

  if (ratio >= 2) {
    return { label: `${ratio.toFixed(1)}× larger`, tone: 'larger' };
  }

  const pct = Math.round((ratio - 1) * 100);
  return { label: `${pct}% larger`, tone: 'larger' };
}

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error(`Failed to encode image as ${mimeType}`));
      },
      mimeType,
      quality,
    );
  });
}

export async function checkAvifSupport(): Promise<boolean> {
  if (avifSupported !== null) return avifSupported;

  if (typeof document === 'undefined') return false;

  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 1, 1);

  try {
    const blob = await canvasToBlob(canvas, 'image/avif', 0.5);
    avifSupported = blob.size > 0;
  } catch {
    avifSupported = false;
  }

  return avifSupported;
}

export async function convertImage(
  file: File,
  format: OutputFormat,
  quality: number,
): Promise<Blob> {
  if (format === 'avif' && !(await checkAvifSupport())) {
    throw new Error(
      'AVIF export is not supported in your browser. Try WebP instead.',
    );
  }

  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  if (format === 'jpg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0);

  const mimeType = getMimeType(format);
  const qualityValue = format === 'png' ? undefined : quality / 100;

  return canvasToBlob(canvas, mimeType, qualityValue ?? 1);
}

export function resizeImageCover(
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  const sourceRatio = img.naturalWidth / img.naturalHeight;
  const targetRatio = targetWidth / targetHeight;

  let sx = 0;
  let sy = 0;
  let sw = img.naturalWidth;
  let sh = img.naturalHeight;

  if (sourceRatio > targetRatio) {
    sw = img.naturalHeight * targetRatio;
    sx = (img.naturalWidth - sw) / 2;
  } else {
    sh = img.naturalWidth / targetRatio;
    sy = (img.naturalHeight - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);
  return canvas;
}

export function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return canvasToBlob(canvas, 'image/png', 1);
}

export function getBaseName(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot > 0 ? filename.slice(0, lastDot) : filename;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
