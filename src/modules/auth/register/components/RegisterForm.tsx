'use client';

/**
 * Register Form Component
 * Dropbox-inspired registration form with Chakra UI and react-hook-form
 */

import { FormEvent } from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Heading,
  Input,
  Text,
  VStack,
  Alert,
  AlertIcon,
  Link,
  Card,
  CardBody,
} from '@chakra-ui/react';
import NextLink from 'next/link';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterFormProps {
  register: UseFormRegister<RegisterFormData>;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  errors: FieldErrors<RegisterFormData>;
  isLoading: boolean;
  password: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  register,
  handleSubmit,
  errors,
  isLoading,
  password,
}) => {
  return (
    <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center" py={12}>
      <Container maxW="md">
        <VStack spacing={8} align="stretch">
          {/* Logo/Brand */}
          <Box textAlign="center">
            <Heading
              as="h1"
              size="2xl"
              color="brand.500"
              fontWeight="bold"
              mb={2}
            >
              Dropbox
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Create your account
            </Text>
          </Box>

          {/* Register Card */}
          <Card shadow="lg" borderRadius="xl">
            <CardBody p={8}>
              <form onSubmit={handleSubmit}>
                <VStack spacing={5} align="stretch">
                  {/* Name Field */}
                  <FormControl isRequired isInvalid={!!errors.name}>
                    <FormLabel fontWeight="medium" color="gray.700">
                      Full Name
                    </FormLabel>
                    <Input
                      {...register('name', {
                        required: 'Name is required',
                        minLength: {
                          value: 2,
                          message: 'Name must be at least 2 characters',
                        },
                      })}
                      placeholder="John Doe"
                      size="lg"
                      bg="white"
                      borderColor="gray.300"
                      _hover={{ borderColor: 'gray.400' }}
                      _focus={{
                        borderColor: 'brand.500',
                        boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
                      }}
                    />
                    <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                  </FormControl>

                  {/* Email Field */}
                  <FormControl isRequired isInvalid={!!errors.email}>
                    <FormLabel fontWeight="medium" color="gray.700">
                      Email
                    </FormLabel>
                    <Input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      type="email"
                      placeholder="name@example.com"
                      size="lg"
                      bg="white"
                      borderColor="gray.300"
                      _hover={{ borderColor: 'gray.400' }}
                      _focus={{
                        borderColor: 'brand.500',
                        boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
                      }}
                    />
                    <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                  </FormControl>

                  {/* Password Field */}
                  <FormControl isRequired isInvalid={!!errors.password}>
                    <FormLabel fontWeight="medium" color="gray.700">
                      Password
                    </FormLabel>
                    <Input
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters',
                        },
                      })}
                      type="password"
                      placeholder="Create a strong password"
                      size="lg"
                      bg="white"
                      borderColor="gray.300"
                      _hover={{ borderColor: 'gray.400' }}
                      _focus={{
                        borderColor: 'brand.500',
                        boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
                      }}
                    />
                    <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
                    {!errors.password && (
                      <Text fontSize="sm" color="gray.500" mt={2}>
                        Use at least 6 characters
                      </Text>
                    )}
                  </FormControl>

                  {/* Confirm Password Field */}
                  <FormControl isRequired isInvalid={!!errors.confirmPassword}>
                    <FormLabel fontWeight="medium" color="gray.700">
                      Confirm Password
                    </FormLabel>
                    <Input
                      {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (value) =>
                          value === password || 'Passwords do not match',
                      })}
                      type="password"
                      placeholder="Confirm your password"
                      size="lg"
                      bg="white"
                      borderColor="gray.300"
                      _hover={{ borderColor: 'gray.400' }}
                      _focus={{
                        borderColor: 'brand.500',
                        boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
                      }}
                    />
                    <FormErrorMessage>{errors.confirmPassword?.message}</FormErrorMessage>
                  </FormControl>

                  {/* Root Error (API errors) */}
                  {errors.root && (
                    <Alert status="error" borderRadius="md">
                      <AlertIcon />
                      {errors.root.message}
                    </Alert>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    colorScheme="brand"
                    size="lg"
                    fontSize="md"
                    fontWeight="semibold"
                    isLoading={isLoading}
                    loadingText="Creating account..."
                    w="full"
                    mt={2}
                  >
                    Create account
                  </Button>

                  {/* Terms */}
                  <Text fontSize="xs" color="gray.500" textAlign="center">
                    By creating an account, you agree to our Terms of Service
                  </Text>
                </VStack>
              </form>
            </CardBody>
          </Card>

          {/* Login Link */}
          <Box textAlign="center">
            <Text color="gray.600">
              Already have an account?{' '}
              <Link
                as={NextLink}
                href="/login"
                color="brand.500"
                fontWeight="semibold"
                _hover={{ textDecoration: 'underline' }}
              >
                Sign in
              </Link>
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};
