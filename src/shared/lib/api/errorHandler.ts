import { toast } from 'react-toastify';

export interface ApiErrorItem {
  ErrorCode: string;
  ErrorDesc: string;
}

export interface ApiResponseWithErrors {
  ErrorCodeList?: ApiErrorItem[];
  ErrorDetails?: ApiErrorItem[];
  SuccessCode?: string;
  ServiceStatus?: string;
  [key: string]: any;
}

export const SPECIAL_ERROR_CODES = {
  TOKEN_EXPIRED: 'ERR001',
  SESSION_EXPIRED: 'ERR002',
  UNAUTHORIZED: 'ERR003',
} as const;

export const SUPPRESSED_ERROR_CODES = [
  "ERR001", "ERR002", "ER3103", "ER3104", "ER1032", "ER1033", "ER1034", "ER1035",
  "ER1037", "ER1036", "ER1038", "ER1040", "ER1039", "ER1069", "ER1070", "ER1071",
  "ER1072", "ER1073", "ER1074", "ER1076", "ER1077", "ER4020", "ER4021", "ER4023",
  "ER4024", "ER4025", "ER4026", "ER4027", "ER1144", "ER4028", "ER1016", "ER4029",
  "ER4030", "ER4032", "ER4033", "ER4034", "ER1058", "ER4035", "ER4036", "ER4037",
  "ER4039", "ER4040", "ER1089", "ER1091", "ER1116", "ER1119", "ER1122", "ER1124",
  "ER1132", "ER1134", "ER1136", "ER1103", "ER1104", "ER1105", "ER4041", "ER3801",
  "ER3802", "ER3015", "ER4042", "ER4043", "ER1041", "ER1042", "ER1043", "ER1044",
  "ER1045", "ER1046", "ER1047", "ER1048", "ER1049", "ER1050", "ER1051", "ER1052",
  "ER1053", "ER1054", "ER1055", "ER1056", "ER1057", "ER1060", "ER1061", "ER1063",
  "ER1064", "ER1065", "ER4044", "ER4045", "ER4046", "ER4047", "ER4048", "ER1095",
  "ER1096", "ER1097", "ER1100", "ER1101", "ER1102", "ER2001", "ER2002", "ER2003",
  "ER2004", "ER2005", "ER2006", "ER2007", "ER2008", "ER2009", "ER2010", "ER2011",
  "ER2012", "ER2013", "ER2014", "ER2015", "ER2016", "ER4001", "ER4002", "ER4003",
  "ER4004", "ER4005", "ER4006", "ER4007", "ER4008", "ER4009", "ER4010", "ER4011",
  "ER4012", "ER4013", "ER4014", "ER4015", "ER4049", "ER3002", "ER3003", "ER3004",
  "ER3005", "ER3006", "ER3007", "ER4050", "ER4051", "ER4052", "ER4056", "ER4057",
  "ER4058", "ER4059", "ER4060", "ER4061", "ER4062", "ER4054", "ER1081", "ER3008"
] as const
export interface ErrorHandlerConfig {
  showToasts?: boolean;
  redirectOnTokenExpired?: boolean;
  customErrorMessages?: Record<string, string>;
  suppressErrorCodes?: string[];
}

