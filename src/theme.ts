/* Library imports */
import { createSystem, defaultConfig, defineConfig, defineRecipe, defineSlotRecipe } from "@chakra-ui/react";

/* Adds the `primary` variant to Chakra's default button recipe */
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

const config = defineConfig({
  globalCss: {
    "::selection": {
      bg: "#0067D8",
      color: "#FFFFFF",
    },
  },
  theme: {
    recipes: {
      button: buttonRecipe,
    },
    slotRecipes: {
      field: fieldRecipe,
    },
  },
});

export const system = createSystem(defaultConfig, config);
