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
import {
  formatHijriDate,
  mapToOptions,
  toHijri_YYYYMMDD,
  formatDateString,
  formatDateToYYYYMMDD,
} from "@/shared/lib/helpers";
import { getMIR1FormFields } from "./MIR1Form";
import { getBPSR1FormFields } from "./BPSR1Form";
import { getBR1FormFields } from "./BR1Form";
import { isOtherAllowance } from "../utils/isOtherAllowance";
import { getStep1FormFields } from "./Step1From";
import { getStep2FormFields } from "./Step2From";
import { HijriDatePickerInput } from "@/shared/components/calanders/HijriDatePickerInput";
import { GregorianDateDisplayInput } from "@/shared/components/calanders/GregorianDateDisplayInput";
import { DateObject } from "react-multi-date-picker";
import hijriCalendar from "react-date-object/calendars/arabic";
import gregorianCalendar from "react-date-object/calendars/gregorian";
import hijriLocale from "react-date-object/locales/arabic_en";
import gregorianLocale from "react-date-object/locales/gregorian_en";
import { useGetRegionLookupDataQuery } from "@/features/initiate-hearing/api/create-case/workDetailApis";
import { useTranslation } from "react-i18next";
import { createNumberOnlyValidation, handleNumberOnlyChange } from "@/shared/lib/formUtils";

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
  payIncreaseTypeData,
  isValid: isValid,
  control: control,
  trigger,
  lockAccommodationSource = false,
  errors,
}: UseFormLayoutParams & { trigger: (fields: string | string[]) => void, lockAccommodationSource?: boolean, errors?: any, payIncreaseTypeData?: any }): SectionLayout[] => {
  const { t: tHearingTopics, i18n } = useTranslation("hearingtopics");

  const PayIncreaseTypeOptions = React.useMemo(() => {
    return payIncreaseTypeData?.DataElements?.map((item: any) => ({
      value: item.ElementKey,
      label: item.ElementValue,
    })) || [];
  }, [payIncreaseTypeData]);

  const { data: regionData, isFetching: isRegionLoading } =
    useGetRegionLookupDataQuery({
      AcceptedLanguage: i18n.language.toUpperCase(),
      context: "worker",
    });

  const RegionOptions = React.useMemo(() => {
    return mapToOptions({
      data: regionData?.DataElements,
    });
  }, [regionData]);

  const from_date_hijri = watch("from_date_hijri");
  const travelingWay = watch("travelingWay");
  const to_date_hijri = watch("to_date_hijri");
  const date_hijri = watch("date_hijri");
  const subCategoryValue = watch("subCategory");
  const amount = watch("amount");
  const injury_date_hijri = watch("injury_date_hijri");
  const currentPosition = watch("currentPosition");
  const theWantedJob = watch("theWantedJob");
  const rewardType = watch("rewardType");
  const consideration = watch("consideration");
  const forAllowance = watch("forAllowance");
  const typeOfRequest = watch("typeOfRequest");
  const otherAllowance = watch("otherAllowance");
  const commissionType = watch("commissionType");
  const accordingToAgreement = watch("accordingToAgreement");
  const amountsPaidFor = watch("amountsPaidFor");
  const kindOfHoliday = watch("kindOfHoliday");
  const compensationAmount = watch("compensationAmount");
  const injuryType = watch("injuryType");
  const theAmountRequired = watch("theAmountRequired");
  const totalAmount = watch("totalAmount");
  const typesOfPenalties = watch("typesOfPenalties");
  const requiredJobTitle = watch("requiredJobTitle");
  const currentJobTitle = watch("currentJobTitle");
  const workingHours = watch("workingHours");
  const additionalDetails = watch("additionalDetails");
  const wagesAmount = watch("wagesAmount");
  const payIncreaseType = watch("payIncreaseType");
  const wageDifference = watch("wageDifference");
  const newPayAmount = watch("newPayAmount");
  const durationOfLeaveDue = watch("durationOfLeaveDue");
  const payDue = watch("payDue");
  const amountOfCompensation = watch("amountOfCompensation");
  const doesBylawsIncludeAddingAccommodations = watch(
    "doesBylawsIncludeAddingAccommodations"
  );
  const doesContractIncludeAddingAccommodations = watch(
    "doesContractIncludeAddingAccommodations"
  );
  const doesTheInternalRegulationIncludePromotionMechanism = watch(
    "doesTheInternalRegulationIncludePromotionMechanism"
  );
  const doesContractIncludeAdditionalUpgrade = watch(
    "doesContractIncludeAdditionalUpgrade"
  );
  const managerial_decision_date_hijri = watch(
    "managerial_decision_date_hijri"
  );
  const managerial_decision_date_gregorian = watch(
    "managerial_decision_date_gregorian"
  );

  const handleHijriDateChange = (
    date: DateObject | DateObject[] | null,
    setHijriValue: (value: string) => void,
    gregorianFieldName: string
  ) => {
    if (!date || Array.isArray(date)) {
      setHijriValue("");
      setValue(gregorianFieldName, "");
      return;
    }

    const hijri = date.convert(hijriCalendar, hijriLocale).format("YYYY/MM/DD");
    const gregorian = date
      .convert(gregorianCalendar, gregorianLocale)
      .format("YYYY/MM/DD");

    const hijriCompact = hijri ? formatDateToYYYYMMDD(hijri) || "" : "";
    const gregorianCompact = gregorian
      ? formatDateToYYYYMMDD(gregorian) || ""
      : "";

    setHijriValue(hijriCompact);
    setValue(gregorianFieldName, gregorianCompact);
  };

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

  const ForAllowanceOptions = React.useMemo(() => {
    return mapToOptions({
      data: forAllowanceData?.DataElements,
    });
  }, [forAllowanceData]);

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

  const step1: SectionLayout = {
    gridCols: 2,
    className: "step1",
    children: getStep1FormFields({
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
        setValue("subCategoryData", []);
        setValue("subCategoryOptions", []);
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
    }),
  };

  const step2Children: (FormElement | false)[] = getStep2FormFields({
    t,
    isEditing,
    mainCategory,
    subCategory,
    subTopicsLoading,
    matchedSubCategory,
    acknowledged,
    showTopicData,
    handleAcknowledgeChange,
  });

  const step2: SectionLayout = {
    gridCols: 2,
    className: "step2",
    children: step2Children.filter(Boolean) as FormElement[],
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
            validate: (value: string) => value.trim().length > 0 || tHearingTopics('fieldRequired'),
          },
        };
      }
      return field;
    });
  }

  const getFormBySubCategory = (): (FormElement | false)[] => {
    const currentSubCategory = isEditing
      ? subCategory?.value
      : subCategoryValue?.value;
    if (!currentSubCategory) {
      return [];
    }

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
      case "WR-2":
      case "WR-1":
        const baseFields = [
          {
            type: "input" as const,
            name: "wageAmount",
            label: t("amount"),
            inputType: "text" as const,
            value: watch("wageAmount") || "",
            onChange: (value: string) => handleNumberOnlyChange(value, setValue, "wageAmount"),
            validation: createNumberOnlyValidation(true, tHearingTopics('fieldRequired')),
            notRequired: false,
            numberOnly: true,
          },
          {
            type: "custom",
            component: (
              <div className="flex flex-col gap-2">
                <HijriDatePickerInput
                  control={control}
                  name="from_date_hijri"
                  label={t("fromDateHijri")}
                  rules={{ required: tHearingTopics('fieldRequired') }}
                  notRequired={false}
                  onChangeHandler={(date, onChange) =>
                    handleHijriDateChange(
                      date,
                      onChange,
                      "from_date_gregorian"
                    )
                  }
                  isDateOfBirth={currentSubCategory === "WR-2"}
                />
                <GregorianDateDisplayInput
                  control={control}
                  name="from_date_gregorian"
                  label={t("fromDateGregorian")}
                  notRequired={false}
                />
              </div>
            ),
          },
          {
            type: "custom",
            component: (
              <div className="flex flex-col gap-2">
                <HijriDatePickerInput
                  control={control}
                  name="to_date_hijri"
                  label={t("toDateHijri")}
                  rules={{ required: tHearingTopics('fieldRequired') }}
                  notRequired={false}
                  onChangeHandler={(date, onChange) =>
                    handleHijriDateChange(
                      date,
                      onChange,
                      "to_date_gregorian"
                    )
                  }
                  isDateOfBirth={currentSubCategory === "WR-2"}

                />
                <GregorianDateDisplayInput
                  control={control}
                  name="to_date_gregorian"
                  label={t("toDateGregorian")}
                  notRequired={false}
                />
              </div>
            ),
          },
        ];
        const shouldShowAllowanceFields =
          watch("subCategory")?.value === "WR-1" ||
          subCategory?.value === "WR-1";

        const allowanceFields = shouldShowAllowanceFields
          ? [
            {
              type: "autocomplete" as const,
              name: "forAllowance",
              label: t("forAllowance"),
              options: ForAllowanceOptions,
              value: watch("forAllowance")?.value,
              onChange: (option: Option | null) => {
                setValue("forAllowance", option);
                // Clear otherAllowance when changing from "Other" to something else
                if (!isOtherAllowance(option)) {
                  setValue("otherAllowance", "");
                }
                // Trigger validation for otherAllowance when option changes
                if (typeof trigger === 'function') trigger(["otherAllowance"]);
              },
              validation: { required: tHearingTopics('fieldRequired') },
              notRequired: false,
            },
            ...(isOtherAllowance(watch("forAllowance")) ||
              (isEditing && isOtherAllowance({ value: editTopic?.ForAllowance, label: editTopic?.ForAllowance }))
              ? [
                {
                  type: "input" as const,
                  name: "otherAllowance",
                  label: t("otherAllowance"),
                  inputType: "text" as const,
                  value: isEditing
                    ? editTopic?.OtherAllowance || editTopic?.otherAllowance
                    : watch("otherAllowance") || "",
                  onChange: (value: string) => {
                    setValue("otherAllowance", value);
                    // Trigger validation immediately when user types
                    if (typeof trigger === 'function') trigger("otherAllowance");
                  },
                  validation: { required: tHearingTopics('fieldRequired') },
                  notRequired: false,
                },
              ]
              : []),
          ]
          : [];

        return buildForm(addNoSpacesValidationToTextInputs([...baseFields, ...allowanceFields], t));
      case "MIR-1":
        return buildForm(
          getMIR1FormFields({
            t,
            typeOfRequest,
            setValue,
            TypeOfRequestLookUpOptions,
            isEditing,
            watch,
            editTopic,
            trigger,
          })
        );
      case "BPSR-1":
        return buildForm(
          getBPSR1FormFields({
            t,
            commissionType,
            accordingToAgreement,
            setValue,
            CommissionTypeLookUpOptions,
            AccordingToAgreementLookupLookUpOptions,
            isEditing,
            watch,
            editTopic,
            control,
            handleHijriDateChange,
            trigger,
          })
        );
      case "BR-1":
        return buildForm(
          getBR1FormFields({
            t,
            accordingToAgreement,
            setValue,
            AccordingToAgreementLookupLookUpOptions,
            isEditing,
            watch,
            editTopic,
            control,
            handleHijriDateChange,
          })
        );

      case "CMR-1":
        return buildForm(addNoSpacesValidationToTextInputs([
          {
            type: "autocomplete",
            name: "amountsPaidFor",
            label: t("amountsPaidFor"),
            options: AmountPaidLookupLookUpOptions,
            value: isEditing ? editTopic?.amountsPaidFor : watch("amountsPaidFor"),
            onChange: (option: Option | null) => setValue("amountsPaidFor", option),
            validation: {
              required: tHearingTopics('fieldRequired'),
              validate: (val: any) =>
                (val && typeof val === 'object' && !!val.value) || tHearingTopics('fieldRequired')
            },
            notRequired: false,
            invalidFeedback: errors?.amountsPaidFor?.message,
            control,
          },
          {
            type: "input",
            name: "theAmountRequired",
            label: t("theAmountRequired"),
            inputType: "text",
            value: isEditing ? editTopic?.theAmountRequired : watch("theAmountRequired") || "",
            onChange: (value: string) => handleNumberOnlyChange(value, setValue, "theAmountRequired"),
            validation: createNumberOnlyValidation(true, tHearingTopics('fieldRequired')),
            notRequired: false,
            invalidFeedback: errors?.theAmountRequired?.message,
            control,
            numberOnly: true,
          },
        ], t));
      case "CMR-3":
        return buildForm(
          addNoSpacesValidationToTextInputs([
            {
              type: "input",
              name: "compensationAmount",
              label: t("compensationAmount"),
              inputType: "text",
              value: isEditing ? editTopic?.compensationAmount : watch("compensationAmount") || "",
              onChange: (value: string) => handleNumberOnlyChange(value, setValue, "compensationAmount"),
              validation: createNumberOnlyValidation(true, tHearingTopics('fieldRequired')),
              notRequired: false,
              invalidFeedback: errors?.compensationAmount?.message,
              control,
              numberOnly: true,
            },
            {
              type: "custom",
              component: (
                <div className="flex flex-col gap-2">
                  <HijriDatePickerInput
                    control={control}
                    name="injury_date_hijri"
                    label={t("injuryDateHijri")}
                    rules={{ required: tHearingTopics('fieldRequired') }}
                    notRequired={false}
                    onChangeHandler={(date, onChange) =>
                      handleHijriDateChange(date, onChange, "injury_date_gregorian")
                    }
                    isDateOfBirth={true}
                  />
                  <GregorianDateDisplayInput
                    control={control}
                    name="injury_date_gregorian"
                    label={t("injuryDateGregorian")}
                    notRequired={false}
                  />
                </div>
              ),
            },
            {
              type: "input",
              name: "injuryType",
              label: t("injuryType"),
              inputType: "text",
              value: isEditing ? editTopic?.injuryType : watch("injuryType") || "",
              onChange: (value: string) => setValue("injuryType", value),
              validation: { required: tHearingTopics('fieldRequired') },
              notRequired: false,
              invalidFeedback: errors?.injuryType?.message,
              control,
            },
          ], t)
        );

      case "CMR-4":
        return buildForm(
          addNoSpacesValidationToTextInputs(
            [
              {
                type: "input",
                name: "noticeCompensationAmount", // Changed from "amount" to "noticeCompensationAmount"
                label: t("amount"),
                inputType: "text",
                value: isEditing ? editTopic?.amount : watch("noticeCompensationAmount") || "",
                onChange: (value: string) => handleNumberOnlyChange(value, setValue, "noticeCompensationAmount"),
                validation: createNumberOnlyValidation(true, tHearingTopics("fieldRequired")),
                notRequired: false,
                invalidFeedback: errors?.noticeCompensationAmount?.message,
                control,
                numberOnly: true,
              },
            ],
            t
          )
        );


      case "CMR-5":
        return buildForm(
          addNoSpacesValidationToTextInputs(
            [
              {
                type: "autocomplete",
                name: "kindOfHoliday",
                label: t("kindOfHoliday"),
                options: LeaveTypeLookUpOptions,
                value: isEditing ? editTopic?.kindOfHoliday : watch("kindOfHoliday"),
                onChange: (opt: Option | null) => setValue("kindOfHoliday", opt),
                validation: {
                  required: tHearingTopics("fieldRequired"),
                  validate: (val: any) =>
                    (val && typeof val === "object" && !!val.value) ||
                    tHearingTopics("fieldRequired"),
                },
                notRequired: false,
                invalidFeedback: errors?.kindOfHoliday?.message,
                control,
              },
              {
                type: "input",
                name: "totalAmount",
                label: t("totalAmount"),
                inputType: "text",
                value: isEditing ? editTopic?.totalAmount : watch("totalAmount") || "",
                onChange: (v: string) => handleNumberOnlyChange(v, setValue, "totalAmount"),
                validation: createNumberOnlyValidation(true, tHearingTopics("fieldRequired")),
                notRequired: false,
                invalidFeedback: errors?.totalAmount?.message,
                control,
                numberOnly: true,
              },
              {
                type: "input",
                name: "workingHours",
                label: t("workingHours"),
                inputType: "text",
                value: isEditing ? editTopic?.workingHours : watch("workingHours") || "",
                onChange: (v: string) => handleNumberOnlyChange(v, setValue, "workingHours"),
                validation: createNumberOnlyValidation(true, tHearingTopics("fieldRequired")),
                notRequired: false,
                invalidFeedback: errors?.workingHours?.message,
                control,
                numberOnly: true,
              },
              {
                type: "input",
                name: "additionalDetails",
                label: t("additionalDetails"),
                inputType: "textarea",
                value: isEditing ? editTopic?.additionalDetails : watch("additionalDetails") || "",
                onChange: (v: string) => setValue("additionalDetails", v),
                validation: { required: tHearingTopics("fieldRequired") },
                notRequired: false,
                invalidFeedback: errors?.additionalDetails?.message,
                control,
                colSpan: 2, // give textarea full width
              },
            ],
            t
          )
        );

      case "CMR-8":
        return buildForm(addNoSpacesValidationToTextInputs([
          {
            type: "input",
            name: "wagesAmount",
            label: t("wagesAmount"),
            inputType: "text",
            value: isEditing ? editTopic?.wagesAmount : watch("wagesAmount") || "",
            onChange: (value: string) => handleNumberOnlyChange(value, setValue, "wagesAmount"),
            validation: createNumberOnlyValidation(true, tHearingTopics('fieldRequired')),
            notRequired: false,
            numberOnly: true,
          },
          {
            type: "custom",
            component: (
              <div className="flex flex-col gap-2">
                <HijriDatePickerInput
                  control={control}
                  name="from_date_hijri"
                  label={t("fromDateHijri")}
                  rules={{ required: tHearingTopics('fieldRequired') }}
                  notRequired={false}
                  onChangeHandler={(date, onChange) =>
                    handleHijriDateChange(date, onChange, "from_date_gregorian")
                  }
                />
                <GregorianDateDisplayInput
                  control={control}
                  name="from_date_gregorian"
                  label={t("fromDateGregorian")}
                  notRequired={false}
                />
              </div>
            ),
          },
          {
            type: "custom",
            component: (
              <div className="flex flex-col gap-2">
                <HijriDatePickerInput
                  control={control}
                  name="to_date_hijri"
                  label={t("toDateHijri")}
                  rules={{ required: tHearingTopics('fieldRequired') }}
                  notRequired={false}
                  onChangeHandler={(date, onChange) =>
                    handleHijriDateChange(date, onChange, "to_date_gregorian")
                  }
                />
                <GregorianDateDisplayInput
                  control={control}
                  name="to_date_gregorian"
                  label={t("toDateGregorian")}
                  notRequired={false}
                />
              </div>
            ),
          },
        ], t));
      case "CMR-6":
        return buildForm(addNoSpacesValidationToTextInputs([
          {
            type: "input",
            name: "newPayAmount",
            label: t("newPayAmount"),
            inputType: "text",
            value: isEditing ? editTopic?.newPayAmount : watch("newPayAmount") || "",
            onChange: (v: string) => handleNumberOnlyChange(v, setValue, "newPayAmount"),
            validation: createNumberOnlyValidation(true, tHearingTopics("fieldRequired")),
            notRequired: false,
            invalidFeedback: errors?.newPayAmount?.message,
            control,
            numberOnly: true,
          },
          {
            type: "autocomplete",
            name: "payIncreaseType",
            label: t("payIncreaseType"),
            options: PayIncreaseTypeOptions,
            value: isEditing ? editTopic?.payIncreaseType : watch("payIncreaseType"),
            onChange: (opt: Option | null) => setValue("payIncreaseType", opt),
            validation: {
              required: tHearingTopics("fieldRequired"),
              validate: (val: any) =>
                (val && typeof val === "object" && !!val.value) || tHearingTopics("fieldRequired"),
            },
            notRequired: false,
            invalidFeedback: errors?.payIncreaseType?.message,
            control,
          },
          {
            type: "custom",
            component: (
              <div className="flex flex-col gap-2">
                <HijriDatePickerInput
                  control={control}
                  name="from_date_hijri"
                  label={t("fromDateHijri")}
                  rules={{ required: tHearingTopics("fieldRequired") }}
                  notRequired={false}
                  onChangeHandler={(date, onChange) =>
                    handleHijriDateChange(date, onChange, "from_date_gregorian")
                  }
                />
                <GregorianDateDisplayInput
                  control={control}
                  name="from_date_gregorian"
                  label={t("fromDateGregorian")}
                  notRequired={false}
                />
              </div>
            ),
          },
          {
            type: "custom",
            component: (
              <div className="flex flex-col gap-2">
                <HijriDatePickerInput
                  control={control}
                  name="to_date_hijri"
                  label={t("toDateHijri")}
                  rules={{ required: tHearingTopics("fieldRequired") }}
                  notRequired={false}
                  onChangeHandler={(date, onChange) =>
                    handleHijriDateChange(date, onChange, "to_date_gregorian")
                  }
                />
                <GregorianDateDisplayInput
                  control={control}
                  name="to_date_gregorian"
                  label={t("toDateGregorian")}
                  notRequired={false}
                />
              </div>
            ),
          },
          {
            type: "input",
            name: "wageDifference",
            label: t("wageDifference"),
            inputType: "text",
            value: isEditing ? editTopic?.wageDifference : watch("wageDifference") || "",
            onChange: (v: string) => setValue("wageDifference", v),
            validation: { required: tHearingTopics("fieldRequired") },
            notRequired: false,
            invalidFeedback: errors?.wageDifference?.message,
            control,
          },
        ], t));

      case "CMR-7":
        return buildForm(addNoSpacesValidationToTextInputs([
          {
            type: "custom",
            component: (
              <div className="flex flex-col gap-2">
                <HijriDatePickerInput
                  control={control}
                  name="from_date_hijri"
                  label={t("fromDateHijri")}
                  rules={{ required: tHearingTopics('fieldRequired') }}
                  notRequired={false}
                  onChangeHandler={(date, onChange) =>
                    handleHijriDateChange(date, onChange, "from_date_gregorian")
                  }
                  isDateOfBirth={true}
                />
                <GregorianDateDisplayInput
                  control={control}
                  name="from_date_gregorian"
                  label={t("fromDateGregorian")}
                  notRequired={false}
                />
              </div>
            ),
          },
          {
            type: "custom",
            component: (
              <div className="flex flex-col gap-2">
                <HijriDatePickerInput
                  control={control}
                  name="to_date_hijri"
                  label={t("toDateHijri")}
                  rules={{ required: tHearingTopics('fieldRequired') }}
                  notRequired={false}
                  onChangeHandler={(date, onChange) =>
                    handleHijriDateChange(date, onChange, "to_date_gregorian")
                  }
                  isDateOfBirth={true}
                />
                <GregorianDateDisplayInput
                  control={control}
                  name="to_date_gregorian"
                  label={t("toDateGregorian")}
                  notRequired={false}
                />
              </div>
            ),
          },
          {
            type: "input",
            name: "durationOfLeaveDue",
            label: t("durationOfLeaveDue"),
            inputType: "text",
            value: isEditing ? editTopic?.durationOfLeaveDue : watch("durationOfLeaveDue") || "",
            onChange: (value: string) => setValue("durationOfLeaveDue", value),
            validation: { required: tHearingTopics('fieldRequired') },
            notRequired: false,
          },
          {
            type: "input",
            name: "payDue",
            label: t("payDue"),
            inputType: "text",
            value: isEditing ? editTopic?.payDue : watch("payDue") || "",
            onChange: (value: string) => handleNumberOnlyChange(value, setValue, "payDue"),
            validation: createNumberOnlyValidation(true, tHearingTopics('fieldRequired')),
            notRequired: false,
            numberOnly: true,
          },
        ], t));
      case "LCUT-1":
        return buildForm(addNoSpacesValidationToTextInputs([
          {
            type: "input",
            name: "amountOfCompensation",
            label: t("amountOfCompensation"),
            inputType: "text",
            value: watch("amountOfCompensation") || "",
            onChange: (value: string) => handleNumberOnlyChange(value, setValue, "amountOfCompensation"),
            validation: createNumberOnlyValidation(true, tHearingTopics('fieldRequired')),
            notRequired: false,
            numberOnly: true,
          },
        ], t));
      case "EDO-1":
        return buildForm(addNoSpacesValidationToTextInputs([
          {
            type: "autocomplete",
            name: "fromLocation",
            label: t("fromLocation"),
            options: RegionOptions,
            isLoading: isRegionLoading,
            value:
              watch("fromLocation")?.value || editTopic?.fromLocation?.value,
            onChange: (option: Option | null) =>
              setValue("fromLocation", option),
            validation: { required: tHearingTopics('fieldRequired') },
            notRequired: false,
          },
          {
            type: "autocomplete",
            name: "toLocation",
            label: t("toLocation"),
            options: RegionOptions,
            isLoading: isRegionLoading,
            value: watch("toLocation")?.value || editTopic?.toLocation?.value,
            onChange: (option: Option | null) => setValue("toLocation", option),
            validation: { required: tHearingTopics('fieldRequired') },
            notRequired: false,
          },
          {
            type: "custom",
            component: (
              <div className="flex flex-col gap-2">
                <HijriDatePickerInput
                  control={control}
                  name="managerial_decision_date_hijri"
                  label={t("managerialDecisionDateHijri")}
                  rules={{ required: tHearingTopics('fieldRequired') }}
                  notRequired={false}
                  onChangeHandler={(date, onChange) =>
                    handleHijriDateChange(
                      date,
                      onChange,
                      "managerial_decision_date_gregorian"
                    )
                  }
                />
                <GregorianDateDisplayInput
                  control={control}
                  name="managerial_decision_date_gregorian"
                  label={t("managerialDecisionDateGregorian")}
                  notRequired={false}
                />
              </div>
            ),
          },
          {
            type: "input",
            name: "managerialDecisionNumber",
            label: t("managerialDecisionNumber"),
            inputType: "text",
            value: watch("managerialDecisionNumber") || "",
            onChange: (value: string) =>
              handleNumberOnlyChange(value, setValue, "managerialDecisionNumber"),
            validation: createNumberOnlyValidation(true, tHearingTopics('fieldRequired')),
            notRequired: false,
            numberOnly: true,
          },
        ], t));
      case "EDO-2":
        return buildForm(addNoSpacesValidationToTextInputs([
          {
            type: "input",
            name: "fromJob",
            label: t("fromJob"),
            inputType: "text",
            value: "",
            onChange: (value: string) => setValue("fromJob", value),
            validation: { required: tHearingTopics('fieldRequired') },
            notRequired: false,
          },
          {
            type: "input",
            name: "toJob",
            label: t("toJob"),
            inputType: "text",
            value: "",
            onChange: (value: string) => setValue("toJob", value),
            validation: { required: tHearingTopics('fieldRequired') },
            notRequired: false,
          },
          {
            type: "custom",
            component: (
              <div className="flex flex-col gap-2">
                <HijriDatePickerInput
                  control={control}
                  name="managerial_decision_date_hijri"
                  label={t("managerialDecisionDateHijri")}
                  rules={{ required: tHearingTopics('fieldRequired') }}
                  notRequired={false}
                  onChangeHandler={(date, onChange) =>
                    handleHijriDateChange(
                      date,
                      onChange,
                      "managerial_decision_date_gregorian"
                    )
                  }
                />
                <GregorianDateDisplayInput
                  control={control}
                  name="managerial_decision_date_gregorian"
                  label={t("managerialDecisionDateGregorian")}
                  notRequired={false}
                />
              </div>
            ),
          },
          {
            type: "input",
            name: "managerialDecisionNumber",
            label: t("managerialDecisionNumber"),
            inputType: "text",
            value: watch("managerialDecisionNumber") || "",
            onChange: (value: string) =>
              handleNumberOnlyChange(value, setValue, "managerialDecisionNumber"),
            validation: createNumberOnlyValidation(true, tHearingTopics('fieldRequired')),
            notRequired: false,
            numberOnly: true,
          },
        ], t));
      case "EDO-4":
        return buildForm(addNoSpacesValidationToTextInputs([
          {
            type: "autocomplete",
            name: "typesOfPenalties",
            label: t("typesOfPenalties"),
            options: TypesOfPenaltiesOptions,
            value: watch("typesOfPenalties")?.value,
            onChange: (option: Option | null) =>
              setValue("typesOfPenalties", option),
            validation: { required: tHearingTopics('fieldRequired') },
            notRequired: false,
          },
          {
            type: "custom",
            component: (
              <div className="flex flex-col gap-2">
                <HijriDatePickerInput
                  control={control}
                  name="managerial_decision_date_hijri"
                  label={t("managerialDecisionDateHijri")}
                  rules={{ required: tHearingTopics('fieldRequired') }}
                  notRequired={false}
                  onChangeHandler={(date, onChange) =>
                    handleHijriDateChange(
                      date,
                      onChange,
                      "managerial_decision_date_gregorian"
                    )
                  }
                />
                <GregorianDateDisplayInput
                  control={control}
                  name="managerial_decision_date_gregorian"
                  label={t("managerialDecisionDateGregorian")}
                  notRequired={false}
                />
              </div>
            ),
          },
          {
            type: "input",
            name: "managerialDecisionNumber",
            label: t("managerialDecisionNumber"),
            inputType: "text",
            value: watch("managerialDecisionNumber") || "",
            onChange: (value: string) =>
              handleNumberOnlyChange(value, setValue, "managerialDecisionNumber"),
            validation: createNumberOnlyValidation(true, tHearingTopics('fieldRequired')),
            notRequired: false,
            numberOnly: true,
          },
        ], t));
      case "EDO-3":
        return buildForm(addNoSpacesValidationToTextInputs([
          {
            type: "input",
            name: "amountOfReduction",
            label: t("amountOfReduction"),
            inputType: "text",
            value: watch("amountOfReduction") || "",
            onChange: (value: string) => handleNumberOnlyChange(value, setValue, "amountOfReduction"),
            validation: createNumberOnlyValidation(true, tHearingTopics('fieldRequired')),
            notRequired: false,
            numberOnly: true,
          },
          {
            type: "custom",
            component: (
              <div className="flex flex-col gap-2">
                <HijriDatePickerInput
                  control={control}
                  name="managerial_decision_date_hijri"
                  label={t("managerialDecisionDateHijri")}
                  rules={{ required: tHearingTopics('fieldRequired') }}
                  notRequired={false}
                  onChangeHandler={(date, onChange) =>
                    handleHijriDateChange(
                      date,
                      onChange,
                      "managerial_decision_date_gregorian"
                    )
                  }
                />
                <GregorianDateDisplayInput
                  control={control}
                  name="managerial_decision_date_gregorian"
                  label={t("managerialDecisionDateGregorian")}
                  notRequired={false}
                />
              </div>
            ),
          },
          {
            type: "input",
            name: "managerialDecisionNumber",
            label: t("managerialDecisionNumber"),
            inputType: "text",
            value: watch("managerialDecisionNumber") || "",
            onChange: (value: string) =>
              handleNumberOnlyChange(value, setValue, "managerialDecisionNumber"),
            validation: createNumberOnlyValidation(true, tHearingTopics('fieldRequired')),
            notRequired: false,
            numberOnly: true,
          },
        ], t));
      case "HIR-1": {
        // Determine the initial value for the radio in edit mode
        let accommodationSourceValue = watch("accommodationSource");
        if (isEditing && editTopic) {
          if (editTopic.doesBylawsIncludeAddingAccommodations) {
            accommodationSourceValue = "bylaws";
          } else if (editTopic.doesContractIncludeAddingAccommodations) {
            accommodationSourceValue = "contract";
          }
        }
        // Prefill dependent fields in edit mode
        const housingSpecificationInByLaws = isEditing && editTopic && editTopic.housingSpecificationInByLaws !== undefined
          ? editTopic.housingSpecificationInByLaws
          : watch("housingSpecificationInByLaws") || "";
        const housingSpecificationsInContract = isEditing && editTopic && editTopic.housingSpecificationsInContract !== undefined
          ? editTopic.housingSpecificationsInContract
          : watch("housingSpecificationsInContract") || "";
        const actualHousingSpecifications = isEditing && editTopic && editTopic.actualHousingSpecifications !== undefined
          ? editTopic.actualHousingSpecifications
          : watch("actualHousingSpecifications") || "";
        // Only show the selected radio in edit mode
        const radioOptions = isEditing && accommodationSourceValue
          ? [
            accommodationSourceValue === "bylaws"
              ? { label: t("doesBylawsIncludeAddingAccommodations"), value: "bylaws" }
              : { label: t("doesContractIncludeAddingAccommodations"), value: "contract" }
          ]
          : [
            { label: t("doesBylawsIncludeAddingAccommodations"), value: "bylaws" },
            { label: t("doesContractIncludeAddingAccommodations"), value: "contract" }
          ];
        return buildForm(addNoSpacesValidationToTextInputs([
          {
            type: "radio",
            name: "accommodationSource",
            options: radioOptions,
            value: accommodationSourceValue || "",
            onChange: (value: string) => {
              setValue("accommodationSource", value);
              setValue("doesBylawsIncludeAddingAccommodations", value === "bylaws");
              setValue("doesContractIncludeAddingAccommodations", value === "contract");
              // Reset dependent fields
              if (value === "bylaws") {
                setValue("housingSpecificationsInContract", "");
                setValue("actualHousingSpecifications", "");
              } else if (value === "contract") {
                setValue("housingSpecificationInByLaws", "");
              }
              if (trigger) trigger(["accommodationSource"]);
            },
            validation: { required: tHearingTopics('fieldRequired') },
            notRequired: false,
            colSpan: 2,
          },
          (accommodationSourceValue === "bylaws") && {
            type: "input",
            name: "housingSpecificationInByLaws",
            label: t("housingSpecificationInByLaws"),
            inputType: "text",
            value: housingSpecificationInByLaws,
            onChange: (value: string) => setValue("housingSpecificationInByLaws", value),
            validation: { required: tHearingTopics('fieldRequired') },
            notRequired: false,
            colSpan: 1,
          },
          (accommodationSourceValue === "contract") && {
            type: "input",
            name: "housingSpecificationsInContract",
            label: t("housingSpecificationsInContract"),
            inputType: "text",
            value: housingSpecificationsInContract,
            onChange: (value: string) => setValue("housingSpecificationsInContract", value),
            validation: { required: tHearingTopics('fieldRequired') },
            notRequired: false,
            colSpan: 1,
          },
          (accommodationSourceValue === "contract") && {
            type: "input",
            name: "actualHousingSpecifications",
            label: t("actualHousingSpecifications"),
            inputType: "text",
            value: actualHousingSpecifications,
            onChange: (value: string) => setValue("actualHousingSpecifications", value),
            validation: { required: tHearingTopics('fieldRequired') },
            notRequired: false,
            colSpan: 1,
          },
        ], t));
      }

      case "JAR-2":
        return buildForm(addNoSpacesValidationToTextInputs([
          {
            type: "input",
            name: "currentJobTitle",
            label: t("currentJobTitle"),
            inputType: "text",
            value: watch("currentJobTitle") || "",
            onChange: (value: string) => setValue("currentJobTitle", value),
            validation: { required: tHearingTopics('fieldRequired') },
            notRequired: false,
          },
          {
            type: "input",
            name: "requiredJobTitle",
            label: t("requiredJobTitle"),
            inputType: "text",
            value: watch("requiredJobTitle") || "",
            onChange: (value: string) => setValue("requiredJobTitle", value),
            validation: { required: tHearingTopics('fieldRequired') },
            notRequired: false,
          },
        ], t));
      case "JAR-3": {
        // Determine the initial value for the radio in edit mode
        let promotionSourceValue = watch("promotionSource");
        if (isEditing && editTopic) {
          // Check both the new format and the original case data format
          const hasInternalRegulation = editTopic.doesTheInternalRegulationIncludePromotionMechanism !== undefined 
            ? editTopic.doesTheInternalRegulationIncludePromotionMechanism 
            : editTopic.PromotionMechanism === "Yes";
          
          const hasContractUpgrade = editTopic.doesContractIncludeAdditionalUpgrade !== undefined 
            ? editTopic.doesContractIncludeAdditionalUpgrade 
            : editTopic.AdditionalUpgrade === "Yes";
          
          if (hasInternalRegulation) {
            promotionSourceValue = "internalRegulation";
          } else if (hasContractUpgrade) {
            promotionSourceValue = "contract";
          }
        }

        // Always show both options, but pre-select the current value
        const radioOptions = [
          { label: t("doesTheInternalRegulationIncludePromotionMechanism"), value: "internalRegulation" },
          { label: t("doesContractIncludeAdditionalUpgrade"), value: "contract" },
        ];

        return buildForm(addNoSpacesValidationToTextInputs([
          {
            type: "radio",
            name: "promotionSource",
            options: radioOptions,
            value: promotionSourceValue || "",
            onChange: (value: string) => {
              setValue("promotionSource", value);
              setValue("doesTheInternalRegulationIncludePromotionMechanism", value === "internalRegulation");
              setValue("doesContractIncludeAdditionalUpgrade", value === "contract");
              if (trigger) trigger(["promotionSource"]);
            },
            validation: { required: tHearingTopics('fieldRequired') },
            notRequired: false,
            colSpan: 2,
          },
        ], t));
      }
      case "JAR-4":
        return buildForm(addNoSpacesValidationToTextInputs([
          {
            type: "input",
            name: "currentPosition",
            label: t("currentPosition"),
            inputType: "text",
            value: watch("currentPosition") || "",
            onChange: (value: string) => setValue("currentPosition", value),
            validation: { required: tHearingTopics('fieldRequired') },
            notRequired: false,
          },
          {
            type: "input",
            name: "theWantedJob",
            label: t("theWantedJob"),
            inputType: "text",
            value: watch("theWantedJob") || "",
            onChange: (value: string) => setValue("theWantedJob", value),
            validation: { required: tHearingTopics('fieldRequired') },
            notRequired: false,
          },
        ], t));
      case "LRESR-1":
        return buildForm(addNoSpacesValidationToTextInputs([
          {
            type: "input",
            name: "endOfServiceRewardAmount", // Changed from "amount" to "endOfServiceRewardAmount"
            label: t("amount"),
            inputType: "text",
            value: watch("endOfServiceRewardAmount") || "",
            onChange: (value: string) => handleNumberOnlyChange(value, setValue, "endOfServiceRewardAmount"),
            validation: createNumberOnlyValidation(true, tHearingTopics('fieldRequired')),
            notRequired: false,
            numberOnly: true,
          },
        ], t));
      case "TTR-1":
        return buildForm(addNoSpacesValidationToTextInputs([
          {
            type: "autocomplete" as const,
            name: "travelingWay",
            label: t("travelingWay"),
            options: TravelingWayOptions,
            value: travelingWay,
            onChange: (option: Option | null) =>
              setValue("travelingWay", option),
            validation: { required: tHearingTopics('fieldRequired') },
            notRequired: false,
          },
        ], t));
      case "RFR-1":
        return buildForm(addNoSpacesValidationToTextInputs([
          {
            type: "input",
            name: "rewardRequestAmount", // Changed from "amount" to "rewardRequestAmount"
            label: t("amount"),
            inputType: "text",
            value: watch("rewardRequestAmount") || "",
            onChange: (value: string) => handleNumberOnlyChange(value, setValue, "rewardRequestAmount"),
            validation: createNumberOnlyValidation(true, tHearingTopics('fieldRequired')),
            notRequired: false,
            numberOnly: true,
          },
          {
            type: "input",
            name: "consideration",
            label: t("consideration"),
            inputType: "text",
            value: watch("consideration") || "",
            onChange: (value: string) => setValue("consideration", value),
            validation: { required: tHearingTopics('fieldRequired') },
            notRequired: false,
          },
          {
            type: "custom",
            component: (
              <div className="flex flex-col gap-2">
                <HijriDatePickerInput
                  control={control}
                  name="date_hijri"
                  label={t("dateHijri")}
                  rules={{
                    required: true,
                  }}
                  onChangeHandler={(date, onChange) =>
                    handleHijriDateChange(date, onChange, "date_gregorian")
                  }
                  isDateOfBirth={true}

                />
                <GregorianDateDisplayInput
                  control={control}
                  name="date_gregorian"
                  label={t("gregorianDate")}
                />
              </div>
            ),
          },
        ], t));
      case "RR-1":
        return buildForm(addNoSpacesValidationToTextInputs([
          {
            type: "input",
            name: "rewardAmount", // Changed from "amount" to "rewardAmount"
            label: t("amount"),
            inputType: "text",
            value: watch("rewardAmount") || "",
            onChange: (value: string) => handleNumberOnlyChange(value, setValue, "rewardAmount"),
            validation: createNumberOnlyValidation(true, tHearingTopics('fieldRequired')),
            notRequired: false,
            numberOnly: true,
          },
          {
            type: "input",
            name: "rewardType",
            label: t("rewardType"),
            inputType: "text",
            value: watch("rewardType") || "",
            onChange: (value: string) => setValue("rewardType", value),
            validation: { required: tHearingTopics('fieldRequired') },
            notRequired: false,
          },
        ], t));
      default:
        return [];
    }
  };

  const step3: any = {
    gridCols: 2,
    className: "step3",
    ...(getFormBySubCategory().filter(Boolean).length > 0
      ? {
        title: t("topics_data"),
        children: [
          ...(getFormBySubCategory().filter(Boolean) as FormElement[]),
          ...getCommonElements(isValid),
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
