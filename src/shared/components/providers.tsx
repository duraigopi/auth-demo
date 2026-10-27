"use client";

/* Library imports */
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";

/* Lib module imports */
import { Provider } from "@/components/ui/provider";
import { Toaster } from "@/components/ui/toaster";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, /* 5 minutes */
            gcTime: 10 * 60 * 1000,   /* 10 minutes */
            retry: 1,
          },
        },
      }),
  );

  return (
    <Provider>
      <QueryClientProvider client={queryClient}>
        <NuqsAdapter>{children}</NuqsAdapter>
        <Toaster />
      </QueryClientProvider>
    </Provider>
  );
};
