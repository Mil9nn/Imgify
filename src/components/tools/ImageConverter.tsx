import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Download1Duotone,
  XmarkDuotone,
} from '@lineiconshq/free-icons';
import Icon from '../shared/Icon';
import BulkFileArea from './BulkFileArea';
import UploadDropzone from './UploadDropzone';
import {
  type OutputFormat,
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

const ACCEPTED_TYPES = 'image/png,image/jpeg,image/webp';
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
  const [quality, setQuality] = useState(85);
  const [isConverting, setIsConverting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const format = defaultFormat;
  const filesRef = useRef(files);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

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

  const openFilePicker = () => inputRef.current?.click();

  const workspaceClass =
    files.length > 0 ? 'compressor-workspace--has-files' : 'compressor-workspace--empty';

  return (
    <div className={`compressor-workspace ${workspaceClass}`}>
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
      <aside className="compressor-panel">
        <label
          htmlFor="quality"
          className="type-mono-eyebrow mb-2 flex items-baseline justify-between normal-case"
        >
          <span>Quality</span>
          <span className="font-mono text-ink">{quality}</span>
        </label>
        <input
          id="quality"
          type="range"
          min={10}
          max={100}
          value={quality}
          onChange={(e) => setQuality(Number(e.target.value))}
          disabled={format === 'png'}
          className="compressor-range mb-4 w-full disabled:opacity-50"
        />
        {format === 'png' && (
          <p className="type-caption mb-6 text-amber-700 dark:text-amber-400">
            PNG is lossless — converting from JPG usually makes files much larger. Use WebP for
            smaller output.
          </p>
        )}
        <div className="compressor-actions">
          <button
            type="button"
            onClick={convertAll}
            disabled={isConverting || files.length === 0}
            className="compressor-btn-primary"
          >
            {convertLabel}
          </button>
          {files.length > 0 && (
            <button
              type="button"
              onClick={handleBulkDownload}
              disabled={doneCount === 0}
              className="compressor-btn-secondary inline-flex items-center justify-center gap-2"
            >
              <Icon icon={Download1Duotone} size={18} />
              {bulkDownloadLabel}
            </button>
          )}
        </div>
      </aside>

      <div className="compressor-main space-y-4">
        {files.length === 0 && (
          <UploadDropzone
            isDragging={isDragging}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={openFilePicker}
            primaryText={uploadHint ?? 'Drag images here or click to upload'}
            secondaryText={
              uploadHint
                ? 'or click to browse — bulk upload supported'
                : 'PNG, JPG, WEBP — bulk upload supported'
            }
          />
        )}

      {files.length > 0 && (
        <BulkFileArea fileCount={files.length} doneCount={doneCount} onAddMore={openFilePicker}>
          {files.map((fileEntry) => {
            const sizeComparison =
              fileEntry.convertedSize !== null
                ? getSizeComparison(fileEntry.originalSize, fileEntry.convertedSize)
                : null;
            const isDone = fileEntry.status === 'done';
            const isConvertingFile = fileEntry.status === 'converting';
            const previewUrl = fileEntry.convertedUrl ?? fileEntry.originalUrl;

            return (
              <div key={fileEntry.id} className="compressor-file-card" role="listitem">
                <button
                  type="button"
                  onClick={() => removeFile(fileEntry.id)}
                  className="compressor-file-card-remove"
                  aria-label="Remove file"
                >
                  <Icon icon={XmarkDuotone} size={14} className="text-current" />
                </button>

                <div className="compressor-file-card-preview">
                  <img
                    src={previewUrl}
                    alt={isDone ? 'Converted' : 'Original'}
                    className="h-full w-full object-cover"
                  />
                  {isConvertingFile && (
                    <div className="type-caption absolute inset-0 flex items-center justify-center bg-canvas/80 font-medium text-link backdrop-blur-[2px]">
                      Converting…
                    </div>
                  )}
                  {isDone && <span className="compressor-file-card-badge">Done</span>}
                  {isDone && !isSingle && (
                    <button
                      type="button"
                      onClick={() => downloadSingle(fileEntry)}
                      className="compressor-file-card-download"
                      aria-label="Download"
                    >
                      <Icon icon={Download1Duotone} size={14} />
                    </button>
                  )}
                </div>

                <div className="compressor-file-card-meta">
                  <p className="type-caption truncate font-medium text-ink">
                    {fileEntry.original.name}
                  </p>
                  {fileEntry.status === 'error' ? (
                    <p className="type-caption text-error">{fileEntry.error}</p>
                  ) : isDone && fileEntry.convertedSize !== null ? (
                    <p className="type-caption font-medium text-body">
                      {formatFileSize(fileEntry.convertedSize)}
                      {sizeComparison && (
                        <span
                          className={
                            sizeComparison.tone === 'smaller'
                              ? ' text-green-600'
                              : sizeComparison.tone === 'larger'
                                ? ' text-amber-600'
                                : ' text-mute'
                          }
                        >
                          {' '}
                          ({sizeComparison.label})
                        </span>
                      )}
                    </p>
                  ) : (
                    <p className="type-caption">{formatFileSize(fileEntry.originalSize)}</p>
                  )}
                </div>
              </div>
            );
          })}
        </BulkFileArea>
      )}
      </div>
    </div>
  );
}
