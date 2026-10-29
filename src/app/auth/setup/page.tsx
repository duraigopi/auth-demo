/* Library imports */
import type { Metadata } from "next";

/* Lib module imports */
import { SetupAdminPage } from "@lib/pages/setup-admin";

export const metadata: Metadata = {
  title: "Set up admin",
};

const SetupAdmin = () => <SetupAdminPage />;

export default SetupAdmin;
