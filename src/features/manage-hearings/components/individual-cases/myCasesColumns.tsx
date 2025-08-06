import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";

import { CaseRecord } from "@/features/manage-hearings/types/myCases";
import StatusBadge from "../common/StatusBadge";
import { ActionsCell } from "../ActionsCell";
import { formatDate } from "@/utils/formatters";

export const useMyCasesColumns = (
  data: CaseRecord[],
  role: "claimant" | "defendant"
): ColumnDef<CaseRecord>[] => {
  const { t } = useTranslation("managehearings");
  const isDefendantView = role === "defendant";

  return useMemo(() => {
    const columns: ColumnDef<CaseRecord>[] = [
      {
        header: t("table_headers.request_number"),
        accessorKey: "CaseID",
      },
      {
        header: t("table_headers.case_number"),
        accessorKey: "SettlementID",
      },
      // {
      //   header: t("table_headers.code_700"),
      //   accessorKey: "Number700",
      // },
      // Temporarily commented out كود 700 (code 700) column as requested. Will be shown later.
    ];

    // Optional column: LegalRepName (for establishment/gov plaintiff cases)
    if (
      !isDefendantView &&
      Array.isArray(data) &&
      data.length > 0 &&
      "LegalRepName" in data[0] &&
      data[0].LegalRepName
    ) {
      columns.push({
        header: t("table_headers.legal_representative_name"),
        accessorKey: "LegalRepName",
      });
    }

    // Show the opposite party's name
    const otherPartyKey = isDefendantView ? "CasePlaintiffName" : "CaseDefendantName";
    const otherPartyHeader = isDefendantView
      ? t("table_headers.claimant_name")
      : t("table_headers.defendant_name");

    columns.push({
      id: `other-party-column-${role}`,
      header: otherPartyHeader,
      accessorKey: otherPartyKey,
    });

    columns.push(
      {
        header: t("table_headers.creation_date"),
        accessorKey: "CreateDate",
        cell: ({ row }) => formatDate(row.original.CreateDate),
      },
      {
        header: t("table_headers.session_date"),
        accessorKey: "SessionDayDate",
        cell: ({ row }) => formatDate(row.original.SessionDayDate || ""),
      },
      {
        header: t("table_headers.session_time"),
        accessorKey: "SessionTime",
      },
      {
        header: t("table_headers.case_status"),
        accessorKey: "WorkStatus",
        cell: ({ row }) => {
          const normalized =
            row.original.WorkStatus_Code?.toLowerCase().replace(/[-\s]/g, "_");
          return (
            <StatusBadge
              status={row.original.WorkStatus}
              status_code={normalized}
            />
          );
        },
      },
      {
        id: "actions",
        header: t("table_headers.actions"),
        cell: ({ row }) => {
          const original = row.original;
      
          return (
            <ActionsCell
              caseId={original.CaseID}
              hearingStatus={original.WorkStatus_Code}
              activeTab={role}
              Reopen={original.Reopen === "true"}
              DownloadPDF={original.DownloadPDF === "true"}
              ResendAppointment={original.ResendAppointment === "true"}
              CancelCase={original.CancelCase === "true"}
              UpdateCase={original.UpdateCase === "true"}
            />
          );
        },
      }
      
    );

    return columns;
  }, [data, role, t]);
};
