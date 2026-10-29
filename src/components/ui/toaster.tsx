"use client"

import {
  Toaster as ChakraToaster,
  Box,
  Flex,
  Portal,
  Spinner,
  Toast,
  createToaster,
} from "@chakra-ui/react"
import { LuX } from "react-icons/lu"

export const toaster = createToaster({
  placement: "top",
  pauseOnPageIdle: true,
})

export const Toaster = ({ w = "100%", maxW = "400px" }: { w?: string; maxW?: string }) => {
  return (
    <Portal>
      <ChakraToaster toaster={toaster} insetInline={{ mdDown: "4" }}>
        {(toast) => {
          /* Info and loading toasts have a light background, so the close button needs a dark color there */
          const closeColor = !toast.type || toast.type === "info" || toast.type === "loading" ? "fg" : "white"

          return (
            <Toast.Root width={w} maxW={maxW} alignItems="center">
              {toast.type === "loading" ? (
                <Spinner size="sm" color="blue.solid" />
              ) : (
                <Toast.Indicator />
              )}
              <Flex w="100%" alignItems="center">
                <Flex flexDir="column" w="80%">
                  {toast.title && <Toast.Title>{toast.title}</Toast.Title>}
                  {toast.description && (
                    <Toast.Description textWrap="wrap" whiteSpace="pre-line">{toast.description}</Toast.Description>
                  )}
                </Flex>
                <Toast.CloseTrigger
                  w="20%"
                  h="100%"
                  aria-label="Close"
                  display="inline-flex"
                  alignItems="center"
                  justifyContent="center"
                  bg="transparent"
                  _hover={{ bg: "whiteAlpha.200" }}
                >
                  <Box
                    as="span"
                    display="inline-flex"
                    alignItems="center"
                    justifyContent="center"
                    h="8"
                    minW="8"
                    borderWidth={1}
                    borderColor={closeColor}
                    color={closeColor}
                    borderRadius="md"
                    fontSize="md"
                  >
                    <LuX />
                  </Box>
                </Toast.CloseTrigger>
              </Flex>
            </Toast.Root>
          )
        }}
      </ChakraToaster>
    </Portal>
  )
}
