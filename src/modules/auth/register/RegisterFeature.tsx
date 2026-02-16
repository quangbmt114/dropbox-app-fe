'use client';

/**
 * Register Feature Module
 * Handles registration logic with Redux
 */

import { useState, useCallback, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { authActions, authSelectors } from '@/store/modules/auth';
import { RegisterForm } from './components/RegisterForm';

export const RegisterFeature = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // ========== STATE ==========
  const isLoading = useAppSelector(authSelectors.selectIsLoading);
  const isAuthenticated = useAppSelector(authSelectors.selectIsAuthenticated);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  // ========== CALLBACKS ==========
  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError('');

      // Validate passwords match
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      // Validate password length
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      const result = await dispatch(authActions.register(email, password));

      if (!result.success) {
        setError(result.error || 'Registration failed');
        return;
      }

      router.push('/dashboard');
    },
    [email, password, confirmPassword, dispatch, router]
  );

  // ========== EFFECTS ==========
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <RegisterForm
      email={email}
      password={password}
      confirmPassword={confirmPassword}
      error={error}
      isLoading={isLoading}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onConfirmPasswordChange={setConfirmPassword}
      onSubmit={handleSubmit}
    />
  );
};

