import React from "react";
import { Control, Controller } from "react-hook-form";
import DatePicker, { DateObject } from "react-multi-date-picker";
import { FieldWrapper } from "@/shared/components/form";
import { Calculator01Icon } from "hugeicons-react";
import { FormData } from "@/shared/components/form/form.types";
import { useTranslation } from "react-i18next";

interface GregorianDatePickerInputProps {
  control: Control<any>;
  name: keyof FormData;
  label: string;
  rules: any;
  onChangeHandler: (date: DateObject | DateObject[] | null, onChange: (value: string) => void) => void;
  notRequired?: boolean;
  isDateOfBirth?: boolean;
}

export const GregorianDatePickerInput: React.FC<GregorianDatePickerInputProps> = ({
  control,
  name,
  label,
  rules,
  onChangeHandler,
  notRequired,
  isDateOfBirth,
}) => {
  const { t, i18n } = useTranslation('hearingdetails');

  const formatDateForDisplay = (date: string) => {
    if (!date || date.length !== 8) return date;
    return `${date.slice(0, 4)}/${date.slice(4, 6)}/${date.slice(6)}`;
  };

  const handleDateChange = (date: DateObject | DateObject[] | null, onChange: (value: string) => void) => {
    if (!date || Array.isArray(date)) {
      onChange("");
      return;
    }

    const gregorian = date.format("YYYY/MM/DD");
    // Convert to YYYYMMDD format for storage
    const gregorianStorage = gregorian.replace(/\//g, '');

    onChange(gregorianStorage);
    if (onChangeHandler) {
      onChangeHandler(date, onChange);
    }
  };

  // Set maxDate to today if isDateOfBirth is true
  const maxDate = isDateOfBirth ? new DateObject() : undefined;

  return (
    <Controller
      shouldUnregister={false}
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <FieldWrapper label={label} invalidFeedback={error?.message} notRequired={notRequired}>
          <div className="relative">
            <DatePicker
              placeholder="YYYY/MM/DD"
              format="YYYY/MM/DD"
              value={
                value
                  ? new DateObject({
                    date: formatDateForDisplay(value),
                    format: "YYYY/MM/DD",
                  })
                  : undefined
              }
              onChange={(date) => handleDateChange(date, onChange)}
              inputClass={`w-full p-2 border rounded text-sm focus:ring-1 focus:outline-none pr-8 ${error
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-400 focus:ring-blue-500"
                }`}
              calendarPosition="bottom-right"
              maxDate={isDateOfBirth ? maxDate : undefined}
            />
            <div className={`absolute ${i18n.dir() === "rtl" ? "left-2" : "right-2"} top-1/2 transform -translate-y-1/2 pointer-events-none`}>
              <Calculator01Icon className="text-gray-500" />
            </div>
          </div>
        </FieldWrapper>
      )}
    />
  );
}; 