import { useCookies } from 'react-cookie';

type CookieOptions = {
  path?: string;
  expires?: Date;
  maxAge?: number;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
};

export const useCookieService = () => {
  const [cookies, setCookie, removeCookie] = useCookies();

  const isLocalEnvironment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';

  const set = <T>(key: string, value: T, options?: CookieOptions): void => {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

    const cookieOptions = isLocalEnvironment
      ? options
      : { ...options, secure: true, httpOnly:true };

    setCookie(key, stringValue, cookieOptions);
  };

  const get = <T>(key: string): T | null => {
    const value = cookies[key];
    if (value) {
      try {
        return JSON.parse(value) as T;
      } catch (e) {
        return value as T;
      }
    }
    return null;
  };

  const remove = (key: string, options?: CookieOptions): void => {
    const cookieOptions = isLocalEnvironment
      ? options
      : { ...options, secure: true };

    removeCookie(key, cookieOptions);
  };

  return { set, get, remove };
};