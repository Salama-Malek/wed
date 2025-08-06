import { UserIcon, Building05Icon } from "hugeicons-react";
import { useTranslation } from "react-i18next";
import Button from "@/shared/components/button";
import { lazy, Suspense, useEffect, useState } from "react"; // Added useState and useEffect
import TableLoader from "@/shared/components/loader/TableLoader";
import { useNavigate } from "react-router-dom";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import { useUserType } from "@/providers/UserTypeContext";
import { useUser } from "@/shared/context/userTypeContext";
import { useLazyGetCaseCountQuery, useLazyGetMySchedulesQuery, useLazySaveUINotificationQuery } from "@/features/dashboard/api/api";

const LegalEntitySelection = lazy(
  () => import("@/shared/components/ui/legal-entity-selection")
);

interface CaseRecordsModalProps {
  popupHandler: () => void;
  selected: string | null;
  setSelected: (value: string | null) => void;
  selectedOption: { value: string; label: string } | null | string;
  handleChange: (
    option: { value: string; label: string } | null | string
  ) => void;
  handleCloseModal: () => void;
  isLegalRep?: boolean;
  userSetCookie?: any;
}

const CaseRecordsModal = ({
  selected: propSelected,
  setSelected: propSetSelected,
  selectedOption,
  handleChange,
  handleCloseModal,
  popupHandler,
  isLegalRep,
  userSetCookie,
}: CaseRecordsModalProps) => {
  const { setUserType } = useUserType();
  const {
    setSelected: setSelectedUser,
    selected: selectedUser,
    setUserType: setUserTypeContext,
    userType: userTypeContext,
    setIsMenueCahngeFlag,
    isMenueCahngeFlag
  } = useUser();
  const navigate = useNavigate();
  const { t } = useTranslation("login");
  const [getCookie, setCookie] = useCookieState({
    mainCategory: null,
    subCategory: null,
  });
  const hasSeenLegalRepModal = getCookie("hasSeenLegalRepModal");
  const userClaims = getCookie("userClaims");

  const [selectedMainCategory, setSelectedMainCategory] = useState<any | null>(
    getCookie("mainCategory")
  );
  const [selectedSubCategory, setSelectedSubCategory] = useState<any | null>(
    getCookie("subCategory")
  );


  useEffect(() => {
    setCookie("mainCategory", selectedMainCategory);
    setCookie("subCategory", selectedSubCategory);
  }, [selectedMainCategory, selectedSubCategory]);

  const [localSelected, setLocalSelected] = useState<string | null>(
    propSelected
  );

  useEffect(() => {
    setLocalSelected(propSelected);
  }, [propSelected, localSelected]);

  const loginOptions = [
    {
      type: "Worker",
      icon: <UserIcon className="w-6 h-6 text-gray-700 mt-[31.5px]" />,
      label: t("worker"),
      description: t("worker_desc"),
    },
    {
      type: "Legal representative",
      icon: <Building05Icon className="w-6 h-6 text-gray-700 mt-[31.5px]" />,
      label: t("legal_representative"),
      description: t("legal_desc"),
    },
  ];





  const handleContinue = () => {

    // here i want to add flage to detect if the user is cahnging the menue and sub menue
    // how this condtion work :
    // if the user from the begining is legal representative and the user type is also legal representative
    // and open the module and change the mian menu and sub menu and click on continue button
    // then the condition will be true and the fetchAllRequiredData will be called
    // يعني بالعربي لو هو فعلا كام ممثل قانوني وفتح الموديول وكان مغير القوائم هيبدا ينادي 
    // الapis الخاصة بالكتيجور يالمطلوبة 
    // hasSeenLegalRepModal علشان ما ينهدهاش اول مرة لا اللويجك صح في الاول 
    if (localSelected === "Legal representative" &&
      userTypeContext === "Legal representative" &&
      hasSeenLegalRepModal === "true" &&
      selectedMainCategory
      && selectedSubCategory) {

      setIsMenueCahngeFlag(!isMenueCahngeFlag);
    }
    const existingCaseId = getCookie("caseId");
    if (existingCaseId) {
      setCookie("caseId", "");
    }

    setCookie("userType", localSelected);
    setCookie("selectedUserType", localSelected);

    // Preserve original user type if not already set
    const originalUserType = getCookie("originalUserType");
    const storedUserTypeData = getCookie("storeAllUserTypeData");
    
    // Check if user has legal representative capabilities from API response
    const hasLegalRepCapability = storedUserTypeData?.UserTypeList?.some(
      (userType: any) => userType.UserType === "Legal representative"
    );
    
    if (!originalUserType && hasLegalRepCapability) {
      setCookie("originalUserType", "Legal representative");
    }

    // Set the selected user type
    if (localSelected === "Legal representative") {
      setSelectedUser("legal_representative");
      setUserTypeContext("Legal representative");
    } else {
      setSelectedUser("leg_rep_worker");
      setUserTypeContext("Worker");
    }

    // Store the selected type in a separate cookie
    handleCloseModal();

    // Navigate to home page
    navigate("/");

    // only fire the global popupHandler *after* they chose Legal
    if (localSelected === "Legal representative") {
      popupHandler();
    }
  };

  const handleSelection = (type: string) => {

    setUserType(type);

    setLocalSelected(type);
    propSetSelected(type);
  };







  return (
    <div className="w-full space-y-4">
      <h2 className="text-el semibold text-gray-800">{t("login")}</h2>
      <p className="text-gray-500 text-sm28">{t("login_desc")}</p>

      <div className="grid grid-cols-2 gap-8 px-[9px]">
        {loginOptions.map((option) => (
          <div
            key={option.type}
            className={`border rounded-sl px-2 cursor-pointer pb-8 ${localSelected === option.type
              ? "border-primary-600 bg-primary-50"
              : "border-gray-400"
              }`}
            onClick={() => handleSelection(option.type)}
          >
            <div className="flex flex-col items-center">
              <span className="text-2xl">{option.icon}</span>
              <h3 className="text-md medium mt-2">{option.label}</h3>
              <p className="text-sm8 text-center mt-2 normal">
                {option.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {localSelected === "Legal representative" && (
        <Suspense fallback={<TableLoader />}>
          <LegalEntitySelection
            selectedMainCategory={selectedMainCategory}
            setSelectedMainCategory={setSelectedMainCategory}
            selectedSubCategory={selectedSubCategory}
            setSelectedSubCategory={setSelectedSubCategory}
            isLegalRep={isLegalRep}
          />
        </Suspense>
      )}

      <div className="flex justify-end">
        <Button
          typeVariant={
            propSelected === "Legal representative" &&
              !selectedSubCategory?.value
              ? "freeze"
              : "solid"
          }
          size="xs20"
          onClick={handleContinue}
          variant={
            propSelected === "Legal representative" &&
              !selectedSubCategory?.value
              ? "freeze"
              : "solid"
          }
          disabled={
            propSelected === "Legal representative" &&
            !selectedSubCategory?.value
          }
        >
          {t("continue")}
        </Button>
      </div>
    </div>
  );
};

export default CaseRecordsModal;