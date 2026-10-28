"use client";

/* Library imports */
import { useState } from "react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useDebounceValue } from "usehooks-ts";
import { Badge, Box, Flex, Heading, IconButton, Show, Spinner, Stack, Table, Text } from "@chakra-ui/react";
import { LuPencil, LuSearch, LuTrash2, LuUserCheck, LuUserX, LuUsers } from "react-icons/lu";

/* Lib module imports */
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { Tooltip } from "@/components/ui/tooltip";
import { EditUserDialog } from "@lib/components/edit-user-dialog";
import { Header } from "@lib/components/header";
import { deleteMockUserApi, disableMockUserApi, enableMockUserApi, listMockUsersApi } from "@lib/mock/users";
import type { PublicUser, UserListResponse } from "@lib/types/auth";

/* Shared module imports */
import { ConfirmationDialog } from "@shared/components/confirmation-dialog";
import { PaginationBar } from "@shared/components/pagination-bar";
import { TextField } from "@shared/components/text-field";
import { useApiMutation, useApiQuery } from "@shared/hooks/use-api-query";
import { formatDisplayDate } from "@shared/utils/time";

export const UsersPage = () => {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState("limit", parseAsInteger.withDefault(10));
  const [search, setSearch] = useQueryState("search", parseAsString.withDefault(""));
  const [debouncedSearch] = useDebounceValue(search, 300);

  const { data: users, pagination, isLoading } = useApiQuery<UserListResponse>({
    queryKey: ["users", page, limit, debouncedSearch],
    queryFn: () => listMockUsersApi({ page, limit, search: debouncedSearch }),
    keepPreviousData: true,
  });

  const [editUser, setEditUser] = useState<PublicUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<PublicUser | null>(null);

  const { mutate: removeUser, isLoading: isDeleting } = useApiMutation<undefined, string>({
    mutationFn: deleteMockUserApi,
    invalidateQueryKeys: [["users"]],
    successTitle: "User Deleted Successfully",
    successDescription: "The account has been removed.",
    errorTitle: "User Delete Failed",
    onSuccess: () => setDeleteUser(null),
  });

  const [enableTarget, setEnableTarget] = useState<PublicUser | null>(null);
  const [disableTarget, setDisableTarget] = useState<PublicUser | null>(null);

  const { mutate: enableUser, isLoading: isEnabling } = useApiMutation<undefined, string>({
    mutationFn: enableMockUserApi,
    invalidateQueryKeys: [["users"]],
    successTitle: "User Enabled Successfully",
    successDescription: "The account can log in again.",
    errorTitle: "User Enable Failed",
    onSuccess: () => setEnableTarget(null),
  });

  const { mutate: disableUser, isLoading: isDisabling } = useApiMutation<undefined, string>({
    mutationFn: disableMockUserApi,
    invalidateQueryKeys: [["users"]],
    successTitle: "User Disabled Successfully",
    successDescription: "The account can no longer log in.",
    errorTitle: "User Disable Failed",
    onSuccess: () => setDisableTarget(null),
  });

  const onSearch = (value: string) => {
    setSearch(value);
    /* A new search starts from the first page */
    setPage(1);
  };

  const onPageSizeChange = (value: number) => {
    setLimit(value);
    setPage(1);
  };

  return (
    <Box minH="100vh">
      <Header />
      <Stack maxW="5xl" mx="auto" gap="6" p={["4", "8"]}>
        <Stack gap="1" color="#FFFFFF">
          <Heading size="2xl">Users</Heading>
          <Text opacity="0.9">Everyone who has an account.</Text>
        </Stack>

        <Box bg="#F5F9FD" rounded="2xl" shadow="md" p="6">
          <Box maxW="sm" mb="4">
            <TextField
              value={search}
              placeholder="Search by name or email"
              leftIcon={<LuSearch />}
              onChange={(event) => onSearch(event.target.value)}
            />
          </Box>

          <Show
            when={!isLoading}
            fallback={
              <Flex justify="center" py="10">
                <Spinner />
              </Flex>
            }
          >
            <Show
              when={!!users?.length}
              fallback={
                <EmptyState
                  icon={<LuUsers />}
                  title="No users found"
                  description="Try a different name or email."
                />
              }
            >
              <Box overflowX="auto" border="1px solid" borderColor="#D6E4F5" rounded="xl">
                <Table.Root interactive>
                  <Table.Header>
                    <Table.Row bgGradient="to-r" gradientFrom="#0067D8" gradientTo="#00B398">
                      {["Name", "Email", "Role", "Status", "Created At", "Actions"].map((heading) => (
                        <Table.ColumnHeader
                          key={heading}
                          py="3"
                          fontSize="xs"
                          fontWeight="semibold"
                          textTransform="uppercase"
                          letterSpacing="wider"
                          color="#FFFFFF"
                        >
                          {heading}
                        </Table.ColumnHeader>
                      ))}
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {users?.map((user, index) => (
                      <Table.Row
                        key={user.user_id}
                        bg={index % 2 ? "#EAF3FC" : "#FFFFFF"}
                        _hover={{ bg: "#DCEBFA" }}
                      >
                        <Table.Cell py="3">
                          <Flex align="center" gap="3">
                            <Avatar size="sm" name={user.name} bg="#0067D8" color="#FFFFFF" />
                            <Text fontWeight="medium">{user.name}</Text>
                          </Flex>
                        </Table.Cell>
                        <Table.Cell color="gray.600">{user.email}</Table.Cell>
                        <Table.Cell>
                          <Badge colorPalette={user.role === "ADMIN" ? "blue" : "gray"}>{user.role}</Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge colorPalette={user.is_active ? "green" : "red"}>
                            {user.is_active ? "Active" : "Disabled"}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell color="gray.600" whiteSpace="nowrap">
                          {formatDisplayDate(user.created_at)}
                        </Table.Cell>
                        <Table.Cell>
                          <Flex gap="1">
                            <Tooltip content="Edit user">
                              <IconButton
                                aria-label="Edit user"
                                size="xs"
                                variant="ghost"
                                color="#0067D8"
                                onClick={() => setEditUser(user)}
                              >
                                <LuPencil />
                              </IconButton>
                            </Tooltip>
                            <Tooltip content={user.is_active ? "Disable user" : "Enable user"}>
                              <IconButton
                                aria-label={user.is_active ? "Disable user" : "Enable user"}
                                size="xs"
                                variant="ghost"
                                color={user.is_active ? "orange.600" : "green.600"}
                                onClick={() => (user.is_active ? setDisableTarget(user) : setEnableTarget(user))}
                              >
                                {user.is_active ? <LuUserX /> : <LuUserCheck />}
                              </IconButton>
                            </Tooltip>
                            <Tooltip content="Delete user">
                              <IconButton
                                aria-label="Delete user"
                                size="xs"
                                variant="ghost"
                                color="red.600"
                                onClick={() => setDeleteUser(user)}
                              >
                                <LuTrash2 />
                              </IconButton>
                            </Tooltip>
                          </Flex>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Box>

              <PaginationBar
                page={page}
                pageSize={limit}
                count={pagination?.total ?? 0}
                onPageChange={setPage}
                onPageSizeChange={onPageSizeChange}
              />
            </Show>
          </Show>
        </Box>
      </Stack>

      <EditUserDialog user={editUser} onClose={() => setEditUser(null)} />
      <ConfirmationDialog
        open={!!deleteUser}
        onOpenChange={(open) => !open && setDeleteUser(null)}
        title="Delete User"
        description={`Delete ${deleteUser?.name ?? "this user"} permanently? This cannot be undone.`}
        confirmLabel="Delete"
        tone="danger"
        isLoading={isDeleting}
        onConfirm={() => deleteUser && removeUser(deleteUser.user_id)}
      />
      <ConfirmationDialog
        open={!!enableTarget}
        onOpenChange={(open) => !open && setEnableTarget(null)}
        title="Enable User"
        description={`Allow ${enableTarget?.name ?? "this user"} to log in again?`}
        confirmLabel="Enable"
        isLoading={isEnabling}
        onConfirm={() => enableTarget && enableUser(enableTarget.user_id)}
      />
      <ConfirmationDialog
        open={!!disableTarget}
        onOpenChange={(open) => !open && setDisableTarget(null)}
        title="Disable User"
        description={`${disableTarget?.name ?? "This user"} will no longer be able to log in.`}
        confirmLabel="Disable"
        tone="danger"
        isLoading={isDisabling}
        onConfirm={() => disableTarget && disableUser(disableTarget.user_id)}
      />
    </Box>
  );
};
