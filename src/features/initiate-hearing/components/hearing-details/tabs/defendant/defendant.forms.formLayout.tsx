import { UseFormSetValue, UseFormWatch, UseFormTrigger } from "react-hook-form";
import {
  Option,
  SectionLayout,
  FormData,
} from "@/shared/components/form/form.types";
import { useFormOptions } from "./defendant.forms.formOptions";
import { useTranslation } from "react-i18next";
import { isArray } from "@/shared/lib/helpers";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { options } from "@/features/initiate-hearing/config/Options";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import EstablishmentSelectionSkeleton from "@/shared/components/loader/EstablishmentLoader";
import {
  useGetEstablishmentDetailsQuery,
  useGetExtractedEstablishmentDataQuery,
  useLazyGetEstablishmentDetailsQuery,
} from "@/features/initiate-hearing/api/create-case/defendantDetailsApis";
import { TokenClaims } from "@/features/login/components/AuthProvider";
import { toast } from "react-toastify";
import {
  useGetWorkerCityLookupDataQuery,
  useGetWorkerRegionLookupDataQuery,
} from "@/features/initiate-hearing/api/create-case/plaintiffDetailsApis";
import { skipToken } from "@reduxjs/toolkit/query";
import { UserTypesEnum } from "@/shared/types/userTypes.enum";
import { useFormResetContext } from "@/providers/FormResetProvider";
import { useAPIFormsData } from "@/providers/FormContext";
import { useDebouncedCallback } from "@/shared/hooks/use-debounced-callback";

// Define establishment state interface
interface EstablishmentState {
  status: 'idle' | 'loading' | 'success' | 'error' | 'not_found';
  data: any;
  originalValues: { fileNumber: string; crNumber: string };
  hasLoaded: boolean;
  lastRequestId: string;
}

