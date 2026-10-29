/* Library imports */
import type { ReactNode } from "react";
import { Box, Flex, Heading, Stack, Text } from "@chakra-ui/react";

/* Props for the auth page card layout */
export interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export const AuthLayout = ({ title, subtitle, children }: AuthLayoutProps) => (
  <Flex
    minH="100vh"
    direction="column"
    align="center"
    justify="center"
    gap="6"
    p="4"
  >
    <Stack align="center" gap="1" color="#FFFFFF" textAlign="center">
      <Heading size="3xl">{title}</Heading>
      <Text>{subtitle}</Text>
    </Stack>
    <Box w="full" maxW="md" bg="#FFFFFF" rounded="3xl" shadow="2xl" p="8">
      {children}
    </Box>
  </Flex>
);
