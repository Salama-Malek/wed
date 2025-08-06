import * as React from "react";
import { classes } from "@/shared/lib/clsx";

type FieldWrapperProps = {
  children: React.ReactNode;
  labelFor?: string;
  label?: string;
  invalidFeedback?: string;
  notRequired?: boolean;
  wrapperClassName?: string;
};

export const FieldWrapper = ({ children, labelFor, label, invalidFeedback, notRequired, wrapperClassName }: FieldWrapperProps) => {
  return (
    // <div className="w-full space-y-3">
        <div className={classes("space-y-3", wrapperClassName)}>

      {label && (
        <label className="text-sm !leading-5 normal" htmlFor={labelFor}>
          {!notRequired && <span className="text-error-700">*</span>} {label}
        </label>
      )}
      {children}
      {invalidFeedback && <div className="invalid-feedback text-red-500">{invalidFeedback}</div>}
    </div>
  );
};
