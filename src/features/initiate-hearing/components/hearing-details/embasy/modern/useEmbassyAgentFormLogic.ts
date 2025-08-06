import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { EmbassyAgentFormProps, EmbassyUserInfo, NICDetails } from "./types";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import { useLazyGetNICDetailsForEmbasyQuery } from "@/features/initiate-hearing/api/create-case/plaintiffDetailsApis";
import { toWesternDigits, isHijriDateInFuture } from '@/shared/lib/helpers';

export function useEmbassyAgentFormLogic({
  control,
  setValue,
  watch,
  setError,
  clearErrors,
}: EmbassyAgentFormProps) {
  const { t, i18n } = useTranslation("hearingdetails");
  const [getCookie] = useCookieState();
  const embasyUserData = getCookie("storeAllUserTypeData");
  const claimType = watch("claimantStatus");
  const PlaintiffId = watch("embassyAgent_workerAgentIdNumber");
  const PlaintifDOB = watch("embassyAgent_workerAgentDateOfBirthHijri");
  const nationality = watch("embassyAgent_nationality");
  const [validNationality, setValidNationality] = useState<boolean>(false);

  // Memoize functions to prevent infinite loops
  const memoizedSetValue = useCallback((name: string, value: any) => {
    setValue(name, value);
  }, [setValue]);
  const memoizedSetError = useCallback(setError, [setError]);
  const memoizedClearErrors = useCallback(clearErrors, [clearErrors]);

  // Memoize embassy info to prevent unnecessary re-renders
  const embassyInfo = useMemo(() => {
    return embasyUserData?.EmbassyInfo?.[0] || null;
  }, [embasyUserData]);

  // Register fields for React Hook Form tracking
  useEffect(() => {
    if (typeof control?.register === "function") {
      control.register("embassyAgent_workerAgentDateOfBirthHijri");
      control.register("embassyAgent_workerAgentIdNumber");
      control.register("embassyAgent_userName");
      control.register("embassyAgent_region");
      control.register("embassyAgent_city");
      control.register("embassyAgent_phoneNumber");
      control.register("embassyAgent_occupation");
      control.register("embassyAgent_gender");
      control.register("embassyAgent_nationality");
      control.register("embassyAgent_gregorianDate");
      control.register("embassyAgent_Agent_EmbassyName");
      control.register("embassyAgent_Agent_EmbassyNationality");
      control.register("embassyAgent_Agent_EmbassyPhone");
      control.register("embassyAgent_Agent_EmbassyEmailAddress");
      control.register("embassyAgent_Agent_EmbassyFirstLanguage");
      control.register("embassyAgent_Nationality_Code");
    }
  }, [control]);

  // Embassy info population
  useEffect(() => {
    if (claimType === "representative" && embassyInfo) {
      // Only set values if they're different to prevent unnecessary updates
      const currentValues = {
        embassyName: watch("embassyAgent_Agent_EmbassyName"),
        embassyNationality: watch("embassyAgent_Agent_EmbassyNationality"),
        embassyPhone: watch("embassyAgent_Agent_EmbassyPhone"),
        embassyFirstLanguage: watch("embassyAgent_Agent_EmbassyFirstLanguage"),
        embassyEmail: watch("embassyAgent_Agent_EmbassyEmailAddress"),
        nationalityCode: watch("embassyAgent_Nationality_Code"),
      };

      // Only update if values are actually different
      if (currentValues.embassyName !== embassyInfo.EmbassyName)
        memoizedSetValue("embassyAgent_Agent_EmbassyName", embassyInfo.EmbassyName);
      if (currentValues.embassyNationality !== embassyInfo.EmbassyNationality)
        memoizedSetValue("embassyAgent_Agent_EmbassyNationality", embassyInfo.EmbassyNationality);
      if (currentValues.embassyPhone !== embassyInfo.EmbassyPhone)
        memoizedSetValue("embassyAgent_Agent_EmbassyPhone", embassyInfo.EmbassyPhone);
      if (currentValues.embassyFirstLanguage !== embassyInfo.EmbassyFirstLanguage)
        memoizedSetValue("embassyAgent_Agent_EmbassyFirstLanguage", embassyInfo.EmbassyFirstLanguage);
      if (currentValues.embassyEmail !== embassyInfo.EmabassyEmail)
        memoizedSetValue("embassyAgent_Agent_EmbassyEmailAddress", embassyInfo.EmabassyEmail);
      if (currentValues.nationalityCode !== embassyInfo.Nationality_Code)
        memoizedSetValue("embassyAgent_Nationality_Code", embassyInfo.Nationality_Code);
    } else if (claimType === "representative" && !embassyInfo) {
      // Clear embassy fields only if they have values
      const fieldsToClear = [
        "embassyAgent_Agent_EmbassyName",
        "embassyAgent_Agent_EmbassyNationality",
        "embassyAgent_Agent_EmbassyPhone",
        "embassyAgent_Agent_EmbassyFirstLanguage",
        "embassyAgent_Agent_EmbassyEmailAddress",
        "embassyAgent_Nationality_Code",
      ];
      
      fieldsToClear.forEach((field) => {
        if (watch(field)) memoizedSetValue(field, "");
      });

      // Clear plaintiff fields only if they have values
      const plaintiffFieldsToClear = [
        "embassyAgent_userName",
        "embassyAgent_region",
        "embassyAgent_city",
        "embassyAgent_occupation",
        "embassyAgent_gender",
        "embassyAgent_nationality",
        "embassyAgent_applicant",
      ];
      
      plaintiffFieldsToClear.forEach((field) => {
        if (watch(field)) memoizedSetValue(field, "");
      });

      const nullFieldsToClear = [
        "embassyAgent_region",
        "embassyAgent_city",
        "embassyAgent_occupation",
        "embassyAgent_gender",
        "embassyAgent_nationality",
      ];
      
      nullFieldsToClear.forEach((field) => {
        if (watch(field) !== null) memoizedSetValue(field, null);
      });
    }
  }, [claimType, embassyInfo?.EmbassyName, embassyInfo?.EmbassyNationality, embassyInfo?.EmbassyPhone, embassyInfo?.EmbassyFirstLanguage, embassyInfo?.EmabassyEmail, embassyInfo?.Nationality_Code, memoizedSetValue, watch]);

  // NIC fetch logic
  const formattedPlaintifDOB = useMemo(() => {
    return PlaintifDOB ? PlaintifDOB.replaceAll("/", "") : "";
  }, [PlaintifDOB]);

  const shouldFetchNic = useMemo(() => {
    return claimType === "representative" &&
      PlaintiffId?.length === 10 &&
      formattedPlaintifDOB?.length === 8 &&
      !isHijriDateInFuture(formattedPlaintifDOB);
  }, [claimType, PlaintiffId, formattedPlaintifDOB]);

  const [triggerNicAgent, { data: nicAgent, isFetching: nicAgentLoading, isError: nicAgentError }] = useLazyGetNICDetailsForEmbasyQuery();

  // Track if we've already triggered a call for the current ID/DOB combination
  const previousCallRef = useRef<{ id: string; dob: string } | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const currentCall = { id: PlaintiffId, dob: formattedPlaintifDOB };
    
    // Clear any existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Only trigger if conditions are met and we haven't already called for this combination
    if (shouldFetchNic && 
        !nicAgentLoading && 
        (!previousCallRef.current || 
         previousCallRef.current.id !== currentCall.id || 
         previousCallRef.current.dob !== currentCall.dob)) {
      
      // Add a small debounce to prevent rapid successive calls
      debounceTimeoutRef.current = setTimeout(() => {
        previousCallRef.current = currentCall;
        
        triggerNicAgent({
          IDNumber: PlaintiffId,
          DateOfBirth: formattedPlaintifDOB,
          AcceptedLanguage: i18n.language.toUpperCase(),
          SourceSystem: "E-Services",
        });
      }, 500); // 500ms debounce
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [PlaintiffId, formattedPlaintifDOB, shouldFetchNic, nicAgentLoading, triggerNicAgent, i18n.language]);

  // Track previous NIC data to prevent re-processing
  const previousNicDataRef = useRef<any>(null);

  useEffect(() => {
    if (!shouldFetchNic || nicAgentLoading || !nicAgent) return;

    // Prevent re-processing the same NIC data
    if (previousNicDataRef.current === nicAgent) return;
    
    // Store the current NIC data to prevent re-processing
    previousNicDataRef.current = nicAgent;
    
    if (nicAgentError || (nicAgent && !nicAgent.NICDetails)) {
      let errorMessage = t("error.noNicData");
      if (nicAgent && nicAgent.ErrorDetails && Array.isArray(nicAgent.ErrorDetails)) {
        const errorDetail = nicAgent.ErrorDetails.find((detail: any) => detail.ErrorDesc);
        if (errorDetail && errorDetail.ErrorDesc) {
          errorMessage = errorDetail.ErrorDesc;
        }
      }
      memoizedSetError("embassyAgent_workerAgentIdNumber", { type: "validate", message: errorMessage });
      
      // Clear plaintiff fields only if they have values
      const fieldsToClear = [
        "embassyAgent_userName",
        "embassyAgent_region",
        "embassyAgent_city",
        "embassyAgent_occupation",
        "embassyAgent_gender",
        "embassyAgent_nationality",
        "embassyAgent_applicant",
      ];
      
      fieldsToClear.forEach((field) => {
        if (watch(field)) memoizedSetValue(field, "");
      });

      const nullFieldsToClear = [
        "embassyAgent_region",
        "embassyAgent_city",
        "embassyAgent_occupation",
        "embassyAgent_gender",
        "embassyAgent_nationality",
      ];
      
      nullFieldsToClear.forEach((field) => {
        if (watch(field) !== null) memoizedSetValue(field, null);
      });
    } else if (nicAgent && nicAgent.NICDetails) {
      // Embassy-specific nationality validation
      if (
        nicAgent.NICDetails.Nationality_Code !==
        embassyInfo?.Nationality_Code
      ) {
        setValidNationality(false);
        memoizedSetError("embassyAgent_nationality", { message: t("nationality_error") });
        memoizedSetValue("embassyAgent_workerAgentIdNumber", "");
        toast.error(t("nationality_error"));
        return;
      } else {
        setValidNationality(true);
        memoizedClearErrors("embassyAgent_nationality");
      }
      
      memoizedClearErrors("embassyAgent_workerAgentIdNumber");
      const d = nicAgent.NICDetails;
      
      // Get current values once to avoid multiple watch calls
      const currentValues = {
        userName: watch("embassyAgent_userName"),
        region: watch("embassyAgent_region"),
        city: watch("embassyAgent_city"),
        occupation: watch("embassyAgent_occupation"),
        gender: watch("embassyAgent_gender"),
        nationality: watch("embassyAgent_nationality"),
        applicant: watch("embassyAgent_applicant"),
        phoneNumber: watch("embassyAgent_phoneNumber"),
      };
      
      // Only set values if they're different to prevent unnecessary updates
      if (currentValues.userName !== d.PlaintiffName) {
        memoizedSetValue("embassyAgent_userName", d.PlaintiffName || "");
      }
      
      if (d.Region_Code && (!currentValues.region || currentValues.region?.value !== d.Region_Code)) {
        memoizedSetValue("embassyAgent_region", { value: d.Region_Code, label: d.Region || "" });
      }
      
      if (d.City_Code && (!currentValues.city || currentValues.city?.value !== d.City_Code)) {
        memoizedSetValue("embassyAgent_city", { value: d.City_Code, label: d.City || "" });
      }
      
      if (d.Occupation_Code && (!currentValues.occupation || currentValues.occupation?.value !== d.Occupation_Code)) {
        memoizedSetValue("embassyAgent_occupation", { value: d.Occupation_Code, label: d.Occupation || "" });
      }
      
      if (d.Gender_Code && (!currentValues.gender || currentValues.gender?.value !== d.Gender_Code)) {
        memoizedSetValue("embassyAgent_gender", { value: d.Gender_Code, label: d.Gender || "" });
      }
      
      if (d.Nationality_Code && (!currentValues.nationality || currentValues.nationality?.value !== d.Nationality_Code)) {
        memoizedSetValue("embassyAgent_nationality", { value: d.Nationality_Code, label: d.Nationality || "" });
      }
      
      if (currentValues.applicant !== d.Applicant) {
        memoizedSetValue("embassyAgent_applicant", d.Applicant || "");
      }
      
      if (d.PhoneNumber && currentValues.phoneNumber !== d.PhoneNumber.toString()) {
        memoizedSetValue("embassyAgent_phoneNumber", d.PhoneNumber.toString());
      }
      
      // Set date fields from NIC data
      if (d.DateOfBirthHijri) {
        memoizedSetValue("embassyAgent_workerAgentDateOfBirthHijri", d.DateOfBirthHijri);
      }
      
      if (d.DateOfBirthGregorian) {
        memoizedSetValue("embassyAgent_gregorianDate", d.DateOfBirthGregorian);
      }
    }
  }, [shouldFetchNic, nicAgentLoading, nicAgent?.NICDetails, nicAgentError, embassyInfo?.Nationality_Code, memoizedSetValue, memoizedSetError, memoizedClearErrors, watch, t]);

  const embassyCode = useMemo(() => embassyInfo?.Nationality_Code, [embassyInfo]);

  const handleNationalityChange = useCallback((value: any) => {
    memoizedSetValue("embassyAgent_nationality", value);
    
    if (value?.value && embassyCode && value.value !== embassyCode) {
      setValidNationality(false);
      memoizedSetError("embassyAgent_nationality", { message: t("nationality_error") });
      toast.error(t("nationality_error"));
    } else {
      setValidNationality(true);
      memoizedClearErrors("embassyAgent_nationality");
    }
  }, [memoizedSetValue, embassyCode, setValidNationality, memoizedSetError, memoizedClearErrors, t]);

  return {
    nicAgentLoading,
    validNationality,
    nicAgent,
    handleNationalityChange,
  };
} 