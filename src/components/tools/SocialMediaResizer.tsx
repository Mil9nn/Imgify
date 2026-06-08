import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckDuotone, Download1Duotone, Upload1Duotone } from '@lineiconshq/free-icons';
import Icon from '../shared/Icon';
import {
  canvasToPngBlob,
  downloadBlob,
  loadImageFromFile,
  resizeImageCover,
} from '../../lib/image-utils';

interface Preset {
  key: string;
  label: string;
  width: number;
  height: number;
}

const PRESETS: Preset[] = [
  { key: 'instagram-post', label: 'Instagram Post', width: 1080, height: 1080 },
  { key: 'instagram-story', label: 'Instagram Story', width: 1080, height: 1920 },
  { key: 'youtube-thumbnail', label: 'YouTube Thumbnail', width: 1280, height: 720 },
  { key: 'twitter-header', label: 'Twitter/X Header', width: 1500, height: 500 },
  { key: 'linkedin-cover', label: 'LinkedIn Cover', width: 1584, height: 396 },
  { key: 'facebook-cover', label: 'Facebook Cover', width: 820, height: 312 },
];

interface PresetResult {
  preset: Preset;
  previewUrl: string;
  blob: Blob;
}

export default function SocialMediaResizer() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(PRESETS.map((p) => p.key)),
  );
  const [results, setResults] = useState<PresetResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef(results);
  const sourceUrlRef = useRef(sourceUrl);

  useEffect(() => {
    resultsRef.current = results;
  }, [results]);

  useEffect(() => {
    sourceUrlRef.current = sourceUrl;
  }, [sourceUrl]);

  useEffect(() => {
    return () => {
      if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
      resultsRef.current.forEach((r) => URL.revokeObjectURL(r.previewUrl));
    };
  }, []);

  const clearResults = () => {
    results.forEach((r) => URL.revokeObjectURL(r.previewUrl));
    setResults([]);
  };

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;

    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    clearResults();

    setSourceFile(file);
    setSourceUrl(URL.createObjectURL(file));
  }, [sourceUrl]);

  const togglePreset = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const processSelected = async () => {
    if (!sourceFile || selected.size === 0) return;

    setIsProcessing(true);
    clearResults();

    try {
      const img = await loadImageFromFile(sourceFile);
      const activePresets = PRESETS.filter((p) => selected.has(p.key));
      const newResults: PresetResult[] = [];

      for (const preset of activePresets) {
        const canvas = resizeImageCover(img, preset.width, preset.height);
        const blob = await canvasToPngBlob(canvas);
        const previewUrl = URL.createObjectURL(blob);
        newResults.push({ preset, previewUrl, blob });
        await new Promise((r) => requestAnimationFrame(() => r(undefined)));
      }

      setResults(newResults);
    } catch {
      // silently fail — user can retry
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadZip = async () => {
    if (results.length === 0) return;

    if (results.length === 1) {
      downloadBlob(results[0].blob, `${results[0].preset.key}.png`);
      return;
    }

    const { default: JSZip } = await import('jszip');
    const zip = new JSZip();
    results.forEach((r) => {
      zip.file(`${r.preset.key}.png`, r.blob);
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(blob, 'social-media-images.zip');
  };

  const selectedCount = selected.size;
  const generateLabel = isProcessing
    ? 'Processing…'
    : selectedCount === 1
      ? 'Generate'
      : 'Generate Selected';
  const downloadLabel =
    results.length === 1 ? 'Download' : 'Download Selected as ZIP';

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
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
          isDragging
            ? 'border-violet-500 bg-violet-50'
            : 'border-gray-300 bg-gray-50 hover:border-violet-400 hover:bg-violet-50/50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />
        <div className="mb-3 flex justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-500">
            <Icon icon={Upload1Duotone} size={32} />
          </span>
        </div>
        <p className="font-medium text-gray-900">Upload an image to resize</p>
        <p className="mt-1 text-sm text-gray-500">PNG, JPG, WEBP, and more</p>
        {sourceFile && (
          <p className="mt-2 text-sm font-medium text-violet-600">{sourceFile.name}</p>
        )}
      </div>

      {sourceUrl && (
        <div className="flex justify-center">
          <img
            src={sourceUrl}
            alt="Source preview"
            className="max-h-48 rounded-lg border border-gray-200 object-contain"
          />
        </div>
      )}

      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Select presets</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PRESETS.map((preset) => {
            const isSelected = selected.has(preset.key);
            return (
              <button
                key={preset.key}
                type="button"
                onClick={() => togglePreset(preset.key)}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  isSelected
                    ? 'border-violet-500 bg-violet-50 ring-1 ring-violet-500'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-900">{preset.label}</p>
                    <p className="text-sm text-gray-500">
                      {preset.width} × {preset.height}
                    </p>
                  </div>
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs ${
                      isSelected
                        ? 'border-violet-600 bg-violet-600 text-white'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {isSelected ? <Icon icon={CheckDuotone} size={14} /> : null}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={processSelected}
          disabled={!sourceFile || selected.size === 0 || isProcessing}
          className="rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {generateLabel}
        </button>
        <button
          type="button"
          onClick={downloadZip}
          disabled={results.length === 0}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon icon={Download1Duotone} size={18} />
          {downloadLabel}
        </button>
      </div>

      {results.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((r) => (
            <div
              key={r.preset.key}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white"
            >
              <img
                src={r.previewUrl}
                alt={r.preset.label}
                className="aspect-video w-full object-cover"
              />
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900">{r.preset.label}</p>
                <p className="text-xs text-gray-500">
                  {r.preset.width} × {r.preset.height}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
