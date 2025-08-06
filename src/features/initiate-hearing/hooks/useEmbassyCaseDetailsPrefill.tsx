import { useEffect, useState } from "react";
import { useLazyGetCaseDetailsQuery } from "@/features/manage-hearings/api/myCasesApis";
import { useCookieState } from "./useCookieState";

const useEmbassyCaseDetailsPrefill = (setValue: (field: string, value: any) => void, trigger?: (name?: string | string[]) => Promise<boolean>) => {
  const [getCookie] = useCookieState();
  const [triggerCaseDetailsQuery, { isLoading }] = useLazyGetCaseDetailsQuery();
  const [isFetched, setIsFetched] = useState<boolean>(false);

  useEffect(() => {
    const caseId = getCookie("caseId");
    const userClaims = getCookie("userClaims");
    const userType = getCookie("userType");
    const lang = userClaims?.AcceptedLanguage?.toUpperCase() || "EN";

    if (!caseId || !userType || !userType.toLowerCase().includes("embassy user")) return;

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
      setIsFetched(true);
      if (!details) return;
      
      localStorage.setItem("EmbassyCaseDetails", JSON.stringify(details));
      
      // Set form state based on PlaintiffType for embassy users
      if (details.PlaintiffType === "Self(Worker)") {
        setValue("claimantStatus", "principal");
        setValue("applicantType", "principal");
        setValue("showOnlyPrincipal", true);
      } else if (details.PlaintiffType === "Agent") {
        setValue("claimantStatus", "representative");
        setValue("applicantType", "representative");
        setValue("showOnlyRepresentative", true);
      }

      // Pre-fill embassy principal fields with proper structure for dropdowns
      if (details.PlaintiffId !== undefined && details.PlaintiffId !== null && details.PlaintiffId !== "") {
        setValue("embassyPrincipal_idNumber", details.PlaintiffId);
      }
      
      if (details.PlaintiffHijiriDOB !== undefined && details.PlaintiffHijiriDOB !== null && details.PlaintiffHijiriDOB !== "") {
        setValue("embassyPrincipal_hijriDate", details.PlaintiffHijiriDOB);
      }
      
      if (details.PlaintiffName !== undefined && details.PlaintiffName !== null && details.PlaintiffName !== "") {
        setValue("embassyPrincipal_userName", details.PlaintiffName);
      }
      
      if (details.Plaintiff_PhoneNumber !== undefined && details.Plaintiff_PhoneNumber !== null && details.Plaintiff_PhoneNumber !== "") {
        setValue("embassyPrincipal_phoneNumber", details.Plaintiff_PhoneNumber);
      }
      
      if (details.Plaintiff_ApplicantBirthDate !== undefined && details.Plaintiff_ApplicantBirthDate !== null && details.Plaintiff_ApplicantBirthDate !== "") {
        setValue("embassyPrincipal_gregorianDate", details.Plaintiff_ApplicantBirthDate);
      }

      // Map dropdown fields with value/label pairs for embassy principal
      if (
        (details.Plaintiff_Region_Code !== undefined && details.Plaintiff_Region_Code !== null && details.Plaintiff_Region_Code !== "") ||
        (details.Plaintiff_Region !== undefined && details.Plaintiff_Region !== null && details.Plaintiff_Region !== "")
      ) {
        setValue("embassyPrincipal_region", {
          value: details.Plaintiff_Region_Code || "",
          label: details.Plaintiff_Region || "",
        });
      }
      
      if (
        (details.Plaintiff_City_Code !== undefined && details.Plaintiff_City_Code !== null && details.Plaintiff_City_Code !== "") ||
        (details.Plaintiff_City !== undefined && details.Plaintiff_City !== null && details.Plaintiff_City !== "")
      ) {
        setValue("embassyPrincipal_city", {
          value: details.Plaintiff_City_Code || "",
          label: details.Plaintiff_City || "",
        });
      }
      
      if (
        (details.Plaintiff_Occupation_Code !== undefined && details.Plaintiff_Occupation_Code !== null && details.Plaintiff_Occupation_Code !== "") ||
        (details.Plaintiff_Occupation !== undefined && details.Plaintiff_Occupation !== null && details.Plaintiff_Occupation !== "")
      ) {
        setValue("embassyPrincipal_occupation", {
          value: details.Plaintiff_Occupation_Code || "",
          label: details.Plaintiff_Occupation || "",
        });
      }
      
      if (
        (details.Plaintiff_Gender_Code !== undefined && details.Plaintiff_Gender_Code !== null && details.Plaintiff_Gender_Code !== "") ||
        (details.Plaintiff_Gender !== undefined && details.Plaintiff_Gender !== null && details.Plaintiff_Gender !== "")
      ) {
        setValue("embassyPrincipal_gender", {
          value: details.Plaintiff_Gender_Code || "",
          label: details.Plaintiff_Gender || "",
        });
      }
      
      if (
        (details.Plaintiff_Nationality_Code !== undefined && details.Plaintiff_Nationality_Code !== null && details.Plaintiff_Nationality_Code !== "") ||
        (details.Plaintiff_Nationality !== undefined && details.Plaintiff_Nationality !== null && details.Plaintiff_Nationality !== "")
      ) {
        setValue("embassyPrincipal_nationality", {
          value: details.Plaintiff_Nationality_Code || "",
          label: details.Plaintiff_Nationality || "",
        });
      }

      // Map embassy agent fields if applicable
      if (details.PlaintiffType === "Agent") {
        // Agent-specific fields for embassy users
        setValue("embassyAgent_agentType", details.CertifiedBy === "CB1" ? "local_agency" : "external_agency");
        setValue("embassyAgent_agencyNumber", details.Agent_MandateNumber || "");
        setValue("embassyAgent_mobileNumber", details.Plaintiff_MobileNumber || "");
        setValue("embassyAgent_agentName", details.PlaintiffName || "");
        setValue("embassyAgent_agencyStatus", details.Agent_MandateStatus || "");
        setValue("embassyAgent_agencySource", details.Agent_MandateSource || "");
        setValue("embassyAgent_Agent_ResidencyAddress", details.Agent_ResidencyAddress || "");
        setValue("embassyAgent_Agent_CurrentPlaceOfWork", details.Agent_CurrentPlaceOfWork || "");
        
        // Agent dropdown fields
        if (
          (details.Plaintiff_Region_Code !== undefined && details.Plaintiff_Region_Code !== null && details.Plaintiff_Region_Code !== "") ||
          (details.Plaintiff_Region !== undefined && details.Plaintiff_Region !== null && details.Plaintiff_Region !== "")
        ) {
          setValue("embassyAgent_region", {
            value: details.Plaintiff_Region_Code || "",
            label: details.Plaintiff_Region || "",
          });
        }
        
        if (
          (details.Plaintiff_City_Code !== undefined && details.Plaintiff_City_Code !== null && details.Plaintiff_City_Code !== "") ||
          (details.Plaintiff_City !== undefined && details.Plaintiff_City !== null && details.Plaintiff_City !== "")
        ) {
          setValue("embassyAgent_city", {
            value: details.Plaintiff_City_Code || "",
            label: details.Plaintiff_City || "",
          });
        }
        
        if (
          (details.Plaintiff_Occupation_Code !== undefined && details.Plaintiff_Occupation_Code !== null && details.Plaintiff_Occupation_Code !== "") ||
          (details.Plaintiff_Occupation !== undefined && details.Plaintiff_Occupation !== null && details.Plaintiff_Occupation !== "")
        ) {
          setValue("embassyAgent_occupation", {
            value: details.Plaintiff_Occupation_Code || "",
            label: details.Plaintiff_Occupation || "",
          });
        }
        
        if (
          (details.Plaintiff_Gender_Code !== undefined && details.Plaintiff_Gender_Code !== null && details.Plaintiff_Gender_Code !== "") ||
          (details.Plaintiff_Gender !== undefined && details.Plaintiff_Gender !== null && details.Plaintiff_Gender !== "")
        ) {
          setValue("embassyAgent_gender", {
            value: details.Plaintiff_Gender_Code || "",
            label: details.Plaintiff_Gender || "",
          });
        }
        
        if (
          (details.Plaintiff_Nationality_Code !== undefined && details.Plaintiff_Nationality_Code !== null && details.Plaintiff_Nationality_Code !== "") ||
          (details.Plaintiff_Nationality !== undefined && details.Plaintiff_Nationality !== null && details.Plaintiff_Nationality !== "")
        ) {
          setValue("embassyAgent_nationality", {
            value: details.Plaintiff_Nationality_Code || "",
            label: details.Plaintiff_Nationality || "",
          });
        }
      }

      // Trigger validation after setting all values
      if (trigger) {
        trigger();
      }
    });
  }, []);

  return { isFetched, isLoading };
};

export default useEmbassyCaseDetailsPrefill; 