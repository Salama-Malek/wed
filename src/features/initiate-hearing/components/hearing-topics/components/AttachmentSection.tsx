import { Suspense } from "react";
import Button from "@/shared/components/button";
import { Add01Icon } from "hugeicons-react";
import TableLoader from "@/shared/components/loader/TableLoader";
import { FileAttachment as FileAttachmentType } from "@/shared/components/form/form.types";
import FileAttachment from "@/shared/components/ui/file-attachment/FileAttachment";
import { useTranslation } from "react-i18next";

interface Props {
  attachments: FileAttachmentType[];
  onAddClick: () => void;
  onRemove: (attachment: FileAttachmentType, index: number) => void;
  onView?: (attachment: FileAttachmentType) => void;
}

const AttachmentSection: React.FC<Props> = ({ attachments, onAddClick, onRemove, onView }) => {
  
  const { t } = useTranslation("hearingtopics");

  return (
    <div className="mx-4">
      <h2 className="text-primary-600 font-semibold text-md leading-6 font-primary mb-7xl">


        {t("attachments") || "Attachments"}
      </h2>

      <div className="mb-6">
        <Button 
          type="button"
          variant="primary" 
          size="xs" 
          onClick={onAddClick}
        >
          <Add01Icon size={20} /> {t("add_attachments") || "Add Attachments"}
        </Button>
      </div>

      {attachments.length > 0 && (
        <>
          <h3 className="text-primary-600 font-semibold text-md leading-6 font-primary mb-7xl">

            {t("attached_files") || "Attached Files"}
          </h3>
          <div className="space-y-6 mb-6  max-h-64 overflow-y-auto pr-2">
            {attachments.map((att, idx) => (
              <Suspense fallback={<TableLoader />} key={`${att.fileName}-${idx}`}>
                <FileAttachment
                  fileName={`${att.fileName || t("attachment")} - ${att.file?.name || t("unnamed_file")}`}
                  onRemove={() => onRemove(att, idx)}
                  onView={onView ? () => { console.log('AttachmentSection onView:', att); onView(att); } : undefined}
                />
              </Suspense>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AttachmentSection;
