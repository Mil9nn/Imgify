import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowRightDuotone,
  Download1Duotone,
  Upload1Duotone,
  XmarkDuotone,
} from '@lineiconshq/free-icons';
import Icon from '../shared/Icon';
import {
  type OutputFormat,
  checkAvifSupport,
  convertImage,
  downloadBlob,
  formatFileSize,
  getBaseName,
  getExtension,
  getSizeComparison,
} from '../../lib/image-utils';

interface ConvertedFile {
  id: string;
  original: File;
  originalUrl: string;
  convertedBlob: Blob | null;
  convertedUrl: string | null;
  originalSize: number;
  convertedSize: number | null;
  status: 'pending' | 'converting' | 'done' | 'error';
  error?: string;
}

const ACCEPTED_TYPES = 'image/png,image/jpeg,image/webp,image/avif';
const OUTPUT_FORMATS: OutputFormat[] = ['webp', 'png', 'jpg', 'avif'];

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface ImageConverterProps {
  defaultFormat?: OutputFormat;
  uploadHint?: string;
}

export default function ImageConverter({
  defaultFormat = 'webp',
  uploadHint,
}: ImageConverterProps) {
  const [files, setFiles] = useState<ConvertedFile[]>([]);
  const [format, setFormat] = useState<OutputFormat>(defaultFormat);
  const [quality, setQuality] = useState(85);
  const [isConverting, setIsConverting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [avifAvailable, setAvifAvailable] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef(files);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => {
    checkAvifSupport().then(setAvifAvailable);
  }, []);

  useEffect(() => {
    setFormat(defaultFormat);
  }, [defaultFormat]);

  useEffect(() => {
    return () => {
      filesRef.current.forEach((f) => {
        URL.revokeObjectURL(f.originalUrl);
        if (f.convertedUrl) URL.revokeObjectURL(f.convertedUrl);
      });
    };
  }, []);

  const revokeFileUrls = (file: ConvertedFile) => {
    URL.revokeObjectURL(file.originalUrl);
    if (file.convertedUrl) URL.revokeObjectURL(file.convertedUrl);
  };

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const newFiles: ConvertedFile[] = Array.from(incoming)
      .filter((f) => f.type.startsWith('image/'))
      .map((file) => ({
        id: generateId(),
        original: file,
        originalUrl: URL.createObjectURL(file),
        convertedBlob: null,
        convertedUrl: null,
        originalSize: file.size,
        convertedSize: null,
        status: 'pending' as const,
      }));

    if (newFiles.length === 0) return;
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles],
  );

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) revokeFileUrls(file);
      return prev.filter((f) => f.id !== id);
    });
  };

  const convertSingle = async (
    fileEntry: ConvertedFile,
    outputFormat: OutputFormat,
    outputQuality: number,
  ): Promise<ConvertedFile> => {
    try {
      const blob = await convertImage(
        fileEntry.original,
        outputFormat,
        outputQuality,
      );
      const convertedUrl = URL.createObjectURL(blob);
      if (fileEntry.convertedUrl) URL.revokeObjectURL(fileEntry.convertedUrl);

      return {
        ...fileEntry,
        convertedBlob: blob,
        convertedUrl,
        convertedSize: blob.size,
        status: 'done',
        error: undefined,
      };
    } catch (err) {
      return {
        ...fileEntry,
        status: 'error',
        error: err instanceof Error ? err.message : 'Conversion failed',
      };
    }
  };

  const convertAll = async () => {
    if (files.length === 0) return;
    setIsConverting(true);

    const updated = [...files];
    for (let i = 0; i < updated.length; i++) {
      updated[i] = { ...updated[i], status: 'converting' };
      setFiles([...updated]);

      updated[i] = await convertSingle(updated[i], format, quality);
      setFiles([...updated]);

      await new Promise((r) => requestAnimationFrame(() => r(undefined)));
    }

    setIsConverting(false);
  };

  const downloadSingle = (fileEntry: ConvertedFile) => {
    if (!fileEntry.convertedBlob) return;
    const ext = getExtension(format);
    const name = `${getBaseName(fileEntry.original.name)}.${ext}`;
    downloadBlob(fileEntry.convertedBlob, name);
  };

  const downloadAllZip = async () => {
    const doneFiles = files.filter((f) => f.convertedBlob);
    if (doneFiles.length === 0) return;

    const { default: JSZip } = await import('jszip');
    const zip = new JSZip();
    const ext = getExtension(format);
    const nameCounts = new Map<string, number>();

    doneFiles.forEach((fileEntry) => {
      if (!fileEntry.convertedBlob) return;
      const base = getBaseName(fileEntry.original.name);
      const count = (nameCounts.get(base) ?? 0) + 1;
      nameCounts.set(base, count);
      const filename =
        count > 1 ? `${base}-${count}.${ext}` : `${base}.${ext}`;
      zip.file(filename, fileEntry.convertedBlob);
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(blob, 'converted-images.zip');
  };

  const doneCount = files.filter((f) => f.status === 'done').length;
  const hasPending = files.some((f) => f.status === 'pending');
  const isSingle = files.length === 1;

  const convertLabel = isConverting
    ? 'Converting…'
    : hasPending
      ? isSingle
        ? 'Convert'
        : 'Convert All'
      : isSingle
        ? 'Re-convert'
        : 'Re-convert All';

  const handleBulkDownload = () => {
    if (isSingle && doneCount === 1) {
      const file = files.find((f) => f.convertedBlob);
      if (file) downloadSingle(file);
      return;
    }
    downloadAllZip();
  };

  const bulkDownloadLabel = isSingle ? 'Download' : `Download All as ZIP (${doneCount})`;

  return (
    <div className="space-y-6">
      <div
        role="button"
        tabIndex={0}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = '';
          }}
        />
        <div className="mb-3 flex justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
            <Icon icon={Upload1Duotone} size={32} />
          </span>
        </div>
        <p className="font-medium text-gray-900">
          {uploadHint ?? 'Drag images here or click to upload'}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          {uploadHint
            ? files.length > 0
              ? 'or click to add more images'
              : 'or click to browse — bulk upload supported'
            : files.length > 0
              ? 'PNG, JPG, WEBP, AVIF — click to add more'
              : 'PNG, JPG, WEBP, AVIF — bulk upload supported'}
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-6 rounded-xl border border-gray-200 bg-white p-5">
        <div>
          <label htmlFor="format" className="mb-1 block text-sm font-medium text-gray-700">
            Convert to
          </label>
          <select
            id="format"
            value={format}
            onChange={(e) => setFormat(e.target.value as OutputFormat)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {OUTPUT_FORMATS.map((f) => (
              <option key={f} value={f} disabled={f === 'avif' && !avifAvailable}>
                {f.toUpperCase()}
                {f === 'avif' && !avifAvailable ? ' (unsupported)' : ''}
              </option>
            ))}
          </select>
          {uploadHint && (
            <p className="mt-1 max-w-[12rem] text-xs text-gray-500">
              {defaultFormat.toUpperCase()} is pre-selected for this page. Change format anytime.
            </p>
          )}
        </div>

        <div className="min-w-[200px] flex-1">
          <label htmlFor="quality" className="mb-1 block text-sm font-medium text-gray-700">
            Quality: {quality}
          </label>
          <input
            id="quality"
            type="range"
            min={10}
            max={100}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            disabled={format === 'png'}
            className="w-full accent-blue-600 disabled:opacity-50"
          />
          {format === 'png' && (
            <p className="mt-1 text-xs text-amber-700">
              PNG is lossless — converting from JPG usually makes files much larger. Use WebP for
              smaller output.
            </p>
          )}
        </div>
      </div>

      {files.length > 0 && (
        <>
          <div className="space-y-4">
            {files.map((fileEntry) => {
              const sizeComparison =
                fileEntry.convertedSize !== null
                  ? getSizeComparison(fileEntry.originalSize, fileEntry.convertedSize)
                  : null;

              return (
                <div
                  key={fileEntry.id}
                  className="rounded-xl border border-gray-200 bg-white p-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {fileEntry.original.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeFile(fileEntry.id)}
                      className="shrink-0 text-sm text-gray-400 hover:text-red-500"
                      aria-label="Remove file"
                    >
                      <Icon icon={XmarkDuotone} size={18} className="text-current" />
                    </button>
                  </div>

                  <div className="flex flex-col items-center gap-4 sm:flex-row">
                    <div className="text-center">
                      <img
                        src={fileEntry.originalUrl}
                        alt="Original"
                        className="h-24 w-24 rounded-lg border border-gray-100 object-cover"
                      />
                      <p className="mt-1 text-xs text-gray-500">Original</p>
                      <p className="text-xs font-medium text-gray-700">
                        {formatFileSize(fileEntry.originalSize)}
                      </p>
                    </div>

                    <Icon icon={ArrowRightDuotone} size={24} className="text-gray-300" />

                    <div className="text-center">
                      {fileEntry.convertedUrl ? (
                        <img
                          src={fileEntry.convertedUrl}
                          alt="Converted"
                          className="h-24 w-24 rounded-lg border border-gray-100 object-cover"
                        />
                      ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 text-xs text-gray-400">
                          {fileEntry.status === 'converting' ? 'Converting…' : 'Preview'}
                        </div>
                      )}
                      <p className="mt-1 text-xs text-gray-500">Converted</p>
                      {fileEntry.convertedSize !== null && (
                        <p className="text-xs font-medium text-gray-700">
                          {formatFileSize(fileEntry.convertedSize)}
                          {sizeComparison && (
                            <span
                              className={
                                sizeComparison.tone === 'smaller'
                                  ? ' text-green-600'
                                  : sizeComparison.tone === 'larger'
                                    ? ' text-amber-600'
                                    : ' text-gray-500'
                              }
                            >
                              {' '}
                              ({sizeComparison.label})
                            </span>
                          )}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col items-end gap-2 sm:ml-auto">
                      {fileEntry.status === 'error' && (
                        <p className="text-right text-xs text-red-600">{fileEntry.error}</p>
                      )}
                      {fileEntry.status === 'done' && !isSingle && (
                        <button
                          type="button"
                          onClick={() => downloadSingle(fileEntry)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                          <Icon icon={Download1Duotone} size={16} />
                          Download
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={convertAll}
              disabled={isConverting || files.length === 0}
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {convertLabel}
            </button>
            <button
              type="button"
              onClick={handleBulkDownload}
              disabled={doneCount === 0}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon icon={Download1Duotone} size={18} />
              {bulkDownloadLabel}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
