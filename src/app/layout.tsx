/* Library imports */
import type { Metadata } from "next";

/* Shared module imports */
import { Providers } from "@shared/components/providers";

export const metadata: Metadata = {
  title: "Auth Demo",
  description: "Log in, manage your profile, and manage users with role-based access.",
};

const RootLayout = ({ children }: LayoutProps<"/">) => (
  <html lang="en" suppressHydrationWarning>
    <body suppressHydrationWarning>
      <Providers>{children}</Providers>
    </body>
  </html>
);

export default RootLayout;
