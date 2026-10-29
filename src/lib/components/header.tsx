"use client";

/* Library imports */
import { useRouter } from "next/navigation";
import { useBoolean } from "usehooks-ts";
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
import { showSuccessToast } from "@shared/utils/notifications";
import { clearTokens } from "@shared/utils/token-storage";

/* Top bar with the app name and the profile avatar */
export const Header = () => {
  const router = useRouter();
  const { value: profileOpen, setValue: setProfileOpen, setTrue: openProfile, setFalse: closeProfile } = useBoolean(false);
  const { value: isLoggingOut, setTrue: startLogout, setFalse: endLogout } = useBoolean(false);
  const { data: me, isLoading } = useApiQuery<UserResponse>({
    queryKey: ["me"],
    queryFn: getMeApi,
  });

  const onLogout = async () => {
    if (isLoggingOut) return;
    startLogout();

    try {
      /* Clear the tokens even if the logout call fails */
      await logoutApi();
      clearTokens();
      closeProfile();
      showSuccessToast({
        title: "Signed Out",
        description: "You have been successfully logged out.",
      });
      router.push("/auth/login");
    } finally {
      endLogout();
    }
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
          onClick={openProfile}
        >
          <Skeleton loading={isLoading} rounded="full">
            <Avatar size="md" name={me?.name} bg="#00B398" color="#FFFFFF" />
          </Skeleton>
        </Box>
      </Flex>

      <ProfileDialog
        key={me?.user_id}
        user={me}
        open={profileOpen}
        isLoggingOut={isLoggingOut}
        onOpenChange={setProfileOpen}
        onLogout={onLogout}
      />
    </Box>
  );
};
