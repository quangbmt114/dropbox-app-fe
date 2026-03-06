/**
 * Custom 404 Not Found Page
 */

import { Box, Container, Heading, Text, Button, VStack } from '@chakra-ui/react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
      <Container maxW="md" textAlign="center">
        <VStack spacing={6}>
          <Heading size="4xl" color="brand.500">
            404
          </Heading>
          <Heading size="lg">Page Not Found</Heading>
          <Text color="gray.600" fontSize="lg">
            The page you are looking for does not exist or has been moved.
          </Text>
          <Button as={Link} href="/" colorScheme="brand" size="lg">
            Go Home
          </Button>
        </VStack>
      </Container>
    </Box>
  );
}
