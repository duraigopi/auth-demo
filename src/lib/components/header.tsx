"use client";

/* Library imports */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Flex, Heading, Icon, Skeleton } from "@chakra-ui/react";
import { LuShieldCheck } from "react-icons/lu";

/* Lib module imports */
import { Avatar } from "@/components/ui/avatar";
import { logoutApi } from "@lib/api/auth";
import { getMeApi } from "@lib/api/me";
import { ProfileDialog } from "@lib/components/profile-dialog";
import type { UserResponse } from "@lib/types/auth";

/* Shared module imports */
import { useApiQuery } from "@shared/hooks/use-api-query";
import { clearTokens } from "@shared/utils/token-storage";

/* Top bar for the signed-in pages: the app name and the profile avatar, which opens the profile popup */
export const Header = () => {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
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

        <Box
          as="button"
          aria-label="Open profile"
          rounded="full"
          cursor="pointer"
          _hover={{ opacity: 0.85 }}
          onClick={() => setProfileOpen(true)}
        >
          <Skeleton loading={isLoading} rounded="full">
            <Avatar size="md" name={me?.name} bg="#00B398" color="#FFFFFF" />
          </Skeleton>
        </Box>
      </Flex>

      <ProfileDialog user={me} open={profileOpen} onOpenChange={setProfileOpen} onLogout={onLogout} />
    </Box>
  );
};