export const useFormLayout = (
  setValue: UseFormSetValue<FormData>,
  watch: UseFormWatch<FormData>,
  trigger: UseFormTrigger<FormData>,
  governmentData?: any,
  subGovernmentData?: any,
  caseDetailsLoading?: boolean,
  defendantData?: any
): { layout: SectionLayout[]; isOnlyFileNumberFilled: () => boolean } => {
  const { resetField } = useFormResetContext();
  const { IsGovernmentRadioOptions } = useFormOptions([]);
  const [getCookie, setCookie] = useCookieState({ caseId: "" });
  const { t, i18n } = useTranslation("hearingdetails");
  const defendantStatus = watch("defendantStatus");
  const defendantDetails = watch("defendantDetails");
  const mainCategory = watch("main_category_of_the_government_entity" as keyof FormData);
  const subCategoryValue = watch("subcategory_of_the_government_entity" as keyof FormData);
  const establishmentValue = watch("EstablishmentData" as keyof FormData);
  const [prevMainCategory, setPrevMainCategory] = useState(mainCategory);
  const [hasInteractedWithSubCategory, setHasInteractedWithSubCategory] = useState(false);
  const [hasManuallySelectedSubCategory, setHasManuallySelectedSubCategory] = useState(false);
  const [idNumberPlainteff, setIdNumberPlainteff] = useState<string>("");

  // Unified establishment state management
  const [establishmentState, setEstablishmentState] = useState<EstablishmentState>({
    status: 'idle',
    data: null,
    originalValues: { fileNumber: '', crNumber: '' },
    hasLoaded: false,
    lastRequestId: ''
  });
  
  // Flag to track if user is manually changing File Number or CR Number
  const [isManuallyChangingNumbers, setIsManuallyChangingNumbers] = useState<boolean>(false);

  // Request cancellation
  const currentRequestRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const [selectedDataEstablishment, setSelectedDataEstablishment] = useState<boolean>(false);

  const {
    formState,
    formData
  } = useAPIFormsData();

  // Helper function to update establishment state with all required properties
  const updateEstablishmentState = useCallback((updates: Partial<EstablishmentState>) => {
    setEstablishmentState(prev => ({
      ...prev,
      ...updates,
      lastRequestId: updates.lastRequestId || prev.lastRequestId
    }));
  }, []);

  // Function to clear all establishment fields immediately when File Number or CR Number changes
  const clearAllEstablishmentFields = useCallback((shouldShowToast = true) => {
  if (formState.isSubmitting) return;

  console.log("=== CLEARING ALL ESTABLISHMENT FIELDS ===");

  // Clear all form fields immediately
  [
    "DefendantNumber700",
    "DefendantEstablishmentName",
    "defendantRegion",
    "defendantCity",
    "establishment_phoneNumber",
    "EstablishmentData",
    "Defendant_Establishment_data_NON_SELECTED"
  ].forEach((field) => {
    setValue(
      field as any,
      field.includes("Region") || field.includes("City") ? null : "",
      {
        shouldValidate: false,
        shouldDirty: true,
      }
    );
  });

  // Reset establishment state
  updateEstablishmentState({
    status: 'idle',
    data: null,
    hasLoaded: false,
    originalValues: { fileNumber: '', crNumber: '' },
    lastRequestId: ''
  });

  if (shouldShowToast) {
    toast.info(t("establishmentFieldsCleared"));
  }

  console.log("=== ALL ESTABLISHMENT FIELDS CLEARED ===");
}, [formState.isSubmitting, setValue, updateEstablishmentState, t]);

  // Improved function to check if values have changed and clear data if needed
  const checkAndClearDataIfChanged = useCallback(() => {
    if (formState.isSubmitting) return;

    const currentFileNumber = watch("DefendantFileNumber");
    const currentCRNumber = watch("DefendantCRNumber");

    // Only check if we have actually loaded establishment data
    if (establishmentState.hasLoaded && establishmentState.status === 'success' && establishmentState.data) {
      // Check if either FileNumber or CRNumber has changed from the original values
      if (currentFileNumber !== establishmentState.originalValues.fileNumber || currentCRNumber !== establishmentState.originalValues.crNumber) {
        console.log("Values changed, clearing all establishment data...");

        // Clear all establishment data
        updateEstablishmentState({ status: 'idle', data: null, hasLoaded: false });

        // Clear form fields related to establishment (but keep FileNumber and CRNumber) with more explicit clearing
        console.log("Clearing defendantRegion...");
        setValue("defendantRegion", null, { shouldValidate: false, shouldDirty: true });

        console.log("Clearing defendantCity...");
        setValue("defendantCity", null, { shouldValidate: false, shouldDirty: true });

        console.log("Clearing establishment_phoneNumber...");
        setValue("establishment_phoneNumber", "", { shouldValidate: false, shouldDirty: true });

        console.log("Clearing DefendantNumber700...");
        setValue("DefendantNumber700", "", { shouldValidate: false, shouldDirty: true });

        console.log("Clearing DefendantEstablishmentName...");
        setValue("DefendantEstablishmentName", "", { shouldValidate: false, shouldDirty: true });

        // Clear any other establishment-related fields that might be set
        console.log("Clearing EstablishmentData...");
        setValue("EstablishmentData", undefined, { shouldValidate: false, shouldDirty: true });

        console.log("Clearing Defendant_Establishment_data_NON_SELECTED...");
        setValue("Defendant_Establishment_data_NON_SELECTED", undefined, { shouldValidate: false, shouldDirty: true });

        // Also clear any nested establishment data
        setValue("Defendant_Establishment_data_NON_SELECTED.region", null, { shouldValidate: false, shouldDirty: true });
        setValue("Defendant_Establishment_data_NON_SELECTED.city", null, { shouldValidate: false, shouldDirty: true });
        setValue("Defendant_Establishment_data_NON_SELECTED.Number700", "", { shouldValidate: false, shouldDirty: true });

        // Reset original values
        updateEstablishmentState({ originalValues: { fileNumber: '', crNumber: '' } });

        console.log("All establishment fields cleared due to value change");
      }
    }
  }, [watch, establishmentState, setValue]);

  // Improved function to clear all establishment-related data
  const clearEstablishmentData = useCallback(() => {
    if (formState.isSubmitting) return;

    updateEstablishmentState({ status: 'idle', data: null, originalValues: { fileNumber: '', crNumber: '' }, hasLoaded: false });

    // Clear form fields related to establishment
    setValue("DefendantFileNumber", "", { shouldValidate: false });
    setValue("DefendantCRNumber", "", { shouldValidate: false });
    setValue("defendantRegion", null, { shouldValidate: false });
    setValue("defendantCity", null, { shouldValidate: false });
    setValue("establishment_phoneNumber", "", { shouldValidate: false });
    setValue("DefendantNumber700", "", { shouldValidate: false });
    setValue("DefendantEstablishmentName", "", { shouldValidate: false });

    // Clear any other establishment-related fields that might be set
    setValue("EstablishmentData", undefined, { shouldValidate: false });
    setValue("Defendant_Establishment_data_NON_SELECTED", undefined, { shouldValidate: false });

    // Reset original values
    updateEstablishmentState({ originalValues: { fileNumber: '', crNumber: '' } });
  }, [formState.isSubmitting, setValue]);

  // Function to check if only file number or CR number is filled (for Next and Save button validation)
  const isOnlyFileNumberFilled = useCallback(() => {
    const fileNumber = watch("DefendantFileNumber");
    const crNumber = watch("DefendantCRNumber");
    const region = watch("defendantRegion");
    const city = watch("defendantCity");
    const phoneNumber = watch("establishment_phoneNumber");
    const number700 = watch("DefendantNumber700");
    const establishmentName = watch("DefendantEstablishmentName");
    const defendantStatus = watch("defendantStatus");
    const defendantDetails = watch("defendantDetails");
    const mainCategory = watch("main_category_of_the_government_entity");
    const subCategory = watch("subcategory_of_the_government_entity");
    const establishmentData = watch("Defendant_Establishment_data_NON_SELECTED");

    // Check if only file number or CR number has a value and all other fields are empty/null
    // AND establishment data is not loaded
    return (!!fileNumber || !!crNumber) &&
      !region &&
      !city &&
      !phoneNumber &&
      !number700 &&
      !establishmentName &&
      !defendantStatus &&
      !defendantDetails &&
      !mainCategory &&
      !subCategory &&
      (!establishmentData || !establishmentData.EstablishmentName || (!establishmentData.FileNumber && !establishmentData.CRNumber));
  }, [watch]);

  //#region hassan
  const userClaims: TokenClaims = getCookie("userClaims");
  const userType = getCookie("userType");
  const [wrorkedEstablishmetUsers, setWrorkedEstablishmetUsers] = useState<Array<{ label: string; value: string }>>([
    {
      label: t("others"),
      value: "Others",
    },
  ]);

  useEffect(() => {
    if (caseDetailsLoading && defendantData) {
      try {
        const caseDetails = defendantData;
        if (!caseDetails || caseDetails === "null" || caseDetails === "") {
          setIdNumberPlainteff("");
          return;
        }
        setIdNumberPlainteff(caseDetails?.PlaintiffId || "");
      } catch (error) {
        setIdNumberPlainteff("");
      }
    }
  }, [caseDetailsLoading, defendantData])

  const { data: getEstablismentWorkingData, isLoading: ExtractEstDataLoading } =
    useGetExtractedEstablishmentDataQuery(
      {
        WorkerId: idNumberPlainteff,
        AcceptedLanguage: i18n.language.toUpperCase(),
        SourceSystem: "E-Services",
        UserType: userType,
        CaseID: getCookie("caseId"),
      },
      {
        skip: !["Worker", "Embassy User"].includes(userType) || !caseDetailsLoading || idNumberPlainteff === ""
      }
    );

  useEffect(() => {
    if (
      getEstablismentWorkingData && getEstablismentWorkingData?.EstablishmentData &&
      getEstablismentWorkingData?.EstablishmentData?.length !== 0
    ) {
      const establishments = getEstablismentWorkingData?.EstablishmentData?.map((est: any) => ({
        label: est.EstablishmentName,
        value:
          est.EstablishmentID ||
          est.FileNumber ||
          est.CRNumber ||
          est.EstablishmentName,
      })).concat({
        label: t("others"),
        value: "Others",
      });
      setWrorkedEstablishmetUsers(establishments);
    } else {
      // When no establishment data, show "Others" as the only option
      setWrorkedEstablishmetUsers([{
        label: t("others"),
        value: "Others",
      }]);
      // Set defendantDetails to "Others" to show the full options
      setValue("defendantDetails", "Others");
    }
  }, [getEstablismentWorkingData?.EstablishmentData?.length, setValue, t]);

  useEffect(() => {
    if (defendantDetails === undefined)
      setValue("defendantDetails", "Others")
  }, [defendantDetails])

  // Improved prefill from case details
  useEffect(() => {
    if (caseDetailsLoading) {
      try {
        const storedData = localStorage.getItem("DefendantDetails");
        if (!storedData || storedData === "null" || storedData === "") {
          return;
        }
        const caseDetails = JSON.parse(storedData);
        if (caseDetails) {
          // Handle establishment data prefill
          if (caseDetails.DefendantType === "Establishment" && (caseDetails.DefendantEstFileNumber || caseDetails.Defendant_CRNumber)) {
            // Set defendant status to Establishment to show the correct section
            setValue("defendantStatus", "Establishment");

            // Set file number and CR number only if user is not manually changing them
            if (!isManuallyChangingNumbers) {
              setValue("DefendantFileNumber", caseDetails.DefendantEstFileNumber || "");
              setValue("DefendantCRNumber", caseDetails.Defendant_CRNumber || "");
            }

            // Create establishment data object with all available fields
            const establishmentData = {
              EstablishmentName: caseDetails.EstablishmentFullName || caseDetails.DefendantName || "",
              FileNumber: caseDetails.DefendantEstFileNumber || "",
              CRNumber: caseDetails.Defendant_CRNumber || "",
              Number700: caseDetails.Defendant_Number700 || "",
              Region: caseDetails.Defendant_Region || "",
              Region_Code: caseDetails.Defendant_Region_Code || "",
              City: caseDetails.Defendant_City || "",
              City_Code: caseDetails.Defendant_City_Code || "",
              region: null,
              city: null,
            };

            // Only set establishment data if user is not manually changing numbers
            if (!isManuallyChangingNumbers) {
              setValue("Defendant_Establishment_data_NON_SELECTED", establishmentData);

              // Set region and city if available
              if (caseDetails.Defendant_Region_Code && caseDetails.Defendant_Region) {
                setValue("defendantRegion", {
                  value: caseDetails.Defendant_Region_Code,
                  label: caseDetails.Defendant_Region,
                });
              }
              if (caseDetails.Defendant_City_Code && caseDetails.Defendant_City) {
                setValue("defendantCity", {
                  value: caseDetails.Defendant_City_Code,
                  label: caseDetails.Defendant_City,
                });
              }

              // Set phone number
              if (caseDetails.Defendant_PhoneNumber) {
                setValue("establishment_phoneNumber", caseDetails.Defendant_PhoneNumber);
              }
            }

            // Set establishment details in state for display only if user is not manually changing numbers
            if (!isManuallyChangingNumbers) {
              setEstablishmentState({
                status: 'success',
                data: establishmentData,
                originalValues: { fileNumber: caseDetails.DefendantEstFileNumber || '', crNumber: caseDetails.Defendant_CRNumber || '' },
                hasLoaded: true,
                lastRequestId: ''
              });

              // Store the original values that were used to fetch this data
              updateEstablishmentState({
                originalValues: { fileNumber: caseDetails.DefendantEstFileNumber || '', crNumber: caseDetails.Defendant_CRNumber || '' },
                lastRequestId: ''
              });
            }

            // Trigger establishment data fetch to ensure all data is loaded
            if (caseDetails.DefendantEstFileNumber || caseDetails.Defendant_CRNumber) {
              const params: any = {
                AcceptedLanguage: "EN"
              };

              if (caseDetails.DefendantEstFileNumber) {
                params.FileNumber = caseDetails.DefendantEstFileNumber;
              }

              if (caseDetails.Defendant_CRNumber) {
                params.CRNumber = caseDetails.Defendant_CRNumber;
              }

              triggerGetEstablishmentData(params);
            }
          }

          // Handle government entity data prefill
          if (caseDetails.DefendantType_Code === "Government") {
            // Set defendant status to Government to show the correct section
            setValue("defendantStatus", "Government");
            setValue("defendantDetails", "Government");

            // Set main government category
            if (caseDetails.Defendant_MainGovtDefend_Code && caseDetails.Defendant_MainGovtDefend) {
              setValue("main_category_of_the_government_entity", {
                value: caseDetails.Defendant_MainGovtDefend_Code,
                label: caseDetails.Defendant_MainGovtDefend,
              } as any);
            }

            // Set sub government category
            if (caseDetails.DefendantSubGovtDefend_Code && caseDetails.DefendantSubGovtDefend) {
              setValue("subcategory_of_the_government_entity", {
                value: caseDetails.DefendantSubGovtDefend_Code,
                label: caseDetails.DefendantSubGovtDefend,
              } as any);
            }

            // Set phone number if available
            if (caseDetails.Defendant_PhoneNumber && caseDetails.Defendant_PhoneNumber !== "0") {
              setValue("establishment_phoneNumber", caseDetails.Defendant_PhoneNumber);
            }
          }
        }
      } catch (error) {
        console.error("Error parsing defendant details:", error);
      }
    }
  }, [caseDetailsLoading, setValue, isManuallyChangingNumbers]);

  // to get establishment data from field input
  const [
    triggerGetEstablishmentData,
    { data: establishmentData, isLoading: isEstablishmentLoading },
  ] = useLazyGetEstablishmentDetailsQuery();

  // Improved useEffect to handle establishment data
  useEffect(() => {
    console.log("establishmentData useEffect triggered with:", establishmentData);
    console.log("isManuallyChangingNumbers:", isManuallyChangingNumbers);

    // Don't process establishment data if user is manually changing numbers
    if (isManuallyChangingNumbers) {
      console.log("Skipping establishment data processing - user is manually changing numbers");
      return;
    }

    if (establishmentData) {
      if (establishmentData.EstablishmentInfo?.length) {
        const establishmentInfo = establishmentData.EstablishmentInfo[0];
        updateEstablishmentState({ status: 'success', data: establishmentInfo, originalValues: { fileNumber: establishmentInfo.FileNumber || '', crNumber: establishmentInfo.CRNumber || '' }, hasLoaded: true });
        setCookie("getDefendEstablishmentData", establishmentInfo);
        setCookie("defendantDetails", establishmentInfo);
        setValue("Defendant_Establishment_data_NON_SELECTED", establishmentInfo);
        if (!watch("DefendantFileNumber") || watch("DefendantFileNumber") === establishmentState.originalValues.fileNumber) {
          setValue("DefendantFileNumber", establishmentInfo.FileNumber || "");
        }
        if (!watch("DefendantCRNumber") || watch("DefendantCRNumber") === establishmentState.originalValues.crNumber) {
          setValue("DefendantCRNumber", establishmentInfo.CRNumber || "");
        }
        if (establishmentInfo.Region && establishmentInfo.Region_Code) {
          setValue("defendantRegion", { label: establishmentInfo.Region, value: establishmentInfo.Region_Code });
          setValue("Defendant_Establishment_data_NON_SELECTED.region", { label: establishmentInfo.Region, value: establishmentInfo.Region_Code });
        }
        if (establishmentInfo.City && establishmentInfo.City_Code) {
          setValue("defendantCity", { label: establishmentInfo.City, value: establishmentInfo.City_Code });
          setValue("Defendant_Establishment_data_NON_SELECTED.city", { label: establishmentInfo.City, value: establishmentInfo.City_Code });
        }
        if (establishmentInfo.Number700) {
          setValue("Defendant_Establishment_data_NON_SELECTED.Number700", establishmentInfo.Number700);
        }
      } else {
        const status = establishmentData.EstablishmentInfo?.length === 0 ? 'not_found' : 'error';
        updateEstablishmentState({ status, data: null, originalValues: { fileNumber: '', crNumber: '' }, hasLoaded: false });
        clearAllEstablishmentFields();
      }
      // After processing is complete, reset the flag
      console.log("Establishment data processed, resetting isManuallyChangingNumbers flag");
      setIsManuallyChangingNumbers(false);
    }
  }, [establishmentData, setValue, setCookie, isManuallyChangingNumbers, updateEstablishmentState, watch, clearAllEstablishmentFields]);

  // Improved getEstablishmentDataByNumber function
  const getEstablishmentDataByNumber = useCallback(async () => {
    console.log("getEstablishmentDataByNumber function entered");
    console.log("isManuallyChangingNumbers:", isManuallyChangingNumbers);

    // Don't make API call if user is manually changing numbers
    if (isManuallyChangingNumbers) {
      console.log("Skipping API call - user is manually changing numbers");
      return;
    }

    const fNumber = watch("DefendantFileNumber");
    const crNumber = watch("DefendantCRNumber");

    console.log("getEstablishmentDataByNumber called with:", { fNumber, crNumber });

    // Check if at least one of FileNumber or CRNumber is provided
    if (!fNumber && !crNumber) {
      console.log("No file number or CR number provided, returning");
      updateEstablishmentState({ status: 'idle' });
      return;
    }

    console.log("Making API call with params:", { fNumber, crNumber });
    updateEstablishmentState({ status: 'loading' });

    // Cancel previous request if it exists
    if (currentRequestRef.current) {
      currentRequestRef.current.abort();
      currentRequestRef.current = null;
    }
    const newRequestId = requestIdRef.current++;
    currentRequestRef.current = new AbortController();

    try {
      const params: any = {
        AcceptedLanguage: i18n.language.toUpperCase(),
        SourceSystem: "E-Services",
      };

      // Add FileNumber if provided
      if (fNumber) {
        params.FileNumber = fNumber;
      }

      // Add CRNumber if provided
      if (crNumber) {
        params.CRNumber = crNumber;
      }

      console.log("API params:", params);
      const result = await triggerGetEstablishmentData(params);
      console.log("API result:", result);

      // Check if the API call was successful
      if (result.error) {
        console.log("API error:", result.error);
        console.log("Clearing establishment data and form fields due to API error...");

        updateEstablishmentState({ status: 'error', data: null, hasLoaded: false });

        // Clear all establishment-related form fields on error with more explicit clearing
        console.log("Clearing defendantRegion...");
        setValue("defendantRegion", null, { shouldValidate: false, shouldDirty: true });

        console.log("Clearing defendantCity...");
        setValue("defendantCity", null, { shouldValidate: false, shouldDirty: true });

        console.log("Clearing establishment_phoneNumber...");
        setValue("establishment_phoneNumber", "", { shouldValidate: false, shouldDirty: true });

        console.log("Clearing DefendantNumber700...");
        setValue("DefendantNumber700", "", { shouldValidate: false, shouldDirty: true });

        console.log("Clearing DefendantEstablishmentName...");
        setValue("DefendantEstablishmentName", "", { shouldValidate: false, shouldDirty: true });

        console.log("Clearing Defendant_Establishment_data_NON_SELECTED...");
        setValue("Defendant_Establishment_data_NON_SELECTED", undefined, { shouldValidate: false, shouldDirty: true });

        // Also clear any nested establishment data
        setValue("Defendant_Establishment_data_NON_SELECTED.region", null, { shouldValidate: false, shouldDirty: true });
        setValue("Defendant_Establishment_data_NON_SELECTED.city", null, { shouldValidate: false, shouldDirty: true });
        setValue("Defendant_Establishment_data_NON_SELECTED.Number700", "", { shouldValidate: false, shouldDirty: true });

        // Reset original values
        updateEstablishmentState({ originalValues: { fileNumber: '', crNumber: '' } });

        console.log("All establishment fields cleared due to API error");
      }
      // Note: The success case is handled in the useEffect below
    } catch (error) {
      console.log("API catch error:", error);
      console.log("Clearing establishment data and form fields due to catch error...");

      updateEstablishmentState({ status: 'error', data: null, hasLoaded: false });

      // Clear all establishment-related form fields on catch error with more explicit clearing
      console.log("Clearing defendantRegion...");
      setValue("defendantRegion", null, { shouldValidate: false, shouldDirty: true });

      console.log("Clearing defendantCity...");
      setValue("defendantCity", null, { shouldValidate: false, shouldDirty: true });

      console.log("Clearing establishment_phoneNumber...");
      setValue("establishment_phoneNumber", "", { shouldValidate: false, shouldDirty: true });

      console.log("Clearing DefendantNumber700...");
      setValue("DefendantNumber700", "", { shouldValidate: false, shouldDirty: true });

      console.log("Clearing DefendantEstablishmentName...");
      setValue("DefendantEstablishmentName", "", { shouldValidate: false, shouldDirty: true });

      console.log("Clearing Defendant_Establishment_data_NON_SELECTED...");
      setValue("Defendant_Establishment_data_NON_SELECTED", undefined, { shouldValidate: false, shouldDirty: true });

      // Also clear any nested establishment data
      setValue("Defendant_Establishment_data_NON_SELECTED.region", null, { shouldValidate: false, shouldDirty: true });
      setValue("Defendant_Establishment_data_NON_SELECTED.city", null, { shouldValidate: false, shouldDirty: true });
      setValue("Defendant_Establishment_data_NON_SELECTED.Number700", "", { shouldValidate: false, shouldDirty: true });

      // Reset original values
      updateEstablishmentState({ originalValues: { fileNumber: '', crNumber: '' } });

      console.log("All establishment fields cleared due to catch error");
    }
  }, [watch, triggerGetEstablishmentData, i18n.language, setValue, setEstablishmentState, isManuallyChangingNumbers]);

  // Improved debounced version
  const debouncedGetEstablishmentData = useDebouncedCallback(
    getEstablishmentDataByNumber,
    [watch, setValue, triggerGetEstablishmentData, i18n.language, setEstablishmentState, isManuallyChangingNumbers],
    500
  );

  // to get establishment data from radio selection
  const [
    triggerMyEstablishmentData,
    { data: myEstablishment, isLoading: isMyEstablishmentLoading },
  ] = useLazyGetEstablishmentDetailsQuery();

  useEffect(() => {
    console.log("myEstablishment useEffect triggered with:", myEstablishment);
    console.log("isManuallyChangingNumbers:", isManuallyChangingNumbers);

    // Don't process myEstablishment data if user is manually changing numbers
    if (isManuallyChangingNumbers) {
      console.log("Skipping myEstablishment data processing - user is manually changing numbers");
      return;
    }

    if (myEstablishment) {
      if (myEstablishment.EstablishmentInfo?.length) {
        const establishmentInfo = myEstablishment.EstablishmentInfo[0];
        updateEstablishmentState({ originalValues: { fileNumber: establishmentInfo.FileNumber || '', crNumber: establishmentInfo.CRNumber || '' }, hasLoaded: true });
        setCookie("getDefendEstablishmentData", establishmentInfo);
        setCookie("defendantDetails", establishmentInfo);
        setValue("Defendant_Establishment_data", establishmentInfo, { shouldValidate: true });
        if (!watch("DefendantFileNumber") || watch("DefendantFileNumber") === establishmentState.originalValues.fileNumber) {
          setValue("DefendantFileNumber", establishmentInfo.FileNumber || "");
        }
        if (!watch("DefendantCRNumber") || watch("DefendantCRNumber") === establishmentState.originalValues.crNumber) {
          setValue("DefendantCRNumber", establishmentInfo.CRNumber || "");
        }
        if (establishmentInfo.Region && establishmentInfo.Region_Code) {
          setValue("defendantRegion", { label: establishmentInfo.Region, value: establishmentInfo.Region_Code });
        }
        if (establishmentInfo.City && establishmentInfo.City_Code) {
          setValue("defendantCity", { label: establishmentInfo.City, value: establishmentInfo.City_Code });
        }
      } else {
        if (myEstablishment.ErrorList) {
          toast.warning("Failed To Fetch Establishment Data");
        }
        setValue("Defendant_Establishment_data", { region: null, city: null }, { shouldValidate: false });
      }
      // After processing is complete, reset the flag
      console.log("myEstablishment data processed, resetting isManuallyChangingNumbers flag");
      setIsManuallyChangingNumbers(false);
    }
  }, [myEstablishment, setValue, setCookie, isManuallyChangingNumbers, updateEstablishmentState, watch]);

  const getSelectedEstablishmentData = async (value: string) => {
    if (value === "Others") {
      setValue("DefendantFileNumber", "", {
        shouldValidate: false,
      });
      setValue("DefendantCRNumber", "", {
        shouldValidate: false,
      });
      setSelectedDataEstablishment(false);
      updateEstablishmentState({ hasLoaded: false });
      return;
    }
    const selectedEstData = extracFileNumberFromWorkingEstData(value);
    const params: any = {
      AcceptedLanguage: i18n.language.toUpperCase(),
      SourceSystem: "E-Services",
    };

    if (selectedEstData?.FileNumber) {
      params.FileNumber = selectedEstData.FileNumber;
    }

    if (selectedEstData?.CRNumber) {
      params.CRNumber = selectedEstData.CRNumber;
    }

    const res = await triggerMyEstablishmentData(params);
    res && setSelectedDataEstablishment(true);
  };

  const extracFileNumberFromWorkingEstData = (estName: string) => {
    const establishment: any =
      getEstablismentWorkingData?.EstablishmentData.find(
        (val: any) => val.EstablishmentName === estName
      );
    return establishment ? {
      FileNumber: establishment.EstablishmentFileNumber,
      CRNumber: establishment.CRNumber
    } : null;
  };

  const defendantRegion = watch("defendantRegion");

  // Region/City/Occupation/Nationality lookups
  const { data: regionData } = useGetWorkerRegionLookupDataQuery({
    AcceptedLanguage: i18n.language.toUpperCase(),
    SourceSystem: "E-Services",
    ModuleKey: "EstablishmentRegion",
    ModuleName: "EstablishmentRegion",
  });
  const {
    data: cityData,
    isFetching: isCityLoading,
    isError: isCityError,
  } = useGetWorkerCityLookupDataQuery(
    {
      AcceptedLanguage: i18n.language.toUpperCase(),
      SourceSystem: "E-Services",
      selectedWorkerRegion: typeof defendantRegion === 'object' ? defendantRegion?.value : defendantRegion || "",
      ModuleName: "EstablishmentCity",
    },
    { skip: !(typeof defendantRegion === 'object' ? defendantRegion?.value : defendantRegion) }
  );

  useEffect(() => {
    if (cityData && isCityError) {
      toast.error("Error fetching city data");
    }
  }, [cityData, isCityError]);

  const RegionOptions = React.useMemo(() => {
    return (
      (regionData &&
        regionData?.DataElements?.map((item: any) => ({
          value: item.ElementKey,
          label: item.ElementValue,
        }))) ||
      []
    );
  }, [regionData]);

  const CityOptions = React.useMemo(() => {
    return (
      (cityData &&
        cityData?.DataElements?.map((item: any) => ({
          value: item.ElementKey,
          label: item.ElementValue,
        }))) ||
      []
    );
  }, [cityData]);

  //#endregion hassan

  useEffect(() => {
    if (defendantDetails) {
      setCookie("defendantDetails", defendantDetails);
      setCookie("getCookieEstablishmentData", defendantDetails);
    }
  }, [defendantDetails]);

  // Handle establishment data changes
  useEffect(() => {
    if (establishmentState.status === 'success' && establishmentState.data && !isManuallyChangingNumbers) {
      const data = establishmentState.data;
      
      // Update form with establishment data
      if (data.EstablishmentName) {
        setValue("DefendantEstablishmentName", data.EstablishmentName, { shouldValidate: true });
      }
      if (data.Number700) {
        setValue("DefendantNumber700", data.Number700, { shouldValidate: true });
      }
      if (data.Region && data.Region_Code) {
        setValue("defendantRegion", { 
          value: data.Region_Code, 
          label: data.Region 
        }, { shouldValidate: true });
      }
      if (data.City && data.City_Code) {
        setValue("defendantCity", { 
          value: data.City_Code, 
          label: data.City 
        }, { shouldValidate: true });
      }
      
      // Store original values
      updateEstablishmentState({
        originalValues: {
          fileNumber: data.FileNumber || '',
          crNumber: data.CRNumber || ''
        }
      });

      // Reset manual change flag
      setIsManuallyChangingNumbers(false);
    }
  }, [establishmentState.status, establishmentState.data, isManuallyChangingNumbers, setValue]);

  // Show Non-Governmental and Governmental entities when user chooses "Others" or when no establishments are available
  const [showGovNonGovRadios, setShowGovNonGovRadios] = useState<boolean>(true);

  useEffect(() => {
    // Show the radio options when:
    // 1. Defendant status is "Establishment", "Government", or "Others"
    // 2. Defendant details is "Others" (meaning user selected Others from establishment list)
    // 3. No establishment data is available (wrorkedEstablishmetUsers has only "Others" option)
    const shouldShow =
      ["Establishment", "Government", "Others"].includes(defendantStatus?.toString() || "") ||
      defendantDetails === "Others" ||
      (wrorkedEstablishmetUsers && wrorkedEstablishmetUsers.length === 1 && wrorkedEstablishmetUsers[0].value === "Others");

    setShowGovNonGovRadios(shouldShow);
  }, [defendantStatus, defendantDetails, wrorkedEstablishmetUsers?.length]);

  // Show government fields only when defendantStatus is Government
  const showGovSectionFields = defendantStatus === "Government";

  // Show non-gov section only when defendantStatus is Establishment
  const showNonGovSection = defendantStatus === "Establishment";

  const GovernmentOptions = React.useMemo(() => {
    if (!governmentData?.DataElements) return [];
    return governmentData.DataElements.map((item: { ElementKey: string; ElementValue: string }) => ({
      value: item.ElementKey,
      label: item.ElementValue,
    }));
  }, [governmentData]);

  const SubGovernmentOptions = React.useMemo(() => {
    if (!subGovernmentData?.DataElements) return [];
    return subGovernmentData.DataElements.map((item: { ElementKey: string; ElementValue: string }) => ({
      value: item.ElementKey,
      label: item.ElementValue,
    }));
  }, [subGovernmentData]);

  // Reset subcategory when main category changes
  useEffect(() => {
    // Only clear subcategory if main category actually changed and is different from previous
    // AND the user hasn't manually selected a subcategory
    if (mainCategory !== prevMainCategory && !hasManuallySelectedSubCategory) {
      setValue("subcategory_of_the_government_entity" as keyof FormData, null, { shouldValidate: false });
      setHasInteractedWithSubCategory(false);
      setHasManuallySelectedSubCategory(false);
      setPrevMainCategory(mainCategory);
    } else if (mainCategory !== prevMainCategory) {
      // If main category changed but user has manually selected subcategory, just update the previous value
      setPrevMainCategory(mainCategory);
    }
  }, [mainCategory, setValue, prevMainCategory, hasManuallySelectedSubCategory]);

  // Clear main and sub government fields when an establishment is selected
  useEffect(() => {
    if (establishmentValue && !hasManuallySelectedSubCategory) {
      setValue("main_category_of_the_government_entity" as keyof FormData, null, { shouldValidate: false });
      setValue("subcategory_of_the_government_entity" as keyof FormData, null, { shouldValidate: false });
      setHasInteractedWithSubCategory(false);
      setHasManuallySelectedSubCategory(false);
    }
  }, [establishmentValue, setValue, hasManuallySelectedSubCategory]);

  const layout = [
    // Only show establishment selection if there are multiple establishments
    ...(ExtractEstDataLoading
      ? [
        {
          title: t("tab2_title"),
          isRadio: true,
          children: [
            {
              type: "custom",
              component: <EstablishmentSelectionSkeleton />,
            },
          ],
        },
      ]
      : wrorkedEstablishmetUsers && wrorkedEstablishmetUsers.length > 1
        ? [
          {
            title: t("tab2_title"),
            isRadio: true,
            children: [
              {
                type: "radio",
                name: "defendantDetails",
                label: t("estab_name"),
                options: wrorkedEstablishmetUsers,
                value: defendantDetails,
                hasIcon: true,
                onChange: (value: string) => {
                  getSelectedEstablishmentData(value);
                  setValue("defendantDetails", value);
                  setValue("defendantStatus", value);
                },
              },
            ],
          },
        ]
        : []),

    // Defendant type selection (Government/Establishment)
    ...(showGovNonGovRadios
      ? [
        {
          title: t("type_of_defendant"),
          isRadio: true,
          children: [
            {
              type: "radio",
              name: "defendantStatus",
              label: t("type_of_defendant"),
              options: IsGovernmentRadioOptions,
              value: defendantStatus,
              onChange: (value: string) => setValue("defendantStatus", value),
              notRequired: true,
            },
          ],
        },
      ]
      : []),

    // Government entity fields (only shown when Government is selected)
    ...(showGovSectionFields
      ? [
        {
          title: "",
          children: [
            {
              notRequired: false,
              type: "autocomplete",
              label: t("main_category_of_the_government_entity"),
              name: "main_category_of_the_government_entity",
              options: GovernmentOptions,
              validation: { required: t("mainCategoryGovernValidation") },
              value: mainCategory,
              onChange: (value: any) => {
                setValue("main_category_of_the_government_entity" as keyof FormData, value);
                setValue("subcategory_of_the_government_entity" as keyof FormData, null, { shouldValidate: false });
                setHasInteractedWithSubCategory(false);
                setHasManuallySelectedSubCategory(false);
              },
              onClear: () => {
                setValue("main_category_of_the_government_entity" as keyof FormData, null, { shouldValidate: false });
                setValue("subcategory_of_the_government_entity" as keyof FormData, null, { shouldValidate: false });
                setHasInteractedWithSubCategory(false);
                setHasManuallySelectedSubCategory(false);
              }
            },
            {
              type: "autocomplete",
              label: t("subcategory_of_the_government_entity"),
              name: "subcategory_of_the_government_entity",
              options: SubGovernmentOptions,
              validation: {
                required: mainCategory ? (hasInteractedWithSubCategory ? t("subCategoryGovernValidation") : " ") : false
              },
              value: subCategoryValue,
              disabled: !mainCategory,
              onChange: (value: any) => {
                setValue("subcategory_of_the_government_entity" as keyof FormData, value, { shouldValidate: true });
                setHasInteractedWithSubCategory(true);
                setHasManuallySelectedSubCategory(true);
              },
              onClear: () => {
                setValue("subcategory_of_the_government_entity" as keyof FormData, null, { shouldValidate: false });
                setHasInteractedWithSubCategory(false);
                setHasManuallySelectedSubCategory(false);
              }
            },
          ],
        },
      ]
      : []),

    // Establishment fields - ALWAYS SHOW when Establishment is selected
    ...(showNonGovSection
      ? [
        {
          removeMargin: true,
          children: [
            // 1. File Number Input
            {
              isLoading: establishmentState.status === 'loading',
              type: "input",
              label: t("fileNumber"),
              name: "DefendantFileNumber",
              placeholder: establishmentState.status === 'loading' ? t("establishmentLoadingMessage") : "XX-XXXXXXX",
              inputType: "text",
              value: watch("DefendantFileNumber") || "",
              onChange: (e: any) => {
                const newValue = typeof e === "string" ? e : e.target.value;
                const currentValue = watch("DefendantFileNumber") || "";
                
                console.log("File Number Change:", {
                  currentValue,
                  newValue,
                  lengthDiff: currentValue.length - newValue.length
                });

                // If length decreased (digit removed)
                if (newValue.length < currentValue.length) {
                  console.log("Digit removed from File Number - clearing fields");
                  
                  // Clear CR Number
                  setValue("DefendantCRNumber", "", { shouldValidate: false });
                  
                  // Clear all fields without toast
                  clearAllEstablishmentFields(false);
                  
                  // Set manual change flag
                  setIsManuallyChangingNumbers(true);
                }
                
                // Update File Number
                setValue("DefendantFileNumber", newValue, { shouldValidate: true });

                // Only try to fetch data if we have a valid length
                if (newValue && newValue.length >= 3) {
                  console.log("File Number length >= 3, triggering data fetch");
                  debouncedGetEstablishmentData();
                }
              },
              onBlur: () => {
                const value = watch("DefendantFileNumber");
                if (value && value.length >= 3) {
                  getEstablishmentDataByNumber();
                }
                // Reset manual change flag after a short delay
                setTimeout(() => setIsManuallyChangingNumbers(false), 100);
              },
              validation: {
                validate: (value: string) => {
                  const crNumber = watch("DefendantCRNumber");

                  // If neither FileNumber nor CRNumber is provided, show validation error
                  if (!value && !crNumber) {
                    return t("fileNumberValidation");
                  }

                  // Check if only file number or CR number is filled (for Next and Save button validation)
                  if (isOnlyFileNumberFilled()) {
                    return t("Please complete all required fields before proceeding");
                  }

                  // If FileNumber is provided, validate it
                  if (value) {
                    // Simple validation based on file number length
                    if (value.length < 3) {
                      return t("establishmentEnterValidNumber");
                    }

                    // If establishment data is loaded, check for any errors
                    if (establishmentState.hasLoaded) {
                      switch (establishmentState.status) {
                        case 'loading':
                          return t("establishmentWaitForLoading");
                        case 'error':
                          return t("establishmentErrorFetching");
                        case 'not_found':
                          return t("establishmentNotFound");
                        case 'success':
                          return true;
                        default:
                          return true;
                      }
                    }
                  }

                  // If only CRNumber is provided, this field is valid
                  return true;
                }
              },
            },
            // 2. Commercial Registration Number Input
            {
              isLoading: establishmentState.status === 'loading',
              type: "input",
              label: t("commercialRegistrationNumber"),
              name: "DefendantCRNumber",
              placeholder: establishmentState.status === 'loading' ? t("establishmentLoadingMessage") : "XXXXXXXXXX",
              inputType: "text",
              value: watch("DefendantCRNumber") || "",
              onChange: (e: any) => {
                const newValue = typeof e === "string" ? e : e.target.value;
                const currentValue = watch("DefendantCRNumber") || "";
                
                console.log("CR Number Change:", {
                  currentValue,
                  newValue,
                  lengthDiff: currentValue.length - newValue.length
                });

                // If length decreased (digit removed)
                if (newValue.length < currentValue.length) {
                  console.log("Digit removed from CR Number - clearing fields");
                  
                  // Clear File Number
                  setValue("DefendantFileNumber", "", { shouldValidate: false });
                  
                  // Clear all fields without toast
                  clearAllEstablishmentFields(false);
                  
                  // Set manual change flag
                  setIsManuallyChangingNumbers(true);
                }
                
                // Update CR Number
                setValue("DefendantCRNumber", newValue, { shouldValidate: true });

                // Only try to fetch data if we have a valid length
                if (newValue && newValue.length >= 3) {
                  console.log("CR Number length >= 3, triggering data fetch");
                  debouncedGetEstablishmentData();
                }
              },
              onBlur: () => {
                const value = watch("DefendantCRNumber");
                if (value && value.length >= 3) {
                  getEstablishmentDataByNumber();
                }
                // Reset manual change flag after a short delay
                setTimeout(() => setIsManuallyChangingNumbers(false), 100);
              },
              validation: {
                validate: (value: string) => {
                  const fileNumber = watch("DefendantFileNumber");

                  // If neither FileNumber nor CRNumber is provided, show validation error
                  if (!value && !fileNumber) {
                    return t("fileNumberValidation");
                  }

                  // Check if only file number or CR number is filled (for Next and Save button validation)
                  if (isOnlyFileNumberFilled()) {
                    return t("Please complete all required fields before proceeding");
                  }

                  // If CRNumber is provided, validate it
                  if (value) {
                    // Simple validation based on CR number length
                    if (value.length < 3) {
                      return t("establishmentEnterValidNumber");
                    }

                    // If establishment data is loaded, check for any errors
                    if (establishmentState.hasLoaded) {
                      switch (establishmentState.status) {
                        case 'loading':
                          return t("establishmentWaitForLoading");
                        case 'error':
                          return t("establishmentErrorFetching");
                        case 'not_found':
                          return t("establishmentNotFound");
                        case 'success':
                          return true;
                        default:
                          return true;
                      }
                    }
                  }

                  // If only FileNumber is provided, this field is valid
                  return true;
                }
              },
            },
            // 3. Code 700 Field (disabled until data is loaded)
            {
              isLoading: false,
              type: (establishmentState.status === 'success' && establishmentState.data?.Number700) ? "readonly" : "input",
              label: t("number700"),
              name: "DefendantNumber700",
              placeholder: !establishmentState.hasLoaded ? t("Please enter File Number or CR Number first") : "XXXXXXX",
              inputType: "text",
              disabled: !establishmentState.hasLoaded || establishmentState.status === 'loading',
              value: (establishmentState.status === 'success' && establishmentState.data?.Number700)
                ? establishmentState.data?.Number700
                : (watch("DefendantNumber700") || ""),
              onChange: (value: string) => {
                setValue("DefendantNumber700", value, { shouldValidate: false });
              },
              validation: {
                required: t("code700Validation"),
              },
            },
            // 4. Name Field (disabled until data is loaded)
            {
              isLoading: false,
              type: (establishmentState.status === 'success' && establishmentState.data?.EstablishmentName) ? "readonly" : "input",
              label: t("name"),
              name: "DefendantEstablishmentName",
              placeholder: !establishmentState.hasLoaded ? t("Please enter File Number or CR Number first") : t("establishmentNamePlaceholder"),
              inputType: "text",
              disabled: !establishmentState.hasLoaded || establishmentState.status === 'loading',
              value: (establishmentState.status === 'success' && establishmentState.data?.EstablishmentName)
                ? establishmentState.data?.EstablishmentName
                : (watch("DefendantEstablishmentName") || ""),
              onChange: (value: string) => {
                setValue("DefendantEstablishmentName", value, { shouldValidate: false });
              },
              validation: {
                required: t("establishmentNameValidation"),
              },
            },
            // 5. Region Field (disabled until data is loaded)
            {
              isLoading: false,
              label: t("region"),
              name: "defendantRegion",
              type: (establishmentState.status === 'success' && establishmentState.data?.Region) ? "readonly" : "autocomplete",
              disabled: !establishmentState.hasLoaded || establishmentState.status === 'loading',
              placeholder: !establishmentState.hasLoaded ? t("Please enter File Number or CR Number first") : t("Select region"),
              value: (establishmentState.status === 'success' && establishmentState.data?.Region)
                ? establishmentState.data?.Region
                : (watch("defendantRegion") || ""),
              ...((establishmentState.status !== 'success' || !establishmentState.data?.Region) && {
                options: RegionOptions,
                validation: {
                  required: t("regionValidation"),
                  validate: (value: any) => {
                    if (!value || !value.value) {
                      return t("regionValidation");
                    }
                    return true;
                  }
                },
              }),
              onChange: (v: any) => {
                if (!v || !v.value) {
                  setValue("defendantRegion", null, { shouldValidate: true });
                  setValue("defendantCity", null, { shouldValidate: true });
                } else {
                  setValue("defendantRegion", v, { shouldValidate: true });
                  setValue("defendantCity", null, { shouldValidate: true });
                }
              },
            },
            // 6. City Field (disabled until data is loaded)
            {
              isLoading: false,
              type: (establishmentState.status === 'success' && establishmentState.data?.City) ? "readonly" : "autocomplete",
              label: t("city"),
              name: "defendantCity",
              disabled: !establishmentState.hasLoaded || establishmentState.status === 'loading',
              placeholder: !establishmentState.hasLoaded ? t("Please enter File Number or CR Number first") : t("Select city"),
              value: (establishmentState.status === 'success' && establishmentState.data?.City)
                ? establishmentState.data?.City
                : (watch("defendantCity") || ""),
              ...((establishmentState.status !== 'success' || !establishmentState.data?.City) && {
                options: CityOptions,
                validation: {
                  required: t("cityValidation"),
                  validate: (value: any) => {
                    if (!value || !value.value) {
                      return t("cityValidation");
                    }
                    return true;
                  }
                },
              }),
              onChange: (v: any) => {
                if (!v || !v.value) {
                  setValue("defendantCity", null, { shouldValidate: true });
                } else {
                  setValue("defendantCity", v, { shouldValidate: true });
                }
              },
            },
            // 7. Phone Number Field (disabled until data is loaded)
            {
              maxLength: 10,
              type: "input",
              name: "establishment_phoneNumber",
              label: t("phoneNumber"),
              inputType: "text",
              placeholder: !establishmentState.hasLoaded ? t("Please enter File Number or CR Number first") : "05xxxxxxxx",
              disabled: !establishmentState.hasLoaded || establishmentState.status === 'loading',
              validation: {
                required: t("phoneNumberValidation"),
                pattern: {
                  value: /^05\d{8}$/,
                  message: t("Please enter phone number must start with 05."),
                },
              },
            },
          ],
        },
      ]
      : []),
  ].filter(Boolean) as SectionLayout[];

  return {
    layout,
    isOnlyFileNumberFilled
  };
};

