import { useTranslation } from "react-i18next";

export function truncateText(text: string, maxLength = 12) {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
}

export function getStatusClasses(status: string) {
  switch (status) {
    case "under_negotiation":
      return "bg-warning-50 text-warning-800";
    case "under_review":
      return "bg-info-50 text-info-800";
    case "rejected":
      return "bg-error-50 text-error-800";
    case "completed":
      return "bg-success-50 text-success-800";
    case "saved":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-500 text-white";
  }
}

interface StatusCellProps {
  status: "under_negotiation" | "under_review" | "rejected" | "completed" | "saved";
}

export function StatusCell({ status }: StatusCellProps) {
  const { t } = useTranslation("managehearings");
  const classes = getStatusClasses(status);

  return (
    <span
      className={`inline-flex items-center rounded-full text-sm semibold ${classes} px-[8px] py-[7px]`}
    >
      <span className="inline-block w-[10px] h-[10px] rounded-full bg-current mr-[8px]" />
      {t(`hearing_status.${status}`)}
    </span>
  );
}