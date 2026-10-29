import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  /* Skip build output, generated types and the backend */
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "amplify/**"]),

  {
    rules: {
      /* Correctness */
      eqeqeq: ["error", "smart"],
      "no-var": "error",
      "prefer-const": "error",
      "no-shadow": "off",
      "@typescript-eslint/no-shadow": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-empty-object-type": "error",
      "@typescript-eslint/no-non-null-asserted-optional-chain": "error",
      "@typescript-eslint/no-unused-expressions": "error",
      /* Names starting with _ are allowed to be unused */
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", ignoreRestSiblings: true },
      ],

      /* Arrow functions only */
      "func-style": ["error", "expression", { allowArrowFunctions: true }],

      /* console.warn and console.error are still allowed */
      "no-console": ["error", { allow: ["warn", "error"] }],

      /* Use `import type` for types */
      "@typescript-eslint/consistent-type-imports": "error",

      /* Config comes from amplify_outputs.json, not process.env */
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "MemberExpression[object.object.name='process'][object.property.name='env'][property.name!='NODE_ENV']",
          message: "Read config from the Amplify outputs file instead of process.env.",
        },
      ],

      /* Allow quotes and apostrophes in JSX text */
      "react/no-unescaped-entities": "off",
    },
  },

  /* Chakra snippets are kept close to upstream */
  {
    files: ["src/components/ui/**"],
    rules: {
      "func-style": "off",
      "@typescript-eslint/no-shadow": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
]);

export default eslintConfig;
