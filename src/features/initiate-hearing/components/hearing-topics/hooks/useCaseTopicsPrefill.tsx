import { useEffect } from "react";
import { UseFormSetValue, UseFormTrigger } from "react-hook-form";
import { CaseTopicsPrefillService, CaseTopicData } from "../../../services/caseTopicsPrefillService";

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
      const formFields = CaseTopicsPrefillService.extractFormFields(editTopic);
      
      Object.entries(formFields).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          setValue(key, value);
        }
      });

      if (editTopic.MainTopicID) {
        const mainCategoryValue = {
          value: editTopic.MainTopicID,
          label: editTopic.CaseTopicName || editTopic.mainCategory?.label || "",
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

      if (editTopic.acknowledged !== undefined) {
        setValue("acknowledged", editTopic.acknowledged);
      }

      if (editTopic.Formal || editTopic.RegulatoryText) {
        setValue("regulatoryText", editTopic.Formal || editTopic.RegulatoryText);
      }

      if (trigger) {
        setTimeout(() => {
          trigger();
        }, 200);
      }
    } catch (error) {
    }
  }, [editTopic, isEditing, setValue, trigger]);
};

export default useCaseTopicsPrefill; 