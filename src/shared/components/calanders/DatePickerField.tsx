import React, { useId } from "react";
import { Control, Controller } from "react-hook-form";
import DatePicker, { DateObject } from "react-multi-date-picker";
import arabic from "react-date-object/calendars/arabic";
import gregorian from "react-date-object/calendars/gregorian";
import arabic_locale from "react-date-object/locales/arabic_en";
import gregorian_locale_en from "react-date-object/locales/gregorian_en";
import { FieldWrapper } from "@/shared/components/form";
import { Calculator01Icon } from "hugeicons-react";
import { FormData } from "@/shared/components/form/form.types";
import { useTranslation } from "react-i18next";

interface DatePickerFieldProps {
  control: Control<any>;
  name: keyof FormData;
  label: string;
  rules: any;
  notRequired?: boolean;
  calendarType?: "hijri" | "gregorian";
  value?: DateObject | null;
  onDateChange?: (info: {
    dateObject: DateObject | null;
    hijri: string;
    gregorian: string;
  }) => void;
  isDateOfBirth?: boolean; // New prop to identify date of birth fields
}

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
  control,
  name,
  label,
  rules,
  notRequired,
  calendarType = "hijri",
  value,
  onDateChange,
  isDateOfBirth = false, // Default to false
}) => {
  const uniqueId = useId();
  const { t } = useTranslation('hearingdetails');
  const isArabic = calendarType === "hijri";

  // Function to validate if date is not in the future (for date of birth fields)
  const validateFutureDate = (value: string) => {
    if (!isDateOfBirth || !value || value.length !== 8) return true;
    
    try {
      const date = new DateObject({
        date: `${value.slice(0, 4)}/${value.slice(4, 6)}/${value.slice(6)}`,
        calendar: isArabic ? arabic : gregorian,
        locale: isArabic ? arabic_locale : gregorian_locale_en,
        format: "YYYY/MM/DD",
      });
      
      const today = new DateObject({
        calendar: isArabic ? arabic : gregorian,
        locale: isArabic ? arabic_locale : gregorian_locale_en,
      });
      
      // Compare dates
      if (date.toDate() > today.toDate()) {
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
    
    if (isArabic) {
      // Validate year range (reasonable Hijri years: 1300-1500)
      if (year < 1300 || year > 1500) {
        return t("yearRangeValidation");
      }
    } else {
      // Validate year range (reasonable Gregorian years: 1900-2100)
      if (year < 1900 || year > 2100) {
        return t("yearRangeValidationGregorian");
      }
    }
    
    // Validate month range
    if (month < 1 || month > 12) {
      return t("monthRangeValidation");
    }
    
    // Validate day range (basic check, actual days per month vary)
    if (isArabic) {
      // Hijri calendar: days 1-30
      if (day < 1 || day > 30) {
        return t("dayRangeValidation");
      }
    } else {
      // Gregorian calendar: days 1-31
      if (day < 1 || day > 31) {
        return t("dayRangeValidationGregorian");
      }
    }
    
    // Try to create a valid date object
    try {
      const dateStr = `${year}/${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`;
      new DateObject({
        date: dateStr,
        calendar: isArabic ? arabic : gregorian,
        locale: isArabic ? arabic_locale : gregorian_locale_en,
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

  const handleDateChange = (date: DateObject | DateObject[] | null) => {
    if (!date || Array.isArray(date)) {
      if (onDateChange) {
        onDateChange({
          dateObject: null,
          hijri: "",
          gregorian: "",
        });
      }
      return;
    }

    const hijri = date.format("YYYY/MM/DD");
    const gregorianStr = date.convert(gregorian, gregorian_locale_en).format("YYYY/MM/DD");

         if (onDateChange) {
       onDateChange({
         dateObject: date,
         hijri: hijri.replace(/\//g, ''),
         gregorian: gregorianStr.replace(/\//g, ''),
       });
     }
  };

  // Get today's date for maxDate prop (for date of birth fields)
  const today = new DateObject({
    calendar: isArabic ? arabic : gregorian,
    locale: isArabic ? arabic_locale : gregorian_locale_en,
  });

  return (
    <Controller
      shouldUnregister={false}
      name={name}
      control={control}
      rules={enhancedRules}
      render={({ field: { onChange, value: fieldValue }, fieldState: { error } }) => (
        <FieldWrapper
          notRequired={notRequired}
          label={label}
          invalidFeedback={error?.message}
        >
          <div className="relative">
            <DatePicker
              id={uniqueId}
              calendar={isArabic ? arabic : gregorian}
              locale={isArabic ? arabic_locale : gregorian_locale_en}
              format="YYYY/MM/DD"
              placeholder={t('date')}
              maxDate={isDateOfBirth ? today : undefined} // Prevent future dates for DOB fields
              value={
                fieldValue && /^\d{4}\/\d{2}\/\d{2}$/.test(fieldValue.toString())
                  ? new DateObject({
                      date: fieldValue,
                      calendar: isArabic ? arabic : gregorian,
                      locale:
                        isArabic ? arabic_locale : gregorian_locale_en,
                      format:
                        "YYYY/MM/DD",
                    })
                  : undefined
              }
              onChange={(date) => {
                if (date && !Array.isArray(date)) {
                  const formattedDate = date.format("YYYY/MM/DD");
                  onChange(formattedDate);
                  handleDateChange(date);
                } else {
                  onChange("");
                  handleDateChange(null);
                }
              }}
              inputClass={`
                w-full p-2 border rounded text-sm focus:ring-1 focus:outline-none pr-8 cursor-pointer
                ${
                  error
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-400 focus:ring-blue-500"
                }
              `}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <Calculator01Icon />
            </div>
          </div>
        </FieldWrapper>
      )}
    />
  );
};
