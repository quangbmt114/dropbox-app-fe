'use client';

/**
 * Login Feature Module
 * Handles login logic with Redux and react-hook-form
 */

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { authActions, authSelectors } from '@/store/modules/auth';
import { LoginForm } from './components/LoginForm';

interface LoginFormData {
  email: string;
  password: string;
}

export const LoginFeature = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // ========== STATE ==========
  const isLoading = useAppSelector(authSelectors.selectIsLoading);
  const isAuthenticated = useAppSelector(authSelectors.selectIsAuthenticated);

  // ========== REACT HOOK FORM ==========
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // ========== CALLBACKS ==========
  const onSubmit = useCallback(
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
    <LoginForm
      register={register}
      handleSubmit={handleSubmit(onSubmit)}
      errors={errors}
      isLoading={isLoading}
    />
  );
};
