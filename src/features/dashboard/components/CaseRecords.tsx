import Button from "@/shared/components/button";
import { ArrowLeft01Icon, ArrowRight01Icon } from "hugeicons-react";
import React, { useState, lazy, Suspense, useEffect } from "react";
import { useTranslation } from "react-i18next";
import TableLoader from "@/shared/components/loader/TableLoader";
import { useGetCaseAuditQuery } from "../api/api";
import { ICaseStatusAudit } from "../types/caseRecord.model";
import { useLanguageDirection } from "@/i18n/LanguageDirectionProvider";
import StepperSkeleton from "@/shared/components/loader/StepperSkeleton";
import CaseRecordsSkeleton from "@/shared/components/loader/CaseRecordsSkeleton";
import { useNavigate } from "react-router-dom";
import { TokenClaims } from "@/features/login/components/AuthProvider";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";

const CaseRecordsModal = lazy(
  () => import("@/features/login/components/LoginAccountSelect")
);
const Modal = lazy(() => import("@/shared/components/modal/Modal"));

interface CaseRecordsProps {
  isLegalRep?: boolean;
  popupHandler: () => void;
}

const CaseRecords: React.FC<CaseRecordsProps> = ({ isLegalRep, popupHandler }) => {
  const { t } = useTranslation("login");
  const { isRTL } = useLanguageDirection();
  const navigate = useNavigate();
  const [getCookie, setCookie] = useCookieState();
  const userClaims = getCookie("userClaims");
  const userType = getCookie("userType");
  const popupShown = getCookie("popupShown") || false;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  // Only fetch cases if we have user type data
  const { data, isError, isFetching } = useGetCaseAuditQuery(
    {
      IDNumber: userClaims?.UserID || "",
      // SourceSystem: "E-Services",
      // AcceptedLanguage: isRTL ? "AR" : "EN",
      PageNumber: 1,
      PageSize: 3,
      UserType: userType,
    },
    {
      skip: !userType, // Skip if we don't have user type
    }
  );

  const cases = data?.PlaintiffCases ?? [];
  const current = cases[currentCaseIndex] ?? {
    CaseStatusAudit: [] as ICaseStatusAudit[],
  };

  // 1) One-time: clear out the old caseId cookie on mount
  useEffect(() => {
    setCookie("caseId", "");
  }, [setCookie]);

  // 2) Popup logic: only open once for a true legal rep who hasn't seen it yet
  useEffect(() => {
    if (
      userClaims?.UserType === "2" &&
      userType === "Legal representative" &&
      !popupShown
    ) {
      setIsModalOpen(true);
      setCookie("popupShown", true);
    }
  }, [userClaims, userType, popupShown, setCookie]);

  const handleCloseModal = () => setIsModalOpen(false);

  const handleNext = () => {
    if (currentCaseIndex < cases.length - 1) {
      setCurrentCaseIndex((p) => p + 1);
    }
  };
  const handlePrev = () => {
    if (currentCaseIndex > 0) {
      setCurrentCaseIndex((p) => p - 1);
    }
  };
  const handleViewDetails = () => {
    const caseId = current.CaseID;
    navigate(`/manage-hearings/${caseId}`);
  };
  const [selectedOption, setSelectedOption] = useState<
    { value: string; label: string } | null | string
  >(null);
  const handleChange = (
    selectedOption: { value: string; label: string } | null | string
  ) => {
    setSelectedOption(selectedOption);
  };

  const statusColors = {
    New: {
      variant: "success" as const,
      typeVariant: "subtle" as const,
      withDate: {
        variant: "success" as const,
        typeVariant: "subtle" as const,
        // You can add additional className if needed
        className:
          "!bg-success-100 !text-success-900 semibold border-success-1000",
      },
    },
    "Under review": {
      variant: "success" as const,
      typeVariant: "subtle" as const,
      withDate: {
        variant: "success" as const,
        typeVariant: "subtle" as const,
        className:
          "!bg-success-100 !text-success-900 semibold border-success-1000",
      },
    },
    "Under negotiation": {
      variant: "secondary" as const,
      typeVariant: "gray" as const,
      withDate: {
        variant: "secondary" as const,
        typeVariant: "gray" as const,
        className:
          "!bg-success-100 !text-success-900 semibold border-success-1000",
      },
    },
    Unknown: {
      variant: "secondary" as const,
      typeVariant: "gray" as const,
      withDate: {
        variant: "secondary" as const,
        typeVariant: "gray" as const,
        className:
          "!bg-success-100 !text-success-900 semibold border-success-1000",
      },
    },
  };

  const formatStatusDate = (rawDate: string) => {
    if (!rawDate) return "";

    const cleanedDate = rawDate
      .replace("GMT", "")
      .trim()
      .replace(
        /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})\.(\d{3})$/,
        "$1-$2-$3T$4:$5:$6.$7Z"
      );

    const date = new Date(cleanedDate);

    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <>
      {isFetching ? (
        <CaseRecordsSkeleton />
      ) : (
        <aside
          dir={t("dir")}
          className={`w-[100%] min-w-[350px] bg-light-alpha-white rounded-md shadow-md p-4 max-h-[582px] overflow-y-auto ${
            t("dir") === "rtl" ? "text-right" : "text-left"
          }`}
        >
          <div className="flex justify-between items-center ">
            <h2 className="text-lg bold text-gray-800">{t("case_records")}</h2>
            <div className="flex gap-6 rounded-md ">
              {t("dir") === "rtl" ? (
                <>
                  <ArrowRight01Icon
                    onClick={handleNext}
                    className="w-6 h-7 text-default-color cursor-pointer"
                  />
                  <ArrowLeft01Icon
                    onClick={handlePrev}
                    className={`w-6 h-7 cursor-pointer ${
                      currentCaseIndex === 0
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-default-color"
                    }`}
                  />
                </>
              ) : (
                <>
                  <ArrowLeft01Icon
                    onClick={handlePrev}
                    className="w-6 h-7 text-default-color cursor-pointer"
                  />
                  <ArrowRight01Icon
                    onClick={handleNext}
                    className="w-6 h-7 text-default-color cursor-pointer"
                  />
                </>
              )}
            </div>
          </div>
          <hr className="border-t border-gray-200 my-[6px] mt-4 mb-5" />
          <p className="text-md text-gray-950 mb-14 medium mt-5">
            {t("labor_case_against")}
            <span className="bold text-green-700"> {current?.CaseID} </span>
            <span className="ml-.5">{t("establishment")}</span>
          </p>
          <div className="ml-6">
            {(() => {
              if (isError || !cases.length) {
                // Render fallback UI
                const dummySteps = Array.from({ length: 4 });

                return dummySteps.map((_, index) => (
                  <div
                    key={`dummy-${index}`}
                    className={`relative ${
                      index < 3 ? "h-auto" : "min-h-[60px]"
                    } ${
                      index < 3 ? "border-primary-700" : "border-transparent"
                    } mt-8 ${
                      t("dir") === "rtl"
                        ? "border-r right-6 pr-6"
                        : "border-l left-2 pl-6"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full absolute ${
                        t("dir") === "rtl"
                          ? "-right-[10.5px]"
                          : "-left-[10.5px]"
                      } -top-7 border-2 border-gray-300 bg-white`}
                    ></div>

                    <div className="relative -top-8 space-y-2">
                      <Button
                        variant="secondary"
                        typeVariant="gray"
                        size="xs"
                        className="text-sm8 light bg-gray-100 text-gray-500 border border-gray-300"
                      >
                        --:--
                      </Button>
                      <p className="text-sm8 light text-gray-400">--:--</p>
                    </div>
                  </div>
                ));
              }

              // Render normal timeline
              const grouped: { [status: string]: ICaseStatusAudit[] } = {};
              current?.CaseStatusAudit?.forEach((item) => {
                const key = item.WorkStatus || "Unknown";
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push(item);
              });

              return Object.entries(grouped).map(
                ([status, entries], index, array) => {
                  const isLast = index === array.length - 1;
                  const hasNoDate = entries.every((e) => !e.StatusChangeDate);

                  const statusKey = status as keyof typeof statusColors;
                  const colors =
                    statusColors[statusKey] || statusColors.Unknown;
                  const hasDate = entries.some((e) => e.StatusChangeDate);

                  return (
                    <div
                      key={status + index}
                      className={`relative ${
                        !isLast ? "h-auto" : "min-h-[60px]"
                      } ${
                        !isLast ? "border-primary-700" : "border-transparent"
                      } mt-8 ${
                        t("dir") === "rtl"
                          ? "border-r right-6 pr-6"
                          : "border-l left-2 pl-6"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full absolute ${
                          t("dir") === "rtl"
                            ? "-right-[10.5px]"
                            : "-left-[10.5px]"
                        } -top-7 ${
                          hasNoDate
                            ? "border-2 border-gray-300 bg-white"
                            : "bg-primary-600"
                        }`}
                      ></div>

                      <div className="relative -top-8 space-y-2">
                        <Button
                          variant={
                            hasDate ? colors.withDate.variant : colors.variant
                          }
                          typeVariant={
                            hasDate
                              ? colors.withDate.typeVariant
                              : colors.typeVariant
                          }
                          size="xs"
                          className={`text-sm8 light ${
                            hasDate ? colors.withDate.className : ""
                          }`}
                        >
                          {status || "--:--"}
                        </Button>
                        {status === "Under-Negotiations" ? (
                          entries.map((entry, i) => (
                            <p
                              key={i}
                              className="text-sm8 light text-gray-1000"
                            >
                              {entry.StatusChangeDate
                                ? formatStatusDate(entry.StatusChangeDate)
                                : "--:--"}
                            </p>
                          ))
                        ) : (
                          <p className="text-sm8 light text-gray-1000">
                            {entries[entries.length - 1]?.StatusChangeDate
                              ? formatStatusDate(
                                  entries[entries.length - 1].StatusChangeDate
                                )
                              : "--:--"}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                }
              );
            })()}

            <div className="relative -top-8 space-y-4 mt-5">
              <div
                className={`flex ${
                  t("dir") === "rtl" ? "justify-end" : "justify-end"
                }`}
              >
                <Button
                  variant="secondary"
                  typeVariant="solid"
                  size="xs"
                  className="border border-gray-300"
                  onClick={() => handleViewDetails()}
                >
                  {t("View_details")}
                </Button>
              </div>
            </div>
          </div>
          {/* </div> */}

          {/* {isModalOpen && ( */}
          {/* {userType === "Legal representative" && isModalOpen && (
            <Suspense fallback={<StepperSkeleton />}>
              <Modal
                className="!max-h-none !h-auto !overflow-visible"
                close={handleCloseModal}
                modalWidth={600}
                preventOutsideClick={true}
              >
                <Suspense fallback={<StepperSkeleton />}>
                  <CaseRecordsModal
                    isLegalRep={isLegalRep}
                    selected={selected}
                    setSelected={setSelected}
                    handleChange={(opt) => setSelected(opt as any)}
                    handleCloseModal={handleCloseModal}
                    selectedOption={null}
                    popupHandler={popupHandler}
                  />
                </Suspense>
              </Modal>
            </Suspense>
          )} */}
        </aside>
      )}
    </>
  );
};

export default React.memo(CaseRecords);
