'use client';

/**
 * File Grid View Component
 * Grid layout for files (Dropbox-style)
 */

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
} from '@chakra-ui/react';
import { FiFile, FiMoreVertical, FiTrash2, FiDownload } from 'react-icons/fi';
import { FileItem as FileItemType } from '@/api-service';
import { formatFileSize, formatDate } from '@/utils/format';

interface FileGridViewProps {
  files: FileItemType[];
  isLoading: boolean;
  deletingFileId: string | null;
  onDelete: (fileId: string, fileName: string) => void;
}

export const FileGridView: React.FC<FileGridViewProps> = ({
  files,
  isLoading,
  deletingFileId,
  onDelete,
}) => {
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
        >
          {/* File Icon/Preview */}
          <Box
            h="140px"
            bg="gray.100"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon as={FiFile} boxSize={12} color="gray.400" />
          </Box>

          {/* File Info */}
          <VStack align="stretch" p={4} spacing={2}>
            <HStack justify="space-between" align="start">
              <VStack align="start" spacing={0} flex={1} overflow="hidden">
                <Text
                  fontWeight="semibold"
                  fontSize="sm"
                  noOfLines={1}
                  title={file.filename}
                >
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
                />
                <MenuList>
                  <MenuItem
                    icon={<FiDownload />}
                    onClick={() => window.open(file.url, '_blank')}
                  >
                    Download
                  </MenuItem>
                  <MenuItem
                    icon={<FiTrash2 />}
                    color="red.500"
                    onClick={() => onDelete(file.id, file.filename)}
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
  );
};

