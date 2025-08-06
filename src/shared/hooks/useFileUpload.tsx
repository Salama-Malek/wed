import { useDropzone } from "react-dropzone";
import { useState, useCallback } from "react";

interface UseFileUploadProps {
  onFileUpload: (files: File[]) => void;
}

export const useFileUpload = ({ onFileUpload }: UseFileUploadProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setUploadedFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
        onFileUpload([...uploadedFiles, ...acceptedFiles]);
      }
    },
    [onFileUpload, uploadedFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/tiff": [".tif"],
    },
    multiple: false,
    onDrop,
  });

  return {
    uploadedFiles,
    getRootProps,
    getInputProps,
    isDragActive,
  };
};