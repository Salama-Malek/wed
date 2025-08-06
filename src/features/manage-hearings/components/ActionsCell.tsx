import { BsFillQuestionCircleFill } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import Button from "@/shared/components/button";
import { useTranslation } from "react-i18next";

interface ActionsCellProps {
  caseId: string;
  activeTab: "claimant" | "defendant";
  hearingStatus?: string;
  Reopen?: boolean;
  DownloadPDF?: boolean;
  ResendAppointment?: boolean;
  CancelCase?: boolean;
  UpdateCase?: boolean;
  
}

export function ActionsCell({
  caseId,
  activeTab,
}: ActionsCellProps) {
  const navigate = useNavigate();
  const { t } = useTranslation("managehearings");

  return (
    <div className="flex gap-x-2">
      <Button
        size="xs"
        variant="secondary"
        typeVariant="outline"
        onClick={() =>
          navigate(`/manage-hearings/${caseId}`, {
            state: { activeTab },
          })
        }
      >
        {t("actions.view")}
        <BsFillQuestionCircleFill className="ml-1 text-gray-700" />
      </Button>
    </div>
  );
}
