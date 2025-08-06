import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useFormOptions } from "../../tabs/claimant/claimant.forms.formOptions";
import { SectionLayout } from "@/shared/components/form/form.types";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import { TokenClaims } from "@/features/login/components/AuthProvider";
import OTPFormLayout from "../../tabs/claimant/OTP.froms.formlayout";
import { EmbassyAgentFormLayout } from "./EmbassyAgentFormLayout";
// EmbassyClaimantFormProps is defined locally in this file
import { useGetNICDetailsQuery } from "@/features/initiate-hearing/api/create-case/plaintiffDetailsApis";
import { formatDateToYYYYMMDD } from "@/shared/lib/helpers";
import { HijriDatePickerInput } from "@/shared/components/calanders/HijriDatePickerInput";
import { GregorianDateDisplayInput } from "@/shared/components/calanders/GregorianDateDisplayInput";
import gregorianCalendar from "react-date-object/calendars/gregorian";
import gregorianLocaleEn from "react-date-object/locales/gregorian_en";

interface EmbassyClaimantFormProps {
  control: any;
  setValue: any;
  watch: any;
  RegionOptions: any;
  CityOptions: any;
  OccupationOptions: any;
  GenderOptions: any;
  NationalityOptions: any;
  setError: (name: string, error: any) => void;
  clearErrors: (name: string) => void;
  isVerified: boolean;
}

