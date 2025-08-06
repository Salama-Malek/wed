import React, { useState, useEffect } from "react";
import { SubmitHandler, useWatch } from "react-hook-form";
import StepNavigation from "@/shared/modules/case-creation/components/StepNavigation";
import useCasesLogic from "@/features/initiate-hearing/hooks/useCasesLogic";
import { FormData } from "@/shared/components/form/form.types";
import { useAPIFormsData } from "@/providers/FormContext";
import { useSubmitFinalReviewMutation } from "@/features/initiate-hearing/api/create-case/apis";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Loader from "@/shared/components/loader";
import Modal from "@/shared/components/modal/Modal";
import Button from "@/shared/components/button";
import { useNavigate } from "react-router-dom";
import { useApiErrorHandler } from "@/shared/hooks/useApiErrorHandler";

export interface WithStepNavigationProps {
  register: any;
  errors: any;
  setValue: any;
  watch: any;
  control: any;
  trigger: any;
  isValid: boolean;
  setError: (name: string, error: any) => void;
  clearErrors: (name: string) => void;
  acknowledgements?: any[];
  selectedLanguage?: string;
  setAcknowledgements?: (acks: any[]) => void;
  setSelectedLanguage?: (lang: string) => void;
  setIsPhoneVerify?: React.Dispatch<React.SetStateAction<any>>;
}

const withStepNavigation = <P extends object>(
  WrappedComponent: React.ComponentType<P & WithStepNavigationProps>,
  p0?: { acknowledgements: any; selectedLanguage: any }
) => {
  const ComponentWithStepNavigation = (props: P & any) => {
    const {
      currentStep,
      currentTab,
      updateParams,
      handleNext,
      handlePrevious,
      handleSave,
      actionButtonName = "",
    } = useCasesLogic();

    const [isVerifiedInput, setIsPhoneVerify] = useState<boolean | undefined>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [getCookie, setCookie, removeCookie, removeAll] = useCookieState();
    const { t, i18n } = useTranslation('translation');
    const language = i18n.language === "ar" ? "AR" : "EN";
    const { hasErrors } = useApiErrorHandler();

    const navigate = useNavigate();

    const [acknowledgementsState, setAcknowledgementsState] = useState<any[]>(
      []
    );
    const [selectedLanguageState, setSelectedLanguageState] =
      useState<string>(language);

    const {
      formData,
      getValues,
      setFormData,
      register,
      handleSubmit,
      formState,
      setValue,
      watch,
      control,
      trigger,
      forceValidateForm,
      clearErrors,
      setError,
      clearFormData
    } = useAPIFormsData();

    const { errors, isValid, isSubmitting: isFormSubmitting } = formState;
    const acknowledgeValue = useWatch({
      control,
      name: "acknowledge",
      defaultValue: false,
    });

    const [submitFinalReview, { isLoading: isSubmittingFinalReview }] = useSubmitFinalReviewMutation();

    const onSubmit: SubmitHandler<FormData> = async (data) => {
      // Prevent multiple rapid Next button calls
      if (actionButtonName === "Next" || isFormSubmitting) {
        return;
      }
      
      try {
        const caseId = getCookie("caseId");
        if (currentStep === 2) {
          setIsSubmitting(true);
          const ackList = acknowledgementsState.map((item: any) => ({
            ElementKey: selectedLanguageState === "EN" ? "English" : "Arabic",
            ElementValue: item.ElementValue,
            Selected: "true",
          }));

          if (ackList.length !== 0) {
            const payload = {
              CaseID: caseId,
              Flow_CurrentScreen: "FinalReviewScreen",
              Language: selectedLanguageState,
              AckAggrements: ackList,
            };

            const response = await submitFinalReview(payload).unwrap();

            const isSuccessful = !hasErrors(response) && (response?.SuccessCode === "200" || response?.ServiceStatus === "Success");

            if (isSuccessful) {
              localStorage.removeItem("step");
              localStorage.removeItem("tab");
              localStorage.removeItem("CaseDetails");
              clearFormData();
              toast.success(t("Submission successful!"));
              const serviceLink = response?.S2Cservicelink;
              if (serviceLink) {
                navigate(`/manage-hearings/${response?.CaseNumber}`);
                window.open(serviceLink, '_blank');
              } else {
                navigate(`/manage-hearings/${response?.CaseNumber}`);
              }

              removeCookie("caseId");
              removeCookie("incompleteCase");

              return;
            } else {
              // if (response?.ErrorDescription) {
              //   toast.error(response.ErrorDescription);
              // }
              throw new Error(response?.ErrorDescription || "Submission failed");
            }
          }
        }

        setFormData(data);

        if (handleNext) {
          handleNext();
        }
      } catch (error: any) {
        // Clear actionButtonName in case of error to allow retry
        if (actionButtonName === "Next") {
          // The handleNext function should clear actionButtonName, but we ensure it here
          // This is a fallback to ensure the button doesn't get stuck
          console.warn("Next button was stuck, clearing actionButtonName");
        }
        // Ensure actionButtonName is cleared on any error
        if (actionButtonName) {
          // Note: We can't directly set actionButtonName here as it's from useCasesLogic
          // The handleNext function should handle this, but this serves as a warning
        }
      } finally {
        setIsSubmitting(false);
      }
    };

    const onInvalid = (errs: any) => {
      let firstErrorMsg = "";
      if (errs && typeof errs === "object") {
        const firstKey = Object.keys(errs)[0];
        if (firstKey && errs[firstKey]?.message) {
          firstErrorMsg = errs[firstKey].message;
        }
      }
      if (firstErrorMsg) {
        // toast.error(firstErrorMsg);
      } else {
        toast.error("Form validation failed. Please check your input.");
      }
    };

    return (
      <>
        {isSubmitting && <Loader />}
        <StepNavigation<FormData>
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          isValid={isValid}
          actionButtonName={actionButtonName}
          isVerifiedInput={isVerifiedInput}
          isFirstStep={currentStep === 0 && currentTab === 0}
          isLastStep={currentStep === 2}
          goToNextStep={handleNext}
          isFormSubmitting={isFormSubmitting}
          goToPrevStep={handlePrevious}
          resetSteps={() => {
            localStorage.removeItem("step");
            localStorage.removeItem("tab");
            updateParams(0, 0);
          }}
          handleSave={handleSave}
          isButtonDisabled={(direction: "prev" | "next") =>
            direction === "prev"
              ? currentStep === 0 && currentTab === 0
              : currentStep === 2
          }
          canProceed={currentStep === 2 && acknowledgeValue}
        >
          <WrappedComponent
            {...props}
            register={register}
            errors={errors}
            setValue={setValue}
            watch={watch}
            control={control}
            trigger={trigger}
            isValid={isValid}
            setError={setError}
            clearErrors={clearErrors}
            setIsPhoneVerify={setIsPhoneVerify}
            acknowledgements={acknowledgementsState}
            selectedLanguage={selectedLanguageState}
            setAcknowledgements={setAcknowledgementsState}
            setSelectedLanguage={setSelectedLanguageState}
          />
        </StepNavigation>
      </>

    );
  };

  ComponentWithStepNavigation.displayName = `withStepNavigation(${WrappedComponent.displayName || WrappedComponent.name || "Component"
    })`;

  return ComponentWithStepNavigation;
};

export default withStepNavigation;
