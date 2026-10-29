"use client";

/* Library imports */
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge, Button, CloseButton, Dialog, Flex, Portal, Stack, Tabs, Text } from "@chakra-ui/react";
import { LuLock, LuLogOut, LuUser } from "react-icons/lu";

/* Lib module imports */
import { Avatar } from "@/components/ui/avatar";
import { changePasswordApi, updateMeApi } from "@lib/api/me";
import { changePasswordSchema, profileSchema } from "@lib/schema/profile";
import type { ChangePasswordFormData, ProfileFormData, UserResponse } from "@lib/types/auth";

/* Shared module imports */
import { PasswordField } from "@shared/components/password-field";
import { TextField } from "@shared/components/text-field";
import { useApiMutation } from "@shared/hooks/use-api-query";

/* Props for the profile dialog */
export interface ProfileDialogProps {
  user: UserResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogout: () => void;
}

export const ProfileDialog = ({ user, open, onOpenChange, onLogout }: ProfileDialogProps) => {
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
    },
  });

  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  /* Load the saved name when the dialog opens */
  useEffect(() => {
    if (open && user) profileForm.reset({ name: user.name });
  }, [open, user, profileForm]);

  const { mutate: saveProfile, isLoading: isSavingProfile } = useApiMutation<undefined, ProfileFormData>({
    mutationFn: updateMeApi,
    invalidateQueryKeys: [["me"]],
    successTitle: "Profile Updated Successfully",
    successDescription: "Your name has been saved.",
    errorTitle: "Profile Update Failed",
  });

  const { mutate: savePassword, isLoading: isSavingPassword } = useApiMutation<undefined, ChangePasswordFormData>({
    mutationFn: ({ current_password, new_password }) => changePasswordApi({ current_password, new_password }),
    successTitle: "Password Changed Successfully",
    successDescription: "Your other sessions have been signed out.",
    errorTitle: "Password Change Failed",
    onSuccess: () => passwordForm.reset(),
  });

  return (
    <Dialog.Root open={open} onOpenChange={(details) => onOpenChange(details.open)} placement="center">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>My Profile</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Flex align="center" gap="3" mb="5">
                <Avatar size="lg" name={user?.name} bg="#0067D8" color="#FFFFFF" />
                <Stack gap="0">
                  <Text fontWeight="semibold">{user?.name}</Text>
                  <Text fontSize="sm" color="gray.600" wordBreak="break-all">
                    {user?.email}
                  </Text>
                </Stack>
                <Badge ml="auto" variant={user?.role}>
                  {user?.role}
                </Badge>
              </Flex>

              <Tabs.Root defaultValue="profile" fitted>
                <Tabs.List>
                  <Tabs.Trigger value="profile">Profile</Tabs.Trigger>
                  <Tabs.Trigger value="password">Password</Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content value="profile">
                  <form onSubmit={profileForm.handleSubmit((data) => saveProfile(data))} noValidate>
                    <Stack gap="4">
                      <Controller
                        name="name"
                        control={profileForm.control}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            label="Name"
                            placeholder="Enter your full name"
                            leftIcon={<LuUser />}
                            errorMessage={fieldState.error?.message}
                          />
                        )}
                      />
                      <Button type="submit" variant="primary" loading={isSavingProfile}>
                        Save Changes
                      </Button>
                    </Stack>
                  </form>
                </Tabs.Content>

                <Tabs.Content value="password">
                  <form onSubmit={passwordForm.handleSubmit((data) => savePassword(data))} noValidate>
                    <Stack gap="4">
                      <Controller
                        name="current_password"
                        control={passwordForm.control}
                        render={({ field, fieldState }) => (
                          <PasswordField
                            {...field}
                            label="Current Password"
                            placeholder="Enter your current password"
                            leftIcon={<LuLock />}
                            errorMessage={fieldState.error?.message}
                          />
                        )}
                      />
                      <Controller
                        name="new_password"
                        control={passwordForm.control}
                        render={({ field, fieldState }) => (
                          <PasswordField
                            {...field}
                            label="New Password"
                            placeholder="Enter a new password"
                            leftIcon={<LuLock />}
                            errorMessage={fieldState.error?.message}
                          />
                        )}
                      />
                      <Controller
                        name="confirm_password"
                        control={passwordForm.control}
                        render={({ field, fieldState }) => (
                          <PasswordField
                            {...field}
                            label="Confirm New Password"
                            placeholder="Enter the new password again"
                            leftIcon={<LuLock />}
                            errorMessage={fieldState.error?.message}
                          />
                        )}
                      />
                      <Button type="submit" variant="primary" loading={isSavingPassword}>
                        Change Password
                      </Button>
                    </Stack>
                  </form>
                </Tabs.Content>
              </Tabs.Root>
            </Dialog.Body>
            <Dialog.Footer justifyContent="space-between">
              <Button variant="ghost" colorPalette="red" onClick={onLogout}>
                <LuLogOut />
                Log out
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
