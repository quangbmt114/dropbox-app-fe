'use client';

/**
 * File Upload Zone Component
 * Drag and drop file upload with Chakra UI and chunking support
 */

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Text,
  VStack,
  Icon,
  BoxProps,
  Button,
  HStack,
  Badge,
  Divider,
} from '@chakra-ui/react';
import { FiUploadCloud, FiX } from 'react-icons/fi';
import { useChunkUpload } from '@/hooks/useChunkUpload';
import { FileUploadProgress } from '@/components/FileUploadProgress';

interface FileUploadZoneProps extends BoxProps {
  onUploadComplete?: (success: boolean) => void;
  onRefreshFiles?: () => void;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onUploadComplete,
  onRefreshFiles,
  ...boxProps
}) => {
  const {
    uploads,
    addFiles,
    pauseUpload,
    resumeUpload,
    cancelUpload,
    retryUpload,
    clearCompleted,
    hasUploads,
    hasActiveUploads,
  } = useChunkUpload();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        console.log('📁 [FileUploadZone] Files dropped:', acceptedFiles.length);

        addFiles(acceptedFiles, (uploadId, success) => {
          console.log(
            `${success ? '✅' : '❌'} [FileUploadZone] Upload ${success ? 'completed' : 'failed'}:`,
            uploadId
          );

          // Notify parent
          onUploadComplete?.(success);

          // Refresh files list after successful upload
          if (success && onRefreshFiles) {
            setTimeout(() => {
              onRefreshFiles();
            }, 500);
          }
        });
      }
    },
    [addFiles, onUploadComplete, onRefreshFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: false, // Always allow new uploads
  });

  const completedCount = uploads.filter((u) => u.status === 'completed').length;
  const errorCount = uploads.filter((u) => u.status === 'error').length;
  const activeCount = uploads.filter(
    (u) => u.status === 'uploading' || u.status === 'paused'
  ).length;

  return (
    <VStack spacing={4} align="stretch" {...boxProps}>
      {/* Upload Drop Zone */}
      <Box
        {...getRootProps()}
        border="2px dashed"
        borderColor={isDragActive ? 'brand.500' : 'gray.300'}
        borderRadius="xl"
        bg={isDragActive ? 'blue.50' : 'white'}
        p={hasUploads ? 8 : 12}
        textAlign="center"
        cursor="pointer"
        transition="all 0.2s"
        _hover={{
          borderColor: 'brand.400',
          bg: 'blue.50',
        }}
      >
        <input {...getInputProps()} />
        <VStack spacing={3}>
          <Icon
            as={FiUploadCloud}
            boxSize={hasUploads ? 12 : 16}
            color={isDragActive ? 'brand.500' : 'gray.400'}
          />
          <VStack spacing={1}>
            <Text fontSize={hasUploads ? 'md' : 'lg'} fontWeight="semibold" color="gray.700">
              {isDragActive ? 'Drop files here' : 'Drop files to upload'}
            </Text>
            <Text fontSize="sm" color="gray.500">
              or click to browse
            </Text>
            {hasUploads && (
              <Text fontSize="xs" color="gray.400" mt={1}>
                You can add more files while uploading
              </Text>
            )}
          </VStack>
        </VStack>
      </Box>

      {/* Upload Progress Section */}
      {hasUploads && (
        <Box>
          {/* Header */}
          <HStack justify="space-between" mb={3}>
            <HStack spacing={2}>
              <Text fontWeight="semibold" fontSize="sm">
                Uploads ({uploads.length})
              </Text>
              {activeCount > 0 && (
                <Badge colorScheme="blue" fontSize="xs">
                  {activeCount} active
                </Badge>
              )}
              {completedCount > 0 && (
                <Badge colorScheme="green" fontSize="xs">
                  {completedCount} completed
                </Badge>
              )}
              {errorCount > 0 && (
                <Badge colorScheme="red" fontSize="xs">
                  {errorCount} failed
                </Badge>
              )}
            </HStack>

            {completedCount > 0 && (
              <Button size="xs" variant="ghost" colorScheme="gray" onClick={clearCompleted}>
                Clear completed
              </Button>
            )}
          </HStack>

          <Divider mb={3} />

          {/* Upload Items */}
          <VStack spacing={2} align="stretch" maxH="400px" overflowY="auto">
            {uploads
              .filter((upload) => upload.status !== 'pending')
              .map((upload) => (
                <FileUploadProgress
                  key={upload.id}
                  fileName={upload.file.name}
                  fileSize={upload.file.size}
                  progress={upload.progress}
                  status={upload.status as 'uploading' | 'paused' | 'completed' | 'error'}
                  error={upload.error}
                  onPause={upload.useChunking ? () => pauseUpload(upload.id) : undefined}
                  onResume={upload.useChunking ? () => resumeUpload(upload.id) : undefined}
                  onCancel={() => cancelUpload(upload.id)}
                  onRetry={
                    upload.status === 'error'
                      ? () =>
                          retryUpload(upload.id, (id, success) => {
                            onUploadComplete?.(success);
                            if (success && onRefreshFiles) {
                              setTimeout(() => onRefreshFiles(), 500);
                            }
                          })
                      : undefined
                  }
                />
              ))}
          </VStack>
        </Box>
      )}
    </VStack>
  );
};
