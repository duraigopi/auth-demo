/* Library imports */
import type { ReactNode } from "react";
import { Box, Flex, Heading, Text } from "@chakra-ui/react";

/* Props for the centered card shared by every auth page */
export interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export const AuthLayout = ({ title, subtitle, children }: AuthLayoutProps) => (
  <Flex minH="100vh" align="center" justify="center" p="4">
    <Box w="full" maxW="sm" borderWidth="1px" rounded="md" p="6">
      <Heading size="xl" mb="1">
        {title}
      </Heading>
      <Text color="fg.muted" mb="6">
        {subtitle}
      </Text>
      {children}
    </Box>
  </Flex>
);
