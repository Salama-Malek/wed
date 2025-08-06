import { FormElement, Option } from "@/shared/components/form/form.types";
import { HijriDatePickerInput } from "@/shared/components/calanders/HijriDatePickerInput";
import { GregorianDateDisplayInput } from "@/shared/components/calanders/GregorianDateDisplayInput";
import { DateObject } from "react-multi-date-picker";
import { Control } from "react-hook-form";
import { ensureOption } from "../edit-index";

interface BR1FormProps {
  t: (key: string) => string;
  accordingToAgreement: Option | null;
  setValue: (field: string, value: unknown) => void;
  AccordingToAgreementLookupLookUpOptions: Option[];
  isEditing?: boolean;
  watch: (name: string) => any;
  editTopic?: any;
  control: Control<any>;
  handleHijriDateChange: (
    date: DateObject | DateObject[] | null,
    setHijriValue: (value: string) => void,
    gregorianFieldName: string
  ) => void;
}

export const getBR1FormFields = ({
  t,
  accordingToAgreement,
  setValue,
  AccordingToAgreementLookupLookUpOptions,
  isEditing,
  watch,
  editTopic,
  control,
  handleHijriDateChange,
}: BR1FormProps): FormElement[] => {
  const bonusAmount = watch("bonusAmount");

  const accordingVal = isEditing
    ? ensureOption(
        AccordingToAgreementLookupLookUpOptions,
        editTopic?.accordingToAgreement?.value ?? editTopic?.AccordingToAgreement
      )
    : accordingToAgreement;

  const bonusVal = isEditing
    ? editTopic?.bonusAmount ?? editTopic?.Premium ?? ""
    : bonusAmount ?? "";

  return [
    {
      type: "autocomplete",
      name: "accordingToAgreement",
      label: t("accordingToTheAgreement"),
      options: AccordingToAgreementLookupLookUpOptions,
      value: accordingVal,
      onChange: (opt: Option | null) => setValue("accordingToAgreement", opt),
      validation: { required: t("fieldRequired") },
    },
    {
      type: "input",
      name: "bonusAmount",
      label: t("bonusAmount"),
      inputType: "number",
      value: bonusVal,
      onChange: (v: string) => setValue("bonusAmount", v),
      validation: { required: t("fieldRequired") },
    },
    {
      type: "custom",
      component: (
        <div className="flex flex-col gap-2">
          <HijriDatePickerInput
            control={control}
            name="date_hijri"
            label={t("dateHijri")}
            rules={{ required: t("fieldRequired") }}
            onChangeHandler={(date, onChange) =>
              handleHijriDateChange(date, onChange, "date_gregorian")
            }
          />
          <GregorianDateDisplayInput
            control={control}
            name="date_gregorian"
            label={t("gregorianDate")}
          />
        </div>
      ),
    },
  ];
};
