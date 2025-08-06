import BannerSkeleton from "@/shared/components/loader/BannerSkeleton";
import { lazy, Suspense, useState, useEffect } from "react";
import TableLoader from "@/shared/components/loader/TableLoader";
import AuthProvider from "../login/components/AuthProvider";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import { useUser } from "@/shared/context/userTypeContext";
import { AuthTokenProvider } from "@/providers/AuthTokenProvider";

const Banner = lazy(() => import("./components/HearingBanner"));
const HearingContent = lazy(() => import("./components/HearingContent"));

const Main = () => {
  // const [isEstablishment, setIsEstablishment] = useState(false);
  // const [isLegalRep, setIsLegalRep] = useState(false);
  const [showInfoBanner, setShowInfoBanner] = useState(false);
  const [getCookie] = useCookieState({});
  const {
    isLegalRep,
    isEstablishment,

    setLegelRepState,
    setEstablishmentState,
    setUserType
  } = useUser();





  const popupHandler = () => {
    const selectedUserType = getCookie("selectedUserType");


    // Only show banner if user selected "Legal representative" and clicked continue
    if (selectedUserType === "Legal representative") {
      setShowInfoBanner(true);
      setLegelRepState(true);
    } else {
      setShowInfoBanner(false);
      setLegelRepState(false);
    }
  };




  const handleCloseInfoBanner = () => {
    setShowInfoBanner(false);
  };

  return (
    <AuthProvider
      setIsLegalRep={setLegelRepState}
      setIsEstablishment={setEstablishmentState}
      setUserTypeState={setUserType}
    >
      <AuthTokenProvider>
        <main className="!space-y-[16px] bg-gray-100">
          <div className="container">
            <Suspense fallback={<BannerSkeleton />}>
              <Banner
                isLegalRep={isLegalRep}
                isEstablishment={isEstablishment}
                showInfoBanner={showInfoBanner}
                onCloseInfoBanner={handleCloseInfoBanner}
              />
            </Suspense>
          </div>
          <Suspense fallback={<TableLoader />}>
            <HearingContent
              isLegalRep={isLegalRep}
              isEstablishment={isEstablishment}
              popupHandler={popupHandler}
            />
          </Suspense>
        </main>
      </AuthTokenProvider>
    </AuthProvider>
  );
};

export default Main;
