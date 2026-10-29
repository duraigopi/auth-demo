"use client";

/* Library imports */
import { Flex, Show, Spinner } from "@chakra-ui/react";

/* Lib module imports */
import { getMeApi } from "@lib/api/me";
import { USER_ROLES } from "@lib/constants/auth";
import { Header } from "@lib/components/header";
import { ClientHomePage } from "@lib/pages/client-home";
import { UsersPage } from "@lib/pages/users";
import type { UserResponse } from "@lib/types/auth";

/* Shared module imports */
import { AppErrorBoundary } from "@shared/components/app-error-boundary";
import { ScrollableContainer } from "@shared/components/scrollable-container";
import { useApiQuery } from "@shared/hooks/use-api-query";

/* Admins see the users list, clients see their own page */
export const HomePage = () => {
  const { data: me, isLoading } = useApiQuery<UserResponse>({
    queryKey: ["me"],
    queryFn: getMeApi,
  });

  return (
    /* Fixed height so only the content area scrolls */
    <Flex direction="column" h="100dvh">
      <Header />
      <ScrollableContainer flex="1" minH="0">
        <Show
          when={!isLoading}
          fallback={
            /* Center the spinner below the 4rem header */
            <Flex justify="center" align="center" minH="calc(100dvh - 4rem)">
              <Spinner color="#FFFFFF" size="lg" />
            </Flex>
          }
        >
          <AppErrorBoundary source="home" fullScreen={false}>
            <Show when={me?.role === USER_ROLES.ADMIN} fallback={me ? <ClientHomePage user={me} /> : null}>
              <UsersPage />
            </Show>
          </AppErrorBoundary>
        </Show>
      </ScrollableContainer>
    </Flex>
  );
};
