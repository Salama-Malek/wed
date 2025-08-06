import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { SectionLayout, FormData } from "@/shared/components/form/form.types";
import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import { genderData } from "@/mock/genderData";
import { options } from "@/features/initiate-hearing/config/Options";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetGenderLookupDataQuery, useGetNationalityLookupDataQuery, useGetNICDetailsQuery, useGetOccupationLookupDataQuery, useGetWorkerCityLookupDataQuery, useGetWorkerRegionLookupDataQuery } from "@/features/initiate-hearing/api/create-case/plaintiffDetailsApis";
import { useNICServiceErrorContext } from "@/shared/context/NICServiceErrorContext";
import { useLazyGetCaseDetailsQuery } from "@/features/manage-hearings/api/myCasesApis";
import { toast } from "react-toastify";
import useCaseDetailsPrefill from "@/features/initiate-hearing/hooks/useCaseDetailsPrefill";
import { formatDateToYYYYMMDD } from "@/shared/utils/dateUtils";
import { toWesternDigits, isHijriDateInFuture } from '@/shared/lib/helpers';
import { HijriDatePickerInput } from "@/shared/components/calanders/HijriDatePickerInput";
import { GregorianDateDisplayInput } from "@/shared/components/calanders/GregorianDateDisplayInput";
import hijriCalendar from "react-date-object/calendars/arabic";
import hijriLocale from "react-date-object/locales/arabic_ar";
import gregorianCalendar from "react-date-object/calendars/gregorian";
import gregorianLocaleEn from "react-date-object/locales/gregorian_en";

interface EstablishmentDefendantFormLayoutProps {
  setValue?: UseFormSetValue<FormData>;
  watch?: UseFormWatch<FormData>;
  applicantType?: string;
  data?: any;
  nationalIdNumber?: any
}

