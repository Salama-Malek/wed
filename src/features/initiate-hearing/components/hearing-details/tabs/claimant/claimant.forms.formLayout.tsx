import {
  Control,
  UseFormSetValue,
  UseFormWatch,
  useForm,
  useWatch,
} from "react-hook-form";
import {
  SectionLayout,
  FormData,
  Option,
} from "@/shared/components/form/form.types";
import { useFormOptions } from "./claimant.forms.formOptions";
import React, { lazy, Suspense, useState, useMemo, useEffect, KeyboardEvent, ChangeEvent, FocusEvent } from "react";
import TableLoader from "@/shared/components/loader/TableLoader";
import { useTranslation } from "react-i18next";
import Button from "@/shared/components/button";
import { useLegalRepFormOptions } from "../../establishment-tabs/legal-representative/claimant.forms.formOptions";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import { PHONE_PATTERNS } from "@/config/general";
import { TokenClaims } from "@/features/login/components/AuthProvider";
import {
  useGetNICDetailsQuery,
  NICDetailsResponse,
} from "@/features/initiate-hearing/api/create-case/plaintiffDetailsApis";
import { NICDetailsParams } from "../../hearing.details.types";
import { formatHijriDate } from "@/shared/lib/helpers";
import AddAttachment from "../../../add-attachments";
import { DateOfBirthField } from "@/shared/components/calanders";
import { useAPIFormsData } from "@/providers/FormContext";
import OTPFormLayout from "./OTP.froms.formlayout";
import { boolean } from "ts-pattern/dist/patterns";
import {
  formatDateString,
  formatDateToYYYYMMDD,
  toWesternDigits,
} from "@/shared/lib/helpers";
import { toast } from "react-toastify";
import { DigitOnlyInput } from "@/shared/components/form/InputField";
import { FieldWrapper } from "@/shared/components/form/FieldWrapper";
import { HijriDatePickerInput } from "@/shared/components/calanders/HijriDatePickerInput";
import { GregorianDateDisplayInput } from "@/shared/components/calanders/GregorianDateDisplayInput";
import { useFormContext } from "react-hook-form";
import gregorian from "react-date-object/calendars/gregorian";
import gregorianLocaleEn from "react-date-object/locales/gregorian_en";
import FileAttachment from "@/shared/components/ui/file-attachment/FileAttachment";

interface AgentInfo {
  Agent?: {
    ErrorDescription?: string;
    MandateNumber?: string;
    AgentName?: string;
    MandateStatus?: string;
    MandateSource?: string;
    AgentDetails?: Array<{
      IdentityNumber: string;
    }>;
  };
  PartyList?: Array<{
    FullName: string;
    ID: string;
    Gender: string;
    IsValid: string;
  }>;
}

export interface DataElement {
  ElementKey: string;
  ElementValue: string;
}

interface FormLayoutProps {
  setValue: UseFormSetValue<FormData>;
  watch: UseFormWatch<FormData>;
  control: Control<FormData>;
  plaintiffRegionData: any;
  plaintiffCityData: any;
  occupationData: any;
  genderData: any;
  nationalityData: any;
  countryData: any;
  sendOtpHandler: () => void;
  lastSentOtp: string;
  isVerified: boolean;
  isNotVerified: boolean;
  setIsNotVerified: (value: boolean) => void;
  agentInfoData: AgentInfo;
  apiLoadingStates: {
    agent: boolean;
    nic: boolean;
    estab: boolean;
    incomplete: boolean;
  };
  userTypeLegalRepData: any;
  onAgencyNumberChange: (value: string) => void;
  setError: (name: string, error: any) => void;
  clearErrors: (name: string) => void;

  verifyOtp: () => void;
  isVerify: boolean;

  principalNICResponse?: NICDetailsResponse;
  principalNICRefetch: () => void;
  representativeNICResponse?: NICDetailsResponse;
  localAgentNICResponse?: any;
  externalAgentNICResponse?: any;
  register: any;
  errors: any;
  trigger: any;
  isValid: boolean;
  allowedIds?: string[];
}

