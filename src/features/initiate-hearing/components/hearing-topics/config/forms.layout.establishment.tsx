import React, { useEffect } from "react";
import {
  SectionLayout,
  Option,
  FormElement,
  UseFormLayoutParams,
} from "@/shared/components/form/form.types";
import {
  buildForm,
  getCommonElements,
  initFormConfig,
} from "@/config/formConfig";
import { formatHijriDate, mapToOptions } from "@/shared/lib/helpers";
import { getStep1FormFields } from "./Step1From";
import { getStep2FormFields } from "./Step2From";
import { subCategoryValue } from "@/mock/genderData";
import { DateOfBirthField } from "@/shared/components/calanders";
import { useTranslation } from "react-i18next";
import { HijriDatePickerInput } from "@/shared/components/calanders/HijriDatePickerInput";
import { GregorianDateDisplayInput } from "@/shared/components/calanders/GregorianDateDisplayInput";
import { DateObject } from "react-multi-date-picker";
import hijriCalendar from "react-date-object/calendars/arabic";
import gregorianCalendar from "react-date-object/calendars/gregorian";
import hijriLocale from "react-date-object/locales/arabic_en";
import gregorianLocale from "react-date-object/locales/gregorian_en";
import { useGetRegionLookupDataQuery } from "@/features/initiate-hearing/api/create-case/workDetailApis";

