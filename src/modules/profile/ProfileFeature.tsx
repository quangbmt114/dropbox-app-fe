'use client';

/**
 * Profile Feature Module
 * User profile management with edit capabilities
 */

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { authSelectors } from '@/store/modules/auth';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ProfileForm } from '@/modules/profile/components/ProfileForm';
import { authActions } from '@/store/modules/auth';
import { useToast, Center, Spinner } from '@chakra-ui/react';

interface ProfileFormData {
  name: string;
  email: string;
  currentPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
}

// Yup validation schema
const profileSchema: yup.ObjectSchema<ProfileFormData> = yup.object().shape({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name is too long')
    .trim()
    .defined(),
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email address')
    .trim()
    .lowercase()
    .defined(),
  currentPassword: yup.string().when('newPassword', {
    is: (val: string) => val && val.length > 0,
    then: (schema) => schema.required('Current password is required to change password'),
    otherwise: (schema) => schema.optional(),
  }),
  newPassword: yup
    .string()
    .optional()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long'),
  confirmNewPassword: yup.string().when('newPassword', {
    is: (val: string) => val && val.length > 0,
    then: (schema) =>
      schema
        .required('Please confirm your new password')
        .oneOf([yup.ref('newPassword')], 'Passwords must match'),
    otherwise: (schema) => schema.optional(),
  }),
}) as yup.ObjectSchema<ProfileFormData>;

export const ProfileFeature = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const toast = useToast();

  // ========== STATE ==========
  const user = useAppSelector(authSelectors.selectUser);
  const isAuthenticated = useAppSelector(authSelectors.selectIsAuthenticated);
  const [isEditing, setIsEditing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // ========== REACT HOOK FORM WITH YUP ==========
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
    watch,
  } = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema),
    mode: 'onBlur',
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const newPassword = watch('newPassword');

  // ========== CALLBACKS ==========
  const handleLogout = useCallback(() => {
    dispatch(authActions.logout());
    router.push('/login');
  }, [dispatch, router]);

  const onSubmit = useCallback(
    async (data: ProfileFormData) => {
      // TODO: Implement update profile API
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setIsEditing(false);
      reset({
        name: data.name,
        email: data.email,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    },
    [toast, reset]
  );

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    reset({
      name: user?.name || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    });
  }, [user, reset]);

  // ========== EFFECTS ==========
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
      setIsInitializing(false);
    }
  }, [isAuthenticated, user, router, reset]);

  // Loading state
  if (isInitializing) {
    return (
      <Center h="100vh" bg="gray.50">
        <Spinner size="xl" color="brand.500" thickness="4px" />
      </Center>
    );
  }

  return (
    <DashboardLayout userEmail={user?.email || ''} onLogout={handleLogout}>
      <ProfileForm
        register={register}
        handleSubmit={handleSubmit(onSubmit)}
        errors={errors}
        isSubmitting={isSubmitting}
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onCancel={handleCancel}
        user={user}
        showPasswordFields={!!newPassword}
      />
    </DashboardLayout>
  );
};
