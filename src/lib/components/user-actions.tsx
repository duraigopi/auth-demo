"use client";

/* Library imports */
import { Flex, IconButton } from "@chakra-ui/react";
import { LuPencil, LuTrash2, LuUserCheck, LuUserX } from "react-icons/lu";

/* Lib module imports */
import { Tooltip } from "@/components/ui/tooltip";
import type { PublicUser } from "@lib/types/auth";

/* Props for the edit, enable or disable, and delete buttons of one user */
export interface UserActionsProps {
  user: PublicUser;
  /* The signed-in user, who can't disable or delete their own account */
  currentUserId?: string;
  onEdit: (user: PublicUser) => void;
  onToggleStatus: (user: PublicUser) => void;
  onDelete: (user: PublicUser) => void;
}

export const UserActions = ({ user, currentUserId, onEdit, onToggleStatus, onDelete }: UserActionsProps) => {
  const isSelf = user.user_id === currentUserId;

  return (
    <Flex gap="1">
      <Tooltip content="Edit user">
        <IconButton aria-label="Edit user" size="xs" variant="ghost" color="#0067D8" onClick={() => onEdit(user)}>
          <LuPencil />
        </IconButton>
      </Tooltip>
      <Tooltip content={isSelf ? "You can't change your own status" : user.is_active ? "Disable user" : "Enable user"}>
        <IconButton
          aria-label={user.is_active ? "Disable user" : "Enable user"}
          disabled={isSelf}
          size="xs"
          variant="ghost"
          color={user.is_active ? "orange.600" : "green.600"}
          onClick={() => onToggleStatus(user)}
        >
          {user.is_active ? <LuUserX /> : <LuUserCheck />}
        </IconButton>
      </Tooltip>
      <Tooltip content={isSelf ? "You can't delete your own account" : "Delete user"}>
        <IconButton
          aria-label="Delete user"
          disabled={isSelf}
          size="xs"
          variant="ghost"
          color="red.600"
          onClick={() => onDelete(user)}
        >
          <LuTrash2 />
        </IconButton>
      </Tooltip>
    </Flex>
  );
};
