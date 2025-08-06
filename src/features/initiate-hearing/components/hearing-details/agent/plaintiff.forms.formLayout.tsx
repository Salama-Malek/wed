import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useFormContext, Controller } from "react-hook-form";
import { SectionLayout } from "@/shared/components/form/form.types";
import { useAgentFormOptions } from "./plaintiff.forms.formOptions";
import { useGetNICDetailsQuery } from "@/features/initiate-hearing/api/create-case/plaintiffDetailsApis";
import { formatDateToYYYYMMDD } from "@/shared/utils/dateUtils";
import { DigitOnlyInput } from '@/shared/components/form/InputField';
import { toWesternDigits, isHijriDateInFuture } from '@/shared/lib/helpers';

/**
 * Builds dynamic form sections for PlaintiffDetails,
 * branching on Self vs Agent and Local vs External agency.
 */
export const usePlaintiffFormLayout = (): SectionLayout[] => {
  const { t, i18n } = useTranslation("hearingdetails");
  const lang = i18n.language === "ar" ? "AR" : "EN";
  const { watch, register, control, trigger, setValue } = useFormContext();

  // Watch form values
  const applicantType = watch("applicantType");        // "Self(Worker)" | "Agent"
  const agencyType = watch("certifiedAgency");         // "localAgency" | "externalAgency"
  const agentId = watch("agentId");                   // Agent's own ID
  const mandateNumber = watch("agentMandateNumber");  // Mandate number
  const plaintiffId = watch("plaintiffId");
  const plaintiffHijriDOB = watch("plaintiffHijriDOB");
  const useIntlPhone = watch("plaintiffUseIntlPhone");

  // Dynamic options and agent info
  const {
    applicantTypeOptions,
    plaintiffCapacityOptions,
    RegionOptions,
    CityOptions,
    OccupationOptions,
    GenderOptions,
    NationalityOptions,
    CodeOptions,
    agentInfo,
  } = useAgentFormOptions();

  // Prevent agent ID === plaintiff ID
  register("plaintiffId", {
    validate: value =>
      value !== agentId || t("error.plaintiffSameAsAgent"),
  });

  // Local agency: ensure plaintiffId is in PartyList
  const validUnderAgency = useMemo(() => {
    if (!agentInfo?.PartyList) return true;
    return agentInfo.PartyList.some(p => p.ID === plaintiffId);
  }, [agentInfo, plaintiffId]);

  // NIC lookup for plaintiff
  const { data: nicData, isSuccess: isNicSuccess } = useGetNICDetailsQuery(
    {
      IDNumber: plaintiffId,
      DateOfBirth: toWesternDigits(formatDateToYYYYMMDD(plaintiffHijriDOB) || ""),
      AcceptedLanguage: lang,
      SourceSystem: "E-Services",
    },
    { skip: !plaintiffId || !plaintiffHijriDOB || isHijriDateInFuture(formatDateToYYYYMMDD(plaintiffHijriDOB) || "") }
  );

  // Agent flow
  if (applicantType === "Agent") {
    const agentFields = [
      { name: "agentId", label: t("agentId"), type: "text", readonly: true },
      {
        name: "agentName",
        label: t("agentName"),
        type: "text",
        defaultValue: agentInfo?.Agent.AgentName || "",
        readonly: !!agentInfo?.Agent.AgentName,
      },
      {
        name: "agentMandateNumber",
        label: t("mandateNumber"),
        type: "text",
        defaultValue: mandateNumber,
      },
      {
        name: "agentMandateStatus",
        label: t("mandateStatus"),
        type: "text",
        defaultValue: agentInfo?.Agent.MandateStatus || "",
        readonly: !!agentInfo?.Agent.MandateStatus,
      },
      {
        name: "agentMandateSource",
        label: t("mandateSource"),
        type: "text",
        defaultValue: agentInfo?.Agent.MandateSource || "",
        readonly: !!agentInfo?.Agent.MandateSource,
      },
      { name: "agentResidence", label: t("residenceAddress"), type: "text" },
      { name: "agentWorkplace", label: t("workplace"), type: "text" },
    ];

    // Local agency branch
    if (agencyType === "localAgency") {
      return [
        {
          title: t("applicantType"),
          className: "applicant-type-section",
          gridCols: 3,
          children: [
            { 
              type: "radio" as const,
              name: "applicantType", 
              label: t("applicantType"), 
              options: applicantTypeOptions,
              value: watch("applicantType"),
              onChange: (value: string) => setValue("applicantType", value)
            },
            { 
              type: "radio" as const,
              name: "certifiedAgency", 
              label: t("certifiedByAgency"), 
              options: applicantTypeOptions, // This will need to be updated based on new logic
              value: watch("certifiedAgency"),
              onChange: (value: string) => setValue("certifiedAgency", value),
              validation: { required: t("certifiedByAgencyValidation") },
            },
          ],
        },
        { 
          title: t("agentInformation"),
          className: "agent-information-section",
          gridCols: 3,
          children: agentFields.map(field => ({
            type: "input" as const,
            name: field.name,
            label: field.label,
            inputType: "text",
            value: watch(field.name),
            onChange: (value: string) => setValue(field.name, value),
            readonly: field.readonly,
            defaultValue: field.defaultValue
          }))
        },
        {
          title: t("plaintiffUnderAgency"),
          className: "plaintiff-under-agency-section",
          gridCols: 3,
          children: [
            {
              type: "input" as const,
              name: "plaintiffId",
              label: t("plaintiffId"),
              inputType: "text",
              value: watch("plaintiffId"),
              onChange: (value: string) => setValue("plaintiffId", value),
              validation: {
                validate: (value: string) => validUnderAgency || t("error.idNotUnderAgency")
              }
            },
            {
              type: "dateOfBirth" as const,
              hijriLabel: t("plaintiffHijriDOB"),
              gregorianLabel: t("plaintiffGregorianDOB"),
              name: "plaintiffHijriDOB",
              value: watch("plaintiffHijriDOB"),
              condition: validUnderAgency
            },
            ...(isNicSuccess && nicData
              ? [
                  {
                    type: "input" as const,
                    name: "plaintiffName",
                    label: t("name"),
                    inputType: "text",
                    value: nicData?.NICDetails?.PlaintiffName || "",
                    onChange: (value: string) => setValue("plaintiffName", value)
                  },
                  {
                    type: "autocomplete" as const,
                    name: "plaintiffRegion",
                    label: t("region"),
                    options: RegionOptions,
                    value: nicData?.NICDetails?.Region ? nicData.NICDetails.Region : watch("plaintiffRegion"),
                    onChange: (value: any) => setValue("plaintiffRegion", value)
                  },
                  {
                    type: "autocomplete" as const,
                    name: "plaintiffCity",
                    label: t("city"),
                    options: CityOptions,
                    value: nicData?.NICDetails?.City ? nicData.NICDetails.City : watch("plaintiffCity"),
                    onChange: (value: any) => setValue("plaintiffCity", value)
                  },
                  {
                    type: "autocomplete" as const,
                    name: "plaintiffOccupation",
                    label: t("occupation"),
                    options: OccupationOptions,
                    value: nicData?.NICDetails?.Occupation ? nicData.NICDetails.Occupation : watch("plaintiffOccupation"),
                    onChange: (value: any) => setValue("plaintiffOccupation", value)
                  },
                  {
                    type: "autocomplete" as const,
                    name: "plaintiffGender",
                    label: t("gender"),
                    options: GenderOptions,
                    value: nicData?.NICDetails?.Gender ? nicData.NICDetails.Gender : watch("plaintiffGender"),
                    onChange: (value: any) => setValue("plaintiffGender", value)
                  },
                  {
                    type: "autocomplete" as const,
                    name: "plaintiffNationality",
                    label: t("nationality"),
                    options: NationalityOptions,
                    value: nicData?.NICDetails?.Nationality ? nicData.NICDetails.Nationality : watch("plaintiffNationality"),
                    onChange: (value: any) => setValue("plaintiffNationality", value)
                  }
                ]
              : [
                  {
                    type: "input" as const,
                    name: "plaintiffName",
                    label: t("name"),
                    inputType: "text",
                    value: watch("plaintiffName"),
                    onChange: (value: string) => setValue("plaintiffName", value)
                  },
                  {
                    type: "autocomplete" as const,
                    name: "plaintiffRegion",
                    label: t("region"),
                    options: RegionOptions,
                    value: watch("plaintiffRegion"),
                    onChange: (value: any) => setValue("plaintiffRegion", value)
                  },
                  {
                    type: "autocomplete" as const,
                    name: "plaintiffCity",
                    label: t("city"),
                    options: CityOptions,
                    value: watch("plaintiffCity"),
                    onChange: (value: any) => setValue("plaintiffCity", value)
                  },
                  {
                    type: "autocomplete" as const,
                    name: "plaintiffOccupation",
                    label: t("occupation"),
                    options: OccupationOptions,
                    value: watch("plaintiffOccupation"),
                    onChange: (value: any) => setValue("plaintiffOccupation", value)
                  },
                  {
                    type: "autocomplete" as const,
                    name: "plaintiffGender",
                    label: t("gender"),
                    options: GenderOptions,
                    value: watch("plaintiffGender"),
                    onChange: (value: any) => setValue("plaintiffGender", value)
                  },
                  {
                    type: "autocomplete" as const,
                    name: "plaintiffNationality",
                    label: t("nationality"),
                    options: NationalityOptions,
                    value: watch("plaintiffNationality"),
                    onChange: (value: any) => setValue("plaintiffNationality", value)
                  }
                ]),
            {
              type: "checkbox" as const,
              name: "plaintiffUseIntlPhone",
              label: t("addIntlNumber"),
              checked: !!watch("plaintiffUseIntlPhone"),
              onChange: (value: boolean) => setValue("plaintiffUseIntlPhone", value)
            },
            ...(useIntlPhone
              ? [
                  {
                    type: "autocomplete" as const,
                    name: "plaintiffCountryCode",
                    label: t("countryCode"),
                    options: CodeOptions,
                    value: watch("plaintiffCountryCode"),
                    onChange: (value: any) => setValue("plaintiffCountryCode", value)
                  },
                  {
                    type: "input" as const,
                    name: "plaintiffMobileIntl",
                    label: t("mobileNumber"),
                    inputType: "text",
                    value: watch("plaintiffMobileIntl"),
                    onChange: (value: string) => setValue("plaintiffMobileIntl", value)
                  },
                  {
                    type: "input" as const,
                    name: "plaintiffOtp",
                    label: t("otp"),
                    inputType: "text",
                    value: watch("plaintiffOtp"),
                    onChange: (value: string) => setValue("plaintiffOtp", value)
                  }
                ]
              : []),
          ],
        },
        {
          title: t("plaintiffDetails"),
          className: "plaintiff-details-section",
          gridCols: 3,
          children: [
            {
              type: "readonly" as const,
              label: t("plaintiffName"),
              value: nicData?.NICDetails?.PlaintiffName || ""
            },
            {
              type: "readonly" as const,
              label: t("plaintiffOccupation"),
              value: nicData?.NICDetails?.Occupation || ""
            },
            {
              type: "readonly" as const,
              label: t("plaintiffNationality"),
              value: nicData?.NICDetails?.Nationality || ""
            }
          ]
        },
        {
          title: t("plaintiffAddress"),
          className: "plaintiff-address-section",
          gridCols: 3,
          children: [
            {
              type: "readonly" as const,
              label: t("plaintiffRegion"),
              value: nicData?.NICDetails?.Region || ""
            },
            {
              type: "readonly" as const,
              label: t("plaintiffCity"),
              value: nicData?.NICDetails?.City || ""
            }
          ]
        }
      ];
    }

    // External agency branch
    return [
      {
        title: t("applicantType"),
        className: "applicant-type-section",
        gridCols: 3,
        children: [
          {
            type: "radio" as const,
            name: "applicantType",
            label: t("applicantType"),
            options: applicantTypeOptions,
            value: watch("applicantType"),
            onChange: (value: string) => setValue("applicantType", value)
          }
        ]
      },
      {
        title: t("agentInformation"),
        className: "agent-information-section",
        gridCols: 3,
        children: [
          ...agentFields.map(field => ({
            type: "input" as const,
            name: field.name,
            label: field.label,
            inputType: "text",
            value: watch(field.name),
            onChange: (value: string) => setValue(field.name, value)
          })),
          ...(
            agentInfo &&
            typeof agentInfo.Agent === 'object' &&
            agentInfo.Agent !== null &&
            typeof (agentInfo.Agent as any).Occupation === 'string' &&
            (agentInfo.Agent as any).Occupation
              ? [{
                  type: "autocomplete" as const,
                  name: "agentOccupation",
                  label: t("occupation"),
                  options: OccupationOptions,
                  value: (agentInfo.Agent as any).Occupation,
                  onChange: (value: any) => setValue("agentOccupation", value)
                }]
              : []
          )
        ]
      },
      {
        title: t("plaintiffInformation"),
        className: "plaintiff-information-section",
        gridCols: 3,
        children: [
          {
            type: "input" as const,
            name: "plaintiffId",
            label: t("plaintiffId"),
            inputType: "text",
            value: watch("plaintiffId"),
            onChange: (value: string) => setValue("plaintiffId", value)
          },
          {
            type: "dateOfBirth" as const,
            hijriLabel: t("plaintiffHijriDOB"),
            gregorianLabel: t("plaintiffGregorianDOB"),
            name: "plaintiffHijriDOB",
            value: watch("plaintiffHijriDOB")
          },
          ...(isNicSuccess && nicData
            ? [
                {
                  type: "input" as const,
                  name: "plaintiffName",
                  label: t("name"),
                  inputType: "text",
                  value: nicData?.NICDetails?.PlaintiffName || "",
                  onChange: (value: string) => setValue("plaintiffName", value)
                },
                {
                  type: "autocomplete" as const,
                  name: "plaintiffRegion",
                  label: t("region"),
                  options: RegionOptions,
                  value: nicData?.NICDetails?.Region ? nicData.NICDetails.Region : watch("plaintiffRegion"),
                  onChange: (value: any) => setValue("plaintiffRegion", value)
                },
                {
                  type: "autocomplete" as const,
                  name: "plaintiffCity",
                  label: t("city"),
                  options: CityOptions,
                  value: nicData?.NICDetails?.City ? nicData.NICDetails.City : watch("plaintiffCity"),
                  onChange: (value: any) => setValue("plaintiffCity", value)
                },
                {
                  type: "autocomplete" as const,
                  name: "plaintiffOccupation",
                  label: t("occupation"),
                  options: OccupationOptions,
                  value: nicData?.NICDetails?.Occupation ? nicData.NICDetails.Occupation : watch("plaintiffOccupation"),
                  onChange: (value: any) => setValue("plaintiffOccupation", value)
                },
                {
                  type: "autocomplete" as const,
                  name: "plaintiffGender",
                  label: t("gender"),
                  options: GenderOptions,
                  value: nicData?.NICDetails?.Gender ? nicData.NICDetails.Gender : watch("plaintiffGender"),
                  onChange: (value: any) => setValue("plaintiffGender", value)
                },
                {
                  type: "autocomplete" as const,
                  name: "plaintiffNationality",
                  label: t("nationality"),
                  options: NationalityOptions,
                  value: nicData?.NICDetails?.Nationality ? nicData.NICDetails.Nationality : watch("plaintiffNationality"),
                  onChange: (value: any) => setValue("plaintiffNationality", value)
                }
              ]
            : [
                {
                  type: "input" as const,
                  name: "plaintiffName",
                  label: t("name"),
                  inputType: "text",
                  value: watch("plaintiffName"),
                  onChange: (value: string) => setValue("plaintiffName", value)
                },
                {
                  type: "autocomplete" as const,
                  name: "plaintiffRegion",
                  label: t("region"),
                  options: RegionOptions,
                  value: watch("plaintiffRegion"),
                  onChange: (value: any) => setValue("plaintiffRegion", value)
                },
                {
                  type: "autocomplete" as const,
                  name: "plaintiffCity",
                  label: t("city"),
                  options: CityOptions,
                  value: watch("plaintiffCity"),
                  onChange: (value: any) => setValue("plaintiffCity", value)
                },
                {
                  type: "autocomplete" as const,
                  name: "plaintiffOccupation",
                  label: t("occupation"),
                  options: OccupationOptions,
                  value: watch("plaintiffOccupation"),
                  onChange: (value: any) => setValue("plaintiffOccupation", value)
                },
                {
                  type: "autocomplete" as const,
                  name: "plaintiffGender",
                  label: t("gender"),
                  options: GenderOptions,
                  value: watch("plaintiffGender"),
                  onChange: (value: any) => setValue("plaintiffGender", value)
                },
                {
                  type: "autocomplete" as const,
                  name: "plaintiffNationality",
                  label: t("nationality"),
                  options: NationalityOptions,
                  value: watch("plaintiffNationality"),
                  onChange: (value: any) => setValue("plaintiffNationality", value)
                }
              ]),
          {
            type: "checkbox" as const,
            name: "plaintiffUseIntlPhone",
            label: t("addIntlNumber"),
            checked: !!watch("plaintiffUseIntlPhone"),
            onChange: (value: boolean) => setValue("plaintiffUseIntlPhone", value)
          },
          ...(useIntlPhone
            ? [
                {
                  type: "autocomplete" as const,
                  name: "plaintiffCountryCode",
                  label: t("countryCode"),
                  options: CodeOptions,
                  value: watch("plaintiffCountryCode"),
                  onChange: (value: any) => setValue("plaintiffCountryCode", value)
                },
                {
                  type: "input" as const,
                  name: "plaintiffMobileIntl",
                  label: t("mobileNumber"),
                  inputType: "text",
                  value: watch("plaintiffMobileIntl"),
                  onChange: (value: string) => setValue("plaintiffMobileIntl", value)
                },
                {
                  type: "input" as const,
                  name: "plaintiffOtp",
                  label: t("otp"),
                  inputType: "text",
                  value: watch("plaintiffOtp"),
                  onChange: (value: string) => setValue("plaintiffOtp", value)
                }
              ]
            : [])
        ]
      },
    ];
  }

  // Self(Worker) branch
  return [
    {
      title: t("applicantType"),
      className: "applicant-type-section",
      gridCols: 3,
      children: [
        {
          type: "radio" as const,
          name: "applicantType",
          label: t("applicantType"),
          options: applicantTypeOptions,
          value: watch("applicantType"),
          onChange: (value: string) => setValue("applicantType", value)
        }
      ]
    },
    {
      title: t("plaintiffDetails"),
      className: "plaintiff-details-section",
      gridCols: 3,
      children: [
        {
          type: "input" as const,
          name: "plaintiffId",
          label: t("plaintiffId"),
          inputType: "text",
          value: watch("plaintiffId"),
          onChange: (value: string) => setValue("plaintiffId", value)
        },
        {
          type: "dateOfBirth" as const,
          hijriLabel: t("plaintiffHijriDOB"),
          gregorianLabel: t("plaintiffGregorianDOB"),
          name: "plaintiffHijriDOB",
          value: watch("plaintiffHijriDOB")
        }
      ]
    },
    {
      title: t("plaintiffDetails"),
      className: "plaintiff-details-section",
      gridCols: 3,
      children: [
        {
          type: "input" as const,
          name: "plaintiffName",
          label: t("name"),
          inputType: "text",
          value: watch("plaintiffName"),
          onChange: (value: string) => setValue("plaintiffName", value)
        },
        {
          type: "input" as const,
          name: "plaintiffOccupation",
          label: t("occupation"),
          inputType: "text",
          value: watch("plaintiffOccupation"),
          onChange: (value: string) => setValue("plaintiffOccupation", value)
        },
        {
          type: "input" as const,
          name: "plaintiffNationality",
          label: t("nationality"),
          inputType: "text",
          value: watch("plaintiffNationality"),
          onChange: (value: string) => setValue("plaintiffNationality", value)
        }
      ]
    },
    {
      title: t("plaintiffAddress"),
      className: "plaintiff-address-section",
      gridCols: 3,
      children: [
        {
          type: "input" as const,
          name: "plaintiffRegion",
          label: t("region"),
          inputType: "text",
          value: watch("plaintiffRegion"),
          onChange: (value: string) => setValue("plaintiffRegion", value)
        },
        {
          type: "input" as const,
          name: "plaintiffCity",
          label: t("city"),
          inputType: "text",
          value: watch("plaintiffCity"),
          onChange: (value: string) => setValue("plaintiffCity", value)
        }
      ]
    }
  ];
};
