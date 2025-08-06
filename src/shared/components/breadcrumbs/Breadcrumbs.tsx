import React, { ReactElement } from "react";
import clsx from "clsx";
import BreadcrumbItem from "./BreadcrumbItem";
import BreadcrumbSeparator from "./BreadcrumbSeparator";
import { BreadcrumbsProvider } from "./BreadcrumbsContext";
import { classes } from "@/shared/lib/clsx";

export type BreadcrumbItemType = {
  label: string;
  href: string;
  breadcrumbs?: BreadcrumbItemType[];
};

interface BreadcrumbsProps {
  separator: string | ReactElement;
  breadcrumbs: BreadcrumbItemType[];
  additionalClassNames?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  separator = ">",
  breadcrumbs = [],
  additionalClassNames = "pt-lg pb-lg",
}) => {
  const breadcrumbClass = classes(
    "flex justify-start items-center py-md container",
    additionalClassNames
  );


  return (
    <BreadcrumbsProvider separator={separator}>
      <div className={breadcrumbClass}>
        {breadcrumbs.map((item, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem
              href={item.href}
              isLast={index === breadcrumbs.length - 1}
            >
              {item.label}
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </div>
    </BreadcrumbsProvider>
  );
};

export default Breadcrumbs;
