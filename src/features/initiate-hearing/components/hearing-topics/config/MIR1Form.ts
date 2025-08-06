import { FormElement, Option } from "@/shared/components/form/form.types";

// Utility function to check if request type requires additional fields
const requiresAdditionalFields = (requestType?: Option | null) => {
  if (!requestType) return false;
  return ["REQT1", "REQT2", "REQT3"].includes(String(requestType.value));
};

// Utility function to check if request type requires reason and current level
const requiresReasonAndCurrentLevel = (requestType?: Option | null) => {
  if (!requestType) return false;
  return String(requestType.value) === "REQT3";
};

export const getMIR1FormFields = ({
  t,
  typeOfRequest,
  setValue,
  TypeOfRequestLookUpOptions,
  isEditing,
  watch,
  editTopic,
  trigger
}: any): FormElement[] => {
  const requiredDegreeOfInsurance = watch("requiredDegreeOfInsurance");
  const currentInsuranceLevel = watch("currentInsuranceLevel");
  const theReason = watch("theReason");
  
  // In edit mode, determine the request type from editTopic if typeOfRequest is not set
  const effectiveTypeOfRequest = typeOfRequest || (isEditing && editTopic?.RequestType ? {
    value: editTopic.RequestType,
    label: editTopic.TypeOfRequest || editTopic.RequestType
  } : null);
  
  // Determine which fields are needed based on the request type
  const needsAdditionalFields = requiresAdditionalFields(effectiveTypeOfRequest);
  const needsReasonAndCurrentLevel = requiresReasonAndCurrentLevel(effectiveTypeOfRequest);
  
  // Custom validation for requiredDegreeOfInsurance
  const requiredDegreeValidation = {
    validate: (value: string) => {
      if (needsAdditionalFields && (!value || value.trim().length === 0)) {
        return t("fieldRequired");
      }
      return true;
    },
  };

  // Custom validation for theReason
  const reasonValidation = {
    validate: (value: string) => {
      if (needsReasonAndCurrentLevel && (!value || value.trim().length === 0)) {
        return t("fieldRequired");
      }
      return true;
    },
  };

  // Custom validation for currentInsuranceLevel
  const currentLevelValidation = {
    validate: (value: string) => {
      if (needsReasonAndCurrentLevel && (!value || value.trim().length === 0)) {
        return t("fieldRequired");
      }
      return true;
    },
  };
  
  const baseFields: FormElement[] = [
    {
      type: "autocomplete" as const,
      name: "typeOfRequest",
      label: t("typeOfRequest"),
      options: TypeOfRequestLookUpOptions,
      value: typeOfRequest,
      onChange: (option: Option | null) => {
        setValue("typeOfRequest", option);
        // Clear dependent fields when request type changes
        if (!requiresAdditionalFields(option)) {
          setValue("requiredDegreeOfInsurance", "");
        }
        if (!requiresReasonAndCurrentLevel(option)) {
          setValue("theReason", "");
          setValue("currentInsuranceLevel", "");
        }
        // Trigger validation for dependent fields
        if (typeof trigger === 'function') {
          trigger(["requiredDegreeOfInsurance", "theReason", "currentInsuranceLevel"]);
        }
      },
      validation: { required: t("fieldRequired") },
      notRequired: false,
    }
  ];

  // Add conditional fields based on request type
  if (needsAdditionalFields) {
    baseFields.push({
      type: "input" as const,
      name: "requiredDegreeOfInsurance",
      label: t("requiredDegreeOfInsurance"),
      inputType: "number" as const,
      value: isEditing ? editTopic?.RequiredDegreeInsurance || editTopic?.requiredDegreeOfInsurance : requiredDegreeOfInsurance,
      onChange: (value: string) => setValue("requiredDegreeOfInsurance", value),
      validation: requiredDegreeValidation,
      notRequired: false,
    });
  }

  if (needsReasonAndCurrentLevel) {
    baseFields.push(
      {
        type: "input" as const,
        name: "theReason",
        label: t("reason"),
        inputType: "textarea" as const,
        value: isEditing ? editTopic?.Reason || editTopic?.theReason : theReason,
        onChange: (value: string) => setValue("theReason", value),
        validation: reasonValidation,
        notRequired: false,
      },
      {
        type: "input" as const,
        name: "currentInsuranceLevel",
        label: t("currentInsuranceLevel"),
        inputType: "number" as const,
        value: isEditing ? editTopic?.CurrentInsuranceLevel || editTopic?.currentInsuranceLevel : currentInsuranceLevel,
        onChange: (value: string) => setValue("currentInsuranceLevel", value),
        validation: currentLevelValidation,
        notRequired: false,
      }
    );
  }

  return baseFields;
};