/**
 * File List Component
 */

import { FileItem as FileItemType } from '@/api-service';
import { FileItem } from './FileItem';

interface FileListProps {
  files: FileItemType[];
  isLoading: boolean;
  deletingFileId: string | null;
  onDelete: (fileId: string) => void;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  isLoading,
  deletingFileId,
  onDelete,
}) => {
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
        Loading files...
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      }}
    >
      <h3
        style={{
          marginTop: 0,
          fontSize: '1.1rem',
          marginBottom: '1.5rem',
        }}
      >
        Your Files ({files.length})
      </h3>

      {files.length === 0 ? (
        <p
          style={{
            color: '#666',
            textAlign: 'center',
            padding: '2rem 0',
          }}
        >
          No files uploaded yet. Upload your first file above!
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {files.map((file) => (
            <FileItem
              key={file.id}
              file={file}
              onDelete={onDelete}
              isDeleting={deletingFileId === file.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

