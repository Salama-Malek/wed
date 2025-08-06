import { useCallback } from 'react';

interface ResetConfig {
  field: string;
  dependentFields: string[];
  resetValue?: any;
}

export const useFormReset = (setValue: any, clearErrors?: any) => {
  const fieldDependencies: Record<string, ResetConfig> = {
    mainCategory: {
      field: 'mainCategory',
      dependentFields: [
        'subCategory',
        'acknowledged',
        'regulatoryText',
        'showLegalSection',
        'showTopicData'
      ],
      resetValue: null
    },
    claimantStatus: {
      field: 'claimantStatus',
      dependentFields: [
        'userName',
        'region',
        'city',
        'occupation',
        'gender',
        'nationality',
        'hijriDate',
        'gregorianDate',
        'applicant',
        'phoneNumber'
      ],
      resetValue: ''
    },
    nationalId: {
      field: 'nationalId',
      dependentFields: [
        'DefendantsEstablishmentPrisonerName',
        'mobileNumber',
        'region',
        'city',
        'occupation',
        'gender',
        'nationality',
        'DefendantsEstablishmentPrisonerId'
      ],
      resetValue: ''
    },
    typeOfRequest: {
      field: 'typeOfRequest',
      dependentFields: [
        'requiredDegreeOfInsurance',
        'currentInsuranceLevel',
        'theReason'
      ],
      resetValue: null
    },
    commissionType: {
      field: 'commissionType',
      dependentFields: [
        'otherCommission'
      ],
      resetValue: null
    },
    main_category_of_the_government_entity: {
      field: 'main_category_of_the_government_entity',
      dependentFields: [
        'subcategory_of_the_government_entity'
      ],
      resetValue: null
    },
    region: {
      field: 'region',
      dependentFields: [
        'city',
        'laborOffice'
      ],
      resetValue: null
    }
  };

  const resetField = useCallback((fieldName: string) => {
    const config = fieldDependencies[fieldName];
    if (config) {
      setValue(config.field, config.resetValue);
      config.dependentFields.forEach(depField => {
        setValue(depField, config.resetValue);
      });
      clearErrors?.();
    }
  }, [setValue, clearErrors]);

  const resetFields = useCallback((fields: string[]) => {
    fields.forEach(field => resetField(field));
  }, [resetField]);

  const resetAll = useCallback(() => {
    Object.keys(fieldDependencies).forEach(field => resetField(field));
  }, [resetField]);

  return {
    resetField,
    resetFields,
    resetAll,
    fieldDependencies
  };
}; 