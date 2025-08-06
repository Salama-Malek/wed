import { useState, useCallback, lazy, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGetCaseDetailsQuery } from "@/features/manage-hearings/api/myCasesApis";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import { TokenClaims } from "@/features/login/components/AuthProvider";

// Define allowed section IDs
type SectionId = "data" | "topics" | "review";

const componentMap: Record<SectionId, () => Promise<{ default: React.ComponentType<any> }>> = {
  data: () => import("../components/DataDetails"),
  topics: () => import("../components/TopicsDetails"),
  review: () => import("../components/ReviewDetails"),
};

const useHearingDetail = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const { t, i18n } = useTranslation(["stepper", "manageHearingDetails"]);
  const [getCookie, setCookie] = useCookieState();
  const UserClaims: TokenClaims = getCookie("userClaims");
  const userType = getCookie("userType");
  const mainCategory = getCookie("mainCategory")?.value;
  const subCategory = getCookie("subCategory")?.value;
  const userID = getCookie("userClaims")?.UserID;
  const fileNumber = getCookie("userClaims")?.File_Number;

  const userConfigs: any = {
    Worker: {
      UserType: userType,
      IDNumber: userID,
    },
    "Embassy User": {
      UserType: userType,
      IDNumber: userID,
    },
    Establishment: {
      UserType: userType,
      IDNumber: userID,
      FileNumber: fileNumber,
    },
    "Legal representative": {
      UserType: userType,
      IDNumber: userID,
      MainGovernment:mainCategory ||  "",
      SubGovernment: subCategory ||  "",
    },
  } as const;

 

  const { data,  isLoading, isError, refetch } = useGetCaseDetailsQuery({
    ...userConfigs[userType],
    AcceptedLanguage: i18n.language === "ar" ? "AR" : "EN",
    SourceSystem: "E-Services",
    CaseID: caseId ?? "",
  },
  { skip: !caseId });

  // const { data, isLoading, isError, refetch } = useGetCaseDetailsQuery(
  //   {
  //     CaseID: caseId ?? "",
  //     AcceptedLanguage: i18n.language === "ar" ? "AR" : "EN",
  //     SourceSystem: "E-Services",
  //     IDNumber: UserClaims.UserID || "",
  //     UserType: userType || "",

  //   },
  //   { skip: !caseId }
  // );

  useEffect(() => {
    if (caseId) {
      refetch();
    }
  }, [caseId, i18n.language, refetch]);

  const hearing = data?.CaseDetails || {};

  const [expanded, setExpanded] = useState<SectionId | null>(null);
  const [loadedComponents, setLoadedComponents] = useState<Record<SectionId, React.LazyExoticComponent<React.ComponentType<any>>>>({} as any);

  const loadComponent = (sectionId: SectionId) => {
    if (!loadedComponents[sectionId] && componentMap[sectionId]) {
      setLoadedComponents((prev) => ({
        ...prev,
        [sectionId]: lazy(componentMap[sectionId]),
      }));
    }
  };

  const toggleAccordion = useCallback((sectionId: SectionId) => {
    setExpanded((prev) => (prev === sectionId ? null : sectionId));
    loadComponent(sectionId);
  }, []);

  const accordionSections = [
    { id: "data", title: t("step1.title") },
    { id: "topics", title: t("step2.title") },
    { id: "review", title: t("step3.title") },
  ];

  return {
    hearing,
    isLoading,
    isError,
    expanded,
    toggleAccordion,
    loadedComponents,
    accordionSections,
    refetch,
  };
};

export default useHearingDetail;
