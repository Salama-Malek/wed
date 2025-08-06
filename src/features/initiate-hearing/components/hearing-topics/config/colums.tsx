import { ColumnDef } from "@tanstack/react-table";
import Button from "@/shared/components/button";
import { Topic } from "../hearing.topics.types";
import { useTranslation } from "react-i18next";

interface HearingTopicsColumnsProps {
  t: (key: string) => string;
  onEdit: (topic: Topic, index: number) => void;
  onDel: (topic: Topic, index: number) => void;
}

export const getHearingTopicsColumns = ({
  t,
  onEdit,
  onDel,
}: HearingTopicsColumnsProps): ColumnDef<Topic>[] => [
  {
    id: "no",
    header: t("no."),
    cell: ({ row }) => row.index + 1,
  },
  {
    id: "mainCategory",
    header: t("mainCategory"),
    accessorKey: "mainCategory",
    cell: ({ row }) => {
      const value: any = row.original.mainCategory;
      if (typeof value === "object" && value !== null) {
        return value.label || value.value || "";
      }
      return value || "";
    },
  },
  {
    id: "subCategory",
    header: t("subCategory"),
    accessorKey: "subCategory",
    cell: ({ row }) => {
      const value: any = row.original.subCategory;
      if (typeof value === "object" && value !== null) {
        return value.label || value.value || "";
      }
      return value || "";
    },
  },
  {
    id: "actions",
    header: t("actions"),
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button
          variant="secondary"
          typeVariant="outline"
          size="xs"
          type="button"
          onClick={() => onEdit(row.original, row.index)}
        >
          {t("edit")}
        </Button>
        <Button
          onClick={() => onDel(row.original, row.index)}
          variant="secondary"
          typeVariant="outline"
          size="xs"
          type="button"
        >
          {t("delete")}
        </Button>
      </div>
    ),
  },
];
