import { useState } from "react";
import {
  useSaveClaimantDetailsMutation,
  useSaveDefendantDetailsMutation,
  useSaveWorkDetailsMutation,
  useSaveHearingTopicsMutation,
  useSubmitReviewMutation,
  useSubmitFinalReviewMutation,
} from "../api/create-case/apis";
import { useCookieState } from "./useCookieState";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useApiErrorHandler } from "@/shared/hooks/useApiErrorHandler";
import { emabsyClaimantPayload } from "../api/create-case/payloads";

export const useCaseApiService = () => {
  const [saveClaimantDetails] = useSaveClaimantDetailsMutation();
  const [saveDefendantDetails] = useSaveDefendantDetailsMutation();
  const [saveWorkDetails] = useSaveWorkDetailsMutation();
  const [saveHearingTopics] = useSaveHearingTopicsMutation();
  const [submitReview] = useSubmitReviewMutation();
  const [submitFinalReview] = useSubmitFinalReviewMutation();
  const [getCookie, setCookie, removeCookie] = useCookieState({ caseId: "" });
  const [isCaseCreated, setIsCaseCreated] = useState(getCookie("caseId"));
  const { t } = useTranslation();
  const { handleResponse } = useApiErrorHandler();

  const handleSaveOrSubmit = async (
    currentStep: number,
    currentTab: number,
    payload?: any,
    formData?: any,
    userClaims?: any,
    userType?: string,
    lang?: string
  ) => {
    try {
      let response;

      if (currentStep === 0) {
        switch (currentTab) {
          case 0:
            // Handle embassy user logic here
            let finalPayload = payload;
            
            if (userType?.toLowerCase().includes("embassy user") && formData) {
              // For embassy users, use the dedicated embassy payload function
              finalPayload = emabsyClaimantPayload(
                "Next",
                formData,
                getCookie("caseId") || "",
                userClaims,
                lang || "EN",
                userType,
                null // nicDetailObj will be handled by the payload function
              );
            }
            
            let payloadPoint = isCaseCreated ? {
              ...finalPayload,
              "CaseID": isCaseCreated
            } : { ...finalPayload };

            response = await saveClaimantDetails({
              data: payloadPoint,
              isCaseCreated,
            }).unwrap();

            if (response?.CaseNumber) {
              setCookie("caseId", response?.CaseNumber);
            }
            break;
          case 1:
            response = await saveDefendantDetails(payload).unwrap();
            break;
          case 2:
            response = await saveWorkDetails(payload).unwrap();
            break;
          default:
            throw new Error("Invalid tab");
        }
      } else if (currentStep === 1) {
        response = await saveHearingTopics(payload).unwrap();
      } else if (currentStep === 2) {
        response = await submitReview(payload).unwrap();
      } else {
        throw new Error("Invalid step");
      }

      if (response) {
        // Use the centralized error handler (handled globally, so just return response)
        return response;
      }

      return response;
    } catch (error) {
      throw error;
    }
  };

  return { handleSaveOrSubmit };
};
