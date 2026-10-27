# Project rules

Adopted from the flash_css repo. Server-side rules there (Hono, AWS, Cognito, shared logger) are left out because this repo has none of that yet.

## Workflow

- Never run TypeScript checks (`tsc`, `tsc --noEmit`, `next build`) to verify changes. Rely on the editor and the Edit tool.
- Never run package installs (`npm install`, `npm uninstall`). Give the user the exact command, wait for confirmation, then make the code changes.
- Never rewrite whole files. Use targeted edits and leave unrelated code untouched.
- Commit messages: plain language, short title under 70 chars, then 3-5 bullets on the user-facing outcome. No file names, function names, or library names in the body.

## Function style

- Always use arrow functions (`const fn = () => {}`), not `function` declarations or expressions. This covers components, handlers, utilities and page/layout exports.
- Use an implicit return `() => (...)` when the body is a single expression.

## Comment style

- Use `/* */` for every comment, never `//` (for example `/* 5 minutes */`).
- Every comment is a single short line. Explain WHY only, never WHAT. Default to no comment in new code.
- Section labels above groups are fine (`/* Identification */`). No banner headers.
- Every `export type` / `export interface` gets a single-line comment above it. Property comments go on the same line as the property, aligned.
- Do not strip useful existing comments during refactors.

## Imports

- Use absolute path aliases (`@/...`), not relative paths like `../x`. Barrel `index.ts` files may use relative exports.
- Group imports with single-line comments, in this order: `/* Library imports */` (external packages), then `/* Lib module imports */` (`@/*`), then `/* Shared module imports */` (`@shared/*`), then one group per feature module such as `/* Auth module imports */` (`@auth/*`).
- Write destructured imports on one line unless the line passes 120 characters.

## Code style

- Wrap every multi-property object literal onto multiple lines, even when short. Single-property literals may stay inline.
- Use `!!value` for truthy checks, not explicit comparisons.
- Use Chakra's `<Show when={...}>` for conditional rendering, not `&&`.
- Format `useMemo` / `useCallback` with the closing parenthesis and dependency array on the same line.
- Never use the array index as a list `key`. Use a unique id, or combine stable fields.
- Responsive Chakra props: array syntax when each breakpoint differs, object syntax when values repeat. Mobile-first.
- Enable strict TypeScript and avoid `any`.

## Constants and types

- Enum-like constants are objects (`FORM_MODES = { SAVE: "save" } as const`), with a `FOO_VALUES: Foo[] = Object.values(FOO)` companion tuple.
- No `_OPTIONS` suffix on enum-like constants. Name the constant after the concept.
- Put constants in a dedicated constants directory and use barrel exports (`index.ts`).
- Use `type` imports for type-only imports. Derive form types from Zod schemas with `z.infer` and name them `<Feature>FormData`.

## Zod and validation

- Import Zod from `zod/v4` (`import { z } from "zod/v4"`).
- `superRefine` is deprecated in `zod/v4`. Use `.refine()` for a single check, with `message` and `path` on their own lines, or `.check()` for several issues.
- Required enum fields that default to `""`: `.or(z.literal("")).refine(...)` with a "Please select ..." message.
- Every string field needs a `max()` length. Free-text fields must reject `<` and `>`.
- Required-field messages: `"Please select the company type"`. Format errors: `"Please enter a valid email address"`. Business-rule errors may be plain statements.
- Use lowercase field names inside messages.

## Errors, toasts and logging

- Never log a full error object. Extract `error instanceof Error ? error.message : "<context fallback>"`.
- Log with a context prefix such as `[Auth]`.
- Toast titles are Title Case and specific (`"Member Saved Successfully"`, never `"Error"`). Descriptions are sentence case, actionable, and end with a period.
- For API failures use `response.error` / `response.message` with a specific fallback for each.
