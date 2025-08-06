import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCookieState } from "./useCookieState";
import { useLazyGetCaseDetailsQuery, GetCaseDetailsRequest } from "@/features/manage-hearings/api/myCasesApis"; 

export const useIncompleteCaseHandler = (setValue: (field: string, value: any) => void, trigger?: (name?: string | string[]) => Promise<boolean>) => {
  const [getCookie, setCookie] = useCookieState();
  const navigate = useNavigate();
  const [triggerCaseDetailsQuery] = useLazyGetCaseDetailsQuery();

  useEffect(() => {
    const incompleteCase = getCookie("incompleteCase"); // contains: { PlaintiffType, CaseNumber, UserType }
    const userClaims = getCookie("userClaims");
    const userType = incompleteCase?.UserType;
    const caseId = incompleteCase?.CaseNumber;
    const plaintiffType = incompleteCase?.PlaintiffType;
    const lang = userClaims?.AcceptedLanguage?.toUpperCase() || "EN";

    if (!incompleteCase || !caseId || !userType || !plaintiffType) return;

    // Always keep caseId stored for API use
    setCookie("caseId", caseId);

    // Construct API payload based on user type
    const basePayload: GetCaseDetailsRequest = {
      CaseID: caseId,
      UserType: userType,
      IDNumber: userClaims?.UserID || "",
      AcceptedLanguage: lang,
      SourceSystem: "E-Services",
      FileNumber: userType === "Establishment" ? userClaims?.File_Number || "" : "",
      MainGovernment: userType === "Legal representative" ? getCookie("mainCategory")?.value || "" : "",
      SubGovernment: userType === "Legal representative" ? getCookie("subCategory")?.value || "" : ""
    };

    triggerCaseDetailsQuery(basePayload).then((result) => {
      const details = result?.data?.CaseDetails;
      if (!details) return;

      navigate("/initiate-hearing/case-creation");

      // Set form state based on PlaintiffType
      if (userType === "Worker" && plaintiffType === "Self(Worker)") {
        setValue("claimantStatus", "principal");
        setValue("applicantType", "principal");
        setValue("showOnlyPrincipal", true);
      } else if (
        (userType === "Worker" || userType === "Embassy User") &&
        plaintiffType === "Agent"
      ) {
        setValue("claimantStatus", "representative");
        setValue("applicantType", "representative");
        setValue("showOnlyRepresentative", true);
      }

      // Pre-fill core fields
      setValue("idNumber", details.PlaintiffId || "");
      setValue("hijriDate", details.PlaintiffHijiriDOB || "");
      setValue("userName", details.PlaintiffName || "");
      setValue("phoneNumber", details.Plaintiff_PhoneNumber || "");
      setValue("gregorianDate", details.Plaintiff_ApplicantBirthDate || "");
      setValue("firstLanguage", details.Plaintiff_FirstLanguage || "");
      
      // Map select fields with value/label pairs
      setValue("plaintiffRegion", {
        value: details.Plaintiff_Region_Code || "",
        label: details.Plaintiff_Region || "",
      });
      setValue("plaintiffCity", {
        value: details.Plaintiff_City_Code || "",
        label: details.Plaintiff_City || "",
      });
      setValue("occupation", {
        value: details.Plaintiff_Occupation_Code || "",
        label: details.Plaintiff_Occupation || "",
      });
      setValue("gender", {
        value: details.Plaintiff_Gender_Code || "",
        label: details.Plaintiff_Gender || "",
      });
      setValue("nationality", {
        value: details.Plaintiff_Nationality_Code || "",
        label: details.Plaintiff_Nationality || "",
      });

      // Map agent-specific fields if applicable
      if (plaintiffType === "Agent") {
        setValue("agentType", details.CertifiedBy === "CB1" ? "local_agency" : "external_agency");
        setValue("agencyNumber", details.Agent_MandateNumber || "");
        setValue("mobileNumber", details.Plaintiff_MobileNumber || "");
        setValue("agentName", details.PlaintiffName || "");
        setValue("agencyStatus", details.Agent_MandateStatus || "");
        setValue("agencySource", details.Agent_MandateSource || "");
        setValue("Agent_ResidencyAddress", details.Agent_ResidencyAddress || "");
        setValue("Agent_CurrentPlaceOfWork", details.Agent_CurrentPlaceOfWork || "");
      }

      // Map work-related fields
      setValue("contractNumber", details.Plaintiff_ContractNumber || "");
      setValue("contractStartDate", details.Plaintiff_ContractStartDate || "");
      setValue("contractEndDate", details.Plaintiff_ContractEndDate || "");
      setValue("contractType", {
        value: details.Plaintiff_ContractType_Code || "",
        label: details.Plaintiff_ContractType || "",
      });
      setValue("salary", details.Plaintiff_Salary || "");
      setValue("salaryType", {
        value: details.Plaintiff_SalaryType_Code || "",
        label: details.Plaintiff_SalaryType || "",
      });
      setValue("jobStartDate", details.Plaintiff_JobStartDate || "");
      setValue("jobEndDate", details.Plaintiff_JobEndDate || "");
      setValue("stillWorking", details.Plaintiff_StillWorking || "");

      // Trigger validation after setting all values
      if (trigger) {
        trigger();
      }
    });
  }, []);
};
