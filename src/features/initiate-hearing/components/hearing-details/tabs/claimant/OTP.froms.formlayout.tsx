import Button from "@/shared/components/button";
import { SectionLayout } from "@/shared/components/form/form.types";
import { KeyboardEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { PHONE_PATTERNS } from "@/config/general";
import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { useGetCountryCodeLookupDataQuery, useSendOtpMutation } from "@/features/initiate-hearing/api/create-case/plaintiffDetailsApis";
import { useOtpVerification } from "@/features/initiate-hearing/hooks/useOtpVerification";
import { TokenClaims } from "@/features/login/components/AuthProvider";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";

export interface DataElement {
  ElementKey: string;
  ElementValue: string;
}

export interface FormData {
  isPhone?: boolean;
  phoneCode?: string;
  interPhoneNumber?: string;
  otp?: string;
}

export interface OTPFormLayoutProps {
  watch?: any;
  setValue?: any;
  countryData?: any;
  sendOtpHandler?: () => void;
  isVerified?: boolean;
  isNotVerified?: boolean;
  setIsNotVerified?: (value: boolean) => void;
  verifyOtp?: () => void;
  isVerify?: boolean;
}

const OTPFormLayout = ({
  watch,
  setValue,
  isVerify = false,
}: OTPFormLayoutProps): SectionLayout[] => {
  const isPhone = watch("isPhone") || false;
  const phoneCode = watch("phoneCode");
  const phoneNumber = watch("interPhoneNumber");
  const enteredOtp = watch("otp");
  const { t, i18n } = useTranslation("hearingtopics");
  const { t: tPlaceholder } = useTranslation("placeholder");

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [otpSent, setOtpSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [showResend, setShowResend] = useState(false);
  const [getCookie, setCookie] = useCookieState();
  const userClaims: TokenClaims = getCookie("userClaims");
  const applicantType = watch("applicantType") as
    | "principal"
    | "representative";
  const [userId, setUserId] = useState<string>();

  const { data: countryData } = useGetCountryCodeLookupDataQuery({
    AcceptedLanguage: i18n.language.toUpperCase(),
    SourceSystem: "E-Services",
  });

  useEffect(() => {
    if (applicantType === "principal") {
      setUserId(userClaims.UserID)
    } else {
      setUserId(watch("idNumber") as string)
    }
  }, [applicantType])



  const {
    sendOtpHandler,
    verifyOtp,
    isVerified,
    isNotVerified,
    setIsNotVerified,
    lastSentOtp,
  } = useOtpVerification({
    phoneCode: phoneCode?.value || "",
    phoneNumber: phoneNumber || "",
    plaintiffId: userId || "",
    plaintiffName: userClaims?.UserName || "",
    setValue: setValue as any,
  });


  const CountryCodeOptions = useMemo(
    () =>
      countryData && countryData?.DataElements?.map((item: DataElement) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || [],
    [countryData]
  );

  const getPhoneConfig = (code: string) =>
    PHONE_PATTERNS[code] || PHONE_PATTERNS.DEFAULT;

  const phoneConfig = getPhoneConfig(phoneCode || "");
  const isPhoneValid =
    phoneCode && phoneNumber ? phoneConfig.pattern.test(phoneNumber) : false;
  const isSendOtpDisabled = !phoneCode || !phoneNumber || !isPhoneValid;
  const isVerifyOtpDisabled =
    !enteredOtp || enteredOtp.length < 6 || !isPhoneValid;
  const progress = ((120 - timeLeft) / 120) * 100;

  useEffect(() => {
    if (!otpSent || isVerified || timeLeft <= 0) return;
    const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [otpSent, timeLeft, isVerified]);

  useEffect(() => {
    if (timeLeft === 0 && !isVerified) setShowResend(true);
  }, [timeLeft, isVerified]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
    setValue("otp", newOtp.join(""));
  };

  const handleSendOtp = () => {
    if (isSendOtpDisabled || !sendOtpHandler) return;
    setOtpSent(true);
    setTimeLeft(60);
    setShowResend(false);
    setOtp(Array(6).fill(""));
    sendOtpHandler();
  };

  const handleResendOtp = () => {
    handleSendOtp();
    if (setIsNotVerified) setIsNotVerified(false);
  };

  const handleCerifyOtp = () => {

    verifyOtp(otp.join(""));
  }



  return [
    {
      gridCols: 3,
      className: "international-phone-number-section",
      children: [
        {
          type: "checkbox",
          name: "isPhone",
          label: t("addInternationalNumber"),
          checked: isPhone ? isPhone : false,
          onChange: (checked: boolean) => {
            setValue("isPhone", checked);
            if (!checked) {
              setOtpSent(false);
              setOtp(Array(6).fill(""));
              setTimeLeft(60);
              setShowResend(false);
            }
          },
        },
      ],
    },
    {
      condition: isPhone && !otpSent,
      children: [
        {
          type: "autocomplete",
          label: t("countryCode", { ns: "hearingdetails" }),
          name: "phoneCode",
          options: CountryCodeOptions,
          value: phoneCode,
          onChange: (value: string) => setValue("phoneCode", value),
          ...(isPhone
            ? {
              validation: {
                required: t("codeValidation"),
              },
            }
            : {}),
        },
        {
          type: "input",
          name: "interPhoneNumber",
          label: t("nicDetails.phoneNumber", { ns: "hearingdetails" }),
          inputType: "tel",
          maxLength: 10,
          value: phoneNumber ?? "",
          onChange: (v: string) => setValue("interPhoneNumber", v),
          placeholder: phoneCode
            ? getPhoneConfig(phoneCode).placeholder
            : tPlaceholder("international_phone"),
          ...(isPhone
            ? {
              validation: {
                required: t("interPhoneNumberValidation"),
                validate: (value: string) => {
                  if (!phoneCode) return t("countryCodeSelection");
                  const pattern = getPhoneConfig(phoneCode).pattern;
                  return pattern.test(value) || t("phoneNumberValidation");
                },
              },
            }
            : {}),
        },
        {
          type: "custom",
          component: (
            <Button
              size="sm"
              className="h-8 mt-[35px]"
              onClick={handleSendOtp}
              disabled={isSendOtpDisabled}
              variant={isSendOtpDisabled ? "disabled" : "primary"}
              typeVariant={isSendOtpDisabled ? "freeze" : "primary"}
            >
              {t("verifyOtp")}
            </Button>
          ),
        },
      ],
      className: "",
      gridCols: 3,
    },
    {
      title: "Enter OTP",
      condition: otpSent && !isVerified,
      children: [
        {
          type: "custom",
          component: (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Enter the 6-digit verification OTP code sent to the mobile
                number linked to your account.
              </p>
              <div className="flex justify-between gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-input-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className={`w-12 h-12 border rounded text-center text-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${isNotVerified && "border-2 border-red-300 shadow-lg"
                      }`}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e, otp)}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
              <div className="flex justify-end items-center gap-3">
                {showResend ? (
                  <Button
                    variant="secondary"
                    typeVariant="outline"
                    onClick={handleResendOtp}
                    size="xs"
                    disabled={isSendOtpDisabled}
                  >
                    {t("sendOtp")}
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="relative w-5 h-5">
                      <div className="absolute inset-0 rounded-full border-2 border-gray-200"></div>
                      <div
                        className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent transition-all duration-300"
                        style={{
                          transform: `rotate(${progress * 3.6}deg)`,
                          clipPath:
                            progress >= 50 ? "inset(0)" : "inset(0 0 0 50%)",
                        }}
                      ></div>
                      {progress < 50 && (
                        <div
                          className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent transition-all duration-300"
                          style={{
                            transform: `rotate(180deg)`,
                            clipPath: `inset(0 ${100 - progress * 2}% 0 0)`,
                          }}
                        ></div>
                      )}
                    </div>
                    <span className="text-sm text-gray-600">
                      Resend OTP in {timeLeft}s
                    </span>
                  </div>
                )}
              </div>
            </div>
          ),
        },
      ],
      className: undefined,
      gridCols: 0,
    },
    {
      condition: otpSent && !isVerified,
      children: [
        {
          type: "custom",
          component: (
            <Button
              size="sm"
              onClick={handleCerifyOtp}
              className="w-full"
              disabled={isVerifyOtpDisabled || isVerify}
              variant={isVerifyOtpDisabled || isVerify ? "disabled" : "primary"}
              typeVariant={isVerifyOtpDisabled || isVerify ? "freeze" : "primary"}
            >
              {t("verifyOtp")}
            </Button>
          ),
        },
      ],
      className: undefined,
      gridCols: 0,
    },

    {
      condition: isVerified,
      children: [
        {
          type: "custom",
          component: (
            <div className="p-4 bg-green-50 text-green-700 rounded-md">
              <p className="font-medium">
                {t("sussess_otp")}
              </p>
            </div>
          ),
        },
      ],
      className: undefined,
      gridCols: 0,
    }

  ].filter(Boolean) as SectionLayout[];
};

const handleKeyDown = (
  index: number,
  e: KeyboardEvent<HTMLInputElement>,
  otp: string[]
): void => {
  if (e.key === "Backspace" && !otp[index] && index > 0) {
    const prev = document.getElementById(
      `otp-input-${index - 1}`
    ) as HTMLInputElement;
    prev?.focus();
  }
};

export default OTPFormLayout;