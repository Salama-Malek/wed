import { ReactNode, Suspense, useEffect, useState, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import {
  GetUserTypeResponce,
  useLazyGetUserTokenQuery,
  useLazyGetUserTypeLegalRepQuery,
} from "../api/loginApis";
import Loader from "@/shared/components/loader";
import { useTranslation } from "react-i18next";
import { useLanguageDirection } from "@/shared/hooks/useLanguageDirection";
import { NICDetailsParams } from "@/features/initiate-hearing/components/hearing-details/hearing.details.types";
import { useLazyGetNICDetailsQuery } from "@/features/initiate-hearing/api/create-case/plaintiffDetailsApis";
import { toHijri_YYYYMMDD } from "@/shared/lib/helpers";
import NICErrorModal from "@/shared/components/modal/NICErrorModal";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export interface TokenClaims {
  AcceptedLanguage?: string;
  File_Number?: string;
  UserDOB?: string;
  UserID?: string;
  UserName?: string;
  UserType?: string;
  aud?: string;
  exp?: number;
  iat?: number;
  iss?: string;
}

interface AuthProviderProps {
  children: ReactNode;
  setIsLegalRep: (value: boolean) => void;
  setIsEstablishment: (value: boolean) => void;
  setUserTypeState: (value: string) => void;
}

const LazyLoader = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<Loader />}>{children}</Suspense>
);

const decodeToken = (token: string): TokenClaims | null => {
  try {
    const decoded: TokenClaims = jwtDecode(token);
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) return null;
    return decoded;
  } catch {
    return null;
  }
};

const shouldUseStoredClaims = (claims: any): boolean => {
  if (!claims || Object.keys(claims).length === 0) return false;
  const now = Math.floor(Date.now() / 1000);
  return claims.exp && claims.exp >= now;
};

const extractUserType = (res: GetUserTypeResponce): string | undefined =>
  res?.UserTypeList?.[0]?.UserType;

const formatDateOfbarth = (claims: TokenClaims | null): TokenClaims | null => {
  return {
    AcceptedLanguage: claims?.AcceptedLanguage,
    File_Number: claims?.File_Number,
    UserDOB: toHijri_YYYYMMDD(claims?.UserDOB || ""),
    UserID: claims?.UserID,
    UserName: claims?.UserName,
    UserType: claims?.UserType === "EstablishmentUser" ? "1" : "2",
    aud: claims?.aud,
    exp: claims?.exp,
    iat: claims?.iat,
    iss: claims?.iss,
  };
};

