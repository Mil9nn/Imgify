import type { ReactNode } from 'react';
import { PlusDuotone } from '@lineiconshq/free-icons';
import Icon from '../shared/Icon';

interface BulkFileAreaProps {
  fileCount: number;
  fileLabel?: string;
  doneCount?: number;
  progressVerb?: string;
  onAddMore: () => void;
  addMoreLabel?: string;
  children: ReactNode;
}

export default function BulkFileArea({
  fileCount,
  fileLabel = 'files',
  doneCount,
  progressVerb = 'converted',
  onAddMore,
  addMoreLabel = 'Add more',
  children,
}: BulkFileAreaProps) {
  const label = fileCount === 1 ? fileLabel.replace(/s$/, '') : fileLabel;

  return (
    <div className="compressor-file-area">
      <div className="compressor-file-strip-header">
        <p className="type-label">
          {fileCount} {label}
          {doneCount !== undefined && (
            <span className="font-normal opacity-70">
              {' '}
              · {doneCount} / {fileCount} {progressVerb}
            </span>
          )}
        </p>
        <button type="button" onClick={onAddMore} className="compressor-add-more-btn">
          <Icon icon={PlusDuotone} size={16} />
          {addMoreLabel}
        </button>
      </div>
      <div className="compressor-file-strip" role="list">
        {children}
        <button
          type="button"
          onClick={onAddMore}
          className="compressor-file-strip-add"
          aria-label={addMoreLabel}
        >
          <Icon icon={PlusDuotone} size={22} />
          <span className="type-caption">{addMoreLabel}</span>
        </button>
      </div>
    </div>
  );
}
