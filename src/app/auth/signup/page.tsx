/* Library imports */
import type { Metadata } from "next";

/* Lib module imports */
import { SignupPage } from "@lib/pages/signup";

export const metadata: Metadata = {
  title: "Sign up",
};

const Signup = () => <SignupPage />;

export default Signup;
