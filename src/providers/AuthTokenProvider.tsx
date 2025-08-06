import React, { createContext, useContext, useEffect, useState } from "react";
import cookie from "react-cookies";
import { jwtDecode } from "jwt-decode";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import { useLazyGetUserTokenQuery } from "@/features/login/api/loginApis";

interface AuthTokenContextType {
    isTokenExpired: boolean;
    timeUntilExpiration: number;
}
interface AUTHTOKEN {
    app_name?: string;
    app_version?: string;
    aud?: string;
    exp?: number;
    iat?: number;
    iss?: string;
    jti?: string;
    nbf?: string;
    operator_access?: string;
    sub?: string;
}

const AuthTokenContext = createContext<AuthTokenContextType | null>(null);

export const AuthTokenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isTokenExpired, setIsTokenExpired] = useState(false);
    const [timeUntilExpiration, setTimeUntilExpiration] = useState(0);
    const [getCookie, setCookie] = useCookieState();
    const [triggerGetToken] = useLazyGetUserTokenQuery();

    const refreshTokweFun = async () => {
        const newToken = await triggerGetToken().unwrap();
        if (newToken && newToken?.access_token) {
            setCookie("oauth_token", newToken?.access_token);
        }
    }


    useEffect(() => {
        const checkAccessTokenExpiration = () => {
            const accessToken = getCookie("oauth_token");
            if (!accessToken) {
                setIsTokenExpired(true);
                setTimeUntilExpiration(0);
                return;
            }
            try {
                const decodeToken: AUTHTOKEN = jwtDecode(accessToken)
                const now = Math.floor(Date.now() / 1000);
                const deffrance = (decodeToken?.exp || 0) - (now || 0)
                if (deffrance && deffrance < 300) {
                    refreshTokweFun();
                }

            } catch (error) {
                setIsTokenExpired(true);
                setTimeUntilExpiration(0);
            }
        };

        checkAccessTokenExpiration();
        const intervalId = setInterval(checkAccessTokenExpiration, 30000);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <AuthTokenContext.Provider value={{ isTokenExpired, timeUntilExpiration }}>
            {children}
        </AuthTokenContext.Provider>
    );
};

export const useAuthToken = () => useContext(AuthTokenContext);