export const useLegelDefendantFormLayout = ({
  setValue,
  watch,
  control
}: any): SectionLayout[] => {
  const { t, i18n } = useTranslation("hearingdetails");
  const [getCookie, setCookie] = useCookieState();

  //#region Hassan Work Here
  const selectedWorkerRegion2 = watch("region");
  const [isValidCallNic, setIsValidCallNic] = useState<boolean>(false);
  const watchNationalId = watch?.("nationalIdNumber");
  const watchDateOfBirth = watch?.("def_date_hijri");
  const caseId = getCookie("caseId");
  const userType = getCookie("userType");
  const userClaims = getCookie("userClaims");
  const mainCategory = getCookie("mainCategory")?.value;
  const subCategory = getCookie("subCategory")?.value;

  // Add state to track if form has been initialized
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  // NIC Service Error handling
  const handleTryAgain = React.useCallback(() => {
    // Refetch NIC query by triggering a re-render
    setIsValidCallNic(false);
    setTimeout(() => setIsValidCallNic(true), 100);
  }, []);

  const { handleNICResponse, setTryAgainCallback } = useNICServiceErrorContext();

  // Set the try again callback when component mounts
  React.useEffect(() => {
    setTryAgainCallback(handleTryAgain);
  }, [setTryAgainCallback, handleTryAgain]);

  // Lookups Apis Calls  
  const { data: regionData, isLoading: isRegionLoading } = useGetWorkerRegionLookupDataQuery({
    AcceptedLanguage: i18n.language === "ar" ? "AR" : "EN",
    SourceSystem: "E-Services",
    ModuleKey: "WorkerRegion",
    ModuleName: "WorkerRegion",
  });

  const { data: cityData, isLoading: isCityLoading } = useGetWorkerCityLookupDataQuery(
    {
      AcceptedLanguage: i18n.language === "ar" ? "AR" : "EN",
      SourceSystem: "E-Services",
      selectedWorkerRegion: typeof selectedWorkerRegion2 === 'object' ? selectedWorkerRegion2?.value : selectedWorkerRegion2 || "",
      ModuleName: "WorkerCity",
    },
    { skip: !(typeof selectedWorkerRegion2 === 'object' ? selectedWorkerRegion2?.value : selectedWorkerRegion2) }
  );

  const { data: occupationData } = useGetOccupationLookupDataQuery({
    AcceptedLanguage: i18n.language === "ar" ? "AR" : "EN",
    SourceSystem: "E-Services",
  });

  const { data: genderData } = useGetGenderLookupDataQuery({
    AcceptedLanguage: i18n.language === "ar" ? "AR" : "EN",
    SourceSystem: "E-Services",
  });

  const { data: nationalityData } = useGetNationalityLookupDataQuery({
    AcceptedLanguage: i18n.language === "ar" ? "AR" : "EN",
    SourceSystem: "E-Services",
  });

  // Case Details API call
  const [triggerCaseDetailsQuery, { data: caseDetailsData, error: caseDetailsError }] = useLazyGetCaseDetailsQuery();

  // NIC Details API call
  const {
    data: nicData,
    isSuccess: nicIsSuccess,
    isFetching: nicIsLoading,
    isError,
  } = useGetNICDetailsQuery(
    watchNationalId && watchDateOfBirth
      ? {
        IDNumber: watchNationalId,
        DateOfBirth: toWesternDigits(formatDateToYYYYMMDD(watchDateOfBirth) || ""),
        AcceptedLanguage: i18n.language === "ar" ? "AR" : "EN",
        SourceSystem: "E-Services",
      }
      : skipToken,
    {
      skip: !isValidCallNic || isHijriDateInFuture(formatDateToYYYYMMDD(watchDateOfBirth) || "")
    }
  );

  const disableNicFields = !isValidCallNic || nicIsLoading;

  // Fetch case details if caseId exists - only once when component mounts
  useEffect(() => {
    if (caseId && userType === "Legal representative" && !isFormInitialized && !hasAttemptedFetch) {
      const userConfigs: any = {
        Worker: {
          UserType: userType,
          IDNumber: userClaims?.UserID,
        },
        Establishment: {
          UserType: userType,
          IDNumber: userClaims?.UserID,
          FileNumber: userClaims?.File_Number,
        },
        "Legal representative": {
          UserType: userType,
          IDNumber: userClaims?.UserID,
          MainGovernment: mainCategory || "",
          SubGovernment: subCategory || "",
        },
      };

      triggerCaseDetailsQuery({
        ...userConfigs[userType],
        CaseID: caseId,
        AcceptedLanguage: userClaims?.AcceptedLanguage?.toUpperCase() || "EN",
        SourceSystem: "E-Services",
      });
      setHasAttemptedFetch(true);
    }
  }, [caseId, userType, userClaims, mainCategory, subCategory, triggerCaseDetailsQuery, isFormInitialized, hasAttemptedFetch]);

  // Show error toast if case details fetch fails
  useEffect(() => {
    if (caseDetailsError) {
      toast.error(t("error_loading_hearing"));
    }
  }, [caseDetailsError, t]);

  // Set form values from case details if available, otherwise from NIC details
  useEffect(() => {
    if (isFormInitialized) return; // Skip if form is already initialized

    if (caseDetailsData?.CaseDetails) {
      const details = caseDetailsData.CaseDetails;

      // Set values from case details only if value exists and is not null or empty string
      if (details.DefendantName !== undefined && details.DefendantName !== null && details.DefendantName !== "") {
        setValue("DefendantsEstablishmentPrisonerName", details.DefendantName);
      }
      if (details.Defendant_Region_Code !== undefined && details.Defendant_Region_Code !== null && details.Defendant_Region_Code !== "") {
        setValue("DefendantsEstablishmentRegion", details.Defendant_Region_Code);
      }
      if (details.Defendant_City_Code !== undefined && details.Defendant_City_Code !== null && details.Defendant_City_Code !== "") {
        setValue("DefendantsEstablishmentCity", details.Defendant_City_Code);
      }
      if (details.Defendant_Occupation_Code !== undefined && details.Defendant_Occupation_Code !== null && details.Defendant_Occupation_Code !== "") {
        setValue("DefendantsEstablishOccupation", details.Defendant_Occupation_Code);
      }
      if (details.Defendant_Gender_Code !== undefined && details.Defendant_Gender_Code !== null && details.Defendant_Gender_Code !== "") {
        setValue("DefendantsEstablishmentGender", details.Defendant_Gender_Code);
      }
      if (details.Defendant_Nationality_Code !== undefined && details.Defendant_Nationality_Code !== null && details.Defendant_Nationality_Code !== "") {
        setValue("DefendantsEstablishmentNationality", details.Defendant_Nationality_Code);
      }
      if (details.DefendantId !== undefined && details.DefendantId !== null && details.DefendantId !== "") {
        setValue("DefendantsEstablishmentPrisonerId", details.DefendantId);
      }
      if (details.Defendant_PhoneNumber !== undefined && details.Defendant_PhoneNumber !== null && details.Defendant_PhoneNumber !== "") {
        setValue("mobileNumber", details.Defendant_PhoneNumber);
      }

      // Handle date fields
      if (details.DefendantHijiriDOB !== undefined && details.DefendantHijiriDOB !== null && details.DefendantHijiriDOB !== "") {
        setValue("def_date_hijri", details.DefendantHijiriDOB);
      }
      if (details.Defendant_ApplicantBirthDate !== undefined && details.Defendant_ApplicantBirthDate !== null && details.Defendant_ApplicantBirthDate !== "") {
        // Convert YYYYMMDD to YYYY-MM-DD format if needed
        const birthDate = details.Defendant_ApplicantBirthDate;
        const formattedDate = `${birthDate.substring(0, 4)}-${birthDate.substring(4, 6)}-${birthDate.substring(6, 8)}`;
        setValue("def_date_gregorian", formattedDate);
      }

      // Set national ID if available
      if (details.DefendantId !== undefined && details.DefendantId !== null && details.DefendantId !== "") {
        setValue("nationalIdNumber", details.DefendantId);
        setCookie("nationalIdNumber", details.DefendantId);
      }

      // Set dropdown values with proper labels, only if value or label exists and is not null or empty string
      if (
        (details.Defendant_Region_Code !== undefined && details.Defendant_Region_Code !== null && details.Defendant_Region_Code !== "") ||
        (details.Defendant_Region !== undefined && details.Defendant_Region !== null && details.Defendant_Region !== "")
      ) {
        setValue("region", {
          value: details.Defendant_Region_Code || "",
          label: details.Defendant_Region || ""
        });
      }
      if (
        (details.Defendant_City_Code !== undefined && details.Defendant_City_Code !== null && details.Defendant_City_Code !== "") ||
        (details.Defendant_City !== undefined && details.Defendant_City !== null && details.Defendant_City !== "")
      ) {
        setValue("city", {
          value: details.Defendant_City_Code || "",
          label: details.Defendant_City || ""
        });
      }
      if (
        (details.Defendant_Occupation_Code !== undefined && details.Defendant_Occupation_Code !== null && details.Defendant_Occupation_Code !== "") ||
        (details.Defendant_Occupation !== undefined && details.Defendant_Occupation !== null && details.Defendant_Occupation !== "")
      ) {
        setValue("occupation", {
          value: details.Defendant_Occupation_Code || "",
          label: details.Defendant_Occupation || ""
        });
      }
      if (
        (details.Defendant_Gender_Code !== undefined && details.Defendant_Gender_Code !== null && details.Defendant_Gender_Code !== "") ||
        (details.Defendant_Gender !== undefined && details.Defendant_Gender !== null && details.Defendant_Gender !== "")
      ) {
        setValue("gender", {
          value: details.Defendant_Gender_Code || "",
          label: details.Defendant_Gender || ""
        });
      }
      if (
        (details.Defendant_Nationality_Code !== undefined && details.Defendant_Nationality_Code !== null && details.Defendant_Nationality_Code !== "") ||
        (details.Defendant_Nationality !== undefined && details.Defendant_Nationality !== null && details.Defendant_Nationality !== "")
      ) {
        setValue("nationality", {
          value: details.Defendant_Nationality_Code || "",
          label: details.Defendant_Nationality || ""
        });
      }
      setIsFormInitialized(true);
    }


  }, [caseDetailsData, nicData, setValue, watchNationalId, isFormInitialized, setCookie]);

  useEffect(() => {
    // Check for ER4054 service error first
    if (nicData && handleNICResponse(nicData)) {
      return; // Error was handled by service error modal
    }

    if (nicData?.NICDetails) {
      setValue("DefendantsEstablishmentPrisonerId", watchNationalId);
      
      if (nicData?.NICDetails?.PlaintiffName !== undefined && nicData?.NICDetails?.PlaintiffName !== "") {
        setValue("DefendantsEstablishmentPrisonerName", nicData?.NICDetails?.PlaintiffName);
      }
      if (nicData?.NICDetails?.Region_Code !== undefined && nicData?.NICDetails?.Region_Code !== "") {
        setValue("DefendantsEstablishmentRegion", nicData?.NICDetails?.Region_Code);
        setValue("region", { value: nicData?.NICDetails?.Region_Code, label: nicData?.NICDetails?.Region || "" });
      }
      if (nicData?.NICDetails?.City_Code !== undefined && nicData?.NICDetails?.City_Code !== "") {
        setValue("DefendantsEstablishmentCity", nicData?.NICDetails?.City_Code);
        setValue("city", { value: nicData?.NICDetails?.City_Code, label: nicData?.NICDetails?.City || "" });
      }
      if (nicData?.NICDetails?.Occupation_Code !== undefined && nicData?.NICDetails?.Occupation_Code !== "") {
        setValue("DefendantsEstablishOccupation", nicData?.NICDetails?.Occupation_Code);
        setValue("occupation", { value: nicData?.NICDetails?.Occupation_Code, label: nicData?.NICDetails?.Occupation || "" });
      }
      if (nicData?.NICDetails?.Gender_Code !== undefined && nicData?.NICDetails?.Gender_Code !== "") {
        setValue("DefendantsEstablishmentGender", nicData?.NICDetails?.Gender_Code);
        setValue("gender", { value: nicData?.NICDetails?.Gender_Code, label: nicData?.NICDetails?.Gender || "" });
      }
      if (nicData?.NICDetails?.Nationality_Code !== undefined && nicData?.NICDetails?.Nationality_Code !== "") {
        setValue("DefendantsEstablishmentNationality", nicData?.NICDetails?.Nationality_Code);
        setValue("nationality", { value: nicData?.NICDetails?.Nationality_Code, label: nicData?.NICDetails?.Nationality || "" });
      }
      setIsFormInitialized(true);

    }
  }, [nicData, handleNICResponse, watchNationalId])
  // Clear form fields when NIC validation changes
  useEffect(() => {
    if (!isValidCallNic && !isFormInitialized) {
      [
        "DefendantsEstablishmentPrisonerName",
        "mobileNumber",
        "region",
        "city",
        "occupation",
        "gender",
        "nationality",
        "DefendantsEstablishmentPrisonerId",
      ].forEach((f) => setValue(f as any, ""));
    }
  }, [isValidCallNic, setValue, isFormInitialized]);

  // Update NIC validation state
  useEffect(() => {
    const isValid = watchNationalId?.length === 10;
    const hasDateOfBirth = !!watchDateOfBirth;
    setIsValidCallNic(isValid && hasDateOfBirth);

    if (isValid && hasDateOfBirth) {
      setCookie("nationalIdNumber", watchNationalId);
    }
  }, [watchNationalId, watchDateOfBirth, setCookie]);

  //#endregion Hassan Work Here 

  const RegionOptions = React.useMemo(() => {
    return (
      regionData && regionData?.DataElements?.map((item: any) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || []
    );
  }, [regionData]);

  const CityOptions = React.useMemo(() => {
    return (
      cityData && cityData?.DataElements?.map((item: any) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || []
    );
  }, [cityData]);

  const occupationOptions = React.useMemo(() => {
    return (
      occupationData && occupationData?.DataElements?.map((item: any) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || options
    );
  }, [occupationData]);

  const genderOptions = React.useMemo(() => {
    return (
      genderData && genderData?.DataElements?.map((item: any) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || options
    );
  }, [genderData]);

  const nationalityOptions = React.useMemo(() => {
    return (
      nationalityData && nationalityData?.DataElements?.map((item: any) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || options
    );
  }, [nationalityData]);

  return [
    {
      title: t("tab2_title"),
      children: [
        {
          type: "input",
          name: "nationalIdNumber",
          label: t("nicDetails.national_id_number"),
          inputType: "text",
          placeholder: "10xxxxxxxx",
          maxLength: 10,
          validation: {
            required: t("nationalIdValidation"),
            validate: (value) =>
              value?.length === 10 || t("max10Validation"),
          },
        },
        // Date of Birth (Hijri/Gregorian)
        {
          type: "custom" as const,
          name: "establishmentDefendantDateBirth",
          component: (
            <div className="flex flex-col gap-2">
              <HijriDatePickerInput
                control={control}
                name={"def_date_hijri" as any}
                label={t("establishment_tab2.dobHijri")}
                rules={{ required: t("dateOfBirthValidation") }}
                notRequired={false}
                isDateOfBirth={true}
                onChangeHandler={(date: any, onChange: (value: string) => void) => {
                  if (date && !Array.isArray(date)) {
                    const hijriDate = date.convert(hijriCalendar, hijriLocale);
                    const gregorianDate = date.convert(gregorianCalendar, gregorianLocaleEn);
                    const hijri = hijriDate.format("YYYYMMDD");
                    const gregorian = gregorianDate.format("YYYYMMDD");
                    console.log('Hijri:', hijri, 'Gregorian:', gregorian);
                    setValue("def_date_gregorian" as any, gregorian);
                  } else {
                    setValue("def_date_gregorian" as any, "");
                  }
                }}
              />
              <GregorianDateDisplayInput
                control={control}
                name={"def_date_gregorian" as any}
                label={t("establishment_tab2.dobGrog")}
              />
            </div>
          ),
        },
        {
          type: !nicData?.NICDetails?.PlaintiffName ? "input" : "readonly",
          label: t("establishment_tab2.name"),
          value: nicData?.NICDetails?.PlaintiffName,
          isLoading: nicIsLoading,
          name: "DefendantsEstablishmentPrisonerName",
          ...(nicData?.NICDetails?.PlaintiffName && {
            inputType: "text",
          }),
          ...(!nicData?.NICDetails?.PlaintiffName && {
            validation: { required: t("defendantNameValidation") },
          }),
          disabled: disableNicFields,
        },
        {
          type: "input",
          name: "mobileNumber",
          label: t("establishment_tab2.mobileNumber"),
          inputType: "text",
          placeholder: "05xxxxxxxx",
          validation: {
            required: t("phoneNumberValidation"),
            pattern: {
              value: /^05\d{8}$/,
              message: t("phoneNumberValidationٍstartWith"),
            },
          },
          disabled: disableNicFields,
        },
        {
          type: nicData?.NICDetails?.Region ? "readonly" : "autocomplete",
          name: "region",
          isLoading: isRegionLoading,
          label: t("region"),
          value: nicData?.NICDetails?.Region || "",
          ...(nicData?.NICDetails?.Region ? {} : {
            options: RegionOptions || [],
            validation: { required: t("regionValidation") },
          }),
          disabled: disableNicFields,
        },
        {
          type: nicData?.NICDetails?.City ? "readonly" : "autocomplete",
          name: "city",
          isLoading: isCityLoading,
          label: t("city"),
          value: nicData?.NICDetails?.City || "",
          ...(nicData?.NICDetails?.City ? {} : {
            options: CityOptions || [],
            validation: { required: t("cityValidation") },
          }),
          disabled: disableNicFields,
        },
        {
          isLoading: nicIsLoading,
          type: nicData?.NICDetails?.Occupation ? "readonly" : "autocomplete",
          name: "occupation",
          label: t("occupation"),
          value: nicData?.NICDetails?.Occupation || "",
          ...(nicData?.NICDetails?.Occupation ? {} : {
            options: occupationOptions || [],
            validation: { required: t("occupationValidation") },
          }),
          disabled: disableNicFields,
        },
        {
          isLoading: nicIsLoading,
          type: nicData?.NICDetails?.Gender ? "readonly" : "autocomplete",
          name: "gender",
          label: t("gender"),
          value: nicData?.NICDetails?.Gender || "",
          ...(nicData?.NICDetails?.Gender ? {} : {
            options: genderOptions || [],
            validation: { required: t("genderValidation") },
          }),
          disabled: disableNicFields,
        },
        {
          isLoading: nicIsLoading,
          type: nicData?.NICDetails?.Nationality ? "readonly" : "autocomplete",
          name: "nationality",
          label: t("nationality"),
          value: nicData?.NICDetails?.Nationality || "",
          ...(nicData?.NICDetails?.Nationality ? {} : {
            options: nationalityOptions || [],
            validation: { required: t("nationalityValidation") },
          }),
          disabled: disableNicFields,
        },
      ],
    },
  ] as SectionLayout[];
};
