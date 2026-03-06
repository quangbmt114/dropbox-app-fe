'use client';

/**
 * Register Form Component
 * Modern registration form with Chakra UI and react-hook-form
 * Validation handled by Yup in parent component
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
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

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
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  register,
  handleSubmit,
  errors,
  isLoading,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
                      {...register('name')}
                      type="text"
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
                      {...register('email')}
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
                    <InputGroup size="lg">
                      <Input
                        {...register('password')}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        bg="white"
                        borderColor="gray.300"
                        _hover={{ borderColor: 'gray.400' }}
                        _focus={{
                          borderColor: 'brand.500',
                          boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
                        }}
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          icon={showPassword ? <FiEyeOff /> : <FiEye />}
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                        />
                      </InputRightElement>
                    </InputGroup>
                    <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
                  </FormControl>

                  {/* Confirm Password Field */}
                  <FormControl isRequired isInvalid={!!errors.confirmPassword}>
                    <FormLabel fontWeight="medium" color="gray.700">
                      Confirm Password
                    </FormLabel>
                    <InputGroup size="lg">
                      <Input
                        {...register('confirmPassword')}
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        bg="white"
                        borderColor="gray.300"
                        _hover={{ borderColor: 'gray.400' }}
                        _focus={{
                          borderColor: 'brand.500',
                          boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
                        }}
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                          icon={showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        />
                      </InputRightElement>
                    </InputGroup>
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
                    Create Account
                  </Button>
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
