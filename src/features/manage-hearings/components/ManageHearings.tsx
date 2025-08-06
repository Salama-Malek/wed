import { lazy, Suspense, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tab, TabList, TabPanel, TabPanels } from "@/shared/components/tabs";
import { HiMiniChevronRight } from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import Heading from "@/shared/components/ui/title-header";
import TableLoader from "@/shared/components/loader/TableLoader";
import HearingLayout from "@/shared/layouts/HearingLayout";
import { BreadcrumbsWrapper } from "@/shared/components/breadcrumbs/BreadcrumbWrapper";
 
const Tabs = lazy(() => import("@/shared/components/tabs").then(module => ({ default: module.Tabs })));
const HearingTabContent = lazy(() => import("./HearingTabContent"));
 
export default function ManageHearings() {
  const { caseType = "individual", role = "defendant" } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation("managehearings");
 
  // Set default tab based on localStorage or redirect to stored tab
  useEffect(() => {
    const storedCaseRole = localStorage.getItem("caseRoleTab");
    if(!storedCaseRole){
      localStorage.setItem("caseRoleTab", "claimant");
    }
  }, [role, caseType, navigate]);
 
  const breadcrumbs = [
    { label: t("breadcrumbs.home"), href: "/" },
    { label: t("breadcrumbs.manage_hearings"), href: "/manage-hearings" },
  ];
 
  return (
    <HearingLayout
      breadcrumbs={<BreadcrumbsWrapper items={breadcrumbs} />}
      contentClass="pt-7xl pb-7xl px-3xl"
    >
      <Heading className="mb-6">{t("heading")}</Heading>
     
      <Suspense fallback={<TableLoader />}>
        <Tabs>
          <TabList>
            <Tab
              id="claimant"
              onClick={() => {
                localStorage.setItem("caseRoleTab", "claimant");
                navigate(`/${caseType}/claimant`);
              }}
            >
              {t("tabs.claimant")}
            </Tab>
            <Tab
              id="defendant"
              onClick={() => {
                localStorage.setItem("caseRoleTab", "defendant");
                navigate(`/${caseType}/defendant`);
              }}
            >
              {t("tabs.defendant")}
            </Tab>
          </TabList>
 
          <TabPanels>
            <TabPanel id="claimant">
              <Suspense fallback={<TableLoader />}>
                <HearingTabContent role="claimant" caseType={caseType} />
              </Suspense>
            </TabPanel>
 
            <TabPanel id="defendant">
              <Suspense fallback={<TableLoader />}>
                <HearingTabContent role="defendant" caseType={caseType} />
              </Suspense>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Suspense>
    </HearingLayout>
  );
}