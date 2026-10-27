"use client";

/* Library imports */
import NextLink from "next/link";
import { Controller, useForm } from "react-hook-form";
import type { FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Link, Stack, Text } from "@chakra-ui/react";
import { LuLock, LuMail } from "react-icons/lu";

/* Shared module imports */
import { PasswordField } from "@shared/components/password-field";
import { TextField } from "@shared/components/text-field";
import { getErrorMessages } from "@shared/utils/form";
import { showSuccessToast } from "@shared/utils/notifications";

/* Auth module imports */
import { loginSchema } from "@auth/schema/auth";
import type { LoginFormData } from "@auth/types/auth";

export const LoginForm = () => {
  const { control, handleSubmit } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  /* No login API yet, so this only confirms the form is valid */
  const onSubmit = (data: LoginFormData) => {
    showSuccessToast({
      title: "Login Form Submitted",
      description: `Validation passed for ${data.email}. Connect the login API to continue.`,
    });
  };

  const onError = (errors: FieldErrors<LoginFormData>) => {
    console.error("[Auth] Login validation failed:", getErrorMessages(errors));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
      <Stack gap="4">
        <Controller
          name="email"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Email"
              type="email"
              placeholder="Enter your email address"
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
              placeholder="Enter your password"
              leftIcon={<LuLock />}
              errorMessage={fieldState.error?.message}
            />
          )}
        />

        <Button type="submit" variant="primary" size="lg">
          Log in
        </Button>

        <Text textAlign="center" fontSize="sm">
          Don&apos;t have an account?{" "}
          <Link asChild>
            <NextLink href="/auth/signup">Sign up</NextLink>
          </Link>
        </Text>
      </Stack>
    </form>
  );
};
