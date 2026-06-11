import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Download1Duotone,
  Upload1Duotone,
  XmarkDuotone,
} from '@lineiconshq/free-icons';
import Icon from '../shared/Icon';
import {
  downloadBlob,
  formatFileSize,
  getBaseName,
  imagesToPdf,
} from '../../lib/image-utils';

interface PdfFile {
  id: string;
  original: File;
  originalUrl: string;
  originalSize: number;
}

const ACCEPTED_TYPES = 'image/png,image/jpeg,image/webp';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface ImageToPdfProps {
  uploadHint?: string;
}

export default function ImageToPdf({ uploadHint }: ImageToPdfProps) {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfSize, setPdfSize] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef(files);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => {
    return () => {
      filesRef.current.forEach((f) => URL.revokeObjectURL(f.originalUrl));
    };
  }, []);

  const revokeFileUrl = (file: PdfFile) => {
    URL.revokeObjectURL(file.originalUrl);
  };

  const resetPdf = () => {
    setPdfBlob(null);
    setPdfSize(null);
    setError(null);
  };

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const newFiles: PdfFile[] = Array.from(incoming)
      .filter((f) => f.type.startsWith('image/'))
      .map((file) => ({
        id: generateId(),
        original: file,
        originalUrl: URL.createObjectURL(file),
        originalSize: file.size,
      }));

    if (newFiles.length === 0) return;
    resetPdf();
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
      if (file) revokeFileUrl(file);
      return prev.filter((f) => f.id !== id);
    });
    resetPdf();
  };

  const convertToPdf = async () => {
    if (files.length === 0) return;
    setIsConverting(true);
    setError(null);

    try {
      const blob = await imagesToPdf(files.map((f) => f.original));
      setPdfBlob(blob);
      setPdfSize(blob.size);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PDF conversion failed');
      setPdfBlob(null);
      setPdfSize(null);
    } finally {
      setIsConverting(false);
    }
  };

  const downloadPdf = () => {
    if (!pdfBlob) return;
    const baseName =
      files.length === 1 ? getBaseName(files[0].original.name) : 'images';
    downloadBlob(pdfBlob, `${baseName}.pdf`);
  };

  const totalOriginalSize = files.reduce((sum, f) => sum + f.originalSize, 0);
  const hasPdf = pdfBlob !== null;

  const convertLabel = isConverting
    ? 'Creating PDF…'
    : hasPdf
      ? 'Re-create PDF'
      : 'Create PDF';

  return (
    <div className="compressor-workspace">
      <aside className="compressor-panel">
        {files.length > 0 && (
          <div className="compressor-stats mb-6">
            <p className="type-mono-eyebrow mb-1 opacity-60">Pages</p>
            <p className="type-subheading">{files.length}</p>
            {hasPdf && pdfSize !== null && (
              <p className="type-caption mt-2 opacity-70">
                PDF size: {formatFileSize(pdfSize)}
              </p>
            )}
          </div>
        )}
        <div className="space-y-3">
          <button
            type="button"
            onClick={convertToPdf}
            disabled={isConverting || files.length === 0}
            className="compressor-btn-primary"
          >
            {convertLabel}
          </button>
          {files.length > 0 && (
            <button
              type="button"
              onClick={downloadPdf}
              disabled={!hasPdf}
              className="compressor-btn-secondary inline-flex items-center justify-center gap-2"
            >
              <Icon icon={Download1Duotone} size={18} />
              Download PDF
            </button>
          )}
        </div>
      </aside>

      <div className="compressor-main space-y-4">
        {files.length === 0 && (
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
              <Icon icon={Upload1Duotone} size={24} />
            </span>
            <p className="type-label mt-4">
              {uploadHint ?? 'Drag images here or click to upload'}
            </p>
            <p className="type-body-sm mt-1">
              PNG, JPG, WEBP — multiple images become one multi-page PDF
            </p>
          </div>
        )}

      {files.length > 0 && (
        <>
          <div className="compressor-file-grid">
            {files.map((fileEntry, index) => (
              <div key={fileEntry.id} className="compressor-file-card group">
                <button
                  type="button"
                  onClick={() => removeFile(fileEntry.id)}
                  className="absolute right-1.5 top-1.5 z-10 rounded-full bg-canvas/90 p-1 text-mute shadow-sm hover:text-error"
                  aria-label="Remove file"
                >
                  <Icon icon={XmarkDuotone} size={16} className="text-current" />
                </button>

                <div className="compressor-file-card-preview">
                  <img
                    src={fileEntry.originalUrl}
                    alt={`Page ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <span className="compressor-file-card-badge">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                <div className="compressor-file-card-meta">
                  <p className="type-caption truncate font-medium text-ink">
                    {fileEntry.original.name}
                  </p>
                  <p className="type-caption">
                    {formatFileSize(fileEntry.originalSize)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <p className="type-body-sm rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </p>
          )}

          {hasPdf && pdfSize !== null && (
            <p className="type-body-sm text-body">
              {formatFileSize(totalOriginalSize)} of images combined into{' '}
              {formatFileSize(pdfSize)} PDF.
            </p>
          )}
        </>
      )}
      </div>
    </div>
  );
}
