/* Auth module imports */
import { AuthLayout } from "@auth/components/layout";
import { LoginForm } from "@auth/forms/login";

export const LoginPage = () => (
  <AuthLayout title="Welcome back" subtitle="Log in to access your dashboard">
    <LoginForm />
  </AuthLayout>
);
