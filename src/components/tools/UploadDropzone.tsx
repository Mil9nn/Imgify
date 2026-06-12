import { Upload1Duotone } from '@lineiconshq/free-icons';
import Icon from '../shared/Icon';

interface UploadDropzoneProps {
  isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onClick: () => void;
  primaryText: string;
  secondaryText: string;
}

export default function UploadDropzone({
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
  primaryText,
  secondaryText,
}: UploadDropzoneProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
      className={`compressor-dropzone ${isDragging ? 'compressor-dropzone--active' : ''}`}
    >
      <span className="compressor-dropzone-icon">
        <Icon icon={Upload1Duotone} size={24} />
      </span>
      <p className="type-label mt-4">{primaryText}</p>
      <p className="type-body-sm mt-1">{secondaryText}</p>
    </div>
  );
}
