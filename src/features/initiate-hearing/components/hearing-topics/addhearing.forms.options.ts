import { Option } from "@/shared/components/form/form.types";
import { RadioOption } from "@/shared/components/form/RadioGroup";
import { useTranslation } from "react-i18next";

export const useFormOptions = ({ t }: any) => {
  return {    
    doesBylawsIncludeAddingAccommodationsOptions: [
      { value: "law_yes", label: "Yes" },
      { value: "law_no", label: "No" },
    ] as Option[],
  };
};