import React from "react";
import { useTranslation } from "react-i18next";
import { Section } from "@/shared/layouts/Section";
import { AutoCompleteField } from "@/shared/components/form/AutoComplete";
import { CheckboxField } from "@/shared/components/form/Checkbox";

interface AcknowledgmentSectionProps {
  selectedLang: { label: string; value: string };
  onLangChange: (opt: { label: string; value: string }) => void;
  acknowledgements: { ElementValue: string }[];
  control: any;
}

const AcknowledgmentSection: React.FC<AcknowledgmentSectionProps> = ({
  selectedLang,
  onLangChange,
  acknowledgements,
  control,
}) => {
  const { t } = useTranslation("reviewdetails");

  return (
    <Section title={t("acknowledgment")} className="grid-cols-1 gap-6">
      <AutoCompleteField
        className="!w-80"
        options={[
          { label: "English", value: "EN" },
          { label: "Arabic", value: "AR" },
        ]}
        label={t("ack_lang")}
        value={selectedLang}
        onChange={(opt) => {
          if (opt && typeof opt !== "string") {
            onLangChange(opt);
          }
        }}
      />

      <div className="w-full space-y-4 tracking-wider">
        {acknowledgements.map((el, idx) => (
          <p key={idx}>{el.ElementValue}</p>
        ))}
      </div>

      <CheckboxField
        name="acknowledge"
        control={control}
        defaultValue={false}
        rules={{ required: t("ack_required") }}
        label={t("acknowledge_desc")}
      />
    </Section>
  );
};

export default AcknowledgmentSection;
