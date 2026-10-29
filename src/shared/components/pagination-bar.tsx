"use client";

/* Library imports */
import { Box, ButtonGroup, Flex, IconButton, Pagination, Show, Text, useBreakpointValue } from "@chakra-ui/react";
import { LuChevronLeft, LuChevronRight, LuEllipsis } from "react-icons/lu";

/* Shared module imports */
import { SelectField } from "@shared/components/select-field";

/* The rows-per-page choices, also the only values the page URL accepts */
export const PAGE_SIZE_VALUES = [5, 10, 25, 50] as const;

export type PageSize = (typeof PAGE_SIZE_VALUES)[number];

/* Props for the pagination bar */
export interface PaginationBarProps {
  page: number;
  pageSize: number;
  count: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: PageSize) => void;
}

const PAGE_SIZES = PAGE_SIZE_VALUES.map((size) => ({ label: String(size), value: size }));

export const PaginationBar = ({ page, pageSize, count, onPageChange, onPageSizeChange }: PaginationBarProps) => {
  /* Phones show fewer page numbers, so a long run of pages still fits inside the card */
  const siblingCount = useBreakpointValue({ base: 0, sm: 1 }) ?? 1;

  return (
    <Show when={count > 0}>
      <Pagination.Root
        count={count}
        pageSize={pageSize}
        page={page}
        siblingCount={siblingCount}
        onPageChange={(details) => onPageChange(details.page)}
      >
        {/* Phones stack the info above the page buttons and center both */}
        <Flex direction={["column", "row"]} justify={["center", "space-between"]} align="center" mt="4" gap="3" flexWrap="wrap">
          <Flex align="center" justify="center" gap="4" flexWrap="wrap">
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
                  onChange={(value) => onPageSizeChange(Number(value) as PageSize)}
                />
              </Box>
            </Flex>
          </Flex>

          {/* No page buttons when there is only one page */}
          <Show when={count > pageSize}>
            <ButtonGroup attached size={["xs", "sm"]}>
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
                /* The default dots are a solid dark button, so match the other page buttons */
                ellipsis={
                  <IconButton as="span" variant="pagination" aria-label="More pages" cursor="default">
                    <LuEllipsis />
                  </IconButton>
                }
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
};
