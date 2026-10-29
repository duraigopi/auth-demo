"use client";

/* Library imports */
import { Badge, Box, Flex, Heading, SimpleGrid, Stack, Text } from "@chakra-ui/react";

/* Lib module imports */
import { Avatar } from "@/components/ui/avatar";
import type { UserResponse } from "@lib/types/auth";

/* Shared module imports */
import { formatDisplayDate } from "@shared/utils/time";

/* Props for the client home page */
export interface ClientHomePageProps {
  user: UserResponse | null;
}

export const ClientHomePage = ({ user }: ClientHomePageProps) => {
  const details = [
    { label: "Email", value: user?.email },
    { label: "Role", value: <Badge variant={user?.role}>{user?.role}</Badge> },
    {
      label: "Status",
      value: <Badge variant={user?.is_active ? "active" : "inactive"}>{user?.is_active ? "Active" : "Inactive"}</Badge>,
    },
    { label: "Member Since", value: formatDisplayDate(user?.created_at) },
  ];

  return (
    <Stack maxW="3xl" mx="auto" gap="6" p={["4", "8"]}>
      <Stack gap="1" color="#FFFFFF">
        <Heading size="2xl">Welcome, {user?.name}!</Heading>
        <Text opacity="0.9">Here are your account details. Use the profile icon at the top right to update them.</Text>
      </Stack>

      <Box bg="#F5F9FD" rounded="2xl" shadow="md" p="6">
        <Flex align="center" gap="4" mb="6">
          <Avatar size="xl" name={user?.name} bg="#0067D8" color="#FFFFFF" />
          <Stack gap="0">
            <Heading size="lg">{user?.name}</Heading>
            <Text color="gray.600">{user?.email}</Text>
          </Stack>
        </Flex>

        <SimpleGrid columns={[1, 2]} gap="4">
          {details.map((detail) => (
            <Stack key={detail.label} gap="1" bg="#FFFFFF" rounded="xl" p="4" border="1px solid" borderColor="#D6E4F5">
              <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" color="#0067D8">
                {detail.label}
              </Text>
              <Box wordBreak="break-all">{detail.value}</Box>
            </Stack>
          ))}
        </SimpleGrid>
      </Box>
    </Stack>
  );
};
