"use client";

/* Library imports */
import { useEffect } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import type { FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Link, Stack, Text } from "@chakra-ui/react";
import { LuLock, LuMail } from "react-icons/lu";

/* Lib module imports */
import { loginApi } from "@lib/api/auth";
import { loginSchema } from "@lib/schema/auth";
import type { LoginFormData, LoginResponse } from "@lib/types/auth";

/* Shared module imports */
import { PasswordField } from "@shared/components/password-field";
import { TextField } from "@shared/components/text-field";
import { useApiMutation } from "@shared/hooks/use-api-query";
import { useRedirectIfLoggedIn } from "@shared/hooks/use-redirect-if-logged-in";
import { getErrorMessages } from "@shared/utils/form";
import { showErrorToast } from "@shared/utils/notifications";
import { saveTokens, takeSessionEnded } from "@shared/utils/token-storage";

export const LoginForm = () => {
  useRedirectIfLoggedIn();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { control, handleSubmit } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (takeSessionEnded()) {
      showErrorToast({
        title: "Session Ended",
        description: "Your session has ended. Please log in again.",
      });
    }
  }, []);

  const { mutate: login, isLoading } = useApiMutation<LoginResponse, LoginFormData>({
    mutationFn: loginApi,
    successTitle: "Logged In Successfully",
    successDescription: "Welcome back.",
    errorTitle: "Login Failed",
    onSuccess: ({ accessToken, refreshToken }) => {
      saveTokens({ accessToken, refreshToken });
      queryClient.clear();
      router.push("/");
    },
  });

  const onSubmit = (data: LoginFormData) => login(data);

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

        <Button type="submit" variant="primary" size="lg" loading={isLoading}>
          Log in
        </Button>

        <Text textAlign="center" fontSize="sm">
          Don&apos;t have an account?{" "}
          <Link asChild>
            <NextLink href="/auth/signup" prefetch={false}>Sign up</NextLink>
          </Link>
        </Text>
      </Stack>
    </form>
  );
};
