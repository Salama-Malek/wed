import { useTranslation } from "react-i18next";

export const getHearingBreadcrumbs = (caseId: string) => {
  const { t } = useTranslation("breadcrumbs"); 

  return [
    { label: t("home"), href: "/" },
    { label: t("manage_hearings"), href: "/manage-hearings" }, 
    { label: `${t("hearing_number")} (${caseId})`, href: "#" },
  ];
};
