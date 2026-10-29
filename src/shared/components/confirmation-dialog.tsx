"use client";

/* Library imports */
import type { ReactNode } from "react";
import { Button, CloseButton, Dialog, Portal, Show, Text } from "@chakra-ui/react";

/* Props for the confirmation dialog */
export interface ConfirmationDialogProps {
  title: string;
  description?: ReactNode;
  /* Extra content such as form fields */
  children?: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  /* danger gives a red confirm button */
  tone?: "primary" | "danger";
  /* Disables the buttons during the request */
  isLoading?: boolean;
}

export const ConfirmationDialog = ({
  title,
  description,
  children,
  open,
  onOpenChange,
  onConfirm,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "primary",
  isLoading = false,
}: ConfirmationDialogProps) => (
  <Dialog.Root
    open={open}
    onOpenChange={(details) => onOpenChange(details.open)}
    role="alertdialog"
    placement="center"
    scrollBehavior="inside"
  >
    <Portal>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>{title}</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <Show when={!!description}>
              <Text>{description}</Text>
            </Show>
            {children}
          </Dialog.Body>
          <Dialog.Footer>
            <Button variant="outline" disabled={isLoading} onClick={() => onOpenChange(false)}>
              {cancelLabel}
            </Button>
            <Button
              variant={tone === "danger" ? "solid" : "primary"}
              colorPalette={tone === "danger" ? "red" : undefined}
              loading={isLoading}
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </Dialog.Footer>
          <Dialog.CloseTrigger asChild>
            <CloseButton size="sm" />
          </Dialog.CloseTrigger>
        </Dialog.Content>
      </Dialog.Positioner>
    </Portal>
  </Dialog.Root>
);
