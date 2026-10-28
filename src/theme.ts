/* Library imports */
import { createSystem, defaultConfig, defineConfig, defineRecipe, defineSlotRecipe } from "@chakra-ui/react";

/* Adds the `primary` and `pagination` variants to Chakra's default button recipe */
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
      /* Page buttons: the current page gets the gradient. bgColor, not bg, so a hover never wipes out the gradient image. */
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
          /* The gradient covers the background color, so the hover is a fade instead */
          _hover: { opacity: 0.85 },
        },
      },
    },
  },
});

/* Chakra blocks selecting label text, and browsers show an arrow cursor over labels */
const fieldRecipe = defineSlotRecipe({
  slots: ["root", "label", "input", "textarea", "errorText", "helperText", "select", "requiredIndicator"],
  base: {
    label: {
      userSelect: "text",
      cursor: "text",
    },
  },
});

/* The default input border is almost invisible on our light cards, so inputs get a clear blue-grey one */
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

/* Same border for the select trigger */
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

/* Dialogs share one look: dimmed blurred backdrop, rounded card, gradient header, light footer divider */
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
    /* One background for every page, fixed so it fills the screen however long the page is */
    body: {
      bg: "linear-gradient(to bottom, #0067D8, #00B398)",
      backgroundAttachment: "fixed",
      minH: "100vh",
    },
    "::selection": {
      bg: "#0067D8",
      color: "#FFFFFF",
    },
  },
  theme: {
    recipes: {
      button: buttonRecipe,
      input: inputRecipe,
    },
    slotRecipes: {
      dialog: dialogRecipe,
      select: selectRecipe,
      field: fieldRecipe,
    },
  },
});

export const system = createSystem(defaultConfig, config);
