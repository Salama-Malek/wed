import { useState, useEffect } from "react";

const useFileToBase64 = (file: File | null) => {
  const [base64, setBase64] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setBase64(null);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      setBase64(reader.result as string);
      setError(null);
    };

    reader.onerror = () => {
      setError("Error converting file to Base64");
      setBase64(null);
    };
  }, [file]);

  return { base64, error };
};

export default useFileToBase64;
