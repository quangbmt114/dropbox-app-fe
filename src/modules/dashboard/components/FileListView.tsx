'use client';

/**
 * File List View Component
 * Table/list layout for files with preview support
 */

import { useState } from 'react';
import {
  Box,
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
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Avatar,
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
import { FileItem as FileItemType } from '@/api-service';
import { formatFileSize, formatDate } from '@/utils/format';
import { isImage, isVideo, isAudio, isPDF, getFileType, isPreviewable } from '@/utils/fileUtils';
import { FilePreviewModal } from './FilePreviewModal';

interface FileListViewProps {
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
    image: 'purple',
    video: 'red',
    audio: 'pink',
    pdf: 'red',
    document: 'blue',
    file: 'gray',
  };
  return colorMap[type] || 'gray';
};

export const FileListView: React.FC<FileListViewProps> = ({
  files,
  isLoading,
  deletingFileId,
  onDelete,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedFile, setSelectedFile] = useState<FileItemType | null>(null);

  const handleFileClick = (file: FileItemType) => {
    if (isPreviewable(file.filename)) {
      setSelectedFile(file);
      onOpen();
    }
  };

  if (isLoading) {
    return (
      <VStack spacing={2} align="stretch">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} height="60px" borderRadius="lg" />
        ))}
      </VStack>
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
      <Box bg="white" borderRadius="xl" overflow="hidden" boxShadow="sm">
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th width="50%">Name</Th>
              <Th>Size</Th>
              <Th>Modified</Th>
              <Th width="60px"></Th>
            </Tr>
          </Thead>
          <Tbody>
            {files.map((file) => (
              <Tr
                key={file.id}
                _hover={{ bg: 'gray.50' }}
                opacity={deletingFileId === file.id ? 0.5 : 1}
                pointerEvents={deletingFileId === file.id ? 'none' : 'auto'}
                cursor={isPreviewable(file.filename) ? 'pointer' : 'default'}
                onClick={() => handleFileClick(file)}
              >
                {/* File Name with Icon */}
                <Td>
                  <HStack spacing={3}>
                    <Avatar
                      size="sm"
                      icon={<Icon as={getFileIcon(file.filename)} />}
                      bg={`${getFileColor(file.filename)}.100`}
                      color={`${getFileColor(file.filename)}.600`}
                    />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="medium" fontSize="sm" noOfLines={1} title={file.filename}>
                        {file.filename}
                      </Text>
                      {isPreviewable(file.filename) && (
                        <Text fontSize="xs" color="gray.500">
                          Click to preview
                        </Text>
                      )}
                    </VStack>
                  </HStack>
                </Td>

                {/* File Size */}
                <Td>
                  <Text fontSize="sm" color="gray.600">
                    {formatFileSize(file.size)}
                  </Text>
                </Td>

                {/* Upload Date */}
                <Td>
                  <Text fontSize="sm" color="gray.600">
                    {formatDate(file.uploadedAt)}
                  </Text>
                </Td>

                {/* Actions Menu */}
                <Td>
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
                          file.url && window.open(file.url, '_blank');
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
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Preview Modal */}
      <FilePreviewModal isOpen={isOpen} onClose={onClose} file={selectedFile} />
    </>
  );
};
