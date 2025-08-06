import React, { Suspense, useEffect } from "react";
import { useTranslation } from "react-i18next";
const MultiStepForm = React.lazy(() => import("./MultiStepForm/MultiStepForm"));

import StepperSkeleton from "@/shared/components/loader/StepperSkeleton";
import useCasesLogic from "@/features/initiate-hearing/hooks/useCasesLogic";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
const ContentRenderer = React.lazy(
  () => import("./components/ContentRenderer")
);

export interface Step {
  title: string;
  description: string;
}

const CaseCreation: React.FC = () => {
  const [getCookie, setCookie] = useCookieState({ caseId: "" });
  const userType = getCookie("userType");

  useEffect(() => {
    setCookie("userType", userType);
  }, [userType]);

  const { t } = useTranslation("stepper");
  const steps: Step[] = [
    { title: t("step1.title"), description: t("step1.description") },
    { title: t("step2.title"), description: t("step2.description") },
    { title: t("step3.title"), description: t("step3.description") },
  ];

  const { currentStep, currentTab } = useCasesLogic();

  useEffect(() => {
    const savedStep = localStorage.getItem("step");
    const savedTab = localStorage.getItem("tab");

    if (!savedStep && !savedTab) {
      localStorage.setItem("step", "0");
      localStorage.setItem("tab", "0");
    }
  }, []);

  return (
    <Suspense fallback={<StepperSkeleton />}>
      <MultiStepForm steps={steps}>
        <ContentRenderer currentStep={currentStep} currentTab={currentTab} />
      </MultiStepForm>
    </Suspense>
  );
};

export default CaseCreation;
