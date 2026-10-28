"use client";

/* Library imports */
import { useRouter } from "next/navigation";
import { Badge, Box, Flex, Heading, Icon, Menu, Portal, Skeleton, Text } from "@chakra-ui/react";
import { LuLogOut, LuShieldCheck } from "react-icons/lu";

/* Lib module imports */
import { Avatar } from "@/components/ui/avatar";
import { logoutApi } from "@lib/api/auth";
import { getMeApi } from "@lib/api/me";
import type { UserResponse } from "@lib/types/auth";

/* Shared module imports */
import { useApiQuery } from "@shared/hooks/use-api-query";
import { clearTokens } from "@shared/utils/token-storage";

/* Top bar for the signed-in pages: the app name and a profile menu with the user's details and log out */
export const Header = () => {
  const router = useRouter();
  const { data: me, isLoading } = useApiQuery<UserResponse>({
    queryKey: ["me"],
    queryFn: getMeApi,
  });

  const onLogout = async () => {
    /* The tokens are cleared even if the API call fails, so the user is always logged out here */
    await logoutApi();
    clearTokens();
    router.push("/auth/login");
  };

  return (
    <Box as="header" bg="#0A2A4F" color="#FFFFFF" shadow="md" position="sticky" top="0" zIndex="sticky">
      <Flex h="16" px={["4", "8"]} align="center" justify="space-between">
        <Flex align="center" gap="3">
          <Flex
            boxSize="9"
            rounded="lg"
            align="center"
            justify="center"
            color="#FFFFFF"
            bgGradient="to-br"
            gradientFrom="#0067D8"
            gradientTo="#00B398"
          >
            <Icon boxSize="5">
              <LuShieldCheck />
            </Icon>
          </Flex>
          <Heading size="md" color="#FFFFFF">Auth Demo</Heading>
        </Flex>

        <Menu.Root positioning={{ placement: "bottom-end" }}>
          <Menu.Trigger asChild>
            <Box as="button" aria-label="Open profile menu" rounded="full" cursor="pointer" _hover={{ opacity: 0.85 }}>
              <Skeleton loading={isLoading} rounded="full">
                <Avatar size="md" name={me?.name} bg="#00B398" color="#FFFFFF" />
              </Skeleton>
            </Box>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content minW="64">
                <Flex direction="column" gap="1" px="3" py="2">
                  <Text fontWeight="semibold">{me?.name}</Text>
                  <Text fontSize="sm" color="gray.600" wordBreak="break-all">
                    {me?.email}
                  </Text>
                  <Badge alignSelf="flex-start" colorPalette={me?.role === "ADMIN" ? "blue" : "gray"}>
                    {me?.role}
                  </Badge>
                </Flex>
                <Menu.Separator />
                <Menu.Item value="logout" onClick={onLogout}>
                  <LuLogOut />
                  Log out
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
      </Flex>
    </Box>
  );
};
