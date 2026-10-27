/* Auth module imports */
import { AuthLayout } from "@auth/components/layout";
import { LoginForm } from "@auth/forms/login";

export const LoginPage = () => (
  <AuthLayout title="Login" subtitle="Welcome back. Please log in to continue.">
    <LoginForm />
  </AuthLayout>
);
