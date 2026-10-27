/* Lib module imports */
import { AuthLayout } from "@lib/components/layout";
import { SignupForm } from "@lib/forms/signup";

export const SignupPage = () => (
  <AuthLayout title="Create your account" subtitle="Sign up to get started">
    <SignupForm />
  </AuthLayout>
);
