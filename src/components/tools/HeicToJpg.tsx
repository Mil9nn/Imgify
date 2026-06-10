import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Download1Duotone,
  Upload1Duotone,
  XmarkDuotone,
} from '@lineiconshq/free-icons';
import Icon from '../shared/Icon';
import {
  convertHeicToJpg,
  downloadBlob,
  formatFileSize,
  getBaseName,
  getSizeComparison,
  isHeicFile,
} from '../../lib/image-utils';

interface ConvertedFile {
  id: string;
  original: File;
  convertedBlob: Blob | null;
  convertedUrl: string | null;
  originalSize: number;
  convertedSize: number | null;
  status: 'pending' | 'converting' | 'done' | 'error';
  error?: string;
}

const ACCEPTED_TYPES = '.heic,.heif,image/heic,image/heif';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface HeicToJpgProps {
  uploadHint?: string;
}

export default function HeicToJpg({ uploadHint }: HeicToJpgProps) {
  const [files, setFiles] = useState<ConvertedFile[]>([]);
  const [quality, setQuality] = useState(85);
  const [isConverting, setIsConverting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef(files);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => {
    return () => {
      filesRef.current.forEach((f) => {
        if (f.convertedUrl) URL.revokeObjectURL(f.convertedUrl);
      });
    };
  }, []);

  const revokeConvertedUrl = (file: ConvertedFile) => {
    if (file.convertedUrl) URL.revokeObjectURL(file.convertedUrl);
  };

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const newFiles: ConvertedFile[] = Array.from(incoming)
      .filter(isHeicFile)
      .map((file) => ({
        id: generateId(),
        original: file,
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
      if (file) revokeConvertedUrl(file);
      return prev.filter((f) => f.id !== id);
    });
  };

  const convertSingle = async (
    fileEntry: ConvertedFile,
    outputQuality: number,
  ): Promise<ConvertedFile> => {
    try {
      const blob = await convertHeicToJpg(fileEntry.original, outputQuality);
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

      updated[i] = await convertSingle(updated[i], quality);
      setFiles([...updated]);

      await new Promise((r) => requestAnimationFrame(() => r(undefined)));
    }

    setIsConverting(false);
  };

  const downloadSingle = (fileEntry: ConvertedFile) => {
    if (!fileEntry.convertedBlob) return;
    const name = `${getBaseName(fileEntry.original.name)}.jpg`;
    downloadBlob(fileEntry.convertedBlob, name);
  };

  const downloadAllZip = async () => {
    const doneFiles = files.filter((f) => f.convertedBlob);
    if (doneFiles.length === 0) return;

    const { default: JSZip } = await import('jszip');
    const zip = new JSZip();
    const nameCounts = new Map<string, number>();

    doneFiles.forEach((fileEntry) => {
      if (!fileEntry.convertedBlob) return;
      const base = getBaseName(fileEntry.original.name);
      const count = (nameCounts.get(base) ?? 0) + 1;
      nameCounts.set(base, count);
      const filename = count > 1 ? `${base}-${count}.jpg` : `${base}.jpg`;
      zip.file(filename, fileEntry.convertedBlob);
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(blob, 'heic-to-jpg.zip');
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

  const bulkDownloadLabel = isSingle ? 'Download JPG' : `Download All as ZIP (${doneCount})`;

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
            ? 'border-violet-500 bg-violet-500/10'
            : 'border-hairline bg-canvas-soft hover:border-violet-400/60 hover:bg-violet-500/5'
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
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
            <Icon icon={Upload1Duotone} size={32} />
          </span>
        </div>
        <p className="type-label">
          {uploadHint ?? 'Drag HEIC files here or click to upload'}
        </p>
        <p className="type-body-sm mt-1">
          {files.length > 0
            ? '.heic, .heif — click to add more files'
            : '.heic, .heif — bulk upload supported, free HEIC to JPG converter'}
        </p>
      </div>

      <div className="rounded-xl border border-hairline bg-canvas p-5">
        <label htmlFor="heic-quality" className="type-label mb-1 block">
          JPEG quality: {quality}
        </label>
        <input
          id="heic-quality"
          type="range"
          min={10}
          max={100}
          value={quality}
          onChange={(e) => setQuality(Number(e.target.value))}
          className="w-full accent-violet-600"
        />
        <p className="type-caption mt-1">
          85–90 recommended for iPhone photos — balances file size and visual quality.
        </p>
      </div>

      {files.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {files.map((fileEntry) => {
              const sizeComparison =
                fileEntry.convertedSize !== null
                  ? getSizeComparison(fileEntry.originalSize, fileEntry.convertedSize)
                  : null;
              const isDone = fileEntry.status === 'done';
              const isConvertingFile = fileEntry.status === 'converting';
              const showPreview = isDone && fileEntry.convertedUrl;

              return (
                <div
                  key={fileEntry.id}
                  className="group relative overflow-hidden rounded-xl border border-hairline bg-canvas"
                >
                  <button
                    type="button"
                    onClick={() => removeFile(fileEntry.id)}
                    className="absolute right-1.5 top-1.5 z-10 rounded-full bg-canvas/90 p-1 text-mute shadow-sm hover:text-error"
                    aria-label="Remove file"
                  >
                    <Icon icon={XmarkDuotone} size={16} className="text-current" />
                  </button>

                  <div className="relative aspect-square bg-canvas-soft">
                    {showPreview ? (
                      <img
                        src={fileEntry.convertedUrl!}
                        alt="Converted JPG preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-1 px-2 text-center">
                        <span className="type-caption font-semibold uppercase tracking-wide text-violet-600">
                          HEIC
                        </span>
                        <span className="type-caption line-clamp-2">
                          {fileEntry.original.name}
                        </span>
                      </div>
                    )}
                    {isConvertingFile && (
                      <div className="type-caption absolute inset-0 flex items-center justify-center bg-canvas/70 font-medium text-violet-600 dark:text-violet-400">
                        Converting…
                      </div>
                    )}
                    {isDone && (
                      <span className="type-caption absolute bottom-1.5 left-1.5 rounded bg-green-600/90 px-1.5 py-0.5 font-medium text-white">
                        JPG
                      </span>
                    )}
                    {isDone && !isSingle && (
                      <button
                        type="button"
                        onClick={() => downloadSingle(fileEntry)}
                        className="absolute bottom-1.5 right-1.5 rounded bg-violet-600 p-1.5 text-white opacity-0 shadow-sm transition-opacity hover:bg-violet-700 group-hover:opacity-100"
                        aria-label="Download JPG"
                      >
                        <Icon icon={Download1Duotone} size={14} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-0.5 p-2">
                    <p className="type-caption truncate font-medium text-ink">
                      {fileEntry.original.name}
                    </p>
                    {fileEntry.status === 'error' ? (
                      <p className="type-caption text-red-600">{fileEntry.error}</p>
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
                      <p className="type-caption">
                        {formatFileSize(fileEntry.originalSize)}
                      </p>
                    )}
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
              className="type-button rounded-lg bg-violet-600 px-6 py-2.5 text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {convertLabel}
            </button>
            <button
              type="button"
              onClick={handleBulkDownload}
              disabled={doneCount === 0}
              className="type-button inline-flex items-center gap-2 rounded-lg border border-hairline bg-canvas px-6 py-2.5 text-ink hover:bg-canvas-soft disabled:cursor-not-allowed disabled:opacity-50"
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
