import { ReactNode, useEffect } from "react";
import { useTabs } from "./TabsContext";

interface TabsProps {
  children: ReactNode;
  defaultActiveId?: string;
}

export const Tabs = ({ children, defaultActiveId }: TabsProps) => {
  const { setActiveTab } = useTabs();

  useEffect(() => {
    if (defaultActiveId) {
      setActiveTab(defaultActiveId);
    }
  }, [defaultActiveId, setActiveTab]);

  return <div className="w-full">{children}</div>;
};

export const TabList = ({ children }: { children: ReactNode }) => {
  return <div className="flex gap-4">{children}</div>;
};

interface TabProps {
  id: string;
  children: ReactNode;
  onClick?: () => void;
}

export const Tab = ({ id, children, onClick }: TabProps) => {
  const { activeTab, setActiveTab } = useTabs();
  const isActive = activeTab === id;

  const handleClick = () => {
    setActiveTab(id);
    onClick?.();
  };

  return (
    <button
      className={`py-2 px-4 border-b-2 transition-all font-medium text-sm ${
        isActive ? "border-blue-500 text-blue-500" : "border-transparent text-gray-500"
      }`}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

export const TabPanels = ({ children }: { children: ReactNode }) => {
  return <div className="py-4">{children}</div>;
};

export const TabPanel = ({ id, children }: { id: string; children: ReactNode }) => {
  const { activeTab } = useTabs();
  return activeTab === id ? <div>{children}</div> : null;
};
