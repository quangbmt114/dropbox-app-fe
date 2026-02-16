'use client';

/**
 * File List View Component
 * Table/List layout for files (Dropbox-style)
 */

import {
  Box,
  HStack,
  VStack,
  Text,
  IconButton,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Skeleton,
  Center,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { FiFile, FiMoreVertical, FiTrash2, FiDownload } from 'react-icons/fi';
import { FileItem as FileItemType } from '@/api-service';
import { formatFileSize, formatDate } from '@/utils/format';

interface FileListViewProps {
  files: FileItemType[];
  isLoading: boolean;
  deletingFileId: string | null;
  onDelete: (fileId: string, fileName: string) => void;
}

export const FileListView: React.FC<FileListViewProps> = ({
  files,
  isLoading,
  deletingFileId,
  onDelete,
}) => {
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
    <Box bg="white" borderRadius="xl" overflow="hidden" boxShadow="sm">
      <Table variant="simple">
        <Thead bg="gray.50">
          <Tr>
            <Th>Name</Th>
            <Th display={{ base: 'none', md: 'table-cell' }}>Size</Th>
            <Th display={{ base: 'none', lg: 'table-cell' }}>Modified</Th>
            <Th w="50px"></Th>
          </Tr>
        </Thead>
        <Tbody>
          {files.map((file) => (
            <Tr
              key={file.id}
              _hover={{ bg: 'gray.50' }}
              opacity={deletingFileId === file.id ? 0.5 : 1}
              pointerEvents={deletingFileId === file.id ? 'none' : 'auto'}
            >
              {/* Name Column */}
              <Td>
                <HStack spacing={3}>
                  <Icon as={FiFile} boxSize={5} color="gray.400" />
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="medium" noOfLines={1}>
                      {file.filename}
                    </Text>
                    <Text
                      fontSize="xs"
                      color="gray.500"
                      display={{ base: 'block', md: 'none' }}
                    >
                      {formatFileSize(file.size)}
                    </Text>
                  </VStack>
                </HStack>
              </Td>

              {/* Size Column */}
              <Td display={{ base: 'none', md: 'table-cell' }}>
                <Text fontSize="sm" color="gray.600">
                  {formatFileSize(file.size)}
                </Text>
              </Td>

              {/* Modified Column */}
              <Td display={{ base: 'none', lg: 'table-cell' }}>
                <Text fontSize="sm" color="gray.500">
                  {formatDate(file.uploadedAt)}
                </Text>
              </Td>

              {/* Actions Column */}
              <Td>
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
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

