import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import cookie from "react-cookies";

interface TokenExpirationContextType {
    isTokenExpired: boolean;
    timeUntilExpiration: number;
}

const TokenExpirationContext = createContext<TokenExpirationContextType | null>(null);

export const TokenExpirationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isTokenExpired, setIsTokenExpired] = useState(false);
    const [timeUntilExpiration, setTimeUntilExpiration] = useState(0);


    useEffect(() => {
        const checkTokenExpiration = () => {
            const token = cookie.load("token");
            if (!token) {
                return;
            }

            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const expirationTime = payload.exp * 1000;
                const currentTime = Date.now();
                const timeLeft = expirationTime - currentTime;

                setTimeUntilExpiration(timeLeft);

                if (timeLeft < 1) {
                    setIsTokenExpired(true);
                    toast.error('Your session has expired. Please log in again.');
                    cookie.remove("token");

                    if (process.env.VITE_LOGIN_SWITCH === "true") {
                        window.location.href = `${process.env.VITE_REDIRECT_URL_LOCAL}`;
                    } else {
                        window.location.href = `${process.env.VITE_REDIRECT_URL}`;
                    }



                } else if (timeLeft <= (300000)) {
                    toast.warning(`Your session will expire in ${Math.floor(timeLeft / 60000)} minutes.`);
                }
            } catch (error) {
            }
        };

        checkTokenExpiration();
        const intervalId = setInterval(checkTokenExpiration, 5000);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <TokenExpirationContext.Provider value={{ isTokenExpired, timeUntilExpiration }}>
            {children}
        </TokenExpirationContext.Provider>
    );
};

export const useTokenExpiration = () => {
    const context = useContext(TokenExpirationContext);
    if (!context) {
        throw new Error('useTokenExpiration must be used within a TokenExpirationProvider');
    }
    return context;
};
