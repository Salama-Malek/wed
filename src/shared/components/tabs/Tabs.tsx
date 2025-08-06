import { ReactNode } from "react";
import { useTabs } from "./TabsContext";

interface TabsProps {
  children: ReactNode;
}

export const Tabs = ({ children }: TabsProps) => {
  return <div className="w-full">{children}</div>;
};

export const TabList = ({ children }: { children: ReactNode }) => {
  return <div className="flex gap-4">{children}</div>;
};

export const Tab = ({ id, children }: { id: string; children: ReactNode }) => {
  const { activeTab, setActiveTab } = useTabs();
  const isActive = activeTab === id;

  const handleTabClick = () => {
    setActiveTab(id);
    localStorage.setItem("caseRoleTab", id);
  };

  return (
    <button
      className={`py-2 px-4 border-b-2 ${
        isActive
          ? "border-blue-500 text-blue-500"
          : "border-transparent text-gray-500"
      }`}
      onClick={handleTabClick}
    >
      {children}
    </button>
  );
};

export const TabPanels = ({ children }: { children: ReactNode }) => {
  return <div className="py-4">{children}</div>;
};

export const TabPanel = ({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) => {
  const { activeTab } = useTabs();
  return activeTab === id ? <div>{children}</div> : null;
};
