'use client';

/**
 * Home/Landing Page
 * Dropbox-inspired landing page with Chakra UI
 */

import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Stack,
  Icon,
  SimpleGrid,
  Badge,
} from '@chakra-ui/react';
import { FiUploadCloud, FiFolder, FiShare2, FiShield } from 'react-icons/fi';
import Link from 'next/link';

const features = [
  {
    icon: FiUploadCloud,
    title: 'Easy Upload',
    description: 'Drag and drop files to upload them instantly',
  },
  {
    icon: FiFolder,
    title: 'Organize Files',
    description: 'Keep your files organized and easy to find',
  },
  {
    icon: FiShare2,
    title: 'Share Anywhere',
    description: 'Access your files from any device, anytime',
  },
  {
    icon: FiShield,
    title: 'Secure Storage',
    description: 'Your files are encrypted and protected',
  },
];

export default function Home() {
  return (
    <Box>
      {/* Hero Section */}
      <Box
        bgGradient="linear(to-br, brand.500, brand.700)"
        color="white"
        py={{ base: 20, md: 32 }}
      >
        <Container maxW="container.xl">
          <VStack spacing={6} textAlign="center" maxW="3xl" mx="auto" alignItems="center">
            <Badge
              colorScheme="whiteAlpha"
              fontSize="sm"
              px={3}
              py={1}
              borderRadius="full"
            >
              Modern File Storage
            </Badge>
            <Heading
              as="h1"
              size={{ base: '2xl', md: '3xl', lg: '4xl' }}
              fontWeight="bold"
              lineHeight="1.2"
            >
              Your files, anywhere you go
            </Heading>
            <Text fontSize={{ base: 'lg', md: 'xl' }} opacity={0.9} maxW="2xl">
              Store, share, and collaborate on your files from any device.
              Simple, secure, and reliable cloud storage.
            </Text>
            <Stack
              direction={{ base: 'column', sm: 'row' }}
              spacing={4}
              pt={4}
            >
              <Button
                as={Link}
                href="/register"
                size="lg"
                colorScheme="whiteAlpha"
                bg="white"
                color="brand.600"
                px={8}
                _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                transition="all 0.2s"
              >
                Get Started
              </Button>
              <Button
                as={Link}
                href="/login"
                size="lg"
                variant="outline"
                borderColor="white"
                color="white"
                px={8}
                _hover={{
                  bg: 'whiteAlpha.200',
                  transform: 'translateY(-2px)',
                }}
                transition="all 0.2s"
              >
                Sign In
              </Button>
            </Stack>
          </VStack>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={{ base: 16, md: 24 }} bg="gray.50">
        <Container maxW="container.xl">
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center">
              <Heading size="xl">Everything you need</Heading>
              <Text fontSize="lg" color="gray.600" maxW="2xl">
                Powerful features to help you manage and organize your files
              </Text>
            </VStack>

            <SimpleGrid
              columns={{ base: 1, md: 2, lg: 4 }}
              spacing={8}
              w="full"
            >
              {features.map((feature, index) => (
                <VStack
                  key={index}
                  bg="white"
                  p={8}
                  borderRadius="xl"
                  spacing={4}
                  align="start"
                  boxShadow="sm"
                  transition="all 0.2s"
                  _hover={{ boxShadow: 'md', transform: 'translateY(-4px)' }}
                >
                  <Box
                    bg="brand.50"
                    p={3}
                    borderRadius="lg"
                    color="brand.500"
                  >
                    <Icon as={feature.icon} boxSize={6} />
                  </Box>
                  <Heading size="md">{feature.title}</Heading>
                  <Text color="gray.600">{feature.description}</Text>
                </VStack>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={{ base: 16, md: 24 }}>
        <Container maxW="container.xl">
          <Box
            bg="brand.500"
            color="white"
            borderRadius="2xl"
            p={{ base: 8, md: 16 }}
            textAlign="center"
          >
            <VStack spacing={6}>
              <Heading size="xl">Ready to get started?</Heading>
              <Text fontSize="lg" opacity={0.9} maxW="2xl">
                Join thousands of users who trust us with their files
              </Text>
              <Button
                as={Link}
                href="/register"
                size="lg"
                bg="white"
                color="brand.600"
                px={8}
                _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                transition="all 0.2s"
              >
                Create Free Account
              </Button>
            </VStack>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
