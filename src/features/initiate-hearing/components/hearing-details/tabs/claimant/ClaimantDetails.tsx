import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useTranslation } from "react-i18next";
import withStepNavigation, {
  WithStepNavigationProps,
} from "@/shared/HOC/withStepNavigation";
import { DynamicForm } from "@/shared/components/form/DynamicForm";
import { FormData } from "@/shared/components/form/form.types";
import { toast } from "react-toastify";
import Loader from "@/shared/components/loader";
import { formatDateToYYYYMMDD, toWesternDigits, isHijriDateInFuture } from "@/shared/lib/helpers";
import { useWatch } from "react-hook-form";
import { useNICServiceErrorContext } from "@/shared/context/NICServiceErrorContext";

import {
  useGetNICDetailsQuery,
  useGetWorkerRegionLookupDataQuery,
  useGetWorkerCityLookupDataQuery,
  useGetOccupationLookupDataQuery,
  useGetGenderLookupDataQuery,
  useGetNationalityLookupDataQuery,
  useGetCountryCodeLookupDataQuery,
  useGetAttorneyDetailsQuery,
  useSendOtpMutation,
} from "@/features/initiate-hearing/api/create-case/plaintiffDetailsApis";

import { useGetEstablishmentDetailsQuery } from "@/features/initiate-hearing/api/create-case/defendantDetailsApis";
import { useGetIncompleteCaseQuery } from "@/features/dashboard/api/api";
import { useGetUserTypeLegalRepQuery } from "@/features/login/api/loginApis";
import { useOtpVerification } from "@/features/initiate-hearing/hooks/useOtpVerification";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import useCaseDetailsPrefill from "@/features/initiate-hearing/hooks/useCaseDetailsPrefill";
import useEmbassyCaseDetailsPrefill from "@/features/initiate-hearing/hooks/useEmbassyCaseDetailsPrefill";
import { useSaveClaimantDetailsMutation } from "@/features/initiate-hearing/api/create-case/apis";
import { useAPIFormsData } from "@/providers/FormContext";
import { useIncompleteCaseHandler } from "@/features/initiate-hearing/hooks/useIncompleteCaseHandler";
import { claimantDetailsPayload, emabsyClaimantPayload } from "@/features/initiate-hearing/api/create-case/payloads";

import { useFormLayout } from "./claimant.forms.formLayout";
import { useEstablishmentPlaintiffFormLayout } from "../../establishment-tabs/plaintiff/plaintiff.forms.formLayout";
import { useLegalRepPlaintiffFormLayout } from "../../establishment-tabs/legal-representative/plaintiff.forms.formLayout";
import { EmbassyClaimantFormLayout } from "../../embasy/modern/EmbassyClaimantFormLayout";

interface NICDetailsResponse {
  DataElements: Array<{
    ElementKey: string;
    ElementValue: string;
  }>;
  NICDetails: {
    PlaintiffName?: string;
    Region?: string;
    City?: string;
    DateOfBirthHijri?: string;
    DateOfBirthGregorian?: string;
    Occupation?: string;
    Gender?: string;
    Nationality?: string;
    Applicant_Code?: string;
    Applicant?: string;
    PhoneNumber?: string;
  };
  ErrorDetails?: Array<{
    ErrorCode?: string;
    ErrorDesc?: string;
  }>;
  SourceSystem?: string;
}

interface AttorneyDetailsResponse {
  Agent: {
    ErrorDescription?: string;
    pyErrorMessage?: string;
    MandateStatus?: string;
    AgentDetails?: Array<{ IdentityNumber: string }>;
    Error?: string;
    GregorianDate?: string;
    AgentName?: string;
    MandateSource?: string;
    MandateDate?: string;
  };
  ErrorDetails?: {
    ErrorCode?: string;
    ErrorDesc?: string;
  }[];
  AttorneyService?: string;
  SourceSystem?: string;
  PartyList?: any[];
}

interface AgentInfo {
  Agent: {
    ErrorDescription?: string;
    pyErrorMessage?: string;
    MandateStatus?: string;
    AgentDetails?: Array<{ IdentityNumber: string }>;
    Error?: string;
    GregorianDate?: string;
    AgentName?: string;
    MandateSource?: string;
    MandateDate?: string;
  };
  ErrorDetails?: {
    ErrorCode?: string;
    ErrorDesc?: string;
  }[];
  AttorneyService?: string;
  SourceSystem?: string;
  PartyList?: any[];
}

const PureClaimantDetails = React.memo((props: any) => (
  <DynamicForm {...props} />
));

const ClaimantDetailsContainer: React.FC<
  WithStepNavigationProps & {
    setError: (name: string, error: any) => void;
    clearErrors: (name: string) => void;
    trigger: (name: string) => void;
    isValid: boolean;
  }
