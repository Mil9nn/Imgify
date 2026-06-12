import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Download1Duotone,
  XmarkDuotone,
} from '@lineiconshq/free-icons';
import Icon from '../shared/Icon';
import BulkFileArea from './BulkFileArea';
import UploadDropzone from './UploadDropzone';
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
          htmlFor="heic-quality"
          className="type-mono-eyebrow mb-2 flex items-baseline justify-between normal-case"
        >
          <span>JPEG quality</span>
          <span className="font-mono text-ink">{quality}</span>
        </label>
        <input
          id="heic-quality"
          type="range"
          min={10}
          max={100}
          value={quality}
          onChange={(e) => setQuality(Number(e.target.value))}
          className="compressor-range mb-4 w-full"
        />
        <p className="type-caption mb-6">
          85–90 recommended for iPhone photos — balances file size and visual quality.
        </p>
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
            primaryText={uploadHint ?? 'Drag HEIC files here or click to upload'}
            secondaryText=".heic, .heif — bulk upload supported"
          />
        )}

      {files.length > 0 && (
        <BulkFileArea
          fileCount={files.length}
          fileLabel="HEIC files"
          doneCount={doneCount}
          onAddMore={openFilePicker}
        >
          {files.map((fileEntry) => {
            const sizeComparison =
              fileEntry.convertedSize !== null
                ? getSizeComparison(fileEntry.originalSize, fileEntry.convertedSize)
                : null;
            const isDone = fileEntry.status === 'done';
            const isConvertingFile = fileEntry.status === 'converting';
            const showPreview = isDone && fileEntry.convertedUrl;

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
                  {showPreview ? (
                    <img
                      src={fileEntry.convertedUrl!}
                      alt="Converted JPG preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-1 px-1 text-center">
                      <span className="type-format-badge text-caption text-violet-600 dark:text-violet-400">
                        HEIC
                      </span>
                    </div>
                  )}
                  {isConvertingFile && (
                    <div className="type-caption absolute inset-0 flex items-center justify-center bg-canvas/80 font-medium text-link backdrop-blur-[2px]">
                      Converting…
                    </div>
                  )}
                  {isDone && <span className="compressor-file-card-badge">JPG</span>}
                  {isDone && !isSingle && (
                    <button
                      type="button"
                      onClick={() => downloadSingle(fileEntry)}
                      className="compressor-file-card-download"
                      aria-label="Download JPG"
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
