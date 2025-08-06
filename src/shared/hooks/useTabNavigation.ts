import { useTabs } from "@/shared/components/tabs/TabsContext";

export const useTabNavigation = (tabIds: string[], goToNextStep: () => void) => {
  const { activeTab, setActiveTab } = useTabs();

  const currentIndex = tabIds.indexOf(activeTab);

  const goToNextTab = () => {
    if (currentIndex < tabIds.length - 1) {
      const nextTabIndex = currentIndex + 1;
      localStorage.setItem('tab', nextTabIndex.toString());
      setActiveTab(tabIds[nextTabIndex]);
    } else {
      localStorage.setItem('tab', '0');
      goToNextStep();
    }
  };

  const goToPrevTab = () => {
    if (currentIndex > 0) {
      const prevTabIndex = currentIndex - 1;
      localStorage.setItem('tab', prevTabIndex.toString());
      setActiveTab(tabIds[prevTabIndex]);
    }
  };

  const initializeTab = () => {
    const savedTab = localStorage.getItem('tab');
    if (savedTab !== null) {
      const tabIndex = parseInt(savedTab);
      if (tabIndex >= 0 && tabIndex < tabIds.length) {
        setActiveTab(tabIds[tabIndex]);
      }
    }
  };

  return { goToNextTab, goToPrevTab, initializeTab };
};
