import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BreadcrumbItemType } from "@/shared/components/breadcrumbs/Breadcrumbs";
import HearingLayout from "@/shared/layouts/HearingLayout";
import { BreadcrumbsWrapper } from "@/shared/components/breadcrumbs/BreadcrumbWrapper";
const InitiateHearing = () => {
  const { t } = useTranslation("breadcrumbs");
  
  const breadcrumbs: BreadcrumbItemType[] = [
    { label: t("home"), href: "/" },
    { label: t("initiate_hearing"), href: "/initiate-hearing/case-creation" },
  ];

  return (
    <HearingLayout
      breadcrumbs={<BreadcrumbsWrapper items={breadcrumbs} />}
    >
      <Outlet />
    </HearingLayout>
  );
};

export default InitiateHearing;