import { dateFieldConfigs } from "@/config/formConfig";
import { FormElement } from "@/shared/components/form/form.types";

interface Option {
  value: string;
  label: string;
}

interface BPSR1FormProps {
  t: (key: string) => string;
  commissionType: Option | null;
  accordingToAgreement: Option | null;
  setValue: (field: string, value: unknown) => void;
  CommissionTypeLookUpOptions: Option[];
  AccordingToAgreementLookupLookUpOptions: Option[];
}

export const getBPSR1FormFields = ({
  t,
  commissionType,
  accordingToAgreement,
  setValue,
  CommissionTypeLookUpOptions,
  AccordingToAgreementLookupLookUpOptions
}: BPSR1FormProps): FormElement[] => {
  return [
    {
      type: "input",
      name: "amount",
      label: t("amount"),
      inputType: "number",
      value: "",
      validation: { required: "Type of request is required" },
      notRequired: false,
      onChange: (value) => setValue("amount", value),
    },
    {
      type: "input",
      name: "amountRatio",
      label: t("amountRatio"),
      inputType: "number",
      value: "",
      validation: { required: "Type of request is required" },
      notRequired: false,
      onChange: (value) => setValue("amountRatio", value),
    },
    dateFieldConfigs(t).fromDate,
    dateFieldConfigs(t).toDate,  
    {
      type: "autocomplete",
      name: "commissionType",
      label: t("commissionType"),
      options: CommissionTypeLookUpOptions,
      value: commissionType,
      validation: { required: "Type of request is required" },
      notRequired: false,
      onChange: (option: Option | null) =>
        setValue("commissionType", option),
    },
    ...(commissionType?.label === "Other Commissions" ? [{
      type: "input",
      name: "otherCommission",
      label: t("otherCommission"),
      inputType: "number",
      value: "",
      validation: { required: "Type of request is required" },
      notRequired: false,
      onChange: (value: string) => setValue("otherCommission", value),
    } as const] : []),
    {
      type: "autocomplete",
      name: "accordingToAgreement",
      label: t("accordingToTheAgreement"),
      options: AccordingToAgreementLookupLookUpOptions,
      value: accordingToAgreement,
      validation: { required: "Type of request is required" },
      notRequired: false,
      onChange: (option: Option | null) =>
        setValue("accordingToAgreement", option),
    }
  ];
};