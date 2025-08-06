import { FormElement } from "@/shared/components/form/form.types";
import { formatHijriDate, formatDateToYYYYMMDD } from "@/shared/lib/helpers";
import { useTranslation } from "react-i18next";
import { HijriDatePickerInput } from "@/shared/components/calanders/HijriDatePickerInput";
import { GregorianDateDisplayInput } from "@/shared/components/calanders/GregorianDateDisplayInput";
import { DateObject } from "react-multi-date-picker";
import hijriCalendar from "react-date-object/calendars/arabic";
import gregorianCalendar from "react-date-object/calendars/gregorian";
import hijriLocale from "react-date-object/locales/arabic_en";
import gregorianLocale from "react-date-object/locales/gregorian_en";

type FormConfig = {
  isEditing: boolean;
  handleAddTopic: () => void;
  t: (key: string) => string;
};

let formConfig: FormConfig | null = null;

export const initFormConfig = (config: FormConfig) => {
  formConfig = config;
};

export const getCommonElements = (
  isValid: boolean | undefined
): (FormElement | false)[] => {
  if (!formConfig) throw new Error("Form config not initialized!");

  const { isEditing, handleAddTopic, t } = formConfig;

  return [
    !isEditing && {
      type: "custom" as const,
      colSpan: 2,
      component: (
        <p className="text-sm text-secondary-700 font-semibold">
          {t("auto_save_note")}
        </p>
      ),
    },
    !isEditing && {
      disabled: !isValid,
      type: "button" as const,
      label: t("add_topic"),
      onClick: handleAddTopic,
      size: "sm" as const,
      colSpan: 1,
    },
  ];
};

export const buildForm = (elements: (FormElement | false)[]) => [...elements];

export const dateFieldConfigs = (
  t: any,
  isEditing?: any,
  from_date_hijri?: any,
  to_date_hijri?: any,
  setValue?: any,
  control?: any,
  handleHijriDateChange?: any
) =>
  ({
    fromDate: {
      type: "custom" as const,
      component: (
        <div className="flex flex-col gap-2">
          <HijriDatePickerInput
            control={control}
            name="from_date_hijri"
            label={t("fromDateHijri")}
            rules={{required: true}}
            onChangeHandler={(date, onChange) =>
              handleHijriDateChange(
                date,
                onChange,
                "from_date_gregorian"
              )
            }
          />
          <GregorianDateDisplayInput
            control={control}
            name="from_date_gregorian"
            label={t("fromDateGregorian")}
          />
        </div>
      ),
    },
    toDate: {
      type: "custom" as const,
      component: (
        <div className="flex flex-col gap-2">
          <HijriDatePickerInput
            control={control}
            name="to_date_hijri"
            label={t("toDateHijri")}
            rules={{required: true}}
            onChangeHandler={(date, onChange) =>
              handleHijriDateChange(
                date,
                onChange,
                "to_date_gregorian"
              )
            }
          />
          <GregorianDateDisplayInput
            control={control}
            name="to_date_gregorian"
            label={t("toDateGregorian")}
          />
        </div>
      ),
    },
  } as const);

export type DateFieldKey = keyof typeof dateFieldConfigs;

export const managerialDateConfigs = (t: any, setValue?: any, watch?: any, control?: any, handleHijriDateChange?: any) => {
  
  return ({
    managerialDate: {
      type: "custom" as const,
      component: (
        <div className="flex flex-col gap-2">
          <HijriDatePickerInput
            control={control}
            name="managerial_decision_date_hijri"
            label={t("managerialDecisionDateHijri")}
            rules={{required: true}}
            onChangeHandler={(date, onChange) =>
              handleHijriDateChange(
                date,
                onChange,
                "managerial_decision_date_gregorian"
              )
            }
          />
          <GregorianDateDisplayInput
            control={control}
            name="managerial_decision_date_gregorian"
            label={t("managerialDecisionDateGregorian")}
          />
        </div>
      ),
    },
    managerialNumber: {
      type: "input",
      name: "managerialDecisionNumber",
      label: t("managerialDecisionNumber"),
      inputType: "number",
      notRequired: true,
      value: watch ? watch("managerialDecisionNumber") || "" : "",
      onChange: (value: string) => setValue("managerialDecisionNumber", value),
    },
  } as const);
};

interface InputFieldProps {
  name: string;
  labelKey: string;
  inputType?: "text" | "number" | "email" | "password" | "textarea";
  value?: string;
  onChange: (value: string) => void;
  colSpan?: number;
  disabled?: boolean;
  t: (key: string) => string;
}

export const inputField = ({
  name,
  labelKey,
  inputType = "text",
  value = "",
  onChange,
  colSpan,
  t,
}: InputFieldProps): FormElement => ({
  type: "input",
  name,
  label: t(labelKey),
  inputType,
  value,
  onChange,
  colSpan,
});
