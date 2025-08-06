import { FC } from "react";
import { FieldWrapper } from "../../form";

export type ReadOnlyFieldProps = {
  label: string;
  value?: string;
  className?: string;
  notRequired?: boolean;
  isLoading?: boolean;
  removeMargin?: boolean;
};

export const ReadOnlyField: FC<ReadOnlyFieldProps> = ({
  label,
  value,
  className,
  notRequired,
  removeMargin,
  isLoading,

}) => {
  const displayValue = typeof value === "string" && value.trim() !== "" ? value : "---"

  return (
    <FieldWrapper notRequired={notRequired} label={label} labelFor="">
      <div className={`w-full text-md rounded-sm py-0.5 medium ${className}`}>
        {isLoading ? (
          <div className="wave-loading h-4 w-40 rounded-xs"></div>
        ) : (
          displayValue
        )}
      </div>
    </FieldWrapper>
  );
};