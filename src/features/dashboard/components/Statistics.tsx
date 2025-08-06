import { useUser } from "@/shared/context/userTypeContext";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLazyGetCaseCountQuery } from "../api/api";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import CaseRecordsSkeleton from "@/shared/components/loader/CaseRecordsSkeleton";

const Statistics = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [getCookie, setCookie] = useCookieState();
  const [statData, setStatData] = useState<StatData[]>([]);


  const { isEstablishment, isLegalRep, selected, userType, isMenueCahngeFlag } = useUser();
  const [triggerGetCaseCount, { data: caseCount, isFetching }] = useLazyGetCaseCountQuery();

  useEffect(() => {
    const userClaims = getCookie("userClaims");
    const userType = getCookie("userType");
    const mainCategory = getCookie("mainCategory")?.value;
    const subCategory = getCookie("subCategory")?.value;
    const selectedUserType = getCookie("selectedUserType");

    // For Legal representative users, check if they have made their selections
    if (userType === "Legal representative") {
      // If user hasn't selected their role yet, don't call the API
      if (!selectedUserType) {
        return;
      }
      
      // If user selected Legal representative but hasn't selected main/sub categories, don't call the API
      if (selectedUserType === "Legal representative" && (!mainCategory || !subCategory)) {
        return;
      }
      
      // If user selected Worker, use Worker configuration
      if (selectedUserType === "Worker") {
        triggerGetCaseCount({
          UserType: "Worker",
          IDNumber: userClaims?.UserID,
          AcceptedLanguage: i18n.language.toUpperCase(),
          SourceSystem: "E-Services"
        });
        return;
      }
    }

    const userConfigs: any = {
      Worker: {
        UserType: userType,
        IDNumber: userClaims?.UserID,
      },
      "Embassy User": {
        UserType: userType,
        IDNumber: userClaims?.UserID,
      },
      Establishment: {
        UserType: userType,
        IDNumber: userClaims?.UserID,
        FileNumber: userClaims?.File_Number,
      },
      "Legal representative": {
        UserType: userType,
        IDNumber: userClaims?.UserID,
        MainGovernment: mainCategory || "",
        SubGovernment: subCategory || "",
      },
    };

    triggerGetCaseCount({
      ...userConfigs[userType],
      AcceptedLanguage: i18n.language.toUpperCase(),
      SourceSystem: "E-Services"
    });

  }, [selected, userType, isMenueCahngeFlag]);

  useEffect(() => {
    if (caseCount) {
      setStatData([
        { count: caseCount?.TotalCaseCount, label: t("All_hearing_text") },
        { count: caseCount?.PendingCaseCount, label: t("Pending_hearing_text") },
        { count: caseCount?.CompletedCaseCount, label: t("Completed_hearing_text") },
      ])
    }
  }, [caseCount]);



  return (
    <>
      {isFetching ? (
        <CaseRecordsSkeleton />
      ) : (
        <div
          dir={isRTL ? "rtl" : "ltr"}
          className="w-[100%] bg-white rounded-lg shadow-md p-4 mb-4"
        >
          <p className="text-2lg text-gray-900 mb-4 bold">{t("statistics")}</p>
          <hr className="w-full border-t border-gray-930 my-4" />

          {statData.map((stat, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <StatCard count={stat.count} label={stat.label} />
              {index !== statData.length - 1 && (
                <hr className="w-[83.5%] border-t border-gray-930 mt-10" />
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
};
interface StatData {
  count: number;
  label: string;
}
const StatCard = ({ count, label }: StatData) => {
  return (
    <div className="flex flex-col items-center mt-[45px] gap-4">
      <span className="text-3xl bold text-green-900">{count}</span>
      <span className="text-gray-500 normal text-md">{label}</span>
    </div>
  );
};

export default React.memo(Statistics);