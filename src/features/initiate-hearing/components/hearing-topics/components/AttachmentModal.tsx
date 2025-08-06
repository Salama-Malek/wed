import React, { useRef, useState, useCallback } from "react";
import { FileAttachment as FileAttachmentType } from "@/shared/components/form/form.types";
import { AutoCompleteField } from "@/shared/components/form/AutoComplete";
import Modal from "@/shared/components/modal/Modal";
import Button from "@/shared/components/button";
import FileAttachment from "@/shared/components/ui/file-attachment/FileAttachment";
import FilePreviewModal from "../../add-attachments/FilePreviewModal";
import { useUploadAttachmentsMutation, useWorkerAttachmentCategoriesQuery } from "../api/apis";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import TableLoader from "@/shared/components/loader/TableLoader";
import { useTranslation } from "react-i18next";
import { TokenClaims } from "@/features/login/components/AuthProvider";
import { toast } from "react-toastify";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/tiff'
];
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.tif', '.png'];

interface AttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (attachments: FileAttachmentType[]) => void;
}

interface FileWithMetadata {
  classificationLabel: string;
  classificationCode: string;
  file: File;
  fileType: string;
  fileName: string;
  base64: string;
}

const AttachmentModal: React.FC<AttachmentModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language.toUpperCase();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [classification, setClassification] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [getCookie] = useCookieState({ caseId: "" });
  const userClaims: TokenClaims = getCookie("userClaims");
  const userType = getCookie("userType");

  const { data: WorkerAttachmentCategories, isFetching } = useWorkerAttachmentCategoriesQuery(
    {
      ModuleKey: (userType === "Legal representative" || userType === "Establishment") ? "EstablishmentAttachmentCategories" : "WorkerAttachmentCategories",
      ModuleName: (userType === "Legal representative" || userType === "Establishment") ? "EstablishmentAttachmentCategories" : "WorkerAttachmentCategories",
      AcceptedLanguage: currentLanguage,
      SourceSystem: "E-Services"
    },
    { skip: !isOpen }
  );

  // Force re-render when language changes
  React.useEffect(() => {}, [i18n.language]);

  const WorkerAttachmentCategoriesOptions = React.useMemo(() => {
    return (
      WorkerAttachmentCategories?.DataElements?.map((item: any) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || []
    );
  }, [WorkerAttachmentCategories]);

  // console.log('Attachment Category Options:', WorkerAttachmentCategoriesOptions);

  const validateFile = (file: File): boolean => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error(t('attachments.errors.file_size', { name: file.name }));
      return false;
    }
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
        toast.error(t('attachments.errors.file_type', {
          name: file.name,
          types: ALLOWED_EXTENSIONS.join(', ')
        }));
        return false;
      }
    }
    return true;
  };

  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1] || "");
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }, []);

  const [uploadAttachments] = useUploadAttachmentsMutation();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    if (!classification) {
      toast.error(t('attachments.errors.select_classification'));
      return;
    }
    if (!validateFile(selectedFile)) {
      return;
    }
    setIsUploading(true);
    try {
      const base64 = await fileToBase64(selectedFile);
      const payload = {
        AcceptedLanguage: currentLanguage,
        SourceSystem: "E-Services",
        CaseID: getCookie("caseId"),
        IDNumber: userClaims.UserID,
        FileNumber: userClaims.File_Number,
        CaseAttachments: [{
          FileType: selectedFile.type.split('/').pop() || selectedFile.name.split('.').pop() || '',
          FileName: selectedFile.name,
          FileData: base64,
          AttachmentRequired: "true",
          AttachmentType: "CaseTopic",
          Attachmentdescription: classification.label || "",
          AttachmentCode: classification.value || "",
        }]
      };
      const res = await uploadAttachments(payload).unwrap();
      if (res.ServiceStatus === 'Fail' && Array.isArray(res.ErrorCodeList) && res.ErrorCodeList.length > 0) {
        // Do not show toast here; global error handler will handle it.
        return;
      }
      if (res.ServiceStatus === 'Success') {
        toast.success(t('attachments.upload_success') || 'Attachment uploaded successfully');
      }
      onSave([
        {
          classificationLabel: classification.label,
          classificationCode: classification.value,
          file: selectedFile,
          fileType: selectedFile.type,
          fileName: selectedFile.name,
          base64,
          attachmentKey: res?.AttachmentKey
        }
      ]);
      setClassification(null);
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || t('attachments.errors.upload_failed'));
    } finally {
      setIsUploading(false);
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const handleAddClick = () => {
    if (!classification) {
      toast.error(t('attachments.errors.select_classification'));
      return;
    }
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <>
      {isUploading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
          <TableLoader />
        </div>
      )}
      <Modal header={t('attachments.title')} close={onClose} modalWidth={600} preventOutsideClick={isUploading}>
        <div className={`space-y-6 w-full ${isUploading ? 'pointer-events-none opacity-50' : ''}`}>
          <div className="text-sm text-gray-500 mb-4">
            {t('attachments.allowed_files')}
          </div>
          <div className="grid grid-cols-3 gap-4 items-end">
            <div className="col-span-2">
              <AutoCompleteField
                label={t('attachments.classification')}
                name="fileClassification"
                isLoading={isFetching}
                options={WorkerAttachmentCategoriesOptions}
                value={classification}
                onChange={(selectedOption) => {
                  setClassification(
                    typeof selectedOption === "string" ? null : selectedOption
                  );
                  setError(null);
                }}
                disabled={isUploading}
                forcePortal={true}
              />
            </div>
            <div>
              <Button
                type="button"
                variant="primary"
                typeVariant="brand"
                size="sm"
                onClick={handleAddClick}
                className={!classification ? "opacity-50 cursor-not-allowed" : ""}
                disabled={!classification || isUploading}
              >
                {t('attachments.add_files')}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple={false}
                accept=".pdf,.jpg,.jpeg,.tif,.png,application/pdf,image/jpeg,image/png,image/tiff"
                onChange={handleFileSelect}
                disabled={isUploading}
              />
            </div>
          </div>
        </div>
        <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
      </Modal>
    </>
  );
};

export default AttachmentModal;

export const useAttachmentModal = () => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language.toUpperCase();

  return {
    uploadAttachment: (formData: FormData) => {
      formData.append("AcceptedLanguage", currentLanguage);
      formData.append("SourceSystem", "E-Services");
      return fetch("WeddiServices/V1/UploadAttachment", {
        method: "POST",
        body: formData,
      });
    },

    getAttachments: (params: Record<string, string>) => {
      const queryParams = new URLSearchParams({
        ...params,
        AcceptedLanguage: currentLanguage,
        SourceSystem: "E-Services",
      });
      return fetch(`WeddiServices/V1/Attachments?${queryParams.toString()}`);
    },
  };
};