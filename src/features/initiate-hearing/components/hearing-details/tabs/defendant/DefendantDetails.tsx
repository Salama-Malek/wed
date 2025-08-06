import React, { useEffect } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useTranslation } from "react-i18next";
import withStepNavigation from "@/shared/HOC/withStepNavigation";
import { DynamicForm } from "@/shared/components/form/DynamicForm";
import {
  useGetEstablishmentDetailsQuery,
  useGetGovernmentLookupDataQuery,
  useGetSubGovernmentLookupDataQuery,
  useGetExtractedEstablishmentDataQuery,
} from "@/features/initiate-hearing/api/create-case/defendantDetailsApis";
import { useGetNICDetailsQuery } from "@/features/initiate-hearing/api/create-case/plaintiffDetailsApis";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import { useAPIFormsData } from "@/providers/FormContext";
import { useFormLayout } from "./defendant.forms.formLayout";
import { useLegelDefendantFormLayout } from "../../establishment-tabs/legal-representative/defendant/legdefendant.forms.formLayout";
import useDefendantDetailsPrefill from "@/features/initiate-hearing/hooks/useDefendantDetailsPrefill";
import { Option } from "@/shared/components/form/form.types";

const DefendantDetailsContainer: React.FC = () => {
  const { t, i18n } = useTranslation("hearingdetails");
  const [getCookie, setCookie] = useCookieState();
  // جلب بيانات المؤسسات (ExtractEstData)
  const userClaims = getCookie("userClaims") || {};
  const userType = getCookie("userType") || "";
  const caseId = getCookie("caseId");
  const lang = i18n.language.toUpperCase();
  const plaintiffId = (() => {
    try {
      const storedData = localStorage.getItem("CaseDetails");
      if (!storedData || storedData === "null" || storedData === "") {
        return "";
      }
      const caseDetails = JSON.parse(storedData);
      return caseDetails?.PlaintiffId || "";
    } catch {
      return "";
    }
  })();
  // const { data: extractedEstData, isLoading: isExtractEstLoading } =
  //   useGetExtractedEstablishmentDataQuery(
  //     {
  //       WorkerId: plaintiffId,
  //       AcceptedLanguage: lang,
  //       SourceSystem: "E-Services",
  //       UserType: userType,
  //       CaseID: caseId,
  //     },
  //     {
  //       skip: userType?.toLocaleLowerCase() === "legal representative" ||
  //         userType?.toLocaleLowerCase() === "establishment" ||
  //         !plaintiffId || !caseId || !userType,
  //     }
  //   );

  // Form context including errors
  const {
    register,
    clearFormData,
    setValue,
    watch,
    control,
    formState,
    trigger,
  } = useAPIFormsData();
  const errors = formState.errors;

  // استخدم hook الجديد لجلب بيانات المدعى عليه
  const { isFeatched: caseDetailsLoading, defendantData } =
    useDefendantDetailsPrefill(setValue as any);

  // تعبئة الحقول تلقائيًا عند توفر بيانات المدعى عليه
  useEffect(() => {
    if (defendantData) {
      // Apply prefill data based on defendant type
      const allowedFields = [
        "defendantStatus",
        "defendantDetails",
        "nationalIdNumber",
        "def_date_hijri",
        "DefendantsEstablishmentPrisonerName",
        "mobileNumber",
        "defendantRegion",
        "defendantCity",
        "occupation",
        "gender",
        "nationality",
        "DefendantFileNumber",
        "Defendant_Establishment_data_NON_SELECTED",
        "main_category_of_the_government_entity",
        "subcategory_of_the_government_entity",
      ];

      // Set defendant status and details first
      if (defendantData.defendantStatus) {
        setValue("defendantStatus", defendantData.defendantStatus);
      }

      if (defendantData.defendantDetails) {
        setValue("defendantDetails", defendantData.defendantDetails);
      }

      // Apply other fields
      Object.entries(defendantData).forEach(([key, value]) => {
        if (allowedFields.includes(key) && value !== null && value !== undefined) {
          setValue(key as any, value);
        }
      });

      // Handle establishment data specifically
      if (defendantData.Defendant_Establishment_data_NON_SELECTED) {
        const estData = defendantData.Defendant_Establishment_data_NON_SELECTED;
        if (estData.EstablishmentName) {
          setValue("Defendant_Establishment_data_NON_SELECTED", estData);
        }
      }

      // Handle government entity data
      if (defendantData.main_category_of_the_government_entity) {
        setValue("main_category_of_the_government_entity", defendantData.main_category_of_the_government_entity);
      }

      if (defendantData.subcategory_of_the_government_entity) {
        setValue("subcategory_of_the_government_entity", defendantData.subcategory_of_the_government_entity);
      }
    }
  }, [defendantData, setValue]);

  // إعادة تعيين الحقول عند أول تحميل
  useEffect(() => {
    [
      "defendantStatus",
      "defendantDetails",
      "nationalIdNumber",
      "def_date_hijri",
      "DefendantsEstablishmentPrisonerName",
      "mobileNumber",
      "defendantRegion",
      "defendantCity",
    ].forEach((e: any) => setValue(e, null));
  }, []);

  // حفظ واسترجاع بيانات النموذج من localStorage
  useEffect(() => {
    const savedFormData = localStorage.getItem("defendantFormData");
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        const currentFormData = watch();
        if (
          !currentFormData.defendantRegion &&
          !currentFormData.defendantCity
        ) {
          Object.entries(parsedData).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              setValue(key as any, value, { shouldValidate: false });
            }
          });
        }
      } catch (error) { }
    }
  }, [setValue, watch]);

  useEffect(() => {
    const currentFormData = watch();
    const formDataToSave = {
      defendantRegion: currentFormData.defendantRegion,
      defendantCity: currentFormData.defendantCity,
      phoneNumber: currentFormData.phoneNumber,
      DefendantFileNumber: currentFormData.DefendantFileNumber,
      Defendant_Establishment_data_NON_SELECTED:
        currentFormData.Defendant_Establishment_data_NON_SELECTED,
      Defendant_Establishment_data:
        currentFormData.Defendant_Establishment_data,
    };
    if (
      formDataToSave.defendantRegion ||
      formDataToSave.defendantCity ||
      formDataToSave.phoneNumber
    ) {
      localStorage.setItem("defendantFormData", JSON.stringify(formDataToSave));
    }
  }, [
    watch("defendantRegion"),
    watch("defendantCity"),
    watch("phoneNumber"),
    watch("DefendantFileNumber"),
  ]);

  useEffect(() => {
    const currentDefendantStatus = watch("defendantStatus");
    const currentDefendantDetails = watch("defendantDetails");
    if (
      currentDefendantStatus === "Establishment" &&
      currentDefendantDetails === "Others"
    ) {
      setValue("defendantRegion", null);
      setValue("defendantCity", null);
      setValue("phoneNumber", "");
      localStorage.removeItem("defendantFormData");
    }
  }, [watch("defendantStatus"), watch("defendantDetails"), setValue]);

  useEffect(() => {
    return () => {
      const currentStep = parseInt(localStorage.getItem("step") || "0");
      const currentTab = parseInt(localStorage.getItem("tab") || "0");
      if (currentStep > 0 || currentTab > 1) {
        localStorage.removeItem("defendantFormData");
      }
    };
  }, []);

  const defendantStatus = watch("defendantStatus");
  const defendantDetails = watch("defendantDetails");
  const mainCategory = watch("main_category_of_the_government_entity") as any;

  const { data: governmentData, isLoading: isGovernmentLoading } =
    useGetGovernmentLookupDataQuery(
      {
        AcceptedLanguage: lang,
        SourceSystem: "E-Services",
      },
      {
        skip:
          userType?.toLocaleLowerCase() === "legal representative" ||
          userType?.toLocaleLowerCase() === "establishment",
      }
    );

  const { data: subGovernmentData, isLoading: isSubGovernmentLoading } =
    useGetSubGovernmentLookupDataQuery(
      mainCategory && mainCategory.value
        ? {
          AcceptedLanguage: lang,
          SourceSystem: "E-Services",
          mainGovernmentSelected: mainCategory,
        }
        : skipToken
    );




  // تحديد الـ formLayout المناسب
  const getFormLayout = (getUserType: string) => {
    getUserType = getUserType?.toLocaleLowerCase();

    switch (getUserType) {
      case "legal representative":
      case "establishment":
        return useLegelDefendantFormLayout({
          setValue,
          watch,
          control,
          caseDetailsLoading,
          defendantData,
        });
      case "individual":
      case "worker":
      default:
        return useFormLayout(
          setValue,
          watch,
          trigger,
          governmentData,
          subGovernmentData,
          caseDetailsLoading,
          defendantData
        );
    }
  };

  const isNotOthersDefendant = defendantDetails !== "Others";
  const DefendantType = isNotOthersDefendant
    ? "Establishment"
    : defendantStatus;

  useEffect(() => {
    setCookie("defendantTypeInfo", DefendantType);
  }, [DefendantType]);

  useEffect(() => {
    if (defendantStatus === "Establishment") {
      setValue("main_category_of_the_government_entity", "", {
        shouldValidate: false,
      });
      setValue("subcategory_of_the_government_entity", "", {
        shouldValidate: false,
      });
      setCookie("defendantStatus", "Establishment");
      setValue("EstablishmentData", null, { shouldValidate: false });
    } else if (defendantStatus === "Government") {
      setCookie("defendantStatus", "Government");
      setValue("EstablishmentData", null, { shouldValidate: false });
    }
  }, [defendantStatus, setValue]);

  // // مقارنة رقم الملف بين بيانات القضية وبيانات المؤسسات المستخرجة
  // const caseFileNumber = defendantData?.DefendantFileNumber || "";
  // let isFileNumberMatch = false;
  // if (
  //   extractedEstData &&
  //   extractedEstData.EstablishmentData &&
  //   Array.isArray(extractedEstData.EstablishmentData)
  // ) {
  //   isFileNumberMatch = extractedEstData.EstablishmentData.some(
  //     (est: any) => est.FileNumber === caseFileNumber
  //   );
  // }

  const formLayoutResult = getFormLayout(userType);
  const formLayout = 'layout' in formLayoutResult ? formLayoutResult.layout : formLayoutResult;
  const isOnlyFileNumberFilled = 'isOnlyFileNumberFilled' in formLayoutResult ? formLayoutResult.isOnlyFileNumberFilled : () => false;

  return (
    <>
      <div className={`relative`}>
        <div>
          <DynamicForm
            formLayout={formLayout}
            register={register}
            errors={errors}
            setValue={setValue}
            watch={watch}
            control={control}
          />
        </div>
      </div>
    </>
  );
};

export default withStepNavigation(DefendantDetailsContainer);
