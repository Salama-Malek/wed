import { useEffect } from "react";
import { UseFormSetValue, UseFormTrigger } from "react-hook-form";
import { CaseTopicsPrefillService, CaseTopicData } from "../../initiate-hearing/services/caseTopicsPrefillService";

interface UseCaseTopicsPrefillProps {
  setValue: UseFormSetValue<any>;
  trigger?: UseFormTrigger<any>;
  caseTopics?: CaseTopicData[];
  isEditing?: boolean;
  editTopic?: any;
}

/**
 * Hook for prefilling case topics form fields including dates
 * Similar to useCaseDetailsPrefill but specifically for case topics
 */
const useCaseTopicsPrefill = ({
  setValue,
  trigger,
  caseTopics = [],
  isEditing = false,
  editTopic,
}: UseCaseTopicsPrefillProps) => {
  useEffect(() => {
    if (!isEditing || !editTopic) return;

    try {
      // If editing a specific topic, prefill that topic's data
      const formFields = CaseTopicsPrefillService.extractFormFields(editTopic);
      
      // Set all form fields without prefix since we're editing a single topic
      Object.entries(formFields).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          setValue(key, value);
        }
      });

      // Also set the original topic data for backward compatibility
      if (editTopic.MainTopicID) {
        const mainCategoryValue = {
          value: editTopic.MainTopicID,
          label: editTopic.MainSectionHeader || editTopic.mainCategory?.label || "",
        };
        setValue("mainCategory", mainCategoryValue);
      }
      
      if (editTopic.SubTopicID) {
        const subCategoryValue = {
          value: editTopic.SubTopicID,
          label: editTopic.SubTopicName || editTopic.subCategory?.label || "",
        };
        setValue("subCategory", subCategoryValue);
      }

      // Set acknowledged field
      if (editTopic.acknowledged !== undefined) {
        setValue("acknowledged", editTopic.acknowledged);
      }

      // Set regulatory text if available
      if (editTopic.Formal || editTopic.RegulatoryText) {
        setValue("regulatoryText", editTopic.Formal || editTopic.RegulatoryText);
      }

      // Trigger validation after setting all values with a longer delay
      if (trigger) {
        setTimeout(() => {
          trigger();
        }, 200);
      }
    } catch (error) {
      // Error handling
    }
  }, [editTopic, isEditing, setValue, trigger]);
};

export default useCaseTopicsPrefill; 