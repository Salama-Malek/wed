import { useEffect, useState } from "react";
import { useLazyGetCaseDetailsQuery } from "@/features/manage-hearings/api/myCasesApis";
import { useCookieState } from "./useCookieState";
import { formatDateString, formatHijriDate } from "@/shared/lib/helpers";
import { json } from "stream/consumers";

export interface CaseDetails {
  // Plaintiff fields
  Plaintiff_Nationality?: string;
  Plaintiff_Nationality_Code?: string;
  Plaintiff_Gender_Code?: string;
  Plaintiff_Gender?: string;
  Plaintiff_ContractNumber?: string;
  Plaintiff_ContractStartDate?: string;
  Plaintiff_ContractStartDateHijri?: string;
  Plaintiff_ContractEndDate?: string;
  Plaintiff_ContractEndDateHijri?: string;
  Plaintiff_ContractType_Code?: string;
  Plaintiff_ContractType?: string;
  Plaintiff_JobLocation?: string;
  Plaintiff_JobLocation_Code?: string;
  Plaintiff_ApplicantBirthDate?: string;
  PlaintiffHijiriDOB?: string;
  PlaintiffId?: string;
  Plaintiff_MobileNumber?: string;
  Plaintiff_EmailAddress?: string;
  Plaintiff_Salary?: string;
  Plaintiff_SalaryType?: string;
  Plaintiff_SalaryType_Code?: string;
  Plaintiff_StillWorking_Code?: string;
  Plaintiff_StillWorking?: string;
  Plaintiff_JobStartDate?: string;
  Plaintiff_JobStartDateHijri?: string;
  Plaintiff_JobEndDate?: string;
  Plaintiff_JobEndDateHijri?: string;
  PlaintiffJobCity?: string;
  PlaintiffJobCity_Code?: string;
  Plaintiff_Region?: string;
  Plaintiff_Region_Code?: string;
  Plaintiff_City?: string;
  Plaintiff_City_Code?: string;
  PlaintiffType?: string;
  PlaintiffType_Code?: string;
  Plaintiff_FirstLanguage?: string;
  Plaintiff_FirstLanguage_Code?: string;
  Plaintiff_Occupation?: string;
  Plaintiff_Occupation_Code?: string;
  // Defendant fields
  Defendant_ContractNumber?: string;
  Defendant_ContractStartDate?: string;
  Defendant_ContractStartDateHijri?: string;
  Defendant_ContractEndDate?: string;
  Defendant_ContractEndDateHijri?: string;
  Defendant_ContractType_Code?: string;
  Defendant_ContractType?: string;
  Defendant_JobLocation?: string;
  Defendant_JobLocation_Code?: string;
  Defendant_JobStartDate?: string;
  Defendant_JobStartDateHijri?: string;
  Defendant_JobEndDate?: string;
  Defendant_JobEndDateHijri?: string;
  DefendantJobCity?: string;
  DefendantJobCity_Code?: string;
  Defendant_Region?: string;
  Defendant_Region_Code?: string;
  Defendant_City?: string;
  Defendant_City_Code?: string;
  Defendant_MobileNumber?: string;
  Defendant_PhoneNumber?: string;
  Defendant_CRNumber?: string;
  DefendantEstFileNumber?: string;
  DefendantType?: string;
  DefendantType_Code?: string;
  Defendant_StatusID?: string;
  Defendant_MainGovtDefend?: string;
  Defendant_MainGovtDefend_Code?: string;
  DefendantSubGovtDefend?: string;
  DefendantSubGovtDefend_Code?: string;
  Defendant_Number700?: string;
  // Defendant wage fields (if any)
  Defendant_Salary?: string;
  Defendant_SalaryType?: string;
  Defendant_SalaryType_Code?: string;
  Defendant_StillWorking_Code?: string;
  Defendant_StillWorking?: string;
  // General/other fields
  SettlementID?: string;
  DownloadPDF?: string;
  DownloadClaimForm?: string;
  pxCreateDateTime?: string;
  ApplicantType?: string;
  ApplicantType_Code?: string;
  InternationalCountryName?: string;
  InternationalCountryCode?: string;
  InternationalNumber?: string;
  HasInternationalNumber?: string;
  DomesticWorker?: string;
  UpdateCase?: string;
  Reopen?: string;
  StatusWork_Code?: string;
  StatusWork?: string;
  RejectReasonDetails?: string;
  RejectedReason?: string;
  IncompleteCase?: string;
  CancelCase?: string;
  CertifiedBy?: string;
  CertifiedBy_Code?: string;
  RepresentativeType?: string;
  AgentType?: string;
  AgentType_Code?: string;
  OfficeName?: string;
  OfficeName_Code?: string;
  EstablishmentFullName?: string;
  CurrentScreen?: string;
  ResendAppointment?: string;
  CaseTopics?: any[];
  PlaintiffName?: string;
}

export interface CaseDetailsResponse {
  CaseDetails: CaseDetails;
  SourceSystem: string;
}

// Helper to nullify empty label/value objects
function nullifyIfEmpty(obj: any) {
  if (
    obj &&
    typeof obj === 'object' &&
    'label' in obj &&
    'value' in obj &&
    (obj.value === '' || obj.value === null || obj.value === undefined || obj.value?.toString().trim() === '')
  ) {
    return null;
  }
  return obj;
}

