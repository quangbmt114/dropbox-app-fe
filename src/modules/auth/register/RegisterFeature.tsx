'use client';

/**
 * Register Feature Module
 * Handles registration logic with Redux, react-hook-form, and Yup validation
 */

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { persistor } from '@/store';
import { authActions, authSelectors } from '@/store/modules/auth';
import { RegisterForm } from './components/RegisterForm';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Yup validation schema
const registerSchema = yup.object().shape({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name is too long')
    .trim(),
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
    .max(100, 'Password is too long')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

export const RegisterFeature = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // ========== STATE ==========
  const isLoading = useAppSelector(authSelectors.selectIsLoading);
  const isAuthenticated = useAppSelector(authSelectors.selectIsAuthenticated);

  // ========== REACT HOOK FORM WITH YUP ==========
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // ========== CALLBACKS ==========
  const onSubmit = useCallback(
    async (data: RegisterFormData) => {
      const result = await dispatch(
        authActions.register({
          name: data.name,
          email: data.email,
          password: data.password,
        })
      );

      if (!result.success) {
        setError('root', {
          type: 'manual',
          message: result.error || 'Registration failed',
        });
        return;
      }

      // Ensure token is persisted before navigation
      await persistor.flush();

      router.push('/dashboard');
    },
    [dispatch, router, setError]
  );

  // ========== EFFECTS ==========
  // Check if already authenticated on mount
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps intentional: only run on mount

  return (
    <RegisterForm
      register={register}
      handleSubmit={handleSubmit(onSubmit)}
      errors={errors}
      isLoading={isLoading || isSubmitting}
    />
  );
};
