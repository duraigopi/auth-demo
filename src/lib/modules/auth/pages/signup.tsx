/* Auth module imports */
import { AuthLayout } from "@auth/components/layout";
import { SignupForm } from "@auth/forms/signup";

export const SignupPage = () => (
  <AuthLayout title="Create your account" subtitle="Sign up to get started">
    <SignupForm />
  </AuthLayout>
);
