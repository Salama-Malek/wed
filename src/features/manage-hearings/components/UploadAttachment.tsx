import React, { useRef, useState, useCallback } from "react";
import { FileAttachment as FileAttachmentType } from "@/shared/components/form/form.types";
import { AutoCompleteField } from "@/shared/components/form/AutoComplete";
import Modal from "@/shared/components/modal/Modal";
import Button from "@/shared/components/button";
import FileAttachment from "@/shared/components/ui/file-attachment/FileAttachment";
import FilePreviewModal from "@/features/initiate-hearing/components/add-attachments/FilePreviewModal";
import { useUploadAttachmentMutation } from "../services/hearingTopicsService";
import { useWorkerAttachmentCategoriesQuery } from "../../initiate-hearing/components/hearing-topics/api/apis";
import { useParams } from "react-router-dom";
import TableLoader from "@/shared/components/loader/TableLoader";
import { useTranslation } from "react-i18next";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import { TokenClaims } from "@/features/login/components/AuthProvider";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/tiff",
];
const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".tif", ".png"];

const UploadAttachment: React.FC<{ onUploaded: () => void }> = ({
  onUploaded,
}) => {
  const { caseId } = useParams<{ caseId: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [classification, setClassification] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [files, setFiles] = useState<FileAttachmentType[]>([]);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [getCookie] = useCookieState({ caseId: "" });
  const { t } = useTranslation();

  const userClaims : TokenClaims = getCookie("userClaims");
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language.toUpperCase();

  const [uploadAttachment] = useUploadAttachmentMutation();
  const { data: categories } = useWorkerAttachmentCategoriesQuery(
    { AcceptedLanguage: currentLanguage, SourceSystem: "E-Services" },
    { skip: !caseId }
  );

  const classificationOptions =
    categories?.DataElements?.map((item: any) => ({
      value: item.ElementKey,
      label: item.ElementValue,
    })) || [];

  const validateFile = (file: File): boolean => {
    if (file.size > MAX_FILE_SIZE) {
      setError(t('attachments.errors.file_size', { name: file.name }));
      return false;
    }

    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (
      !ALLOWED_FILE_TYPES.includes(file.type) &&
      !ALLOWED_EXTENSIONS.includes(ext)
    ) {
      setError(t('attachments.errors.file_type', { 
        name: file.name,
        types: ALLOWED_EXTENSIONS.join(', ')
      }));
      return false;
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

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setError(null);
    const selectedFiles = Array.from(event.target.files || []);

    if (!classification) {
      setError(t('attachments.errors.select_classification'));
      return;
    }

    try {
      const validFiles = selectedFiles.filter(validateFile);
      if (validFiles.length === 0) return;

      const newAttachments = await Promise.all(
        validFiles.map(async (file) => ({
          classificationLabel: classification.label,
          classificationCode: classification.value,
          file,
          fileType: file.type,
          fileName: file.name,
          base64: await fileToBase64(file),
        }))
      );

      setFiles((prev) => [...prev, ...newAttachments]);
      setClassification(null);
    } catch {
      setError(t('attachments.errors.process_failed'));
    } finally {
      if (event.target) event.target.value = "";
    }
  };

  const handleRemove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!files.length || !caseId) {
      setError(t('attachments.errors.add_file'));
      return;
    }

    const payload = {
      AcceptedLanguage: currentLanguage,
      SourceSystem: "E-Services",
      CaseID: caseId,
      IDNumber: userClaims.UserID,
      FileNumber:userClaims.File_Number,
      CaseAttachments: files
        .filter((file) => file.file !== null)
        .map((file) => ({
          FileType: file.file!.type.split("/").pop() || file.file!.name.split(".").pop() || '',
          FileName: file.file!.name,
          FileData: file.base64 || "",
          AttachmentRequired: "true",
          AttachmentType: "CaseTopic",
          Attachmentdescription: file.classificationLabel || "",
          AttachmentCode: file.classificationCode || "",
        }))
    };

    try {
      setUploading(true);
      await uploadAttachment(payload).unwrap();
      setFiles([]);
      setClassification(null);
      onUploaded();
    } catch {
      setError(t('attachments.errors.upload_failed'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Button 
        type="button"
        variant="primary" 
        onClick={() => setFiles([])}
      >
        {t('attachments.title')}
      </Button>
      <Modal
        header={t('attachments.title')}
        modalWidth={600}
        close={() => setFiles([])}
      >
        <div className="space-y-6 w-full">
          <div className="text-sm text-gray-500 mb-4">
            {t('attachments.allowed_files')}
          </div>

          <div className="grid grid-cols-3 gap-4 items-end">
            <div className="col-span-2">
              <AutoCompleteField
                label={t('attachments.classification')}
                name="classification"
                options={classificationOptions}
                value={classification}
                onChange={(val) => {
                  setClassification(typeof val === "string" ? null : val);
                  setError(null);
                }}
              />
            </div>
            <div>
              <Button
                type="button"
                variant="primary"
                typeVariant="brand"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={!classification}
              >
                {t('attachments.add_files')}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple ={false}
                accept={ALLOWED_FILE_TYPES.join(",")}
                onChange={handleFileSelect}
              />
            </div>
          </div>

          {files.length > 0 && (
            <div className="max-h-52 overflow-y-auto space-y-2 pr-2">
              {files.map(
                (file, index) =>
                  file.file && (
                    <FileAttachment
                      key={`${file.fileName}-${index}`}
                      fileName={`${file.classificationLabel || "No Label"} - ${
                        file.file.name
                      }`}
                      fileSize={`${(file.file.size / (1024 * 1024)).toFixed(
                        2
                      )} MB`}
                      onView={() => setPreviewFile(file.file)}
                      onRemove={() => handleRemove(index)}
                    />
                  )
              )}
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="secondary"
              typeVariant="outline"
              size="sm"
              onClick={() => setFiles([])}
            >
              {t('attachments.cancel')}
            </Button>
            <Button
              type="button"
              variant="primary"
              typeVariant="brand"
              size="sm"
              onClick={handleUpload}
              disabled={!files.length || uploading}
            >
              {uploading ? (
                <>
                  <span>{t('attachments.uploading')}</span> <TableLoader />
                </>
              ) : (
                t('attachments.save')
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </>
  );
};

export default UploadAttachment;
