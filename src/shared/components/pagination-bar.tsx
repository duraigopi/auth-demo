"use client";

/* Library imports */
import { Box, ButtonGroup, Flex, IconButton, Pagination, Show, Text } from "@chakra-ui/react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

/* Shared module imports */
import { SelectField } from "@shared/components/select-field";

/* Props for the pagination bar */
export interface PaginationBarProps {
  page: number;
  pageSize: number;
  count: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const PAGE_SIZES = [5, 10, 25, 50].map((size) => ({ label: String(size), value: size }));

export const PaginationBar = ({ page, pageSize, count, onPageChange, onPageSizeChange }: PaginationBarProps) => (
  <Show when={count > 0}>
    <Pagination.Root
      count={count}
      pageSize={pageSize}
      page={page}
      onPageChange={(details) => onPageChange(details.page)}
    >
      <Flex justify="space-between" align="center" mt="4" gap="3" flexWrap="wrap">
        <Flex align="center" gap="4" flexWrap="wrap">
          <Pagination.PageText format="long" fontSize="sm" color="gray.600" />
          <Flex align="center" gap="2">
            <Text fontSize="sm" color="gray.600" whiteSpace="nowrap">
              Rows per page
            </Text>
            <Box w="20">
              <SelectField
                size="sm"
                aria-label="Rows per page"
                value={String(pageSize)}
                options={PAGE_SIZES}
                onChange={(value) => onPageSizeChange(Number(value))}
              />
            </Box>
          </Flex>
        </Flex>

        {/* No page buttons when there is only one page */}
        <Show when={count > pageSize}>
          <ButtonGroup attached size="sm">
            <Pagination.PrevTrigger asChild>
              <IconButton aria-label="Previous page" variant="pagination">
                <LuChevronLeft />
              </IconButton>
            </Pagination.PrevTrigger>

            <Pagination.Items
              render={(item) => (
                <IconButton aria-label={`Page ${item.value}`} variant="pagination">
                  {item.value}
                </IconButton>
              )}
            />

            <Pagination.NextTrigger asChild>
              <IconButton aria-label="Next page" variant="pagination">
                <LuChevronRight />
              </IconButton>
            </Pagination.NextTrigger>
          </ButtonGroup>
        </Show>
      </Flex>
    </Pagination.Root>
  </Show>
);
