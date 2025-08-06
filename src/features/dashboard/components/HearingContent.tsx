import fileAr from "@/assets/files/Arabic.pdf";
import fileBe from "@/assets/files/Bengali.pdf";
import fileEn from "@/assets/files/English.pdf";
import fileIn from "@/assets/files/Indian.pdf";
import fileIndo from "@/assets/files/Indonesian.pdf";
import fileMe from "@/assets/files/Mehri.pdf";
import filePhi from "@/assets/files/Phlilipino.pdf";
import fileSri from "@/assets/files/Sri Lankan.pdf";
import fileUr from "@/assets/files/Urdu.pdf";
import fileUserGuideAr from "@/assets/files/userGuide_ar.pdf";
import { AuctionIcon, LegalDocument02Icon } from "hugeicons-react";
import { lazy, Suspense, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import HelpCenterSkeleton from "@/shared/components/loader/HelpCenterSkeleton";
import HearingCardSkeleton from "@/shared/components/loader/HearingCardSkeleton";
import CaseRecordsSkeleton from "@/shared/components/loader/CaseRecordsSkeleton";
import { useLazyGetIncompleteCaseQuery } from "../api/api";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import IncompleteCaseModal from "./IncompleteCaseModal";
import TableLoader from "@/shared/components/loader/TableLoader";
import { useUser } from "@/shared/context/userTypeContext";
import CaseRecordsModal from "@/features/login/components/LoginAccountSelect";
import StepperSkeleton from "@/shared/components/loader/StepperSkeleton";
import Modal from "@/shared/components/modal/Modal";
 
const HearingCards = lazy(() => import("./HearingCards"));
const HelpCenter = lazy(() => import("./HelpCenter"));
const CaseRecords = lazy(() => import("./CaseRecords"));
const Statistics = lazy(() => import("./Statistics"));
 
interface HearingContentProps {
  isEstablishment?: boolean;
  isLegalRep?: boolean;
  popupHandler: () => void;
}
 
export const languageOptions = [
  { value: "en", label: "English" },
  { value: "ar", label: "العربية" },
  { value: "in", label: "Indian" },
  { value: "be", label: "Bengali" },
  { value: "indo", label: "Indonesian" },
  { value: "me", label: "Mehri" },
  { value: "phi", label: "Philipino" },
  { value: "sri", label: "Sri Lankan" },
  { value: "ur", label: "Urdu" },
];
 
const HearingContent = ({
  isEstablishment,
  isLegalRep,
  popupHandler,
}: HearingContentProps) => {
  const { t, i18n } = useTranslation();
  const currentLanguage =
    i18n.language === "ar"
      ? { label: "Arabic", value: "ar" }
      : { label: "English", value: "en" };
 
  const [selectedOption, setSelectedOption] = useState(currentLanguage);
  const [hasActivityAlerts] = useState(false);
  const navigate = useNavigate();
  const [getCookie, setCookie] = useCookieState();
  const userClaims = getCookie("userClaims");
  const userType = getCookie("userType");
  const storeAllUserTypeData = getCookie("storeAllUserTypeData");
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  const [incompleteCaseNumber, setIncompleteCaseNumber] = useState("");
  const [incompleteCaseMessage, setIncompleteCaseMessage] = useState("");
  const [isCheckingIncomplete, setIsCheckingIncomplete] = useState(false);
  const { selected: selectedUser } = useUser();
  const [isUserClaimsReady, setIsUserClaimsReady] = useState(false);
  const mainCategory = getCookie("mainCategory")?.value;
  const subCategory = getCookie("subCategory")?.value;
  const hasSeenModal = getCookie("hasSeenLegalRepModal");
 
  // Wait for userClaims to be available
  useEffect(() => {
    if (userClaims?.UserID) {
      setIsUserClaimsReady(true);
    }
  }, [userClaims]);
 
 
  const [triggerIncompleteCase, { data: incompleteCase }] =
    useLazyGetIncompleteCaseQuery();
 
  useEffect(() => {
    if (incompleteCase?.CaseInfo?.length) {
      const caseInfo = incompleteCase.CaseInfo[0];
      setIncompleteCaseNumber(caseInfo.CaseNumber);
      setIncompleteCaseMessage(caseInfo.pyMessage || "");
 
      // ✅ Save both the case ID and full CaseInfo for future usage
      setCookie("caseId", caseInfo.CaseNumber);
      setCookie("incompleteCase", caseInfo); // ← Add this line
    }
  }, [incompleteCase, setCookie]);
 
 
  const fileData = {
    duties: {
      en: {
        name: "The rights and duties document in Saudi Labor Law",
        size: "2.25 MB",
        date: "10 Mar 2024",
        url: fileEn,
        lang: "English",
      },
      ar: {
        name: "وثيقة الحقوق والواجبات في قانون العمل السعودي",
        size: "2.33 MB",
        date: "10 Mar 2024",
        url: fileAr,
        lang: "Arabic",
      },
      in: {
        name: "सऊदी श्रम कानून में अधिकार और कर्तव्य दस्तावेज़",
        size: "1.86 MB",
        date: "10 Mar 2024",
        url: fileIn,
        lang: "Indian",
      },
      be: {
        name: "সৌদি শ্রম আইনে অধিকার ও দায়িত্বের দলিল",
        size: "1.92 MB",
        date: "10 Mar 2024",
        url: fileBe,
        lang: "Bengali",
      },
      indo: {
        name: "Dokumen hak dan kewajiban dalam Hukum Ketenagakerjaan Saudi",
        size: "1.83 MB",
        date: "10 Mar 2024",
        url: fileIndo,
        lang: "Indonesian",
      },
      me: {
        name: "ورقة الحقوق والواجبات في قانون العمل السعودي",
        size: "1.90 MB",
        date: "10 Mar 2024",
        url: fileMe,
        lang: "Mehri",
      },
      phi: {
        name: "Dokumento ng mga karapatan at tungkulin sa Saudi Labor Law",
        size: "1.83 MB",
        date: "10 Mar 2024",
        url: filePhi,
        lang: "Philipino",
      },
      sri: {
        name: "සවුදි රැකියා නීතියේ අයිතිවාසිකම් සහ යුතුකම් පත්‍රිකාව",
        size: "1.92 MB",
        date: "10 Mar 2024",
        url: fileSri,
        lang: "Sri Lankan",
      },
      ur: {
        name: "سعودی لیبر لاء میں حقوق و فرائض کا دستاویز",
        size: "1.92 MB",
        date: "10 Mar 2024",
        url: fileUr,
        lang: "Urdu",
      },
    },
    // userGuide: {
    //   en: {
    //     name: "User Guide",
    //     size: "2.25 MB",
    //     date: "10 Mar 2024",
    //     url: fileUserGuideAr,
    //     lang: "English",
    //   },
    //   ar: {
    //     name: "دليل المستخدم",
    //     size: "2.33 MB",
    //     date: "10 Mar 2024",
    //     url: fileUserGuideAr,
    //     lang: "Arabic",
    //   },
    // },
  };
  const cardData = [
    {
      id: 1,
      icon: (
        <AuctionIcon
          size={22}
          className="text-primary-600 transform scale-x-[-1]"
        />
      ),
      title: t("new_hearing"),
      description: t("new_hearing_desc"),
      footerText: t("Start_service"),
      isHearing: "hearing",
    },
    {
      id: 2,
      isHearingManage: "manage",
      icon: <LegalDocument02Icon size={22} className="text-primary-600" />,
      title: t("Hearings_management"),
      description: t("Hearings_management_desc"),
      footerText: t("Start_service"),
    },
  ];
  const handleRedirect = (isHearing?: string, isHearingManage?: string) => {
    if (isHearing === "hearing") {
      if (!isUserClaimsReady) {
        toast.error(t("error.userClaimsNotAvailable"));
        return;
      }
      setIsCheckingIncomplete(true);
      // Check for incomplete case only when starting a new hearing
      const govRepDetails = storeAllUserTypeData?.GovRepDetails?.[0];
      const selectedUserType = getCookie("selectedUserType");

      // For Legal representative users, check if they have made their selections
      if (userType === "Legal representative") {
        // If user hasn't selected their role yet, show error
        if (!selectedUserType) {
          toast.error(t("error.pleaseSelectUserType"));
          setIsCheckingIncomplete(false);
          return;
        }
        
        // If user selected Legal representative but hasn't selected main/sub categories, show error
        if (selectedUserType === "Legal representative" && (!mainCategory || !subCategory)) {
          toast.error(t("error.pleaseSelectCategories"));
          setIsCheckingIncomplete(false);
          return;
        }
        
        // If user selected Worker, use Worker configuration
        if (selectedUserType === "Worker") {
          triggerIncompleteCase({
            UserType: "Worker",
            IDNumber: userClaims?.UserID,
            SourceSystem: "E-Services",
            AcceptedLanguage: i18n.language.toUpperCase(),
          }).then(handleIncompleteCaseResponse);
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
        },
        "Legal representative": {
          UserType: userType,
          IDNumber: userClaims?.UserID,
          MainGovernment: mainCategory || "",
          SubGovernment: subCategory || "",
        },
      };
 
      triggerIncompleteCase({
        ...userConfigs[userType],
        SourceSystem: "E-Services",
        AcceptedLanguage: i18n.language.toUpperCase(),
      }).then(handleIncompleteCaseResponse);
    } else if (isHearingManage === "manage") {
      navigate("/manage-hearings", { replace: true });
    }
  };

  const handleIncompleteCaseResponse = (result: {
    data?: {
      CaseInfo?: Array<{ CaseNumber: string; pyMessage?: string }>;
    };
  }) => {
    setIsCheckingIncomplete(false);
    if (result.data?.CaseInfo?.length) {
      setShowIncompleteModal(true);
    } else {
      // Initialize local storage before navigation
      localStorage.setItem("step", "0");
      localStorage.setItem("tab", "0");
      navigate("/initiate-hearing/case-creation", { replace: true });
    }
  };
 
  const handleProceedToCase = () => {
    setShowIncompleteModal(false);
    navigate(`/manage-hearings/${incompleteCaseNumber}`);
  };
 
  const handleCloseModal = () => {
    setShowIncompleteModal(false);
  };
 
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedOptionMenu, setSelectedOptionMenu] = useState<
    { value: string; label: string } | null | string
  >(null);
  const handleChange = (
    selectedOption: { value: string; label: string } | null | string
  ) => {
    setSelectedOptionMenu(selectedOption);
  };
  // Modify the modal condition to check the cookie
 
 
  const handleCloseModalMenu = () => {
    setCookie("hasSeenLegalRepModal", "true");
    setIsModalOpen(false)
  };
 
  // علشان لو فيه حد من الموجودين يفتح المودال للمرة الاولى
  const shouldShowModal = userType === "Legal representative" &&
    isModalOpen &&
    !hasSeenModal;
 
  return (
    <main className=" w-full container">
      <section className="dashboard-grid">
        <div style={{ gridArea: "card" }}>
          <div>
            <Suspense fallback={<HearingCardSkeleton />}>
              <HearingCards
                cardData={cardData}
                handleRedirect={handleRedirect}
              />
            </Suspense>
          </div>
        </div>
 
        <div style={{ gridArea: "asid" }}>
          <div>
            <Suspense fallback={<CaseRecordsSkeleton />}>
              {userType === "Establishment" || userType === "Legal representative" || isEstablishment || selectedUser === "legal_representative" ? (
                <Statistics />
              ) : (
                <CaseRecords
                  isLegalRep={isLegalRep}
                  popupHandler={popupHandler}
                />
              )}
            </Suspense>
          </div>
        </div>
 
        <div style={{ gridArea: "table" }}>
          <div>
            <Suspense fallback={<HelpCenterSkeleton />}>
              <HelpCenter
                languageOptions={languageOptions}
                selectedOption={selectedOption}
                setSelectedOption={setSelectedOption}
                fileData={fileData}
                hasActivityAlerts={hasActivityAlerts}
              />
            </Suspense>
          </div>
        </div>
      </section>
 
      {showIncompleteModal && (
        <IncompleteCaseModal
          isOpen={showIncompleteModal}
          onClose={handleCloseModal}
          incompleteCaseData={incompleteCase}
        />
      )}
      {isCheckingIncomplete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <TableLoader />
        </div>
      )}
      {/* {isModalOpen && ( */}
      {shouldShowModal && (
        <Suspense fallback={<StepperSkeleton />}>
          <Modal
            className="!max-h-none !h-auto !overflow-visible"
            close={handleCloseModalMenu}
            modalWidth={600}
            preventOutsideClick={true}
          >
            <Suspense fallback={<StepperSkeleton />}>
              <CaseRecordsModal
                isLegalRep={isLegalRep}
                selected={selected}
                setSelected={setSelected}
                handleChange={(opt) => setSelected(opt as any)}
                handleCloseModal={handleCloseModalMenu}
                selectedOption={null}
                popupHandler={popupHandler}
              />
            </Suspense>
          </Modal>
        </Suspense>
      )}
    </main>
  );
};
 
export default HearingContent;