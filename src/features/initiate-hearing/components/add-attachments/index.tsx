import { useState, lazy, Suspense } from "react";
import Button from "@/shared/components/button";
import { Section } from "@/shared/layouts/Section";
import { Add01Icon } from "hugeicons-react";
import TableLoader from "@/shared/components/loader/TableLoader";
import { useTranslation } from "react-i18next";
import { FileAttachment } from "@/shared/components/form/form.types";
import FormActionButtons from "@/shared/components/ui/footer-buttons";
import FilePreviewModal from "./FilePreviewModal";
import { useRemoveAttachmentMutation } from "../hearing-topics/api/apis";

const Modal = lazy(() => import("@/shared/components/modal/Modal"));
const FileAttachmentUI = lazy(
  () => import("@/shared/components/ui/file-attachment/FileAttachment")
);
const FileUpload = lazy(
  () => import("./FileUpload")
);

interface AddAttachmentProps {
  onFileSelect?: (fileData: FileAttachment) => void;
  selectedFile?: FileAttachment | null;
}

const AddAttachment = ({ onFileSelect }: AddAttachmentProps) => {
  const { t } = useTranslation("hearingdetails");
  const [isOpen, setIsOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [pendingFile, setPendingFile] = useState<File[]>([]);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [removeAttachment] = useRemoveAttachmentMutation();

  const handleToggle = () => {
    if (uploadedFiles.length <= 0) {
      setIsOpen(true);
    }
  };

  const handleFileUpload = (files: File[]) => {
    setPendingFile(files);
  };

  const handleSave = () => {
    if (pendingFile.length === 0) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result?.toString().split(",")[1] || null;
      const fileData: FileAttachment = {
        file: pendingFile[0],
        base64: base64,
        fileName: pendingFile[0].name,
        fileType: pendingFile[0].type,
      };

      onFileSelect?.(fileData);
      setUploadedFiles(pendingFile);
      setPendingFile([]);
      setIsOpen(false);
    };
    reader.readAsDataURL(pendingFile[0]);
  };

  const handleCancel = () => {
    setUploadedFiles([]);
    setPendingFile([]);
    setIsOpen(false);
  };

  const removeView = () => {
    setPreviewFile(null);
    setUploadedFiles([]);
  };

  const fileView = () => {
    if (uploadedFiles[0]) {
      setPreviewFile(uploadedFiles[0]);
    }
  };

  // Type guard to check if file is a backend attachment
  function hasAttachmentKey(obj: any): obj is { FileKey?: string; attachmentKey?: string } {
    return (
      obj && (typeof obj.FileKey === 'string' || typeof obj.attachmentKey === 'string')
    );
  }

  const handleRemove = async () => {
    const file = uploadedFiles[0];
    // Only call the API if the file is a backend attachment
    if (hasAttachmentKey(file)) {
      try {
        await removeAttachment({
          AttachmentKey: file.FileKey || file.attachmentKey,
        });
      } catch (error) {
        // Optionally handle error (toast, etc.)
      }
    }
    const emptyFileData: FileAttachment = {
      classification: "",
      file: null,
      base64: null,
      fileName: "",
      fileType: "",
    };
    onFileSelect?.(emptyFileData);
    setUploadedFiles([]);
    setPreviewFile(null);
  };

  return (
    <div className="space-y-6">
      <p className="text-secondary-700 semibold">{t("attach_desc")}</p>
      <Section
        className="grid-cols-1 min-w-36 max-w-max"
        title={t("attach_title")}
      >
        <Button
          type="button"
          onClick={handleToggle}
          className={`$${uploadedFiles.length > 0 && "!mb-0"} w-44 justify-around`}
          variant={uploadedFiles.length <= 0 ? "primary" : "disabled"}
          size="xs"
          typeVariant={uploadedFiles.length <= 0 ? "brand" : "freeze"}
        >
          <Add01Icon size={22} color="white" />
          {t("add_btn")}
        </Button>

        {uploadedFiles.length > 0 && (
          <Section>
            {uploadedFiles.map((file, index) => (
              <Suspense key={index} fallback={<TableLoader />}>
                <FileAttachmentUI
                  isClaimant
                  onRemove={removeView}
                  onView={fileView}
                  fileName={file.name}
                />
              </Suspense>
            ))}
          </Section>
        )}

        {isOpen && (
          <Suspense fallback={<TableLoader />}>
            <Modal
              className="!max-h-max"
              header={t("add_attachment")}
              close={handleCancel}
              modalWidth={600}
            >
              <div className="space-y-4 w-full">
                <div className="grid grid-cols-2 gap-x-6">
                  <div className="col-span-2">
                    <Suspense fallback={<TableLoader />}>
                      <FileUpload
                        isMultiple={false}
                        onFileUpload={handleFileUpload}
                      />
                    </Suspense>
                  </div>
                </div>
                <FormActionButtons
                  onCancel={handleCancel}
                  onSave={handleSave}
                  cancelText={t("cancel")}
                  saveText={t("save")}
                  className="w-full"
                />
              </div>
            </Modal>
          </Suspense>
        )}
      </Section>

      <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
    </div>
  );
};

export default AddAttachment;
