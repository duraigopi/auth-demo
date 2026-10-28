"use client";

/* Library imports */
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Stack } from "@chakra-ui/react";
import { LuUser } from "react-icons/lu";

/* Lib module imports */
import { updateMockUserApi } from "@lib/mock/users";
import { editUserSchema } from "@lib/schema/users";
import type { EditUserFormData, PublicUser } from "@lib/types/auth";

/* Shared module imports */
import { ConfirmationDialog } from "@shared/components/confirmation-dialog";
import { SelectField } from "@shared/components/select-field";
import { TextField } from "@shared/components/text-field";
import { useApiMutation } from "@shared/hooks/use-api-query";

/* Props of the edit dialog; it is open while a user is set */
export interface EditUserDialogProps {
  user: PublicUser | null;
  onClose: () => void;
}

const ROLES = [
  { label: "Admin", value: "ADMIN" },
  { label: "Client", value: "CLIENT" },
];

export const EditUserDialog = ({ user, onClose }: EditUserDialogProps) => {
  const { control, handleSubmit, reset } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: "",
      role: "CLIENT",
    },
  });

  /* Fill the form with the chosen user each time the dialog opens */
  useEffect(() => {
    if (user) reset({ name: user.name, role: user.role });
  }, [user, reset]);

  const { mutate: saveUser, isLoading } = useApiMutation<undefined, { userId: string; body: EditUserFormData }>({
    mutationFn: ({ userId, body }) => updateMockUserApi(userId, body),
    invalidateQueryKeys: [["users"]],
    successTitle: "User Updated Successfully",
    successDescription: "The changes have been saved.",
    errorTitle: "User Update Failed",
    onSuccess: onClose,
  });

  const onSubmit = handleSubmit((data) => {
    if (user) saveUser({ userId: user.user_id, body: data });
  });

  return (
    <ConfirmationDialog
      open={!!user}
      onOpenChange={(open) => !open && onClose()}
      title="Edit User"
      confirmLabel="Save"
      isLoading={isLoading}
      onConfirm={onSubmit}
    >
      <form onSubmit={onSubmit} noValidate>
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
            name="role"
            control={control}
            render={({ field, fieldState }) => (
              <SelectField
                label="Role"
                value={field.value}
                options={ROLES}
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
