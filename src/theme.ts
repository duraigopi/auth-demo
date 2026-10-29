/* Library imports */
import { createSystem, defaultConfig, defineConfig, defineRecipe, defineSlotRecipe } from "@chakra-ui/react";

/* Adds the primary and pagination button variants */
const buttonRecipe = defineRecipe({
  variants: {
    variant: {
      primary: {
        bgGradient: "to-r",
        gradientFrom: "#0067D8",
        gradientTo: "#00B398",
        color: "#FFFFFF",
        fontWeight: "bold",
        rounded: "xl",
        _hover: { opacity: 0.9 },
      },
      /* Page buttons, the selected page gets the gradient */
      pagination: {
        bgColor: "#FFFFFF",
        color: "#0067D8",
        border: "1px solid",
        borderColor: "#9FBBDD",
        _hover: { bgColor: "#E6F0FB" },
        _selected: {
          bgGradient: "to-r",
          gradientFrom: "#0067D8",
          gradientTo: "#00B398",
          color: "#FFFFFF",
          borderColor: "transparent",
          /* Fade on hover, a background color would not show over the gradient */
          _hover: { opacity: 0.85 },
        },
      },
    },
  },
});

/* Allow selecting label text and show a text cursor */
const fieldRecipe = defineSlotRecipe({
  slots: ["root", "label", "input", "textarea", "errorText", "helperText", "select", "requiredIndicator"],
  base: {
    label: {
      userSelect: "text",
      cursor: "text",
    },
  },
});

/* Badge variants for the user roles (named like the role values) and the account status */
const badgeRecipe = defineRecipe({
  variants: {
    variant: {
      ADMIN: { bgColor: "#E6F0FB", color: "#0067D8" },
      CLIENT: { bgColor: "#F3E8FF", color: "#7E22CE" },
      active: { bgColor: "#DCFCE7", color: "#15803D" },
      inactive: { bgColor: "#FEE2E2", color: "#B91C1C" },
    },
  },
});

/* Stronger input border, the default is too faint on light cards */
const inputRecipe = defineRecipe({
  variants: {
    variant: {
      outline: {
        bgColor: "#FFFFFF",
        borderColor: "#9FBBDD",
        _hover: { borderColor: "#0067D8" },
      },
    },
  },
});

/* Same border for the select */
const selectRecipe = defineSlotRecipe({
  slots: ["trigger"],
  variants: {
    variant: {
      outline: {
        trigger: {
          bgColor: "#FFFFFF",
          borderColor: "#9FBBDD",
          _hover: { borderColor: "#0067D8" },
        },
      },
    },
  },
});

/* Table variant for the users list: gradient header, striped rows, hover color */
const tableRecipe = defineSlotRecipe({
  slots: ["root", "header", "body", "row", "columnHeader", "cell"],
  variants: {
    variant: {
      users: {
        header: {
          "& tr": { background: "linear-gradient(to right, #0067D8, #00B398)" },
          /* First and last columns stay in view when the table scrolls sideways, solid colors match the gradient ends */
          "& th:first-of-type": { position: "sticky", left: "0", zIndex: "1", bgColor: "#0067D8" },
          "& th:last-of-type": { position: "sticky", right: "0", zIndex: "1", bgColor: "#00B398" },
        },
        columnHeader: {
          py: "3",
          fontSize: "xs",
          fontWeight: "semibold",
          textTransform: "uppercase",
          letterSpacing: "wider",
          color: "#FFFFFF",
        },
        body: {
          "& tr:nth-of-type(odd)": { bgColor: "#FFFFFF" },
          "& tr:nth-of-type(even)": { bgColor: "#EAF3FC" },
          "& tr:hover": { bgColor: "#DCEBFA" },
          /* Same pinned columns in the body, inherit keeps the row color */
          "& td:first-of-type": { position: "sticky", left: "0", zIndex: "1", bgColor: "inherit" },
          "& td:last-of-type": { position: "sticky", right: "0", zIndex: "1", bgColor: "inherit" },
        },
        cell: {
          py: "3",
        },
      },
    },
  },
});

/* Shared dialog look */
const dialogRecipe = defineSlotRecipe({
  slots: ["backdrop", "positioner", "content", "header", "body", "footer", "title", "description", "closeTrigger"],
  base: {
    backdrop: {
      bg: "rgba(10, 42, 79, 0.55)",
      backdropFilter: "blur(4px)",
    },
    content: {
      rounded: "2xl",
      overflow: "hidden",
      shadow: "2xl",
      bgColor: "#FFFFFF",
    },
    header: {
      bgGradient: "to-r",
      gradientFrom: "#0067D8",
      gradientTo: "#00B398",
      color: "#FFFFFF",
      py: "4",
    },
    title: {
      color: "#FFFFFF",
      fontWeight: "bold",
    },
    body: {
      py: "6",
    },
    footer: {
      borderTop: "1px solid",
      borderColor: "#D6E4F5",
      bgColor: "#F5F9FD",
      pt: "4",
    },
    closeTrigger: {
      color: "#FFFFFF",
      _hover: { bgColor: "rgba(255, 255, 255, 0.2)" },
    },
  },
});

const config = defineConfig({
  globalCss: {
    /* Same gradient background on every page */
    body: {
      bg: "linear-gradient(to bottom, #0067D8, #00B398)",
      backgroundAttachment: "fixed",
      minH: "100dvh",
    },
    "::selection": {
      bg: "#0067D8",
      color: "#FFFFFF",
    },
  },
  theme: {
    recipes: {
      badge: badgeRecipe,
      button: buttonRecipe,
      input: inputRecipe,
    },
    slotRecipes: {
      dialog: dialogRecipe,
      select: selectRecipe,
      table: tableRecipe,
      field: fieldRecipe,
    },
  },
});

export const system = createSystem(defaultConfig, config);
