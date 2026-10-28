"use client";

/* Library imports */
import type { ReactNode } from "react";
import { Button, CloseButton, Dialog, Portal, Show, Text } from "@chakra-ui/react";

/* Props of the confirmation popup, which asks the user to confirm before an action runs */
export interface ConfirmationDialogProps {
  title: string;
  description?: ReactNode;
  /* Extra content under the description, such as form fields */
  children?: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  /* danger makes the confirm button red, for actions that remove or block something */
  tone?: "primary" | "danger";
  /* Disables the buttons while the request is running */
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
