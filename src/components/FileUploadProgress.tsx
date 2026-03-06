/**
 * File Upload Progress Component
 * Displays detailed file upload progress with pause/resume/cancel controls
 * Supports both chunked and direct file uploads
 */

'use client';

import { Box, Progress, Text, HStack, VStack, IconButton, Button, Flex } from '@chakra-ui/react';
import { FiPause, FiPlay, FiX, FiCheck, FiRefreshCw } from 'react-icons/fi';
import { UploadProgress } from '@/utils/chunkUploader';
import { formatDuration, formatFileSize } from '@/utils/format';

interface FileUploadProgressProps {
  fileName: string;
  fileSize: number;
  progress: UploadProgress;
  status: 'uploading' | 'paused' | 'completed' | 'error';
  error?: string;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  onRetry?: () => void;
}

export const FileUploadProgress: React.FC<FileUploadProgressProps> = ({
  fileName,
  fileSize,
  progress,
  status,
  error,
  onPause,
  onResume,
  onCancel,
  onRetry,
}) => {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatSpeed = (bytesPerSecond: number): string => {
    return `${formatBytes(bytesPerSecond)}/s`;
  };

  const getStatusColor = () => {
    switch (status) {
      case 'uploading':
        return 'brand.500';
      case 'paused':
        return 'orange.500';
      case 'completed':
        return 'green.500';
      case 'error':
        return 'red.500';
      default:
        return 'gray.500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'uploading':
        return 'Uploading';
      case 'paused':
        return 'Paused';
      case 'completed':
        return 'Completed';
      case 'error':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  return (
    <Box
      bg="white"
      p={4}
      borderRadius="lg"
      border="1px"
      borderColor="gray.200"
      boxShadow="sm"
      mb={3}
    >
      <VStack align="stretch" spacing={3}>
        {/* Header */}
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={0} flex={1}>
            <Text fontWeight="semibold" fontSize="sm" noOfLines={1}>
              {fileName}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {formatBytes(progress.uploadedBytes)} / {formatBytes(progress.totalBytes)}
            </Text>
            {error && (
              <Text fontSize="xs" color="red.500" noOfLines={1}>
                {error}
              </Text>
            )}
          </VStack>

          {/* Controls */}
          <HStack spacing={1}>
            {status === 'uploading' && onPause && (
              <IconButton
                icon={<FiPause />}
                aria-label="Pause upload"
                size="sm"
                variant="ghost"
                colorScheme="orange"
                onClick={onPause}
              />
            )}
            {status === 'paused' && onResume && (
              <IconButton
                icon={<FiPlay />}
                aria-label="Resume upload"
                size="sm"
                variant="ghost"
                colorScheme="green"
                onClick={onResume}
              />
            )}
            {status === 'completed' && (
              <IconButton
                icon={<FiCheck />}
                aria-label="Completed"
                size="sm"
                variant="ghost"
                colorScheme="green"
                isDisabled
              />
            )}
            {status === 'error' && onRetry && (
              <IconButton
                icon={<FiRefreshCw />}
                aria-label="Retry upload"
                size="sm"
                variant="ghost"
                colorScheme="blue"
                onClick={onRetry}
              />
            )}
            {(status === 'uploading' || status === 'paused' || status === 'error') && onCancel && (
              <IconButton
                icon={<FiX />}
                aria-label="Cancel upload"
                size="sm"
                variant="ghost"
                colorScheme="red"
                onClick={onCancel}
              />
            )}
          </HStack>
        </Flex>

        {/* Progress Bar */}
        <Box>
          <Progress
            value={progress.percentage}
            colorScheme={status === 'error' ? 'red' : status === 'paused' ? 'orange' : 'brand'}
            size="sm"
            borderRadius="full"
            hasStripe={status === 'uploading'}
            isAnimated={status === 'uploading'}
          />
        </Box>

        {/* Details */}
        <Flex justify="space-between" fontSize="xs" color="gray.600">
          <HStack spacing={4} divider={<Text color="gray.300">•</Text>}>
            <Text>{progress.percentage.toFixed(1)}%</Text>
            <Text>
              {progress.uploadedChunks}/{progress.totalChunks} chunks
            </Text>
            <Text color={getStatusColor()} fontWeight="medium">
              {getStatusText()}
            </Text>
          </HStack>

          {status === 'uploading' && (
            <HStack spacing={4} divider={<Text color="gray.300">•</Text>}>
              <Text>{formatSpeed(progress.speed)}</Text>
              <Text>{formatDuration(progress.estimatedTimeRemaining)} remaining</Text>
            </HStack>
          )}
        </Flex>
      </VStack>
    </Box>
  );
};
