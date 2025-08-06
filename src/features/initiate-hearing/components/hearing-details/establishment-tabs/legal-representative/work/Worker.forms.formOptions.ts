import { Option } from "@/shared/components/form/form.types";
import { RadioOption } from "@/shared/components/form/RadioGroup";
import { useTranslation } from "react-i18next";
import { useGetRegionLookupDataQuery, useGetCityLookupDataQuery } from "@/features/initiate-hearing/api/create-case/workDetailApis";

interface FormOptionsProps {
  context?: "worker" | "establishment" | "default";
}

export const useFormOptions = ({ context = "default" }: FormOptionsProps = {}) => {
  const { t } = useTranslation("hearingdetails");
  const { data: regionData } = useGetRegionLookupDataQuery({
    AcceptedLanguage: "EN",
    // SourceSystem: "E-Services",
    context
  });

  const RegionOptions = regionData?.DataElements?.map((item: any) => ({
    value: item.ElementKey,
    label: item.ElementValue,
  })) || [];

  const CityOptions = [] as Option[]; // Will be populated when region is selected

  return {
    TypeOfWageOptions: [
      { value: "monthly", label: "Monthly" },
      { value: "weekly", label: "Weekly" },
    ] as Option[],

    // Removed ContractTypeOptions (should be fetched from API elsewhere)

    RegionOptions,
    CityOptions,
  };
};

export const useWorkerFormOptions = () => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language.toUpperCase();

  return {
    getSalaryTypeLookup: () => ({
      url: `/WeddiServices/V1/MainLookUp`,
      params: {
        LookupType: "DataElements",
        ModuleKey: "MST1",
        ModuleName: "SalaryType",
        AcceptedLanguage: currentLanguage,
        SourceSystem: "E-Services",
      },
    }),

    // getContractTypeLookup: ({
    //   userType,
    //   defendantStatus,
    // }: {
    //   userType: string;
    //   defendantStatus: string;
    // }) => ({
    //   url: `/WeddiServices/V1/MainLookUp`,
    //   params: {
    //     LookupType: "DataElements",
    //     ModuleKey:
    //       userType === "Legal representative" ||
    //         (userType === "Worker" && defendantStatus === "Government")
    //         ? "MCOTP2"
    //         : "MCOTP1",
    //     ModuleName: "ContractType",
    //     AcceptedLanguage: currentLanguage,
    //     SourceSystem: "E-Services",
    //   },
    // }),

  };
};
