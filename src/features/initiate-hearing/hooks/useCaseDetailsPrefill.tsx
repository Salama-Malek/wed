import { useEffect, useState } from "react";
import { useLazyGetCaseDetailsQuery } from "@/features/manage-hearings/api/myCasesApis";
import { useCookieState } from "./useCookieState";
import { formatDateString, formatHijriDate } from "@/shared/lib/helpers";
import { json } from "stream/consumers";

const useCaseDetailsPrefill = (setValue: (field: string, value: any) => void, trigger?: (name?: string | string[]) => Promise<boolean>) => {
  const [getCookie, setCookie] = useCookieState();
  const [triggerCaseDetailsQuery, { isLoading }] = useLazyGetCaseDetailsQuery();
  const [isFeatched, setIsfetched] = useState<boolean>(false);
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
      // Set form state based on PlaintiffType
      if (userType === "Worker" && details.PlaintiffType === "Self(Worker)") {
        setValue("claimantStatus", "principal");
        setValue("applicantType", "principal");
        setValue("showOnlyPrincipal", true);
      } else if (
        (userType === "Worker" || userType === "Embassy User") &&
        details.PlaintiffType === "Agent"
      ) {
        setValue("claimantStatus", "representative");
        setValue("applicantType", "representative");
        setValue("showOnlyRepresentative", true);
      }

      // Pre-fill core fields only if value exists and is not null or empty
      if (details.PlaintiffId !== undefined && details.PlaintiffId !== null && details.PlaintiffId !== "") {
        setValue("idNumber", details.PlaintiffId);
      }
      if (details.PlaintiffHijiriDOB !== undefined && details.PlaintiffHijiriDOB !== null && details.PlaintiffHijiriDOB !== "") {
        setValue("hijriDate", details.PlaintiffHijiriDOB);
      }
      if (details.PlaintiffName !== undefined && details.PlaintiffName !== null && details.PlaintiffName !== "") {
        setValue("userName", details.PlaintiffName);
      }
      if (details.Plaintiff_PhoneNumber !== undefined && details.Plaintiff_PhoneNumber !== null && details.Plaintiff_PhoneNumber !== "") {
        setValue("phoneNumber", details.Plaintiff_PhoneNumber);
      }
      if (details.Plaintiff_ApplicantBirthDate !== undefined && details.Plaintiff_ApplicantBirthDate !== null && details.Plaintiff_ApplicantBirthDate !== "") {
        setValue("gregorianDate", details.Plaintiff_ApplicantBirthDate);
      }
      if (details.Plaintiff_FirstLanguage !== undefined && details.Plaintiff_FirstLanguage !== null && details.Plaintiff_FirstLanguage !== "") {
        setValue("firstLanguage", details.Plaintiff_FirstLanguage);
      }

      // Map select fields with value/label pairs only if value exists and is not null or empty
      if (
        (details.Plaintiff_Region_Code !== undefined && details.Plaintiff_Region_Code !== null && details.Plaintiff_Region_Code !== "") ||
        (details.Plaintiff_Region !== undefined && details.Plaintiff_Region !== null && details.Plaintiff_Region !== "")
      ) {
        setValue("plaintiffRegion", {
          value: details.Plaintiff_Region_Code || "",
          label: details.Plaintiff_Region || "",
        });
      }
      if (
        (details.Plaintiff_City_Code !== undefined && details.Plaintiff_City_Code !== null && details.Plaintiff_City_Code !== "") ||
        (details.Plaintiff_City !== undefined && details.Plaintiff_City !== null && details.Plaintiff_City !== "")
      ) {
        setValue("plaintiffCity", {
          value: details.Plaintiff_City_Code || "",
          label: details.Plaintiff_City || "",
        });
      }
      if (
        (details.Plaintiff_Occupation_Code !== undefined && details.Plaintiff_Occupation_Code !== null && details.Plaintiff_Occupation_Code !== "") ||
        (details.Plaintiff_Occupation !== undefined && details.Plaintiff_Occupation !== null && details.Plaintiff_Occupation !== "")
      ) {
        setValue("occupation", {
          value: details.Plaintiff_Occupation_Code || "",
          label: details.Plaintiff_Occupation || "",
        });
      }
      if (
        (details.Plaintiff_Gender_Code !== undefined && details.Plaintiff_Gender_Code !== null && details.Plaintiff_Gender_Code !== "") ||
        (details.Plaintiff_Gender !== undefined && details.Plaintiff_Gender !== null && details.Plaintiff_Gender !== "")
      ) {
        setValue("gender", {
          value: details.Plaintiff_Gender_Code || "",
          label: details.Plaintiff_Gender || "",
        });
      }
      if (
        (details.Plaintiff_Nationality_Code !== undefined && details.Plaintiff_Nationality_Code !== null && details.Plaintiff_Nationality_Code !== "") ||
        (details.Plaintiff_Nationality !== undefined && details.Plaintiff_Nationality !== null && details.Plaintiff_Nationality !== "")
      ) {
        setValue("nationality", {
          value: details.Plaintiff_Nationality_Code || "",
          label: details.Plaintiff_Nationality || "",
        });
      }

      // Map agent-specific fields if applicable
      if (details.PlaintiffType === "Agent") {
        setValue("agentType", details.CertifiedBy === "CB1" ? "local_agency" : "external_agency");
        setValue("agencyNumber", details.Agent_MandateNumber || "");
        setValue("mobileNumber", details.Plaintiff_MobileNumber || "");
        setValue("agentName", details.PlaintiffName || "");
        setValue("agencyStatus", details.Agent_MandateStatus || "");
        setValue("agencySource", details.Agent_MandateSource || "");
        setValue("Agent_ResidencyAddress", details.Agent_ResidencyAddress || "");
        setValue("Agent_CurrentPlaceOfWork", details.Agent_CurrentPlaceOfWork || "");
      }


      // Trigger validation after setting all values
      if (trigger) {
        trigger();
      }
    });
  }, []);

  return isFeatched
};

export default useCaseDetailsPrefill;
