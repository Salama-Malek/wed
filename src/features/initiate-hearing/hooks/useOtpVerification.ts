import { useState, useCallback } from "react";
import { useSendOtpMutation } from "@/features/initiate-hearing/api/create-case/plaintiffDetailsApis";
import { useTranslation } from "react-i18next";

interface UseOtpVerificationProps {
  phoneCode?: { value: string };
  phoneNumber?: string;
  plaintiffId: string;
  plaintiffName: string;
  setValue: (name: string, value: any, options?: object) => void;
}

export const useOtpVerification = ({
  phoneCode,
  phoneNumber,
  plaintiffId,
  plaintiffName,
  setValue,
}: UseOtpVerificationProps) => {
  const [sendOtp] = useSendOtpMutation();
  const [lastSentOtp, setLastSentOtp] = useState<string>("");
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isNotVerified, setIsNotVerified] = useState<boolean>(false);
  const { i18n } = useTranslation();
  const generateRandomOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendOtpHandler = useCallback(async () => {

    const newOtp = generateRandomOtp();
    setLastSentOtp(newOtp);
    setIsVerified(false);
    setValue("isVerified", false);

    const payload = {
      Language: i18n.language.toUpperCase(),
      PlaintiffId: plaintiffId,
      PlaintiffName: plaintiffName,
      SourceSystem: "E-Services",
      GlobalNumberOtp: newOtp,
      CountryCode: phoneCode,
      GlobalPhoneNumber: phoneNumber,
    };
    try {
      await sendOtp(payload).unwrap();
    } catch (error) {
      // Error handling
    }
  }, [phoneCode, phoneNumber, plaintiffId, plaintiffName, sendOtp]);

  const verifyOtp = useCallback(
    (enteredOtp: string) => {
      const isMatch = enteredOtp === lastSentOtp;
      setIsVerified(isMatch);
      setValue("isVerified", isMatch);
      setIsNotVerified(!isMatch);
    },
    [lastSentOtp, setValue]
  );

  return {
    sendOtpHandler,
    verifyOtp,
    isVerified,
    isNotVerified,
    setIsNotVerified,
    lastSentOtp,
  };
};
