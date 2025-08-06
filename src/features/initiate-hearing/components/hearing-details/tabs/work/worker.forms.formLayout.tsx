import { UseFormSetValue, UseFormWatch, Control, UseFormTrigger } from "react-hook-form";
import { useTranslation } from "react-i18next";

import {
  Option,
  SectionLayout,
  FormData,
} from "@/shared/components/form/form.types";
import React, { useEffect } from "react";
import { options } from "@/features/initiate-hearing/config/Options";
import { formatDateGMT, formatHijriDate } from "@/shared/lib/helpers";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import { placeholderCSS } from "react-select/dist/declarations/src/components/Placeholder";
import { DateOfBirthField } from "@/shared/components/calanders";
import { useFormResetContext } from '@/providers/FormResetProvider';

export const useFormLayout = (
  setValue: UseFormSetValue<FormData>,
  control: Control<FormData>,
  watch: UseFormWatch<FormData>,
  // trigger: UseFormTrigger<FormData>,
  salaryTypeData: any,
  contractTypeData: any,
  ExtractEstbAData: any,
  regionData: any,
  cityData: any,
  laborOfficeData?: any,
  selectedWorkerCity?: any,
  isRegionLoading?: boolean,
  isCityLoading?: boolean,
  isLaborLoading?: boolean,
  DefendantType?: any
): SectionLayout[] => {
  const { resetField } = useFormResetContext();
  const [getCookie, setCookie] = useCookieState({ caseId: "" });
  const isStillEmployed: any = watch("isStillEmployed" as any);
  const { t } = useTranslation("hearingdetails");
  const contractType: any = watch("contractType");

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

  const LaborOfficeTypeOptions = React.useMemo(() => {
    if (!laborOfficeData?.DataElements) return [];
    return laborOfficeData.DataElements.map((item: any) => ({
      value: item.ElementKey,
      label: item.ElementValue,
    }));
  }, [laborOfficeData]);

  const RegionOptions = React.useMemo(() => {
    if (!regionData?.DataElements) return [];
    return regionData.DataElements.map((item: any) => ({
      value: item.ElementKey,
      label: item.ElementValue,
    }));
  }, [regionData]);

  const CityOptions = React.useMemo(() => {
    if (!cityData?.DataElements) return [];
    return cityData.DataElements.map((item: any) => ({
      value: item.ElementKey,
      label: item.ElementValue,
    }));
  }, [cityData]);

  const isNonGovrnEstab =
    getCookie("defendantDetails") === "Others" &&
    (getCookie("defendantTypeInfo") === "Establishment" ||
      getCookie("defendantTypeInfo") === "Government");

  // Add watchers for dependent fields
  const contractEndDate = watch("contractExpiryDateHijri");
  const workStartDate = watch("dateofFirstworkingdayHijri");
  const workEndDate = watch("dateoflastworkingdayHijri");

  // // Trigger validation when contract end date changes
  // useEffect(() => {
  //   if (workEndDate) {
  //     trigger("dateoflastworkingdayHijri");
  //   }
  // }, [contractEndDate, trigger]);

  // // Trigger validation when work start date changes
  // useEffect(() => {
  //   if (workEndDate) {
  //     trigger("dateoflastworkingdayHijri");
  //   }
  // }, [workStartDate, trigger]);

  return [
    {
      title: t("tab3_title"),
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
        },
        {
          type: "input",
          name: "salary",
          label: t("currentSalary"),
          min: 0,
          inputType: "number",
          placeholder: "10000 SAR",
          validation: { 
            required: t("currentSalaryValidation"),
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
          // validation: {
          //   required: t("contractTypeValidation"),
          // },
        },

        {
          type: "input",
          name: "contractNumber",
          label: t("contractNumber"),
          inputType: "number",
          placeholder: "123457543",
          notRequired: true,

          validation: {
            maxLength: {
              value: 10,
              message: t("max10Validation"),
            },
            pattern: {
              value: /^\d{0,10}$/,
              message: t("max10ValidationDesc"),
            },
          },
        },

        {
          type: "custom",
          name: "contractStartDate",
          component: (
            <DateOfBirthField
              control={control}
              setValue={setValue}
              hijriFieldName="contractDateHijri"
              gregorianFieldName="contractDateGregorian"
              hijriLabel={t("contractDateHijri")}
              gregorianLabel={t("contractDateGregorian")}
            />
          ),
        },

        {
          type: "custom",
          name: "contractEndDate",
          component: (
            <DateOfBirthField
              control={control}
              setValue={setValue}
              hijriFieldName="contractExpiryDateHijri"
              gregorianFieldName="contractExpiryDateGregorian"
              hijriLabel={t("contractExpiryDateHijri")}
              gregorianLabel={t("contractExpiryDateGregorian")}
            />
          ),
        },

        ...(contractType?.value === "CT4"
          ? [
            {
              type: "input",
              name: "salaryOtherType",
              label: t("contractType"),
              inputType: "text",
              placeholder: t("otherSalaryPlaceholder"),
              validation: { required: t("contractOtherTypeValidation") },
            },
          ]
          : []),

        !!isNonGovrnEstab
          ? {
            type: "checkbox",
            name: "isStillEmployed",
            label: t("stillEmployed"),
            checked: isStillEmployed,
            onChange: (checked) =>
              setValue("isStillEmployed" as any, checked),
          }
          : {
            title: t(""),
            type: "readonly",
            label: t("stillEmployed"),
            value: ExtractEstbAData?.StillWorking === "Y" ? "YES" : "NO",
          },
        ...(ExtractEstbAData?.StillWorking === "N" || !isStillEmployed
          ? [
            !!isNonGovrnEstab
              ? {
                type: "custom",
                name: "firstWorkingDate",
                component: (
                  <DateOfBirthField
                    control={control}
                    setValue={setValue}
                    hijriFieldName="dateofFirstworkingdayHijri"
                    gregorianFieldName="dateOfFirstWorkingDayGregorian"
                    hijriLabel={t("dateofFirstworkingdayHijri")}
                    gregorianLabel={t("dateofFirstworkingdayGregorian")}
                  />
                ),
              }
              : {
                title: t(""),
                type: "readonly",
                label: t("firstWorkingDayGregorian"),
                value: formatDateGMT(ExtractEstbAData?.ServiceEndDate),
              },
            ExtractEstbAData?.StillWorking == "N" && {
              type: "custom",
              name: "lastWorkingDate",
              component: (
                <DateOfBirthField
                  control={control}
                  setValue={setValue}
                  hijriFieldName="dateoflastworkingdayHijri"
                  gregorianFieldName="dateofLastworkingdayGregorian"
                  hijriLabel={t("dateoflastworkingdayHijri")}
                  gregorianLabel={t("dateofLastworkingdayGregorian")}
                />
              ),
            },
          ]
          : []),
      ],
    },
    {
      title: t("workLocationDetails"),
      children: [
        {
          type: "autocomplete",
          name: "region",
          isLoading: isRegionLoading,
          label: t("region"),
          options: RegionOptions,
          onChange: (value: Option) => {
            setValue("region", value);
            setValue("city", null);
            setValue("laborOffice", null);
          },
          validation: { required: t("regionValidation") },
        },

        {
          type: "autocomplete",
          name: "city",
          isLoading: isCityLoading,
          label: t("city"),
          options: CityOptions,
          onChange: (value: Option) => setValue("city", value),
          validation: { required: t("cityValidation") },
        },
        {
          title: t(""),
          isLoading: isLaborLoading,
          name: "laborOffice",
          type: "readonly",
          label: t("nicDetails.nearestOffice"),
          value: laborOfficeData?.[0]?.ElementValue,
        },
      ],
    },
  ] as SectionLayout[];
};
