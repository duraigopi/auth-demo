/* Library imports */
import type { Metadata } from "next";

/* Lib module imports */
import { LoginPage } from "@lib/pages/login";

export const metadata: Metadata = {
  title: "Log in",
};

const Login = () => <LoginPage />;

export default Login;
