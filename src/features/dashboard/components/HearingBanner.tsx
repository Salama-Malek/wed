import React, { lazy, Suspense, useEffect, useState } from "react";
import BannerBg from "@/assets/images/banner/banner-bg.png";
import Button from "@/shared/components/button";
import { useTranslation } from "react-i18next";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
const InfoBanner = lazy(
  () => import("@/shared/components/ui/account-warning-header")
);
import TableLoader from "@/shared/components/loader/TableLoader";
import { useGetMySchedulesQuery, useLazyGetMySchedulesQuery } from "../api/api";
import { TokenClaims } from "@/features/login/components/AuthProvider";
import { useUser } from "@/shared/context/userTypeContext";
import { useGetEstablishmentDetailsQuery } from "@/features/initiate-hearing/api/create-case/defendantDetailsApis";

interface BannerProps {
  isEstablishment?: boolean;
  isLegalRep?: boolean;
  showInfoBanner?: boolean;
  onCloseInfoBanner?: () => void;
}

const Banner: React.FC<BannerProps> = ({
  isEstablishment,
  isLegalRep,
  showInfoBanner = false,
  onCloseInfoBanner,
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [hasHearing, setHasHearing] = useState(false);
  const [hasLegalRepresentative, setHasLegalRepresentative] = useState(true);
  const [getCookie, setCookie] = useCookieState({});
  const userClaims: TokenClaims = getCookie("userClaims");
  const uerType = getCookie("userType");
  const [isInfoBannerVisible, setIsInfoBannerVisible] = useState(true);
  const { selected: selectedUser, isMenueCahngeFlag } = useUser();

  // Get establishment details to get CR number
  const { data: establishmentDetails } = useGetEstablishmentDetailsQuery(
    {
      AcceptedLanguage: i18n.language.toUpperCase(),
      SourceSystem: "E-Services",
      FileNumber: userClaims?.File_Number,
    },
    {
      skip: !isEstablishment || !userClaims?.File_Number,
    }
  );

  // Store CR number in cookie when we get it
  useEffect(() => {
    if (establishmentDetails?.EstablishmentInfo?.[0]?.CRNumber) {
      setCookie(
        "establishmentCRNumber",
        establishmentDetails.EstablishmentInfo[0].CRNumber
      );
    }
  }, [establishmentDetails, setCookie]);

  const [nearestSession, setNearestSession] = useState<null | {
    minutesRemaining: number;
    webexLink: string;
  }>(null);
  const [
    triggerGetMySchedules,
    { data: mySchedualData, isLoading: mySchedualLoading },
  ] = useLazyGetMySchedulesQuery();
  const [timeLeft, setTimeLeft] = useState<number>(-1);

  const getMySchedualDataFun = async () => {
    const userID = getCookie("userClaims")?.UserID;
    const fileNumber = getCookie("userClaims")?.File_Number;
    const mainCategory = getCookie("mainCategory")?.value;
    const subCategory = getCookie("subCategory")?.value;
    const uerType = getCookie("userType");
    const selectedUserType = getCookie("selectedUserType");

    if (uerType === "Legal representative") {
      if (!selectedUserType) {
        return;
      }

      if (
        selectedUserType === "Legal representative" &&
        (!mainCategory || !subCategory)
      ) {
        return;
      }

      // If user selected Worker, use Worker configuration
      if (selectedUserType === "Worker") {
        const result = await triggerGetMySchedules({
          UserType: "Worker",
          IDNumber: userID,
          AcceptedLanguage: i18n.language.toUpperCase(),
          SourceSystem: "E-Services",
        });
        handleApiResponse(result);
        return;
      }
    }

    const userConfigs: any = {
      Worker: {
        UserType: uerType,
        IDNumber: userID,
      },
      "Embassy User": {
        UserType: uerType,
        IDNumber: userID,
      },
      Establishment: {
        UserType: uerType,
        IDNumber: userID,
        FileNumber: fileNumber,
      },
      "Legal representative": {
        UserType: uerType,
        IDNumber: userID,
        MainGovernment: mainCategory || "",
        SubGovernment: subCategory || "",
      },
    } as const;

    setTimeLeft(-1);
    const result = await triggerGetMySchedules({
      ...userConfigs[uerType],
      AcceptedLanguage: i18n.language.toUpperCase(),
      SourceSystem: "E-Services",
    });
    handleApiResponse(result);
  };


  const handleApiResponse = (result: any) => {
    const data = result?.data;
    if (data?.PlaintiffCases?.length > 0) {
      const upcomingSessions = data?.PlaintiffCases.map((s: any) => ({
        minutesRemaining: parseFloat(s?.ScheduleTimeRemaining),
        webexLink: s?.ScheduleWebexLink,
      }))
        .filter((s: any) => s?.minutesRemaining > 0)
        .sort((a: any, b: any) => a?.minutesRemaining - b?.minutesRemaining);

      if (upcomingSessions?.length > 0) {
        setTimeLeft(upcomingSessions?.[0]?.minutesRemaining * 60);
        setNearestSession(upcomingSessions?.[0]);
      } else {
        setNearestSession(null);
      }
    } else {
      setNearestSession(null);
    }
  };




  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (timeLeft <= -1) {
      if (timer) clearInterval(timer);
      return;
    }
    if (nearestSession && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    if (timeLeft === 0) {
      if (timer) clearInterval(timer);
      getMySchedualDataFun();
      return;
    }
    // Cleanup
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [nearestSession, timeLeft]);
  useEffect(() => {
    getMySchedualDataFun();
  }, [uerType, selectedUser, isMenueCahngeFlag]);

  const formatTime = (seconds: number) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");

    let result = "";
    if (d > 0) {
      result += `${d} ${d === 1 ? t("Day") : t("Days")}`;
    }
    if (h > 0 || d > 0) {
      result += ` ${h} ${t("Hour")}`;
    }
    result += `  ${m}  ${t("Minute")}  ${s} ${t("Second")}`;
    return result.trim();
  };

  const handleCloseInfoBanner = () => {
    setIsInfoBannerVisible(false);
  };

  return (
    <>
      {isLegalRep && isInfoBannerVisible && (
        <Suspense fallback={<TableLoader />}>
          <InfoBanner onClose={handleCloseInfoBanner} />
        </Suspense>
      )}

      <section
        dir={t("dir")}
        className={`relative w-full mt-4 overflow-hidden border border-gray-300 rounded-md z-0`}
      >
        <img
          src={BannerBg}
          alt="Banner Background"
          className="absolute inset-0 w-full h-full object-cover opacity-10"
        />

        <div
          className="absolute inset-0"
          style={{
            background: isRTL
              ? "linear-gradient(-90deg, rgba(255, 255, 255, 0.6) 41%, rgba(201, 255, 220, 0.74) 100%)"
              : "linear-gradient(90deg, rgba(255, 255, 255, 0.6) 41%, rgba(201, 255, 220, 0.74) 100%)",
          }}
        ></div>

        <div className="relative z-10 p-6">
          {nearestSession && (
            <div className="mb-4 bg-primary-960 rounded-md text-gray-100 p-4 flex justify-between items-center">
              {timeLeft > 1500 ? (
                <p className="text-1822">
                  <b>
                    {t("time_desc_start")} {":  "}
                  </b>
                  {formatTime(timeLeft)}{" "}
                </p>
              ) : (
                <>
                  <p className="text-1822">{t("session_expired_or_ended")}</p>
                </>
              )}
              <Button
                variant="secondary"
                typeVariant="solid"
                onClick={() => window.open(nearestSession.webexLink, "_blank")}
              >
                {t("attend_session")}
              </Button>
            </div>
          )}

          <div className="relative z-0 flex justify-between items-center">
            <div className="space-y-4">
              <h6 className="text-2436 bold text-primary-900 lg:text-2xl text-lg">
                {t("welcome_text")} {userClaims?.UserName}
              </h6>
              {isEstablishment && (
                <div className="flex">
                  <p
                    className={`text-md text-gray-500 ${isRTL ? "ml-1" : "mr-1"
                      }`}
                  >
                    {t("registration_text")}
                  </p>
                  <p className="text-md font-bold text-gray-500">
                    {establishmentDetails?.EstablishmentInfo?.[0]?.CRNumber ||
                      getCookie("establishmentCRNumber") ||
                      t("registration_num")}
                  </p>
                </div>
              )}

              {/* <p className={`text-sm ${isRTL ? "text-gray-500" : "text-primary-900"}`}>
                {t("log_desc")}
              </p> */}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Banner;