const useWorkDetailsPrefill = (setValue: (field: string, value: any) => void, trigger?: (name?: string | string[]) => Promise<boolean>) => {
  const [getCookie, setCookie] = useCookieState();
  const [triggerCaseDetailsQuery, { isLoading }] = useLazyGetCaseDetailsQuery();
  const [isFeatched, setIsfetched] = useState<boolean>(false);
  const [workData, setWorkData] = useState<any | null>(null);
  useEffect(() => {
    const caseId = getCookie("caseId");
    const userClaims = getCookie("userClaims");
    const userType = getCookie("userType");
    const lang = userClaims?.AcceptedLanguage?.toUpperCase() || "EN";

    if (!caseId || !userType) return;

    const payload = {
      CaseID: caseId,
      UserType: userType,
      IDNumber: userClaims?.UserID || "",
      AcceptedLanguage: lang,
      SourceSystem: "E-Services",
      FileNumber: userType === "Establishment" ? userClaims?.File_Number || "" : "",
      MainGovernment: userType === "Legal representative" ? getCookie("mainCategory")?.value || "" : "",
      SubGovernment: userType === "Legal representative" ? getCookie("subCategory")?.value || "" : ""
    };

    triggerCaseDetailsQuery(payload).then((result) => {
      const details = result?.data?.CaseDetails;
      setIsfetched(true);
      if (!details) return;
      localStorage.setItem("CaseDetails", JSON.stringify(details));
      setWorkData(EXtractWorkeDetailsData(details));

    });
  }, []);


  const EXtractWorkeDetailsData = (caseDetails: CaseDetails) => {
    const plaintiff_type_code = caseDetails?.ApplicantType_Code
    const defendent_type_code = caseDetails?.DefendantType_Code
    const representative_type = caseDetails?.RepresentativeType
    const plainteffWorkDetails = {
      contractNumber: caseDetails?.Plaintiff_ContractNumber,
      salary: caseDetails?.Plaintiff_Salary,
      typeOfWage: nullifyIfEmpty({
        label: caseDetails?.Plaintiff_SalaryType,
        value: caseDetails?.Plaintiff_SalaryType_Code,
      }),
      contractType: nullifyIfEmpty({
        value: caseDetails?.Plaintiff_ContractType_Code,
        label: caseDetails?.Plaintiff_ContractType
      }),
      jobLocation: nullifyIfEmpty({
        value: caseDetails?.Plaintiff_JobLocation_Code,
        label: caseDetails?.Plaintiff_JobLocation
      }),
      jobCity: nullifyIfEmpty({
        value: caseDetails?.PlaintiffJobCity_Code,
        label: caseDetails?.PlaintiffJobCity
      }),
      laborOffice: nullifyIfEmpty({
        value: caseDetails?.OfficeName_Code,
        label: caseDetails?.OfficeName
      }),
      stillWorking: {
        value: caseDetails?.Plaintiff_StillWorking_Code,
        label: caseDetails?.Plaintiff_StillWorking
      },
      contractStart: {
        hijri: caseDetails?.Plaintiff_ContractStartDateHijri,
        gregorian: caseDetails?.Plaintiff_ContractStartDate
      },
      contractEnd: {
        hijri: caseDetails?.Plaintiff_ContractEndDateHijri,
        gregorian: caseDetails?.Plaintiff_ContractEndDate
      },
      jobStart: {
        hijri: caseDetails?.Plaintiff_JobStartDateHijri,
        gregorian: caseDetails?.Plaintiff_JobStartDate
      },
      jobEnd: {
        hijri: caseDetails?.Plaintiff_JobEndDateHijri,
        gregorian: caseDetails?.Plaintiff_JobEndDate
      },
    }
    const defendentWorkDetails = {
      contractNumber: caseDetails?.Defendant_ContractNumber,
      salary: caseDetails?.Defendant_Salary,
      typeOfWage: nullifyIfEmpty({
        label: caseDetails?.Defendant_SalaryType,
        value: caseDetails?.Defendant_SalaryType_Code,
      }),
      contractType: nullifyIfEmpty({
        value: caseDetails?.Defendant_ContractType_Code,
        label: caseDetails?.Defendant_ContractType
      }),
      jobLocation: nullifyIfEmpty({
        value: caseDetails?.Defendant_JobLocation_Code,
        label: caseDetails?.Defendant_JobLocation
      }),
      jobCity: nullifyIfEmpty({
        value: caseDetails?.DefendantJobCity_Code,
        label: caseDetails?.DefendantJobCity
      }),
      laborOffice: nullifyIfEmpty({
        value: caseDetails?.OfficeName_Code,
        label: caseDetails?.OfficeName
      }),
      stillWorking: {
        value: caseDetails?.Defendant_StillWorking_Code,
        label: caseDetails?.Defendant_StillWorking
      },
      contractStart: {
        hijri: caseDetails?.Defendant_ContractStartDateHijri,
        gregorian: caseDetails?.Defendant_ContractStartDate
      },
      contractEnd: {
        hijri: caseDetails?.Defendant_ContractEndDateHijri,
        gregorian: caseDetails?.Defendant_ContractEndDate
      },
      jobStart: {
        hijri: caseDetails?.Defendant_JobStartDateHijri,
        gregorian: caseDetails?.Defendant_JobStartDate
      },
      jobEnd: {
        hijri: caseDetails?.Defendant_JobEndDateHijri,
        gregorian: caseDetails?.Defendant_JobEndDate
      },
    }
    if (plaintiff_type_code?.toLowerCase() === "worker") {
      return plainteffWorkDetails
    }
    return defendentWorkDetails
  }




  return { isFeatched, workData }
};

export default useWorkDetailsPrefill;
