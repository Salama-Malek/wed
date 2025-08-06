import React, { useEffect, useState } from "react";
import { DatePickerField } from "@/shared/components/calanders/DatePickerField";
import { ConvertedDateDisplay } from "./ConvertedDateDisplay";
import { Control, UseFormSetValue } from "react-hook-form";

export type DateOfBirthFieldProps = {
  hijriLabel?: string;
  gregorianLabel?: string;
  notRequired?: boolean;
  setValue?: UseFormSetValue<any>;
  hijriFieldName?: string;
  gregorianFieldName?: string;
  value?: any;
  control?: Control<any>;
};

export const DateOfBirthField: React.FC<DateOfBirthFieldProps> = ({
  hijriLabel = "Date (Hijri)",
  gregorianLabel = "Date (Gregorian)",
  notRequired,
  setValue,
  hijriFieldName = "hijriDate",
  gregorianFieldName = "gregorianDate",
  value,
  control,
}) => {
  const [dateInfo, setDateInfo] = useState<{
    hijri: string;
    gregorian: string;
    dateObject: any;
  }>({ hijri: "", gregorian: "", dateObject: null });

  // whenever dateObject changes, write back the eight-digit strings
  useEffect(() => {
    if (!setValue) return;

    // @ts-ignore
    const currentHijri = control?._formValues?.[hijriFieldName];
    // @ts-ignore
    const currentGregorian = control?._formValues?.[gregorianFieldName];

    if (dateInfo.dateObject) {
      if (currentHijri !== dateInfo.hijri) {
        setValue(hijriFieldName, dateInfo.hijri);
      }
      if (currentGregorian !== dateInfo.gregorian) {
        setValue(gregorianFieldName, dateInfo.gregorian);
      }
    } else {
      if (currentHijri !== "") setValue(hijriFieldName, "");
      if (currentGregorian !== "") setValue(gregorianFieldName, "");
    }
  }, [dateInfo, setValue, hijriFieldName, gregorianFieldName, control]);

  // Get gregorian value from form if available
  let gregorianValue = dateInfo.gregorian;
  if (control && gregorianFieldName) {
    // Try to get value from form state if possible
    // @ts-ignore
    const formValue = control._formValues?.[gregorianFieldName];
    if (formValue) gregorianValue = formValue;
  }

  return (
    <>
      <DatePickerField
        label={hijriLabel}
        notRequired={notRequired}
        calendarType="hijri"
        value={dateInfo.dateObject}
        control={control as any}
        name={hijriFieldName as any}
        rules={notRequired ? {} : { required: true }}
        onDateChange={(info) => setDateInfo(info)}
        isDateOfBirth={true} // Enable future date validation for date of birth fields
      />
      <div className="mt-2">
        <label className="text-sm !leading-5 normal block mb-1">
          {gregorianLabel}
        </label>
        <input
          type="text"
          value={gregorianValue || ""}
          readOnly
          className="w-full p-2 border rounded text-sm bg-gray-50 border-gray-200"
          placeholder="YYYY/MM/DD"
        />
      </div>
    </>
  );
};