const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  setIsLegalRep,
  setIsEstablishment,
  setUserTypeState,
}) => {
  // The Start Point of the App

  const [searchParams] = useSearchParams();
  const [userClaims, setUserClaims] = useState<TokenClaims | null>(null);
  const [getCookie, setCookie, removeCookie, removeAll] = useCookieState(
    {},
    { path: "/", maxAge: 86400 }
  );
  const [showNICError, setShowNICError] = useState(false);
  const [nicErrorMessage, setNicErrorMessage] = useState("");
  const [isNICValidated, setIsNICValidated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [triggerGetUserType, { data: userTypeLegalRepData, isFetching }] =
    useLazyGetUserTypeLegalRepQuery();

  const [
    triggerGetNICDetailsQuery,
    { data: nicData, isFetching: nicIsLoading, error: nicError },
  ] = useLazyGetNICDetailsQuery();

  const [triggerGetToken, { isFetching: isTokenFetching }] = useLazyGetUserTokenQuery();
  const [isTokenReady, setIsTokenReady] = useState(false);

  const checkAndFetchToken = useCallback(async () => {
    const tokenExpiresAt = getCookie("oauth_token_expires_at");
    const parsedExpiresAt = tokenExpiresAt ? parseInt(tokenExpiresAt, 10) : 0;
    
    // Dynamic refresh check (5 minutes before expiration)
    const shouldRefreshToken = !parsedExpiresAt || Date.now() > parsedExpiresAt - 5 * 60 * 1000;

    // Static refresh check for testing: refresh if less than 30 seconds left
    // const shouldRefreshToken = !parsedExpiresAt || Date.now() > parsedExpiresAt - 30 * 1000;

    if (shouldRefreshToken) {
      try {
        const tokenData = await triggerGetToken().unwrap();
        setCookie("oauth_token", tokenData.access_token);
        
        // Override API expiration: Force 50-minute expiration instead of 1 hour
        const customExpiresIn = 50 * 60; // 50 minutes in seconds
        const expiresAt = Date.now() + customExpiresIn * 1000;
        
        // Original dynamic expiration from API (commented out)
        // const expiresAt = Date.now() + tokenData.expires_in * 1000;
        
        // Static 2-minute expiration for testing
        // const expiresAt = Date.now() + 2 * 60 * 1000;
        
        setCookie("oauth_token_expires_at", expiresAt.toString());
      } catch (err) {
        throw err; 
      }
    }
  }, [getCookie, setCookie, triggerGetToken]);

  useEffect(() => {
    const initialize = async () => {
      try {
        await checkAndFetchToken();
        setIsTokenReady(true);
      } catch {
        // Error handling
      }
    };
    initialize();
  }, [checkAndFetchToken]);

  useEffect(() => {
    if (!isTokenReady) return;

    const intervalId = setInterval(checkAndFetchToken, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(intervalId);
  }, [isTokenReady, checkAndFetchToken]);

  useEffect(() => {
    if (!isTokenReady) return;

    const initializeUserSession = async () => {
      try {
        const tokenFromURL = searchParams.get("MyClientsToken");
        if (tokenFromURL) {
          // removeAll();
          const decodedToken = decodeToken(tokenFromURL);
          if (!decodedToken) {
            // window.location.href = `${process.env.VITE_REDIRECT_URL}`;
            return;
          }

          const claims = formatDateOfbarth(decodedToken);
          if (claims?.AcceptedLanguage) {
            const language = claims.AcceptedLanguage.toUpperCase();
            i18n.changeLanguage(language.toLowerCase()).then(() => {
              localStorage.setItem("language", language.toLowerCase());
              document.documentElement.dir =
                language.toLowerCase() === "ar" ? "rtl" : "ltr";
            });
          }

          setCookie("userClaims", claims);
          setCookie("token", tokenFromURL);

          if (claims) {
            claims.UserType = claims.UserType === "EstablishmentUser" ? "1" : "2";
            setUserClaims(claims);

            if (!claims.File_Number) {
              await Promise.all([
                fetchUserType(claims),
                getNICData(claims.UserID, claims.UserDOB),
              ]);
            } else {
              setCookie("userType", "Establishment");
              setIsEstablishment(true);
            }
          } else {
            // window.location.href = `${process.env.VITE_REDIRECT_URL}`;
          }
        } else {
          const storedClaims = getCookie("userClaims");
          if (shouldUseStoredClaims(storedClaims)) {
            setUserClaims(storedClaims);
            if (!storedClaims.File_Number) {
              setIsEstablishment(false);
              const selectedUserType = getCookie("selectedUserType");
              if (selectedUserType) {
                setCookie("userType", selectedUserType);
                setIsLegalRep(selectedUserType === "Legal representative");
              } else {
                const storedUserType = getCookie("storeAllUserTypeData");
                if (!storedUserType) {
                  await Promise.all([
                    fetchUserType(storedClaims),
                    getNICData(storedClaims.UserID, storedClaims.UserDOB),
                  ]);
                }
              }
            } else {
              setCookie("userType", "Establishment");
              setIsEstablishment(true);
            }
          } else {
            // window.location.href = `${process.env.VITE_REDIRECT_URL}`;
          }
        }
      } catch (error) {
        // Error handling
      } finally {
        setIsDataLoaded(true);
      }
    };
    initializeUserSession();
  }, [isTokenReady]);

  useEffect(() => {
    if (!isTokenReady) return;

    const storedClaims = getCookie("userClaims");
    if (!shouldUseStoredClaims(storedClaims)) {
      // Redirect to login if not authenticated
      window.location.href = process.env.VITE_REDIRECT_URL || "";
      return;
    }
  }, [isTokenReady]);
  
  const navigate = useNavigate();
  const { isRTL } = useLanguageDirection();
  const { t, i18n } = useTranslation();

  const handleErrorResponse = (data: any) => {
    try {
      let errorMessage = "Failed to load user information";
      if (data?.ErrorDetails && Array.isArray(data.ErrorDetails)) {
        const errorDesc = data.ErrorDetails.find(
          (detail: any) => detail.ErrorDesc
        )?.ErrorDesc;
        if (errorDesc) {
          errorMessage = errorDesc;
        }
      }
      setNicErrorMessage(errorMessage);
      setShowNICError(true);
    } catch (error) {
      // Error handling
    }
  };

  const fetchUserType = async (claims: TokenClaims) => {
    try {
      if (!claims.UserID || !claims.UserType) {
        return;
      }
      return await triggerGetUserType({
        IDNumber: claims.UserID!,
        UserRequestType: claims.UserType!,
        SourceSystem: "E-Services",
      }).unwrap();
    } catch (error) {
      throw error;
    }
  };

  const getNICData = async (IDNumber?: string, DateOfBirth?: string) => {
    try {
      if (!IDNumber || !DateOfBirth) {
        return;
      }
      return await triggerGetNICDetailsQuery({
        IDNumber: IDNumber,
        DateOfBirth: DateOfBirth,
        AcceptedLanguage: isRTL ? "AR" : "EN",
        SourceSystem: "E-Services",
      }).unwrap();
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    if (userTypeLegalRepData) {
      setCookie("storeAllUserTypeData", userTypeLegalRepData);
      const selectedUserType = getCookie("selectedUserType");
      if (!selectedUserType) {
        const userType = extractUserType(userTypeLegalRepData);
        if (userType) {
          setCookie("userType", userType);
          setIsLegalRep(userType === "Legal representative");
          setUserTypeState(userType)
          
          // Store the original user type for role switching logic
          // Check both userClaims and API response to determine if user is a legal representative
          if (userType === "Legal representative") {
            setCookie("originalUserType", "Legal representative");
          }
        }
      }
    }
  }, [userTypeLegalRepData]);

  useEffect(() => {
    if (nicData) {
      if ("ErrorDetails" in nicData && Array.isArray((nicData as any).ErrorDetails)) {
        handleErrorResponse(nicData);
      } else {
        setCookie("storeAllNicData", nicData);
        setCookie("nicDetailObject", nicData);
        setIsNICValidated(true);
      }
    }
  }, [nicData]);

  useEffect(() => {
    if (nicError) {
      const error = nicError as FetchBaseQueryError;
      let errorMessage = t("nic_error.default_error");

      if (error.status === 401) {
        errorMessage = t("nic_error.unauthorized");
        removeAll();
        // window.location.href = `${process.env.VITE_REDIRECT_URL}`;
      } else if (error.status === 500) {
        errorMessage = t("nic_error.server_error");
      } else if (error.data) {
        const errorData = error.data as any;
        if (
          errorData?.ErrorDetails &&
          Array.isArray(errorData.ErrorDetails)
        ) {
          const errorDesc = errorData.ErrorDetails.find(
            (detail: any) => detail.ErrorDesc
          )?.ErrorDesc;
          if (errorDesc) {
            errorMessage = errorDesc;
          }
          setIsDataLoaded(true);
        }
      }

      setNicErrorMessage(errorMessage);
      setShowNICError(true);
    }
  }, [nicError, removeAll, t]);

  if (!isTokenReady || isTokenFetching || !isDataLoaded || nicIsLoading) {
    return <Loader />;
  }

  return (
    <>
      <LazyLoader>{children}</LazyLoader>
      <NICErrorModal
        isOpen={showNICError}
        onClose={() => setShowNICError(false)}
        errorMessage={nicErrorMessage}
      />
    </>
  );
};

export default AuthProvider;
