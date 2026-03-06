'use client';

/**
 * Dashboard Feature Module
 * Main dashboard component with Redux integration and Chakra UI
 */

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Heading,
  HStack,
  IconButton,
  Tooltip,
  useToast,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { FiGrid, FiList } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { store } from '@/store';
import { authSelectors, authActions } from '@/store/modules/auth';
import { filesSelectors, filesActions } from '@/store/modules/dashboard/files';
import { dashboardActions } from '@/store/modules/dashboard/actions';
import { isAuthenticated } from '@/utils/auth';
import { DashboardLayout } from '@/components/DashboardLayout';
import { FileUploadZone } from './components/FileUploadZone';
import { FileListView } from './components/FileListView';
import { FileGridView } from './components/FileGridView';

export const DashboardFeature = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const toast = useToast();

  const user = useAppSelector(authSelectors.selectUser);
  const files = useAppSelector(filesSelectors.selectFiles);
  const isLoadingFiles = useAppSelector(filesSelectors.selectIsLoading);
  const isUploading = useAppSelector(filesSelectors.selectIsUploading);
  const deletingFileId = useAppSelector(filesSelectors.selectDeletingFileId);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Debug: Log files changes
  useEffect(() => {
    console.log('📂 [DashboardFeature] Files updated:', {
      count: files.length,
      files: files,
    });
  }, [files]);

  // ========== CALLBACKS ==========
  const handleLogout = useCallback(() => {
    dispatch(authActions.logout());
    router.push('/login');
  }, []);

  const handleUploadComplete = useCallback(
    (success: boolean) => {
      if (success) {
        toast({
          title: 'Upload complete',
          description: 'File uploaded successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Upload failed',
          description: 'Failed to upload file',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    },
    [toast]
  );

  const handleRefreshFiles = useCallback(() => {
    console.log('🔄 [DashboardFeature] Refreshing files...');
    dispatch(filesActions.fetchFiles());
  }, [dispatch]);

  const handleDelete = useCallback(
    async (fileId: string, fileName: string) => {
      const result = await dispatch(filesActions.deleteFile(fileId));

      if (result.success) {
        toast({
          title: 'File deleted',
          description: `${fileName} deleted successfully`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Delete failed',
          description: result.error || 'Failed to delete file',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    },
    [dispatch, toast]
  );

  // ========== EFFECTS ==========
  useEffect(() => {
    dispatch(dashboardActions.initDashboard());

    return () => {
      dispatch(dashboardActions.destroyDashboard());
    };
  }, []);

  return (
    <DashboardLayout
      userEmail={user?.email || ''}
      onLogout={handleLogout}
    >
      <Box>
        {/* Header */}
        <HStack justify="space-between" mb={6}>
          <Heading size="lg">All Files</Heading>
          <HStack spacing={2}>
            <Tooltip label="Grid view">
              <IconButton
                aria-label="Grid view"
                icon={<FiGrid />}
                variant={viewMode === 'grid' ? 'solid' : 'ghost'}
                colorScheme={viewMode === 'grid' ? 'brand' : 'gray'}
                onClick={() => setViewMode('grid')}
              />
            </Tooltip>
            <Tooltip label="List view">
              <IconButton
                aria-label="List view"
                icon={<FiList />}
                variant={viewMode === 'list' ? 'solid' : 'ghost'}
                colorScheme={viewMode === 'list' ? 'brand' : 'gray'}
                onClick={() => setViewMode('list')}
              />
            </Tooltip>
          </HStack>
        </HStack>

        {/* Upload Zone */}
        <FileUploadZone
          onUploadComplete={handleUploadComplete}
          onRefreshFiles={handleRefreshFiles}
          mb={6}
        />

        {/* Files Display */}
        {viewMode === 'grid' ? (
          <FileGridView
            files={files}
            isLoading={isLoadingFiles}
            deletingFileId={deletingFileId}
            onDelete={handleDelete}
          />
        ) : (
          <FileListView
            files={files}
            isLoading={isLoadingFiles}
            deletingFileId={deletingFileId}
            onDelete={handleDelete}
          />
        )}
      </Box>
    </DashboardLayout>
  );
};
