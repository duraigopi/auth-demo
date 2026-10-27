"use client";

/* Library imports */
import { forwardRef } from "react";
import { Input } from "@chakra-ui/react";
import type { InputProps } from "@chakra-ui/react";

/* Lib module imports */
import { Field } from "@/components/ui/field";

/* Props shared by the text and password input fields */
export interface InputFieldProps extends InputProps {
  label?: string;
  errorMessage?: string;
  helperText?: string;
}

export const TextField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, errorMessage, helperText, required, disabled, ...inputProps }, ref) => (
    <Field
      label={label}
      errorText={errorMessage}
      helperText={helperText}
      invalid={!!errorMessage}
      required={required}
      disabled={disabled}
    >
      <Input ref={ref} {...inputProps} />
    </Field>
  ),
);

TextField.displayName = "TextField";
