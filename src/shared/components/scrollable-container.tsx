"use client";

/* Library imports */
import type { ReactNode } from "react";
import { ScrollArea, Show } from "@chakra-ui/react";
import type { ScrollAreaRootProps } from "@chakra-ui/react";

/* Props of the scrollable container, which wraps Chakra's ScrollArea with the app's scrollbar look */
export interface ScrollableContainerProps extends ScrollAreaRootProps {
  children: ReactNode;
  /* Scroll direction; vertical is the default */
  orientation?: "vertical" | "horizontal" | "both";
  /* Scrolling still works, but no scrollbar is drawn */
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
      {/* A vertical area must not grow wider than its parent, because the content sets min-width inline */}
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