> = ({
  register,
  errors,
  setValue,
  watch,
  control,
  setError,
  clearErrors,
  trigger,
  isValid,
}) => {
    const { t, i18n } = useTranslation("hearingdetails");
    const lang = i18n.language.toUpperCase();
    const [isAgencyValidating, setIsAgencyValidating] = useState(false);

    const { handleNICResponse, setTryAgainCallback } = useNICServiceErrorContext();

    const [getCookie, setCookie] = useCookieState();
    const userClaims = getCookie("userClaims");
    const userId = userClaims?.UserID || "";
    const userName = userClaims?.FullName || "";
    const userType = getCookie("userType");
    const { clearFormData } = useAPIFormsData();
    
    // Memoize setValue to prevent infinite loops
    const memoizedSetValue = useCallback(setValue, [setValue]);
    const memoizedSetError = useCallback(setError, [setError]);
    const memoizedClearErrors = useCallback(clearErrors, [clearErrors]);
    
    useEffect(() => {
      // Keep this for initial setup, but individual fields are managed
      // by useIncompleteCaseHandler and other hooks.
    }, [clearFormData]);

    useIncompleteCaseHandler(memoizedSetValue, trigger);
    
    // Use embassy-specific prefill for embassy users, regular prefill for others
    const isEmbassyUserForPrefill = userType?.toLowerCase().includes("embassy user");
    if (isEmbassyUserForPrefill) {
      useEmbassyCaseDetailsPrefill(memoizedSetValue, trigger);
    } else {
      useCaseDetailsPrefill(memoizedSetValue, trigger);
    }

    const claimantStatus = watch("claimantStatus") as
      | "principal"
      | "representative";

    const watchedClaimantStatus = useWatch({ name: "claimantStatus", control });

    useEffect(() => {
      // Set default claimant status on mount to avoid race conditions
      if (!watchedClaimantStatus) {
        memoizedSetValue("claimantStatus", "principal");
      }
    }, []); // Only run once on mount

    const principalId = userId;
    const principalDob = formatDateToYYYYMMDD(userClaims?.UserDOB);

    const representativeId = watch("workerAgentIdNumber") as string;
    const representativeDob = formatDateToYYYYMMDD(
      watch("workerAgentDateOfBirthHijri")
    );

    // --- OTP setup ---
    const [sendOtp] = useSendOtpMutation();
    const {
      sendOtpHandler,
      isVerified,
      isNotVerified,
      setIsNotVerified,
      lastSentOtp,
    } = useOtpVerification({
      phoneCode: { value: (watch("phoneCode") as string) || "" },
      phoneNumber: (watch("phoneNumber") as string) || "",
      plaintiffId: claimantStatus === "principal" ? userId : representativeId,
      plaintiffName: claimantStatus === "principal" ? userName : "",
      setValue: memoizedSetValue as any,
    });

    // --- Agent info ---
    const agentType = watch("agentType");
    const mandateNumber = agentType === "local_agency"
      ? watch("localAgent_agencyNumber") || watch("agencyNumber")
      : agentType === "external_agency"
        ? watch("externalAgent_agencyNumber") || watch("externalAgencyNumber")
        : "";
    const {
      data: agentInfo,
      error: agentError,
      isError: isAgentError,
      isFetching: isAgentFetching,
      refetch: refetchAttorneyDetails,
      isUninitialized,
    } = useGetAttorneyDetailsQuery(
      {
        AgentID: userId,
        MandateNumber: mandateNumber,
        AcceptedLanguage: lang,
        SourceSystem: "E-Services",
      },
      {
        skip: agentType !== "local_agency" || !isAgencyValidating,
        refetchOnMountOrArgChange: true, 
      }
    );

    const allowedIds = (() => {
      try {
        if (!agentInfo?.Agent?.AgentDetails || !Array.isArray(agentInfo.Agent.AgentDetails)) {
          return [];
        }
        return agentInfo.Agent.AgentDetails
          .map((d) => d?.IdentityNumber || "")
          .filter(Boolean);
      } catch (error) {
        console.error('Error processing allowed IDs:', error);
        return [];
      }
    })();
    const safeAllowedIds = allowedIds || [];
    const hasValidAgency = agentType === "local_agency" && agentInfo?.Agent?.ErrorDescription === "Success";

    // --- Lookup data queries ---
    const isEstablishmentUser = userType?.toLowerCase().includes("establishment");
    const isLegalRepresentativeUser = userType?.toLowerCase().includes("legal representative");
    let selectedRegionForCity: any = null;
    let cityFieldName: string = "plaintiffCity";
    // Determine correct region/city fields for lookup and assignment
    if (isEstablishmentUser) {
      selectedRegionForCity = typeof watch("establishment_region") === "object"
        ? watch("establishment_region")?.value
        : watch("establishment_region") || "";
      cityFieldName = "establishment_city";
    } else if (isEmbassyUserForPrefill) {
      if (claimantStatus === "representative") {
        selectedRegionForCity = typeof watch("embassyAgent_region") === "object"
          ? watch("embassyAgent_region")?.value
          : watch("embassyAgent_region") || "";
        cityFieldName = "embassyAgent_city";
      } else {
        selectedRegionForCity = typeof watch("region") === "object"
          ? watch("region")?.value
          : watch("region") || "";
        cityFieldName = "city";
      }
    } else if (claimantStatus === "principal") {
      selectedRegionForCity = typeof watch("principal_region") === "object"
        ? watch("principal_region")?.value
        : watch("principal_region") || "";
      cityFieldName = "principal_city";
    } else if (claimantStatus === "representative" && agentType === "local_agency") {
      selectedRegionForCity = typeof watch("localAgent_region") === "object"
        ? watch("localAgent_region")?.value
        : watch("localAgent_region") || "";
      cityFieldName = "localAgent_city";
    } else if (claimantStatus === "representative" && agentType === "external_agency") {
      selectedRegionForCity = typeof watch("externalAgent_region") === "object"
        ? watch("externalAgent_region")?.value
        : watch("externalAgent_region") || "";
      cityFieldName = "externalAgent_city";
    } else {
      selectedRegionForCity = typeof watch("plaintiffRegion") === "object"
        ? watch("plaintiffRegion")?.value
        : watch("plaintiffRegion") || "";
      cityFieldName = "plaintiffCity";
    }
    const { data: regionData } = useGetWorkerRegionLookupDataQuery({
      AcceptedLanguage: lang,
      SourceSystem: "E-Services",
      ModuleKey: isEstablishmentUser ? "EstablishmentRegion" : "WorkerRegion",
      ModuleName: isEstablishmentUser ? "EstablishmentRegion" : "WorkerRegion",
    });
    const { data: cityData } = useGetWorkerCityLookupDataQuery(
      {
        AcceptedLanguage: lang,
        SourceSystem: "E-Services",
        selectedWorkerRegion: selectedRegionForCity,
        ModuleName: isEstablishmentUser ? "EstablishmentCity" : "WorkerCity",
      },
      {
        skip: !selectedRegionForCity
      }
    );
    const { data: occupationData } = useGetOccupationLookupDataQuery({
      AcceptedLanguage: lang,
      SourceSystem: "E-Services",
    });
    const { data: genderData } = useGetGenderLookupDataQuery({
      AcceptedLanguage: lang,
      SourceSystem: "E-Services",
    });
    const { data: nationalityData } = useGetNationalityLookupDataQuery({
      AcceptedLanguage: lang,
      SourceSystem: "E-Services",
    });
    const { data: countryData } = useGetCountryCodeLookupDataQuery({
      AcceptedLanguage: lang,
      SourceSystem: "E-Services",
    });


    // --- NIC details hooks, one for each case ---
    const {
      data: principalNICResponse,
      isFetching: principalNICLoading,
      refetch: principalNICRefetch,
    } = useGetNICDetailsQuery(
      {
        IDNumber: principalId,
        DateOfBirth: toWesternDigits(principalDob || ""),
        AcceptedLanguage: lang,
        SourceSystem: "E-Services",
      },
      {
        skip:
          claimantStatus !== "principal" ||
          !principalId ||
          principalId.length !== 10 ||
          !principalDob ||
          isHijriDateInFuture(principalDob) ||
          isLegalRepresentativeUser,
      }
    );

    const {
      data: representativeNICResponse,
      isFetching: representativeNICLoading,
      refetch: representativeNICRefetch,
    } = useGetNICDetailsQuery(
      {
        IDNumber: representativeId,
        DateOfBirth: toWesternDigits(representativeDob || ""),
        AcceptedLanguage: lang,
        SourceSystem: "E-Services",
      },
      {
        skip:
          claimantStatus !== "representative" ||
          !representativeId ||
          representativeId.length !== 10 ||
          !representativeDob ||
          representativeDob.length !== 8 ||
          isHijriDateInFuture(representativeDob) ||
          isLegalRepresentativeUser,
      }
    );

    const nicLoading = principalNICLoading || representativeNICLoading;

    const externalAgentId = watch("externalAgent_workerAgentIdNumber") || "";
    const externalAgentDob = toWesternDigits(watch("externalAgent_workerAgentDateOfBirthHijri") || "");
    const {
      data: externalAgentNICResponse,
      isFetching: externalAgentNICLoading,
      refetch: refetchExternalAgentNIC,
    } = useGetNICDetailsQuery(
      {
        IDNumber: externalAgentId,
        DateOfBirth: externalAgentDob,
        AcceptedLanguage: lang,
        SourceSystem: "E-Services",
      },
      {
        skip:
          agentType !== "external_agency" ||
          externalAgentId.length !== 10 ||
          externalAgentDob.length !== 8 ||
          isHijriDateInFuture(externalAgentDob) ||
          isLegalRepresentativeUser,
      }
    );

    const localAgentId = watch("localAgent_workerAgentIdNumber") || "";
    const localAgentDob = toWesternDigits(watch("localAgent_workerAgentDateOfBirthHijri") || "");
    
    const {
      data: localAgentNICResponse,
      isFetching: localAgentNICLoading,
      refetch: refetchLocalAgentNIC,
    } = useGetNICDetailsQuery(
      {
        IDNumber: localAgentId,
        DateOfBirth: localAgentDob,
        AcceptedLanguage: lang,
        SourceSystem: "E-Services",
      },
      {
        skip:
          agentType !== "local_agency" ||
          !hasValidAgency ||
          localAgentId.length !== 10 ||
          !safeAllowedIds.includes(localAgentId) ||
          localAgentDob.length !== 8 ||
          isHijriDateInFuture(localAgentDob) ||
          isLegalRepresentativeUser,
      }
    );

    const errorToastShownRef = useRef(false);

    // NIC Service Error handling
    const handleTryAgain = useCallback(() => {
      // Refetch all NIC queries (only for non-legal representative users)
      if (!isLegalRepresentativeUser) {
        if (principalNICRefetch) principalNICRefetch();
        if (representativeNICRefetch) representativeNICRefetch();
        if (refetchExternalAgentNIC) refetchExternalAgentNIC();
        if (refetchLocalAgentNIC) refetchLocalAgentNIC();
      }
    }, [principalNICRefetch, representativeNICRefetch, refetchExternalAgentNIC, refetchLocalAgentNIC, isLegalRepresentativeUser]);

    // Set the try again callback when component mounts
    useEffect(() => {
      setTryAgainCallback(handleTryAgain);
    }, [setTryAgainCallback, handleTryAgain]);

    useEffect(() => {
      try {
        if (!agentInfo && !isAgentFetching) return;

        if (isAgentFetching) {
          setIsAgencyValidating(true);
          errorToastShownRef.current = false; // Reset when starting new fetch
          return;
        }

        setIsAgencyValidating(false);

      // Defensive check: ensure agentInfo has the expected structure
      if (!agentInfo || typeof agentInfo !== 'object') {
        console.warn('Agent info is missing or invalid:', agentInfo);
        setError("agencyNumber", {
          type: "validate",
          message: t("error.invalidAgencyNumber"),
        });
        return;
      }

      // Check if Agent object exists
      if (!agentInfo.Agent || typeof agentInfo.Agent !== 'object') {
        console.warn('Agent data is missing or invalid:', agentInfo);
        setError("agencyNumber", {
          type: "validate",
          message: t("error.invalidAgencyNumber"),
        });
        return;
      }

      // ERROR branch: no data or explicit error details
      const hasNoData =
        agentInfo.Agent.ErrorDescription === "SuccessNoData" ||
        (Array.isArray(agentInfo.ErrorDetails) &&
          agentInfo.ErrorDetails.length > 0);

      if (hasNoData) {
        // pull out an actual array
        const errorDetailsArr = Array.isArray(agentInfo?.ErrorDetails)
          ? agentInfo!.ErrorDetails!
          : [];

        const errorDesc = errorDetailsArr.find(
          (d) => d.ErrorDesc !== undefined
        )?.ErrorDesc;

        setError("agencyNumber", {
          type: "validate",
          message: errorDesc || t("error.invalidAgencyNumber"),
        });

        // clear agency fields
        [
          "agencyNumber",
          "agentName",
          "agencyStatus",
          "agencySource",
          "Agent_CurrentPlaceOfWork",
          "Agent_ResidencyAddress",
        ].forEach((f) => {
          memoizedSetValue(f as any, "");
          memoizedClearErrors(f);
        });

        // [
        //   "workerAgentIdNumber",
        //   "workerAgentDateOfBirthHijri",
        //   "gregorianDate",
        //   "userName",
        //   "region",
        //   "city",
        //   "occupation",
        //   "gender",
        //   "nationality",
        //   "hijriDate",
        //   "phoneNumber",
        // ].forEach((f) => {
        //   setValue(f as any, "");
        //   clearErrors(f);
        // });

        return;
      }

      if (agentInfo?.Agent?.ErrorDescription === "Success") {
        memoizedSetValue("agentName", agentInfo?.Agent.AgentName || "");
        memoizedSetValue("agencyStatus", agentInfo?.Agent.MandateStatus || "");
        memoizedSetValue("agencySource", agentInfo?.Agent.MandateSource || "");
        toast.success(t("agencyFound"));
        memoizedClearErrors("agencyNumber");
        errorToastShownRef.current = false; 
      }
    } catch (error) {
      console.error('Error processing agent info:', error);
      // Fallback error handling
      setError("agencyNumber", {
        type: "validate",
        message: t("error.invalidAgencyNumber"),
      });
      setIsAgencyValidating(false);
    }
    }, [agentInfo, isAgentFetching, memoizedSetValue, memoizedSetError, memoizedClearErrors, t]);

    const idNumber = watch("idNumber");

    useEffect(() => {
      if (
        claimantStatus === "representative" &&
        representativeId &&
        representativeId.length === 10 
      ) {
        if (representativeId === userId) {
          toast.error(t("error.cannotUseOwnId"));
          memoizedSetValue("workerAgentIdNumber", "");
          memoizedClearErrors("workerAgentIdNumber");
          [
            "workerAgentDateOfBirthHijri",
            "gregorianDate",
            "userName",
            "region",
            "city",
            "occupation",
            "gender",
            "nationality",
            "hijriDate",
            "phoneNumber",
          ].forEach((f) => {
            memoizedSetValue(f as any, "");
            memoizedClearErrors(f);
          });
        } else if (
          agentType === "local_agency" &&
          !allowedIds.includes(representativeId)
        ) {
          // Always validate and show error for invalid ID
          memoizedSetError("idNumber", {
            type: "validate",
            message: t("error.idNotUnderAgency"),
          });
          toast.error(t("error.idNotUnderAgency"));
          [
            "workerAgentIdNumber",
            "workerAgentDateOfBirthHijri",
            "gregorianDate",
            "userName",
            "region",
            "city",
            "occupation",
            "gender",
            "nationality",
            "hijriDate",
            "phoneNumber",
          ].forEach((f) => {
            memoizedSetValue(f as any, "");
            memoizedClearErrors(f);
          });
        } else {
          if (errors.idNumber) {
            memoizedClearErrors("idNumber");
          }
        }
      }
    }, [
      claimantStatus,
      representativeId,
      allowedIds,
      userId,
      memoizedSetValue,
      memoizedSetError,
      memoizedClearErrors,
      t,
      idNumber,
      errors,
      agentType,
      agentInfo,
    ]);

    // Additional validation effect to ensure validation runs on every ID change
    useEffect(() => {
      if (
        claimantStatus === "representative" &&
        agentType === "local_agency" &&
        representativeId &&
        representativeId.length === 10 &&
        allowedIds.length > 0
      ) {
        // Always validate the current ID against allowed IDs
        const isValidId = allowedIds.includes(representativeId);
        
        if (!isValidId) {
          memoizedSetError("idNumber", {
            type: "validate",
            message: t("error.idNotUnderAgency"),
          });
        } else {
          memoizedClearErrors("idNumber");
        }
      }
    }, [representativeId, allowedIds, claimantStatus, agentType, memoizedSetError, memoizedClearErrors, t]);

    const embasyUserData = getCookie("storeAllUserTypeData");
    const embassyUserNationalityCode =
      embasyUserData?.EmbassyInfo?.[0]?.Nationality_Code;
    const watchedNationality = useWatch({ control, name: "nationality" });

    const nationalityToastShownOnceRef = useRef(false);

    useEffect(() => {
      const isPrincipal = claimantStatus === "principal";
      const nicResponse = isPrincipal ? principalNICResponse : representativeNICResponse;
      const id = isPrincipal ? principalId : representativeId;
      const dob = isPrincipal ? principalDob : representativeDob;

      if (
        !nicLoading &&
        id?.length === 10 &&
        dob?.length === 8 &&
        nicResponse?.NICDetails
      ) {
        const nicNationality = nicResponse.NICDetails.Nationality_Code || "";
        const formNationality =
          typeof watchedNationality === "object"
            ? watchedNationality?.value
            : watchedNationality || "";

        const isMismatch =
          embassyUserNationalityCode &&
          nicNationality &&
          embassyUserNationalityCode.trim().toUpperCase() !== formNationality.trim().toUpperCase();

        // Show toast ONCE only — forever, regardless of future changes
        if (isMismatch && !nationalityToastShownOnceRef.current) {
          nationalityToastShownOnceRef.current = true;
          toast.error(t("error.nationalityMismatch"));
        }
      }
    }, [
      nicLoading,
      principalNICResponse,
      representativeNICResponse,
      principalId,
      representativeId,
      principalDob,
      representativeDob,
      claimantStatus,
      t,
      embassyUserNationalityCode,
      watchedNationality,
    ]);

    // --- Save mutation ---
    const [saveClaimantDetails] = useSaveClaimantDetailsMutation();
    const handleSubmitStep = async () => {
      console.log("🚀 handleSubmitStep called");
      
      try {
        const formData = watch();
        
        console.log("=== handleSubmitStep Debug ===");
        console.log("User Type:", userType);
        console.log("Claimant Status:", claimantStatus);
        console.log("Full Form Data:", formData);
        
        // Select the appropriate NIC response based on user type and agent type
        let nicDetailObj = null;
        
        if (userType?.toLowerCase().includes("embassy user")) {
          console.log("Processing Embassy User");
          // For embassy users, use the embassy agent NIC data if available
          if (claimantStatus === "principal") {
            console.log("Processing Embassy Principal");
            // For embassy principal, construct NIC data with proper structure including codes
            const nicDetails = principalNICResponse?.NICDetails;
            if (nicDetails) {
              nicDetailObj = {
                PlaintiffName: nicDetails.PlaintiffName || "",
                DateOfBirthHijri: nicDetails.DateOfBirthHijri || "",
                DateOfBirthGregorian: nicDetails.DateOfBirthGregorian || "",
                PhoneNumber: nicDetails.PhoneNumber || "",
                Region_Code: nicDetails.Region_Code || "",
                City_Code: nicDetails.City_Code || "",
                Occupation_Code: nicDetails.Occupation_Code || "",
                Gender_Code: nicDetails.Gender_Code || "",
                Nationality_Code: nicDetails.Nationality_Code || "",
                Applicant: nicDetails.Applicant || "",
                Applicant_Code: nicDetails.Applicant_Code || "",
                // Add the display values
                Region: nicDetails.Region || "",
                City: nicDetails.City || "",
                Occupation: nicDetails.Occupation || "",
                Gender: nicDetails.Gender || "",
                Nationality: nicDetails.Nationality || "",
              };
            } else {
              nicDetailObj = null;
            }
            console.log("Principal NIC Details Object:", nicDetailObj);
          } else if (claimantStatus === "representative") {
            console.log("Processing Embassy Agent");
            // For embassy agents, ALWAYS construct NIC data from the form fields
            // This ensures we never use the principal's NIC data for agents
            
            // Get embassy info to ensure nationality matches
            const embasyUserData = getCookie("storeAllUserTypeData");
            const embassyInfo = embasyUserData?.EmbassyInfo?.[0];
            
            // Debug: Log the form data to see what we have
            console.log("Embassy Agent Form Data:", {
              userName: formData?.embassyAgent_userName,
              idNumber: formData?.embassyAgent_workerAgentIdNumber,
              hijriDOB: formData?.embassyAgent_workerAgentDateOfBirthHijri,
              gregorianDOB: formData?.embassyAgent_gregorianDate,
              phoneNumber: formData?.embassyAgent_phoneNumber,
              region: formData?.embassyAgent_region,
              city: formData?.embassyAgent_city,
              occupation: formData?.embassyAgent_occupation,
              gender: formData?.embassyAgent_gender,
              nationality: formData?.embassyAgent_nationality,
              applicant: formData?.embassyAgent_applicant,
            });
            
            // Always construct NIC data from the form fields for embassy agents
            // This ensures we use the agent's data, not the principal's cached data
            nicDetailObj = {
              PlaintiffName: formData?.embassyAgent_userName || "",
              DateOfBirthHijri: formData?.embassyAgent_workerAgentDateOfBirthHijri || "",
              DateOfBirthGregorian: formData?.embassyAgent_gregorianDate || "",
              PhoneNumber: formData?.embassyAgent_phoneNumber || "",
              Region_Code: formData?.embassyAgent_region?.value || formData?.embassyAgent_region || "",
              City_Code: formData?.embassyAgent_city?.value || formData?.embassyAgent_city || "",
              Occupation_Code: formData?.embassyAgent_occupation?.value || formData?.embassyAgent_occupation || "",
              Gender_Code: formData?.embassyAgent_gender?.value || formData?.embassyAgent_gender || "",
              // Use the nationality from the form (which should match embassy nationality after validation)
              Nationality_Code: formData?.embassyAgent_nationality?.value || formData?.embassyAgent_nationality || "",
              Applicant: formData?.embassyAgent_applicant || "",
              Applicant_Code: formData?.embassyAgent_applicant === "DW1" ? "DW1" : formData?.embassyAgent_applicant === "DW2" ? "DW2" : "",
              // Add the actual values from NIC response
              Region: formData?.embassyAgent_region?.label || formData?.embassyAgent_region || "",
              City: formData?.embassyAgent_city?.label || formData?.embassyAgent_city || "",
              Occupation: formData?.embassyAgent_occupation?.label || formData?.embassyAgent_occupation || "",
              Gender: formData?.embassyAgent_gender?.label || formData?.embassyAgent_gender || "",
              Nationality: formData?.embassyAgent_nationality?.label || formData?.embassyAgent_nationality || "",
            };
            
            console.log("Agent NIC Details Object:", nicDetailObj);
          }
        } else {
          console.log("Processing Non-Embassy User");
          // For non-embassy users, use the existing logic
          if (claimantStatus === "principal") {
            nicDetailObj = principalNICResponse?.NICDetails || null;
          } else if (claimantStatus === "representative") {
            if (agentType === "local_agency") {
              nicDetailObj = localAgentNICResponse?.NICDetails || null;
            } else if (agentType === "external_agency") {
              nicDetailObj = externalAgentNICResponse?.NICDetails || null;
            } else {
              nicDetailObj = representativeNICResponse?.NICDetails || null;
            }
          }
        }
        
        console.log("Final NIC Details Object:", nicDetailObj);
        
        // Use the appropriate payload builder based on user type
        let payload;
        if (userType?.toLowerCase().includes("embassy user")) {
          // For embassy users, use the embassy-specific payload function
          const { emabsyClaimantPayload: embassyPayload } = await import("@/features/initiate-hearing/api/create-case/payloads");
          payload = embassyPayload(
            "Next",
            formData,
            getCookie("caseId") || "",
            userClaims,
            lang,
            userType,
            nicDetailObj
          );
        } else {
          // For non-embassy users, use the regular payload function
          payload = claimantDetailsPayload(
            "Next",
            formData,
            userClaims,
            formData?.isDomestic,
            nicDetailObj, // pass the appropriate NIC details
            null, // pass attorneyData if available
            userType,
            getCookie("caseId") || "",
            lang
          );
        }
        const isCaseCreated = !!getCookie("caseId");
        await saveClaimantDetails({ data: payload, isCaseCreated });
      } catch (error) {
        console.error("Error in handleSubmitStep:", error);
        throw error;
      }
    };

    // --- Establishment & Legal-Rep ---
    const { data: est } = useGetEstablishmentDetailsQuery(
      {
        AcceptedLanguage: lang,
        SourceSystem: "E-Services",
        FileNumber: userClaims?.File_Number || skipToken,
      },
      { skip: !userClaims?.File_Number }
    );
    const { data: legalRep } = useGetUserTypeLegalRepQuery(
      {
        IDNumber: userId,
        UserType: userClaims?.UserType,
        AcceptedLanguage: lang,
        SourceSystem: "E-Services",
      },
      { skip: watch("plaintiffStatus") !== "legal_representative" }
    );

    const apiLoadingStates = {
      agent: isAgencyValidating,
      nic: claimantStatus === "principal" ? nicLoading : nicLoading,
      estab: false,
      incomplete: false,
    };

    const loadFormLayoutFunction = () => {
      if (userType?.toLowerCase().includes("establishment")) {
        return useEstablishmentPlaintiffFormLayout({
          establishmentDetails: est?.EstablishmentInfo?.[0] || null,
          apiLoadingStates,
          regionData: regionData?.DataElements,
          cityData: cityData?.DataElements,
          setValue: setValue,
        });
      }
      if (userType?.toLowerCase().includes("legal representative")) {
        return useLegalRepPlaintiffFormLayout(
          watch as any,
          legalRep,
          setValue as any
        );
      }
      if (userType?.toLowerCase().includes("embassy user")) {
        // Map lookup data to { value, label } format for embassy forms
        const mapOptions = (data: {
          DataElements?: { ElementKey: string; ElementValue: string }[];
        }) =>
          data?.DataElements?.map(
            (item: { ElementKey: string; ElementValue: string }) => ({
              value: item.ElementKey,
              label: item.ElementValue,
            })
          ) || [];
        return EmbassyClaimantFormLayout({
          control,
          setValue: setValue as any,
          watch: watch as any,
          RegionOptions: mapOptions(regionData),
          CityOptions: mapOptions(cityData),
          OccupationOptions: mapOptions(occupationData),
          GenderOptions: mapOptions(genderData),
          NationalityOptions: mapOptions(nationalityData),
          setError: setError,
          clearErrors: clearErrors,
          isVerified,
        });
      }
      // Default return if no specific user type matches
      return useFormLayout({
        control,
        setValue: setValue as any,
        watch: watch as any,
        plaintiffRegionData: regionData?.DataElements,
        plaintiffCityData: cityData?.DataElements,
        occupationData: occupationData?.DataElements,
        genderData: genderData?.DataElements,
        nationalityData: nationalityData?.DataElements,
        countryData: countryData?.DataElements,
        sendOtpHandler,
        lastSentOtp,
        isVerified,
        isNotVerified,
        setIsNotVerified,
        agentInfoData: (agentInfo ?? {}) as AgentInfo,
        apiLoadingStates: {
          agent: isAgencyValidating,
          nic: claimantStatus === "principal" ? nicLoading : nicLoading,
          estab: false,
          incomplete: false,
        },
        userTypeLegalRepData: legalRep,
        onAgencyNumberChange: (value: string) => {
          if (
            value.length >= 1 &&
            value.length <= 10 &&
            watch("agentType") === "local_agency"
          ) {
            setIsAgencyValidating(true);
            setError("agencyNumber", {
              type: "validate",
              message: t("validatingAgencyNumber"),
            });
            if (!isUninitialized && refetchAttorneyDetails) {
              refetchAttorneyDetails();
            }
          } else {
            setValue("agentName", "");
            setValue("agencyStatus", "");
            setValue("agencySource", "");
            setIsAgencyValidating(false);
          }
        },
        setError: setError,
        clearErrors: clearErrors,
        verifyOtp: sendOtpHandler,
        isVerify: isVerified,
        principalNICResponse,
        principalNICRefetch,
        representativeNICResponse,
        localAgentNICResponse, // pass localAgentNICResponse
        externalAgentNICResponse, // pass externalAgentNICResponse
        register,
        errors,
        trigger,
        isValid,
        // addthion
        allowedIds,
      });
    };

    const rightLayout = loadFormLayoutFunction();

    useEffect(() => {
      if (externalAgentNICResponse?.NICDetails && agentType === "external_agency") {
        const d = externalAgentNICResponse.NICDetails;
        memoizedSetValue("externalAgent_userName", d.PlaintiffName || "");
        memoizedSetValue("externalAgent_region", d.Region_Code ? { value: d.Region_Code, label: d.Region } : null);
        memoizedSetValue("externalAgent_city", d.City_Code ? { value: d.City_Code, label: d.City } : null);
        memoizedSetValue("externalAgent_occupation", d.Occupation_Code ? { value: d.Occupation_Code, label: d.Occupation } : null);
        memoizedSetValue("externalAgent_gender", d.Gender_Code ? { value: d.Gender_Code, label: d.Gender } : null);
        memoizedSetValue("externalAgent_nationality", d.Nationality_Code ? { value: d.Nationality_Code, label: d.Nationality } : null);
        memoizedSetValue("externalAgent_phoneNumber", d.PhoneNumber ? d.PhoneNumber.toString() : "");
      }
    }, [externalAgentNICResponse, agentType, memoizedSetValue]);

    // Auto-fill city field from NIC/lookup response for all user types
    useEffect(() => {
      // Embassy agent
      if (isEmbassyUserForPrefill && claimantStatus === "representative" && externalAgentNICResponse?.NICDetails) {
        const d = externalAgentNICResponse.NICDetails;
        memoizedSetValue("embassyAgent_city", d.City_Code ? { value: d.City_Code, label: d.City } : null);
      }
      // Embassy principal
      if (isEmbassyUserForPrefill && claimantStatus === "principal" && externalAgentNICResponse?.NICDetails) {
        const d = externalAgentNICResponse.NICDetails;
        memoizedSetValue("city", d.City_Code ? { value: d.City_Code, label: d.City } : null);
      }
      // Establishment
      if (isEstablishmentUser && externalAgentNICResponse?.NICDetails) {
        const d = externalAgentNICResponse.NICDetails;
        memoizedSetValue("establishment_city", d.City_Code ? { value: d.City_Code, label: d.City } : null);
      }
      // Worker principal
      if (!isEmbassyUserForPrefill && !isEstablishmentUser && claimantStatus === "principal" && externalAgentNICResponse?.NICDetails) {
        const d = externalAgentNICResponse.NICDetails;
        memoizedSetValue("principal_city", d.City_Code ? { value: d.City_Code, label: d.City } : null);
      }
      // Worker agent (local)
      if (!isEmbassyUserForPrefill && !isEstablishmentUser && claimantStatus === "representative" && agentType === "local_agency" && externalAgentNICResponse?.NICDetails) {
        const d = externalAgentNICResponse.NICDetails;
        memoizedSetValue("localAgent_city", d.City_Code ? { value: d.City_Code, label: d.City } : null);
      }
      // Worker agent (external)
      if (!isEmbassyUserForPrefill && !isEstablishmentUser && claimantStatus === "representative" && agentType === "external_agency" && externalAgentNICResponse?.NICDetails) {
        const d = externalAgentNICResponse.NICDetails;
        memoizedSetValue("externalAgent_city", d.City_Code ? { value: d.City_Code, label: d.City } : null);
      }
      // Worker default
      if (!isEmbassyUserForPrefill && !isEstablishmentUser && claimantStatus !== "principal" && claimantStatus !== "representative" && externalAgentNICResponse?.NICDetails) {
        const d = externalAgentNICResponse.NICDetails;
        memoizedSetValue("plaintiffCity", d.City_Code ? { value: d.City_Code, label: d.City } : null);
      }
    }, [externalAgentNICResponse, agentType, memoizedSetValue, isEmbassyUserForPrefill, isEstablishmentUser, claimantStatus]);

    // Double-check local agent NIC call and effect
    useEffect(() => {
      if (localAgentNICResponse?.NICDetails && agentType === "local_agency") {
        const d = localAgentNICResponse.NICDetails;
        memoizedSetValue("localAgent_city", d.City_Code ? { value: d.City_Code, label: d.City } : null);
      }
      if (isEstablishmentUser && localAgentNICResponse?.NICDetails) {
        const d = localAgentNICResponse.NICDetails;
        memoizedSetValue("establishment_city", d.City_Code ? { value: d.City_Code, label: d.City } : null);
      }
      if (!isEmbassyUserForPrefill && !isEstablishmentUser && claimantStatus === "principal" && localAgentNICResponse?.NICDetails) {
        const d = localAgentNICResponse.NICDetails;
        memoizedSetValue("principal_city", d.City_Code ? { value: d.City_Code, label: d.City } : null);
      }
      if (!isEmbassyUserForPrefill && !isEstablishmentUser && claimantStatus !== "principal" && claimantStatus !== "representative" && localAgentNICResponse?.NICDetails) {
        const d = localAgentNICResponse.NICDetails;
        memoizedSetValue("plaintiffCity", d.City_Code ? { value: d.City_Code, label: d.City } : null);
      }
    }, [localAgentNICResponse, agentType, memoizedSetValue, isEmbassyUserForPrefill, isEstablishmentUser, claimantStatus]);

    // Add debug logs for isValid and errors
    // console.log('[DEBUG Next Button] isValid:', isValid, 'errors:', errors);

    // --- Clear fields when switching agent types ---
    const previousAgentTypeRef = useRef<string | undefined>();
    useEffect(() => {
      const currentAgentType = watch("agentType");
      
      if (previousAgentTypeRef.current && previousAgentTypeRef.current !== currentAgentType) {
        // Clear local agent fields when switching away from local_agency
        if (previousAgentTypeRef.current === "local_agency") {
          memoizedSetValue("localAgent_workerAgentIdNumber", "");
          memoizedSetValue("localAgent_workerAgentDateOfBirthHijri", "");
          memoizedSetValue("localAgent_gregorianDate", "");
          memoizedSetValue("localAgent_userName", "");
          memoizedSetValue("localAgent_phoneNumber", "");
          memoizedSetValue("localAgent_region", null);
          memoizedSetValue("localAgent_city", null);
          memoizedSetValue("localAgent_occupation", null);
          memoizedSetValue("localAgent_gender", null);
          memoizedSetValue("localAgent_nationality", null);
          memoizedClearErrors("localAgent_workerAgentIdNumber");
        }
        
        // Clear external agent fields when switching away from external_agency
        if (previousAgentTypeRef.current === "external_agency") {
          memoizedSetValue("externalAgent_workerAgentIdNumber", "");
          memoizedSetValue("externalAgent_workerAgentDateOfBirthHijri", "");
          memoizedSetValue("externalAgent_gregorianDate", "");
          memoizedSetValue("externalAgent_userName", "");
          memoizedSetValue("externalAgent_phoneNumber", "");
          memoizedSetValue("externalAgent_region", null);
          memoizedSetValue("externalAgent_city", null);
          memoizedSetValue("externalAgent_occupation", null);
          memoizedSetValue("externalAgent_gender", null);
          memoizedSetValue("externalAgent_nationality", null);
          memoizedClearErrors("externalAgent_workerAgentIdNumber");
        }
      }
      
      previousAgentTypeRef.current = currentAgentType;
    }, [watch("agentType"), memoizedSetValue, memoizedClearErrors]);

    // --- Clear fields when switching claimant status ---
    const previousClaimantStatusRef = useRef<string | undefined>();
    useEffect(() => {
      const currentClaimantStatus = watch("claimantStatus");
      
      if (previousClaimantStatusRef.current && previousClaimantStatusRef.current !== currentClaimantStatus) {
        // Clear principal fields when switching away from principal
        if (previousClaimantStatusRef.current === "principal") {
          memoizedSetValue("principal_hijriDate", "");
          memoizedSetValue("principal_gregorianDate", "");
          memoizedSetValue("principal_userName", "");
          memoizedSetValue("principal_phoneNumber", "");
          memoizedSetValue("principal_region", null);
          memoizedSetValue("principal_city", null);
          memoizedSetValue("principal_occupation", null);
          memoizedSetValue("principal_gender", null);
          memoizedSetValue("principal_nationality", null);
        }
        
        // Clear representative fields when switching away from representative
        if (previousClaimantStatusRef.current === "representative") {
          memoizedSetValue("workerAgentIdNumber", "");
          memoizedSetValue("workerAgentDateOfBirthHijri", "");
          memoizedSetValue("gregorianDate", "");
          memoizedSetValue("userName", "");
          memoizedSetValue("phoneNumber", "");
          memoizedSetValue("region", null);
          memoizedSetValue("city", null);
          memoizedSetValue("occupation", null);
          memoizedSetValue("gender", null);
          memoizedSetValue("nationality", null);
        }
      }
      
      previousClaimantStatusRef.current = currentClaimantStatus;
    }, [watch("claimantStatus"), memoizedSetValue]);

    // --- NIC Error Handling Effects ---
    useEffect(() => {
      // Handle external agent NIC errors
      if (externalAgentNICResponse?.ErrorDetails && agentType === "external_agency") {
        // Check for ER4054 service error first
        if (handleNICResponse(externalAgentNICResponse)) {
          return; // Error was handled by service error modal
        }
        
        const errorDesc = externalAgentNICResponse.ErrorDetails[0]?.ErrorDesc;
        if (errorDesc) {
          toast.error(errorDesc);
          // Clear date fields
          memoizedSetValue("externalAgent_workerAgentDateOfBirthHijri", "");
          memoizedSetValue("externalAgent_gregorianDate", "");
          // Clear other fields that depend on NIC
          memoizedSetValue("externalAgent_userName", "");
          memoizedSetValue("externalAgent_region", null);
          memoizedSetValue("externalAgent_city", null);
          memoizedSetValue("externalAgent_occupation", null);
          memoizedSetValue("externalAgent_gender", null);
          memoizedSetValue("externalAgent_nationality", null);
          memoizedSetValue("externalAgent_phoneNumber", "");
        }
      }
    }, [externalAgentNICResponse, agentType, handleNICResponse, memoizedSetValue]);

    useEffect(() => {
      // Handle local agent NIC errors
      if (localAgentNICResponse?.ErrorDetails && agentType === "local_agency") {
        // Check for ER4054 service error first
        if (handleNICResponse(localAgentNICResponse)) {
          return; // Error was handled by service error modal
        }
        
        const errorDesc = localAgentNICResponse.ErrorDetails[0]?.ErrorDesc;
        if (errorDesc) {
          toast.error(errorDesc);
          // Clear date fields
          memoizedSetValue("localAgent_workerAgentDateOfBirthHijri", "");
          memoizedSetValue("localAgent_gregorianDate", "");
          // Clear other fields that depend on NIC
          memoizedSetValue("localAgent_userName", "");
          memoizedSetValue("localAgent_region", null);
          memoizedSetValue("localAgent_city", null);
          memoizedSetValue("localAgent_occupation", null);
          memoizedSetValue("localAgent_gender", null);
          memoizedSetValue("localAgent_nationality", null);
          memoizedSetValue("localAgent_phoneNumber", "");
        }
      }
    }, [localAgentNICResponse, agentType, handleNICResponse, memoizedSetValue]);

    useEffect(() => {
      // Handle principal NIC errors
      if (principalNICResponse?.ErrorDetails && claimantStatus === "principal") {
        // Check for ER4054 service error first
        if (handleNICResponse(principalNICResponse)) {
          return; // Error was handled by service error modal
        }
        
        const errorDesc = principalNICResponse.ErrorDetails[0]?.ErrorDesc;
        if (errorDesc) {
          toast.error(errorDesc);
          // Clear date fields
          memoizedSetValue("principal_hijriDate", "");
          memoizedSetValue("principal_gregorianDate", "");
          // Clear other fields that depend on NIC
          memoizedSetValue("principal_userName", "");
          memoizedSetValue("principal_region", null);
          memoizedSetValue("principal_city", null);
          memoizedSetValue("principal_occupation", null);
          memoizedSetValue("principal_gender", null);
          memoizedSetValue("principal_nationality", null);
          memoizedSetValue("principal_phoneNumber", "");
        }
      }
    }, [principalNICResponse, claimantStatus, handleNICResponse, memoizedSetValue]);

    useEffect(() => {
      // Handle representative NIC errors
      if (representativeNICResponse?.ErrorDetails && claimantStatus === "representative") {
        // Check for ER4054 service error first
        if (handleNICResponse(representativeNICResponse)) {
          return; // Error was handled by service error modal
        }
        
        const errorDesc = representativeNICResponse.ErrorDetails[0]?.ErrorDesc;
        if (errorDesc) {
          toast.error(errorDesc);
          // Clear date fields
          memoizedSetValue("workerAgentDateOfBirthHijri", "");
          memoizedSetValue("gregorianDate", "");
          // Clear other fields that depend on NIC
          memoizedSetValue("userName", "");
          memoizedSetValue("region", null);
          memoizedSetValue("city", null);
          memoizedSetValue("occupation", null);
          memoizedSetValue("gender", null);
          memoizedSetValue("nationality", null);
          memoizedSetValue("phoneNumber", "");
        }
      }
    }, [representativeNICResponse, claimantStatus, handleNICResponse, memoizedSetValue]);

    // Principal NIC error handling (city field)
    useEffect(() => {
      if (principalNICResponse?.ErrorDetails && claimantStatus === "principal") {
        memoizedSetValue("principal_city", null);
      }
      if (isEstablishmentUser && principalNICResponse?.ErrorDetails) {
        memoizedSetValue("establishment_city", null);
      }
      if (isEmbassyUserForPrefill && claimantStatus === "principal" && principalNICResponse?.ErrorDetails) {
        memoizedSetValue("city", null);
      }
    }, [principalNICResponse, claimantStatus, memoizedSetValue, isEmbassyUserForPrefill, isEstablishmentUser]);

    return (
      <>
        {nicLoading && <Loader />}
        {isAgencyValidating && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-25 backdrop-blur-sm z-[9999]">
            <Loader />
          </div>
        )}

        <div
          className={`relative ${isAgencyValidating || nicLoading ? "pointer-events-none" : ""
            }`}
        >
          <div className={isAgencyValidating || nicLoading ? "blur-sm" : ""}>
            <PureClaimantDetails
              register={register}
              errors={errors}
              setValue={setValue}
              watch={watch}
              control={control}
              formLayout={rightLayout}
              nicIsLoading={apiLoadingStates.nic}
            />
          </div>
        </div>
      </>
    );
  };

export default withStepNavigation(ClaimantDetailsContainer);
