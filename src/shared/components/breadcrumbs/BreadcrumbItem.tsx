import React from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { classes } from "@/shared/lib/clsx";
import { useDispatch } from "react-redux";
import { startLoading } from "@/redux/slices/loadingSlice";

export interface BreadcrumbItemProps {
  href: string;
  children: React.ReactNode;
  isLast?: boolean; 
}

const BreadcrumbItem: React.FC<BreadcrumbItemProps> = ({ href, children, isLast }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLast) {
      dispatch(startLoading());
      navigate(href);
    }
  };

  return (
    <div className="flex items-center">
      <a
        href={href}
        onClick={handleClick}
        className={classes(
          "regular text-sm md:text-lg cursor-pointer",
          isLast ? "text-primary-600" : "text-gray-400 hover:text-primary-600"
        )}
      >
        {children}
      </a>
    </div>
  );
};

export default BreadcrumbItem;
