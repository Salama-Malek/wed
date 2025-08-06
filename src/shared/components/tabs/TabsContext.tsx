import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";

interface TabsContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export const TabsProvider = ({ children }: { children: ReactNode }) => {
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem("caseRoleTab");
    return savedTab ? savedTab : "claimant";
  });

  useEffect(() => {
    localStorage.setItem("caseRoleTab", activeTab);
  }, [activeTab]);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
};

export const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("useTabs must be used within a TabsProvider");
  }
  return context;
};
