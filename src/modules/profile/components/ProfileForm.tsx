'use client';

/**
 * Profile Form Component
 * User profile display and edit form
 */

import { FormEvent } from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Heading,
  Input,
  VStack,
  HStack,
  Card,
  CardBody,
  Avatar,
  Text,
  Divider,
  Badge,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { FiEdit2, FiSave, FiX, FiEye, FiEyeOff } from 'react-icons/fi';
import { useState } from 'react';

interface ProfileFormData {
  name: string;
  email: string;
  currentPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
}

interface ProfileFormProps {
  register: UseFormRegister<ProfileFormData>;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  errors: FieldErrors<ProfileFormData>;
  isSubmitting: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  user: any;
  showPasswordFields: boolean;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  register,
  handleSubmit,
  errors,
  isSubmitting,
  isEditing,
  onEdit,
  onCancel,
  user,
  showPasswordFields,
}) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <Box maxW="4xl" mx="auto">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" mb={4}>
          <Heading size="lg">Profile Settings</Heading>
          {!isEditing && (
            <Button
              leftIcon={<FiEdit2 />}
              colorScheme="brand"
              variant="outline"
              onClick={onEdit}
            >
              Edit Profile
            </Button>
          )}
        </HStack>

        {/* Profile Card */}
        <Card>
          <CardBody p={8}>
            <VStack spacing={8} align="stretch">
              {/* Avatar & Basic Info */}
              <HStack spacing={6}>
                <Avatar
                  size="2xl"
                  name={user?.name}
                  bg="brand.500"
                  color="white"
                />
                <VStack align="start" spacing={1}>
                  <Heading size="md">{user?.name}</Heading>
                  <Text color="gray.600">{user?.email}</Text>
                  <Badge colorScheme="green" mt={2}>
                    Active Account
                  </Badge>
                </VStack>
              </HStack>

              <Divider />

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <VStack spacing={5} align="stretch">
                  {/* Name Field */}
                  <FormControl isRequired isInvalid={!!errors.name}>
                    <FormLabel fontWeight="medium">Full Name</FormLabel>
                    <Input
                      {...register('name')}
                      type="text"
                      size="lg"
                      isDisabled={!isEditing}
                      bg={isEditing ? 'white' : 'gray.50'}
                    />
                    <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                  </FormControl>

                  {/* Email Field */}
                  <FormControl isRequired isInvalid={!!errors.email}>
                    <FormLabel fontWeight="medium">Email Address</FormLabel>
                    <Input
                      {...register('email')}
                      type="email"
                      size="lg"
                      isDisabled={!isEditing}
                      bg={isEditing ? 'white' : 'gray.50'}
                    />
                    <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                  </FormControl>

                  {/* Password Change Section */}
                  {isEditing && (
                    <>
                      <Divider my={4} />
                      <Heading size="sm" color="gray.700">
                        Change Password (Optional)
                      </Heading>

                      {/* Current Password */}
                      <FormControl isInvalid={!!errors.currentPassword}>
                        <FormLabel fontWeight="medium">Current Password</FormLabel>
                        <InputGroup size="lg">
                          <Input
                            {...register('currentPassword')}
                            type={showCurrentPassword ? 'text' : 'password'}
                            placeholder="Enter current password"
                          />
                          <InputRightElement>
                            <IconButton
                              aria-label={showCurrentPassword ? 'Hide' : 'Show'}
                              icon={showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            />
                          </InputRightElement>
                        </InputGroup>
                        <FormErrorMessage>{errors.currentPassword?.message}</FormErrorMessage>
                      </FormControl>

                      {/* New Password */}
                      <FormControl isInvalid={!!errors.newPassword}>
                        <FormLabel fontWeight="medium">New Password</FormLabel>
                        <InputGroup size="lg">
                          <Input
                            {...register('newPassword')}
                            type={showNewPassword ? 'text' : 'password'}
                            placeholder="Enter new password"
                          />
                          <InputRightElement>
                            <IconButton
                              aria-label={showNewPassword ? 'Hide' : 'Show'}
                              icon={showNewPassword ? <FiEyeOff /> : <FiEye />}
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            />
                          </InputRightElement>
                        </InputGroup>
                        <FormErrorMessage>{errors.newPassword?.message}</FormErrorMessage>
                      </FormControl>

                      {/* Confirm New Password */}
                      {showPasswordFields && (
                        <FormControl isInvalid={!!errors.confirmNewPassword}>
                          <FormLabel fontWeight="medium">Confirm New Password</FormLabel>
                          <InputGroup size="lg">
                            <Input
                              {...register('confirmNewPassword')}
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder="Confirm new password"
                            />
                            <InputRightElement>
                              <IconButton
                                aria-label={showConfirmPassword ? 'Hide' : 'Show'}
                                icon={showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              />
                            </InputRightElement>
                          </InputGroup>
                          <FormErrorMessage>{errors.confirmNewPassword?.message}</FormErrorMessage>
                        </FormControl>
                      )}
                    </>
                  )}

                  {/* Action Buttons */}
                  {isEditing && (
                    <HStack spacing={3} justify="flex-end" pt={4}>
                      <Button
                        leftIcon={<FiX />}
                        variant="outline"
                        onClick={onCancel}
                        isDisabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        leftIcon={<FiSave />}
                        colorScheme="brand"
                        isLoading={isSubmitting}
                        loadingText="Saving..."
                      >
                        Save Changes
                      </Button>
                    </HStack>
                  )}
                </VStack>
              </form>
            </VStack>
          </CardBody>
        </Card>

        {/* Account Info Card */}
        <Card>
          <CardBody p={6}>
            <VStack align="stretch" spacing={4}>
              <Heading size="sm" color="gray.700">
                Account Information
              </Heading>
              <HStack justify="space-between">
                <Text color="gray.600">Account Status</Text>
                <Badge colorScheme="green">Active</Badge>
              </HStack>
              <HStack justify="space-between">
                <Text color="gray.600">Member Since</Text>
                <Text fontWeight="medium">
                  {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                  })}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text color="gray.600">Storage Used</Text>
                <Text fontWeight="medium">0 MB of 10 GB</Text>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};
