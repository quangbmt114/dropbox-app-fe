'use client';

/**
 * Dashboard Layout Component
 * Dropbox-inspired sidebar layout
 */

import { ReactNode } from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Icon,
  Text,
  Avatar,
  Button,
  Divider,
  useColorModeValue,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Heading,
} from '@chakra-ui/react';
import {
  FiFile,
  FiUpload,
  FiClock,
  FiStar,
  FiTrash2,
  FiLogOut,
  FiMenu,
  FiHome,
} from 'react-icons/fi';
import { useRouter } from 'next/navigation';

interface DashboardLayoutProps {
  children: ReactNode;
  userEmail: string;
  onLogout?: () => void;
}

interface NavItemProps {
  icon: any;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick }) => {
  const activeBg = useColorModeValue('blue.50', 'blue.900');
  const activeColor = useColorModeValue('brand.500', 'brand.200');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');

  return (
    <Button
      w="full"
      variant="ghost"
      justifyContent="flex-start"
      leftIcon={<Icon as={icon} boxSize={5} />}
      bg={isActive ? activeBg : 'transparent'}
      color={isActive ? activeColor : 'gray.700'}
      fontWeight={isActive ? 'semibold' : 'medium'}
      _hover={{ bg: isActive ? activeBg : hoverBg }}
      px={4}
      py={6}
      borderRadius="lg"
      onClick={onClick}
    >
      {label}
    </Button>
  );
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  userEmail,
  onLogout,
}) => {
  const sidebarBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Flex h="100vh" overflow="hidden">
      {/* Sidebar */}
      <Box
        w="280px"
        bg={sidebarBg}
        borderRight="1px"
        borderColor={borderColor}
        py={6}
        px={4}
        display={{ base: 'none', md: 'block' }}
      >
        <VStack spacing={6} align="stretch" h="full">
          {/* Logo */}
          <Box px={2}>
            <Heading size="lg" color="brand.500" fontWeight="bold">
              Dropbox
            </Heading>
          </Box>

          <Divider />

          {/* Navigation */}
          <VStack spacing={2} align="stretch" flex={1}>
            <NavItem icon={FiHome} label="All Files" isActive />
            <NavItem icon={FiClock} label="Recent" />
            <NavItem icon={FiStar} label="Starred" />
            <NavItem icon={FiTrash2} label="Deleted" />
          </VStack>

          <Divider />

          {/* User Menu */}
          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              w="full"
              justifyContent="flex-start"
              _hover={{ bg: 'gray.100' }}
              px={4}
              py={6}
              borderRadius="lg"
            >
              <HStack spacing={3}>
                <Avatar size="sm" name={userEmail} bg="brand.500" />
                <Box textAlign="left" overflow="hidden">
                  <Text fontSize="sm" fontWeight="medium" isTruncated>
                    {userEmail}
                  </Text>
                </Box>
              </HStack>
            </MenuButton>
            <MenuList>
              <MenuItem icon={<FiLogOut />} onClick={() => onLogout?.()}>
                Sign out
              </MenuItem>
            </MenuList>
          </Menu>
        </VStack>
      </Box>

      {/* Main Content */}
      <Box flex={1} overflow="auto" bg="gray.50">
        {/* Top Bar for Mobile */}
        <Box
          display={{ base: 'block', md: 'none' }}
          bg={sidebarBg}
          borderBottom="1px"
          borderColor={borderColor}
          px={4}
          py={3}
        >
          <HStack justify="space-between">
            <IconButton
              aria-label="Menu"
              icon={<FiMenu />}
              variant="ghost"
            />
            <Heading size="md" color="brand.500">
              Dropbox
            </Heading>
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<Avatar size="sm" name={userEmail} bg="brand.500" />}
                variant="ghost"
                borderRadius="full"
              />
              <MenuList>
                <MenuItem icon={<FiLogOut />} onClick={() => onLogout?.()}>
                  Sign out
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Box>

        {/* Content Area */}
        <Box p={{ base: 4, md: 8 }}>{children}</Box>
      </Box>
    </Flex>
  );
};

