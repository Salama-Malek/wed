import { useEffect } from "react";

const redirectUrl = (process.env.VITE_LOGIN_SWITCH === "true"
    ? process.env.VITE_REDIRECT_URL_LOCAL
    : process.env.VITE_REDIRECT_URL) as string;


function clearAllCookiesAndStorage() {
    try {
        document.cookie.split(";").forEach((c) => {
            document.cookie = c
                .replace(/^ +/, "")
                .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        localStorage.clear();
        sessionStorage.clear();
    } catch (e) { }
}

export default function Logout() {
    useEffect(() => {
        clearAllCookiesAndStorage();
        window.location.href = redirectUrl;
    }, []);

    return <div />;
}