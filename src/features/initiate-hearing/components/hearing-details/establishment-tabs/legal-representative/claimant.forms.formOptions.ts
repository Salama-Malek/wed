import { RadioOption } from "@/shared/components/form/RadioGroup";
import { useTranslation } from "react-i18next";

export const useLegalRepFormOptions = () => {
  const { t } = useTranslation("legal_rep");

  return {
    plaintiffTypeOptions: [
      { label: t("legal_rep_worker"), value: "leg_rep_worker" },
      { label: t("legal_representative"), value: "legal_representative" },
    ] as RadioOption[],
    AgentTypeOptions: [
      { label: t("localAgency"), value: "local_agency" },
      { label: t("externalAgency"), value: "external_agency" },
    ] as RadioOption[],
  };
};
