import React from "react";
import { FieldValues, UseFormHandleSubmit } from "react-hook-form";
import { useTranslation } from "react-i18next";

interface FormWrapperProps<T extends FieldValues> {
  description?: string;
  onSubmit?: ReturnType<UseFormHandleSubmit<T>>;
  children?: React.ReactNode;
  isValid?: boolean;
  preventEnterSubmit?: boolean; // New prop to control Enter key behavior
  showSubmitButton?: boolean; // New prop to control submit button visibility
}

const FormWrapper = <T extends FieldValues>({ 
  description, 
  onSubmit, 
  children,
  isValid = false,
  preventEnterSubmit = true, // Default to preventing Enter submission
  showSubmitButton = true // Default to showing submit button
}: FormWrapperProps<T>) => {
  const { t } = useTranslation("hearingdetails");

  // Handle form submission with keyboard event prevention
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (preventEnterSubmit) {
      // Only allow submission if it's not triggered by Enter key
      const target = e.target as HTMLFormElement;
      const activeElement = document.activeElement;
      
      // If the active element is an input and Enter was pressed, prevent submission
      if (activeElement && 
          (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') &&
          activeElement.closest('form') === target) {
        e.preventDefault();
        return;
      }
    }
    
    // Call the original onSubmit if provided
    if (onSubmit) {
      onSubmit(e);
    }
  };

  // Handle keyboard events on the form
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (preventEnterSubmit && e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <form 
      onSubmit={handleFormSubmit} 
      onKeyDown={handleKeyDown}
      className="space-y-6 mb-0"
    >
      {children}
      {showSubmitButton && (
        <button 
          type="submit" 
          className={`px-4 py-2 rounded text-white ${
            isValid 
              ? 'bg-blue-500 hover:bg-blue-600' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
          disabled={!isValid}
        >
          Submit
        </button>
      )}
    </form>
  );
};

export default FormWrapper;