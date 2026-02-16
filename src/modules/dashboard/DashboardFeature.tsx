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
import { authSelectors, authActions } from '@/store/modules/auth';
import { filesSelectors, filesActions } from '@/store/modules/dashboard/files';
import { isAuthenticated } from '@/utils/auth';
import { DashboardLayout } from '@/components/DashboardLayout';
import { FileUploadZone } from './components/FileUploadZone';
import { FileListView } from './components/FileListView';
import { FileGridView } from './components/FileGridView';

export const DashboardFeature = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const toast = useToast();

  // ========== STATE (theo docs/rules.MD) ==========
  const user = useAppSelector(authSelectors.selectUser);
  const files = useAppSelector(filesSelectors.selectFiles);
  const isLoadingFiles = useAppSelector(filesSelectors.selectIsLoading);
  const isUploading = useAppSelector(filesSelectors.selectIsUploading);
  const deletingFileId = useAppSelector(filesSelectors.selectDeletingFileId);

  const [isInitializing, setIsInitializing] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // ========== CALLBACKS ==========
  const handleLogout = useCallback(() => {
    dispatch(authActions.logout());
    router.push('/login');
  }, [dispatch, router]);

  const handleUpload = useCallback(
    async (files: File[]) => {
      for (const file of files) {
        const result = await dispatch(filesActions.uploadFile(file));

        if (result.success) {
          toast({
            title: 'File uploaded',
            description: `${file.name} uploaded successfully`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        } else {
          toast({
            title: 'Upload failed',
            description: result.error || 'Failed to upload file',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      }
    },
    [dispatch, toast]
  );

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
      <Center h="100vh" bg="gray.50">
        <Spinner size="xl" color="brand.500" thickness="4px" />
      </Center>
    );
  }

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
          onUpload={handleUpload}
          isUploading={isUploading}
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
