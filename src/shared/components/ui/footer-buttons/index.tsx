import React from "react";
import Button from "@/shared/components/button";
import { useTranslation } from "react-i18next";

interface FormActionButtonsProps {
  onCancel: () => void;
  onSave: () => void;
  cancelText?: string;
  saveText?: string;
  className?: string;
}

const FormActionButtons: React.FC<FormActionButtonsProps> = ({
  onCancel,
  onSave,
  cancelText ,
  saveText ,
  className = "",
}) => {
  const { t } = useTranslation("stepper");
  return (
    <div className={`flex w-full justify-between items-center ${className}`}>
      <Button
        type="button"
        typeVariant="outline"
        variant="secondary"
        size="xs"
        onClick={onCancel}
      >
        {cancelText ?? t("cancel")}
      </Button>
      <Button 
        type="button"
        typeVariant="brand" 
        variant="primary" 
        size="xs" 
        onClick={onSave}
      >
        {saveText ?? t("save")}
      </Button>
    </div>
  );
};

export default FormActionButtons;
