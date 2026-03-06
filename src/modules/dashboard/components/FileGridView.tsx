'use client';

/**
 * File Grid View Component
 * Grid layout for files with thumbnails and preview
 */

import React, { useState, useEffect } from 'react';
import {
  SimpleGrid,
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Skeleton,
  Center,
  Image,
  AspectRatio,
  useDisclosure,
} from '@chakra-ui/react';
import {
  FiFile,
  FiMoreVertical,
  FiTrash2,
  FiDownload,
  FiImage,
  FiVideo,
  FiMusic,
  FiFileText,
  FiEye,
} from 'react-icons/fi';
import { FileItem as FileItemType, getFileUrl } from '@/api-service';
import { formatFileSize, formatDate } from '@/utils/format';
import { isImage, isVideo, isAudio, isPDF, getFileType, isPreviewable } from '@/utils/fileUtils';
import { FilePreviewModal } from './FilePreviewModal';

interface FileGridViewProps {
  files: FileItemType[];
  isLoading: boolean;
  deletingFileId: string | null;
  onDelete: (fileId: string, fileName: string) => void;
}

// Get icon based on file type
const getFileIcon = (filename: string) => {
  if (isImage(filename)) return FiImage;
  if (isVideo(filename)) return FiVideo;
  if (isAudio(filename)) return FiMusic;
  if (isPDF(filename)) return FiFileText;
  return FiFile;
};

// Get color based on file type
const getFileColor = (filename: string) => {
  const type = getFileType(filename);
  const colorMap: Record<string, string> = {
    image: 'purple.500',
    video: 'red.500',
    audio: 'pink.500',
    pdf: 'red.600',
    document: 'blue.500',
    file: 'gray.400',
  };
  return colorMap[type] || 'gray.400';
};

export const FileGridView: React.FC<FileGridViewProps> = ({
  files,
  isLoading,
  deletingFileId,
  onDelete,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedFile, setSelectedFile] = useState<FileItemType | null>(null);

  const handleFileClick = (file: FileItemType) => {
    setSelectedFile(file);
    onOpen();
  };

  if (isLoading) {
    return (
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} height="200px" borderRadius="xl" />
        ))}
      </SimpleGrid>
    );
  }

  if (files.length === 0) {
    return (
      <Center py={20}>
        <VStack spacing={3}>
          <Icon as={FiFile} boxSize={16} color="gray.300" />
          <Text color="gray.500" fontSize="lg">
            No files yet
          </Text>
          <Text color="gray.400" fontSize="sm">
            Upload your first file to get started
          </Text>
        </VStack>
      </Center>
    );
  }

  return (
    <>
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
        {files.map((file) => (
          <Box
            key={file.id}
            bg="white"
            borderRadius="xl"
            overflow="hidden"
            boxShadow="sm"
            transition="all 0.2s"
            _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
            opacity={deletingFileId === file.id ? 0.5 : 1}
            pointerEvents={deletingFileId === file.id ? 'none' : 'auto'}
            cursor={isPreviewable(file.filename) ? 'pointer' : 'default'}
            onClick={() => isPreviewable(file.filename) && handleFileClick(file)}
          >
            {/* File Thumbnail/Icon */}
            <AspectRatio ratio={4 / 3}>
              <Box
                bg="gray.100"
                display="flex"
                alignItems="center"
                justifyContent="center"
                position="relative"
              >
                {isImage(file.filename) ? (
                  <>
                    <Image
                      src={getFileUrl(file)}
                      alt={file.filename}
                      objectFit="cover"
                      w="full"
                      h="full"
                      onError={(e) => {
                        console.error('❌ Image load failed:', {
                          src: e.currentTarget.src,
                          filename: file.filename,
                          fileId: file.id,
                        });
                      }}
                      fallback={
                        <VStack spacing={2}>
                          <Icon as={FiImage} boxSize={12} color="purple.500" />
                          <Text fontSize="xs" color="gray.500">
                            Image file
                          </Text>
                          <Text fontSize="xs" color="red.400">
                            Unable to load
                          </Text>
                        </VStack>
                      }
                    />
                    {/* Preview overlay on hover */}
                    <Box
                      position="absolute"
                      inset={0}
                      bg="blackAlpha.600"
                      opacity={0}
                      _groupHover={{ opacity: 1 }}
                      transition="opacity 0.2s"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon as={FiEye} boxSize={8} color="white" />
                    </Box>
                  </>
                ) : (
                  <VStack spacing={2}>
                    <Icon
                      as={getFileIcon(file.filename)}
                      boxSize={12}
                      color={getFileColor(file.filename)}
                    />
                    {isPreviewable(file.filename) && (
                      <Text fontSize="xs" color="gray.500">
                        Click to preview
                      </Text>
                    )}
                  </VStack>
                )}
              </Box>
            </AspectRatio>

            {/* File Info */}
            <VStack align="stretch" p={4} spacing={2}>
              <HStack justify="space-between" align="start">
                <VStack align="start" spacing={0} flex={1} overflow="hidden">
                  <Text fontWeight="semibold" fontSize="sm" noOfLines={1} title={file.filename}>
                    {file.filename}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {formatFileSize(file.size)}
                  </Text>
                </VStack>

                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={<FiMoreVertical />}
                    variant="ghost"
                    size="sm"
                    aria-label="File options"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <MenuList>
                    {isPreviewable(file.filename) && (
                      <MenuItem
                        icon={<FiEye />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFileClick(file);
                        }}
                      >
                        Preview
                      </MenuItem>
                    )}
                    <MenuItem
                      icon={<FiDownload />}
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(getFileUrl(file), '_blank');
                      }}
                    >
                      Download
                    </MenuItem>
                    <MenuItem
                      icon={<FiTrash2 />}
                      color="red.500"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(file.id, file.filename);
                      }}
                    >
                      Delete
                    </MenuItem>
                  </MenuList>
                </Menu>
              </HStack>

              <Text fontSize="xs" color="gray.400">
                {formatDate(file.uploadedAt)}
              </Text>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>

      {/* Preview Modal */}
      <FilePreviewModal isOpen={isOpen} onClose={onClose} file={selectedFile} />
    </>
  );
};
