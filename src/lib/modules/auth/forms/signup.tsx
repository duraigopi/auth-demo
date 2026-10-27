"use client";

/* Library imports */
import NextLink from "next/link";
import { Controller, useForm } from "react-hook-form";
import type { FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Link, Stack, Text } from "@chakra-ui/react";

/* Shared module imports */
import { PasswordField } from "@shared/components/password-field";
import { TextField } from "@shared/components/text-field";
import { getErrorMessages } from "@shared/utils/form";
import { showSuccessToast } from "@shared/utils/notifications";

/* Auth module imports */
import { signupSchema } from "@auth/schema/auth";
import type { SignupFormData } from "@auth/types/auth";

export const SignupForm = () => {
  const { control, handleSubmit } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  /* No signup API yet, so this only confirms the form is valid */
  const onSubmit = (data: SignupFormData) => {
    showSuccessToast({
      title: "Signup Form Submitted",
      description: `Validation passed for ${data.email}. Connect the signup API to continue.`,
    });
  };

  const onError = (errors: FieldErrors<SignupFormData>) => {
    console.error("[Auth] Signup validation failed:", getErrorMessages(errors));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
      <Stack gap="4">
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Full name"
              placeholder="Enter your full name"
              autoComplete="name"
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
              placeholder="Enter your email address"
              autoComplete="email"
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
              autoComplete="new-password"
              errorMessage={fieldState.error?.message}
            />
          )}
        />

        <Controller
          name="confirmPassword"
          control={control}
          render={({ field, fieldState }) => (
            <PasswordField
              {...field}
              label="Confirm password"
              placeholder="Enter your password again"
              autoComplete="new-password"
              errorMessage={fieldState.error?.message}
            />
          )}
        />

        <Button type="submit">Sign up</Button>

        <Text textAlign="center" fontSize="sm">
          Already have an account?{" "}
          <Link asChild>
            <NextLink href="/auth/login">Log in</NextLink>
          </Link>
        </Text>
      </Stack>
    </form>
  );
};
