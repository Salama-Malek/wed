import React, { useCallback, memo } from "react";
import { useTranslation } from "react-i18next";
import Button from "@/shared/components/button";

interface Props {
  auditIcon: string;
  toggle: () => void;
}

const HearingCta: React.FC<Props> = memo(({ auditIcon, toggle }) => {
  const { t } = useTranslation("hearingtopics");

  const noHearingTopicsText = t("no_hearing_topics") || "No hearing topics associated with the hearing.";
  const addTopicText = t("add_topic") || "Add Topic";

  const handleClick = useCallback(() => {
    toggle();
  }, [toggle]);

  return (
    <div className="my-6 flex flex-col items-center justify-center h-full min-h-96 p-6">
      <div className="rounded-full w-80 h-80 bg-gray-980 opacity-50 d-center mb-5">
        <img
          src={auditIcon}
          alt="No hearing topics"
          className="w-[171px] h-[171px]"
          loading="lazy" 
        />
      </div>
      <p className="!leading-8 text-md font-semibold text-center mb-12">
        {noHearingTopicsText}
      </p>

      <Button
        variant="primary"
        size="md"
        onClick={handleClick}
        type="button"
        className="text-md font-medium leading-[24px]"
      >
        {addTopicText}
      </Button>
    </div>
  );
});

HearingCta.displayName = "HearingCta"; 

export default React.memo(HearingCta);