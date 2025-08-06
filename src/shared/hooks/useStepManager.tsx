import { useState, useCallback, useMemo, useEffect } from "react";

export const useStepManager = (stepsLength: number, tabsLength: number = 3) => {
  const [currentStep, setCurrentStep] = useState(() => {
    const savedStep = localStorage.getItem("step");
    return savedStep ? parseInt(savedStep) : 0;
  });

  const [currentTab, setCurrentTab] = useState(() => {
    const savedTab = localStorage.getItem("tab");
    return savedTab ? parseInt(savedTab) : 0;
  });

  const isFirstStep = useMemo(
    () => currentStep === 0 && currentTab === 0,
    [currentStep, currentTab]
  );
  const isLastStep = useMemo(
    () => currentStep === stepsLength - 1,
    [currentStep, stepsLength]
  );
  const isLastTab = useMemo(
    () => currentTab === tabsLength - 1,
    [currentTab, tabsLength]
  );

  const goToNextStep = useCallback(() => {
    if (currentStep === 0) {
      if (currentTab < tabsLength - 1) {
        const nextTab = currentTab + 1;
        localStorage.setItem("tab", nextTab.toString());
        setCurrentTab(nextTab);
      } else {
        const nextStep = 1;
        localStorage.setItem("step", nextStep.toString());
        localStorage.setItem("tab", "0");
        setCurrentStep(nextStep);
        setCurrentTab(0);
      }
    } else {
      const nextStep = Math.min(currentStep + 1, stepsLength - 1);
      localStorage.setItem("step", nextStep.toString());
      setCurrentStep(nextStep);
    }
  }, [currentStep, currentTab, stepsLength, tabsLength]);

  const goToPrevStep = useCallback(() => {
    if (currentStep === 1) {
      const prevStep = 0;
      const prevTab = tabsLength - 1;
      localStorage.setItem("step", prevStep.toString());
      localStorage.setItem("tab", prevTab.toString());
      setCurrentStep(prevStep);
      setCurrentTab(prevTab);
    } else if (currentStep === 0) {
      const prevTab = Math.max(currentTab - 1, 0);
      localStorage.setItem("tab", prevTab.toString());
      setCurrentTab(prevTab);
    } else {
      const prevStep = Math.max(currentStep - 1, 0);
      localStorage.setItem("step", prevStep.toString());
      setCurrentStep(prevStep);
    }
  }, [currentStep, currentTab, tabsLength]);

  const resetSteps = useCallback(() => {
    localStorage.setItem("step", "0");
    localStorage.setItem("tab", "0");
    setCurrentStep(0);
    setCurrentTab(0);
  }, []);

  const isButtonDisabled = useCallback(
    (direction: "prev" | "next") =>
      direction === "prev" ? isFirstStep : isLastStep,
    [isFirstStep, isLastStep]
  );

  useEffect(() => {
    const savedStep = localStorage.getItem("step");
    const savedTab = localStorage.getItem("tab");

    if (savedStep !== null) {
      const step = parseInt(savedStep);
      if (step >= 0 && step < stepsLength) {
        setCurrentStep(step);
      }
    }

    if (savedTab !== null) {
      const tab = parseInt(savedTab);
      if (tab >= 0 && tab < tabsLength) {
        setCurrentTab(tab);
      }
    }
  }, [stepsLength, tabsLength]);

  return {
    currentStep,
    currentTab,
    isFirstStep,
    isLastStep,
    isLastTab,
    goToNextStep,
    goToPrevStep,
    resetSteps,
    isButtonDisabled,
    setCurrentStep,
    setCurrentTab,
  };
};
