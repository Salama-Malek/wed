import { UseFormWatch } from "react-hook-form";
import {
  SectionLayout,
  FormData,
} from "@/shared/components/form/form.types";
import { Children, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import { useGetUserTypeLegalRepQuery } from "@/features/login/api/loginApis";
import { TokenClaims } from "@/features/login/components/AuthProvider";


export const useLegalRepPlaintiffFormLayout = (
  watch: UseFormWatch<FormData>,
  userTypeLegalRepData?: any,
  setValue?: any
): SectionLayout[] => {
  const { t: LegalRep, i18n } = useTranslation("legal_rep");
  const [getCookie, setCookie] = useCookieState({
    mainCategory: "mainCategory",
    subCategory: "subCategory",
  });


  const [selectedMainCategory, setSelectedMainCategory] = useState<any | null>(
    getCookie("mainCategory")
  );
  const [selectedSubCategory, setSelectedSubCategory] = useState<any | null>(
    getCookie("subCategory")
  );
  const govRepDetail = userTypeLegalRepData?.GovRepDetails?.find(
    (item: any) => item.GOVTID === selectedMainCategory?.value
  );


  const userClaims: TokenClaims = getCookie("userClaims");

  const [userLegDataState, setUserLegDataState] = useState<any | null>({});

  const { data: userLegData, isLoading } = useGetUserTypeLegalRepQuery(
    {
      IDNumber: userClaims.UserID,
      UserType: userClaims.UserType,
      AcceptedLanguage: i18n.language.toUpperCase(),
      SourceSystem: "E-Services",
    },
  );


  useEffect(() => {
    if (userLegData && userLegData.GovRepDetails &&
      userLegData.GovRepDetails.length > 0) {
      // Find the matching government entity based on mainCategory and subCategory from cookies
      const matchingEntity = userLegData.GovRepDetails?.find(
        (item: any) =>
          item.GOVTID === selectedMainCategory?.value && 
          item.SubGOVTID === selectedSubCategory?.value
      );
      
      if (matchingEntity) {
        setUserLegDataState(matchingEntity);
        // Update cookies if they don't match the selected entity
        if (selectedMainCategory?.value !== matchingEntity.GOVTID) {
          setCookie("mainCategory", {
            value: matchingEntity.GOVTID,
            label: matchingEntity.GovernmentName
          });
        }
        if (selectedSubCategory?.value !== matchingEntity.SubGOVTID) {
          setCookie("subCategory", {
            value: matchingEntity.SubGOVTID,
            label: matchingEntity.SubGovernmentName
          });
        }
      } else {
        // If no match found, use the first entity and update cookies
        const firstEntity = userLegData.GovRepDetails[0];
        setUserLegDataState(firstEntity);
        setCookie("mainCategory", {
          value: firstEntity.GOVTID,
          label: firstEntity.GovernmentName
        });
        setCookie("subCategory", {
          value: firstEntity.SubGOVTID,
          label: firstEntity.SubGovernmentName
        });
      }
    }
  }, [userLegData, selectedMainCategory, selectedSubCategory, setCookie]);



  useEffect(() => {
    if (userLegDataState) {
      // Set all form values based on the selected government entity
      const formUpdates = {
        LegalRepEmail: userLegDataState?.EmailAddress,
        LegalRepMobileNumber: userLegDataState?.RepMobileNumber,
        LegalRepID: userLegDataState?.RepNationalid,
        LegalRepName: userLegDataState?.RepName,
        SubGovtDefendant_Code: userLegDataState?.SubGOVTID,
        MainGovtDefendant_Code: userLegDataState?.GOVTID,
        SubGovtDefendant: userLegDataState?.SubGovernmentName,
        MainGovtDefendant: userLegDataState?.GovernmentName
      };

      // Update all form values at once
      Object.entries(formUpdates).forEach(([key, value]) => {
        setValue(key, value, {
          shouldValidate: !!value
        });
      });
    }
  }, [userLegDataState, setValue]);

  //#endregion Hassan Code Here 


  const plaintiffStatus = watch("plaintiffStatus");


  // const conditionalSections = [];
  // conditionalSections.push(
  //   {
  //     data: {
  //       type: "readonly",
  //       fields: [
  //         {
  //           label: LegalRep("plaintiffDetails.MainCategoryGovernmentEntity"),
  //           value: selectedMainCategory?.label,
  //           isLoading: isLoading
  //         },
  //         {
  //           label: LegalRep("plaintiffDetails.SubcategoryGovernmentEntity"),
  //           value: selectedSubCategory?.label,
  //           isLoading: isLoading
  //         },
  //       ],
  //     },
  //   },
  //   {
  //     title: LegalRep("LegalRepresentative"),
  //     data: {
  //       type: "readonly",
  //       fields: [
  //         {
  //           label: LegalRep(
  //             "LegalRepresentativeDetails.LegalRepresentativeName"
  //           ),
  //           value: userLegDataState?.RepName,
  //           isLoading: isLoading
  //         },
  //         {
  //           label: LegalRep(
  //             "LegalRepresentativeDetails.LegalRepresentativeName"
  //           ),
  //           value: userLegDataState?.RepName,
  //           isLoading: isLoading
  //         },
  //         {
  //           label: LegalRep(
  //             "LegalRepresentativeDetails.LegalRepresentativeID"
  //           ),
  //           value: userLegDataState?.RepNationalid,
  //           isLoading: isLoading
  //         },
  //         {
  //           label: LegalRep("LegalRepresentativeDetails.MobileNumber"),
  //           value: userLegDataState?.RepMobileNumber,
  //           isLoading: isLoading
  //         },
  //         {
  //           label: LegalRep("LegalRepresentativeDetails.EmailAddress"),
  //           value: userLegDataState?.EmailAddress,
  //           isLoading: isLoading
  //         },
  //       ],
  //     },
  //   }
  // );

  const conditionalSection2 = [];
  conditionalSection2.push({
    title: LegalRep("LegalRepresentative"),
    children: [
      {
        type: "readonly",
        label: LegalRep("plaintiffDetails.MainCategoryGovernmentEntity"),
        value: userLegDataState?.GovernmentName || selectedMainCategory?.label,
        isLoading: isLoading
      },
      {
        type: "readonly",
        label: LegalRep("plaintiffDetails.SubcategoryGovernmentEntity"),
        value: userLegDataState?.SubGovernmentName || selectedSubCategory?.label,
        isLoading: isLoading
      },
    ]
  }, {
    title: LegalRep("LegalRepresentative"),
    children: [
      {
        type: "readonly",
        label: LegalRep(
          "LegalRepresentativeDetails.LegalRepresentativeName"
        ),
        value: userLegDataState?.RepName,
        isLoading: isLoading
      },
      {
        type: "readonly",
        label: LegalRep(
          "LegalRepresentativeDetails.LegalRepresentativeID"
        ),
        value: userLegDataState?.RepNationalid,
        isLoading: isLoading
      },
      {
        type: "readonly",
        label: LegalRep("LegalRepresentativeDetails.MobileNumber"),
        value: userLegDataState?.RepMobileNumber,
        isLoading: isLoading
      },
      {
        type: "readonly",
        label: LegalRep("LegalRepresentativeDetails.EmailAddress"),
        value: userLegDataState?.EmailAddress,
        isLoading: isLoading
      },
    ]
  })



  return [
    ...conditionalSection2,
  ].filter(Boolean) as SectionLayout[];
};
