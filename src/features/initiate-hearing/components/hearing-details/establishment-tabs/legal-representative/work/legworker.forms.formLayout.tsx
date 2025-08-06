import {
  UseFormSetValue,
  UseFormWatch,
  Control,
  UseFormTrigger,
  Controller,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
// import HijriDateField from "@/shared/components/calanders/NewDatePicker";
import { HijriDatePickerInput } from "@/shared/components/calanders/HijriDatePickerInput";
import { GregorianDateDisplayInput } from "@/shared/components/calanders/GregorianDateDisplayInput";
// import DatePicker, { DateObject } from "react-multi-date-picker";
import hijriCalendar from "react-date-object/calendars/arabic";
import gregorianCalendar from "react-date-object/calendars/gregorian";
import gregorianLocaleAr from "react-date-object/locales/gregorian_ar";
import gregorianLocaleEn from "react-date-object/locales/gregorian_en";

import {
  Option,
  SectionLayout,
  FormData,
} from "@/shared/components/form/form.types";
import React, { useEffect, useState } from "react";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import {
  useGetLaborOfficeLookupDataQuery,
  useGetWorkerCityLookupDataQuery,
  useGetWorkerRegionLookupDataQuery,
} from "@/features/initiate-hearing/api/create-case/plaintiffDetailsApis";
import {
  useGetSalaryTypeLookupQuery,
  useLazyGetContractTypeLookupQuery,
  useLazyGetExtractEstablishmentDataQuery,
} from "@/features/initiate-hearing/api/create-case/workDetailApis";
import { DateObject } from "react-multi-date-picker";
import { useFormResetContext } from "@/providers/FormResetProvider";
import { formatDateString, formatDateToYYYYMMDD } from "@/shared/lib/helpers";
import hijriLocale from "react-date-object/locales/arabic_ar";
import { GregorianDatePickerInput } from "@/shared/components/calanders/GregorianDatePickerInput";

// Utility to convert Arabic-Indic numerals to Western numerals
function toWesternDigits(str: string): string {
  return str.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString());
}

