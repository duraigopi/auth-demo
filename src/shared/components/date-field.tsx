"use client";

/* Library imports */
import { DatePicker, Icon, Portal } from "@chakra-ui/react";
import { LuCalendar } from "react-icons/lu";
import { parseDate } from "@internationalized/date";

/* Lib module imports */
import { Field } from "@/components/ui/field";

/* Props for the date field, values are YYYY-MM-DD */
export interface DateFieldProps {
  value: string;
  onChange: (value: string) => void;
  name?: string;
  label?: string;
  placeholder?: string;
  errorMessage?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  /* Days outside this range can't be picked */
  minDate?: string;
  maxDate?: string;
}

/* Parse a YYYY-MM-DD string, undefined if invalid */
const safeParse = (dateString?: string) => {
  if (!dateString) return undefined;
  try {
    return parseDate(dateString);
  } catch {
    return undefined;
  }
};

export const DateField = ({
  value,
  onChange,
  name,
  label,
  placeholder = "dd/mm/yyyy",
  errorMessage,
  helperText,
  required,
  disabled,
  minDate,
  maxDate,
}: DateFieldProps) => {
  const parsedValue = safeParse(value);
  const dateValue = parsedValue ? [parsedValue] : [];
  const minValue = safeParse(minDate);
  const maxValue = safeParse(maxDate);

  return (
    <Field
      label={label}
      errorText={errorMessage}
      helperText={helperText}
      invalid={!!errorMessage}
      required={required}
      disabled={disabled}
    >
      <DatePicker.Root
        name={name}
        value={dateValue}
        min={minValue}
        max={maxValue}
        disabled={disabled}
        closeOnSelect
        size="md"
        /* Fixed so a parent with overflow hidden won't clip it */
        positioning={{ placement: "bottom-start", strategy: "fixed", gutter: 4 }}
        format={(date) => `${String(date.day).padStart(2, "0")}/${String(date.month).padStart(2, "0")}/${date.year}`}
        /* Ignore half typed input and keep the old value */
        parse={(input) => {
          const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(input.trim());
          return match ? safeParse(`${match[3]}-${match[2]}-${match[1]}`) : undefined;
        }}
        onValueChange={(details) => onChange(details.value[0]?.toString() ?? "")}
      >
        <DatePicker.Control>
          <DatePicker.Input
            placeholder={placeholder}
            autoComplete="off"
            bgColor="#FFFFFF"
            borderColor="#9FBBDD"
            _hover={{ borderColor: "#0067D8" }}
          />
          <DatePicker.IndicatorGroup>
            <DatePicker.Trigger>
              <Icon as={LuCalendar} />
            </DatePicker.Trigger>
          </DatePicker.IndicatorGroup>
        </DatePicker.Control>

        <Portal>
          <DatePicker.Positioner>
            <DatePicker.Content>
              <DatePicker.View view="day">
                <DatePicker.Header />
                <DatePicker.DayTable />
              </DatePicker.View>
              <DatePicker.View view="month">
                <DatePicker.Header />
                <DatePicker.MonthTable />
              </DatePicker.View>
              <DatePicker.View view="year">
                <DatePicker.Header />
                <DatePicker.YearTable />
              </DatePicker.View>
            </DatePicker.Content>
          </DatePicker.Positioner>
        </Portal>
      </DatePicker.Root>
    </Field>
  );
};