export const useFormLayout = ({
  control,
  setValue,
  watch,
  plaintiffRegionData,
  plaintiffCityData,
  occupationData,
  genderData,
  nationalityData,
  countryData,
  sendOtpHandler,
  isVerified,
  isNotVerified,
  setIsNotVerified,
  agentInfoData,
  apiLoadingStates,
  userTypeLegalRepData,
  onAgencyNumberChange,
  setError,
  clearErrors,
  verifyOtp,
  principalNICResponse,
  principalNICRefetch,
  representativeNICResponse,
  localAgentNICResponse,
  externalAgentNICResponse,
  register,
  errors,
  trigger,
  isValid,
  allowedIds,
}: FormLayoutProps): SectionLayout[] => {
  const safeAllowedIds = allowedIds || [];
  // --- NEW: State for UnprofessionalLetterAttachments ---
  const [unprofessionalLetterAttachments, setUnprofessionalLetterAttachments] =
    useState<any[]>([]);

  // Add this ref to track if the user has picked a date
  const userPickedDateRef = React.useRef(false);

  const currentClaimantStatus = useWatch({ name: "claimantStatus", control });

  const { t, i18n } = useTranslation("hearingdetails");
  const { t: LegalRep } = useTranslation("legal_rep");
  const [getCookie] = useCookieState();

  const incompleteCaseType = getCookie("incompleteCase");

  const enforcedStatus = useMemo(() => {
    if (incompleteCaseType?.PlaintiffType === "Self(Worker)")
      return "principal";
    if (incompleteCaseType?.PlaintiffType === "Agent") return "representative";
    return null;
  }, [incompleteCaseType]);

  const claimantStatus =
    watch("claimantStatus") || enforcedStatus || "principal";

  const currentStatus = useWatch({ name: "claimantStatus", control });

  const hasMountedRef = React.useRef(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;

      const defaultStatus = enforcedStatus ?? "principal";

      if (!currentClaimantStatus) {
        setValue("claimantStatus", defaultStatus);
      }
    }
  }, [enforcedStatus, currentClaimantStatus, setValue]);

  const shouldShowClaimantStatus = !enforcedStatus;

  const showPrincipalFields = claimantStatus === "principal";
  const showRepresentativeFields = claimantStatus === "representative";

  useEffect(() => {
    register("userName");
    register("plaintiffRegion");
    register("plaintiffCity");
    register("occupation");
    register("gender");
    register("nationality");
    register("hijriDate");
    register("gregorianDate");
    register("applicant");
    register("workerAgentDateOfBirthHijri");
    register("phoneNumber");
    register("agentPhoneNumber");
    register("region");
    register("city");
    register("isDomestic");
    register("isPhone");
    register("phoneCode");
    register("interPhoneNumber");
    register("isVerified");
    register("workerAgentIdNumber");
    register("agencyNumber");
    register("mobileNumber");
    register("agentName");
    register("agencyStatus");
    register("agencySource");
    register("Agent_ResidencyAddress");
    register("Agent_CurrentPlaceOfWork");
    register("agentType");
    // principal-prefixed fields
    register("principal_userName");
    register("principal_region");
    register("principal_city");
    register("principal_occupation");
    register("principal_gender");
    register("principal_nationality");
    register("principal_hijriDate");
    register("principal_gregorianDate");
    register("principal_applicant");
    register("principal_phoneNumber");
  }, [register]);

  const userClaims = getCookie("userClaims") as TokenClaims;
  const idNumber = userClaims?.UserID || "";
  const dobirth = userClaims?.UserDOB || "";
  const userType = getCookie("userType");
  const { ClaimantStatusRadioOptions, CodeOptions, IsDomesticRadioOptions } =
    useFormOptions();
  const { plaintiffTypeOptions, AgentTypeOptions } = useLegalRepFormOptions();
  const { clearFormData } = useAPIFormsData();

  const showOnlyPrincipal =
    incompleteCaseType?.PlaintiffType === "Self(Worker)";
  const showOnlyRepresentative = incompleteCaseType?.PlaintiffType === "Agent";

  const applicantType = watch("applicant");
  const workerAgentIdNumber = watch("workerAgentIdNumber") || "";
  const workerAgentHijriDob = watch("workerAgentDateOfBirthHijri") || "";
  const formattedWorkerAgentHijriDob =
    formatDateToYYYYMMDD(workerAgentHijriDob);
  const claimType = watch("claimantStatus");
  const applicant = watch("applicant");

  const agentType = watch("agentType");
  // Update agencyNumber to use the correct field for local agency
  const agencyNumber = agentType === "local_agency"
    ? watch("localAgent_agencyNumber") || ""
    : agentType === "external_agency"
      ? watch("externalAgent_agencyNumber") || ""
      : watch("agencyNumber") || "";

  const hasValidAgency = useMemo(() => {
    if (agentType === "local_agency") {
      return Boolean(
        agencyNumber && agentInfoData?.Agent?.ErrorDescription === "Success"
      );
    }
    if (agentType === "external_agency") {
      return Boolean(
        agencyNumber && agentInfoData?.Agent?.ErrorDescription === "Success"
      );
    }
    return false;
  }, [agentType, agencyNumber, agentInfoData?.Agent?.ErrorDescription]);

  // Check if mandate number is empty
  const hasMandateNumber = useMemo(() => {
    if (agentType === "local_agency") {
      return Boolean(agencyNumber && String(agencyNumber).length > 0);
    } else if (agentType === "external_agency") {
      const externalAgencyNumber = watch("externalAgencyNumber");
      return Boolean(externalAgencyNumber && String(externalAgencyNumber).length > 0);
    }
    return false;
  }, [agentType, agencyNumber, watch]);

  // Check if plaintiff ID is under the agency (for local agency only)
  const isPlaintiffIdUnderAgency = useMemo(() => {
    try {
      if (agentType !== "local_agency" || !workerAgentIdNumber || !agentInfoData?.PartyList) {
        return true; // For external agency or no ID, assume valid
      }
      if (!Array.isArray(agentInfoData.PartyList)) {
        return true; // If PartyList is not an array, assume valid
      }
      return agentInfoData.PartyList.some(party => party?.ID === workerAgentIdNumber);
    } catch (error) {
      console.error('Error checking if plaintiff ID is under agency:', error);
      return true; // On error, assume valid to prevent blocking
    }
  }, [agentType, workerAgentIdNumber, agentInfoData?.PartyList]);

  const shouldFetchNic =
    claimantStatus === "representative" &&
    agentType === "local_agency" &&
    hasValidAgency &&
    hasMandateNumber &&
    isPlaintiffIdUnderAgency &&
    workerAgentIdNumber.length === 10 &&
    formattedWorkerAgentHijriDob?.length === 8;

  // Select the appropriate NIC response based on agent type
  const nicAgent = agentType === "local_agency" ? localAgentNICResponse : 
                   agentType === "external_agency" ? externalAgentNICResponse : 
                   representativeNICResponse;
  const nicAgentLoading = false;
  const nicAgentError = false;
  const refetchNICAgent = () => {};

  const disableNicFields = !shouldFetchNic || nicAgentLoading;

  useEffect(() => {
    if (!shouldFetchNic) {
      clearErrors("workerAgentIdNumber");
      return;
    }

    if (nicAgentLoading) return;

    if (nicAgentError || (nicAgent && !nicAgent?.NICDetails)) {
      let errorMessage = t("error.noNicData");
      if (
        nicAgent &&
        nicAgent.ErrorDetails &&
        Array.isArray(nicAgent.ErrorDetails)
      ) {
        const errorDetail = nicAgent.ErrorDetails.find(
          (detail: any) => detail.ErrorDesc
        );
        if (errorDetail && errorDetail.ErrorDesc) {
          errorMessage = errorDetail.ErrorDesc;
        }
      }
      // toast.error(errorMessage); // Commented to prevent duplicate error messages (handled by centralized error handler)
      if (typeof setError === "function") {
        setError("workerAgentIdNumber", {
          type: "validate",
          message: errorMessage,
        });
      }
    } else if (nicAgent?.NICDetails) {
      clearErrors("workerAgentIdNumber");
      const d = nicAgent.NICDetails;
      setValue("userName", d.PlaintiffName || "", {
        shouldValidate: d.PlaintiffName !== "",
      });

      if (d.Region_Code) {
        setValue(
          "plaintiffRegion",
          {
            value: d.Region_Code,
            label: d.Region || "",
          },
          {
            shouldValidate: d.Region_Code !== "",
          }
        );
      }

      if (d.City_Code) {
        setValue(
          "plaintiffCity",
          {
            value: d.City_Code,
            label: d.City || "",
          },
          {
            shouldValidate: d.City_Code !== "",
          }
        );
      }

      if (d.Occupation_Code) {
        setValue(
          "occupation",
          {
            value: d.Occupation_Code,
            label: d.Occupation || "",
          },
          {
            shouldValidate: d.Occupation_Code !== "",
          }
        );
      }

      if (d.Gender_Code) {
        setValue(
          "gender",
          {
            value: d.Gender_Code,
            label: d.Gender || "",
          },
          {
            shouldValidate: d.Gender_Code !== "",
          }
        );
      }

      if (d.Nationality_Code) {
        setValue(
          "nationality",
          {
            value: d.Nationality_Code,
            label: d.Nationality || "",
          },
          {
            shouldValidate: d.Nationality_Code !== "",
          }
        );
      }

      // Only set hijriDate/gregorianDate if user hasn't picked a date
      if (!userPickedDateRef.current) {
        if (watch("hijriDate") !== (d.DateOfBirthHijri || "")) {
          setValue("hijriDate", d.DateOfBirthHijri || "", {
            shouldValidate: d.DateOfBirthHijri !== "",
          });
        }
        if (watch("gregorianDate") !== (d.DateOfBirthGregorian || "")) {
          setValue("gregorianDate", d.DateOfBirthGregorian || "", {
            shouldValidate: d.DateOfBirthGregorian !== "",
          });
        }
      }
      setValue("applicant", d.Applicant || "", {
        shouldValidate: d.Applicant !== "",
      });

      if (d.PhoneNumber) {
        setValue("phoneNumber", d.PhoneNumber.toString(), {
          shouldValidate: d.PhoneNumber !== "",
        });
      }
    }
  }, [
    shouldFetchNic,
    nicAgent,
    nicAgentError,
    nicAgentLoading,
    setValue,
    setError,
    t,
  ]);

  const plaintiffStatus = watch("plaintiffStatus");
  const isPhone = watch("isPhone");
  const phoneCode = watch("phoneCode");
  const phoneNumber = watch("interPhoneNumber");
  const enteredOtp = watch("otp");

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [otpSent, setOtpSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [showResend, setShowResend] = useState(false);

  const selectedMainCategory = getCookie("mainCategory");
  const selectedSubCategory = getCookie("subCategory");

  const govRepDetail = userTypeLegalRepData?.GovRepDetails?.find(
    (item: any) => item.GOVTID === selectedMainCategory?.value
  );

  const [attachment, setAttachment] = useState<FormData["attachment"] | null>(
    null
  );

  const watchedClaimantStatus = useWatch({ name: "claimantStatus", control });
  const watchedHijriDate = useWatch({ name: "hijriDate", control });
  const watchedGregorianDate = useWatch({ name: "gregorianDate", control });

  // Refactor principalNICResponse effect
  useEffect(() => {
    if (principalNICResponse?.NICDetails && watchedClaimantStatus === "principal") {
      const nic = principalNICResponse.NICDetails;
      if (nic.PlaintiffName) {
        setValue("principal_userName", nic.PlaintiffName || "", {
          shouldValidate: nic.PlaintiffName !== "",
        });
      }
      if (nic.Region_Code) {
        setValue(
          "principal_region",
          {
            value: nic.Region_Code || "",
            label: nic.Region || "",
          },
          {
            shouldValidate: nic.Region_Code !== "",
          }
        );
      }
      if (nic.City_Code) {
        setValue(
          "principal_city",
          { value: nic.City_Code || "", label: nic.City || "" },
          {
            shouldValidate: nic.City_Code !== "",
          }
        );
      }
      if (nic.Occupation_Code) {
        setValue(
          "principal_occupation",
          {
            value: nic.Occupation_Code || "",
            label: nic.Occupation || "",
          },
          {
            shouldValidate: nic.Occupation_Code !== "",
          }
        );
      }
      if (nic.Gender_Code) {
        setValue(
          "principal_gender",
          {
            value: nic.Gender_Code || "",
            label: nic.Gender || "",
          },
          {
            shouldValidate: nic.Gender_Code !== "",
          }
        );
      }
      if (nic.Nationality_Code) {
        setValue(
          "principal_nationality",
          {
            value: nic.Nationality_Code || "",
            label: nic.Nationality || "",
          },
          {
            shouldValidate: nic.Nationality_Code !== "",
          }
        );
      }
      // Only set if user hasn't picked a date
      if (!userPickedDateRef.current) {
        setValue("principal_hijriDate", nic.DateOfBirthHijri || "", {
          shouldValidate: nic.DateOfBirthHijri !== "",
        });
        setValue("principal_gregorianDate", nic.DateOfBirthGregorian || "", {
          shouldValidate: nic.DateOfBirthGregorian !== "",
        });
      }
      setValue("principal_applicant", nic.Applicant || "");
      if (nic.PhoneNumber) {
        setValue("principal_phoneNumber", nic.PhoneNumber.toString(), {
          shouldValidate: nic.PhoneNumber !== "",
        });
      }
    }
    // eslint-disable-next-line
  }, [principalNICResponse]);

  // Refactor representativeNICResponse effect
  useEffect(() => {
    if (representativeNICResponse?.NICDetails && watchedClaimantStatus === "representative") {
      const nic = representativeNICResponse.NICDetails;
      if (nic.PlaintiffName) {
        setValue("userName", nic.PlaintiffName || "", {
          shouldValidate: nic.PlaintiffName !== "",
        });
      }
      if (nic.Region_Code) {
        setValue(
          "plaintiffRegion",
          {
            value: nic.Region_Code || "",
            label: nic.Region || "",
          },
          {
            shouldValidate: nic.Region_Code !== "",
          }
        );
      }
      if (nic.City_Code) {
        setValue(
          "plaintiffCity",
          {
            value: nic.City_Code || "",
            label: nic.City || "",
          },
          {
            shouldValidate: nic.City_Code !== "",
          }
        );
      }
      if (nic.Occupation_Code) {
        setValue(
          "occupation",
          {
            value: nic.Occupation_Code || "",
            label: nic.Occupation || "",
          },
          {
            shouldValidate: nic.Occupation_Code !== "",
          }
        );
      }
      if (nic.Gender_Code) {
        setValue(
          "gender",
          {
            value: nic.Gender_Code || "",
            label: nic.Gender || "",
          },
          {
            shouldValidate: nic.Gender_Code !== "",
          }
        );
      }
      if (nic.Nationality_Code) {
        setValue(
          "nationality",
          {
            value: nic.Nationality_Code || "",
            label: nic.Nationality || "",
          },
          {
            shouldValidate: nic.Nationality_Code !== "",
          }
        );
      }
      // Only set if user hasn't picked a date
      if (!userPickedDateRef.current) {
        setValue("hijriDate", nic.DateOfBirthHijri || "", {
          shouldValidate: nic.DateOfBirthHijri !== "",
        });
        setValue("gregorianDate", nic.DateOfBirthGregorian || "", {
          shouldValidate: nic.DateOfBirthGregorian !== "",
        });
      }
      setValue("applicant", nic.Applicant || "");
      if (nic.PhoneNumber) {
        setValue("phoneNumber", nic.PhoneNumber.toString(), {
          shouldValidate: nic.PhoneNumber !== "",
        });
      }
    } else {
      [
        "userName",
        "hijriDate",
        "gregorianDate",
        "applicant",
        "phoneNumber",
      ].forEach((f) => setValue(f as any, ""));
      setValue("plaintiffRegion", null);
      setValue("plaintiffCity", null);
      setValue("occupation", null);
      setValue("gender", null);
      setValue("nationality", null);
    }
    // eslint-disable-next-line
  }, [representativeNICResponse]);

  // Refactor NIC auto-fill for local agency
  useEffect(() => {
    if (localAgentNICResponse?.NICDetails && claimantStatus === "representative" && agentType === "local_agency") {
      const d = localAgentNICResponse.NICDetails;
      setValue("localAgent_userName", d.PlaintiffName || "");
      setValue("localAgent_region", d.Region_Code ? { value: d.Region_Code, label: d.Region || "" } : null);
      setValue("localAgent_city", d.City_Code ? { value: d.City_Code, label: d.City || "" } : null);
      setValue("localAgent_occupation", d.Occupation_Code ? { value: d.Occupation_Code, label: d.Occupation || "" } : null);
      setValue("localAgent_gender", d.Gender_Code ? { value: d.Gender_Code, label: d.Gender || "" } : null);
      setValue("localAgent_nationality", d.Nationality_Code ? { value: d.Nationality_Code, label: d.Nationality || "" } : null);
      setValue("localAgent_phoneNumber", d.PhoneNumber ? d.PhoneNumber.toString() : "");
    }
  }, [localAgentNICResponse, claimantStatus, agentType, setValue]);

  // Refactor NIC auto-fill for external agency
  useEffect(() => {
    if (representativeNICResponse?.NICDetails && claimantStatus === "representative" && agentType === "external_agency") {
      const d = representativeNICResponse.NICDetails;
      setValue("externalAgent_userName", d.PlaintiffName || "");
      setValue("externalAgent_region", d.Region_Code ? { value: d.Region_Code, label: d.Region ?? "" } : null);
      setValue("externalAgent_city", d.City_Code ? { value: d.City_Code, label: d.City ?? "" } : null);
      setValue("externalAgent_occupation", d.Occupation_Code ? { value: d.Occupation_Code, label: d.Occupation ?? "" } : null);
      setValue("externalAgent_gender", d.Gender_Code ? { value: d.Gender_Code, label: d.Gender ?? "" } : null);
      setValue("externalAgent_nationality", d.Nationality_Code ? { value: d.Nationality_Code, label: d.Nationality ?? "" } : null);
      setValue("externalAgent_phoneNumber", d.PhoneNumber ? d.PhoneNumber.toString() : "");
    }
  }, [representativeNICResponse, claimantStatus, agentType, setValue]);

  const RegionOptions = useMemo(
    () =>
      plaintiffRegionData?.map((item: DataElement) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || [],
    [plaintiffRegionData]
  );

  const CityOptions = useMemo(
    () =>
      plaintiffCityData?.map((item: DataElement) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || [],
    [plaintiffCityData]
  );

  const OccupationOptions = useMemo(
    () =>
      occupationData?.map((item: DataElement) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || [],
    [occupationData]
  );

  const GenderOptions = useMemo(
    () =>
      genderData?.map((item: DataElement) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || [],
    [genderData]
  );

  const NationalityOptions = useMemo(
    () =>
      nationalityData?.map((item: DataElement) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || [],
    [nationalityData]
  );

  const CountryCodeOptions = useMemo(
    () =>
      countryData?.map((item: DataElement) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || [],
    [countryData]
  );

  const getPhoneConfig = (code: string) =>
    PHONE_PATTERNS[code] || PHONE_PATTERNS.DEFAULT;

  const phoneConfig = getPhoneConfig(phoneCode);
  const isPhoneValid =
    phoneCode && phoneNumber ? phoneConfig.pattern.test(phoneNumber) : false;
  const isSendOtpDisabled = !phoneCode || !phoneNumber || !isPhoneValid;
  const isVerifyOtpDisabled =
    !enteredOtp || enteredOtp.length < 6 || !isPhoneValid;
  const progress = ((60 - timeLeft) / 60) * 100;

  useEffect(() => {
    if (!otpSent || isVerified || timeLeft <= 0) return;
    const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [otpSent, timeLeft, isVerified]);

  useEffect(() => {
    if (timeLeft === 0 && !isVerified) setShowResend(true);
  }, [timeLeft, isVerified]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
    setValue("otp", newOtp.join(""));
  };

  const handleSendOtp = () => {
    if (isSendOtpDisabled || !sendOtpHandler) return;
    setOtpSent(true);
    setTimeLeft(60);
    setShowResend(false);
    setOtp(Array(6).fill(""));
    sendOtpHandler();
  };

  const handleResendOtp = () => {
    handleSendOtp();
    if (setIsNotVerified) setIsNotVerified(false);
  };

  const handleFileSelect = (fileData: FormData["attachment"]) => {
    if (!fileData) return;
    setAttachment(fileData);
    setValue("attachment.classification", fileData.classification || "");
    setValue("attachment.file", fileData.file || null);
    setValue("attachment.base64", fileData.base64 || null);
    setValue("attachment.fileName", fileData.fileName || "");
    setValue("attachment.fileType", fileData.fileType || "");
  };

  const baseSections =
    userType === "legal_representative"
      ? [
          {
            isHidden: true,
            title: LegalRep("claimantStatus"),
            isRadio: true,
            children: [
              {
                type: "radio",
                name: "plaintiffStatus",
                label: LegalRep("claimantStatus"),
                options: plaintiffTypeOptions,
                value: "",
                onChange: (value: string) => setValue("plaintiffStatus", value),
                validation: { required: "Region is required" },
              },
            ],
          },
        ]
      : [];

  const getWorkerSections = () => {
    const sections: any[] = [];

    useEffect(() => {
      if (!incompleteCaseType) {
        setValue("claimantStatus", "principal");
      }
    }, []);

    useEffect(() => {
      if (claimantStatus === "principal" && idNumber) {
        setValue("idNumber", idNumber);
      }
    }, [claimantStatus, idNumber, setValue]);

    // Add validation effect to ensure all required fields are filled
    useEffect(() => {
      const requiredFields = [
        "userName",
        "plaintiffRegion",
        "plaintiffCity",
        "occupation",
        "gender",
        "nationality",
        "phoneNumber",
      ] as const;

      const validateFields = async () => {
        for (const field of requiredFields) {
          await trigger(field);
        }
      };

      validateFields();
    }, []);

    // Add validation tracking for form state changes
    useEffect(() => {
      const subscription = watch((value, { name, type }) => {
        if (name) {
          trigger(name);
        }
      });
      return () => subscription.unsubscribe();
    }, [watch, trigger]);

    if (showPrincipalFields) {
      const pd = principalNICResponse?.NICDetails;
      sections.push({
        title: t("tab1_title"),
        className: "nic-details-section",
        gridCols: 3,
        children: [
          // ID Number (readonly)
          {
            type: "readonly" as const,
            label: t("nicDetails.idNumber"),
            value: idNumber,
            isLoading: nicAgentLoading,
          },

          // Name field - readonly if from NIC, input if not
          {
            type: principalNICResponse?.NICDetails?.PlaintiffName ? "readonly" : "input",
            name: "principal_userName",
            label: t("nicDetails.name"),
            value: principalNICResponse?.NICDetails?.PlaintiffName || watch("principal_userName"),
            isLoading: nicAgentLoading,
            validation: { required: t("nameValidation") },
          },

          // Region field - readonly if from NIC, autocomplete if not
          {
            type: pd?.Region ? "readonly" : "autocomplete",
            name: "principal_region",
            label: t("nicDetails.region"),
            value: pd?.Region ? pd.Region : watch("principal_region"),
            options: RegionOptions,
            isLoading: nicAgentLoading,
            ...(!pd?.Region && {
              validation: {
                required: true,
                validate: (value: any) => {
                  if (!value || (typeof value === "object" && !value.value)) {
                    return t("regionValidation");
                  }
                  return true;
                },
              },
              onChange: (value: any) => {
                setValue("principal_region", value);
                setValue("principal_city", null);
              },
            }),
          },

          // City field - readonly if from NIC, autocomplete if not
          {
            type: pd?.City ? "readonly" : "autocomplete",
            name: "principal_city",
            label: t("nicDetails.city"),
            value: pd?.City ? pd.City : watch("principal_city"),
            options: CityOptions,
            isLoading: nicAgentLoading,
            ...(!pd?.City && {
              validation: {
                required: true,
                validate: (value: any) => {
                  if (!value || (typeof value === "object" && !value.value)) {
                    return t("cityValidation");
                  }
                  return true;
                },
              },
            }),
          },

          // Date of Birth (Hijri)
          {
            type: "readonly" as const,
            label: t("nicDetails.dobHijri"),
            value: formatDateString(pd?.DateOfBirthHijri) || watch("principal_hijriDate"),
            isLoading: nicAgentLoading,
          },

          // Date of Birth (Gregorian)
          {
            type: "readonly" as const,
            label: t("nicDetails.dobGrog"),
            value: formatDateString(pd?.DateOfBirthGregorian) || watch("principal_gregorianDate"),
            isLoading: nicAgentLoading,
          },

          // Phone Number field - readonly if from NIC, input if not
          {
            type: pd?.PhoneNumber ? "readonly" : "input",
            name: "principal_phoneNumber",
            label: t("nicDetails.phoneNumber"),
            value: pd?.PhoneNumber || watch("principal_phoneNumber"),
            isLoading: nicAgentLoading,
            ...(!pd?.PhoneNumber && {
              validation: {
                required: true,
                message: t("phoneNumberValidation"),
                pattern: {
                  value: /^05\d{8}$/,
                  message: t("phoneValidationMessage"),
                },
                validate: (value: string) => {
                  if (!value) return t("phoneNumberValidation");
                  return /^05\d{8}$/.test(value) || t("phoneValidationMessage");
                },
              },
            }),
          },

          // Occupation field - readonly if from NIC, autocomplete if not
          {
            type: pd?.Occupation ? "readonly" : "autocomplete",
            name: "principal_occupation",
            label: t("nicDetails.occupation"),
            value: pd?.Occupation ? pd.Occupation : watch("principal_occupation"),
            options: OccupationOptions,
            isLoading: nicAgentLoading,
            ...(!pd?.Occupation && {
              validation: {
                required: true,
                validate: (value: any) => {
                  if (!value || (typeof value === "object" && !value.value)) {
                    return t("occupationValidation");
                  }
                  return true;
                },
              },
            }),
          },

          // Gender field - readonly if from NIC, autocomplete if not
          {
            type: pd?.Gender ? "readonly" : "autocomplete",
            name: "principal_gender",
            label: t("nicDetails.gender"),
            value: pd?.Gender ? pd.Gender : watch("principal_gender"),
            options: GenderOptions,
            isLoading: nicAgentLoading,
            ...(!pd?.Gender && {
              validation: {
                required: true,
                validate: (value: any) => {
                  if (!value || (typeof value === "object" && !value.value)) {
                    return t("genderValidation");
                  }
                  return true;
                },
              },
            }),
          },

          // Nationality field - readonly if from NIC, autocomplete if not
          {
            type: pd?.Nationality ? "readonly" : "autocomplete",
            name: "principal_nationality",
            label: t("nicDetails.nationality"),
            value: pd?.Nationality ? pd.Nationality : watch("principal_nationality"),
            options: NationalityOptions,
            isLoading: nicAgentLoading,
            ...(!pd?.Nationality && {
              validation: {
                required: true,
                validate: (value: any) => {
                  if (!value || (typeof value === "object" && !value.value)) {
                    return t("nationalityValidation");
                  }
                  return true;
                },
              },
            }),
          },
          ...(principalNICResponse?.NICDetails?.Applicant_Code === "DW1"
            ? [
                {
                  type: "readonly" as const,
                  label: t("workerType"),
                  value: t("domestic_worker"),
                },
              ]
            : []),
        ],
      });

      if (principalNICResponse?.NICDetails?.Applicant_Code === "DW1") {
        sections.push({
          title: t("attach_title"),
          className: "attachment-section",
          gridCols: 1,
          children: [
            {
              type: "custom",
              component: (
                <AddAttachment
                  onFileSelect={handleFileSelect}
                  selectedFile={attachment}
                />
              ),
            },
          ],
        });
      }
    }
    if (showRepresentativeFields) {
      // 1) Agent-Type radio
      sections.push({
        title: t("AgentType"),
        isRadio: true,
        children: [
          {
            type: "radio" as const,
            name: "agentType",
            label: t("plaintiff_type"),
            options: AgentTypeOptions,
            value: agentType,
            onChange: (v: string) => setValue("agentType", v),
            validation: { required: t("agentTypeValidation") },
          },
        ],
      });

      // 2) Agent Data - only show if agentType is selected
      if (agentType) {
        // Local Agency Agent Section
        if (agentType === "local_agency") {
          // Agent Section (local)
          sections.push({
            title: t("nicDetails.agentData"),
            className: "agent-data-section",
            gridCols: 3,
            children: [
              { type: "readonly" as const, label: t("nicDetails.idNumber"), value: idNumber },
              { type: "readonly" as const, name: "localAgent_agentName", label: t("nicDetails.agentName"), value: agentInfoData?.Agent?.AgentName || "", isLoading: apiLoadingStates.agent },
              { type: "custom", component: (
                <FieldWrapper label={t("nicDetails.agencyNumber")} labelFor="localAgent_agencyNumber" invalidFeedback={errors.localAgent_agencyNumber?.message}>
                  <DigitOnlyInput id="localAgent_agencyNumber" name="localAgent_agencyNumber" placeholder="10xxxxxxxx" value={String(watch("localAgent_agencyNumber") || "")} onChange={e => setValue("localAgent_agencyNumber", typeof e === "string" ? e : e.target.value)} onBlur={() => { const v = watch("localAgent_agencyNumber") + ""; if (v && v.length >= 1 && v.length <= 10) { onAgencyNumberChange(v); }}} maxLength={10} required />
                </FieldWrapper>
              ) },
              { type: "readonly" as const, name: "localAgent_agencyStatus", label: t("nicDetails.agencyStatus"), value: agentInfoData?.Agent?.MandateStatus || "", isLoading: apiLoadingStates.agent },
              { type: "readonly" as const, name: "localAgent_agencySource", label: t("nicDetails.agencySource"), value: agentInfoData?.Agent?.MandateSource || "", isLoading: apiLoadingStates.agent },
              { type: "input" as const, name: "localAgent_currentPlaceOfWork", inputType: "text", label: t("nicDetails.currentWorkingPlace"), value: watch("localAgent_currentPlaceOfWork"), onChange: (v: string) => setValue("localAgent_currentPlaceOfWork", v), validation: { required: t("workplaceValidation") } },
              { type: "input" as const, name: "localAgent_residencyAddress", inputType: "text", label: t("nicDetails.residenceAddress"), value: watch("localAgent_residencyAddress"), onChange: (v: string) => setValue("localAgent_residencyAddress", v), validation: { required: t("residenceAddressValidation") } },
            ],
          });
          // Plaintiff Section (local)
          sections.push({
            title: t("nicDetails.plaintiffData"),
            className: "plaintiff-data-section",
            gridCols: 3,
            disabled: !hasValidAgency,
            children: [
              {
                type: "custom",
                component: (() => {
                  const idValue = watch("localAgent_workerAgentIdNumber") || "";
                  const idIsValid = idValue.length === 10;
                  return (
                    <FieldWrapper
                      label={t("nicDetails.idNumber")}
                      labelFor="localAgent_workerAgentIdNumber"
                      invalidFeedback={errors.localAgent_workerAgentIdNumber?.message}
                    >
                      <DigitOnlyInput
                        id="localAgent_workerAgentIdNumber"
                        name="localAgent_workerAgentIdNumber"
                        placeholder="10xxxxxxxx"
                        value={idValue}
                        onChange={e => {
                          const newId = typeof e === "string" ? e : e.target.value;
                          setValue("localAgent_workerAgentIdNumber", newId);
                          let shouldClear = false;
                          if (newId.length === 10 && !safeAllowedIds.includes(newId)) {
                            shouldClear = true;
                            toast.error(t("error.idNotUnderAgency"));
                          } else if (newId.length !== 10) {
                            shouldClear = true;
                          }
                          if (shouldClear) {
                            setValue("localAgent_workerAgentDateOfBirthHijri", "");
                            setValue("localAgent_gregorianDate", "");
                            setValue("localAgent_userName", "");
                            setValue("localAgent_phoneNumber", "");
                            setValue("localAgent_region", null);
                            setValue("localAgent_city", null);
                            setValue("localAgent_occupation", null);
                            setValue("localAgent_gender", null);
                            setValue("localAgent_nationality", null);
                            clearErrors("localAgent_workerAgentIdNumber");
                          }
                        }}
                        maxLength={10}
                        disabled={!hasValidAgency}
                      />
                    </FieldWrapper>
                  );
                })(),
              },
              {
                type: "custom",
                component: (
                  <div className="flex flex-col gap-2">
                    {(!hasValidAgency || (watch("localAgent_workerAgentIdNumber") || "").length !== 10 || !safeAllowedIds.includes(watch("localAgent_workerAgentIdNumber") || ""))
                      ? (
                        <div style={{ pointerEvents: 'none', opacity: 0.5 }}>
                          <HijriDatePickerInput
                            control={control}
                            name="localAgent_workerAgentDateOfBirthHijri"
                            label={t("nicDetails.dobHijri")}
                            rules={{ required: true }}
                            onChangeHandler={(date, onChange) => {
                              userPickedDateRef.current = true;
                              if (!date || Array.isArray(date)) {
                                setValue("localAgent_gregorianDate", "");
                                return;
                              }
                              const gregorianStr = date.convert(gregorian, gregorianLocaleEn).format("YYYY/MM/DD");
                              const gregorianStorage = gregorianStr.replace(/\//g, "");
                              if (watch("localAgent_gregorianDate") !== gregorianStorage) {
                                setValue("localAgent_gregorianDate", gregorianStorage);
                              }
                              // Never call NIC if not allowed
                            }}
                            notRequired={false}
                            isDateOfBirth={true}
                          />
                        </div>
                      )
                      : (
                        <HijriDatePickerInput
                          control={control}
                          name="localAgent_workerAgentDateOfBirthHijri"
                          label={t("nicDetails.dobHijri")}
                          rules={{ required: true }}
                          onChangeHandler={(date, onChange) => {
                            userPickedDateRef.current = true;
                            if (!date || Array.isArray(date)) {
                              setValue("localAgent_gregorianDate", "");
                              return;
                            }
                            const gregorianStr = date.convert(gregorian, gregorianLocaleEn).format("YYYY/MM/DD");
                            const gregorianStorage = gregorianStr.replace(/\//g, "");
                            if (watch("localAgent_gregorianDate") !== gregorianStorage) {
                              setValue("localAgent_gregorianDate", gregorianStorage);
                            }
                            // Only call NIC if allowed
                            if (
                              hasValidAgency &&
                              (watch("localAgent_workerAgentIdNumber") || "").length === 10 &&
                              safeAllowedIds.includes(watch("localAgent_workerAgentIdNumber") || "")
                            ) {
                              if (shouldFetchNic) refetchNICAgent();
                            }
                          }}
                          notRequired={false}
                          isDateOfBirth={true}
                        />
                      )}
                    <GregorianDateDisplayInput control={control} name="localAgent_gregorianDate" label={t("nicDetails.dobGrog")} notRequired={false} />
                  </div>
                ),
              },
              {
                type: localAgentNICResponse?.NICDetails?.PlaintiffName ? "readonly" : "input",
                name: "localAgent_userName",
                label: t("nicDetails.name"),
                value: localAgentNICResponse?.NICDetails?.PlaintiffName || watch("localAgent_userName"),
                ...(localAgentNICResponse?.NICDetails?.PlaintiffName ? {} : { onChange: (v: string) => setValue("localAgent_userName", v) }),
                validation: { required: t("nameValidation") },
                disabled: !(
                  hasValidAgency &&
                  (watch("localAgent_workerAgentIdNumber") || "").length === 10 &&
                  safeAllowedIds.includes(watch("localAgent_workerAgentIdNumber") || "") &&
                  !!watch("localAgent_workerAgentDateOfBirthHijri")
                ),
              },
              {
                type: "input",
                name: "localAgent_phoneNumber",
                label: t("nicDetails.phoneNumber"),
                inputType: "text",
                placeholder: "05xxxxxxxx",
                value: watch("localAgent_phoneNumber"),
                onChange: (v: string) => setValue("localAgent_phoneNumber", v),
                validation: { required: t("phoneNumberValidation"), pattern: { value: /^05\d{8}$/, message: t("phoneValidationMessage") } },
                disabled: !(
                  hasValidAgency &&
                  (watch("localAgent_workerAgentIdNumber") || "").length === 10 &&
                  safeAllowedIds.includes(watch("localAgent_workerAgentIdNumber") || "") &&
                  !!watch("localAgent_workerAgentDateOfBirthHijri")
                ),
              },
              {
                type: localAgentNICResponse?.NICDetails?.Region ? "readonly" : "autocomplete",
                name: "localAgent_region",
                isLoading: false,
                label: t("nicDetails.region"),
                value: localAgentNICResponse?.NICDetails?.Region || watch("localAgent_region"),
                ...(localAgentNICResponse?.NICDetails?.Region ? {} : { 
                  options: RegionOptions || [], 
                  validation: { required: t("regionValidation") },
                  onChange: (value: any) => {
                    setValue("localAgent_region", value);
                    setValue("localAgent_city", null);
                  },
                }),
                disabled: !(
                  hasValidAgency &&
                  (watch("localAgent_workerAgentIdNumber") || "").length === 10 &&
                  safeAllowedIds.includes(watch("localAgent_workerAgentIdNumber") || "") &&
                  !!watch("localAgent_workerAgentDateOfBirthHijri")
                ),
              },
              {
                type: localAgentNICResponse?.NICDetails?.City ? "readonly" : "autocomplete",
                name: "localAgent_city",
                isLoading: false,
                label: t("nicDetails.city"),
                value: localAgentNICResponse?.NICDetails?.City || watch("localAgent_city"),
                ...(localAgentNICResponse?.NICDetails?.City ? {} : { options: CityOptions || [], validation: { required: t("cityValidation") } }),
                disabled: !(
                  hasValidAgency &&
                  (watch("localAgent_workerAgentIdNumber") || "").length === 10 &&
                  safeAllowedIds.includes(watch("localAgent_workerAgentIdNumber") || "") &&
                  !!watch("localAgent_workerAgentDateOfBirthHijri")
                ),
              },
              {
                isLoading: nicAgentLoading,
                type: localAgentNICResponse?.NICDetails?.Occupation ? "readonly" : "autocomplete",
                name: "localAgent_occupation",
                label: t("nicDetails.occupation"),
                value: localAgentNICResponse?.NICDetails?.Occupation || watch("localAgent_occupation"),
                ...(localAgentNICResponse?.NICDetails?.Occupation ? {} : { options: OccupationOptions || [], validation: { required: t("occupationValidation") } }),
                disabled: !(
                  hasValidAgency &&
                  (watch("localAgent_workerAgentIdNumber") || "").length === 10 &&
                  safeAllowedIds.includes(watch("localAgent_workerAgentIdNumber") || "") &&
                  !!watch("localAgent_workerAgentDateOfBirthHijri")
                ),
              },
              {
                isLoading: nicAgentLoading,
                type: localAgentNICResponse?.NICDetails?.Gender ? "readonly" : "autocomplete",
                name: "localAgent_gender",
                label: t("nicDetails.gender"),
                value: localAgentNICResponse?.NICDetails?.Gender && agentType === "local_agency" ? localAgentNICResponse.NICDetails.Gender : watch("localAgent_gender"),
                ...(localAgentNICResponse?.NICDetails?.Gender ? {} : { options: GenderOptions || [], validation: { required: t("genderValidation") } }),
                disabled: !(
                  hasValidAgency &&
                  (watch("localAgent_workerAgentIdNumber") || "").length === 10 &&
                  safeAllowedIds.includes(watch("localAgent_workerAgentIdNumber") || "") &&
                  !!watch("localAgent_workerAgentDateOfBirthHijri")
                ),
              },
              {
                isLoading: nicAgentLoading,
                type: localAgentNICResponse?.NICDetails?.Nationality ? "readonly" : "autocomplete",
                name: "localAgent_nationality",
                label: t("nicDetails.nationality"),
                value: localAgentNICResponse?.NICDetails?.Nationality && agentType === "local_agency" ? localAgentNICResponse.NICDetails.Nationality : watch("localAgent_nationality"),
                ...(localAgentNICResponse?.NICDetails?.Nationality ? {} : { options: NationalityOptions || [], validation: { required: t("nationalityValidation") } }),
                disabled: !(
                  hasValidAgency &&
                  (watch("localAgent_workerAgentIdNumber") || "").length === 10 &&
                  safeAllowedIds.includes(watch("localAgent_workerAgentIdNumber") || "") &&
                  !!watch("localAgent_workerAgentDateOfBirthHijri")
                ),
              },
            ],
          });
        }

        // External Agency Agent Section
        if (agentType === "external_agency") {
          // Agent Section (external)
          sections.push({
            title: t("nicDetails.agentData"),
            className: "agent-data-section",
            gridCols: 3,
            children: [
              { type: "readonly" as const, label: t("nicDetails.idNumber"), value: idNumber },
              { type: "input" as const, name: "externalAgent_agentName", label: t("nicDetails.agentName"), value: watch("externalAgent_agentName"), onChange: (v: string) => setValue("externalAgent_agentName", v), validation: { required: t("agentNameValidation") } },
              { type: "custom", component: (
                <FieldWrapper label={t("nicDetails.agencyNumber")} labelFor="externalAgent_agencyNumber" invalidFeedback={errors.externalAgent_agencyNumber?.message}>
                  <DigitOnlyInput id="externalAgent_agencyNumber" name="externalAgent_agencyNumber" placeholder={t("nicDetails.agencyNumberPlaceholder")} value={String(watch("externalAgent_agencyNumber") || "")} onChange={e => setValue("externalAgent_agencyNumber", typeof e === "string" ? e : e.target.value)} maxLength={10} required />
                </FieldWrapper>
              ), validation: { required: t("agencyNumberValidation") } },
              { type: "input" as const, name: "externalAgent_agencyStatus", label: t("nicDetails.agencyStatus"), value: watch("externalAgent_agencyStatus"), onChange: (v: string) => setValue("externalAgent_agencyStatus", v), validation: { required: t("agencyStatusValidation") } },
              { type: "input" as const, name: "externalAgent_agencySource", label: t("nicDetails.agencySource"), value: watch("externalAgent_agencySource"), onChange: (v: string) => setValue("externalAgent_agencySource", v), validation: { required: t("agencySourceValidation") } },
              { type: "input" as const, name: "externalAgent_currentPlaceOfWork", inputType: "text", label: t("nicDetails.currentWorkingPlace"), value: watch("externalAgent_currentPlaceOfWork"), onChange: (v: string) => setValue("externalAgent_currentPlaceOfWork", v), validation: { required: t("workplaceValidation") } },
              { type: "input" as const, name: "externalAgent_residencyAddress", inputType: "text", label: t("nicDetails.residenceAddress"), value: watch("externalAgent_residencyAddress"), onChange: (v: string) => setValue("externalAgent_residencyAddress", v), validation: { required: t("residenceAddressValidation") } },
              { type: "input" as const, name: "externalAgent_agentPhoneNumber", label: t("nicDetails.agentPhoneNumber"), inputType: "text", placeholder: t("nicDetails.phonePlaceholder"), value: watch("externalAgent_agentPhoneNumber"), onChange: (v: string) => setValue("externalAgent_agentPhoneNumber", v), validation: { required: t("phoneNumberValidation"), pattern: { value: /^05\d{8}$/, message: t("phoneValidationMessage") } } },
            ],
          });
          // Plaintiff Section (external)
          sections.push({
            title: t("nicDetails.plaintiffData"),
            className: "plaintiff-data-section",
            gridCols: 3,
            children: [
              { type: "custom", component: (
                <FieldWrapper label={t("nicDetails.idNumber")} labelFor="externalAgent_workerAgentIdNumber" invalidFeedback={errors.externalAgent_workerAgentIdNumber?.message}>
                  <DigitOnlyInput id="externalAgent_workerAgentIdNumber" name="externalAgent_workerAgentIdNumber" placeholder="10xxxxxxxx" value={String(watch("externalAgent_workerAgentIdNumber") || "")} onChange={e => setValue("externalAgent_workerAgentIdNumber", typeof e === "string" ? e : e.target.value)} maxLength={10} required />
                </FieldWrapper>
              ) },
              { type: "custom", component: (
                <div className="flex flex-col gap-2">
                  <HijriDatePickerInput control={control} name="externalAgent_workerAgentDateOfBirthHijri" label={t("nicDetails.dobHijri")} rules={{ required: true }} onChangeHandler={(date, onChange) => { userPickedDateRef.current = true; if (!date || Array.isArray(date)) { setValue("externalAgent_gregorianDate", ""); return; } const gregorianStr = date.convert(gregorian, gregorianLocaleEn).format("YYYY/MM/DD"); const gregorianStorage = gregorianStr.replace(/\//g, ""); if (watch("externalAgent_gregorianDate") !== gregorianStorage) { setValue("externalAgent_gregorianDate", gregorianStorage); } }} notRequired={false} isDateOfBirth={true} />
                  <GregorianDateDisplayInput control={control} name="externalAgent_gregorianDate" label={t("nicDetails.dobGrog")} notRequired={false} />
                </div>
              ) },
              { type: externalAgentNICResponse?.NICDetails?.PlaintiffName ? "readonly" : "input",
                name: "externalAgent_userName",
                label: t("nicDetails.name"),
                value: externalAgentNICResponse?.NICDetails?.PlaintiffName || watch("externalAgent_userName"),
                ...(externalAgentNICResponse?.NICDetails?.PlaintiffName ? {} : { onChange: (v: string) => setValue("externalAgent_userName", v) }),
                validation: { required: t("nameValidation") },
              },
              { type: "input", name: "externalAgent_phoneNumber", label: t("nicDetails.phoneNumber"), inputType: "text", placeholder: t("nicDetails.phonePlaceholder"), value: watch("externalAgent_phoneNumber"), onChange: (v: string) => setValue("externalAgent_phoneNumber", v), validation: { required: t("phoneNumberValidation"), pattern: { value: /^05\d{8}$/, message: t("phoneValidationMessage") } } },
              { type: externalAgentNICResponse?.NICDetails?.Region ? "readonly" : "autocomplete", name: "externalAgent_region", isLoading: false, label: t("nicDetails.region"), value: externalAgentNICResponse?.NICDetails?.Region || watch("externalAgent_region"), ...(externalAgentNICResponse?.NICDetails?.Region ? {} : { options: RegionOptions || [], validation: { required: t("regionValidation") }, onChange: (value: any) => { setValue("externalAgent_region", value); setValue("externalAgent_city", null); } }) },
              { type: externalAgentNICResponse?.NICDetails?.City ? "readonly" : "autocomplete", name: "externalAgent_city", isLoading: false, label: t("nicDetails.city"), value: externalAgentNICResponse?.NICDetails?.City || watch("externalAgent_city"), ...(externalAgentNICResponse?.NICDetails?.City ? {} : { options: CityOptions || [], validation: { required: t("cityValidation") } }) },
              { isLoading: nicAgentLoading, type: externalAgentNICResponse?.NICDetails?.Occupation ? "readonly" : "autocomplete", name: "externalAgent_occupation", label: t("nicDetails.occupation"), value: externalAgentNICResponse?.NICDetails?.Occupation || watch("externalAgent_occupation"), ...(externalAgentNICResponse?.NICDetails?.Occupation ? {} : { options: OccupationOptions || [], validation: { required: t("occupationValidation") } }) },
              { isLoading: nicAgentLoading, type: externalAgentNICResponse?.NICDetails?.Gender ? "readonly" : "autocomplete", name: "externalAgent_gender", label: t("nicDetails.gender"), value: externalAgentNICResponse?.NICDetails?.Gender && agentType === "external_agency" ? externalAgentNICResponse.NICDetails.Gender : watch("externalAgent_gender"), ...(externalAgentNICResponse?.NICDetails?.Gender ? {} : { options: GenderOptions || [], validation: { required: t("genderValidation") } }) },
              { isLoading: nicAgentLoading, type: externalAgentNICResponse?.NICDetails?.Nationality ? "readonly" : "autocomplete", name: "externalAgent_nationality", label: t("nicDetails.nationality"), value: externalAgentNICResponse?.NICDetails?.Nationality && agentType === "external_agency" ? externalAgentNICResponse.NICDetails.Nationality : watch("externalAgent_nationality"), ...(externalAgentNICResponse?.NICDetails?.Nationality ? {} : { options: NationalityOptions || [], validation: { required: t("nationalityValidation") } }) },
            ],
          });
        }
      }
    }

    // --- NEW: Plaintiff's Data section (modeled after legdefendant.forms.formLayout.tsx) ---
    if (
      claimantStatus === "representative" &&
      agentType &&
      agentType !== "local_agency" &&
      agentType !== "external_agency"
    ) {
      sections.push({
        title: t("nicDetails.plaintiffData"),
        className: "plaintiff-data-section",
        gridCols: 3,
        disabled: agentType === "local_agency" && !hasValidAgency, // Only disable for local agency when not valid

        children: [
          {
            type: "custom",
            component: (
              <FieldWrapper
                label={t("nicDetails.idNumber")}
                labelFor="workerAgentIdNumber"
                invalidFeedback={errors.workerAgentIdNumber?.message}
              >
                <DigitOnlyInput
                  id="workerAgentIdNumber"
                  name="workerAgentIdNumber"
                  placeholder="10xxxxxxxx"
                  value={String(watch("workerAgentIdNumber") || "")}
                  onChange={(e) => {
                    const v = typeof e === "string" ? e : e.target.value;
                    setValue("workerAgentIdNumber", v);
                  }}
                  onBlur={() => {
                    // only attempt NIC lookup if agency is validated
                    if (hasValidAgency && shouldFetchNic) {
                      refetchNICAgent();
                    }
                  }}
                  maxLength={10}
                  disabled={agentType === "local_agency" && (!hasMandateNumber || !hasValidAgency)}
                />
              </FieldWrapper>
            ),
          },
          {
            type: "custom",
            component: (
              <div className="flex flex-col gap-2">
                <HijriDatePickerInput
                  control={control}
                  name="workerAgentDateOfBirthHijri"
                  label={t("nicDetails.dobHijri")}
                  rules={{ required: true }}
                  onChangeHandler={(date, onChange) => {
                    userPickedDateRef.current = true;
                    if (!date || Array.isArray(date)) {
                      setValue("localAgent_gregorianDate", "");
                      return;
                    }
                    const gregorianStr = date
                      .convert(gregorian, gregorianLocaleEn)
                      .format("YYYY/MM/DD");
                    const gregorianStorage = gregorianStr.replace(/\//g, "");
                    // Only update if value is different
                    if (watch("localAgent_gregorianDate") !== gregorianStorage) {
                      setValue("localAgent_gregorianDate", gregorianStorage);
                    }
                    // Trigger refetch when date changes
                    if (shouldFetchNic) refetchNICAgent();
                  }}
                  notRequired={false}
                  isDateOfBirth={true}
                />
                <GregorianDateDisplayInput
                  control={control}
                  name="localAgent_gregorianDate"
                  label={t("nicDetails.dobGrog")}
                  notRequired={false}
                />
              </div>
            ),
          },
          {
            type: representativeNICResponse?.NICDetails?.PlaintiffName
              ? "readonly"
              : "input",
            label: t("nicDetails.name"),
            value:
              representativeNICResponse?.NICDetails?.PlaintiffName ||
              watch("userName"),
            isLoading: nicAgentLoading,
            name: "userName",
            ...(representativeNICResponse?.NICDetails?.PlaintiffName
              ? { inputType: "text" }
              : {}),
            ...(!representativeNICResponse?.NICDetails?.PlaintiffName && {
              validation: { required: t("nameValidation") },
            }),
            disabled: agentType === "local_agency" && (!hasMandateNumber || !hasValidAgency),
          },
          {
            type: "input",
            name: "phoneNumber",
            label: t("nicDetails.phoneNumber"),
            inputType: "text",
            placeholder: "05xxxxxxxx",
            value: watch("phoneNumber"),
            onChange: (v: string) => setValue("phoneNumber", v),
            validation: {
              required: t("phoneNumberValidation"),
              pattern: {
                value: /^05\d{8}$/,
                message: t("phoneValidationMessage"),
              },
            },
            disabled: agentType === "local_agency" && (!hasMandateNumber || !hasValidAgency),
          },
          {
            type: representativeNICResponse?.NICDetails?.Region
              ? "readonly"
              : "autocomplete",
            name: "plaintiffRegion",
            isLoading: false,
            label: t("nicDetails.region"),
            value:
              representativeNICResponse?.NICDetails?.Region ||
              watch("plaintiffRegion"),
            ...(representativeNICResponse?.NICDetails?.Region
              ? {}
              : {
                  options: RegionOptions || [],
                  validation: { required: t("regionValidation") },
                }),
            disabled: agentType === "local_agency" && (!hasMandateNumber || !hasValidAgency),
          },
          {
            type: representativeNICResponse?.NICDetails?.City
              ? "readonly"
              : "autocomplete",
            name: "plaintiffCity",
            isLoading: false,
            label: t("nicDetails.city"),
            value:
              representativeNICResponse?.NICDetails?.City ||
              watch("plaintiffCity"),
            ...(representativeNICResponse?.NICDetails?.City
              ? {}
              : {
                  options: CityOptions || [],
                  validation: { required: t("cityValidation") },
                }),
            disabled: agentType === "local_agency" && (!hasMandateNumber || !hasValidAgency),
          },
          {
            isLoading: nicAgentLoading,
            type: representativeNICResponse?.NICDetails?.Occupation
              ? "readonly"
              : "autocomplete",
            name: "occupation",
            label: t("nicDetails.occupation"),
            value:
              representativeNICResponse?.NICDetails?.Occupation ||
              watch("occupation"),
            ...(representativeNICResponse?.NICDetails?.Occupation
              ? {}
              : {
                  options: OccupationOptions || [],
                  validation: { required: t("occupationValidation") },
                }),
            disabled: agentType === "local_agency" && (!hasMandateNumber || !hasValidAgency),
          },
          {
            isLoading: nicAgentLoading,
            type: representativeNICResponse?.NICDetails?.Gender
              ? "readonly"
              : "autocomplete",
            name: "gender",
            label: t("nicDetails.gender"),
            value:
              representativeNICResponse?.NICDetails?.Gender || watch("gender"),
            ...(representativeNICResponse?.NICDetails?.Gender
              ? {}
              : {
                  options: GenderOptions || [],
                  validation: { required: t("genderValidation") },
                }),
            disabled: agentType === "local_agency" && (!hasMandateNumber || !hasValidAgency),
          },
          {
            isLoading: nicAgentLoading,
            type: representativeNICResponse?.NICDetails?.Nationality
              ? "readonly"
              : "autocomplete",
            name: "nationality",
            label: t("nicDetails.nationality"),
            value:
              representativeNICResponse?.NICDetails?.Nationality ||
              watch("nationality"),
            ...(representativeNICResponse?.NICDetails?.Nationality
              ? {}
              : {
                  options: NationalityOptions || [],
                  validation: { required: t("nationalityValidation") },
                }),
            disabled: agentType === "local_agency" && (!hasMandateNumber || !hasValidAgency),
          },
        ],
      });
    }

    // --- NEW: UnprofessionalLetterAttachments section ---
    if (
      unprofessionalLetterAttachments &&
      unprofessionalLetterAttachments.length > 0
    ) {
      sections.push({
        title: t(
          "unprofessionalLetterAttachments.title",
          "Unprofessional Letter Attachments"
        ),
        className: "attachment-section",
        gridCols: 1,
        children: unprofessionalLetterAttachments.map((file: any, idx: number) => ({
          type: "custom" as const,
          component: (
            <FileAttachment
              key={file.FileKey || idx}
              fileName={
                file.FileName ||
                t("unprofessionalLetterAttachments.unnamed", "Unnamed File")
              }
              onView={() => {
                // TODO: Implement file preview logic if needed
                window.open(
                  `/api/file/download?key=${encodeURIComponent(file.FileKey)}`
                );
              }}
              className="w-full"
            />
          ),
        })),
      });
    }

    return sections;
  };

  const ClaimantSelectSection = [];

  if (
    shouldShowClaimantStatus &&
    (userType === "Worker" || plaintiffStatus === "leg_rep_worker")
  ) {
    ClaimantSelectSection.push({
      isRadio: true,
      children: [
        {
          type: "radio",
          name: "claimantStatus",
          label: t("claimantStatus"),
          options: ClaimantStatusRadioOptions,
          value: claimantStatus,
          onChange: (value: string) => {
            setValue("claimantStatus", value);
          },
          validation: { required: "Region is required" },
        },
      ],
    });
  }

  const conditionalSections = [];

  if (plaintiffStatus === "legal_representative") {
    conditionalSections.push(
      {
        data: {
          type: "readonly",
          fields: [
            {
              label: LegalRep("plaintiffDetails.MainCategoryGovernmentEntity"),
              value: selectedMainCategory?.label || "",
            },
            {
              label: LegalRep("plaintiffDetails.SubcategoryGovernmentEntity"),
              value: selectedSubCategory?.label,
            },
          ],
        },
      },
      {
        title: LegalRep("LegalRepresentative"),
        data: {
          type: "readonly",
          fields: [
            {
              label: LegalRep(
                "LegalRepresentativeDetails.LegalRepresentativeName"
              ),
              value: govRepDetail?.RepName,
            },
            {
              label: LegalRep(
                "LegalRepresentativeDetails.LegalRepresentativeID"
              ),
              value: govRepDetail?.RepNationalid,
            },
            {
              label: LegalRep("LegalRepresentativeDetails.MobileNumber"),
              value: govRepDetail?.RepMobileNumber,
            },
            {
              label: LegalRep("LegalRepresentativeDetails.EmailAddress"),
              value: govRepDetail?.EmailAddress,
            },
          ],
        },
      }
    );
  }
  const methods = useForm<FormData>();

  const OTPSection = OTPFormLayout({
    watch,
    setValue,
    countryData,
    sendOtpHandler,
    isVerified,
    isNotVerified,
    setIsNotVerified,
  });

  const formLayout: SectionLayout[] = [
    ...baseSections,
    ...ClaimantSelectSection,
    ...conditionalSections,
    ...getWorkerSections(),
    // ...InternationalPhoneNumberSection,
    ...OTPSection,
  ].filter(Boolean) as SectionLayout[];

  // Add this effect after the existing useEffect blocks
  useEffect(() => {
    // Function to set form values from data
    const setFormValuesFromData = (data: any) => {
      if (!data) return;

      // Set all form values from data
      if (data?.PlaintiffName) {
        setValue("userName", data?.PlaintiffName || data?.userName || "", {
          shouldValidate: data?.PlaintiffName !== "",
        });
      }

      // Set region with proper code and label
      if (data?.Region_Code || data?.plaintiffRegion?.value) {
        setValue(
          "plaintiffRegion",
          {
            value: data?.Region_Code || data?.plaintiffRegion?.value || "",
            label: data?.Region || data?.plaintiffRegion?.label || "",
          },
          {
            shouldValidate: data?.Region_Code !== "",
          }
        );
      }

      // Set city with proper code and label
      if (data?.City_Code || data?.plaintiffCity?.value) {
        setValue(
          "plaintiffCity",
          {
            value: data?.City_Code || data?.plaintiffCity?.value || "",
            label: data?.City || data?.plaintiffCity?.label || "",
          },
          {
            shouldValidate: data?.City_Code !== "",
          }
        );
      }

      // Set occupation with proper code and label
      if (data?.Occupation_Code || data?.occupation?.value) {
        const occupationValue = {
          value: data?.Occupation_Code || data?.occupation?.value || "",
          label: data?.Occupation || data?.occupation?.label || "",
        };
        setValue("occupation", occupationValue, {
          shouldValidate: data?.Occupation_Code !== "",
        });
        // Clear any existing errors
        clearErrors("occupation");
      }

      // Set gender with proper code and label
      if (data?.Gender_Code || data?.gender?.value) {
        const genderValue = {
          value: data?.Gender_Code || data?.gender?.value || "",
          label: data?.Gender || data?.gender?.label || "",
        };
        setValue("gender", genderValue, {
          shouldValidate: data?.Gender_Code !== "",
        });
        // Clear any existing errors
        clearErrors("gender");
      }

      // Set nationality with proper code and label
      if (data?.Nationality_Code || data?.nationality?.value) {
        const nationalityValue = {
          value: data?.Nationality_Code || data?.nationality?.value || "",
          label: data?.Nationality || data?.nationality?.label || "",
        };
        setValue("nationality", nationalityValue, {
          shouldValidate: data?.Nationality_Code !== "",
        });
        // Clear any existing errors
        clearErrors("nationality");
      }

      // Set dates
      if (data?.DateOfBirthHijri) {
        setValue("hijriDate", data?.DateOfBirthHijri || data?.hijriDate || "", {
          shouldValidate: data?.DateOfBirthHijri !== "",
        });
      }

      if (data?.DateOfBirthGregorian) {
        setValue(
          "gregorianDate",
          data?.DateOfBirthGregorian || data?.gregorianDate || "",
          {
            shouldValidate: data?.DateOfBirthGregorian !== "",
          }
        );
      }

      // Set phone number
      if (data?.PhoneNumber || data?.phoneNumber) {
        setValue(
          "phoneNumber",
          (data?.PhoneNumber || data?.phoneNumber).toString(),
          {
            shouldValidate: data?.PhoneNumber !== "",
          }
        );
      }
      if (data?.Agent_PhoneNumber || data?.agentPhoneNumber) {
        setValue(
          "agentPhoneNumber",
          (data?.Agent_PhoneNumber || data?.agentPhoneNumber).toString(),
          {
            shouldValidate: data?.Agent_PhoneNumber !== "",
          }
        );
      }
    };

    // Handle NIC data
    if (principalNICResponse?.NICDetails) {
      setFormValuesFromData(principalNICResponse.NICDetails);
    }

    const caseDetails = getCookie("caseDetails");
    if (caseDetails) {
      setFormValuesFromData(caseDetails);
      // NEW: Set UnprofessionalLetterAttachments for display
      if (caseDetails.UnprofessionalLetterAttachments) {
        setUnprofessionalLetterAttachments(
          caseDetails.UnprofessionalLetterAttachments
        );
      }
    }

    trigger([
      "userName",
      "plaintiffRegion",
      "plaintiffCity",
      "occupation",
      "gender",
      "nationality",
      "phoneNumber",
    ]);
  }, [principalNICResponse, setValue, trigger, getCookie, clearErrors]);

  // --- NEW: State for UnprofessionalLetterAttachments ---
  // const [unprofessionalLetterAttachments, setUnprofessionalLetterAttachments] = useState<any[]>([]); // Moved to top

  // Clear plaintiff details when mandate number is empty
  useEffect(() => {
    if (claimantStatus === "representative" && !hasMandateNumber) {
      [
        "userName",
        "plaintiffRegion",
        "plaintiffCity",
        "occupation",
        "gender",
        "nationality",
        "hijriDate",
        "gregorianDate",
        "applicant",
        "phoneNumber",
        "workerAgentIdNumber",
        "workerAgentDateOfBirthHijri",
      ].forEach((f) => setValue(f as any, ""));
    }
  }, [hasMandateNumber, setValue, claimantStatus]);

  // Clear plaintiff details when shouldFetchNic becomes false
  const watchedUserName = useWatch({ name: "userName", control });
  const watchedPlaintiffRegion = useWatch({ name: "plaintiffRegion", control });

  useEffect(() => {
    if (claimantStatus === "representative" && !shouldFetchNic) {
      if (!watchedUserName && !watchedPlaintiffRegion) {
        [
          "userName",
          "plaintiffRegion",
          "plaintiffCity",
          "occupation",
          "gender",
          "nationality",
          "hijriDate",
          "gregorianDate",
          "applicant",
          "phoneNumber",
        ].forEach((f) => setValue(f as any, ""));
      }
    }
  }, [shouldFetchNic, setValue, claimantStatus, watchedUserName, watchedPlaintiffRegion]);

  // Handle ID number changes and revalidate
  useEffect(() => {
    if (claimantStatus === "representative" && agentType === "local_agency" && workerAgentIdNumber && workerAgentIdNumber.length === 10) {
      // Always validate the current ID
      if (!isPlaintiffIdUnderAgency) {
        [
          "userName",
          "plaintiffRegion",
          "plaintiffCity",
          "occupation",
          "gender",
          "nationality",
          "hijriDate",
          "gregorianDate",
          "applicant",
          "phoneNumber",
        ].forEach((f) => setValue(f as any, ""));
        // Always set error for invalid ID (remove any existing error first)
        clearErrors("workerAgentIdNumber");
        setError("workerAgentIdNumber", {
          type: "validate",
          message: t("error.idNotUnderAgency"),
        });
      } else {
        // Clear error if ID is valid
        clearErrors("workerAgentIdNumber");
      }
    } else if (claimantStatus === "representative" && agentType === "local_agency" && workerAgentIdNumber && workerAgentIdNumber.length !== 10) {
      // Clear error if ID is not 10 digits yet
      clearErrors("workerAgentIdNumber");
    }
  }, [workerAgentIdNumber, isPlaintiffIdUnderAgency, claimantStatus, agentType]);

  return formLayout;
};

const handleKeyDown = (
  index: number,
  e: KeyboardEvent<HTMLInputElement>,
  otp: string[]
): void => {
  if (e.key === "Backspace" && !otp[index] && index > 0) {
    const prev = document.getElementById(
      `otp-input-${index - 1}`
    ) as HTMLInputElement;
    prev?.focus();
  }
};

export const useClaimantFormLayout = () => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language.toUpperCase();

  return {
    getNationalityLookup: () => ({
      url: `/WeddiServices/V1/MainLookUp`,
      params: {
        LookupType: "DataElements",
        ModuleKey: "MNT1",
        ModuleName: "Nationality",
        AcceptedLanguage: currentLanguage,
        SourceSystem: "E-Services",
      },
    }),
  };
};
