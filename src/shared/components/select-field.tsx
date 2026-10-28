"use client";

/* Library imports */
import { useMemo } from "react";
import { Portal, Select, createListCollection } from "@chakra-ui/react";
import type { SelectRootProps } from "@chakra-ui/react";

/* Lib module imports */
import { Field } from "@/components/ui/field";

/* One choice in the dropdown */
export interface SelectOption {
  label: string;
  value: string | number;
}

/* Props of the select field, same label and error handling as the text field */
export interface SelectFieldProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  errorMessage?: string;
  helperText?: string;
  size?: SelectRootProps["size"];
  required?: boolean;
  disabled?: boolean;
  "aria-label"?: string;
}

export const SelectField = ({
  options,
  value,
  onChange,
  label,
  placeholder = "Select an option",
  errorMessage,
  helperText,
  size,
  required,
  disabled,
  "aria-label": ariaLabel,
}: SelectFieldProps) => {
  const collection = useMemo(
    () => createListCollection({ items: options.map((option) => ({ label: option.label, value: String(option.value) })) }),
    [options],
  );

  return (
    <Field
      label={label}
      errorText={errorMessage}
      helperText={helperText}
      invalid={!!errorMessage}
      required={required}
      disabled={disabled}
    >
      <Select.Root
        collection={collection}
        value={value ? [value] : []}
        size={size}
        disabled={disabled}
        invalid={!!errorMessage}
        onValueChange={(details) => onChange(details.value[0] ?? "")}
      >
        <Select.HiddenSelect />
        <Select.Control>
          <Select.Trigger aria-label={ariaLabel}>
            <Select.ValueText placeholder={placeholder} />
          </Select.Trigger>
          <Select.IndicatorGroup>
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>
        <Portal>
          <Select.Positioner>
            <Select.Content>
              {collection.items.map((item) => (
                <Select.Item key={item.value} item={item}>
                  {item.label}
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Portal>
      </Select.Root>
    </Field>
  );
};
