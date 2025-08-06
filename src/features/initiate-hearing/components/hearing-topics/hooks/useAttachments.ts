import { useState, useEffect } from "react";
import { useRemoveAttachmentMutation } from "../api/apis";
import { processAttachmentKey } from "@/shared/lib/helpers";

interface FileAttachment {
  file: File | null;
  fileType: string;
  fileName: string;
  attachmentKey?: string
}

interface AttachmentFile {
  FileType: string;
  FileName: string;
  FileData: string;
}

export interface UseAttachmentsParams {
  initialAttachmentFiles?: AttachmentFile[]; // base64 files from backend
  triggerFileDetails?: any;
  fileBase64?: any;
}

export function useAttachments(params: UseAttachmentsParams = {}) {
  const [attachments, setAttachments] = useState<any[]>([]);
  const [attachmentFiles, setAttachmentFiles] = useState<AttachmentFile[]>([]);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [previewFile, setPreviewFile] = useState<any>(null);
  const [removeAttachment] = useRemoveAttachmentMutation();

  // Initialize with existing files if provided
  useEffect(() => {
    if (params.initialAttachmentFiles && params.initialAttachmentFiles.length > 0) {
      setAttachmentFiles(params.initialAttachmentFiles);

      const mappedAttachments: FileAttachment[] = params.initialAttachmentFiles.map((f) => {
        return ({
          file: null,
          fileType: f.FileType,
          fileName: f.FileName,
        })
      });

      setAttachments(mappedAttachments);
    }
  }, [params.initialAttachmentFiles]);

  useEffect(() => {
    if (params.fileBase64 && params.fileBase64.Base64Stream) {
      setPreviewFile(params.fileBase64);
    }
  }, [params.fileBase64]);

  const handleAttachmentSave = (newAttachments: FileAttachment[]) => {
    setAttachments((prev) => [...prev, ...newAttachments]);

    const updatedFiles: AttachmentFile[] = [];
    let processed = 0;

    newAttachments.forEach((file) => {
      if (!file.file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        updatedFiles.push({
          FileType: file.fileType,
          FileName: file.fileName,
          FileData: base64,
        });
        processed++;

        if (processed === newAttachments.length) {
          const finalFiles = [...attachmentFiles, ...updatedFiles];
          setAttachmentFiles(finalFiles);
        }
      };
      reader.readAsDataURL(file.file);
    });
  };

  const handleRemoveAttachment = async (index: number) => {
    const attachmentToRemove = attachments[index];  
      // If the attachment has a FileKey, call the API to remove it
    if (attachmentToRemove && (attachmentToRemove.FileKey || attachmentToRemove.fileKey)) {
      try {
        await removeAttachment({
          AttachmentKey: attachmentToRemove.FileKey || attachmentToRemove.fileKey,
        });
      } catch (error) {
        // Optionally handle error (toast, etc.)
      }
    }
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleViewAttachment = (attachment: any) => {
    console.log('[useAttachments] handleViewAttachment called with:', attachment);
    const key = attachment.FileKey || attachment.fileKey || attachment.attachmentKey;

    if (key && params.triggerFileDetails) {
      console.log('[useAttachments] Calling triggerFileDetails API for FileKey:', key);
      console.log('[useAttachments] Original AttachmentKey:', key);
      console.log('[useAttachments] Processed AttachmentKey:', processAttachmentKey(key));
      
      params.triggerFileDetails({
        AttachmentKey: key,
        AcceptedLanguage: (attachment.AcceptedLanguage || 'EN').toUpperCase(),
      });
    } else if (attachment.base64) {
      console.log('[useAttachments] Using local base64 data for preview.');
    } else {
      console.log('[useAttachments] No FileKey or base64 found on attachment.');
    }
  };

  const openAttachmentModal = () => setShowAttachmentModal(true);
  const closeAttachmentModal = () => setShowAttachmentModal(false);
  const closePreview = () => setPreviewFile(null);

  return {
    attachments,
    attachmentFiles,
    previewFile,
    showAttachmentModal,
    handleAttachmentSave,
    handleRemoveAttachment,
    handleViewAttachment,
    openAttachmentModal,
    closeAttachmentModal,
    closePreview,
    setAttachments,
    setAttachmentFiles,
  };
}
