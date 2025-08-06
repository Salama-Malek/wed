import { useState, useEffect } from "react";

export const useNavigationService = () => {
  const [currentStep, setCurrentStep] = useState<number>(() => {
    const savedStep = localStorage.getItem('step');
    return savedStep ? parseInt(savedStep) : 0;
  });

  const [currentTab, setCurrentTab] = useState<number>(() => {
    const savedTab = localStorage.getItem('tab');
    return savedTab ? parseInt(savedTab) : 0;
  });

  useEffect(() => {
    const savedStep = localStorage.getItem('step');
    const savedTab = localStorage.getItem('tab');

    if (savedStep) {
      setCurrentStep(parseInt(savedStep));
    }
    if (savedTab) {
      setCurrentTab(parseInt(savedTab));
    }
  }, []);

  const updateParams = (step: number, tab?: number) => {
    localStorage.setItem('step', step.toString());
    if (tab !== undefined) {
      localStorage.setItem('tab', tab.toString());
    }

    setCurrentStep(step);
    if (tab !== undefined) {
      setCurrentTab(tab);
    }

    window.dispatchEvent(new Event('storage'));
  };

  return { updateParams, currentStep, currentTab };
};