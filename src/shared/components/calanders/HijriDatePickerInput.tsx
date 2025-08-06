import React, { useMemo } from "react";
import { Control, Controller } from "react-hook-form";
import DatePicker, { DateObject } from "react-multi-date-picker";
import hijriCalendar from "react-date-object/calendars/arabic";
import hijriLocale from "react-date-object/locales/arabic_en";
import { FieldWrapper } from "@/shared/components/form";
import { Calculator01Icon } from "hugeicons-react";
import { FormData } from "@/shared/components/form/form.types";
import { useTranslation } from "react-i18next";

interface HijriDatePickerInputProps {
  control: Control<any>;
  name: keyof FormData;
  label: string;
  rules: any;
  onChangeHandler: (date: DateObject | DateObject[] | null, onChange: (value: string) => void) => void;
  notRequired?: boolean;
  isDateOfBirth?: boolean; // New prop to identify date of birth fields
}

export const HijriDatePickerInput: React.FC<HijriDatePickerInputProps> = ({
  control,
  name,
  label,
  rules,
  onChangeHandler,
  notRequired,
  isDateOfBirth = false, // Default to false
}) => {
  const { t, i18n } = useTranslation('hearingdetails');

  const formatDateForDisplay = (date: string) => {
    if (!date || date.length !== 8) return date;
    return `${date.slice(0, 4)}/${date.slice(4, 6)}/${date.slice(6)}`;
  };

  // Function to validate if date is not in the future (for date of birth fields)
  const validateFutureDate = (value: string) => {
    if (!isDateOfBirth || !value || value.length !== 8) return true;
    
    try {
      const hijriDate = new DateObject({
        date: formatDateForDisplay(value),
        calendar: hijriCalendar,
        locale: hijriLocale,
        format: "YYYY/MM/DD",
      });
      
      const today = new DateObject({
        calendar: hijriCalendar,
        locale: hijriLocale,
      });
      
      // Compare dates
      if (hijriDate.toDate() > today.toDate()) {
        return t("futureDateValidation");
      }
      
      return true;
    } catch (error) {
      return true; // If there's an error parsing the date, let other validations handle it
    }
  };

  // Function to validate date format and range
  const validateDateFormat = (value: string) => {
    if (!value) return true;
    
    // Check if it's in YYYYMMDD format (8 digits)
    if (value.length !== 8 || !/^\d{8}$/.test(value)) {
      return t("dateFormatValidation");
    }
    
    const year = parseInt(value.substring(0, 4));
    const month = parseInt(value.substring(4, 6));
    const day = parseInt(value.substring(6, 8));
    
    // Validate year range (reasonable Hijri years: 1300-1500)
    if (year < 1300 || year > 1500) {
      return t("yearRangeValidation");
    }
    
    // Validate month range
    if (month < 1 || month > 12) {
      return t("monthRangeValidation");
    }
    
    // Validate day range (basic check, actual days per month vary in Hijri calendar)
    if (day < 1 || day > 30) {
      return t("dayRangeValidation");
    }
    
    // Try to create a valid date object
    try {
      const dateStr = `${year}/${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`;
      new DateObject({
        date: dateStr,
        calendar: hijriCalendar,
        locale: hijriLocale,
        format: "YYYY/MM/DD",
      });
    } catch (error) {
      return t("invalidDateValidation");
    }
    
    return true;
  };

  // Enhanced rules with comprehensive validation
  const enhancedRules = {
    ...rules,
    validate: {
      ...rules.validate,
      futureDate: validateFutureDate,
      dateFormat: validateDateFormat,
    },
  };

  const handleDateChange = (date: DateObject | DateObject[] | null, onChange: (value: string) => void) => {
    if (!date || Array.isArray(date)) {
      onChange("");
      return;
    }

    const hijri = date.format("YYYY/MM/DD");
    // Convert to YYYYMMDD format for storage
    const hijriStorage = hijri.replace(/\//g, '');
    
    onChange(hijriStorage);
    if (onChangeHandler) {
      onChangeHandler(date, onChange);
    }
  };

  // Get today's date in Hijri calendar for maxDate prop
  const today = useMemo(() => new DateObject({
    calendar: hijriCalendar,
    locale: hijriLocale,
  }), []);

  return (
    <Controller
      shouldUnregister={false}
      name={name}
      control={control}
      rules={enhancedRules}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        // Memoize the date object to prevent infinite loops
        const memoizedDateValue = useMemo(() => {
          if (!value) return undefined;
          try {
            return new DateObject({
              date: formatDateForDisplay(value),
              calendar: hijriCalendar,
              locale: hijriLocale,
              format: "YYYY/MM/DD",
            });
          } catch (error) {
            console.warn('Invalid date value:', value, error);
            return undefined;
          }
        }, [value]);

        return (
          <FieldWrapper label={label} invalidFeedback={error?.message} notRequired={notRequired}>
            <div className="relative">
              <DatePicker
                placeholder="YYYY/MM/DD"
                calendar={hijriCalendar}
                locale={hijriLocale}
                format="YYYY/MM/DD"
                maxDate={isDateOfBirth ? today : undefined} // Prevent future dates for DOB fields
                value={memoizedDateValue}
                onChange={(date) => handleDateChange(date, onChange)}
                inputClass={`w-full p-2 border rounded text-sm focus:ring-1 focus:outline-none pr-8 cursor-pointer ${
                  error
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-400 focus:ring-blue-500"
                }`}
                calendarPosition="bottom-right"
              />
                <div className={`absolute ${i18n.dir() === "rtl" ? "left-2" : "right-2"} top-1/2 transform -translate-y-1/2 pointer-events-none`}>
                <Calculator01Icon className="text-gray-500" />
              </div>
            </div>
          </FieldWrapper>
        );
      }}
    />
  );
}; 