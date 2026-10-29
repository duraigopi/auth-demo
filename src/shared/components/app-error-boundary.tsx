"use client";

/* Library imports */
import type { ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Button, Flex, Heading, Icon, Stack, Text } from "@chakra-ui/react";
import { LuTriangleAlert } from "react-icons/lu";

/* Props for the error boundary, source names the page or section in the log */
export interface AppErrorBoundaryProps {
  source: string;
  /* Takes the whole screen by default, turn it off for a section inside a page */
  fullScreen?: boolean;
  children: ReactNode;
}

export const AppErrorBoundary = ({ source, fullScreen = true, children }: AppErrorBoundaryProps) => (
  <ErrorBoundary
    onError={(error) => {
      console.error(`[App] Render failed in ${source}:`, error instanceof Error ? error.message : "Unknown error");
    }}
    fallbackRender={({ resetErrorBoundary }) => (
      <Flex justify="center" align="center" minH={fullScreen ? "100dvh" : "xs"} p="4">
        <Stack align="center" gap="4" bg="#FFFFFF" rounded="2xl" shadow="xl" p="8" maxW="md" textAlign="center">
          <Icon boxSize="10" color="#DC2626">
            <LuTriangleAlert />
          </Icon>
          <Heading size="lg">Something went wrong</Heading>
          <Text color="gray.600">An unexpected error happened. Please try again.</Text>
          <Button variant="primary" onClick={resetErrorBoundary}>
            Try Again
          </Button>
        </Stack>
      </Flex>
    )}
  >
    {children}
  </ErrorBoundary>
);
