import { useGenericLookupQuery, useSubLookupQuery } from "../create-case/addHearingApis";
import { useGetCityLookupQuery } from "../create-case/cityLookupApis";
import { useGetWorkerCityLookupQuery } from "../create-case/workerCityLookupApis";
import { useGetEstablishmentCityLookupQuery } from "../create-case/establishmentCityLookupApis";
import { useGetJobLocationCityLookupQuery } from "../create-case/jobLocationCityLookupApis";
import { useTranslation } from "react-i18next";
import { UserTypesEnum } from "@/shared/types/userTypes.enum";
import { useCookieState } from "../../hooks/useCookieState";

type LookupConfig = {
  params: {
    LookupType: string;
    ModuleKey: string;
    ModuleName: string;
    SourceSystem?: string;
    AcceptedLanguage?: string;
    ApplicantType?: string;
  };
  skip?: boolean | string[];
  skipCondition?: (currentValue: string | undefined) => boolean;
};

export const useLookup = () => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language.toUpperCase();
  const [getCookie] = useCookieState();
  const userType = getCookie("userType");

  return {
    mainCategory: (isOpen?: boolean) => useGenericLookupQuery({
      LookupType: "CaseElements",
      ModuleKey: "CaseTopics",
      ModuleName: "CaseTopics",

      ApplicantType: userType === UserTypesEnum.WORKER ||
        userType === UserTypesEnum.EMBASSY ?
        userType : UserTypesEnum.ESTABLISHMENT, //Establishment/Worker

      SourceSystem: "E-Services",
      AcceptedLanguage: currentLanguage
    }
      , { skip: !isOpen }
    ),

    subCategory: (
      mainCategoryValue: string | undefined,
      extraParams?: { PlaintiffID?: string; Number700?: string; DefendantType?: string }
    ) => useSubLookupQuery(
      {
        LookupType: "CaseElements",
        ModuleKey: mainCategoryValue,
        ModuleName: "SubTopics",
        SourceSystem: "E-Services",
        AcceptedLanguage: currentLanguage,
        ...(extraParams?.PlaintiffID ? { PlaintiffID: extraParams.PlaintiffID } : {}),
        ...(extraParams?.Number700 ? { Number700: extraParams.Number700 } : {}),
        ...(extraParams?.DefendantType ? { DefendantType: extraParams.DefendantType } : {}),
      },
      { skip: !mainCategoryValue }
    ),

    amountPaidCategory: (subCategoryValue: string | undefined) => useGenericLookupQuery({
      LookupType: "DataElements",
      ModuleKey: "APF",
      ModuleName: "AmountsPaid",
      SourceSystem: "E-Services",
      AcceptedLanguage: currentLanguage
    },
      {
        skip: !subCategoryValue || !["CMR-1"].includes(subCategoryValue)
      }
    ),

    travelingWayCategory: (subCategoryValue: string | undefined) => useGenericLookupQuery({
      LookupType: "DataElements",
      ModuleKey: "TWay",
      ModuleName: "TravelingWay",
      SourceSystem: "E-Services",
      AcceptedLanguage: currentLanguage
    },
      {
        skip: !subCategoryValue || !["TTR-1"].includes(subCategoryValue)
      }
    ),

    leaveTypeCategory: (subCategoryValue: string | undefined) => useGenericLookupQuery({
      LookupType: "DataElements",
      ModuleKey: "MLT1",
      ModuleName: "LeaveType",
      SourceSystem: "E-Services",
      AcceptedLanguage: currentLanguage
    },
      {
        skip: !subCategoryValue || !["CMR-5"].includes(subCategoryValue)
      }
    ),

    forAllowance: (subCategoryValue: string | undefined) => useGenericLookupQuery(
      {
        LookupType: "DataElements",
        ModuleKey: "MFA1",
        ModuleName: "ForAllowance",
        SourceSystem: "E-Services",
        AcceptedLanguage: currentLanguage
      },
      {
        skip: !subCategoryValue || !["WR-1", "WR-2"].includes(subCategoryValue)
      }
    ),

    typeOfRequest: (subCategoryValue: string | undefined) => useGenericLookupQuery(
      {
        LookupType: "DataElements",
        ModuleKey: subCategoryValue === "RLRAHI-1" ? "RLRAHI" : "REQT",
        ModuleName: "RequestType",
        SourceSystem: "E-Services",
        AcceptedLanguage: currentLanguage
      },
      {
        skip: !subCategoryValue || !["MIR-1", "RLRAHI-1"].includes(subCategoryValue)
      }
    ),

    commissionType: (subCategoryValue: string | undefined) => useGenericLookupQuery(
      {
        LookupType: "DataElements",
        ModuleKey: "MCT1",
        ModuleName: "CommissionType",
        SourceSystem: "E-Services",
        AcceptedLanguage: currentLanguage
      },
      {
        skip: !subCategoryValue || !["BPSR-1"].includes(subCategoryValue)
      }
    ),

    accordingToAgreement: (subCategoryValue: string | undefined) => useGenericLookupQuery(
      {
        LookupType: "DataElements",
        ModuleKey: "MATA1",
        ModuleName: "AccordingToAgreement",
        SourceSystem: "E-Services",
        AcceptedLanguage: currentLanguage
      },
      {
        skip: !subCategoryValue || !["BR-1", "BPSR-1"].includes(subCategoryValue)
      }
    ),

    typesOfPenalties: (subCategoryValue: string | undefined) => useGenericLookupQuery(
      {
        LookupType: "DataElements",
        ModuleKey: "PENT",
        ModuleName: "PenalityType",
        SourceSystem: "E-Services",
        AcceptedLanguage: currentLanguage
      },
      {
        skip: !subCategoryValue || !["EDO-4"].includes(subCategoryValue)
      }
    ),

    city: () => useGetCityLookupQuery({
      LookupType: "CaseElements",
      ModuleKey: "07",
      ModuleName: "City",
      SourceSystem: "E-Services",
      AcceptedLanguage: currentLanguage
    }),

    workerCity: () => useGetWorkerCityLookupQuery({
      LookupType: "CaseElements",
      ModuleKey: "1",
      ModuleName: "WorkerCity",
      SourceSystem: "E-Services",
      AcceptedLanguage: currentLanguage
    }),

    establishmentCity: () => useGetEstablishmentCityLookupQuery({
      LookupType: "CaseElements",
      ModuleKey: "22",
      ModuleName: "EstablishmentCity",
      SourceSystem: "E-Services",
      AcceptedLanguage: currentLanguage
    }),

    jobLocationCity: () => useGetJobLocationCityLookupQuery({
      LookupType: "CaseElements",
      ModuleKey: "01",
      ModuleName: "JobLocationCity",
      SourceSystem: "E-Services",
      AcceptedLanguage: currentLanguage
    }),
    payIncreaseType: (subCategoryValue: string | undefined) => useGenericLookupQuery(
      {
        LookupType: "DataElements",
        ModuleKey: "PIT",
        ModuleName: "PayIncreaseType",
        SourceSystem: "E-Services",
        AcceptedLanguage: currentLanguage
      },
      {
        skip: !subCategoryValue || !["CMR-6"].includes(subCategoryValue)
      }
    )
  };
}
