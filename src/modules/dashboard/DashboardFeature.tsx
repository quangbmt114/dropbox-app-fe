'use client';

/**
 * Dashboard Feature Module
 * Main dashboard component with Redux integration
 */

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { authSelectors, authActions } from '@/store/modules/auth';
import { filesSelectors, filesActions } from '@/store/modules/dashboard/files';
import { isAuthenticated } from '@/utils/auth';
import { FileUpload } from './components/FileUpload';
import { FileList } from './components/FileList';

export const DashboardFeature = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // ========== STATE (theo docs/rules.MD) ==========
  const user = useAppSelector(authSelectors.selectUser);
  const files = useAppSelector(filesSelectors.selectFiles);
  const isLoadingFiles = useAppSelector(filesSelectors.selectIsLoading);
  const isUploading = useAppSelector(filesSelectors.selectIsUploading);
  const deletingFileId = useAppSelector(filesSelectors.selectDeletingFileId);

  const [isInitializing, setIsInitializing] = useState(true);
  const [uploadError, setUploadError] = useState('');

  // ========== CALLBACKS ==========
  const handleLogout = useCallback(() => {
    dispatch(authActions.logout());
    router.push('/login');
  }, [dispatch, router]);

  const handleUpload = useCallback(
    async (file: File) => {
      setUploadError('');
      const result = await dispatch(filesActions.uploadFile(file));

      if (!result.success) {
        setUploadError(result.error || 'Upload failed');
      }
    },
    [dispatch]
  );

  const handleDelete = useCallback(
    async (fileId: string) => {
      const result = await dispatch(filesActions.deleteFile(fileId));

      if (!result.success) {
        alert(`Failed to delete file: ${result.error}`);
      }
    },
    [dispatch]
  );

  // ========== EFFECTS ==========
  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    // Initialize: fetch user and files
    const initialize = async () => {
      await dispatch(authActions.fetchCurrentUser());
      await dispatch(filesActions.init());
      setIsInitializing(false);
    };

    initialize();

    // Cleanup on unmount
    return () => {
      dispatch(filesActions.destroy());
    };
  }, [dispatch, router]);

  // Loading state
  if (isInitializing) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f5f5f5',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <header
        style={{
          background: 'white',
          borderBottom: '1px solid #ddd',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Dashboard</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '0.5rem 1rem',
            background: '#f44',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500',
          }}
        >
          Logout
        </button>
      </header>

      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* User Info */}
        <div
          style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            marginBottom: '2rem',
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: '1.25rem' }}>Welcome!</h2>
          {user && (
            <p style={{ margin: '0.25rem 0', color: '#666' }}>
              <strong>Email:</strong> {user.email}
            </p>
          )}
        </div>

        {/* File Upload */}
        <FileUpload
          onUpload={handleUpload}
          isUploading={isUploading}
          error={uploadError}
        />

        {/* Files List */}
        <FileList
          files={files}
          isLoading={isLoadingFiles}
          deletingFileId={deletingFileId}
          onDelete={handleDelete}
        />
      </main>
    </div>
  );
};

