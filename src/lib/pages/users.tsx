"use client";

/* Library imports */
import { useState } from "react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useDebounceValue } from "usehooks-ts";
import { Badge, Box, Button, Flex, Heading, Icon, IconButton, Show, Spinner, Stack, Table, Text } from "@chakra-ui/react";
import { LuRefreshCw, LuRotateCcw, LuSearch, LuUserPlus, LuUsers } from "react-icons/lu";

/* Lib module imports */
import { Avatar } from "@/components/ui/avatar";
import { DataListItem, DataListRoot } from "@/components/ui/data-list";
import { EmptyState } from "@/components/ui/empty-state";
import { Tooltip } from "@/components/ui/tooltip";
import { getMeApi } from "@lib/api/me";
import { deleteUserApi, disableUserApi, enableUserApi, listUsersApi } from "@lib/api/users";
import { CreateUserDialog } from "@lib/components/create-user-dialog";
import { EditUserDialog } from "@lib/components/edit-user-dialog";
import { UserActions } from "@lib/components/user-actions";
import type { PublicUser, UserListResponse, UserResponse } from "@lib/types/auth";

/* Shared module imports */
import { ConfirmationDialog } from "@shared/components/confirmation-dialog";
import { DateField } from "@shared/components/date-field";
import { PaginationBar } from "@shared/components/pagination-bar";
import { ScrollableContainer } from "@shared/components/scrollable-container";
import { TextField } from "@shared/components/text-field";
import { useApiMutation, useApiQuery } from "@shared/hooks/use-api-query";
import { formatDisplayDate } from "@shared/utils/time";

