import { createContext, useContext, useState, useLayoutEffect, ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface LanguageDirectionContextType {
  currentLanguage: string;
  isRTL: boolean;
  loading: boolean;
}

const LanguageDirectionContext = createContext<LanguageDirectionContextType | undefined>(undefined);

export const LanguageDirectionProvider = ({ children }: { children: ReactNode }) => {
  const { i18n } = useTranslation();
  const [direction, setDirection] = useState<LanguageDirectionContextType>({
    currentLanguage: "",
    isRTL: false,
    loading: true, 
  });

  useLayoutEffect(() => {
    setDirection({
      currentLanguage: i18n.language,
      isRTL: i18n.language === "ar",
      loading: false, 
    });
    // Set the dir attribute globally
    document.documentElement.setAttribute("dir", i18n.language === "ar" ? "rtl" : "ltr");
  }, [i18n.language]);

  return (
    <LanguageDirectionContext.Provider value={direction}>
      {children}
    </LanguageDirectionContext.Provider>
  );
};

export const useLanguageDirection = () => {
  const context = useContext(LanguageDirectionContext);
  if (!context) {
    throw new Error("useLanguageDirection must be used within a LanguageDirectionProvider");
  }
  return context;
};
