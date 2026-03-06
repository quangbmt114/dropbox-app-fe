'use client';

/**
 * Login Feature Module
 * Handles login logic with Redux, react-hook-form, and Yup validation
 */

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
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
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { authActions, authSelectors } from '@/store/modules/auth';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

interface LoginFormData {
  email: string;
  password: string;
}

// Yup validation schema
const loginSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email address')
    .trim()
    .lowercase(),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long'),
});

export const LoginFeature = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // ========== STATE ==========
  const isLoading = useAppSelector(authSelectors.selectIsLoading);
  const isAuthenticated = useAppSelector(authSelectors.selectIsAuthenticated);

  // ========== REACT HOOK FORM WITH YUP ==========
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (
    async (data: LoginFormData) => {
      const result = await dispatch(authActions.login(data.email, data.password));

      if (!result.success) {
        setError('root', {
          type: 'manual',
          message: result.error || 'Login failed',
        });
        return;
      }

      router.push('/dashboard');
    }
  );

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, []);

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
              Sign in to your account
            </Text>
          </Box>

          {/* Login Card */}
          <Card shadow="lg" borderRadius="xl">
            <CardBody p={8}>
              <Box
              >
                <VStack spacing={5} align="stretch">
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
                      placeholder="Enter your password"
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
                    colorScheme="brand"
                    size="lg"
                    fontSize="md"
                    fontWeight="semibold"
                    isLoading={isLoading}
                    loadingText="Signing in..."
                    w="full"
                    mt={2}
                    onClick={handleSubmit(onSubmit)}
                  >
                    Sign in
                  </Button>
                </VStack>
              </Box>
            </CardBody>
          </Card>

          {/* Register Link */}
          <Box textAlign="center">
            <Text color="gray.600">
              Don't have an account?{' '}
              <Link
                as={NextLink}
                href="/register"
                color="brand.500"
                fontWeight="semibold"
                _hover={{ textDecoration: 'underline' }}
              >
                Create account
              </Link>
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};
