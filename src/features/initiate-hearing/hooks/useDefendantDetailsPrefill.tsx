import { useEffect, useState } from "react";
import { useLazyGetCaseDetailsQuery } from "@/features/manage-hearings/api/myCasesApis";
import { useCookieState } from "./useCookieState";

// دالة مساعدة لإرجاع null إذا كان الكائن فارغًا
function nullifyIfEmpty(obj: any) {
  if (
    obj &&
    typeof obj === "object" &&
    "label" in obj &&
    "value" in obj &&
    (obj.value === "" ||
      obj.value === null ||
      obj.value === undefined ||
      obj.value?.toString().trim() === "")
  ) {
    return null;
  }
  return obj;
}

const useDefendantDetailsPrefill = (
  setValue: (field: string, value: any) => void
) => {
  const [getCookie] = useCookieState();
  const [triggerCaseDetailsQuery] = useLazyGetCaseDetailsQuery();
  const [isFeatched, setIsfetched] = useState(false);
  const [defendantData, setDefendantData] = useState<any | null>(null);

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
      FileNumber:
        userType === "Establishment" ? userClaims?.File_Number || "" : "",
      MainGovernment:
        userType === "Legal representative"
          ? getCookie("mainCategory")?.value || ""
          : "",
      SubGovernment:
        userType === "Legal representative"
          ? getCookie("subCategory")?.value || ""
          : "",
    };

    triggerCaseDetailsQuery(payload).then((result) => {
      const details = result?.data?.CaseDetails;
      setIsfetched(true);
      if (!details) return;
      localStorage.setItem("DefendantDetails", JSON.stringify(details));
      setDefendantData(EXtractDefendantDetailsData(details));
    });
  }, []);

  const EXtractDefendantDetailsData = (caseDetails: any) => {
    console.log("Get Case Datails ", caseDetails);

    return {
      defendantStatus: caseDetails?.DefendantType,
      defendantDetails:
        caseDetails?.DefendantType_Code === "Government" ? "Government" : "Others",
      nationalIdNumber: caseDetails?.DefendantId,
      def_date_hijri: caseDetails?.DefendantHijiriDOB,
      DefendantsEstablishmentPrisonerName: caseDetails?.DefendantName,
      mobileNumber: caseDetails?.Defendant_PhoneNumber,
      defendantRegion: nullifyIfEmpty({
        value: caseDetails?.Defendant_Region_Code,
        label: caseDetails?.Defendant_Region,
      }),
      defendantCity: nullifyIfEmpty({
        value: caseDetails?.Defendant_City_Code,
        label: caseDetails?.Defendant_City,
      }),
      occupation: nullifyIfEmpty({
        value: caseDetails?.Defendant_Occupation_Code,
        label: caseDetails?.Defendant_Occupation,
      }),
      gender: nullifyIfEmpty({
        value: caseDetails?.Defendant_Gender_Code,
        label: caseDetails?.Defendant_Gender,
      }),
      nationality: nullifyIfEmpty({
        value: caseDetails?.Defendant_Nationality_Code,
        label: caseDetails?.Defendant_Nationality,
      }),
      DefendantFileNumber: caseDetails?.DefendantEstFileNumber,
      Defendant_Establishment_data_NON_SELECTED: {
        EstablishmentName:
          caseDetails?.EstablishmentFullName || caseDetails?.DefendantName || "",
        FileNumber: caseDetails?.DefendantEstFileNumber || "",
        CRNumber: caseDetails?.Defendant_CRNumber || "",
        Number700: caseDetails?.Defendant_Number700 || "",
        Region: caseDetails?.Defendant_Region || "",
        Region_Code: caseDetails?.Defendant_Region_Code || "",
        City: caseDetails?.Defendant_City || "",
        City_Code: caseDetails?.Defendant_City_Code || "",
      },
      main_category_of_the_government_entity: nullifyIfEmpty({
        value: caseDetails?.Defendant_MainGovtDefend_Code,
        label: caseDetails?.Defendant_MainGovtDefend,
      }),
      subcategory_of_the_government_entity: nullifyIfEmpty({
        value: caseDetails?.DefendantSubGovtDefend_Code,
        label: caseDetails?.DefendantSubGovtDefend,
      }),
      // Additional fields for establishment data
      establishment_phoneNumber: caseDetails?.Defendant_PhoneNumber,
      Defendant_CRNumber: caseDetails?.Defendant_CRNumber,
      Defendant_Number700: caseDetails?.Defendant_Number700,
      // Date fields
      def_date_gregorian: caseDetails?.Defendant_ApplicantBirthDate,

      // for plaintiff deatils 
      PlaintiffId :  caseDetails?.PlaintiffId
    };
  };

  return { isFeatched, defendantData };
};

export default useDefendantDetailsPrefill;
