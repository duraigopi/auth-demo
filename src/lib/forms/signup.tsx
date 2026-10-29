"use client";

/* Library imports */
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import type { FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Link, Stack, Text } from "@chakra-ui/react";
import { LuLock, LuMail, LuUser } from "react-icons/lu";

/* Lib module imports */
import { setupAdminApi, signupApi } from "@lib/api/auth";
import { signupSchema } from "@lib/schema/auth";
import type { SignupFormData, SignupRequestBody, UserResponse } from "@lib/types/auth";

/* Shared module imports */
import { PasswordField } from "@shared/components/password-field";
import { TextField } from "@shared/components/text-field";
import { useApiMutation } from "@shared/hooks/use-api-query";
import { useRedirectIfLoggedIn } from "@shared/hooks/use-redirect-if-logged-in";
import { getErrorMessages } from "@shared/utils/form";

/* Props for the signup form, setup mode creates the first admin instead of a client */
export interface SignupFormProps {
  mode?: "signup" | "setup";
}

export const SignupForm = ({ mode = "signup" }: SignupFormProps) => {
  useRedirectIfLoggedIn();
  const router = useRouter();
  const { control, handleSubmit } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { mutate: signup, isLoading: isSigningUp, isSuccess: isSignedUp } = useApiMutation<UserResponse, SignupRequestBody>({
    mutationFn: signupApi,
    successTitle: "Account Created Successfully",
    successDescription: "You can log in now.",
    errorTitle: "Signup Failed",
    onSuccess: () => router.push("/auth/login"),
  });

  const { mutate: setupAdmin, isLoading: isSettingUp, isSuccess: isSetUp } = useApiMutation<undefined, SignupRequestBody>({
    mutationFn: setupAdminApi,
    successTitle: "Admin Created Successfully",
    successDescription: "You can log in now.",
    errorTitle: "Setup Failed",
    onSuccess: () => router.push("/auth/login"),
  });

  /* confirmPassword is not sent to the API */
  const onSubmit = ({ name, email, password }: SignupFormData) => {
    const body = { name, email, password };
    if (mode === "setup") setupAdmin(body);
    else signup(body);
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
              placeholder="Enter your email address"
              autoComplete="email"
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
              autoComplete="new-password"
              leftIcon={<LuLock />}
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
              leftIcon={<LuLock />}
              errorMessage={fieldState.error?.message}
            />
          )}
        />

        {/* Stays loading after success until the page changes */}
        <Button type="submit" variant="primary" size="lg" loading={isSigningUp || isSettingUp || isSignedUp || isSetUp}>
          {mode === "setup" ? "Create admin" : "Sign up"}
        </Button>

        <Text textAlign="center" fontSize="sm">
          Already have an account?{" "}
          <Link asChild color="#0067D8" fontWeight="semibold" _hover={{ color: "#0052AD", textDecoration: "underline" }}>
            <NextLink href="/auth/login" prefetch={false}>Log in</NextLink>
          </Link>
        </Text>
      </Stack>
    </form>
  );
};
