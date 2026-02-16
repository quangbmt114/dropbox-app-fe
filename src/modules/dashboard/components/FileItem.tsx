/**
 * File Item Component
 */

import { FileItem as FileItemType } from '@/api-service';
import { formatFileSize, formatDate } from '@/utils/format';

interface FileItemProps {
  file: FileItemType;
  onDelete: (fileId: string) => void;
  isDeleting: boolean;
}

export const FileItem: React.FC<FileItemProps> = ({
  file,
  onDelete,
  isDeleting,
}) => {
  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    onDelete(file.id);
  };

  return (
    <div
      style={{
        padding: '1rem',
        border: '1px solid #ddd',
        borderRadius: '6px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#fafafa',
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
          {file.filename}
        </div>
        <div style={{ fontSize: '0.85rem', color: '#666' }}>
          {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
        </div>
      </div>

      <button
        onClick={handleDelete}
        disabled={isDeleting}
        style={{
          padding: '0.5rem 1rem',
          background: isDeleting ? '#ccc' : '#f44',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isDeleting ? 'not-allowed' : 'pointer',
          fontWeight: '500',
          fontSize: '0.9rem',
        }}
      >
        {isDeleting ? 'Deleting...' : 'Delete'}
      </button>
    </div>
  );
};

