import { useTabs } from "./TabsContext";
import { ReactNode, useMemo, ButtonHTMLAttributes } from "react";

interface TabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  id: string;
  children: ReactNode;
}

export const Tab = ({ id, children, ...props }: TabProps) => {
  const { activeTab, setActiveTab } = useTabs();
  const isActive = useMemo(() => activeTab === id, [activeTab, id]);

  return (
    <div className="flex flex-col items-center" data-tab-id={id}>
      <button
        {...props}
        className={`py-3 transition text-sm medium ${
          isActive ? "text-primary-600 bold" : "text-gray-400 hover:text-gray-600"
        }`}
        onClick={() => setActiveTab(id)}
      >
        {children}
      </button>
      <div
        className={`h-[3px] w-full transition-all ${
          isActive ? "bg-primary-600 h-[3px] rounded-lg" : "bg-transparent"
        }`}
      ></div>
    </div>
  );
};
