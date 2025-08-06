import { Option } from "@/shared/components/form/form.types";
import { RadioOption } from "@/shared/components/form/RadioGroup";
import { useTranslation } from "react-i18next";
import CountryCodes from "../../../../../../../public/CountryCode.json";

export const useFormOptions = () => {
  const { t } = useTranslation("hearingdetails");

  // Map CountryCodes JSON to Option[] for dropdown
  const CodeOptions: Option[] = CountryCodes.map((country: any) => ({
    value: country.dial_code,
    label: `${country.name} (${country.dial_code})`,
  }));

  return {
    ClaimantStatusRadioOptions: [
      { label: t("representative"), value: "representative", description: t("representative_desc") },
      { label: t("principal_title"), value: "principal", description: t("principal_desc") },
    ] as RadioOption[],

    IsDomesticRadioOptions: [
      { label: t("skilled_worker"), value: "skilled_worker" },
      { label: t("domestic_worker"), value: "domestic_worker" },
    ] as RadioOption[],

    OccupationOptions: [{ value: "occupation", label: "Occupation" }] as Option[],

    GenderOptions: [
      { value: "M", label: "Male" },
      { value: "F", label: "Female" },
    ] as Option[],

    CodeOptions,

    NationalityOptions: [
      { value: "saudi", label: "Saudi" },
      { value: "pakistani", label: "Pakistani" },
    ] as Option[],

    CityOptions: [
      { value: "riyadh", label: "Riyadh" },
      { value: "makkah", label: "Makkah" },
    ] as Option[],

    certifiedRadioOptions: [
      { label: t("local_agency"), value: "CB1" },
      { label: t("external_agency"), value: "CB2" },
    ] as RadioOption[],
    
  };
};
