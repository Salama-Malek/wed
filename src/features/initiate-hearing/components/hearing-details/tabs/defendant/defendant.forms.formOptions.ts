import { Option } from "@/shared/components/form/form.types";
import { RadioOption } from "@/shared/components/form/RadioGroup";
import { useTranslation } from "react-i18next";

export const useFormOptions = ({ EstablishmentData = [] }: any) => {
  const { t } = useTranslation("hearingdetails");

  return {
    DefendantStatusRadioOptions: [
      {
        label: t("main_category_of_the_government_entity"),
        value: "main_category_of_the_government_entity",
      },
      {
        label: t("subcategory_of_the_government_entity"),
        value: "subcategory_of_the_government_entity",
      },
    ] as RadioOption[],

    IsEstablishmentRadioOptions: [
      ...(EstablishmentData && EstablishmentData.length > 0
        ? EstablishmentData.map((establishment: any) => ({
          label: establishment.EstablishmentName,
          value: {
            EstablishmentFileNumber: establishment.EstablishmentFileNumber,
            ServiceEndDate: establishment.ServiceEndDate,
            ServiceStartDate: establishment.ServiceStartDate,
            EstablishmentName: establishment.EstablishmentName,
            StillWorking: establishment.StillWorking,
            OtherFlag: "Others",
          },
          description: t(" "),
        }))
        : []),
      {
        label: t("others"),
        value: "Others",
        description: t(" "),
      },
    ] as RadioOption[],

    IsGovernmentRadioOptions: [
      {
        label: t("non_governmental_entities"),
        value: "Establishment",
      },
      {
        label: t("governmental_entities"),
        value: "Government",
      },
    ] as RadioOption[],

    RegionOptions: [
      { value: "riyadh", label: "Riyadh" },
      { value: "makkah", label: "Makkah" },
    ] as Option[],

    CityOptions: [
      { value: "riyadh", label: "Riyadh" },
      { value: "makkah", label: "Makkah" },
    ] as Option[],

    OccupationOptions: [
      { value: "occupation", label: "Occupation" },
    ] as Option[],

    GenderOptions: [
      { value: "male", label: "Male" },
      { value: "female", label: "Female" },
    ] as Option[],

    CodeOptions: [
      { value: "pak", label: "+92" },
      { value: "saudi", label: "+966" },
    ] as Option[],

    NationalityOptions: [
      { value: "saudi", label: "Saudi" },
      { value: "pakistani", label: "Pakistani" },
    ] as Option[],
  };
};
