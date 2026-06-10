export type OutputFormat = 'webp' | 'png' | 'jpg';
export type CompressionMode = 'lossy' | 'lossless';
export type CompressOutputFormat = 'original' | OutputFormat;

export function detectImageFormat(file: File): OutputFormat | null {
  if (file.type === 'image/jpeg') return 'jpg';
  if (file.type === 'image/png') return 'png';
  if (file.type === 'image/webp') return 'webp';
  const ext = file.name.toLowerCase().split('.').pop();
  if (ext === 'jpg' || ext === 'jpeg') return 'jpg';
  if (ext === 'png') return 'png';
  if (ext === 'webp') return 'webp';
  return null;
}

const MIME_TYPES: Record<OutputFormat, string> = {
  webp: 'image/webp',
  png: 'image/png',
  jpg: 'image/jpeg',
};

const EXTENSIONS: Record<OutputFormat, string> = {
  webp: 'webp',
  png: 'png',
  jpg: 'jpg',
};

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

export async function convertImage(
  file: File,
  format: OutputFormat,
  quality: number,
): Promise<Blob> {
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

function imageToDataUrl(img: HTMLImageElement, quality = 0.92): string {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);

  return canvas.toDataURL('image/jpeg', quality);
}

export async function imagesToPdf(files: File[]): Promise<Blob> {
  if (files.length === 0) throw new Error('No images to convert');

  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 36;

  for (let i = 0; i < files.length; i++) {
    if (i > 0) pdf.addPage();

    const img = await loadImageFromFile(files[i]);
    const dataUrl = imageToDataUrl(img);

    const maxWidth = pageWidth - margin * 2;
    const maxHeight = pageHeight - margin * 2;
    const ratio = Math.min(maxWidth / img.naturalWidth, maxHeight / img.naturalHeight);
    const width = img.naturalWidth * ratio;
    const height = img.naturalHeight * ratio;
    const x = (pageWidth - width) / 2;
    const y = (pageHeight - height) / 2;

    pdf.addImage(dataUrl, 'JPEG', x, y, width, height);
  }

  return pdf.output('blob');
}

export function getBaseName(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot > 0 ? filename.slice(0, lastDot) : filename;
}

export function isHeicFile(file: File): boolean {
  const ext = file.name.toLowerCase().split('.').pop();
  return (
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    ext === 'heic' ||
    ext === 'heif'
  );
}

export async function convertHeicToJpg(file: File, quality: number): Promise<Blob> {
  const { default: heic2any } = await import('heic2any');
  const result = await heic2any({
    blob: file,
    toType: 'image/jpeg',
    quality: quality / 100,
  });

  const blob = Array.isArray(result) ? result[0] : result;
  if (!blob) throw new Error('HEIC conversion produced no output');
  return blob;
}

function resolveCompressFormat(
  inputFormat: OutputFormat,
  outputFormat: CompressOutputFormat,
  mode: CompressionMode,
): OutputFormat {
  if (outputFormat !== 'original') return outputFormat;
  if (mode === 'lossy' && inputFormat === 'png') return 'webp';
  return inputFormat;
}

export async function compressImage(
  file: File,
  mode: CompressionMode,
  quality: number,
  outputFormat: CompressOutputFormat = 'original',
): Promise<Blob> {
  const inputFormat = detectImageFormat(file);
  if (!inputFormat) throw new Error('Unsupported image format');

  const targetFormat = resolveCompressFormat(inputFormat, outputFormat, mode);
  const qualityValue =
    mode === 'lossless' || targetFormat === 'png' ? undefined : quality / 100;

  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  if (targetFormat === 'jpg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0);

  const mimeType = getMimeType(targetFormat);
  return canvasToBlob(canvas, mimeType, qualityValue ?? 1);
}

export function getCompressExtension(
  file: File,
  mode: CompressionMode,
  outputFormat: CompressOutputFormat,
): string {
  const inputFormat = detectImageFormat(file);
  if (!inputFormat) return 'bin';
  const target = resolveCompressFormat(inputFormat, outputFormat, mode);
  return getExtension(target);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
