import Loader from "../loader";
import { useTabs } from "./TabsContext";
import { ReactNode, Suspense, useMemo } from "react";

interface TabPanelProps {
  id: string;
  children: ReactNode;
}

export const TabPanel = ({ id, children }: TabPanelProps) => {
  const { activeTab } = useTabs();
  const isActive = useMemo(() => activeTab === id, [activeTab, id]);

  if (!isActive) return null;

  return (
    <Suspense fallback={<Loader/>}>
      <div>{children}</div>
    </Suspense>
  );
};
