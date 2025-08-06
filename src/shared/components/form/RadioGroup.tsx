import React, { useCallback, useMemo } from "react";
import { FieldWrapper } from "./FieldWrapper";
import { useLanguageClass } from "@/shared/hooks/useLanguageClass";
import radioIcon from "@/assets/icon-radio.svg";
import { classes } from "@/shared/lib/clsx";
import { Controller } from "react-hook-form";

// Define a base RadioOption type that can handle both string and object values
export type RadioOption<T = string> = {
  label: string;
  value: T;
  description?: string;
};

// Enhanced RadioGroupProps with generic type
export type RadioGroupProps<T = string> = {
  options: RadioOption<T>[];
  name: string;
  value?: T;
  onChange?: (value: T) => void;
  label?: string;
  className?: string;
  invalidFeedback?: any;
  notRequired?: boolean;
  disabled?: boolean;
  hasIcon?: boolean;
  validation?: any;
  control?: any;
};

// RadioOptionComponent remains largely the same but handles generic value type
const RadioOptionComponent = React.memo(<T,>({
  option,
  isSelected,
  hasIcon,
  disabled,
  onChange,
  name
}: {
  option: RadioOption<T>;
  isSelected: boolean;
  hasIcon: boolean;
  disabled: boolean;
  onChange: (value: T) => void;
  name: string;
}) => {
  const optionContainerClasses = classes(
    "flex gap-2 items-center h-auto w-[310px]",
    {
      "px-4 py-2.5 border-[0.5px] rounded-xs": option.description,
      "border-primary-600": isSelected,
      "border-gray-400": !isSelected,
      "flex-row-reverse h-16": hasIcon,
      "bg-primary-50 h-16": hasIcon && isSelected,
    }
  );

  const radioButtonClasses = classes(
    "w-5 h-5 flex items-center justify-center border rounded-full",
    { "border-gray-400": true }
  );

  // For object values, we'll stringify them for the input value
  const inputValue = typeof option.value === 'object' 
    ? JSON.stringify(option.value) 
    : String(option.value);

  return (
    <label
      className={classes("flex items-center gap-2", {
        "cursor-pointer": !disabled,
        "opacity-50 cursor-not-allowed": disabled,
      })}
    >
      <input
        type="radio"
        name={name}
        value={inputValue}
        checked={isSelected}
        onChange={() => onChange(option.value)}
        className="hidden"
        disabled={disabled}
      />
      
      <div className={optionContainerClasses}>
        <div className={radioButtonClasses}>
          {isSelected && <div className="w-3 h-3 bg-primary-600 rounded-full" />}
        </div>

        <div className="flex flex-col flex-1">
          <span className="text-sm20 text-gray-800 medium">
            {option.label}
          </span>
          {option.description && (
            <p className="text-gray-700 normal text-xs20">
              {option.description}
            </p>
          )}
        </div>

        {hasIcon && (
          <div className="text-gray-600">
            <img src={radioIcon} alt="radioIcon" className="w-7 h-7" />
          </div>
        )}
      </div>
    </label>
  );
});

// Main RadioGroup component with proper TypeScript generics
export const RadioGroup = <T extends string | object = string>({
  options,
  name,
  value: propValue,
  onChange: propOnChange,
  label,
  className,
  invalidFeedback,
  notRequired,
  disabled = false,
  hasIcon = false,
  validation,
  control,
}: RadioGroupProps<T>) => {
  const marginClass = useLanguageClass("ml-2", "");
  const memoizedOptions = useMemo(() => options, [options]);

  // Set first option as default when hasIcon is true and no value is provided
  const defaultValue = useMemo(() => {
    if (hasIcon && memoizedOptions.length > 0 && !propValue) {
      return memoizedOptions[0].value;
    }
    return propValue;
  }, [hasIcon, memoizedOptions, propValue]);

  const handleChange = useCallback((value: any) => {
    if (!disabled && propOnChange) {
      propOnChange(value);
    }
  }, [disabled, propOnChange]);

  const isOptionSelected = (option: RadioOption<T>, currentValue?: T) => {
    if (typeof option.value === 'object' && typeof currentValue === 'object') {
      return JSON.stringify(option.value) === JSON.stringify(currentValue);
    }
    return option.value === currentValue;
  };

  const renderRadioOptions = (currentValue?: T) => (
    <div className={classes("flex flex-wrap gap-6", className)}>
      {memoizedOptions.map((option, index) => (
        <RadioOptionComponent
          key={typeof option.value === 'object' 
            ? JSON.stringify(option.value) 
            : String(option.value)}
          option={option}
          isSelected={isOptionSelected(option, currentValue)}
          hasIcon={hasIcon}
          disabled={disabled}
          onChange={handleChange}
          name={name}
        />
      ))}
    </div>
  );

  if (control) {
    return (
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue} // Pass the default value here
        rules={validation}
        render={({ field }) => (
          <FieldWrapper
            notRequired={notRequired}
            labelFor={name}
            label={label}
            invalidFeedback={invalidFeedback}
          >
            {renderRadioOptions(field.value)}
          </FieldWrapper>
        )}
      />
    );
  }

  return (
    <FieldWrapper
      notRequired={notRequired}
      labelFor={name}
      label={label}
      invalidFeedback={invalidFeedback}
    >
      {renderRadioOptions(defaultValue)} {/* Use defaultValue here */}
    </FieldWrapper>
  );
};

// Add display name for better debugging
RadioGroup.displayName = "RadioGroup";
RadioOptionComponent.displayName = "RadioOptionComponent";