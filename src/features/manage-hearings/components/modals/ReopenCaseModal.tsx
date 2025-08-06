import React from "react";
import { useTranslation } from "react-i18next";
import Modal from "@/shared/components/modal/Modal";
import Button from "@/shared/components/button";
import { CheckboxField } from "@/shared/components/form/Checkbox";
import { FormProvider, useForm } from "react-hook-form";

interface ReopenCaseModalProps {
  onClose: () => void;
  onSubmit: (reason: string) => void;
  statusCode: string;
}

const ReopenCaseModal: React.FC<ReopenCaseModalProps> = ({
  onClose,
  onSubmit,
  statusCode,
}) => {
  const { t } = useTranslation("manageHearingDetails");
  const [reason, setReason] = React.useState("");
  
  const methods = useForm({
    defaultValues: {
      acknowledge: false
    }
  });

  // Only these specific statuses require acknowledgment
  const acknowledgmentStatuses = [
    "Resolved-Applicant didnot attend",
    "Resolved-Save the case"
  ];

  const showAcknowledgment = acknowledgmentStatuses.includes(statusCode);
  const showReason = showAcknowledgment;
  const acknowledged = methods.watch("acknowledge");

  const isValid = (!showReason || reason.trim() !== "") && (!showAcknowledgment || acknowledged);

  const handleSubmit = () => {
    if (isValid) {
      onSubmit(reason.trim());
    }
  };

  return (
    <Modal header={t("reopen_case")} modalWidth={600} close={onClose}>
      <FormProvider {...methods}>
        <div className="space-y-4">
          {showReason && (
            <div>
              <label className="block font-medium text-sm mb-1">
                {t("reason_label")}
              </label>
              <textarea
                className="w-full border border-gray-300 rounded p-2 min-h-[100px] text-sm"
                placeholder={t("reason_placeholder")}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          )}

          {showAcknowledgment && (
            <>
              <div className="p-4 bg-gray-100 border border-gray-300 rounded text-sm leading-relaxed">
                {t("reopen_ack_text")}
              </div>

              <CheckboxField
                name="acknowledge"
                label={t("reopen_ack_checkbox")}
                notRequired
                wrapperClassName="!w-fit"
              />
            </>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={onClose}>
              {t("back")}
            </Button>
            <Button variant="primary" onClick={handleSubmit} disabled={!isValid}>
              {t("submit")}
            </Button>
          </div>
        </div>
      </FormProvider>
    </Modal>
  );
};

export default ReopenCaseModal;
