import { ReactNode } from "react";

interface TabListProps {
  children: ReactNode;
}

export const TabList = ({ children }: TabListProps) => {
  return <div className="flex gap-14xl">{children}</div>;
};