export function EmbassyClaimantFormLayout({
  control,
  setValue,
  watch,
  RegionOptions,
  CityOptions,
  OccupationOptions,
  GenderOptions,
  NationalityOptions,
  setError,
  clearErrors,
  isVerified,
}: EmbassyClaimantFormProps): SectionLayout[] {
  const { ClaimantStatusRadioOptions } = useFormOptions();
  const { t } = useTranslation("hearingdetails");
  const claimType = watch("claimantStatus");

  // Memoize the setValue function to prevent infinite loops
  const memoizedSetValue = useCallback(setValue, [setValue]);

  useEffect(() => {
    // Clear form fields when switching claim type
    [
      "userName",
      "hijriDate",
      "gregorianDate",
      "applicant",
      "phoneNumber",
    ].forEach((f) => memoizedSetValue(f, ""));
    memoizedSetValue("region", null);
    memoizedSetValue("city", null);
    memoizedSetValue("occupation", null);
    memoizedSetValue("gender", null);
    memoizedSetValue("nationality", null);
  }, [claimType, memoizedSetValue]);

  // Get user data from cookies
  const [getCookie] = useCookieState();
  const userClaims: TokenClaims = getCookie("userClaims");
  const getNicData = getCookie("storeAllNicData");
  const idNumber = userClaims?.UserID;

  // Create principal layout using the same logic as main component
  const createPrincipalLayout = (): SectionLayout[] => {
    const sections: SectionLayout[] = [];

    if (claimType === "principal") {
      const nic = principalNicData?.NICDetails;

      sections.push({
        title: t("nicDetails.plaintiffData"),
        className: "nic-details-section",
        gridCols: 3,
        children: [
          // ID Number (readonly)
          {
            type: "readonly" as const,
            label: t("nicDetails.idNumber"),
            value: idNumber || "",
          },

          // Name field - readonly if from NIC, input if not
          ...(nic?.PlaintiffName
            ? [
                {
                  type: "readonly" as const,
                  label: t("nicDetails.name"),
                  value: nic.PlaintiffName,
                },
              ]
            : [
                {
                  type: "input" as const,
                  name: "embassyPrincipal_userName",
                  label: t("nicDetails.name"),
                  value: watch("embassyPrincipal_userName") || "",
                  onChange: (value: string) =>
                    setValue("embassyPrincipal_userName", value),
                  inputType: "text",
                  validation: { required: t("nameValidation") },
                },
              ]),

          // Region field - readonly if from NIC, autocomplete if not
          ...(nic?.Region
            ? [
                {
                  type: "readonly" as const,
                  label: t("nicDetails.region"),
                  value: nic.Region,
                },
              ]
            : [
                {
                  type: "autocomplete" as const,
                  name: "embassyPrincipal_region",
                  label: t("nicDetails.region"),
                  value: watch("embassyPrincipal_region"),
                  options: RegionOptions,
                  onChange: (value: any) => {
                    setValue("embassyPrincipal_region", value);
                    setValue("embassyPrincipal_city", null);
                  },
                  validation: {
                    required: true,
                    validate: (value: any) => {
                      if (
                        !value ||
                        (typeof value === "object" && !value.value)
                      ) {
                        return t("regionValidation");
                      }
                      return true;
                    },
                  },
                },
              ]),

          // City field - readonly if from NIC, autocomplete if not
          ...(nic?.City
            ? [
                {
                  type: "readonly" as const,
                  label: t("nicDetails.city"),
                  value: nic.City,
                },
              ]
            : [
                {
                  type: "autocomplete" as const,
                  name: "embassyPrincipal_city",
                  label: t("nicDetails.city"),
                  value: watch("embassyPrincipal_city"),
                  options: CityOptions,
                  onChange: (value: any) =>
                    setValue("embassyPrincipal_city", value),
                  validation: {
                    required: true,
                    validate: (value: any) => {
                      if (
                        !value ||
                        (typeof value === "object" && !value.value)
                      ) {
                        return t("cityValidation");
                      }
                      return true;
                    },
                  },
                },
              ]),

          // Date of Birth (Hijri) - readonly if from NIC, custom date picker if not
          ...(nic?.DateOfBirthHijri
            ? [
                {
                  type: "readonly" as const,
                  label: t("nicDetails.dobHijri"),
                  value: nic.DateOfBirthHijri,
                },
              ]
            : [
                {
                  type: "custom" as const,
                  name: "embassyPrincipal_dateOfBirth",
                  component: (
                    <div className="flex flex-col gap-2">
                      <HijriDatePickerInput
                        control={control}
                        name={"embassyPrincipal_hijriDate" as any}
                        label={t("nicDetails.dobHijri")}
                        rules={{ required: t("dateValidation") }}
                        notRequired={false}
                        isDateOfBirth={true}
                        onChangeHandler={(
                          date: any,
                          onChange: (value: string) => void
                        ) => {
                          if (date && !Array.isArray(date)) {
                            const gregorianDate = date.convert(
                              gregorianCalendar,
                              gregorianLocaleEn
                            );
                            const gregorian = gregorianDate.format("YYYYMMDD");
                            setValue(
                              "embassyPrincipal_gregorianDate",
                              gregorian
                            );
                          }
                        }}
                      />
                      <GregorianDateDisplayInput
                        control={control}
                        name={"embassyPrincipal_gregorianDate" as any}
                        label={t("nicDetails.dobGrog")}
                      />
                    </div>
                  ),
                },
              ]),

          // Phone Number field - readonly if from NIC, input if not
          ...(nic?.PhoneNumber
            ? [
                {
                  type: "readonly" as const,
                  label: t("nicDetails.phoneNumber"),
                  value: nic.PhoneNumber,
                },
              ]
            : [
                {
                  type: "input" as const,
                  name: "embassyPrincipal_phoneNumber",
                  label: t("nicDetails.phoneNumber"),
                  value: watch("embassyPrincipal_phoneNumber") || "",
                  onChange: (value: string) =>
                    setValue("embassyPrincipal_phoneNumber", value),
                  inputType: "text",
                  placeholder: "05xxxxxxxx",
                  validation: {
                    required: t("phoneNumberValidation"),
                    pattern: {
                      value: /^05\d{8}$/,
                      message: t("phoneValidationMessage"),
                    },
                  },
                },
              ]),

          // Occupation field - readonly if from NIC, autocomplete if not
          ...(nic?.Occupation
            ? [
                {
                  type: "readonly" as const,
                  label: t("nicDetails.occupation"),
                  value: nic.Occupation,
                },
              ]
            : [
                {
                  type: "autocomplete" as const,
                  name: "embassyPrincipal_occupation",
                  label: t("nicDetails.occupation"),
                  value: watch("embassyPrincipal_occupation"),
                  options: OccupationOptions,
                  onChange: (value: any) =>
                    setValue("embassyPrincipal_occupation", value),
                  validation: {
                    required: true,
                    validate: (value: any) => {
                      if (
                        !value ||
                        (typeof value === "object" && !value.value)
                      ) {
                        return t("occupationValidation");
                      }
                      return true;
                    },
                  },
                },
              ]),

          // Gender field - readonly if from NIC, autocomplete if not
          ...(nic?.Gender
            ? [
                {
                  type: "readonly" as const,
                  label: t("nicDetails.gender"),
                  value: nic.Gender,
                },
              ]
            : [
                {
                  type: "autocomplete" as const,
                  name: "embassyPrincipal_gender",
                  label: t("nicDetails.gender"),
                  value: watch("embassyPrincipal_gender"),
                  options: GenderOptions,
                  onChange: (value: any) =>
                    setValue("embassyPrincipal_gender", value),
                  validation: {
                    required: true,
                    validate: (value: any) => {
                      if (
                        !value ||
                        (typeof value === "object" && !value.value)
                      ) {
                        return t("genderValidation");
                      }
                      return true;
                    },
                  },
                },
              ]),

          // Nationality field - readonly if from NIC, autocomplete if not
          ...(nic?.Nationality
            ? [
                {
                  type: "readonly" as const,
                  label: t("nicDetails.nationality"),
                  value: nic.Nationality,
                },
              ]
            : [
                {
                  type: "autocomplete" as const,
                  name: "embassyPrincipal_nationality",
                  label: t("nicDetails.nationality"),
                  value: watch("embassyPrincipal_nationality"),
                  options: NationalityOptions,
                  onChange: (value: any) =>
                    setValue("embassyPrincipal_nationality", value),
                  validation: {
                    required: true,
                    validate: (value: any) => {
                      if (
                        !value ||
                        (typeof value === "object" && !value.value)
                      ) {
                        return t("nationalityValidation");
                      }
                      return true;
                    },
                  },
                },
              ]),
        ].flat(),
      });
    }

    return sections;
  };

  // Get NIC data for principal
  const principalId = userClaims?.UserID || "";
  const principalDob = formatDateToYYYYMMDD(userClaims?.UserDOB);
  const { data: principalNicData } = useGetNICDetailsQuery(
    {
      IDNumber: principalId,
      DateOfBirth: principalDob || "",
      AcceptedLanguage: "EN",
      SourceSystem: "E-Services",
    },
    {
      skip: claimType !== "principal" || !principalId || !principalDob,
    }
  );

  // Set form values when NIC data is available for principal
  useEffect(() => {
    if (claimType === "principal" && principalNicData?.NICDetails) {
      const nic = principalNicData.NICDetails;

      // Set form values from NIC data
      if (nic.PlaintiffName) {
        setValue("embassyPrincipal_userName", nic.PlaintiffName);
      }
      if (nic.Region && nic.Region_Code) {
        setValue("embassyPrincipal_region", {
          value: nic.Region_Code,
          label: nic.Region,
        });
      }
      if (nic.City && nic.City_Code) {
        setValue("embassyPrincipal_city", {
          value: nic.City_Code,
          label: nic.City,
        });
      }
      if (nic.DateOfBirthHijri) {
        setValue("embassyPrincipal_hijriDate", nic.DateOfBirthHijri);
      }
      if (nic.DateOfBirthGregorian) {
        setValue("embassyPrincipal_gregorianDate", nic.DateOfBirthGregorian);
      }
      if (nic.PhoneNumber) {
        setValue("embassyPrincipal_phoneNumber", nic.PhoneNumber);
      }
      if (nic.Occupation && nic.Occupation_Code) {
        setValue("embassyPrincipal_occupation", {
          value: nic.Occupation_Code,
          label: nic.Occupation,
        });
      }
      if (nic.Gender && nic.Gender_Code) {
        setValue("embassyPrincipal_gender", {
          value: nic.Gender_Code,
          label: nic.Gender,
        });
      }
      if (nic.Nationality && nic.Nationality_Code) {
        setValue("embassyPrincipal_nationality", {
          value: nic.Nationality_Code,
          label: nic.Nationality,
        });
      }
    }
  }, [claimType, principalNicData, setValue]);

  const agentLayout = EmbassyAgentFormLayout({
    control,
    setValue,
    watch,
    RegionOptions,
    CityOptions,
    OccupationOptions,
    GenderOptions,
    NationalityOptions,
    setError,
    clearErrors,
  });

  const otpSection = OTPFormLayout({
    watch,
    setValue,
    isVerify: isVerified,
  });

  const formSections = useMemo(() => {
    if (claimType === "representative") {
      return [...agentLayout, ...otpSection];
    } else if (claimType === "principal") {
      return [...createPrincipalLayout(), ...otpSection];
    } else {
      return [];
    }
  }, [claimType, agentLayout, otpSection, createPrincipalLayout]);

  return [
    {
      isRadio: true,
      className: "claimant-status-section",
      gridCols: 1,
      children: [
        {
          type: "radio",
          name: "claimantStatus",
          label: t("claimantStatus"),
          options: ClaimantStatusRadioOptions,
          value: claimType,
          onChange: (value: string) => {
            setValue("claimantStatus", value);
          },
          validation: { required: t("claimantStatusValidation") },
        },
      ],
    },
    ...formSections,
  ];
}
