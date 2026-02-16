'use client';

/**
 * Login Feature Module
 * Handles login logic with Redux
 */

import { useState, useCallback, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { authActions, authSelectors } from '@/store/modules/auth';
import { LoginForm } from './components/LoginForm';

export const LoginFeature = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();

    // ========== STATE ==========
    const isLoading = useAppSelector(authSelectors.selectIsLoading);
    const isAuthenticated = useAppSelector(authSelectors.selectIsAuthenticated);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // ========== CALLBACKS ==========
    const handleSubmit = useCallback(
        async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            setError('');

            const result = await dispatch(authActions.login(email, password));

            if (!result.success) {
                setError(result.error || 'Login failed');
                return;
            }

            router.push('/dashboard');
        },
        [email, password, dispatch, router]
    );

    // ========== EFFECTS ==========
    useEffect(() => {
        if (isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, router]);

    return (
        <LoginForm
            email={email}
            password={password}
            error={error}
            isLoading={isLoading}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSubmit={handleSubmit}
        />
    );
};

