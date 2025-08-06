import React from "react";
import { useTranslation } from "react-i18next";

const statusStyles: Record<string, { text: string; dot: string; bg: string }> =
  {
    // green
    completed: {
      text: "text-success-700",
      dot: "bg-success-700",
      bg: "bg-success-50 flex items-center",
    },
    resolved_agreement_reached: {
      text: "text-success-700",
      dot: "bg-success-700",
      bg: "bg-success-50 flex items-center",
    },
    resolved_agreementci: {
      text: "text-success-700",
      dot: "bg-success-700",
      bg: "bg-success-50 flex items-center",
    },
    // blue
    "Resolved-Save the case": {
      text: "text-info-800",
      dot: "bg-info-800",
      bg: "bg-info-980 flex items-center",
    },
    resolved_save_the_case: {
      text: "text-info-800",
      dot: "bg-info-800",
      bg: "bg-info-980 flex items-center",
    },
    resolved_defendant_didnot_attend: {
      text: "text-info-800",
      dot: "bg-info-800",
      bg: "bg-info-980 flex items-center",
    },
    Resolved_Waived: {
      text: "text-info-800",
      dot: "bg-info-800",
      bg: "bg-info-980 flex items-center",
    },
    incomplete: {
      text: "text-info-800",
      dot: "bg-info-800",
      bg: "bg-info-980 flex items-center",
    },
    resolved_applicant_didnot_attend: {
      text: "text-info-800",
      dot: "bg-info-800",
      bg: "bg-info-980 flex items-center",
    },
    // warning
    under_negotiations: {
      text: "text-warning-700",
      dot: "bg-warning-700",
      bg: "bg-warning-50",
    },
    resolved_rejected: {
      text: "text-error-700",
      dot: "bg-error-700",
      bg: "bg-error-100 flex items-center",
    },
    under_negotiationsci: {
      text: "text-warning-700",
      dot: "bg-warning-700",
      bg: "bg-warning-50",
    },
    under_awaitingapproval: {
      text: "text-warning-700",
      dot: "bg-warning-700",
      bg: "bg-warning-50",
    },
    under_awaitingapproval_ci: {
      text: "text-warning-700",
      dot: "bg-warning-700",
      bg: "bg-warning-50",
    },
    under_investigation: {
      text: "text-warning-700",
      dot: "bg-warning-700",
      bg: "bg-warning-50",
    },

    resolved_no_agreement: {
      text: "text-warning-700",
      dot: "bg-warning-700",
      bg: "bg-warning-50",
    },
    resolved_request_cancelled: {
      text: "text-warning-700",
      dot: "bg-warning-700",
      bg: "bg-warning-50",
    },
    resolved_waived: {
      text: "text-warning-700",
      dot: "bg-warning-700",
      bg: "bg-warning-50",
    },
    resolved_defendant_notattendci: {
      text: "text-warning-700",
      dot: "bg-warning-700",
      bg: "bg-warning-50",
    },
    resolved_noagreementci: {
      text: "text-warning-700",
      dot: "bg-warning-700",
      bg: "bg-warning-50",
    },
  };

interface StatusBadgeProps {
  status: string;
  status_code: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status_code, status }) => {
  // const { t } = useTranslation("managehearings");

  return (
    <div
      className={`flex items-center justify-center ${statusStyles[status_code]?.bg} px-3 py-1 gap-2 rounded-full`}
    >
      <span
        className={`w-[10px] h-[10px] rounded-full ${statusStyles[status_code]?.dot}`}
      />
      <span
        className={`text-sm md:text-md medium  ${statusStyles[status_code]?.text}`}
      >
        {status}
      </span>
    </div>
  );
};

export default StatusBadge;
