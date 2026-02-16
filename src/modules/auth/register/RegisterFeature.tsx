'use client';

/**
 * Register Feature Module
 * Handles registration logic with Redux and react-hook-form
 */

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { authActions, authSelectors } from '@/store/modules/auth';
import { RegisterForm } from './components/RegisterForm';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const RegisterFeature = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // ========== STATE ==========
  const isLoading = useAppSelector(authSelectors.selectIsLoading);
  const isAuthenticated = useAppSelector(authSelectors.selectIsAuthenticated);

  // ========== REACT HOOK FORM ==========
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm<RegisterFormData>({
    mode: 'onBlur',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  // ========== CALLBACKS ==========
  const onSubmit = useCallback(
    async (data: RegisterFormData) => {
      const result = await dispatch(authActions.register(data.email, data.password));

      if (!result.success) {
        setError('root', {
          type: 'manual',
          message: result.error || 'Registration failed',
        });
        return;
      }

      router.push('/dashboard');
    },
    [dispatch, router, setError]
  );

  // ========== EFFECTS ==========
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <RegisterForm
      register={register}
      handleSubmit={handleSubmit(onSubmit)}
      errors={errors}
      isLoading={isLoading}
      password={password}
    />
  );
};
