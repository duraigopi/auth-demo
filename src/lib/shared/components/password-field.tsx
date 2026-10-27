"use client";

/* Library imports */
import { forwardRef } from "react";

/* Lib module imports */
import { Field } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import type { InputFieldProps } from "@shared/components/text-field";

export const PasswordField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, errorMessage, helperText, leftIcon, required, disabled, ...inputProps }, ref) => (
    <Field
      label={label}
      errorText={errorMessage}
      helperText={helperText}
      invalid={!!errorMessage}
      required={required}
      disabled={disabled}
    >
      <PasswordInput ref={ref} rootProps={{ startElement: leftIcon }} {...inputProps} />
    </Field>
  ),
);

PasswordField.displayName = "PasswordField";
