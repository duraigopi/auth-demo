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
import { ScrollableContainer } from "@shared/components/scrollable-container";
import { useApiQuery } from "@shared/hooks/use-api-query";

/* Root page: admins get the users list, everyone else gets their own account page */
export const HomePage = () => {
  const { data: me, isLoading } = useApiQuery<UserResponse>({
    queryKey: ["me"],
    queryFn: getMeApi,
  });

  return (
    /* The page is exactly one screen tall; only the area under the header scrolls, with our scrollbar */
    <Flex direction="column" h="100vh">
      <Header />
      <ScrollableContainer flex="1" minH="0">
        <Show
          when={!isLoading}
          fallback={
            /* The header is 4rem tall, so this fills the rest of the screen and centers the spinner in it */
            <Flex justify="center" align="center" minH="calc(100vh - 4rem)">
              <Spinner color="#FFFFFF" size="lg" />
            </Flex>
          }
        >
          <Show when={me?.role === USER_ROLES.ADMIN} fallback={<ClientHomePage user={me} />}>
            <UsersPage />
          </Show>
        </Show>
      </ScrollableContainer>
    </Flex>
  );
};
