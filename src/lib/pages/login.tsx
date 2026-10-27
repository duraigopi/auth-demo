/* Lib module imports */
import { AuthLayout } from "@lib/components/layout";
import { LoginForm } from "@lib/forms/login";

export const LoginPage = () => (
  <AuthLayout title="Welcome back" subtitle="Log in to access your dashboard">
    <LoginForm />
  </AuthLayout>
);
