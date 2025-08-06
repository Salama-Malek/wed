import React from "react";

interface SectionProps {
  title?: string;
  children: React.ReactNode;
  isRadio?: boolean;
  isAdd?: boolean;
  className?: string;
  isManageHearing?: boolean;
  gridCols?: number;
  removeMargin?: boolean;
  requiredText?: string;
  isHidden?: boolean;
}

export const Section = ({
  title,
  children,
  isRadio,
  isAdd,
  className,
  isManageHearing,
  gridCols = 3,
  removeMargin,
  requiredText,
  isHidden = false
}: SectionProps) => {
  const computedGridClass = isRadio
    ? "grid-cols-1 gap-x-6 gap-y-6"
    : `grid-cols-1 md:grid-cols-2  lg:grid-cols-${gridCols} gap-x-6 gap-y-6`;

  const finalClassName = className || computedGridClass;

  const widthClass = isManageHearing ? "max-w-[50rem] min-w-auto" : "w-full";

  return (
    <div className={`${widthClass} ${removeMargin && "!mt-0 !mb-3"} ${isHidden && "hidden"} space-y-${isAdd ? "3" : "6"} mb-6`}>
      {title && <h2 className="text-md text-primary-600 semibold">{title} <span className="text-secondary-700">{requiredText && requiredText}</span></h2>}
      <div className={`grid ${finalClassName}`}>{children}</div>
    </div>
  );
};
