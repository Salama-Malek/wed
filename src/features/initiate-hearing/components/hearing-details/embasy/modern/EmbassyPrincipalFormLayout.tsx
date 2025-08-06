import { useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { TokenClaims } from "@/features/login/components/AuthProvider";
import { SectionLayout } from "@/shared/components/form/form.types";
import { formatDateString } from "@/shared/lib/helpers";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";

interface EmbassyPrincipalFormProps {
  setValue: any;
  watch: any;
  RegionOptions: any;
  CityOptions: any;
  OccupationOptions: any;
  GenderOptions: any;
  NationalityOptions: any;
}

export function EmbassyPrincipalFormLayout({
  setValue,
  watch,
  RegionOptions,
  CityOptions,
  OccupationOptions,
  GenderOptions,
  NationalityOptions,
}: EmbassyPrincipalFormProps): SectionLayout[] {
  const { t } = useTranslation("hearingdetails");
  const [getCookie] = useCookieState();
  const userClaims: TokenClaims = getCookie("userClaims");
  const getNicData = getCookie("storeAllNicData");
  const idNumber = userClaims.UserID;
  const claimType = watch("claimantStatus");

  // Memoize the setValue function to prevent infinite loops
  const memoizedSetValue = useCallback(setValue, [setValue]);

  useEffect(() => {
    if (claimType === "principal" && getNicData?.NICDetails) {
      const nic = getNicData.NICDetails;
      if (nic?.PlaintiffName) memoizedSetValue("userName", nic.PlaintiffName);
      if (nic?.Region_Code) memoizedSetValue("region", { value: nic.Region_Code, label: nic.Region });
      if (nic?.City_Code) memoizedSetValue("city", { value: nic.City_Code, label: nic.City });
      if (nic?.Occupation_Code) memoizedSetValue("occupation", { value: nic.Occupation_Code, label: nic.Occupation });
      if (nic?.Gender_Code) memoizedSetValue("gender", { value: nic.Gender_Code, label: nic.Gender });
      if (nic?.Nationality_Code) memoizedSetValue("nationality", { value: nic.Nationality_Code, label: nic.Nationality });
      if (nic?.DateOfBirthHijri) memoizedSetValue("hijriDate", nic.DateOfBirthHijri);
      if (nic?.DateOfBirthGregorian) memoizedSetValue("gregorianDate", nic.DateOfBirthGregorian);
      if (nic?.Applicant) memoizedSetValue("applicant", nic.Applicant);
      if (nic?.PhoneNumber) memoizedSetValue("phoneNumber", nic.PhoneNumber.toString());
    }
  }, [claimType, getNicData, memoizedSetValue]);

  return [
    {
      title: t("nicDetails.plaintiffData"),
      className: "personal-info-section",
      gridCols: 3,
      children: [
        { type: "readonly" as const, label: t("nicDetails.idNumber"), value: idNumber },
        ...(getNicData?.NICDetails?.PlaintiffName
          ? [{ type: "readonly" as const, label: t("nicDetails.name"), value: getNicData.NICDetails.PlaintiffName }]
          : [{ type: "input" as const, name: "userName", inputType: "text", label: t("nicDetails.name"), value: watch("userName"), onChange: (v: string) => setValue("userName", v), validation: { required: t("nameValidation") } }]),
        ...(getNicData?.NICDetails?.Region
          ? [{ type: "readonly" as const, label: t("nicDetails.region"), value: getNicData.NICDetails.Region }]
          : [{ type: "autocomplete" as const, name: "region", label: t("nicDetails.region"), options: RegionOptions, value: watch("region"), onChange: (v: string) => {
  setValue("region", v);
  setValue("city", null);
}, validation: { required: t("regionValidation") } }]),
        ...(getNicData?.NICDetails?.City
          ? [{ type: "readonly" as const, label: t("nicDetails.city"), value: getNicData.NICDetails.City }]
          : [{ type: "autocomplete" as const, name: "city", label: t("nicDetails.city"), options: CityOptions, value: watch("city"), onChange: (v: string) => setValue("city", v), validation: { required: t("cityValidation") } }]),
        { type: "readonly" as const, label: t("nicDetails.dobHijri"), value: formatDateString(getNicData?.NICDetails?.DateOfBirthHijri) || "" },
        { type: "readonly" as const, label: t("nicDetails.dobGrog"), value: formatDateString(getNicData?.NICDetails?.DateOfBirthGregorian) },
        ...(getNicData?.NICDetails?.PhoneNumber
          ? [{ type: "readonly" as const, label: t("nicDetails.phoneNumber"), value: getNicData.NICDetails.PhoneNumber }]
          : [{ type: "input" as const, name: "phoneNumber", inputType: "text", placeholder: "05xxxxxxxx", label: t("nicDetails.phoneNumber"), value: watch("phoneNumber"), onChange: (v: string) => setValue("phoneNumber", v), validation: { required: t("phoneNumberValidation"), pattern: { value: /^05\d{8}$/, message: t("phoneValidationMessage") } } }]),
        ...(getNicData?.NICDetails?.Occupation
          ? [{ type: "readonly" as const, label: t("nicDetails.occupation"), value: getNicData.NICDetails.Occupation }]
          : [{ type: "autocomplete" as const, name: "occupation", label: t("nicDetails.occupation"), options: OccupationOptions, value: watch("occupation"), onChange: (v: string) => setValue("occupation", v), validation: { required: t("occupationValidation") } }]),
        ...(getNicData?.NICDetails?.Gender
          ? [{ type: "readonly" as const, label: t("nicDetails.gender"), value: getNicData.NICDetails.Gender }]
          : [{ type: "autocomplete" as const, name: "gender", label: t("nicDetails.gender"), options: GenderOptions, value: watch("gender"), onChange: (v: string) => setValue("gender", v), validation: { required: t("genderValidation") } }]),
        ...(getNicData?.NICDetails?.Nationality
          ? [{ type: "readonly" as const, label: t("nicDetails.nationality"), value: getNicData.NICDetails.Nationality }]
          : [{ type: "autocomplete" as const, name: "nationality", label: t("nicDetails.nationality"), options: NationalityOptions, value: watch("nationality"), onChange: (v: string) => setValue("nationality", v), validation: { required: t("nationalityValidation") } }]),
      ],
    },
  ];
} 