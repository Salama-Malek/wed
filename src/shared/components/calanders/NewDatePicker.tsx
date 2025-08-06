import React from "react";
import { Control, Controller } from "react-hook-form";
import DatePicker, { DateObject } from "react-multi-date-picker";
import hijriCalendar from "react-date-object/calendars/arabic";
import hijriLocale from "react-date-object/locales/arabic_en";
import { FieldWrapper } from "@/shared/components/form";
import { Calculator01Icon } from "hugeicons-react";
import { FormData } from "@/shared/components/form/form.types";
import { useTranslation } from "react-i18next";

interface NewDatePickerProps {
  control: Control<any>;
  name: keyof FormData;
  label: string;
  rules: any;
  notRequired?: boolean;
  type?: "contract-start" | "contract-end" | "dob" | "last-working-date";
  invalidFeedback?: string;
  isDateOfBirth?: boolean; // New prop to identify date of birth fields
}

export const NewDatePicker: React.FC<NewDatePickerProps> = ({
  control,
  name,
  label,
  rules,
  notRequired,
  type = "contract-start",
  invalidFeedback,
  isDateOfBirth = false, // Default to false
}) => {
  const { t } = useTranslation('hearingdetails');

  // Function to validate if date is not in the future (for date of birth fields)
  const validateFutureDate = (value: string) => {
    if (!isDateOfBirth || !value || value.length !== 8) return true;
    
    try {
      const date = new DateObject({
        date: `${value.slice(0, 4)}/${value.slice(4, 6)}/${value.slice(6)}`,
        calendar: hijriCalendar,
        locale: hijriLocale,
        format: "YYYY/MM/DD",
      });
      
      const today = new DateObject({
        calendar: hijriCalendar,
        locale: hijriLocale,
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
  };

  // Get today's date in Hijri calendar for maxDate prop
  const today = new DateObject({
    calendar: hijriCalendar,
    locale: hijriLocale,
  });

  return (
    <Controller
      shouldUnregister={false}
      name={name}
      control={control}
      rules={enhancedRules}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <FieldWrapper label={label} invalidFeedback={error?.message || invalidFeedback} notRequired={notRequired}>
          <div className="relative">
            <DatePicker
              placeholder="YYYY/MM/DD"
              calendar={hijriCalendar}
              locale={hijriLocale}
              format="YYYY/MM/DD"
              maxDate={isDateOfBirth ? today : undefined} // Prevent future dates for DOB fields
              value={
                value && /^\d{4}\/\d{2}\/\d{2}$/.test(value)
                  ? new DateObject({
                      date: value,
                      calendar: hijriCalendar,
                      locale: hijriLocale,
                      format: "YYYY/MM/DD",
                    })
                  : undefined
              }
              onChange={(date) => handleDateChange(date, onChange)}
              inputClass={`w-full p-2 border rounded text-sm focus:ring-1 focus:outline-none pr-8 cursor-pointer ${
                error || invalidFeedback
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-400 focus:ring-blue-500"
              }`}
              calendarPosition="bottom-right"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <Calculator01Icon className="text-gray-500" />
            </div>
            {(error || invalidFeedback) && (
              <div className="invalid-feedback text-red-500 mt-2">
                {error?.message || invalidFeedback}
              </div>
            )}
          </div>
        </FieldWrapper>
      )}
    />
  );
};

export default NewDatePicker;