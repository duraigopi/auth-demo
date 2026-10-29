/* Lib module imports */
import { AuthLayout } from "@lib/components/layout";
import { SignupForm } from "@lib/forms/signup";

export const SetupAdminPage = () => (
  <AuthLayout title="Set up the first admin" subtitle="Create the admin account for this app">
    <SignupForm mode="setup" />
  </AuthLayout>
);
