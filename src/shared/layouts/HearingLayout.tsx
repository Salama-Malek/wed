import { ReactNode } from "react";
import { Outlet } from "react-router-dom";

interface HearingLayoutProps {
  breadcrumbs?: ReactNode;
  containerClass?: string;
  contentClass?: string;
  children?: ReactNode; 
}

const HearingLayout = ({
  breadcrumbs,
  containerClass = "",
  contentClass = "",
  children, 
}: HearingLayoutProps) => {
  return (
    <main className="bg-gray-100 min-h-screen flex flex-col">
      {breadcrumbs && (
        <nav className="container">
            {breadcrumbs}
        </nav>
      )}

      <div className={`container flex-1 ${containerClass}`}>
        <div className={`bg-white rounded-md ${contentClass}`}>
          {children || <Outlet />} 
        </div>
      </div>
    </main>
  );
};

export default HearingLayout;