export function extractApiErrors(response: ApiResponseWithErrors): ApiErrorItem[] {
  const errors: ApiErrorItem[] = [];

  if (response?.ErrorCodeList && Array.isArray(response.ErrorCodeList)) {
    errors.push(...response.ErrorCodeList.filter(error =>
      error &&
      (error.ErrorCode || error.ErrorDesc) &&
      !(error.ErrorCode === "" && error.ErrorDesc === "")
    ));
  }

  if (response?.ErrorDetails && Array.isArray(response.ErrorDetails)) {
    const groupedErrors: ApiErrorItem[] = [];
    const errorCodeMap = new Map<string, string>();
    const errorDescMap = new Map<string, string>();

    response.ErrorDetails.forEach((item, index) => {
      if (item.ErrorCode) {
        errorCodeMap.set(index.toString(), item.ErrorCode);
      }
      if (item.ErrorDesc) {
        errorDescMap.set(index.toString(), item.ErrorDesc);
      }
    });

    const maxIndex = Math.max(
      ...Array.from(errorCodeMap.keys()).map(k => parseInt(k)),
      ...Array.from(errorDescMap.keys()).map(k => parseInt(k))
    );

    for (let i = 0; i <= maxIndex; i++) {
      const errorCode = errorCodeMap.get(i.toString());
      const errorDesc = errorDescMap.get(i.toString());

      if (errorCode || errorDesc) {
        groupedErrors.push({
          ErrorCode: errorCode || "",
          ErrorDesc: errorDesc || ""
        });
      }
    }

    errors.push(...groupedErrors.filter(error =>
      error &&
      (error.ErrorCode || error.ErrorDesc) &&
      !(error.ErrorCode === "" && error.ErrorDesc === "")
    ));
  }

  return errors;
}

export function hasApiErrors(response: ApiResponseWithErrors): boolean {
  return extractApiErrors(response).length > 0;
}

export function handleApiErrors(
  response: ApiResponseWithErrors,
  config: ErrorHandlerConfig = {}
): void {
  const {
    showToasts = true,
    redirectOnTokenExpired = true,
    customErrorMessages = {},
    suppressErrorCodes = []
  } = config;

  const errors = extractApiErrors(response);

  if (errors.length === 0) {
    return;
  }

  // Deduplicate error messages by ErrorDesc (and ErrorCode for safety)
  const shownMessages = new Set<string>();
  errors.forEach((error) => {
    const { ErrorCode, ErrorDesc } = error;

    const isSuppressed = SUPPRESSED_ERROR_CODES.includes(ErrorCode as any) ||
      suppressErrorCodes.includes(ErrorCode);

    if (ErrorCode === SPECIAL_ERROR_CODES.TOKEN_EXPIRED && redirectOnTokenExpired) {
      if (showToasts && !isSuppressed && !shownMessages.has("TOKEN_EXPIRED")) {
        console.log("[handleApiErrors] Showing toast for TOKEN_EXPIRED");
        toast.error("The Token Is Expired");
        shownMessages.add("TOKEN_EXPIRED");
      }
      setTimeout(() => {
        if (process.env.VITE_LOGIN_SWITCH === "true") {
          window.location.href = `${process.env.VITE_REDIRECT_URL_LOCAL}`;
        } else {
          window.location.href = `${process.env.VITE_REDIRECT_URL}`;
        }
      }, 2000);
      return;
    }

    const errorMessage = customErrorMessages[ErrorCode] || ErrorDesc;
    const dedupKey = (errorMessage || "") + "::" + (ErrorCode || "");
    if (errorMessage && showToasts && !isSuppressed && !shownMessages.has(dedupKey)) {
      console.log(`[handleApiErrors] Showing toast for error:`, { errorMessage, ErrorCode });
      toast.error(errorMessage);
      shownMessages.add(dedupKey);
    }
  });
}

export function isApiResponseSuccessful(response: ApiResponseWithErrors): boolean {
  const hasSuccessCode = response?.SuccessCode === "200";
  const hasSuccessStatus = response?.ServiceStatus === "Success";

  const hasNoErrors = !hasApiErrors(response);

  return (hasSuccessCode || hasSuccessStatus) && hasNoErrors;
}

export function createErrorResponse(
  errorCode: string,
  errorDesc: string,
  additionalData: Record<string, any> = {}
): ApiResponseWithErrors {
  return {
    ServiceStatus: "Error",
    SuccessCode: "500",
    ErrorCodeList: [{
      ErrorCode: errorCode,
      ErrorDesc: errorDesc
    }],
    ...additionalData
  };
}

export function handleApiResponse(
  response: ApiResponseWithErrors,
  config: ErrorHandlerConfig = {}
): boolean {
  if (hasApiErrors(response)) {
    handleApiErrors(response, config);
    return false;
  }

  return isApiResponseSuccessful(response);
} 