interface UseFormLayoutParamsWithEstablishment extends UseFormLayoutParams {
  payIncreaseTypeData: any;
  PayIncreaseTypeOptions: any;
  control: any;
  trigger: (field: string | string[]) => void;
}
export const useFormLayout = ({
  t: t,
  MainTopicID: mainCategory,
  SubTopicID: subCategory,
  FromLocation: fromPlace,
  ToLocation: toPlace,
  AcknowledgementTerms: acknowledged,
  showLegalSection: showLegalSection,
  showTopicData: showTopicData,
  setValue: setValue,
  handleAdd: handleAdd,
  handleAcknowledgeChange: handleAcknowledgeChange,
  handleAddTopic: handleAddTopic,
  handleSend: handleSend,
  regulatoryText: regulatoryText,
  decisionNumber: decisionNumber,
  isEditing: isEditing,
  mainCategoryData: mainCategoryData,
  subCategoryData: subCategoryData,
  watch: watch,
  forAllowanceData: forAllowanceData,
  typeOfRequestLookupData: typeOfRequestLookupData,
  commissionTypeLookupData: commissionTypeLookupData,
  accordingToAgreementLookupData: accordingToAgreementLookupData,
  matchedSubCategory: matchedSubCategory,
  subTopicsLoading: subTopicsLoading,
  amountPaidData: amountPaidData,
  leaveTypeData: leaveTypeData,
  travelingWayData: travelingWayData,
  editTopic: editTopic,
  caseTopics: caseTopics,
  typesOfPenaltiesData: typesOfPenaltiesData,
  setShowLegalSection: setShowLegalSection,
  setShowTopicData: setShowTopicData,
  isValid: isValid,
  isMainCategoryLoading: isMainCategoryLoading,
  isSubCategoryLoading: isSubCategoryLoading,
  control,
  trigger,
}: UseFormLayoutParamsWithEstablishment): SectionLayout[] => {
  const { t: tHearingTopics, i18n } = useTranslation("hearingtopics");

  // Add region lookup hook
  const { data: regionData, isFetching: isRegionLoading } = useGetRegionLookupDataQuery({
    AcceptedLanguage: i18n.language.toUpperCase(),
    context: "worker",
  });

  // Create region options for dropdowns
  const RegionOptions = React.useMemo(() => {
    return mapToOptions({
      data: regionData?.DataElements,
    });
  }, [regionData]);

  const amount = watch("amount");
  const loanAmount = watch("loanAmount");
  const typeOfCustody = watch("typeOfCustody");
  const damagedValue = watch("damagedValue");
  const damagedType = watch("damagedType");
  const amountOfCompensation = watch("amountOfCompensation");
  const subCategoryValue = watch("subCategory");
  const request_date_hijri = watch("request_date_hijri");
  const typeOfRequest = watch("typeOfRequest");
  const date_hijri = watch("date_hijri");
  const request_date_gregorian = watch("request_date_gregorian");
  const requestDate = watch("requestDate");
  const requestDateGregorian = watch("requestDateGregorian");
  const fromLocation = watch("fromLocation");
  const toLocation = watch("toLocation");
  const fromJob = watch("fromJob");
  const toJob = watch("toJob");
  const penalityType = watch("penalityType");
  const amountOfReduction = watch("amountOfReduction");
  const date_new = watch("date_new");
  const manDecsDate = watch("manDecsDate");
  const RefundType = watch("RefundType");
  initFormConfig({
    isEditing,
    handleAddTopic,
    t,
  });
  const MainCategoryOptions = React.useMemo(() => {
    return mapToOptions({
      data: mainCategoryData?.DataElements,
    });
  }, [mainCategoryData]);

  const SubCategoryOptions = React.useMemo(() => {
    return mapToOptions({
      data: subCategoryData?.DataElements,
    });
  }, [subCategoryData]);

  const TypeOfRequestLookUpOptions = React.useMemo(() => {
    return mapToOptions({
      data: typeOfRequestLookupData?.DataElements,
    });
  }, [typeOfRequestLookupData]);

  const CommissionTypeLookUpOptions = React.useMemo(() => {
    return mapToOptions({
      data: commissionTypeLookupData?.DataElements,
    });
  }, [commissionTypeLookupData]);

  const AccordingToAgreementLookupLookUpOptions = React.useMemo(() => {
    return mapToOptions({
      data: accordingToAgreementLookupData?.DataElements,
    });
  }, [accordingToAgreementLookupData]);

  const AmountPaidLookupLookUpOptions = React.useMemo(() => {
    return mapToOptions({
      data: amountPaidData?.DataElements,
    });
  }, [amountPaidData]);

  const LeaveTypeLookUpOptions = React.useMemo(() => {
    return mapToOptions({
      data: leaveTypeData?.DataElements,
    });
  }, [leaveTypeData]);

  const TravelingWayOptions = React.useMemo(() => {
    return mapToOptions({
      data: travelingWayData?.DataElements,
    });
  }, [travelingWayData]);

  const TypesOfPenaltiesOptions = React.useMemo(() => {
    return mapToOptions({
      data: typesOfPenaltiesData?.DataElements,
    });
  }, [typesOfPenaltiesData]);

  // Date change handler for Hijri dates
  const handleHijriDateChange = (
    date: DateObject | DateObject[] | null,
    setHijriValue: (value: string) => void,
    gregorianFieldName: string,
  ) => {
    if (!date || Array.isArray(date)) {
      setHijriValue("");
      setValue(gregorianFieldName, "");
      return;
    }

    const hijri = date.convert(hijriCalendar, hijriLocale).format("YYYY/MM/DD");
    const gregorian = date.convert(gregorianCalendar, gregorianLocale).format("YYYY/MM/DD");

    // Convert to YYYYMMDD format for storage
    const hijriStorage = hijri.replace(/\//g, '');
    const gregorianStorage = gregorian.replace(/\//g, '');

    setHijriValue(hijriStorage);
    setValue(gregorianFieldName, gregorianStorage);
  };

  // Helper function to add the validate rule to text inputs
  type FormElementType = any; // fallback for type
  function addNoSpacesValidationToTextInputs(fields: FormElementType[], t: any): FormElementType[] {
    return fields.map(field => {
      if (field && field.type === 'input' && (field.inputType === 'text' || field.inputType === 'textarea')) {
        return {
          ...field,
          validation: {
            ...(field.validation || {}),
            validate: (value: string) => value.trim().length > 0 || t('spacesOnlyNotAllowed'),
          },
        };
      }
      return field;
    });
  }

  const step1: SectionLayout = {
    gridCols: 2,
    className: "step1-class", // Add a valid className here
    children: [
      ...getStep1FormFields({
        t,
        setValue,
        MainCategoryOptions,
        mainCategory,
        SubCategoryOptions,
        subCategory,
        handleAdd,
        onClearMainCategory: () => {
          setValue("mainCategory", null);
          setValue("subCategory", null);
          setValue("acknowledged", false);
          setValue("regulatoryText", "");
          setShowLegalSection(false);
          setShowTopicData(false);
        },
        onClearSubCategory: () => {
          setValue("subCategory", null);
          setValue("acknowledged", false);
          setValue("regulatoryText", "");
          setShowLegalSection(false);
          setShowTopicData(false);
        },
        isMainCategoryLoading,
        isSubCategoryLoading,
      }),
    ].filter(Boolean) as FormElement[],
  };
  const step2: SectionLayout = {
    gridCols: 2,
    className: "step2-class", // Add a valid className here
    children: [
      ...getStep2FormFields({
        t,
        isEditing,
        mainCategory,
        subCategory,
        subTopicsLoading,
        matchedSubCategory,
        acknowledged,
        showTopicData,
        handleAcknowledgeChange,
      }),
    ].filter(Boolean) as FormElement[],
  };

  const getFormBySubCategory = (): (FormElement | false)[] => {
    // Safety check: if no subCategory is selected, return empty array
    const currentSubCategory = isEditing ? subCategory?.value : subCategoryValue?.value;
    if (!currentSubCategory) {
      return [];
    }

    // تحويل بيانات lookup إلى خيارات
    const AmountPaidLookupLookUpOptions =
      amountPaidData?.DataElements?.map((item: any) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || [];

    const TravelingWayOptions =
      travelingWayData?.DataElements?.map((item: any) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || [];

    const LeaveTypeLookUpOptions =
      leaveTypeData?.DataElements?.map((item: any) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || [];

    const ForAllowanceLookUpOptions =
      forAllowanceData?.DataElements?.map((item: any) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || [];

    const TypeOfRequestLookUpOptions =
      typeOfRequestLookupData?.DataElements?.map((item: any) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || [];

    const CommissionTypeLookUpOptions =
      commissionTypeLookupData?.DataElements?.map((item: any) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || [];

    const AccordingToAgreementLookUpOptions =
      accordingToAgreementLookupData?.DataElements?.map((item: any) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || [];

    switch (currentSubCategory) {
      case "AWRW-1":
        return buildForm([]);
      case "AWRW-2":
        return buildForm([]);
      case "LCUTE-1":
        return buildForm(addNoSpacesValidationToTextInputs([
          {
            type: "input",
            name: "amountOfCompensation",
            label: tHearingTopics("amountOfCompensation"),
            inputType: "text",
            value: watch("amountOfCompensation") || "",
            onChange: (value: string) => setValue("amountOfCompensation", value),
            validation: { required: tHearingTopics("amountOfCompensation") },
            notRequired: false,
          },
        ], tHearingTopics));
      case "CR-1":
        return buildForm([
          {
            type: "input",
            name: "compensationAmount", // Changed from "amount" to "compensationAmount"
            label: tHearingTopics("amount"),
            inputType: "number",
            min: 0,
            value: isEditing ? editTopic?.CompensationAmount || editTopic?.compensationAmount || editTopic?.Amount || editTopic?.amount || watch("compensationAmount") || "" : watch("compensationAmount") || "",
            onChange: (value) => setValue("compensationAmount", value),
            validation: { required: tHearingTopics("amount") },
            notRequired: false,
          },
        ]);
      case "DPVR-1":
        return buildForm(addNoSpacesValidationToTextInputs([
          {
            type: "input",
            name: "damagedType",
            label: tHearingTopics("damagedType"),
            inputType: "text",
            value: watch("damagedType") || "",
            onChange: (value: string) => setValue("damagedType", value),
            validation: { required: tHearingTopics("damagedType") },
            notRequired: false,
          },
          {
            type: "input",
            name: "damagedValue",
            label: tHearingTopics("damagedValue"),
            inputType: "number",
            min: 0,
            value: watch("damagedValue") || "",
            onChange: (value: string) => setValue("damagedValue", value),
            validation: { required: tHearingTopics("damagedValue") },
            notRequired: false,
          },
        ], tHearingTopics));
      case "RLRAHI-1":
        const fields: any = [
          {
            type: "autocomplete" as const,
            name: "typeOfRequest",
            label: tHearingTopics("typeOfRequest"),
            options: TypeOfRequestLookUpOptions,
            value: isEditing && editTopic?.RequestType ?
              { value: editTopic.RequestType, label: editTopic.RequestType } :
              watch("typeOfRequest"),
            onChange: (option: Option | null) =>
              setValue("typeOfRequest", option),
            validation: { required: tHearingTopics("typeOfRequest") },
            notRequired: false,
          },
        ];

        // In edit mode, determine the request type from editTopic if typeOfRequest is not set
        const effectiveTypeOfRequest = typeOfRequest || (isEditing && editTopic?.RequestType ? {
          value: editTopic.TypeOfRequest_Code,
          label: editTopic.TypeOfRequest || editTopic.RequestType
        } : null);

        console.log('[🔧 RLRAHI-1 FORM] effectiveTypeOfRequest:', effectiveTypeOfRequest);
        console.log('[🔧 RLRAHI-1 FORM] editTopic?.RequestType:', editTopic?.RequestType);
        if (effectiveTypeOfRequest?.value === "RLRAHI1") {
          fields.push(
            {
              type: "custom",
              component: (
                <div className="flex flex-col gap-2">
                  <HijriDatePickerInput
                    control={control}
                    name="request_date_hijri"
                    label={tHearingTopics("requestDateHijri")}
                    rules={{ required: tHearingTopics("requestDateHijri") }}
                    onChangeHandler={(date, onChange) =>
                      handleHijriDateChange(
                        date,
                        onChange,
                        "request_date_gregorian"
                      )
                    }
                    notRequired={false}
                    isDateOfBirth={true}
                  />
                  <GregorianDateDisplayInput
                    control={control}
                    name="request_date_gregorian"
                    label={tHearingTopics("requestDateGregorian")}
                    notRequired={false}
                  />
                </div>
              ),
              showWhen: "RLRAHI1",
              notRequired: false,
            },
            {
              type: "input",
              name: "typeOfCustody",
              label: tHearingTopics("typeOfCustody"),
              inputType: "text",
              value: isEditing ? editTopic?.TypeOfCustody || editTopic?.typeOfCustody : watch("typeOfCustody") || "",
              onChange: (value: string) => setValue("typeOfCustody", value),
              validation: { required: tHearingTopics("typeOfCustody") },
              showWhen: "RLRAHI1",
            }
          );
        } else if (effectiveTypeOfRequest?.value === "RLRAHI2") {
          console.log('[🔧 RLRAHI-1 FORM] Adding loanAmount field for RLRAHI2');
          console.log('[🔧 RLRAHI-1 FORM] editTopic?.LoanAmount:', editTopic?.LoanAmount);
          console.log('[🔧 RLRAHI-1 FORM] editTopic?.loanAmount:', editTopic?.loanAmount);
          fields.push({
            type: "input",
            name: "loanAmount",
            label: tHearingTopics("loanAmount"),
            inputType: "number",
            min: 0,
            value: isEditing ? editTopic?.LoanAmount || editTopic?.loanAmount : watch("loanAmount") || "",
            onChange: (value: string) => setValue("loanAmount", value),
            validation: { required: tHearingTopics("loanAmount") },
            notRequired: false,
          });
        }

        return buildForm(addNoSpacesValidationToTextInputs(fields, tHearingTopics));

      case "RUF-1":
        console.log('[🔧 RUF-1 FORM] editTopic data:', editTopic);
        console.log('[🔧 RUF-1 FORM] editTopic?.RefundType:', editTopic?.RefundType);
        console.log('[🔧 RUF-1 FORM] editTopic?.Amount:', editTopic?.Amount);
        console.log('[🔧 RUF-1 FORM] editTopic?.refundAmount:', editTopic?.refundAmount);
        return buildForm(addNoSpacesValidationToTextInputs([
          {
            type: "input",
            name: "RefundType",
            label: tHearingTopics("refundType"),
            inputType: "text",
            value: isEditing ? editTopic?.RefundType || watch("RefundType") || "" : watch("RefundType") || "",
            onChange: (value: string) => setValue("RefundType", value),
            validation: { required: tHearingTopics("refundType") },
            notRequired: false,
          },
          {
            type: "input",
            name: "refundAmount", // Changed from "amount" to "refundAmount"
            label: tHearingTopics("amount"),
            inputType: "number",
            min: 0,
            value: isEditing ? editTopic?.Amount || editTopic?.refundAmount || editTopic?.amount || watch("refundAmount") || "" : watch("refundAmount") || "",
            onChange: (value: string) => setValue("refundAmount", value),
            validation: { required: tHearingTopics("amount") },
            notRequired: false,
          },
        ], tHearingTopics));

      case "EDO-1":
        return buildForm([
          {
            type: "autocomplete",
            name: "fromLocation",
            label: tHearingTopics("fromLocation"),
            options: RegionOptions,
            isLoading: isRegionLoading,
            value: watch("fromLocation")?.value || editTopic?.fromLocation?.value,
            onChange: (option: Option | null) => setValue("fromLocation", option),
            validation: { required: tHearingTopics("fromLocation") },
            notRequired: false,
          },
          {
            type: "autocomplete",
            name: "toLocation",
            label: tHearingTopics("toLocation"),
            options: RegionOptions,
            isLoading: isRegionLoading,
            value: watch("toLocation")?.value || editTopic?.toLocation?.value,
            onChange: (option: Option | null) => setValue("toLocation", option),
            validation: { required: tHearingTopics("toLocation") },
            notRequired: false,
          },
          {
            type: "custom",
            name: "managerial_decision_date_hijri",
            component: (
              <HijriDatePickerInput
                control={control}
                name="managerial_decision_date_hijri"
                label={tHearingTopics("managerialDecisionDateHijri")}
                rules={{ required: tHearingTopics("managerialDecisionDateHijri") }}
                onChangeHandler={(date, onChange) =>
                  handleHijriDateChange(date, onChange, "managerial_decision_date_gregorian")
                }
                notRequired={false}
              />
            ),
          },
          {
            type: "custom",
            name: "managerial_decision_date_gregorian",
            component: (
              <GregorianDateDisplayInput
                control={control}
                name="managerial_decision_date_gregorian"
                label={tHearingTopics("managerialDecisionDateGregorian")}
                notRequired={false}
              />
            ),
          },
          {
            type: "input",
            name: "managerialDecisionNumber",
            label: tHearingTopics("managerialDecisionNumber"),
            inputType: "number",
            value: watch("managerialDecisionNumber") || "",
            onChange: (value) => setValue("managerialDecisionNumber", value),
            validation: { required: tHearingTopics("managerialDecisionNumber") },
            notRequired: false,
          },
        ]);

      default:
        return [];
    }
  };

  const step3: any = {
    gridCols: 2,
    ...(getFormBySubCategory().filter(Boolean).length > 0
      ? {
        title: tHearingTopics("topics_data"),
        children: [
          ...(getFormBySubCategory().filter(Boolean) as FormElement[]),
          ...getCommonElements(isValid), // Only show when there's content
        ],
      }
      : {
        children: [
          ...getCommonElements(true),
        ],
      }),
  };

  const layout: SectionLayout[] = [];
  if (!isEditing) layout.push(step1);
  if (showLegalSection || isEditing ? !isEditing : isEditing)
    layout.push(step2);
  if (showTopicData || isEditing) layout.push(step3);
  return layout;
};
