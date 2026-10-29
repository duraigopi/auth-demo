"use client";

/* Library imports */
import type { ReactNode } from "react";
import { ScrollArea, Show } from "@chakra-ui/react";
import type { ScrollAreaRootProps } from "@chakra-ui/react";

/* Props for the scroll container, wraps Chakra ScrollArea */
export interface ScrollableContainerProps extends ScrollAreaRootProps {
  children: ReactNode;
  /* Defaults to vertical */
  orientation?: "vertical" | "horizontal" | "both";
  /* Hide the scrollbar but keep scrolling */
  hideScrollbar?: boolean;
}

export const ScrollableContainer = ({
  children,
  orientation = "vertical",
  hideScrollbar = false,
  ...rootProps
}: ScrollableContainerProps) => (
  <ScrollArea.Root w="100%" {...rootProps}>
    <ScrollArea.Viewport>
      {/* Keeps vertical areas from getting wider than the parent */}
      <ScrollArea.Content css={orientation === "vertical" ? { minWidth: "0 !important" } : undefined}>
        {children}
      </ScrollArea.Content>
    </ScrollArea.Viewport>

    <Show when={!hideScrollbar && orientation !== "horizontal"}>
      <ScrollArea.Scrollbar orientation="vertical">
        <ScrollArea.Thumb bg="#9FBBDD" rounded="full" />
      </ScrollArea.Scrollbar>
    </Show>

    <Show when={!hideScrollbar && orientation !== "vertical"}>
      <ScrollArea.Scrollbar orientation="horizontal">
        <ScrollArea.Thumb bg="#9FBBDD" rounded="full" />
      </ScrollArea.Scrollbar>
    </Show>

    <Show when={!hideScrollbar && orientation === "both"}>
      <ScrollArea.Corner />
    </Show>
  </ScrollArea.Root>
);
