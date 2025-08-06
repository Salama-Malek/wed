import { useTranslation } from "react-i18next";

export const useTabs = (): string[] => {
  const { t } = useTranslation("stepper");
  return [
    t("tabs.plaintiffDetails"),
    t("tabs.defendantDetails"),
    t("tabs.workDetails"),
  ];
};

export interface Step {
  title: string;
  description: string;
}

export const steps: Step[] = [
  {
    title: "Hearing details",
    description: "Basic information and details of the hearing",
  },
  { title: "Hearing topics", description: "Add topics related to the hearing" },
  {
    title: "Review and confirm",
    description: "Review the hearing details and confirm the acknowledgment",
  },
];
