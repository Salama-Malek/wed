import React, { lazy, Suspense, useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { InputField } from "@/shared/components/form";
import Button from "@/shared/components/button";
import TableLoader from "@/shared/components/loader/TableLoader";
import { CustomPagination } from "@/shared/components/pagination/CustomPagination";
import { AutoCompleteField } from "@/shared/components/form/AutoComplete";
import { Section } from "@/shared/layouts/Section";
import { useMyCasesData } from "../services/myCaseService";
import { useMyCasesColumns } from "./individual-cases/myCasesColumns";
import { useStatusWorkLookup } from "@/features/manage-hearings/api/useStatusWorkLookup";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
 
const ReusableTable = lazy(() =>
  import("@/shared/components/table/ReusableTable").then((mod) => ({
    default: mod.ReusableTable,
  }))
);
 
type StatusOption = { label: string; value: string };
type UserTypeConfig = "Worker" | "Establishment" | "Legal representative" | "Embassy User";

const userOptions = [
  { label: "Individual", value: "Worker" },
  { label: "Establishment", value: "Establishment" },
  { label: "Government", value: "Legal representative" },
  { label: "Embassy", value: "Embassy User" },
  { label: "Embassy", value: "Embassy User" },
];
 
interface HearingTabContentProps {
  role: "claimant" | "defendant";
  caseType: string;
}
 
const HearingTabContent = ({ role, caseType }: HearingTabContentProps) => {
  const { t, i18n } = useTranslation("hearingTabContent");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<StatusOption | null>(
    null
  );
  const [page, setPage] = useState(1);
  const [getCookie, setCookie] = useCookieState();
  const [selectedUserType, setSelectedUserType] =
    useState<UserTypeConfig>("Worker");
  const userType = getCookie("userType");
  const userID = getCookie("userClaims")?.UserID;
  const fileNumber = getCookie("userClaims")?.File_Number;
  const mainCategory = getCookie("mainCategory")?.value;
  const subCategory = getCookie("subCategory")?.value;
  const TableFor = role === "claimant" ? "Plaintiff" : "Defendant";
  const goveDetails = getCookie("storeAllUserTypeData");
 
  const { GOVTID = "", SubGOVTID = "" } = goveDetails?.GovRepDetails?.[0] ?? {};
 
  const userConfigs: any = {
    Worker: {
      UserType: userType || "Worker",
      IDNumber: userID,
    },
    Establishment: {
      UserType: userType || "Establishment",
      IDNumber: userID,
      FileNumber: fileNumber,
    },
    "Legal representative": {
      UserType: userType || "Legal representative",
      IDNumber: userID,
      MainGovernment: mainCategory || GOVTID || "",
      SubGovernment: subCategory || SubGOVTID || "",
    },
    "Embassy User": {
      UserType: userType || "Embassy User",
      IDNumber: userID,
    },
  } as const;
 
  const [winScreenWidth, setWinScreenWidth] = useState(window.innerWidth);
 
  useEffect(() => {
    const handleResize = () => setWinScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
 
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
 
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);
 
  useEffect(() => {
    setPage(1);
  }, [role, selectedStatus, debouncedSearchTerm]);

  useEffect(() => {
    if (!userType && userID) {
      const defaultUserType = role === "claimant" ? "Worker" : "Establishment";
      setCookie("userType", defaultUserType);
    }
  }, [userType, userID, role, setCookie]);

  const { data, isLoading, totalPages } = useMyCasesData({
    ...userConfigs[userType || "Worker"],
    ...userConfigs[userType || "Worker"],
    TableFor,
    PageNumber: page,
    CaseStatus: selectedStatus?.value,
    AcceptedLanguage: i18n.language === "ar" ? "AR" : "EN",
    SourceSystem: "E-Services",
    SearchID: debouncedSearchTerm,
    Number700: debouncedSearchTerm,
  });
 
  const filteredData = useMemo(() => {
    if (!debouncedSearchTerm) return data;
    const term = debouncedSearchTerm.toLowerCase();
    return data.filter((item) =>
      [
        item.CaseID,
        item.SettlementID,
        item.WorkStatus,
        item.SessionTime,
        item.SessionDayDate,
        item.CreateDate,
        item.CasePlaintiffName,
        item.CaseDefendantName,
        item.Number700,
      ]
        .filter(Boolean)
        .some((val) => String(val).toLowerCase().includes(term))
    );
  }, [data, debouncedSearchTerm]);
 
  const columns = useMyCasesColumns(data, role);
  const { options: statusOptions } = useStatusWorkLookup();
 
  return (
    <div>
      <Section isManageHearing gridCols={winScreenWidth > 768 ? 3 : 1}>
        <InputField
          isSearch
          title={t("search")}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
          }}
        />
 
        <AutoCompleteField
          isWrapped={false}
          options={statusOptions}
          value={selectedStatus}
          onChange={(val: unknown) => {
            if (
              val &&
              typeof val === "object" &&
              "label" in val &&
              "value" in val
            ) {
              setSelectedStatus(val as StatusOption);
            } else {
              setSelectedStatus(null);
            }
          }}
        />
 
        <div className="flex space-x-2 rtl:space-x-reverse">
          <Button
            variant="primary"
            typeVariant="brand"
            size="lg"
            className="w-[74px] h-[32px] px-3"
            onClick={() => {
              setDebouncedSearchTerm(searchTerm);
              setPage(1);
            }}
          >
            {t("searchButton")}
          </Button>
          <Button
            variant="secondary"
            typeVariant="outline"
            size="lg"
            className="w-[58px] h-[32px] px-3"
            onClick={() => {
              setSearchTerm("");
              setDebouncedSearchTerm("");
              setSelectedStatus(null);
              setPage(1);
            }}
          >
            {t("clear")}
          </Button>
        </div>
      </Section>
 
      <div className="mt-3xl mb-3xl">
        <hr className="border-t border-gray-300 w-full" />
      </div>
 
      <div className="mt-md">
        <Suspense fallback={<TableLoader />}>
          {isLoading ? (
            <TableLoader />
          ) : filteredData.length === 0 ? (
            <div className="text-center text-gray-500 p-6">
              {t("no_results_found") || "No results found for your search."}
            </div>
          ) : (
            <ReusableTable
              data={filteredData}
              columns={columns as any}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              PaginationComponent={CustomPagination}
            />
          )}
        </Suspense>
      </div>
    </div>
  );
};
 
export default HearingTabContent;