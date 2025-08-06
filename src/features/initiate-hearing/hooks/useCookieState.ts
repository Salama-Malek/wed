import { forIn } from "lodash";
import { useState, useEffect, useCallback } from "react";
import cookie from "react-cookies";

type CookieOptions = {
  path?: string;
  maxAge?: number;
  secure?: boolean;
};

const cookieEventTarget = new EventTarget();

function tryParseJSON(value: any) {
  if (typeof value === "string" && (value.startsWith("{") || value.startsWith("["))) {
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }
  return value;
}

export function useCookieState(defaults?: Record<string, any>, options: CookieOptions = {}) {
  const [cookieState, setCookieState] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    if (defaults) {
      for (const key in defaults) {
        const value = cookie.load(key);
        initial[key] = value !== undefined ? tryParseJSON(value) : defaults[key];
      }
    }
    return initial;
  });

  const getCookie = useCallback((key: string) => {
    const value = cookie.load(key);
    return tryParseJSON(value);
  }, []);

  const setCookie = useCallback(
    (key: string, value: any) => {
      let cookieValue = value;

      if (typeof value === "object" && value !== null) {
        try {
          cookieValue = JSON.stringify(value);
        } catch (err) {
          return;
        }
      }

      cookie.save(key, cookieValue, {
        path: options.path || "/",
        maxAge: options.maxAge || 31536000, // 1 year default
        secure: options.secure,
      });

      setCookieState((prev) => ({ ...prev, [key]: value }));
      cookieEventTarget.dispatchEvent(new Event(key));
    },
    [options.path, options.maxAge, options.secure]
  );

  const removeCookie = useCallback(
    (key: string) => {
      cookie.remove(key, { path: options.path || "/" });
      setCookieState((prev) => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
      cookieEventTarget.dispatchEvent(new Event(key));
    },
    [options.path]
  );

  const removeAll = useCallback((path: string = "/") => {
    const all = cookie.loadAll();
    for (let obj in all) {
      removeCookie(obj);
    }
  }, []);

  useEffect(() => {
    const handlers: { [key: string]: () => void } = {};

    // Set up event listeners for all cookies in defaults
    if (defaults) {
      Object.keys(defaults).forEach((key) => {
        const handler = () => {
          const latest = cookie.load(key);
          setCookieState((prev) => ({
            ...prev,
            [key]: tryParseJSON(latest),
          }));
        };
        cookieEventTarget.addEventListener(key, handler);
        handlers[key] = handler;
      });
    }

    return () => {
      Object.entries(handlers).forEach(([key, handler]) => {
        cookieEventTarget.removeEventListener(key, handler);
      });
    };
  }, [defaults]); // Only depend on defaults, not cookieState

  return [getCookie, setCookie, removeCookie, removeAll] as const;
}