'use client';

/**
 * File Upload Zone Component
 * Drag and drop file upload with Chakra UI
 */

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Text,
  VStack,
  Icon,
  BoxProps,
} from '@chakra-ui/react';
import { FiUploadCloud } from 'react-icons/fi';

interface FileUploadZoneProps extends BoxProps {
  onUpload: (files: File[]) => void;
  isUploading: boolean;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onUpload,
  isUploading,
  ...boxProps
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0 && !isUploading) {
        onUpload(acceptedFiles);
      }
    },
    [onUpload, isUploading]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: isUploading,
  });

  return (
    <Box
      {...getRootProps()}
      {...boxProps}
      border="2px dashed"
      borderColor={isDragActive ? 'brand.500' : 'gray.300'}
      borderRadius="xl"
      bg={isDragActive ? 'blue.50' : 'white'}
      p={12}
      textAlign="center"
      cursor={isUploading ? 'not-allowed' : 'pointer'}
      transition="all 0.2s"
      _hover={{
        borderColor: isUploading ? 'gray.300' : 'brand.400',
        bg: isUploading ? 'white' : 'blue.50',
      }}
      opacity={isUploading ? 0.6 : 1}
    >
      <input {...getInputProps()} />
      <VStack spacing={3}>
        <Icon
          as={FiUploadCloud}
          boxSize={16}
          color={isDragActive ? 'brand.500' : 'gray.400'}
        />
        <VStack spacing={1}>
          <Text fontSize="lg" fontWeight="semibold" color="gray.700">
            {isUploading
              ? 'Uploading...'
              : isDragActive
              ? 'Drop files here'
              : 'Drop files to upload'}
          </Text>
          <Text fontSize="sm" color="gray.500">
            or click to browse
          </Text>
        </VStack>
      </VStack>
    </Box>
  );
};

