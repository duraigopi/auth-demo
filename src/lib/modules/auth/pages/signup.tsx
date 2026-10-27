/* Auth module imports */
import { AuthLayout } from "@auth/components/layout";
import { SignupForm } from "@auth/forms/signup";

export const SignupPage = () => (
  <AuthLayout title="Sign up" subtitle="Create an account to get started.">
    <SignupForm />
  </AuthLayout>
);
