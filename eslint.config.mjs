import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  /* Build output and generated types are not ours to lint */
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),

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
      /* `_`-prefixed names mark a deliberately unused binding; rest siblings are exempt */
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", ignoreRestSiblings: true },
      ],

      /* Arrow functions for components, handlers, utilities and page exports */
      "func-style": ["error", "expression", { allowArrowFunctions: true }],

      /* Warn and error stay allowed so real problems still reach the console */
      "no-console": ["error", { allow: ["warn", "error"] }],

      /* Type-only imports carry the `type` keyword so the bundler can drop them */
      "@typescript-eslint/consistent-type-imports": "error",

      /* Env vars are read and validated once in src/env.ts; NODE_ENV is set by the toolchain */
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "MemberExpression[object.object.name='process'][object.property.name='env'][property.name!='NODE_ENV']",
          message: "Import the validated value from @/env instead of reading process.env directly.",
        },
      ],

      /* Quotes and apostrophes are written as themselves; JSX escapes them safely */
      "react/no-unescaped-entities": "off",
    },
  },

  /* Vendored Chakra snippets stay close to upstream so they can be re-synced */
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
