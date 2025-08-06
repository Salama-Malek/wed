import React, { useEffect, useState } from "react";
import Modal from "@/shared/components/modal/Modal";

interface FilePreviewModalProps {
  /** Either a base64 string (no data: prefix) or a File object */
  file: File | string | null;
  /** Optional override for the header (falls back to file.name) */
  fileName?: string;
  onClose: () => void;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  fileName,
  onClose,
}) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("application/pdf");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setObjectUrl(null);
      return;
    }

    let url: string | null = null;

    const createBlobUrl = (binaryString: string, type: string) => {
      const binary = atob(binaryString);
      const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type });
      return URL.createObjectURL(blob);
    };

    // --- API file (Base64Stream) ---
    if (typeof file === 'object' && file !== null && 'Base64Stream' in file) {
      // Use base64 directly, no FileReader
      setObjectUrl(null); // Not using objectUrl
      setMimeType((file as any).fileType || ((file as any).pyFileName?.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/*'));
      setError(null);
      return;
    }

    if (typeof file === "string") {
      // We assume "file" is already a base64 string without data: prefix
      setMimeType("application/pdf");
      url = createBlobUrl(file, "application/pdf");
      setObjectUrl(url);
    } else if (file instanceof File) {
      // It's a File → read as DataURL, then strip prefix
      const reader = new FileReader();
      reader.onerror = () => {
        setError("Failed to read file.");
      };
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const [prefix, b64] = dataUrl.split(",");
        const typeMatch = prefix.match(/data:(.*?);base64/) || [];
        const type = typeMatch[1] || file.type || "application/octet-stream";
        setMimeType(type);
        try {
          url = createBlobUrl(b64, type);
          setObjectUrl(url);
        } catch {
          setError("Failed to process file for preview.");
        }
      };
      reader.readAsDataURL(file);
    } else {
      setError("Unsupported file type for preview.");
    }

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [file]);

  // --- API file (Base64Stream) ---
  if (typeof file === 'object' && file !== null && 'Base64Stream' in file) {
    const isPDF = ((file as any).pyFileName?.toLowerCase().endsWith('.pdf') || (file as any).fileType === 'pdf');
    const headerText = fileName ?? (file as any).pyFileName ?? (file as any).fileName ?? "Preview File";
    const src = isPDF
      ? `data:application/pdf;base64,${(file as any).Base64Stream}`
      : `data:image/*;base64,${(file as any).Base64Stream}`;
    return (
      <Modal
        header={headerText}
        close={onClose}
        modalWidth={800}
        className="!max-h-max !m-0"
      >
        <div className="w-full h-[80vh] overflow-auto">
          {isPDF ? (
            <iframe
              src={src}
              className="w-full h-full border-none"
              title="PDF Preview"
            />
          ) : (
            <img
              src={src}
              alt={headerText}
              className="w-full h-full object-contain"
            />
          )}
        </div>
      </Modal>
    );
  }

  if (!file || !objectUrl) {
    if (error) {
      return (
        <Modal header="Preview Error" close={onClose} modalWidth={500}>
          <div className="p-4 text-red-600">{error}</div>
        </Modal>
      );
    }
    return null;
  }

  // Determine if it’s a PDF by mime type
  const isPDF = mimeType === "application/pdf";
  const headerText =
    fileName ?? (file instanceof File ? file.name : "Preview File");

  return (
    <Modal
      header={headerText}
      close={onClose}
      modalWidth={800}
      className="!max-h-max !m-0"
    >
      <div className="w-full h-[80vh] overflow-auto">
        {isPDF ? (
          <iframe
            src={objectUrl}
            className="w-full h-full border-none"
            title="PDF Preview"
          />
        ) : (
          <img
            src={objectUrl}
            alt={headerText}
            className="w-full h-full object-contain"
          />
        )}
      </div>
    </Modal>
  );
};

export default FilePreviewModal;
