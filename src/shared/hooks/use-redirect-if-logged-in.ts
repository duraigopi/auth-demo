"use client";

/* Library imports */
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/* Shared module imports */
import { getAccessToken } from "@shared/utils/token-storage";

/* Sends a user who is already logged in from the login and signup pages to the home page */
export const useRedirectIfLoggedIn = () => {
  const router = useRouter();

  useEffect(() => {
    if (getAccessToken()) router.replace("/");
  }, [router]);
};