export const legRepVsWorkerUseFormLayout = (
  setValue: UseFormSetValue<FormData>,
  control: Control<FormData>,
  watch: UseFormWatch<FormData>,
  caseDetailsLoading?: boolean,
  workData?: any
): SectionLayout[] => {
  const { resetField } = useFormResetContext();
  const isStillEmployed: any = watch("isStillEmployed" as any);
  const { t, i18n } = useTranslation("hearingdetails");
  const { t: tPlaceholder } = useTranslation("placeholder");
  const { t: stellworking } = useTranslation("common");
  const selectedWorkerRegion = watch("jobLocation");
  const selectedWorkerCity = watch("jobLocationCity");
  // jobLocation?: Option | null;
  // jobLocationCity?: Option | null;
  const currentLanguage = i18n.language.toUpperCase();
  const contractType: any = watch("contractType");

  // Add state tracking for manual selections
  const [prevSelectedWorkerRegion, setPrevSelectedWorkerRegion] =
    useState(selectedWorkerRegion);
  const [hasManuallySelectedCity, setHasManuallySelectedCity] = useState(false);
  const [idNumberPlainteff, setIdNumberPlainteff] = useState<string>("");
  const [fileNumberEst, setFileNumberEst] = useState<string>("");
  const [deffendentTypCode, setDeffendentTypCode] = useState<string>("");

  //#region PreFillData If Exist
  const [isPreFill, setIsPreFill] = useState<boolean>(false);

  function setFormFieldsFromWorkData(setValue: UseFormSetValue<FormData>, workData: any) {
    if (!workData) return;

    console.log("the prefill Data ", workData);

    if (workData?.salary) setValue("salary", workData?.salary, { shouldValidate: true });
    if (workData?.contractNumber) setValue("contractNumber", workData?.contractNumber);

    if (workData?.typeOfWage && workData?.typeOfWage !== null) setValue("typeOfWage", workData?.typeOfWage, { shouldValidate: true });
    if (workData?.contractType && workData?.contractType !== null) setValue("contractType", workData?.contractType, { shouldValidate: true });

    if (workData?.jobLocation && workData?.jobLocation !== null) setValue("jobLocation", workData?.jobLocation, { shouldValidate: true });
    if (workData?.jobCity && workData?.jobCity !== null) setValue("jobLocationCity", workData?.jobCity, { shouldValidate: true });
    if (workData?.laborOffice && workData?.laborOffice !== null) setValue("laborOffice", workData?.laborOffice, { shouldValidate: true });

    if (
      workData?.contractStart
      && workData?.contractStart?.hijri
      && workData?.contractStart?.hijri !== ""
      && workData?.contractStart?.gregorian
      && workData?.contractStart?.gregorian !== ""
    ) {
      setValue("contractDateHijri", workData?.contractStart?.hijri, { shouldValidate: true });
      setValue("contractDateGregorian", workData?.contractStart?.gregorian, { shouldValidate: true });
    }

    if (
      workData?.contractEnd
      && workData?.contractEnd?.hijri
      && workData?.contractEnd?.hijri !== ""
      && workData?.contractEnd?.gregorian
      && workData?.contractEnd?.gregorian !== ""
    ) {

      setValue("contractExpiryDateHijri", workData?.contractEnd?.hijri, { shouldValidate: true });
      setValue("contractExpiryDateGregorian", workData?.contractEnd?.gregorian, { shouldValidate: true });
    }


    if (
      workData?.stillWorking
      && workData?.stillWorking?.value
      && workData?.stillWorking?.value !== ""
      && workData?.stillWorking?.label
      && workData?.stillWorking?.label !== ""
    ) {
      setValue("isStillEmployed", workData?.stillWorking?.value === "SW1", { shouldValidate: true });
    }

    if (
      workData?.jobStart
      && workData?.jobStart?.gregorian
      && workData?.jobStart?.gregorian !== ""
    ) {
      setValue("dateOfFirstWorkingDayGregorian", workData?.jobStart?.gregorian, { shouldValidate: true });
    }


    if (
      workData?.jobEnd
      && workData?.jobEnd?.gregorian
      && workData?.jobEnd?.gregorian !== ""
    ) {
      setValue("dateOfLastWorkingDayGregorian", workData?.jobEnd?.gregorian, { shouldValidate: true });
    }



    setIsPreFill(true)

  }

  useEffect(() => {
    if (workData) {
      setFormFieldsFromWorkData(setValue, workData);
    }
  }, [workData]);

  //#endregion PreFillData If Exist

  //#region Calling The Required Lockups

  const { data: salaryTypeData } = useGetSalaryTypeLookupQuery({
    AcceptedLanguage: i18n.language.toUpperCase(),
  });

  const [getCookie] = useCookieState({ caseId: "" });
  const userType = getCookie("userType") || "";
  const defendantStatus = getCookie("defendantStatus") || "";
  const legalRepType = getCookie("legalRepType");

  const [
    triggerContractType,
    { data: contractTypeData, isFetching: isContractTypeLoading },
  ] = useLazyGetContractTypeLookupQuery();

  useEffect(() => {
    triggerContractType({
      userType,
      legalRepType,
      defendantStatus: deffendentTypCode,
      AcceptedLanguage: currentLanguage,
    });
  }, [
    deffendentTypCode,
    userType,
    legalRepType,
    currentLanguage,
    triggerContractType,
  ]);

  useEffect(() => {
    // Guard: only clear if region has changed to a valid new value
    // AND the user hasn't manually selected a jobLocationCity
    if (
      selectedWorkerRegion &&
      typeof selectedWorkerRegion === "object" &&
      "value" in selectedWorkerRegion &&
      !hasManuallySelectedCity
    ) {
      // Only clear if the region actually changed
      if (selectedWorkerRegion !== prevSelectedWorkerRegion) {
        setValue("jobLocationCity", null);
        setValue("laborOffice", null);
        // resetField("jobLocationCity");
        // resetField("laborOffice");
        setPrevSelectedWorkerRegion(selectedWorkerRegion);
      }
    } else if (selectedWorkerRegion !== prevSelectedWorkerRegion) {
      // If region changed but user has manually selected jobLocationCity, just update the previous region
      setPrevSelectedWorkerRegion(selectedWorkerRegion);
    }
  }, [
    selectedWorkerRegion,
    hasManuallySelectedCity,
    prevSelectedWorkerRegion,
  ]);

  // for cleaning if the region is reselected 
  useEffect(() => {
    if (!selectedWorkerRegion) {
      setValue("jobLocationCity", null);
      setValue("laborOffice", null);
      // resetField("jobLocationCity");
      // resetField("laborOffice");
      setHasManuallySelectedCity(false);
    }
  }, [selectedWorkerRegion]);

  const { data: regionData, isFetching: isRegionLoading } =
    useGetWorkerRegionLookupDataQuery(
      {
        AcceptedLanguage: i18n.language.toUpperCase(),
        SourceSystem: "E-Services",
        ModuleKey: "JobLocation",
        ModuleName: "JobLocation",
      },
      {
        // Prevent refetching during save operations
        refetchOnMountOrArgChange: false,
        refetchOnFocus: false,
        refetchOnReconnect: false,
      }
    );

  const { data: cityData, isFetching: isCityLoading } =
    useGetWorkerCityLookupDataQuery(
      {
        AcceptedLanguage: i18n.language.toUpperCase(),
        SourceSystem: "E-Services",
        selectedWorkerRegion:
          typeof selectedWorkerRegion === "object"
            ? selectedWorkerRegion?.value
            : selectedWorkerRegion || "",
        ModuleName: "JobLocationCity",
      },
      {
        skip: !(typeof selectedWorkerRegion === "object"
          ? selectedWorkerRegion?.value
          : selectedWorkerRegion),
        // Prevent refetching during save operations
        refetchOnMountOrArgChange: false,
        refetchOnFocus: false,
        refetchOnReconnect: false,
      }
    );

  const { data: laborOfficeData, isFetching: isLaborLoading } =
    useGetLaborOfficeLookupDataQuery(
      {
        AcceptedLanguage: i18n.language.toUpperCase(),
        SourceSystem: "E-Services",
        selectedWorkerCity:
          typeof selectedWorkerCity === "object"
            ? selectedWorkerCity?.value
            : selectedWorkerCity || "",
      },
      {
        skip: !(typeof selectedWorkerCity === "object"
          ? selectedWorkerCity?.value
          : selectedWorkerCity),
        // Prevent refetching during save operations
        refetchOnMountOrArgChange: false,
        refetchOnFocus: false,
        refetchOnReconnect: false,
      }
    );

  // Set Tel Office NameAffter Select The jobLocationCity
  useEffect(() => {
    if (!isLaborLoading &&
      laborOfficeData &&
      laborOfficeData?.DataElements &&
      laborOfficeData?.DataElements?.length !== 0
    ) {
      setValue("laborOffice", {
        value: laborOfficeData?.DataElements?.[0]?.ElementKey || "",
        label: laborOfficeData?.DataElements?.[0]?.ElementValue || "",
      });
    }
  }, [laborOfficeData, isLaborLoading, selectedWorkerRegion, selectedWorkerCity]);

  const TypeOfWageOptions = React.useMemo(() => {
    if (!salaryTypeData?.DataElements) return [];
    return salaryTypeData.DataElements.map((item: any) => ({
      value: item.ElementKey,
      label: item.ElementValue,
    }));
  }, [salaryTypeData]);

  const ContractTypeOptions = React.useMemo(() => {
    if (!contractTypeData?.DataElements) return [];
    return contractTypeData.DataElements.map((item: any) => ({
      value: item.ElementKey,
      label: item.ElementValue,
    }));
  }, [contractTypeData]);

  const RegionOptions = React.useMemo(() => {
    if (!regionData?.DataElements) return [];
    return regionData.DataElements.map((item: any) => ({
      value: item.ElementKey,
      label: item.ElementValue,
    }));
  }, [regionData]);

  const CityOptions = React.useMemo(() => {
    console.log("the jobLocationCity apis loockups ", cityData?.DataElements);
    console.log("the jobLocationCity apis loockups ", workData?.jobCity
    );
    if (!cityData?.DataElements) return [];
    return cityData.DataElements.map((item: any) => ({
      value: item.ElementKey,
      label: item.ElementValue,
    }));
  }, [cityData]);

  //#endregion Calling The Required Lockups

  //#region Dates Validations

  // Add watchers for dependent fields
  const contractExpiryDateHijri = watch("contractExpiryDateHijri");
  const contractDateHijri = watch("contractDateHijri");
  const dateofFirstworkingdayHijri = watch("dateofFirstworkingdayHijri");
  const dateoflastworkingdayHijri = watch("dateoflastworkingdayHijri");

  // Add debug logs to all setValue calls for date fields outside prefill as well
  const handleHijriDateChange = (
    date: DateObject | DateObject[] | null,
    setHijriValue: (value: string) => void,
    gregorianFieldName: keyof FormData
  ) => {
    if (!date || Array.isArray(date)) {
      setHijriValue("");
      setValue(gregorianFieldName, "");
      console.log(
        `setValue ${gregorianFieldName} (handleHijriDateChange cleared)`,
        "",
        new Error().stack
      );
      return;
    }

    const hijri = date.convert(hijriCalendar, hijriLocale).format("YYYY/MM/DD");
    const hijriStorage = hijri.replace(/\//g, ""); // Store as YYYYMMDD
    const gregorian = date
      .convert(gregorianCalendar, gregorianLocale)
      .format("YYYY/MM/DD");

    setHijriValue(hijriStorage);
    setValue(gregorianFieldName, gregorian);
    console.log(
      `setValue ${gregorianFieldName} (handleHijriDateChange set)`,
      gregorian,
      new Error().stack
    );
  };

  const getGregorianFromHijri = (dateStr: string | undefined): Date => {
    if (!dateStr) return new Date(0);
    return new DateObject({
      date: dateStr,
      calendar: hijriCalendar,
      locale: hijriLocale,
      format: "YYYY/MM/DD",
    })
      .convert(gregorianCalendar, gregorianLocale)
      .toDate();
  };

  const validateDate = (
    value: string,
    type: string,
    relatedStartDate?: string | undefined,
    relatedEndDate?: string | undefined
  ): true | string => {
    value = toWesternDigits(value); // Always normalize to Western numerals
    if (!value || typeof value !== "string") {
      return t("fieldRequired");
    }

    const isValidPattern = /^\d{8}$/.test(value);
    if (!isValidPattern) return t("dateValidationDesc");

    const hijriDate = new DateObject({
      date: value,
      calendar: hijriCalendar,
      locale: hijriLocale,
      format: "YYYY/MM/DD",
    });

    const selected = hijriDate
      .convert(gregorianCalendar, gregorianLocale)
      .toDate();
    selected.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (type) {
      case "contract-start":
        if (selected > today)
          return t("contractDateValidation.startDateFuture");
        break;

      case "contract-end":
        if (relatedStartDate) {
          const startDate = getGregorianFromHijri(relatedStartDate);
          startDate.setHours(0, 0, 0, 0);
          if (selected < startDate)
            return t("contractDateValidation.endBeforeStart");
        }
        break;

      case "work-start":
        if (selected > today) return t("workDateValidation.startDateFuture");
        break;

      case "work-end":
        if (selected > today) return t("workDateValidation.endDateFuture");
        if (relatedStartDate) {
          const startDate = getGregorianFromHijri(relatedStartDate);
          startDate.setHours(0, 0, 0, 0);
          if (selected < startDate)
            return t("workDateValidation.endBeforeStart");
        }
        break;
    }

    const result = true;
    return result;
  };
  //#endregion Dates Validations

  //#region Get Job Datails From APIS

  useEffect(() => {
    if (caseDetailsLoading) {
      const id = JSON.parse(
        localStorage.getItem("CaseDetails") || ""
      )?.PlaintiffId;
      const fileNumberEstData =
        JSON.parse(localStorage.getItem("CaseDetails") || "")
          ?.DefendantType_Code === "Establishment"
          ? JSON.parse(localStorage.getItem("CaseDetails") || "")
            ?.DefendantEstFileNumber
          : "";
      setIdNumberPlainteff(id);
      setFileNumberEst(fileNumberEstData);
      setDeffendentTypCode(
        JSON.parse(localStorage.getItem("CaseDetails") || "")
          ?.DefendantType_Code
      );
    }
  }, [caseDetailsLoading]);
  const [
    triggerExtractData,
    { data: extractedData, isLoading: isExtractDataLoading },
  ] = useLazyGetExtractEstablishmentDataQuery();
  useEffect(() => {
    if (idNumberPlainteff !== "" && fileNumberEst !== "") {
      triggerExtractData({
        WorkerID: idNumberPlainteff,
        AcceptedLanguage: i18n.language.toUpperCase(),
        FileNumber: fileNumberEst,
        CaseID: getCookie("caseId"),
      });
    }
  }, [idNumberPlainteff, fileNumberEst]);

  useEffect(() => {
    if (
      extractedData &&
      extractedData?.EstablishmentData &&
      extractedData?.EstablishmentData?.length > 0
    ) {


      setValue(
        "dateOfFirstWorkingDayGregorian",
        extractedData?.EstablishmentData?.[0]?.ServiceStartDate.substring(0, 8)
      );
      setValue(
        "dateOfLastWorkingDayGregorian",
        extractedData?.EstablishmentData?.[0]?.ServiceEndDate.substring(0, 8)
      );
      setValue(
        "isStillEmployed",
        extractedData?.EstablishmentData?.[0]?.StillWorking === "Y"
          ? true
          : false
      );
    }
  }, [extractedData]);

  //#endregion Get Job Datails From APIS

  useEffect(() => {
    if (
      isPreFill &&
      workData?.jobCity &&
      workData?.jobCity.value &&
      CityOptions.length > 0
    ) {
      const found = CityOptions.find((opt: any) => opt?.value === workData?.jobCity?.value);
      if (found) {
        setValue("jobLocationCity", found, { shouldValidate: true });
      }
    }
  }, [CityOptions, workData, isPreFill, setValue]);
  const isArabic = i18n.language === "ar";
  const gregorianLocale = isArabic ? gregorianLocaleAr : gregorianLocaleEn;
  return [
    {
      title: t("tab3_title"),
      className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
      gridCols: 3,
      children: [
        {
          type: "autocomplete",
          name: "typeOfWage",
          label: t("typeOfWage"),
          options: TypeOfWageOptions,
          onChange: (value: Option) => {
            setValue("typeOfWage", value);
          },
          validation: { required: t("salaryTypeValidation") },
          ...(workData &&
            workData?.typeOfWage &&
            workData?.typeOfWage.label !== "" &&
            workData?.typeOfWage.value !== "" && {
            autoSelectValue: workData.typeOfWage,
          }),
        },
        {
          type: "input",
          name: "salary",
          label: t("currentSalary"),
          inputType: "number",
          placeholder: tPlaceholder("salary"),
          validation: { 
            required: t("currentSalaryValidation") ,
            maxLength: { value: 6, message: t("max6ValidationDig") },
            pattern: { value: /^\d{0,6}$/, message: t("max6ValidationDesc")},
          },
        },
        {
          type: "autocomplete",
          name: "contractType",
          label: t("contractType"),
          options: ContractTypeOptions,
          onChange: (value: Option) => setValue("contractType", value),
          notRequired: true,
          // validation: { required: t("contractTypeValidation") },
          ...(workData &&
            workData?.contractType &&
            workData?.contractType.label !== "" &&
            workData?.contractType.value !== "" && {
            autoSelectValue: workData.contractType,
          }),
        },
        {
          type: "input",
          name: "contractNumber",
          label: t("contractNumber"),
          inputType: "number",
          placeholder: tPlaceholder("id"),
          notRequired: true,
          validation: {
            maxLength: { value: 10, message: t("max10Validation") },
            pattern: { value: /^\d{0,10}$/, message: t("max10ValidationDesc") },
          },
        },
        {
          type: "custom",
          name: "contractDateHijri",
          component: (
            <HijriDatePickerInput
              control={control}
              name={"contractDateHijri" as keyof FormData}
              label={t("contractDateHijri")}
              rules={{
                required: t("fieldRequired"),
                validate: (value: string) =>
                  validateDate(
                    value,
                    "contract-start",
                    contractDateHijri,
                    contractExpiryDateHijri
                  ),
              }}
              onChangeHandler={(date, onChange) => {
                if (!date || Array.isArray(date)) {
                  setValue("contractDateGregorian", "");
                  onChange("");
                  return;
                }
                onChange(date.format("YYYYMMDD"));
                const gregorian = date
                  .convert(gregorianCalendar, gregorianLocaleEn)
                  .format("YYYYMMDD");
                setValue("contractDateGregorian", gregorian);
              }}
              isDateOfBirth={true}
            />
          ),
        },
        {
          type: "custom",
          name: "contractDateGregorian",
          component: (
            <GregorianDateDisplayInput
              control={control}
              name={"contractDateGregorian" as keyof FormData}
              label={t("contractDateGregorian")}
            />
          ),
        },

        ...(!(
          ContractTypeOptions?.length === 2 &&
          contractType &&
          contractType?.value === "CT2"
        )
          ? [
            {
              type: "custom",
              name: "contractExpiryDateHijri",
              component: (
                <HijriDatePickerInput
                  control={control}
                  name={"contractExpiryDateHijri" as keyof FormData}
                  label={t("contractExpiryDateHijri")}
                  rules={{
                    required: t("fieldRequired"),
                    validate: (value: string) =>
                      validateDate(
                        value,
                        "contract-end",
                        contractDateHijri,
                        contractExpiryDateHijri
                      ),
                  }}
                  onChangeHandler={(date, onChange) => {
                    if (!date || Array.isArray(date)) {
                      setValue("contractExpiryDateGregorian", "");
                      onChange("");
                      return;
                    }
                    onChange(date.format("YYYYMMDD"));
                    const gregorian = date
                      .convert(gregorianCalendar, gregorianLocaleEn)
                      .format("YYYYMMDD");
                    setValue("contractExpiryDateGregorian", gregorian);
                  }}
                />
              ),
            },
            {
              type: "custom",
              name: "contractExpiryDateGregorian",
              component: (
                <GregorianDateDisplayInput
                  control={control}
                  name={"contractExpiryDateGregorian" as keyof FormData}
                  label={t("contractExpiryDateGregorian")}
                />
              ),
            },
          ]
          : []),

        ...(extractedData &&
          extractedData?.EstablishmentData &&
          extractedData?.EstablishmentData?.length > 0
          ? [
            {
              type: "readonly",
              label: t("stillEmployed"),
              value:
                extractedData?.EstablishmentData?.[0]?.StillWorking === "Y"
                  ? stellworking("incomplete_case.yes")
                  : stellworking("incomplete_case.no"),
            },
            {
              type: "readonly",
              label: t("dateofFirstworkingdayGregorian"),
              value: formatDateString(
                extractedData?.EstablishmentData?.[0]?.ServiceStartDate?.slice(
                  0,
                  8
                )
              ),
            },

            ...(!isStillEmployed
              ? [
                {
                  type: "readonly",
                  label: t("dateofLastworkingdayGregorian"),
                  value: formatDateString(
                    extractedData?.EstablishmentData?.[0]?.ServiceEndDate?.slice(
                      0,
                      8
                    )
                  ),
                },
              ]
              : []),
          ]
          : [
            {
              type: "checkbox",
              name: "isStillEmployed",
              label: t("stillEmployed"),
              checked: isStillEmployed,
              onChange: (checked: boolean) =>
                setValue("isStillEmployed" as any, checked),
            },



            {
              type: "custom",
              name: "dateOfFirstWorkingDayGregorian",
              component: (
                <GregorianDatePickerInput
                  control={control}
                  name={"dateOfFirstWorkingDayGregorian" as keyof FormData}
                  label={t("dateofFirstworkingdayGregorian")}
                  isDateOfBirth={true}
                  rules={{
                    required: t("fieldRequired"),
                    // Add any additional validation as needed
                  }}
                  onChangeHandler={(date, onChange) => {
                    if (!date || Array.isArray(date)) {
                      onChange("");
                      return;
                    }
                    onChange(date.format("YYYYMMDD"));
                  }}
                />
              ),
            },




            ...(!isStillEmployed
              ? [
                {
                  type: "custom",
                  name: "dateOfLastWorkingDayGregorian",
                  component: (
                    <GregorianDatePickerInput
                      control={control}
                      name={"dateOfLastWorkingDayGregorian" as keyof FormData}
                      label={t("dateofLastworkingdayGregorian")}
                      rules={{
                        required: t("fieldRequired"),
                        // Add any additional validation as needed
                      }}
                      onChangeHandler={(date, onChange) => {
                        if (!date || Array.isArray(date)) {
                          onChange("");
                          return;
                        }
                        onChange(date.format("YYYYMMDD"));
                      }}
                    />
                  ),
                },

              ]
              : []),
          ]),
      ],
    },
    {
      title: t("workLocationDetails"),
      children: [
        {
          type: "autocomplete",
          name: "jobLocation",
          isLoading: isRegionLoading,
          label: t("region"),
          options: RegionOptions,
          onChange: (value: Option) => {
            setValue("jobLocation", value);
            setValue("jobLocationCity", null);
            setValue("laborOffice", null);
            setPrevSelectedWorkerRegion(value);
            setHasManuallySelectedCity(false);
          },
          validation: { required: t("regionValidation") },
          ...(workData &&
            workData?.jobLocation &&
            workData?.jobLocation.label !== "" &&
            workData?.jobLocation.value !== "" && {
            autoSelectValue: workData.jobLocation,
          }),
        },
        {
          type: "autocomplete",
          name: "jobLocationCity",
          isLoading: isCityLoading,
          label: t("city"),
          options: CityOptions,
          disabled: !watch("jobLocation"),
          value: watch("jobLocation") ? watch("jobLocationCity") : null,
          // value: watch("jobLocationCity") ?? null,

          onChange: (value: Option) => {
            setValue("jobLocationCity", value);
            if (!value) {
              setValue("laborOffice", null);
              // resetField("laborOffice");
            }
            setHasManuallySelectedCity(!!value);
          },
          validation: { required: t("cityValidation") },
          ...(!isCityLoading && isPreFill &&
            workData &&
            workData?.jobCity &&
            workData?.jobCity.label !== "" &&
            workData?.jobCity.value !== "" && {
            autoSelectValue: workData.jobCity,
          }),
        },
        {
          title: t(""),
          isLoading: isLaborLoading,
          type: "readonly",
          name: "laborOffice",
          label: t("nicDetails.nearestOffice"),
          value: watch("laborOffice") &&
            laborOfficeData?.DataElements &&
            laborOfficeData.DataElements.length > 0
            ? laborOfficeData.DataElements[0].ElementValue
            : "",
        },
      ],
    },
  ] as SectionLayout[];
};