export const UsersPage = () => {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState("limit", parseAsInteger.withDefault(10));
  const [search, setSearch] = useQueryState("search", parseAsString.withDefault(""));
  const [from, setFrom] = useQueryState("from", parseAsString.withDefault(""));
  const [to, setTo] = useQueryState("to", parseAsString.withDefault(""));
  const [debouncedSearch] = useDebounceValue(search, 300);

  const { data: users, pagination, isLoading, isFetching, refetch } = useApiQuery<UserListResponse>({
    queryKey: ["users", page, limit, debouncedSearch, from, to],
    queryFn: () => listUsersApi({ page, limit, search: debouncedSearch, from, to }),
    keepPreviousData: true,
  });

  /* The signed-in admin, so their own row can't be disabled, deleted or demoted */
  const { data: me } = useApiQuery<UserResponse>({
    queryKey: ["me"],
    queryFn: getMeApi,
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<PublicUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<PublicUser | null>(null);

  const { mutate: removeUser, isLoading: isDeleting } = useApiMutation<undefined, string>({
    mutationFn: deleteUserApi,
    invalidateQueryKeys: [["users"]],
    successTitle: "User Deleted Successfully",
    successDescription: "The account has been removed.",
    errorTitle: "User Delete Failed",
    onSuccess: () => setDeleteUser(null),
  });

  const [enableTarget, setEnableTarget] = useState<PublicUser | null>(null);
  const [disableTarget, setDisableTarget] = useState<PublicUser | null>(null);

  const { mutate: enableUser, isLoading: isEnabling } = useApiMutation<undefined, string>({
    mutationFn: enableUserApi,
    invalidateQueryKeys: [["users"]],
    successTitle: "User Enabled Successfully",
    successDescription: "The account can log in again.",
    errorTitle: "User Enable Failed",
    onSuccess: () => setEnableTarget(null),
  });

  const { mutate: disableUser, isLoading: isDisabling } = useApiMutation<undefined, string>({
    mutationFn: disableUserApi,
    invalidateQueryKeys: [["users"]],
    successTitle: "User Disabled Successfully",
    successDescription: "The account can no longer log in.",
    errorTitle: "User Disable Failed",
    onSuccess: () => setDisableTarget(null),
  });

  const onSearch = (value: string) => {
    setSearch(value);
    /* Go back to page 1 on a new search */
    setPage(1);
  };

  /* True when any filter is set */
  const hasActiveFilters = !!search || !!from || !!to;

  const onFromChange = (value: string) => {
    setFrom(value);
    setPage(1);
  };

  const onToChange = (value: string) => {
    setTo(value);
    setPage(1);
  };

  const onClearFilters = () => {
    setSearch("");
    setFrom("");
    setTo("");
    setPage(1);
  };

  const onPageSizeChange = (value: number) => {
    setLimit(value);
    setPage(1);
  };

  return (
    <Box>
      <Stack maxW="5xl" mx="auto" gap="6" p={["4", "8"]}>
        <Flex justify="space-between" align="center" gap="4">
          <Stack gap="1" color="#FFFFFF">
            <Heading size="2xl">Users</Heading>
            <Text opacity="0.9">Everyone who has an account.</Text>
          </Stack>
          <Button variant="primary" flexShrink="0" onClick={() => setCreateOpen(true)}>
            <LuUserPlus />
            Add User
          </Button>
        </Flex>

        <Box bg="#F5F9FD" rounded="2xl" shadow="md" p="6">
          <Flex gap="4" mb="4" align="flex-end" flexWrap="wrap">
            <Box w={["full", "xs"]}>
              <TextField
                label="Search"
                value={search}
                placeholder="Search by name or email"
                leftIcon={<LuSearch />}
                onChange={(event) => onSearch(event.target.value)}
              />
            </Box>
            <Box w={["full", "44"]}>
              <DateField label="Created From" value={from} maxDate={to} onChange={onFromChange} />
            </Box>
            <Box w={["full", "44"]}>
              <DateField label="Created To" value={to} minDate={from} onChange={onToChange} />
            </Box>
            <Flex gap="2" ml="auto">
              <Tooltip content="Reset filters">
                <IconButton aria-label="Reset filters" variant="pagination" onClick={onClearFilters}>
                  <LuRotateCcw />
                </IconButton>
              </Tooltip>
              <Tooltip content="Refresh">
                <IconButton aria-label="Refresh" variant="pagination" onClick={() => refetch()}>
                  <Icon animation={isFetching ? "spin 0.9s linear infinite" : undefined}>
                    <LuRefreshCw />
                  </Icon>
                </IconButton>
              </Tooltip>
            </Flex>
          </Flex>

          <Show
            when={!isLoading}
            fallback={
              <Flex justify="center" align="center" minH="xs">
                <Spinner />
              </Flex>
            }
          >
            <Show
              when={!!users?.length}
              fallback={
                <Show
                  when={hasActiveFilters}
                  fallback={
                    <EmptyState
                      icon={<LuUsers />}
                      title="No users yet"
                      description="Accounts will show up here once people sign up."
                    />
                  }
                >
                  <EmptyState
                    icon={<LuUsers />}
                    title="No users match your filters"
                    description="Try a different search or date range."
                  >
                    <Button variant="outline" size="sm" onClick={onClearFilters}>
                      Reset Filters
                    </Button>
                  </EmptyState>
                </Show>
              }
            >
              <Box hideBelow="md" border="1px solid" borderColor="#D6E4F5" rounded="xl" overflow="hidden">
                <ScrollableContainer orientation="horizontal">
                  <Table.Root variant="users" minW="3xl">
                    <Table.Header>
                      <Table.Row>
                        {["Name", "Email", "Role", "Status", "Created At", "Actions"].map((heading) => (
                          <Table.ColumnHeader key={heading}>
                            {heading}
                          </Table.ColumnHeader>
                        ))}
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {users?.map((user) => (
                        <Table.Row key={user.user_id}>
                          <Table.Cell>
                            <Flex align="center" gap="3">
                              <Avatar size="sm" name={user.name} bg="#0067D8" color="#FFFFFF" />
                              <Text fontWeight="medium">{user.name}</Text>
                            </Flex>
                          </Table.Cell>
                          <Table.Cell color="gray.600">{user.email}</Table.Cell>
                          <Table.Cell>
                            <Badge variant={user.role}>{user.role}</Badge>
                          </Table.Cell>
                          <Table.Cell>
                            <Badge variant={user.is_active ? "active" : "inactive"}>
                              {user.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell color="gray.600" whiteSpace="nowrap">
                            {formatDisplayDate(user.created_at)}
                          </Table.Cell>
                          <Table.Cell>
                            <UserActions
                              user={user}
                              currentUserId={me?.user_id}
                              onEdit={setEditUser}
                              onToggleStatus={(target) => (target.is_active ? setDisableTarget(target) : setEnableTarget(target))}
                              onDelete={setDeleteUser}
                            />
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </ScrollableContainer>
              </Box>

              {/* Phones get one card per user instead of the table */}
              <Stack hideFrom="md" gap="3">
                {users?.map((user) => (
                  <Box key={user.user_id} bg="#FFFFFF" border="1px solid" borderColor="#D6E4F5" rounded="xl" p="4">
                    <Flex justify="space-between" align="center" gap="2">
                      <Flex align="center" gap="3" minW="0">
                        <Avatar size="sm" name={user.name} bg="#0067D8" color="#FFFFFF" />
                        <Stack gap="0" minW="0">
                          <Text fontWeight="medium" truncate>
                            {user.name}
                          </Text>
                          <Text fontSize="sm" color="gray.600" truncate>
                            {user.email}
                          </Text>
                        </Stack>
                      </Flex>
                      <UserActions
                        user={user}
                        currentUserId={me?.user_id}
                        onEdit={setEditUser}
                        onToggleStatus={(target) => (target.is_active ? setDisableTarget(target) : setEnableTarget(target))}
                        onDelete={setDeleteUser}
                      />
                    </Flex>
                    <DataListRoot orientation="horizontal" size="sm" mt="3">
                      <DataListItem label="Role" value={<Badge variant={user.role}>{user.role}</Badge>} />
                      <DataListItem
                        label="Status"
                        value={
                          <Badge variant={user.is_active ? "active" : "inactive"}>
                            {user.is_active ? "Active" : "Inactive"}
                          </Badge>
                        }
                      />
                      <DataListItem label="Created At" value={formatDisplayDate(user.created_at)} />
                    </DataListRoot>
                  </Box>
                ))}
              </Stack>

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

      <CreateUserDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <EditUserDialog user={editUser} currentUserId={me?.user_id} onClose={() => setEditUser(null)} />
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
