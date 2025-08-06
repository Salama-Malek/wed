import { forwardRef, useId, useState, useEffect } from "react";
import { FieldWrapper } from "./FieldWrapper";
import { Controller } from "react-hook-form";
import { classes } from "@/shared/lib/clsx";
import { useTranslation } from "react-i18next";

type NumberOnlyInputProps = {
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  id?: string;
  label?: string;
  className?: string;
  invalidFeedback?: any;
  notRequired?: boolean;
  maxLength?: number;
  isLoading?: boolean;
  control?: any;
  rules?: any;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  preventEnterSubmit?: boolean;
};

export const NumberOnlyInput = forwardRef<HTMLInputElement, NumberOnlyInputProps>(
  (
    {
      onChange,
      onBlur,
      value: propValue = "",
      notRequired,
      label,
      className,
      invalidFeedback,
      maxLength,
      isLoading,
      control,
      name,
      rules,
      defaultValue = "",
      placeholder,
      disabled,
      preventEnterSubmit = true,
      ...inputProps
    },
    ref
  ) => {
    const { i18n } = useTranslation();
    const uniqueId = useId();
    const id = inputProps.id ?? uniqueId;
    const [inputValue, setInputValue] = useState(propValue);
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
        "placeholder-gray-400 h-10",
        hasError
          ? "border-red-500 focus:ring-red-200 focus:border-red-500"
          : "border-gray-400 focus:ring-blue-200 focus:border-blue-500",
        className
      ),
      "aria-invalid": hasError ? "true" : "false",
      style: placeholderStyle,
      type: "text",
      inputMode: "numeric",
      pattern: "[0-9]*",
      ...inputProps,
    };

    // Filter out non-numeric characters
    const formatNumberInput = (value: string): string => {
      return value.replace(/[^\d]/g, '');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const formattedValue = formatNumberInput(rawValue);
      
      setInputValue(formattedValue);
      
      if (onChange) {
        onChange(formattedValue);
      }
    };
    
    const handleBlur = () => {
      onBlur?.();
    };

    // Handle keyboard events to prevent unwanted form submissions and non-numeric input
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Prevent Enter key from submitting forms unless explicitly allowed
      if (preventEnterSubmit && e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Allow only numeric keys and navigation keys
      const allowedKeys = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End"];
      const isNumeric = /^\d$/.test(e.key);
      const isAllowedKey = allowedKeys.includes(e.key);
      const isPaste = (e.ctrlKey || e.metaKey) && (e.key === "v" || e.key === "V");
      
      if (!isNumeric && !isAllowedKey && !isPaste) {
        e.preventDefault();
        return;
      }

      // Call the original onKeyDown if provided
      if (inputProps.onKeyDown) {
        inputProps.onKeyDown(e);
      }
    };

    // Handle paste events to filter non-numeric content
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedText = e.clipboardData.getData('text/plain');
      const numericOnly = formatNumberInput(pastedText);
      
      if (numericOnly) {
        const newValue = inputValue + numericOnly;
        setInputValue(newValue);
        if (onChange) {
          onChange(newValue);
        }
      }
    };

    const renderInput = (field?: { value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void }) => {
      const valueToUse = field?.value ?? inputValue;
      const inputOnChange = field?.onChange ?? handleChange;

      if (isLoading) {
        return <div className="wave-loading h-4 w-40 rounded-xs"></div>;
      }

      return (
        <input
          {...commonProps}
          {...field}
          ref={ref as React.ForwardedRef<HTMLInputElement>}
          maxLength={maxLength}
          value={valueToUse}
          onChange={inputOnChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={placeholder}
          disabled={disabled}
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

NumberOnlyInput.displayName = "NumberOnlyInput"; 