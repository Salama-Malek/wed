import { forwardRef, useId } from "react";
import { FieldWrapper } from "./FieldWrapper";
import { Tick02Icon } from "hugeicons-react";
import { classes } from "@/shared/lib/clsx";
import { Controller, useFormContext } from "react-hook-form";

export type CheckboxFieldProps = {
  name: string;
  label?: string;
  id?: string;
  className?: string;
  invalidFeedback?: any;
  isSmall?: boolean;
  notRequired?: boolean;
  disabled?: boolean;
  control?: any;
  rules?: any;
  defaultValue?: boolean;
  checked?: boolean;
  wrapperClassName?: string;
  onChange?: (checked: boolean) => void;
};

export const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(
  (
    {
      name,
      label,
      className,
      invalidFeedback,
      isSmall,
      notRequired,
      disabled,
      control: propControl,
      rules,
      defaultValue = false,
      wrapperClassName = "",
      checked: propChecked,
      onChange: propOnChange,
      ...rest
    },
    ref
  ) => {
    const context = useFormContext();
    const control = propControl || context?.control;

    if (!control) {
      return null;
    }
    const uniqueId = useId();
    const inputId = rest.id || uniqueId;

    return (
      <Controller
        name={name}
        control={control}
        rules={rules}
        defaultValue={defaultValue}
        render={({ field, fieldState }) => {
          const isControlled = propChecked !== undefined;
          const checked = isControlled ? propChecked : field.value;
          const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.checked;
            field.onChange(newValue);
            if (propOnChange) {
              propOnChange(newValue);
            }
          };

          return (
            <FieldWrapper
              labelFor={inputId}
              label=""
              invalidFeedback={fieldState.error?.message || invalidFeedback}
              notRequired={notRequired}
              wrapperClassName={className}
            >
              <div className={`${className} flex items-center gap-4`}>
                <div className="relative">
                  <input
                    {...field}
                    ref={(e) => {
                      field.ref(e);
                      if (typeof ref === "function") ref(e);
                      else if (ref) ref.current = e;
                    }}
                    id={inputId}
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                    className="hidden"
                    {...rest}
                  />
                  <div
                    className={classes(
                      `h-5 w-5 border rounded-2xs flex items-center justify-center cursor-pointer transition-all`,
                      checked
                        ? "bg-primary-600 border-primary-600"
                        : "bg-white border-gray-400",
                      disabled && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => !disabled && onChange({ target: { checked: !checked } } as any)}
                  >
                    {checked && (
                      <Tick02Icon color="white" strokeWidth={3} size={16} />
                    )}
                  </div>
                </div>

                <label
                  htmlFor={inputId}
                  className={`text-gray-800 text-${
                    isSmall ? "sm" : "md"
                  } medium ${
                    disabled
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer"
                  }`}
                >
                  {label}
                </label>
              </div>
            </FieldWrapper>
          );
        }}
      />
    );
  }
);
