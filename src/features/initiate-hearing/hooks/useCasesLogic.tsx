import { useCallback, useMemo, useState, useEffect } from "react";
import { useNavigationService } from "@/shared/hooks/useNavigationService";
import { useCaseApiService } from "./useCaseApiService";
import { usePayloadService } from "./payloadService";
import { Step } from "@/shared/modules/case-creation/Stepper/stepper.types";
import { useTranslation } from "react-i18next";
import { useAPIFormsData } from "@/providers/FormContext";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useGetEstablishmentDetailsQuery } from "../api/create-case/defendantDetailsApis";
import { useCookieState } from "./useCookieState";
import { steps } from "@/shared/modules/case-creation/components/tabs/tabsConfig";
import { TokenClaims } from "@/features/login/components/AuthProvider";
import { useSearchParams } from "react-router-dom";
import { useApiErrorHandler } from "@/shared/hooks/useApiErrorHandler";
import { useGetNICDetailsQuery } from "@/features/initiate-hearing/api/create-case/plaintiffDetailsApis";
import { formatDateToYYYYMMDD, isHijriDateInFuture } from "@/shared/lib/helpers";
 
const tabs: string[] = [
  "1.Plaintiff's Details",
  "2.Defendant's Details",
  "3.Work Details",
];
 
export const useCasesLogic = () => {
  // const {
  //   data: EstablishmentData,
  //   error,
  //   isLoading,
  // } = useGetEstablishmentDetailsQuery({
  //   FileNumber: "1-204757",
  //   AcceptedLanguage: "EN",
  //   SourceSystem: "E-Services",
  // });
 
  const {
    formData: formState,
    getValues,
    setFormData,
    editTopic,
    watch,
    formState: { errors, isValid, isSubmitting: isFormSubmitting },
  } = useAPIFormsData();
  const defendantStatus = watch("defendantStatus");
  const defendantDetails = watch("defendantDetails");
  const { caseTopics } = useSelector((state: RootState) => state.form.formData);
  const isDomestic = useSelector(
    (state: RootState) => state.formOptions.titles
  );
  const { t, i18n } = useTranslation("stepper");
  const [actionButtonName, setActionButtonName] = useState<string>("");
  const [lastSaved, setLastSaved] = useState(false);
  const { clearFormData } = useAPIFormsData();
  const { updateParams, currentStep, currentTab } = useNavigationService();
  const { handleSaveOrSubmit } = useCaseApiService();
  const [getCookie] = useCookieState({ caseId: "" });
  const getCaseId = getCookie("caseId");
  const attorneyData = getCookie("attorneyData");
  const userType = getCookie("userType");
  const getNicDetailObject = getCookie("nicDetailObject");
  const storeAllNicData = getCookie("storeAllNicData");
  const extractEstablishmentObject = getCookie("defendantDetails");
  const GetCookieEstablishmentData = getCookie("defendantDetails");
 
  const [localStep, setLocalStep] = useState(currentStep);
  const [localTab, setLocalTab] = useState(currentTab);
 
  useEffect(() => {
    const savedStep = localStorage.getItem("step");
    const savedTab = localStorage.getItem("tab");
 
    if (savedStep) {
      const newStep = parseInt(savedStep);
      setLocalStep(newStep);
    }
    if (savedTab) {
      const newTab = parseInt(savedTab);
      setLocalTab(newTab);
    }
  }, [currentStep, currentTab]);
 
  /*Get User Data From Cookies  */
  const isRTL = i18n.language === "ar" ? "AR" : "EN";
  const userClaims: TokenClaims = getCookie("userClaims");
 
  const { getPayload } = usePayloadService({
    isDomestic,
    // EstablishmentData,
    userType,
    GetCookieEstablishmentData,
    getNicDetailObject,
    defendantStatus,
    defendantDetails,
  });
 
  const principalId = userClaims?.UserID || "";
  const principalDob = formatDateToYYYYMMDD(userClaims?.UserDOB);
  const representativeId = watch("workerAgentIdNumber") as string;
  const representativeDob = formatDateToYYYYMMDD(watch("workerAgentDateOfBirthHijri"));
  const claimantStatus = watch("claimantStatus") as "principal" | "representative";
  const lang = i18n.language.toUpperCase();
 
  // Add hooks to get both NIC responses
  const { data: principalNICResponse } = useGetNICDetailsQuery(
    {
      IDNumber: principalId,
      DateOfBirth: principalDob || "",
      AcceptedLanguage: lang,
      SourceSystem: "E-Services",
    },
    {
              skip:
          claimantStatus !== "principal" ||
          !principalId ||
          principalId.length !== 10 ||
          !principalDob ||
          isHijriDateInFuture(principalDob) ||
          userType === "Legal representative",
    }
  );
  const { data: representativeNICResponse } = useGetNICDetailsQuery(
    {
      IDNumber: representativeId,
      DateOfBirth: representativeDob || "",
      AcceptedLanguage: lang,
      SourceSystem: "E-Services",
    },
    {
              skip:
          claimantStatus !== "representative" ||
          !representativeId ||
          representativeId.length !== 10 ||
          !representativeDob ||
          representativeDob.length !== 8 ||
          isHijriDateInFuture(representativeDob) ||
          userType === "Legal representative",
    }
  );
 
  const currentLanguage = i18n.language.toUpperCase();
  const { hasErrors } = useApiErrorHandler();
 
  const handleNext = async () => {
    if (!isValid) {
      return;
    }
    const latestFormValues = getValues();
    setFormData(latestFormValues);
    setActionButtonName("Next");

    // Determine claimantStatus from form values
    const claimantStatus = latestFormValues.claimantStatus;
    let nicDetails = undefined;
    if (claimantStatus === "representative") {
      nicDetails = representativeNICResponse?.NICDetails;
    } else {
      nicDetails = principalNICResponse?.NICDetails;
    }
    const payload: any = getPayload(
      localStep,
      localTab,
      "Next",
      latestFormValues,
      userClaims,
      userType,
      isRTL,
      getCaseId,
      attorneyData,
      nicDetails // pass as extra arg
    );

    if (latestFormValues && payload && Object.keys(payload).length > 0) {
      try {
        // Pass additional parameters for embassy logic
        const apiResponse = await handleSaveOrSubmit(
          localStep, 
          localTab, 
          payload,
          latestFormValues, // formData
          userClaims,       // userClaims
          userType,         // userType
          isRTL            // lang
        );

        let nextStep = localStep;
        let nextTab = localTab;

        if (localStep === 0) {
          if (localTab < 2) {
            nextTab = localTab + 1;
          } else {
            nextStep = 1;
            nextTab = 0;
          }
        } else if (localStep === 1) {
          nextStep = 2;
          nextTab = 0;
        }

        // Use centralized error handling to check if response is successful
        const isSuccessful = !hasErrors(apiResponse) && (apiResponse?.SuccessCode === "200" || apiResponse?.ServiceStatus === "Success");

        if (isSuccessful) {
          localStorage.setItem("step", nextStep.toString());
          localStorage.setItem("tab", nextTab.toString());

          setLocalStep(nextStep);
          setLocalTab(nextTab);

          updateParams(nextStep, nextTab);

          setActionButtonName("");
          setLastSaved(false);

          window.dispatchEvent(new Event("storage"));
        } else {
          // Clear actionButtonName on API error to allow retry
          setActionButtonName("");
        }
      } catch (error) {
        setActionButtonName("");
        // Error handling
      }
    }
  };
 
  const handleSave = async () => {
    const latestFormValues = getValues();
    setFormData(latestFormValues);
    setActionButtonName("Save");
    try {
      // Determine claimantStatus from form values
      const claimantStatus = latestFormValues.claimantStatus;
      let nicDetails = undefined;
      if (claimantStatus === "representative") {
        nicDetails = representativeNICResponse?.NICDetails;
      } else {
        nicDetails = principalNICResponse?.NICDetails;
      }
      const payload = getPayload(
        localStep,
        localTab,
        "Save",
        latestFormValues,
        userClaims,
        userType,
        isRTL,
        getCaseId,
        attorneyData,
        nicDetails // pass as extra arg
      );
 
      if (payload && Object.keys(payload).length > 0) {
        // Pass additional parameters for embassy logic (same as handleNext)
        const response = await handleSaveOrSubmit(
          localStep, 
          localTab, 
          payload,
          latestFormValues, // formData
          userClaims,       // userClaims
          userType,         // userType
          isRTL            // lang
        );
        
        // Check if the response indicates success or error
        const isSuccessful = !hasErrors(response) && (response?.SuccessCode === "200" || response?.ServiceStatus === "Success");
        
        if (isSuccessful) {
          setLastSaved(true);
          setActionButtonName("");
        } else {
          // Clear actionButtonName on API error to allow retry
          setActionButtonName("");
        }
        
        return response;
      } else {
        // Return a default error response when no payload is available
        return {
          ServiceStatus: "Error",
          SuccessCode: "400",
          CaseNumber: "",
          ErrorCodeList: [{
            ErrorCode: "NO_PAYLOAD",
            ErrorDesc: "No payload available for save operation"
          }]
        };
      }
    } catch (error) {
      setActionButtonName("");
      throw error;
    }
  };
 
  const handlePrevious = useCallback(() => {
    let prevStep = localStep;
    let prevTab = localTab;
 
    if (localStep === 1) {
      prevStep = 0;
      prevTab = 2;
    } else if (localStep === 0) {
      prevTab = Math.max(localTab - 1, 0);
    } else if (localStep === 2) {
      prevStep = 1;
      prevTab = 0;
    }
 
 
    updateParams(prevStep, prevTab);
    setLocalStep(prevStep);
    setLocalTab(prevTab);
  }, [localStep, localTab, updateParams]);
 
  const getCases = async (queryParams: Record<string, string> = {}) => {
    try {
      const params = new URLSearchParams({
        ...queryParams,
        AcceptedLanguage: currentLanguage,
        SourceSystem: "E-Services",
      });
      const response = await fetch(
        `WeddiServices/V1/Cases?${params.toString()}`
      );
 
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
 
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  };
 
  return {
    currentStep: localStep,
    currentTab: localTab,
    tabs,
    updateParams,
    handleNext,
    handlePrevious,
    handleSave,
    lastSaved,
    actionButtonName,
  };
};
 
export default useCasesLogic;