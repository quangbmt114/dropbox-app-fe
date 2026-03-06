'use client';

/**
 * File Preview Modal
 * Preview images, videos, audio, and PDFs
 */

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Box,
  Image,
  AspectRatio,
  Text,
  Center,
  Spinner,
  Icon,
  VStack,
  Button,
  HStack,
} from '@chakra-ui/react';
import { FiDownload, FiFile, FiExternalLink } from 'react-icons/fi';
import { FileItem } from '@/api-service';
import { isImage, isVideo, isAudio, isPDF, getFileType } from '@/utils/fileUtils';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileItem | null;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  onClose,
  file,
}) => {
  if (!file) return null;

  const handleDownload = () => {
    if (file.url) {
      window.open(file.url, '_blank');
    }
  };

  const renderPreview = () => {
    if (!file.url) {
      return (
        <Center h="400px">
          <VStack spacing={4}>
            <Icon as={FiFile} boxSize={16} color="gray.400" />
            <Text color="gray.500">Preview not available</Text>
          </VStack>
        </Center>
      );
    }

    // Image Preview
    if (isImage(file.filename)) {
      return (
        <Box position="relative">
          <Image
            src={file.url}
            alt={file.filename}
            maxH="70vh"
            objectFit="contain"
            mx="auto"
            fallback={
              <Center h="400px">
                <Spinner size="xl" color="brand.500" />
              </Center>
            }
          />
        </Box>
      );
    }

    // Video Preview
    if (isVideo(file.filename)) {
      return (
        <AspectRatio ratio={16 / 9} maxH="70vh">
          <video
            controls
            style={{ width: '100%', height: '100%', backgroundColor: '#000' }}
          >
            <source src={file.url} type={`video/${getFileType(file.filename)}`} />
            Your browser does not support the video tag.
          </video>
        </AspectRatio>
      );
    }

    // Audio Preview
    if (isAudio(file.filename)) {
      return (
        <Center h="200px">
          <VStack spacing={6} w="full" px={8}>
            <Icon as={FiFile} boxSize={16} color="brand.500" />
            <audio controls style={{ width: '100%' }}>
              <source src={file.url} type={`audio/${getFileType(file.filename)}`} />
              Your browser does not support the audio tag.
            </audio>
          </VStack>
        </Center>
      );
    }

    // PDF Preview
    if (isPDF(file.filename)) {
      return (
        <AspectRatio ratio={16 / 9} h="70vh">
          <iframe
            src={file.url}
            title={file.filename}
            style={{ border: 'none', width: '100%', height: '100%' }}
          />
        </AspectRatio>
      );
    }

    // Default: Not previewable
    return (
      <Center h="300px">
        <VStack spacing={4}>
          <Icon as={FiFile} boxSize={16} color="gray.400" />
          <Text color="gray.500">Preview not available for this file type</Text>
          <Button
            leftIcon={<FiDownload />}
            colorScheme="brand"
            onClick={handleDownload}
          >
            Download to view
          </Button>
        </VStack>
      </Center>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="6xl"
      scrollBehavior="inside"
      isCentered
    >
      <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(4px)" />
      <ModalContent maxW="90vw" maxH="90vh" bg="white">
        <ModalHeader>
          <VStack align="start" spacing={1}>
            <Text fontSize="lg" fontWeight="bold" noOfLines={1}>
              {file.filename}
            </Text>
            <HStack spacing={2} fontSize="sm" color="gray.500">
              <Text>{getFileType(file.filename).toUpperCase()}</Text>
              <Text>•</Text>
              <Text>{formatFileSize(file.size)}</Text>
            </HStack>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody pb={6}>
          {renderPreview()}

          {/* Action Buttons */}
          <HStack justify="center" pt={6} spacing={3}>
            <Button
              leftIcon={<FiDownload />}
              colorScheme="brand"
              onClick={handleDownload}
            >
              Download
            </Button>
            <Button
              leftIcon={<FiExternalLink />}
              variant="outline"
              onClick={() => file.url && window.open(file.url, '_blank')}
            >
              Open in new tab
            </Button>
          </HStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

// Helper function (should be imported from utils)
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
