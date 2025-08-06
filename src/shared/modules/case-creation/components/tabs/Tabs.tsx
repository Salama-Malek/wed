import React from "react";

interface TabsProps {
  currentTab: number;
  tabs: string[];
  onTabChange: (tabIndex: number) => void;
  isFormValid?: boolean;
}

const Tabs: React.FC<TabsProps> = ({ currentTab, tabs, onTabChange, isFormValid }) => {
  return (
    <>
      <div className="flex flex-col gap-x-12 mb-6 md:flex-row lg:flex-row">
        {tabs.map((tab, index) => (
          <div className="flex flex-col items-center" key={index}>
            <button
              onClick={() => onTabChange(index)}
              disabled={index > currentTab && !isFormValid}
              className={`py-3 transition text-sm font-medium ${
                index === currentTab
                  ? "bold" 
                  : index < currentTab
                  ? "text-gray-700 " 
                  : "text-gray-400 hover:text-gray-600" 
              }`}
            >
              {tab}
            </button>
            <div
              className={`h-[3px] w-full transition-all ${
                index === currentTab
                  ? "bg-primary-600 h-[3px] rounded-lg" 
                  : index < currentTab
                  ? "h-[3px] rounded-lg" 
                  : "bg-transparent" 
              }`}
            ></div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Tabs;
