"use client";

/* Library imports */
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Stack } from "@chakra-ui/react";
import { LuLock, LuMail, LuUser } from "react-icons/lu";

/* Lib module imports */
import { createUserApi } from "@lib/api/users";
import { USER_ROLE_CHOICES, USER_ROLES } from "@lib/constants/auth";
import { createUserSchema } from "@lib/schema/users";
import type { CreateUserFormData } from "@lib/types/auth";

/* Shared module imports */
import { ConfirmationDialog } from "@shared/components/confirmation-dialog";
import { PasswordField } from "@shared/components/password-field";
import { SelectField } from "@shared/components/select-field";
import { TextField } from "@shared/components/text-field";
import { useApiMutation } from "@shared/hooks/use-api-query";

/* Props for the add user dialog */
export interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
}

const EMPTY_FORM: CreateUserFormData = {
  name: "",
  email: "",
  password: "",
  role: USER_ROLES.CLIENT,
};

export const CreateUserDialog = ({ open, onClose }: CreateUserDialogProps) => {
  const { control, handleSubmit, reset } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: EMPTY_FORM,
  });

  const { mutate: createUser, isLoading } = useApiMutation<undefined, CreateUserFormData>({
    mutationFn: createUserApi,
    invalidateQueryKeys: [["users"]],
    successTitle: "User Created Successfully",
    successDescription: "The account is ready to log in.",
    errorTitle: "User Create Failed",
    onSuccess: () => {
      reset(EMPTY_FORM);
      onClose();
    },
  });

  const onSubmit = handleSubmit((data) => createUser(data));

  const onOpenChange = (isOpen: boolean) => {
    if (isOpen) return;
    reset(EMPTY_FORM);
    onClose();
  };

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add User"
      confirmLabel="Create"
      isLoading={isLoading}
      onConfirm={onSubmit}
    >
      <form onSubmit={onSubmit} noValidate>
        <button type="submit" hidden />
        <Stack gap="4">
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Name"
                placeholder="Enter the full name"
                leftIcon={<LuUser />}
                errorMessage={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Email"
                type="email"
                placeholder="Enter the email address"
                leftIcon={<LuMail />}
                errorMessage={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="password"
            control={control}
            render={({ field, fieldState }) => (
              <PasswordField
                {...field}
                label="Password"
                placeholder="Enter a password"
                leftIcon={<LuLock />}
                errorMessage={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="role"
            control={control}
            render={({ field, fieldState }) => (
              <SelectField
                label="Role"
                value={field.value}
                options={USER_ROLE_CHOICES}
                onChange={field.onChange}
                errorMessage={fieldState.error?.message}
              />
            )}
          />
        </Stack>
      </form>
    </ConfirmationDialog>
  );
};
