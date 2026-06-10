import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Download1Duotone,
  Upload1Duotone,
  XmarkDuotone,
} from '@lineiconshq/free-icons';
import Icon from '../shared/Icon';
import {
  type CompressionMode,
  type CompressOutputFormat,
  compressImage,
  downloadBlob,
  formatFileSize,
  getBaseName,
  getCompressExtension,
  getSizeComparison,
} from '../../lib/image-utils';

interface CompressedFile {
  id: string;
  original: File;
  originalUrl: string;
  compressedBlob: Blob | null;
  compressedUrl: string | null;
  originalSize: number;
  compressedSize: number | null;
  status: 'pending' | 'compressing' | 'done' | 'error';
  error?: string;
}

const ACCEPTED_TYPES = 'image/png,image/jpeg,image/webp';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface ImageCompressorProps {
  uploadHint?: string;
}

export default function ImageCompressor({ uploadHint }: ImageCompressorProps) {
  const [files, setFiles] = useState<CompressedFile[]>([]);
  const [mode, setMode] = useState<CompressionMode>('lossy');
  const [quality, setQuality] = useState(75);
  const [outputFormat, setOutputFormat] = useState<CompressOutputFormat>('original');
  const [isCompressing, setIsCompressing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef(files);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => {
    return () => {
      filesRef.current.forEach((f) => {
        URL.revokeObjectURL(f.originalUrl);
        if (f.compressedUrl) URL.revokeObjectURL(f.compressedUrl);
      });
    };
  }, []);

  const revokeFileUrls = (file: CompressedFile) => {
    URL.revokeObjectURL(file.originalUrl);
    if (file.compressedUrl) URL.revokeObjectURL(file.compressedUrl);
  };

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const newFiles: CompressedFile[] = Array.from(incoming)
      .filter((f) => f.type.startsWith('image/'))
      .map((file) => ({
        id: generateId(),
        original: file,
        originalUrl: URL.createObjectURL(file),
        compressedBlob: null,
        compressedUrl: null,
        originalSize: file.size,
        compressedSize: null,
        status: 'pending' as const,
      }));

    if (newFiles.length === 0) return;
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
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

  const compressSingle = async (
    fileEntry: CompressedFile,
    compressionMode: CompressionMode,
    compressionQuality: number,
    format: CompressOutputFormat,
  ): Promise<CompressedFile> => {
    try {
      const blob = await compressImage(
        fileEntry.original,
        compressionMode,
        compressionQuality,
        format,
      );
      const compressedUrl = URL.createObjectURL(blob);
      if (fileEntry.compressedUrl) URL.revokeObjectURL(fileEntry.compressedUrl);

      return {
        ...fileEntry,
        compressedBlob: blob,
        compressedUrl,
        compressedSize: blob.size,
        status: 'done',
        error: undefined,
      };
    } catch (err) {
      return {
        ...fileEntry,
        status: 'error',
        error: err instanceof Error ? err.message : 'Compression failed',
      };
    }
  };

  const compressAll = async () => {
    if (files.length === 0) return;
    setIsCompressing(true);

    const updated = [...files];
    for (let i = 0; i < updated.length; i++) {
      updated[i] = { ...updated[i], status: 'compressing' };
      setFiles([...updated]);

      updated[i] = await compressSingle(updated[i], mode, quality, outputFormat);
      setFiles([...updated]);

      await new Promise((r) => requestAnimationFrame(() => r(undefined)));
    }

    setIsCompressing(false);
  };

  const downloadSingle = (fileEntry: CompressedFile) => {
    if (!fileEntry.compressedBlob) return;
    const ext = getCompressExtension(fileEntry.original, mode, outputFormat);
    const name = `${getBaseName(fileEntry.original.name)}.${ext}`;
    downloadBlob(fileEntry.compressedBlob, name);
  };

  const downloadAllZip = async () => {
    const doneFiles = files.filter((f) => f.compressedBlob);
    if (doneFiles.length === 0) return;

    const { default: JSZip } = await import('jszip');
    const zip = new JSZip();
    const nameCounts = new Map<string, number>();

    doneFiles.forEach((fileEntry) => {
      if (!fileEntry.compressedBlob) return;
      const base = getBaseName(fileEntry.original.name);
      const ext = getCompressExtension(fileEntry.original, mode, outputFormat);
      const count = (nameCounts.get(base) ?? 0) + 1;
      nameCounts.set(base, count);
      const filename = count > 1 ? `${base}-${count}.${ext}` : `${base}.${ext}`;
      zip.file(filename, fileEntry.compressedBlob);
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(blob, 'compressed-images.zip');
  };

  const doneCount = files.filter((f) => f.status === 'done').length;
  const hasPending = files.some((f) => f.status === 'pending');
  const isSingle = files.length === 1;

  const totals = useMemo(() => {
    const done = files.filter((f) => f.status === 'done' && f.compressedSize !== null);
    const original = done.reduce((sum, f) => sum + f.originalSize, 0);
    const compressed = done.reduce((sum, f) => sum + (f.compressedSize ?? 0), 0);
    return { original, compressed, count: done.length };
  }, [files]);

  const compressLabel = isCompressing
    ? 'Compressing…'
    : hasPending
      ? isSingle
        ? 'Compress'
        : 'Compress all'
      : isSingle
        ? 'Re-compress'
        : 'Re-compress all';

  const handleBulkDownload = () => {
    if (isSingle && doneCount === 1) {
      const file = files.find((f) => f.compressedBlob);
      if (file) downloadSingle(file);
      return;
    }
    downloadAllZip();
  };

  const bulkDownloadLabel = isSingle ? 'Download' : `Download ZIP (${doneCount})`;

  return (
    <div className="compressor-workspace">
      <aside className="compressor-panel">
        <p className="type-mono-eyebrow mb-4">Compression settings</p>

        <fieldset className="mb-6">
          <legend className="type-label mb-2 block">Mode</legend>
          <div className="flex gap-1 rounded-full border border-hairline bg-canvas p-1">
            {(['lossy', 'lossless'] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                className={`type-button flex-1 rounded-full px-4 py-2 transition-colors ${
                  mode === value
                    ? 'bg-primary text-on-primary'
                    : 'text-body hover:text-ink'
                }`}
              >
                {value === 'lossy' ? 'Lossy' : 'Lossless'}
              </button>
            ))}
          </div>
          <p className="type-caption mt-2">
            {mode === 'lossy'
              ? 'Re-encode at a lower quality for smaller files.'
              : 'Preserve maximum quality — PNG stays lossless.'}
          </p>
        </fieldset>

        <div className="mb-6">
          <label htmlFor="compress-quality" className="type-label mb-2 flex items-baseline justify-between">
            <span>Quality</span>
            <span className="font-mono text-ink">{mode === 'lossless' ? '100' : quality}%</span>
          </label>
          <input
            id="compress-quality"
            type="range"
            min={10}
            max={100}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            disabled={mode === 'lossless'}
            className="compressor-range w-full"
          />
          <div className="type-caption mt-1.5 flex justify-between">
            <span>Smaller file</span>
            <span>Higher quality</span>
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="compress-format" className="type-label mb-2 block">
            Output format
          </label>
          <select
            id="compress-format"
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value as CompressOutputFormat)}
            className="compressor-select w-full"
          >
            <option value="original">
              {mode === 'lossy' ? 'Auto (PNG → WebP)' : 'Keep original'}
            </option>
            <option value="jpg">JPEG</option>
            <option value="webp">WebP</option>
            <option value="png">PNG</option>
          </select>
        </div>

        {totals.count > 0 && (
          <div className="compressor-stats mb-6">
            <p className="type-mono-eyebrow mb-3 opacity-60">Session savings</p>
            <p className="text-display-sm font-semibold tracking-tight">
              {totals.compressed < totals.original
                ? `${Math.round((1 - totals.compressed / totals.original) * 100)}% smaller`
                : 'No reduction yet'}
            </p>
            <p className="type-caption mt-1 font-mono opacity-70">
              {formatFileSize(totals.original)} → {formatFileSize(totals.compressed)}
            </p>
          </div>
        )}

        {files.length > 0 && (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={compressAll}
              disabled={isCompressing || files.length === 0}
              className="compressor-btn-primary"
            >
              {compressLabel}
            </button>
            <button
              type="button"
              onClick={handleBulkDownload}
              disabled={doneCount === 0}
              className="compressor-btn-secondary inline-flex items-center justify-center gap-2"
            >
              <Icon icon={Download1Duotone} size={18} />
              {bulkDownloadLabel}
            </button>
          </div>
        )}
      </aside>

      <div className="compressor-main space-y-4">
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
          className={`compressor-dropzone ${isDragging ? 'compressor-dropzone--active' : ''}`}
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
          <span className="compressor-dropzone-icon">
            <Icon icon={Upload1Duotone} size={28} />
          </span>
          <p className="type-label mt-4">
            {uploadHint ?? 'Drop images here or click to browse'}
          </p>
          <p className="type-body-sm mt-1">
            PNG, JPG, WebP — processed locally in your browser
          </p>
        </div>

        {files.length > 0 && (
          <div className="compressor-file-list">
            <div className="compressor-file-header">
              <span>File</span>
              <span>Original</span>
              <span>Compressed</span>
              <span>Savings</span>
              <span className="sr-only">Actions</span>
            </div>

            {files.map((fileEntry) => {
              const comparison =
                fileEntry.compressedSize !== null
                  ? getSizeComparison(fileEntry.originalSize, fileEntry.compressedSize)
                  : null;
              const savingsPct =
                fileEntry.compressedSize !== null && fileEntry.compressedSize < fileEntry.originalSize
                  ? Math.round((1 - fileEntry.compressedSize / fileEntry.originalSize) * 100)
                  : 0;
              const isDone = fileEntry.status === 'done';
              const isActive = fileEntry.status === 'compressing';

              return (
                <div key={fileEntry.id} className="compressor-file-row group">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="checkerboard h-10 w-10 shrink-0 overflow-hidden rounded-md ring-1 ring-hairline">
                      <img
                        src={fileEntry.compressedUrl ?? fileEntry.originalUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="type-body-sm truncate font-medium text-ink">
                        {fileEntry.original.name}
                      </p>
                      {fileEntry.status === 'error' ? (
                        <p className="type-caption text-error">{fileEntry.error}</p>
                      ) : isActive ? (
                        <p className="type-caption font-mono text-link">compressing…</p>
                      ) : null}
                    </div>
                  </div>

                  <p className="type-caption font-mono text-body">
                    {formatFileSize(fileEntry.originalSize)}
                  </p>

                  <p className="type-caption font-mono text-ink">
                    {isDone && fileEntry.compressedSize !== null
                      ? formatFileSize(fileEntry.compressedSize)
                      : '—'}
                  </p>

                  <div className="flex items-center gap-2">
                    {isDone && comparison ? (
                      <>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-canvas-soft-2">
                          <div
                            className={`h-full rounded-full transition-all ${
                              comparison.tone === 'smaller' ? 'bg-link' : 'bg-mute'
                            }`}
                            style={{ width: `${Math.max(savingsPct, 4)}%` }}
                          />
                        </div>
                        <span
                          className={`type-caption shrink-0 font-mono ${
                            comparison.tone === 'smaller' ? 'text-link' : 'text-mute'
                          }`}
                        >
                          {comparison.label}
                        </span>
                      </>
                    ) : (
                      <span className="type-caption text-mute">—</span>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-1">
                    {isDone && (
                      <button
                        type="button"
                        onClick={() => downloadSingle(fileEntry)}
                        className="compressor-icon-btn"
                        aria-label="Download"
                      >
                        <Icon icon={Download1Duotone} size={16} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(fileEntry.id)}
                      className="compressor-icon-btn text-mute hover:text-error"
                      aria-label="Remove file"
                    >
                      <Icon icon={XmarkDuotone} size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
