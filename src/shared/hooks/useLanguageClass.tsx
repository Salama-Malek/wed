import { useState, useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";

export const useLanguageClass = (rtlClass: string, ltrClass: string) => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const [languageClass, setLanguageClass] = useState<string>("");

  useLayoutEffect(() => {
    const newClass = currentLanguage === "ar" ? rtlClass : ltrClass;
    setLanguageClass(newClass);
  }, [currentLanguage]); 

  return languageClass;
};
