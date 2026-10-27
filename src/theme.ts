/* Library imports */
import { createSystem, defaultConfig, defineConfig, defineRecipe } from "@chakra-ui/react";

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

const config = defineConfig({
  theme: {
    recipes: {
      button: buttonRecipe,
    },
  },
});

export const system = createSystem(defaultConfig, config);
