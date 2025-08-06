import { useTranslation } from "react-i18next";
import { useFileUpload } from "@/shared/hooks/useFileUpload";
import { useState, useCallback } from "react";
import Button from "@/shared/components/button";
import { FileUploadIcon } from "hugeicons-react";

interface FileUploadProps {
  onFileUpload: (files: File[]) => void;
  isMultiple?: boolean;
  acceptedFileTypes?: string;
  maxFileSize?: number;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  isMultiple = false,
  acceptedFileTypes = "*/*",
  maxFileSize = 5 * 1024 * 1024,
  className = "",
}) => {
  const { t } = useTranslation("hearingdetails");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = useCallback(
    (files: File[]) => {
      const validFiles: File[] = [];
      let hasError = false;

      for (const file of files) {
        if (file.size > maxFileSize) {
          setError(t("fileTooLarge", { maxSize: formatFileSize(maxFileSize) }));
          hasError = true;
          break;
        }
        validFiles.push(file);
      }

      if (!hasError) {
        if (isMultiple) {
          // If multiple files are allowed, process all files
          setSelectedFiles(validFiles);
          onFileUpload(validFiles);
        } else {
          // If only one file is allowed, process only the last selected file
          setSelectedFiles([validFiles[validFiles.length - 1]]);
          onFileUpload([validFiles[validFiles.length - 1]]);
        }
        setError(null);
      }
    },
    [maxFileSize, onFileUpload, t]
  );

  const { getRootProps, getInputProps, isDragActive } = useFileUpload({
    onFileUpload: handleFileUpload,
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      className={`border border-dashed border-gray-100 rounded-lg ${className}`}
    >
      <div
        {...getRootProps()}
        className={`cursor-pointer flex flex-col justify-center items-center gap-y-4 p-6 border-2 border-dashed rounded-lg transition-colors ${
          isDragActive
            ? "border-primary-500 bg-primary-50"
            : "border-gray-300 bg-gray-100"
        }`}
      >
        <input
          {...getInputProps()}
          multiple={isMultiple}
          accept={acceptedFileTypes}
        />

        <div className="text-center">
          <FileUploadIcon className="w-full text-center mb-6" />
          <h2 className="text-gray-800 font-medium text-md mb-2">
            {t("attachFile")}
          </h2>

          {selectedFiles.length > 0 ? (
            <ul className="text-sm text-gray-700 space-y-1 mb-2">
              {selectedFiles.map((file, index) => (
                <li key={`${file.name}-${index}`}>
                  {file.name} ({formatFileSize(file.size)})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-700 mb-2 leading-relaxed">
              {t("maxSize", { maxSize: formatFileSize(maxFileSize) })}
            </p>
          )}

          {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
        </div>

        <Button type="button" variant="medium" typeVariant="subtle" size="xs">
          {t("browseFiles")}
        </Button>
      </div>
    </div>
  );
};

export default FileUpload;
