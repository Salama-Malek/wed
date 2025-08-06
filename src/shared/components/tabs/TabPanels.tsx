import { ReactNode } from "react";

interface TabPanelsProps {
  children: ReactNode;
}

export const TabPanels = ({ children }: TabPanelsProps) => {
  return <div className="py-7xl">{children}</div>;
};
