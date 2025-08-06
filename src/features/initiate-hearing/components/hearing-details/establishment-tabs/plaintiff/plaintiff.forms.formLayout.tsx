import { UseFormSetValue, UseFormWatch } from "react-hook-form";

import { SectionLayout, FormData } from "@/shared/components/form/form.types";

import { useTranslation } from "react-i18next";
import React, { isValidElement, useEffect } from "react";
import { options } from "@/features/initiate-hearing/config/Options";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import { useGetEstablishmentDetailsQuery } from "@/features/initiate-hearing/api/create-case/defendantDetailsApis";
import { TokenClaims } from "@/features/login/components/AuthProvider";
import { toast } from "react-toastify";

export const useEstablishmentPlaintiffFormLayout = ({
  establishmentDetails,
  apiLoadingStates,
  regionData,
  cityData,
  setValue,
  trigger,
}: any) => {
  const { i18n } = useTranslation();
  const [getCookie, setCookie] = useCookieState();
  const userClaims: TokenClaims = getCookie("userClaims");

  const { data: establishmentDetails2, isFetching: isEstablishmentLoading } =
    useGetEstablishmentDetailsQuery(
      {
        AcceptedLanguage: i18n.language === "ar" ? "AR" : "EN",
        SourceSystem: "E-Services",
        FileNumber: userClaims?.File_Number
      }, {
      skip: !userClaims?.File_Number
    }
    );



  const RegionOptions = React.useMemo(() => {
    return (
      regionData?.map((item: any) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || []
    );
  }, [regionData]);

  const CityOptions = React.useMemo(() => {
    return (
      cityData?.map((item: any) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || []
    );
  }, [cityData]);

  useEffect(() => {
    if (establishmentDetails?.EstablishmentName) {
      setValue("establishment_name", establishmentDetails.EstablishmentName, {
        shouldValidate: true,
      });
    }
    if (establishmentDetails?.FileNumber) {
      setValue("establishment_fileNumber", establishmentDetails.FileNumber, {
        shouldValidate: true,
      });
    }
    if (establishmentDetails?.CRNumber) {
      setValue("establishment_crNumber", establishmentDetails.CRNumber, {
        shouldValidate: true,
      });
    }
    if (establishmentDetails?.EstablishmentID) {
      setValue("establishment_id", establishmentDetails.EstablishmentID, {
        shouldValidate: true,
      });
    }
    if (establishmentDetails?.ContactNumber) {
      setValue("establishment_phoneNumber", establishmentDetails.ContactNumber, {
        shouldValidate: true,
      });
    }
    if (establishmentDetails?.Number700) {
      setValue("establishment_number700", establishmentDetails.Number700, {
        shouldValidate: true,
      });
    }
    if (establishmentDetails?.Region_Code || establishmentDetails?.Region) {
      setValue("establishment_region", { value: establishmentDetails?.Region_Code || "", label: establishmentDetails?.Region || "" });
    }
    if (establishmentDetails?.City_Code || establishmentDetails?.City) {
      setValue("establishment_city", { value: establishmentDetails?.City_Code || "", label: establishmentDetails?.City || "" });
    }
    setValue("claimantStatus", "establishment", {
      shouldValidate: true,
    });
  }, [establishmentDetails2, setValue]);

  const { t } = useTranslation("hearingdetails");

  const establishmentSections: SectionLayout[] = [
    {
      title: t("tab1_title"),
      gridCols: 3,
      className: "establishment-section",
      children: [
        {
          type: "readonly",
          label: t("establishment_tab1.establishmentName"),
          value: establishmentDetails?.EstablishmentName,
          isLoading: apiLoadingStates?.estab,
        },
        {
          type: "readonly",
          label: t("establishment_tab1.fileNumber"),
          value: establishmentDetails?.FileNumber,
          isLoading: apiLoadingStates?.estab,
        },
        {
          type: "readonly",
          label: t("establishment_tab1.commercialRegistrationNumber"),
          value: establishmentDetails?.CRNumber,
          isLoading: apiLoadingStates?.estab,
        },
        {
          type: "readonly",
          label: t("establishment_tab1.number700"),
          value: establishmentDetails?.Number700,
          isLoading: apiLoadingStates?.estab,
        },
        {
          type: !establishmentDetails?.Region ? "autocomplete" : "readonly",
          name: "establishment_region",
          isLoading: apiLoadingStates?.estab,
          label: t("establishment_tab1.region"),
          value: establishmentDetails?.Region,
          options: RegionOptions || [],
          validation: { required: t("regionValidation") },
          onChange: (value: any) => {
            setValue("establishment_region", value);
            setValue("establishment_city", null);
          },
        },
        {
          type: !establishmentDetails?.City ? "autocomplete" : "readonly",
          name: "establishment_city",
          isLoading: apiLoadingStates?.estab,
          label: t("establishment_tab1.city"),
          value: establishmentDetails?.City,
          options: CityOptions || [],
          validation: { required: t("cityValidation") },
          onChange: () => { },
        },
        {
          type: !establishmentDetails?.ContactNumber ? "input" : "readonly",
          name: "establishment_phoneNumber",
          label: t("establishment_tab2.mobileNumber"),
          isLoading: apiLoadingStates?.estab,
          inputType: "text",
          placeholder: "05xxxxxxxx",
          value: establishmentDetails?.ContactNumber,
          validation: {
            required: t("phoneNumberValidation"),
            pattern: {
              value: /^05\d{8}$/,
              message: t("phoneValidationMessage"),
            },
          },
          onChange: () => { },
        },
      ],
    },
  ];

  return establishmentSections.filter(Boolean);
};
