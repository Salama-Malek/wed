import React from "react";
import { useTranslation } from "react-i18next";
import Modal from "@/shared/components/modal/Modal";
import Button from "@/shared/components/button";
import { useNavigate } from "react-router-dom";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";

interface CaseInfoItem {
  RequestDate: string;
  PlaintiffName: string;
  CaseNumber: string;
  pyMessage: string;
  PlaintiffId: string;
}

interface IncompleteCaseData {
  CaseInfo: CaseInfoItem[];
  ServiceStatus: string;
  SuccessCode: string;
  ErrorCodeList: unknown[];
}

interface IncompleteCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  incompleteCaseData: IncompleteCaseData;
}

const IncompleteCaseModal: React.FC<IncompleteCaseModalProps> = ({
  isOpen,
  onClose,
  incompleteCaseData,
}) => {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const [getCookie, setCookie] = useCookieState();

  // Grab the first CaseInfo entry (if it exists)
  const firstCase = incompleteCaseData.CaseInfo[0];
  const caseNumber = firstCase?.CaseNumber || "";
  const rawMessage = firstCase?.pyMessage || "";

  // Render the API‐provided message, but split out the caseNumber to be clickable
  const renderMessage = () => {
    if (!rawMessage || !caseNumber || !rawMessage.includes(caseNumber)) {
      return <span>{rawMessage}</span>;
    }

    // Split on the first occurrence of caseNumber
    const [before, after] = rawMessage.split(caseNumber);
    return (
      <>
        {before}
        <button
          type="button"
          onClick={() => {
            navigate(`/manage-hearings/${caseNumber}`);
            onClose();
          }}
          className="text-primary-700 underline hover:no-underline bg-transparent p-0"
        >
          {caseNumber}
        </button>
        {after}
      </>
    );
  };

  // "No" simply closes the modal
  const handleNo = () => {
    onClose();
  };

  // "Yes" navigates to complete‐case then closes
  const handleYes = () => {
    if (!caseNumber) {
      onClose();
      return;
    }
    // Store the case ID in cookies for the case creation flow to use
    setCookie("caseId", caseNumber);
    // Reset navigation to the first step and tab
    localStorage.setItem("step", "0");
    localStorage.setItem("tab", "0");
    // Navigate to the case creation flow
    navigate("/initiate-hearing/case-creation");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal close={onClose} header={t("incomplete_case.title")} modalWidth={500}>
      <div className="space-y-6">
        <p className="text-sm text-gray-700">{renderMessage()}</p>

        <div className="flex justify-between gap-3">
          <Button variant="secondary" onClick={handleNo}>
            {t("incomplete_case.no")}
          </Button>

          <Button
            variant="primary"
            onClick={handleYes}
            className="bg-green-600 hover:bg-green-700"
          >
            {t("incomplete_case.yes")}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default IncompleteCaseModal;
