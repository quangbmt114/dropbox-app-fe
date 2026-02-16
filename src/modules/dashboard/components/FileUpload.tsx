/**
 * File Upload Component
 */

import { ChangeEvent } from 'react';

interface FileUploadProps {
  onUpload: (file: File) => void;
  isUploading: boolean;
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  isUploading,
  error,
}) => {
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    onUpload(selectedFile);

    // Clear input
    e.target.value = '';
  };

  return (
    <div
      style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '2rem',
      }}
    >
      <h3 style={{ marginTop: 0, fontSize: '1.1rem' }}>Upload File</h3>

      <div style={{ marginBottom: '1rem' }}>
        <label
          htmlFor="file-upload"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            background: isUploading ? '#ccc' : '#0070f3',
            color: 'white',
            borderRadius: '4px',
            cursor: isUploading ? 'not-allowed' : 'pointer',
            fontWeight: '500',
          }}
        >
          {isUploading ? 'Uploading...' : 'Choose File'}
        </label>
        <input
          id="file-upload"
          type="file"
          onChange={handleFileSelect}
          disabled={isUploading}
          style={{ display: 'none' }}
        />
      </div>

      {error && (
        <div
          style={{
            padding: '0.75rem',
            background: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            color: '#c33',
            fontSize: '0.9rem',
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
};

