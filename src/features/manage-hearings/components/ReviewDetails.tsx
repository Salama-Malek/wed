import React from "react";
import { useTranslation } from "react-i18next";
import { CheckboxField } from "@/shared/components/form/Checkbox";

interface ReviewDetailsProps {
  hearing: any;
}

const ReviewDetails: React.FC<ReviewDetailsProps> = ({ hearing }) => {
  const { t } = useTranslation("manageHearingDetails");

  const agreement = hearing?.AgreementInfo;
  const hasAgreement = !!agreement?.AgreementText;

  if (!hasAgreement) {
    return (
      <div className="p-4 text-gray-600">
        {t("no_review_data_available") || "No review data available."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold mb-4 text-primary-600">
          {t("acknowledgment")}
        </h3>

        {/* Align checkbox and text to match the design */}
        <div className="flex items-start gap-4">
          
          <CheckboxField
            checked={agreement.AgreementSelected === "true"}
            disabled
            notRequired
            className="mt-1"
            //@ts-ignore
            name=""
            wrapperClassName="!w-fit"
          />

          <div className="w-full space-y-4 medium tracking-wider">
            {agreement.AgreementText}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewDetails;
