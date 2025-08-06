import { classes } from "@/shared/lib/clsx";
import React from "react";

interface HeadingProps {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  className?: string;
  children: React.ReactNode;
}

const Heading: React.FC<HeadingProps> = ({ as: Tag = "h2", className, children }) => {
  return (
    <Tag
      className={classes(
        "text-lg semibold text-primary-600",
        className 
      )}
    >
      {children}
    </Tag>
  );
};

export default React.memo(Heading);
