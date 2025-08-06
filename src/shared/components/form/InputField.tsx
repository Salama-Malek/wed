import { forwardRef, useId, useState, useEffect } from "react";
import { FieldWrapper } from "./FieldWrapper";
import { useDebouncedCallback } from "@/shared/hooks/use-debounced-callback";
import { Controller } from "react-hook-form";
import { classes } from "@/shared/lib/clsx";
import { useTranslation } from "react-i18next";

type InputOrTextareaProps = React.InputHTMLAttributes<HTMLInputElement> &
  React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export type InputFieldProps = InputOrTextareaProps & {
  name?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: () => void;
  type?: string;
  id?: string;
  label?: string;
  className?: string;
  invalidFeedback?: any;
  notRequired?: boolean;
  isSearch?: boolean;
  rows?: number;
  maxLength?: number;
  isLoading?: boolean;
  control?: any;
  rules?: any;
  defaultValue?: string;
  preventEnterSubmit?: boolean; // New prop to control Enter key behavior
};

export const InputField = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputFieldProps>(
  (
    {
      isSearch = false,
      onChange,
      onBlur,
      value: propValue = "",
      notRequired,
      label,
      className,
      invalidFeedback,
      type,
      rows = 3,
      maxLength,
      isLoading,
      control,
      name,
      rules,
      defaultValue = "",
      preventEnterSubmit = true, // Default to preventing Enter submission
      ...inputProps
    },
    ref
  ) => {
    const { i18n } = useTranslation();
    const uniqueId = useId();
    const id = inputProps.id ?? uniqueId;
    const [inputValue, setInputValue] = useState(propValue);
    const isTextarea = type === "textarea" && !isSearch;
    const errorMessage = invalidFeedback?.message || invalidFeedback;
    const hasError = !!errorMessage;

    // Sync with external value
    useEffect(() => {
      setInputValue(propValue);
    }, [propValue]);

    // RTL placeholder alignment for Arabic
    const placeholderStyle = i18n.language === "ar" ? { textAlign: "right" } : {};

    const commonProps: Record<string, unknown> = {
      id,
      className: classes(
        "w-full px-3 py-2 border rounded-xs transition-all duration-200",
        "focus:outline-none focus:ring-2 text-sm leading-none text-gray-900",
        "placeholder-gray-400",
        !isTextarea && "h-10",
        hasError
          ? "border-red-500 focus:ring-red-200 focus:border-red-500"
          : "border-gray-400 focus:ring-blue-200 focus:border-blue-500",
        className
      ),
      "aria-invalid": hasError ? "true" : "false",
      style: placeholderStyle,
      ...inputProps,
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setInputValue(e.target.value);
      onChange?.(e);
    };
    
    const handleBlur = () => {
      onBlur?.();
    };

    // Handle keyboard events to prevent unwanted form submissions
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      // Prevent Enter key from submitting forms unless explicitly allowed
      if (preventEnterSubmit && e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Call the original onKeyDown if provided
      if (inputProps.onKeyDown) {
        inputProps.onKeyDown(e as React.KeyboardEvent<HTMLInputElement>);
      }
    };

    const debouncedOnChange = useDebouncedCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(event);
      },
      [onChange],
      500
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      debouncedOnChange(e);
    };

    const renderInput = (field?: { value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void }) => {
      const valueToUse = field?.value ?? inputValue;
      const inputOnChange = field?.onChange ?? handleChange;

      if (isLoading) {
        return <div className="wave-loading h-4 w-40 rounded-xs"></div>;
      }

      if (isTextarea) {
        return (
          <textarea
            {...commonProps}
            {...field}
            ref={ref as React.ForwardedRef<HTMLTextAreaElement>}
            rows={rows}
            value={valueToUse}
            onChange={inputOnChange}
            onKeyDown={handleKeyDown}
          />
        );
      }

      if (isSearch) {
        return (
          <input
            {...commonProps}
            ref={ref as React.ForwardedRef<HTMLInputElement>}
            type={type}
            value={valueToUse}
            onChange={handleSearchChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
        );
      }

      return (
        <input
          {...commonProps}
          {...field}
          ref={ref as React.ForwardedRef<HTMLInputElement>}
          type={type}
          maxLength={maxLength}
          value={valueToUse}
          onChange={inputOnChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      );
    };

    if (control && name) {
      return (
        <Controller
          name={name}
          control={control}
          rules={rules}
          defaultValue={defaultValue}
          render={({ field, fieldState }) => (
            <FieldWrapper
              notRequired={notRequired}
              labelFor={id}
              label={label}
              invalidFeedback={fieldState.error?.message || errorMessage}
            >
              {renderInput(field)}
            </FieldWrapper>
          )}
        />
      );
    }

    return (
      <FieldWrapper
        notRequired={notRequired}
        labelFor={id}
        label={label}
        invalidFeedback={errorMessage}
      >
        {renderInput()}
      </FieldWrapper>
    );
  }
);

InputField.displayName = "InputField";

// --- DigitOnlyInput: reusable input for digits only (max 9) ---
import React from "react";

export const DigitOnlyInput = React.forwardRef<HTMLInputElement, InputFieldProps>(
  (props, ref) => {
    const {
      maxLength = 9,
      onChange,
      onKeyDown,
      onPaste,
      onBlur,
      value,
      ...rest
    } = props;

    // Handler to allow only digits and max 9 (for input only)
    const handleChangeUniversal: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (e) => {
      if (e.target instanceof HTMLInputElement) {
        const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, maxLength);
        if (onChange) {
          const inputEvent: React.ChangeEvent<HTMLInputElement> = e as React.ChangeEvent<HTMLInputElement>;
          onChange({ ...inputEvent, target: { ...inputEvent.target, value: digitsOnly } });
        }
      } else if (onChange) {
        onChange(e as React.ChangeEvent<HTMLTextAreaElement>);
      }
    };

    const handleKeyDownUniversal: React.KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement> = (e) => {
      if (e.target instanceof HTMLInputElement) {
        const allowedKeys = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"];
        // Allow Ctrl+V (Windows/Linux) and Cmd+V (Mac) for paste
        if (
          (!/^\d$/.test(e.key) && !allowedKeys.includes(e.key)) &&
          !(e.ctrlKey && (e.key === "v" || e.key === "V")) &&
          !(e.metaKey && (e.key === "v" || e.key === "V"))
        ) {
          e.preventDefault();
        }
        if (onKeyDown) {
          onKeyDown(e as React.KeyboardEvent<HTMLInputElement>);
        }
      } else if (onKeyDown) {
        onKeyDown(e as React.KeyboardEvent<HTMLTextAreaElement>);
      }
    };

    return (
      <InputField
        {...rest}
        ref={ref}
        type="tel"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={maxLength}
        value={typeof value === "string" ? value.replace(/\D/g, "").slice(0, maxLength) : value}
        onChange={handleChangeUniversal}
        onKeyDown={handleKeyDownUniversal}
        onPaste={onPaste}
        onBlur={onBlur}
      />
    );
  }
);
DigitOnlyInput.displayName = "DigitOnlyInput";
