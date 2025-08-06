import React from "react";
import { Control, Controller } from "react-hook-form";
import { FieldWrapper } from "@/shared/components/form";
import { FormData } from "@/shared/components/form/form.types";
import { Calculator01Icon } from "hugeicons-react";
import { useTranslation } from "react-i18next";

interface GregorianDateDisplayInputProps {
  control: Control<any>;
  name: keyof FormData;
  label: string;
  invalidFeedback?: string;
  isError?: boolean;
  notRequired?: boolean;
}

export const GregorianDateDisplayInput: React.FC<GregorianDateDisplayInputProps> = ({
  control,
  name,
  label,
  invalidFeedback,
  isError,
  notRequired,
}) => {
  const { i18n } = useTranslation();
  const formatDateForDisplay = (date: string) => {
    if (!date || date.length !== 8) return date;
    return `${date.slice(0, 4)}/${date.slice(4, 6)}/${date.slice(6)}`;
  };

  return (
    <Controller
      shouldUnregister={false}
      control={control}
      name={name}
      render={({ field: { value } }) => (
        <FieldWrapper label={label} invalidFeedback={invalidFeedback} notRequired={notRequired}>
          <div className="relative">
            <input
              type="text"
              className="form-input"
              value={formatDateForDisplay(value || "")}
              readOnly
            />
            <Calculator01Icon className={`absolute ${i18n.dir() === "rtl" ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 text-secondary-400`} />
            {(isError) && (
              <div className="invalid-feedback text-red-500 mt-2">
                {invalidFeedback}
              </div>
            )}
          </div>
        </FieldWrapper>
      )}
    />
  );
}; 